/* Ferraro Atelier — o relógio em 3D (three.js).
   Monta o relógio a partir do mesmo objeto de configuração do desenho em SVG (DEFAULT_WATCH): as formas que importam
   em 3D (caixa, luneta, cristal, ponteiros, coroa, pulseira, rotor) são geometria; o que é arte impressa (mostrador,
   inserto da luneta, couro, gravações) vem do desenho em SVG rasterizado como textura. Luz de estúdio (ambiente
   PMREM), materiais físicos (metal, laca com verniz, safira com transmissão, lume emissivo).
   Unidades: as mesmas do SVG (mostrador de raio 102, caixa de raio 140); z aponta para quem olha. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// `Watch` é um const do script clássico (escopo léxico global, não é propriedade de window)
const W = typeof Watch !== "undefined" ? Watch : window.Watch;
const CX = 200, CY = 260;
const isOct = (c) => c.caseShape === "octogonal";
const metalStrap = (c) => ["oyster", "jubile", "integrada"].includes(c.strapType);
const LUME = "#eef3df";
const deg = (d) => (d * Math.PI) / 180;

// alturas (z): o fundo embaixo, o cristal em cima
const Z = { caseBottom: -46, caseTop: 28, dial: 16, hands: 19.5, bezelTop: 42, strap: -14, movement: -20 };
const EXPLODE_GAP = 72;

// ---------------------------------------------------------------- texturas a partir do SVG
const texCache = new Map();
const liveMaps = new Set(); // texturas em uso por algum modelo na tela: nunca são descartadas pelo cache
function svgTexture(svg, px, { srgb = true } = {}) {
  const key = px + "|" + svg;
  if (texCache.has(key)) { const v = texCache.get(key); texCache.delete(key); texCache.set(key, v); return v; }
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = px; c.height = px;
      c.getContext("2d").drawImage(img, 0, 0, px, px);
      const t = new THREE.CanvasTexture(c);
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      resolve(t);
    };
    img.onerror = () => resolve(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
  if (texCache.size >= 16) {
    const oldest = texCache.keys().next().value;
    texCache.get(oldest).then((t) => { if (t && !liveMaps.has(t)) t.dispose(); });
    texCache.delete(oldest);
  }
  texCache.set(key, p);
  return p;
}
/** Textura de uma peça do SVG, já recortada no quadrado/retângulo da peça. */
const partTex = (name, cfg, px = 1024, opts, srgb = true) => svgTexture(W.part(name, cfg, opts).svg, px, { srgb });

/** Mapa de anisotropia radial: os raios de sol do mostrador (a direção em RG, a força em B). */
let rayMap = null;
function sunrayMap() {
  if (rayMap) return rayMap;
  const n = 256, c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  const im = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = x - n / 2 + 0.5, dy = -(y - n / 2 + 0.5);
    const a = Math.atan2(dy, dx) + Math.PI / 2; // tangente (perpendicular ao raio): o brilho se estica ao longo do raio
    const i = (y * n + x) * 4;
    im.data[i] = Math.round((Math.cos(a) * 0.5 + 0.5) * 255);
    im.data[i + 1] = Math.round((Math.sin(a) * 0.5 + 0.5) * 255);
    im.data[i + 2] = 255;
    im.data[i + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  rayMap = new THREE.CanvasTexture(c);
  return rayMap;
}
/** Listras finas para o relevo da coroa e dos bastões de aço escovado. */
let knurlTex = null;
function knurl() {
  if (knurlTex) return knurlTex;
  const c = document.createElement("canvas");
  c.width = 64; c.height = 8;
  const ctx = c.getContext("2d");
  for (let x = 0; x < 64; x++) { ctx.fillStyle = x % 4 < 2 ? "#fff" : "#000"; ctx.fillRect(x, 0, 1, 8); }
  knurlTex = new THREE.CanvasTexture(c);
  knurlTex.wrapS = knurlTex.wrapT = THREE.RepeatWrapping;
  return knurlTex;
}
/** Estúdio de produto: sala escura com softboxes (um grande em cima, tiras dos lados, luz fraca na frente).
    É o que dá ao metal os reflexos compridos e o contraste entre claro e escuro; a sala clara deixa tudo branco. */
function studioEnvironment() {
  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.BoxGeometry(5000, 5000, 5000), new THREE.MeshBasicMaterial({ color: "#141414", side: THREE.BackSide })));
  const panel = (w, h, color, k, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.material.color.multiplyScalar(k);
    m.position.set(...pos);
    m.lookAt(0, 0, 0);
    scene.add(m);
  };
  panel(1800, 700, "#ffffff", 4.5, [0, 1400, 900]);    // softbox principal, em cima e à frente
  panel(260, 2000, "#fff3e2", 5, [-1600, 200, 500]);   // tira quente à esquerda
  panel(220, 2000, "#e6eeff", 3.2, [1600, -300, 400]); // tira fria à direita
  panel(2600, 1400, "#ffffff", 0.5, [0, -1700, -300]); // preenchimento embaixo
  panel(2200, 1700, "#ffffff", 2.0, [0, 200, 2300]);   // softbox atrás da câmera: ilumina as faces planas (caixa, luneta, ponteiros)
  return scene;
}
let shadowTex = null;
function shadowTexture() {
  if (shadowTex) return shadowTex;
  const n = 256, c = document.createElement("canvas");
  c.width = c.height = n;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, "rgba(0,0,0,.9)"); g.addColorStop(0.45, "rgba(0,0,0,.45)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, n, n);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}

// ---------------------------------------------------------------- geometria
/** UVs planas: o quadrado [-size/2, size/2] vira [0, 1] (as texturas do SVG são recortadas nesse quadrado). */
function planarUV(geom, size, cx = 0, cy = 0) {
  const pos = geom.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) { uv[i * 2] = (pos.getX(i) - cx) / size + 0.5; uv[i * 2 + 1] = (pos.getY(i) - cy) / size + 0.5; }
  geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geom;
}
/** Vira uma face (feita olhando de frente, com UVs planas) para o fundo do relógio: espelha em x, para que, vista
    por trás, a arte apareça como no desenho do fundo (que já é desenhado como se vê por trás, coroa à esquerda). */
function toBack(geom) {
  geom.scale(-1, 1, 1);
  geom.computeVertexNormals();
  return geom;
}
/** Perfil (r, h) girado em volta do eixo z. */
function lathe(profile, segs = 128) {
  const g = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segs);
  g.rotateX(Math.PI / 2);
  g.scale(1, -1, 1); // a volta fica no sentido certo (normais para fora) com y invertido
  g.computeVertexNormals();
  return g;
}
function polygonShape(pts, r = 0) {
  const s = new THREE.Shape();
  const n = pts.length;
  if (!r) { s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < n; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; }
  // cantos arredondados: entra e sai de cada vértice a uma distância r
  const P = (i) => pts[(i + n) % n];
  const along = (a, b, d) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [a[0] + (dx / L) * d, a[1] + (dy / L) * d]; };
  for (let i = 0; i < n; i++) {
    const a = along(P(i), P(i - 1), r), b = along(P(i), P(i + 1), r);
    if (i === 0) s.moveTo(a[0], a[1]); else s.lineTo(a[0], a[1]);
    s.quadraticCurveTo(P(i)[0], P(i)[1], b[0], b[1]);
  }
  s.closePath();
  return s;
}
function circleShape(r) { const s = new THREE.Shape(); s.absarc(0, 0, r, 0, Math.PI * 2, false); return s; }
function roundRectShape(w, r) { const s = new THREE.Shape(); const h = w / 2; s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.absarc(h - r, -h + r, r, -Math.PI / 2, 0, false); s.lineTo(h, h - r); s.absarc(h - r, h - r, r, 0, Math.PI / 2, false); s.lineTo(-h + r, h); s.absarc(-h + r, h - r, r, Math.PI / 2, Math.PI, false); s.lineTo(-h, -h + r); s.absarc(-h + r, -h + r, r, Math.PI, Math.PI * 1.5, false); s.closePath(); return s; }
function cushionShape(a, n = 2.9) {
  const pts = [];
  for (let i = 0; i < 160; i++) {
    const t = (i / 160) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    pts.push([a * Math.sign(c) * Math.abs(c) ** (2 / n), a * Math.sign(s) * Math.abs(s) ** (2 / n)]);
  }
  return polygonShape(pts);
}
function octagonPts(hw, hh, ch) {
  return [[-hw + ch, hh], [hw - ch, hh], [hw, hh - ch], [hw, -hh + ch], [hw - ch, -hh], [-hw + ch, -hh], [-hw, -hh + ch], [-hw, hh - ch]];
}
/** Contorno da caixa e abertura do mostrador, em 3D (y para cima). */
function caseOutline(c) {
  if (c.caseShape === "redonda") return { outer: circleShape(140), hole: circleShape(104) };
  if (c.caseShape === "almofada") return { outer: cushionShape(139), hole: circleShape(104) };
  return { outer: polygonShape(octagonPts(150, 144, 50), 12), hole: roundRectShape(198, 50) };
}
function extrude(shape, holes, depth, bevel, segs = 96) {
  if (holes) shape.holes = Array.isArray(holes) ? holes : [holes];
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: bevel > 3 ? 6 : 3, curveSegments: segs });
}
/** Formas de um trecho de SVG (polígonos, retângulos, círculos, caminhos), já no espaço 3D (centro no eixo, y para cima). */
function svgShapes(inner) {
  const data = new SVGLoader().parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">${inner}</svg>`);
  const out = [];
  for (const path of data.paths) {
    const fill = path.userData.style.fill;
    if (!fill || fill === "none") continue;
    for (const shape of SVGLoader.createShapes(path)) out.push({ shape, fill });
  }
  return out;
}
/** Extrusão de formas vindas do SVG: translada para o eixo e vira y para cima (sem espelhar as normais). */
function extrudeSvg(shapes, depth, bevel = 0.5) {
  return shapes.map(({ shape, fill }, i) => {
    const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 24 });
    g.translate(-CX, -CY, 0);
    g.rotateX(Math.PI); // y para cima, profundidade para -z
    g.translate(0, 0, depth + bevel);
    return { geom: g, fill, order: i };
  });
}
/** Uma faixa (pulseira) ao longo de pontos (y, z), com largura w (pode afunilar) e espessura t. UV: u na largura, v no comprimento. */
function bandGeometry(path, w0, w1, t, top) {
  const N = path.length;
  const pos = [], uv = [], idx = [];
  const ring = []; // 4 cantos por seção
  for (let i = 0; i < N; i++) {
    const [y, z] = path[i];
    const nxt = path[Math.min(N - 1, i + 1)], prv = path[Math.max(0, i - 1)];
    const dy = nxt[0] - prv[0], dz = nxt[1] - prv[1], L = Math.hypot(dy, dz) || 1;
    // normal da faixa (perpendicular ao caminho, no plano y-z)
    const ny = -dz / L * (top ? 1 : -1), nz = dy / L * (top ? 1 : -1);
    const w = w0 + (w1 - w0) * (i / (N - 1));
    ring.push([[-w / 2, y + ny * t / 2, z + nz * t / 2], [w / 2, y + ny * t / 2, z + nz * t / 2], [w / 2, y - ny * t / 2, z - nz * t / 2], [-w / 2, y - ny * t / 2, z - nz * t / 2]]);
  }
  const v = (i) => (top ? 1 - i / (N - 1) : i / (N - 1));
  // 4 lados: cima (0-1), direita (1-2), baixo (2-3), esquerda (3-0)
  for (let side = 0; side < 4; side++) {
    const base = pos.length / 3;
    for (let i = 0; i < N; i++) {
      const a = ring[i][side], b = ring[i][(side + 1) % 4];
      pos.push(...a, ...b);
      uv.push(side === 0 ? 0 : side === 2 ? 1 : 0.5, v(i), side === 0 ? 1 : side === 2 ? 0 : 0.5, v(i));
    }
    for (let i = 0; i < N - 1; i++) {
      const p = base + i * 2;
      idx.push(p, p + 2, p + 1, p + 1, p + 2, p + 3);
    }
  }
  // tampa da ponta
  const last = ring[N - 1], base = pos.length / 3;
  for (const q of last) { pos.push(...q); uv.push(0.5, top ? 0 : 1); }
  idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- materiais
function makeMaterials() {
  const all = new Set();
  const reg = (m) => { all.add(m); return m; };
  return {
    all,
    metal: (color, rough = 0.26) => reg(new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: rough, envMapIntensity: 1.15 })),
    brushed: (color, rough = 0.42) => reg(new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough, anisotropy: 0.6, envMapIntensity: 1.1 })),
    lume: (on) => reg(new THREE.MeshStandardMaterial({ color: LUME, roughness: 0.55, emissive: "#b9f59f", emissiveIntensity: on ? 2.2 : 0.02 })),
    paint: (color, rough = 0.45) => reg(new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0 })),
    dial: (map, finish) => reg(new THREE.MeshPhysicalMaterial({ map, roughness: finish === "raios" ? 0.3 : 0.42, metalness: finish === "raios" ? 0.14 : 0.04, clearcoat: 0.75, clearcoatRoughness: 0.2, anisotropy: finish === "raios" ? 0.9 : 0, anisotropyMap: finish === "raios" ? sunrayMap() : null, envMapIntensity: 0.8 })),
    ceramic: (map) => reg(new THREE.MeshPhysicalMaterial({ map, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1 })),
    textured: (map, rough, metal = 0) => reg(new THREE.MeshStandardMaterial({ map, roughness: rough, metalness: metal, envMapIntensity: 0.9 })),
    glass: (lowTier) => reg(lowTier
      ? new THREE.MeshPhysicalMaterial({ color: "#eef4f8", transparent: true, opacity: 0.14, roughness: 0.04, metalness: 0, envMapIntensity: 0.7, depthWrite: false })
      : new THREE.MeshPhysicalMaterial({ color: "#f3f7fa", transmission: 1, roughness: 0.04, metalness: 0, ior: 1.76, thickness: 5, transparent: true, envMapIntensity: 0.6, depthWrite: false })),
  };
}

// ---------------------------------------------------------------- o relógio
class WatchModel {
  constructor(cfg, mats, lowTier) {
    this.cfg = cfg;
    this.mats = mats;
    this.low = lowTier;
    this.root = new THREE.Group();
    this.parts = {};  // name -> { group, level, dy }
    this.pending = [];
    this.build();
  }
  part(name, level, dy = 0) {
    const g = new THREE.Group();
    g.userData.base = { level, dy };
    this.root.add(g);
    this.parts[name] = g;
    return g;
  }
  later(p) { this.pending.push(p); }
  mesh(geom, mat, parent, role) {
    const m = new THREE.Mesh(geom, mat);
    if (role) m.userData.role = role;
    parent.add(m);
    return m;
  }

  build() {
    const c = this.cfg, M = this.mats;
    const metal = M.metal(c.caseColor);
    const polished = M.metal(c.caseColor, 0.18);
    const { outer, hole } = caseOutline(c);
    const oct = isOct(c);

    // --- caixa: corpo com a abertura do mostrador, chanfros nas duas bordas
    const caixa = this.part("caixa", 2);
    const body = extrude(outer, hole, 58, 8);
    body.translate(0, 0, Z.caseTop - 66);
    this.mesh(body, M.brushed(c.caseColor, 0.38), caixa);
    // asas (pontas da pulseira)
    if (!oct) {
      for (const top of [true, false]) {
        const pts = top ? [[-62, 110], [-50, 144], [50, 144], [62, 110]] : [[-62, -110], [-50, -144], [50, -144], [62, -110]];
        const lug = extrude(polygonShape(pts, 4), null, 30, 4, 8);
        lug.translate(0, 0, -22);
        this.mesh(lug, M.brushed(c.caseColor, 0.4), caixa);
      }
    } else {
      for (const side of [-1, 1]) {
        const stub = new RoundedBoxGeometry(24, 52, 36, 3, 6);
        stub.translate(side * 156, 0, -14);
        this.mesh(stub, M.brushed(c.caseColor, 0.4), caixa);
      }
    }
    // coroa (com o relevo das estrias) e, no cronógrafo, os dois botões
    const cx = W.caseRight(c) - CX;
    const crown = new THREE.Group();
    crown.position.set(cx + 9, 0, -9);
    const stem = new THREE.CylinderGeometry(7, 7, 14, 24); stem.rotateZ(Math.PI / 2); stem.translate(-6, 0, 0);
    this.mesh(stem, metal, crown);
    const head = lathe([[0, 0], [12, 0], [15, 2], [16, 5], [16, 21], [15, 24], [12, 26], [0, 26]], 48);
    head.rotateY(Math.PI / 2); // o eixo da coroa aponta para +x
    const kn = knurl().clone(); kn.needsUpdate = true; kn.repeat.set(10, 1);
    const crownMat = M.metal(c.caseColor, 0.3); crownMat.bumpMap = kn; crownMat.bumpScale = 1.6;
    this.mesh(head, crownMat, crown);
    crown.userData.role = "crown"; // a coroa inteira (haste e cabeça) responde ao toque
    caixa.add(crown);
    if (c.dialLayout === "crono") {
      for (const [a, role] of [[60, "start"], [120, "reset"]]) {
        const r = W.caseRight(c) - CX + 9;
        const g = new RoundedBoxGeometry(18, 14, 14, 2, 3);
        const p = new THREE.Mesh(g, polished);
        p.position.set(r * Math.sin(deg(a)), r * Math.cos(deg(a)), -4);
        p.rotation.z = -deg(a - 90);
        p.userData.role = "pusher:" + role;
        caixa.add(p);
      }
    }

    // --- fundo: de vidro (anel + vidro + movimento visível) ou fechado (gravado)
    const closed = c.movement === "quartzo" || c.displayBack === false;
    const backRing = lathe([[92, Z.caseBottom - 2.5], [124, Z.caseBottom - 2.5], [126, Z.caseBottom - 0.5], [126, Z.caseBottom + 6]], 128);
    // a gravação do fundo é relevo fosco sobre o metal polido (mapa de aspereza), em qualquer cor de metal
    const ringMat = M.metal(c.caseColor, 1);
    ringMat.side = THREE.DoubleSide;
    planarUV(backRing, 252);
    this.mesh(toBack(backRing), ringMat, caixa);
    this.later(partTex("backRing", c, 1024, {}, false).then((t) => { if (t) { ringMat.roughnessMap = t; ringMat.needsUpdate = true; } }));
    if (closed) {
      const disc = new THREE.CircleGeometry(124, 96); planarUV(disc, 252);
      disc.translate(0, 0, Z.caseBottom - 2.6);
      const dm = M.metal(c.caseColor, 1);
      this.mesh(toBack(disc), dm, caixa);
      this.later(partTex("backClosed", c, 1024, {}, false).then((t) => { if (t) { dm.roughnessMap = t; dm.needsUpdate = true; } }));
    } else {
      const glass = new THREE.CircleGeometry(93, 96); glass.translate(0, 0, Z.caseBottom - 1.5);
      this.mesh(toBack(glass), M.glass(this.low), caixa);
    }

    // --- movimento (visto por trás; na vista explodida sai pela frente)
    const mov = this.part("movimento", 1);
    const plate = new THREE.CylinderGeometry(96, 96, 10, 96); plate.rotateX(Math.PI / 2); plate.translate(0, 0, Z.movement);
    this.mesh(plate, M.metal("#b9bec6", 0.5), mov);
    const face = new THREE.CircleGeometry(96, 96); planarUV(face, 200); face.translate(0, 0, Z.movement - 5.2);
    const movMat = M.textured(null, 0.45, 0.6);
    this.mesh(toBack(face), movMat, mov);
    this.later(partTex("movement", c, 1024).then((t) => { if (t) { movMat.map = t; movMat.needsUpdate = true; } }));
    if (c.movement !== "quartzo") {
      // balanço: um anel de latão que oscila (x espelhado: o desenho do fundo é visto por trás)
      const bal = new THREE.Group();
      bal.position.set(-46, -46, Z.movement - 6.5);
      const ring = new THREE.TorusGeometry(22, 2.2, 12, 48);
      this.mesh(ring, M.metal("#c9a44c", 0.3), bal);
      for (let i = 0; i < 3; i++) { const sp = new THREE.BoxGeometry(22, 2, 1.6); sp.translate(11, 0, 0); sp.rotateZ(deg(i * 120)); this.mesh(sp, M.metal("#c9a44c", 0.3), bal); }
      mov.add(bal); this.balance = bal;
      if (c.movement === "automatico") {
        const rot = new THREE.Group();
        rot.position.set(0, 0, Z.movement - 8);
        const half = new THREE.Shape(); half.absarc(0, 0, 92, 0, Math.PI, false); half.absarc(0, 0, 16, Math.PI, 0, true);
        const rg = extrude(half, null, 3, 0.6, 64); planarUV(rg, 200); rg.translate(0, 0, -3.6);
        const rm = M.textured(null, 0.35, 0.8);
        this.mesh(toBack(rg), rm, rot, "rotor").userData.role = "rotor";
        this.later(partTex("rotor", c, 1024).then((t) => { if (t) { rm.map = t; rm.needsUpdate = true; } }));
        const axle = new THREE.CylinderGeometry(9, 9, 4, 32); axle.rotateX(Math.PI / 2); axle.translate(0, 0, -4);
        this.mesh(axle, M.metal("#9aa0a6", 0.35), rot);
        mov.add(rot); this.rotor = rot;
      }
    }

    // --- mostrador: a arte impressa como textura, com verniz; bastões aplicados em relevo
    const dialG = this.part("mostrador", 3);
    const dr = W.dialRadius(c);
    const dialShape = oct ? roundRectShape(198, 50) : circleShape(108);
    const dialGeom = new THREE.ShapeGeometry(dialShape, 64); planarUV(dialGeom, 220); dialGeom.translate(0, 0, Z.dial);
    const bars3d = c.indexStyle === "bastao" && !(c.skeleton && c.swiss && c.movement !== "quartzo");
    const dialMat = M.dial(null, c.dialFinish);
    this.mesh(dialGeom, dialMat, dialG);
    this.later(partTex("dial", c, this.low ? 1024 : 1536, bars3d ? { _noHourMarks: true } : {}).then((t) => { if (t) { dialMat.map = t; dialMat.needsUpdate = true; } }));
    if (bars3d) {
      const skip = new Set(c.dialLayout === "data" ? [3] : c.dialLayout === "crono" ? [3, 6, 9] : []);
      const barMat = M.metal(c.indexColor, 0.28);
      const lumeMat = M.lume(false); this.lumeMats = [lumeMat];
      for (let h = 0; h < 12; h++) {
        if (skip.has(h)) continue;
        const len = h % 3 === 0 ? dr * 0.2 : dr * 0.15;
        const r = dr * 0.93 - len / 2;
        const a = deg(h * 30);
        for (const dx of (h === 0 ? [-4.2, 4.2] : [0])) {
          const bar = new RoundedBoxGeometry(5.2, len, 3, 2, 1);
          bar.translate(dx, 0, 0);
          const m = new THREE.Mesh(bar, barMat);
          m.position.set(r * Math.sin(a), r * Math.cos(a), Z.dial + 1.5);
          m.rotation.z = -a;
          dialG.add(m);
          if (c.lume) {
            const lm = new THREE.Mesh(new THREE.BoxGeometry(2.6, len - 3.2, 1.2), lumeMat);
            lm.position.set(dx, 0, 1.6);
            m.add(lm);
          }
        }
      }
    }

    // --- ponteiros: extrudados das mesmas formas do desenho
    const hands = this.part("ponteiros", 4);
    const handMat = M.metal(c.handColor, 0.22);
    const lumeMat = M.lume(false); (this.lumeMats ||= []).push(lumeMat);
    const matFor = (fill) => (fill.toLowerCase() === LUME ? lumeMat : fill.toLowerCase() === c.handColor.toLowerCase() ? handMat : M.metal(fill, 0.3));
    const mk = (inner, z, depth) => {
      const g = new THREE.Group();
      for (const { geom, fill, order } of extrudeSvg(svgShapes(inner), depth, 0.4)) {
        geom.translate(0, 0, order * 0.25);
        g.add(new THREE.Mesh(geom, matFor(fill)));
      }
      g.position.z = z;
      hands.add(g);
      return g;
    };
    this.hand = {
      h: mk(W.hand(c.handStyle, "h", c), Z.hands, 2.2),
      m: mk(W.hand(c.handStyle, "m", c), Z.hands + 3.2, 2.2),
      s: mk(W.secondHand(c), Z.hands + 6.4, 1.2),
    };
    const cap = new THREE.CylinderGeometry(5, 5, 9, 32); cap.rotateX(Math.PI / 2); cap.translate(0, 0, Z.hands + 4);
    this.mesh(cap, handMat, hands);
    const pin = new THREE.CylinderGeometry(2, 2, 1.5, 24); pin.rotateX(Math.PI / 2); pin.translate(0, 0, Z.hands + 8.8);
    this.mesh(pin, M.metal(c.secondColor, 0.3), hands);
    if (c.dialLayout === "crono") {
      this.sub = {};
      const off = dr * 0.5, r = dr * 0.27;
      for (const [role, x, y] of [["cm", off, 0], ["ch", 0, -off], ["sub", -off, 0]]) {
        const g = new THREE.Group();
        g.position.set(x, y, Z.dial + 1.2);
        const needle = new THREE.BoxGeometry(2, r - 3, 1); needle.translate(0, (r - 3) / 2 - 3, 0);
        g.add(new THREE.Mesh(needle, handMat));
        hands.add(g); this.sub[role] = g;
      }
    }

    // --- luneta
    const bez = this.part("luneta", 5);
    if (oct) {
      const bg = extrude(polygonShape(octagonPts(130, 124, 42), 10), roundRectShape(198, 50), 10, 3, 24);
      bg.translate(0, 0, Z.caseTop - 1);
      this.mesh(bg, polished, bez);
      for (let i = 0; i < 8; i++) {
        const a = deg(i * 45 + 22.5), r = 118;
        const s = new THREE.CylinderGeometry(4.2, 4.2, 1.6, 24); s.rotateX(Math.PI / 2);
        const sm = new THREE.Mesh(s, M.metal("#f2f2f0", 0.2)); sm.position.set(r * Math.sin(a), r * Math.cos(a), Z.caseTop + 12.4);
        const slot = new THREE.BoxGeometry(6, 1.2, 0.8); const sl = new THREE.Mesh(slot, M.paint("#2a2a2a", 0.6)); sl.position.z = 0.9; sl.rotation.z = i * 0.7; sm.add(sl);
        bez.add(sm);
      }
    } else {
      const t = c.bezelType;
      const insert = ["mergulho", "taquimetro"].includes(t);
      const prof = insert
        ? [[104, Z.caseTop - 2], [104, Z.bezelTop - 3], [106, Z.bezelTop - 1], [108, Z.bezelTop - 1], [108, Z.bezelTop - 2.4], [128, Z.bezelTop - 2.4], [128, Z.bezelTop - 1], [131, Z.bezelTop - 1], [133.5, Z.bezelTop - 4], [133.5, Z.caseTop - 2]]
        : [[104, Z.caseTop - 2], [104, Z.bezelTop - 4], [108, Z.bezelTop], [126, Z.bezelTop], [132, Z.bezelTop - 3], [133.5, Z.bezelTop - 7], [133.5, Z.caseTop - 2]];
      const ringG = lathe(prof, 160);
      this.mesh(ringG, polished, bez);
      if (insert) {
        const ins = new THREE.RingGeometry(108, 128, 160); planarUV(ins, 280); ins.translate(0, 0, Z.bezelTop - 2.2);
        const im = M.ceramic(null);
        this.mesh(ins, im, bez);
        this.later(partTex("bezel", c, 1024).then((tx) => { if (tx) { im.map = tx; im.needsUpdate = true; } }));
      } else if (t === "canelada") {
        const top = new THREE.RingGeometry(106, 132, 144); planarUV(top, 280); top.translate(0, 0, Z.bezelTop + 0.2);
        const fm = M.metal(c.caseColor, 0.3);
        this.mesh(top, fm, bez);
        this.later(partTex("bezel", c, 1024).then((tx) => { if (tx) { fm.map = tx; fm.needsUpdate = true; } }));
      }
    }

    // --- cristal: safira abaulada (ou chata, no octogonal)
    const cry = this.part("cristal", 6);
    if (oct) {
      const g = extrude(roundRectShape(196, 49), null, 3, 1, 24); g.translate(0, 0, Z.bezelTop - 4);
      this.mesh(g, M.glass(this.low), cry);
    } else {
      const base = 105, hgt = 9, R = (base * base + hgt * hgt) / (2 * hgt), th = Math.asin(base / R);
      const dome = new THREE.SphereGeometry(R, 96, 24, 0, Math.PI * 2, 0, th);
      dome.rotateX(Math.PI / 2); dome.translate(0, 0, Z.bezelTop - 2 - R * Math.cos(th));
      this.mesh(dome, M.glass(this.low), cry);
    }

    // --- pulseira: duas metades
    for (const top of [true, false]) {
      const g = this.part(top ? "pulseira" : "pulseira-baixo", 0, top ? 60 : -60);
      const w = W.strapWidth(c);
      const y0 = oct ? 150 : 108;
      const path = [];
      for (let i = 0; i <= 14; i++) {
        const k = i / 14;
        const y = y0 + k * 150, zz = Z.strap - 28 * k * k;
        path.push([top ? y : -y, zz]);
      }
      if (metalStrap(c)) {
        const m1 = M.brushed(c.braceletColor || c.caseColor, 0.4), m2 = M.metal(c.strapTwoTone ? (c.braceletColor2 || c.braceletColor) : (c.braceletColor || c.caseColor), 0.2);
        const rows = c.strapType === "jubile" ? 16 : c.strapType === "integrada" ? 30 : 24;
        for (let yy = 0; yy < 150; yy += rows) {
          const k = (yy + rows / 2) / 150, y = y0 + k * 150, zz = Z.strap - 28 * k * k, tilt = Math.atan2(-56 * k, 150) * (top ? 1 : -1);
          const row = new THREE.Group();
          row.position.set(0, top ? y : -y, zz); row.rotation.x = tilt;
          const link = (x, lw, mat, pol) => { const b = new RoundedBoxGeometry(lw, rows - 2, 12, 3, 2.5); const mm = new THREE.Mesh(b, mat); mm.position.x = x; row.add(mm); };
          if (c.strapType === "jubile") {
            const o = w * 0.3, i1 = w * 0.13, cc = w * 0.14;
            link(-w / 2 + o / 2, o - 1, m1); link(w / 2 - o / 2, o - 1, m1);
            link(-w * 0.2 + i1 / 2 - 2, i1, m2); link(w * 0.2 - i1 / 2 + 2, i1, m2); link(0, cc, m2);
          } else {
            const o = w * 0.34, cc = w * 0.32;
            link(-w / 2 + o / 2, o - 1, m1); link(w / 2 - o / 2, o - 1, m1); link(0, cc - 1, m2);
          }
          g.add(row);
        }
      } else {
        const leather = c.strapType === "couro";
        const bg = bandGeometry(path, w, leather ? w - 20 : w, c.strapType === "borracha" ? 26 : 18, top);
        const sm = M.textured(null, c.strapType === "nato" ? 0.9 : c.strapType === "borracha" ? 0.55 : 0.7, 0);
        sm.side = THREE.DoubleSide;
        this.mesh(bg, sm, g);
        this.later(partTex(top ? "strapTop" : "strapBottom", c, 1024).then((tx) => { if (tx) { tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; sm.map = tx; sm.needsUpdate = true; } }));
      }
    }
  }

  /** Posição das peças entre fechado (0) e explodido (1). */
  explode(t) {
    for (const g of Object.values(this.parts)) {
      const { level, dy } = g.userData.base;
      g.position.z = level * EXPLODE_GAP * t;
      g.position.y = dy * t;
    }
  }
  setAngles(a) {
    if (!a) return;
    this.hand.h.rotation.z = -deg(a.h);
    this.hand.m.rotation.z = -deg(a.m);
    this.hand.s.rotation.z = -deg(this.cfg.dialLayout === "crono" ? a.chrono : a.s);
    if (this.sub) { this.sub.cm.rotation.z = -deg(a.cm); this.sub.ch.rotation.z = -deg(a.ch); this.sub.sub.rotation.z = -deg(a.s); }
    if (this.rotor) this.rotor.rotation.z = deg(a.rotor);
    if (this.balance) this.balance.rotation.z = deg(a.balance);
  }
  setNight(on) {
    for (const m of this.lumeMats || []) { m.emissiveIntensity = on ? 2.4 : 0.02; }
  }
  dispose() {
    this.root.traverse((o) => { if (o.geometry) o.geometry.dispose(); for (const t of [o.material?.map, o.material?.roughnessMap]) if (t) liveMaps.delete(t); });
    for (const m of this.mats.all) m.dispose(); // as texturas ficam com o cache
  }
}

// ---------------------------------------------------------------- a cena
class Viewer {
  constructor(container, cfg, opts = {}) {
    this.el = container;
    this.opts = opts;
    this.low = opts.lowTier ?? (matchMedia("(max-width: 759px), (max-aspect-ratio: 1/1)").matches || navigator.hardwareConcurrency <= 4);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.low ? 1.5 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.env = pm.fromScene(studioEnvironment(), 0.02).texture;
    this.scene.environment = this.env;
    this.scene.environmentIntensity = 1;
    pm.dispose();
    this.camera = new THREE.PerspectiveCamera(26, 1, 10, 6000);
    this.camera.position.set(0, 0, 1500);
    this.camera.lookAt(0, 0, 0);
    // luz principal, para a sombra de contato e os brilhos dos chanfros
    const key = new THREE.DirectionalLight("#fff4e0", 1.6); key.position.set(-300, 500, 800); this.scene.add(key);
    const rim = new THREE.DirectionalLight("#dfe9ff", 0.6); rim.position.set(400, -200, 300); this.scene.add(rim);
    this.lights = [key, rim];
    this.seq = 0;
    // o pivô: inclina, vira e explode
    this.pivot = new THREE.Group();
    this.scene.add(this.pivot);
    // sombra de contato
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(560, 700), new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, opacity: 0.5, depthWrite: false }));
    sh.position.z = -90; this.scene.add(sh); this.shadow = sh;
    this.state = { tilt: 0, spin: 0, flip: 0, explode: 0, fit: 1 };
    this.target = { ...this.state };
    this.view = "frente";
    this.night = false;
    this.needs = true;
    this.visible = true;
    this.mats = makeMaterials();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    if (opts.orbit) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enablePan = false; this.controls.minDistance = 500; this.controls.maxDistance = 2600;
      this.controls.enableDamping = true; this.controls.dampingFactor = 0.08;
      this.controls.addEventListener("change", () => { this.needs = true; });
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; if (this.visible) this.needs = true; }).observe(container);
    this.setConfig(cfg);
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }
  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // o relógio inteiro (520 de altura) cabe na tela com folga
    const fitH = 560 / (2 * Math.tan(deg(this.camera.fov / 2)));
    const fitW = 420 / (2 * Math.tan(deg(this.camera.fov / 2)) * this.camera.aspect);
    this.camera.position.z = Math.max(fitH, fitW) * (this.opts.distance || 1.0);
    this.camera.updateProjectionMatrix();
    this.needs = true;
  }
  setConfig(cfg) {
    this.cfg = { ...cfg };
    const seq = ++this.seq;
    const model = new WatchModel(this.cfg, makeMaterials(), this.low);
    model.setNight(this.night);
    model.explode(this.state.explode);
    const show = () => {
      if (this.model === model) return;
      const old = this.model;
      if (old) { this.pivot.remove(old.root); old.dispose(); }
      this.pivot.add(model.root);
      this.model = model;
      model.root.traverse((o) => { for (const t of [o.material?.map, o.material?.roughnessMap]) if (t) liveMaps.add(t); });
      if (this.lastAngles) model.setAngles(this.lastAngles);
      this.needs = true;
      this.opts.onReady?.();
    };
    // o primeiro aparece na hora (as texturas chegam depois); as trocas esperam as texturas, sem piscar
    if (!this.model) show();
    Promise.all(model.pending).then(() => {
      if (seq !== this.seq) { if (this.model !== model) model.dispose(); return; }
      show();
      this.needs = true;
    });
  }
  /** Ângulos do movimento (a cada quadro): só repinta quando algo visível mudou. */
  setAngles(a) {
    this.lastAngles = a;
    if (!this.model) return;
    // o balanço oscila sem parar: em passos de 6° basta, e só conta quando o fundo está à mostra
    const back = this.view === "fundo" || this.view === "explodida";
    const key = [a.h.toFixed(1), a.m.toFixed(1), a.s.toFixed(1), a.chrono.toFixed(1), a.cm.toFixed(1), a.ch.toFixed(1), back ? Math.round(a.rotor) : 0, back ? Math.round(a.balance / 6) : 0].join();
    if (key === this.angleKey) return;
    this.angleKey = key;
    this.model.setAngles(a);
    this.needs = true;
  }
  /** Aproxima (k < 1) ou afasta (k > 1) a câmera; 0 volta ao enquadramento inicial. */
  dolly(k) {
    if (k === 0) { this.resize(); this.controls?.reset(); this.camera.position.set(0, 0, this.camera.position.length()); this.camera.lookAt(0, 0, 0); }
    else {
      const d = this.camera.position.length() * k;
      const min = this.controls?.minDistance ?? 400, max = this.controls?.maxDistance ?? 3000;
      this.camera.position.setLength(Math.min(max, Math.max(min, d)));
    }
    this.needs = true;
  }
  setNight(on) {
    this.night = on;
    this.model?.setNight(on);
    this.scene.environmentIntensity = on ? 0.08 : 1;
    this.renderer.toneMappingExposure = on ? 0.5 : 1;
    this.lights[0].intensity = on ? 0.12 : 1.6;
    this.lights[1].intensity = on ? 0.05 : 0.6;
    this.shadow.material.opacity = on ? 0.2 : 0.5;
    this.needs = true;
  }
  setView(v) {
    this.view = v;
    const exploded = v === "explodida";
    this.target = { tilt: exploded ? -0.8 : 0, spin: exploded ? -0.35 : 0, flip: v === "fundo" ? Math.PI : 0, explode: exploded ? 1 : 0, fit: exploded ? 0.72 : 1 };
    this.needs = true;
  }
  /** Que peça está sob o ponteiro: "crown", "pusher:start", "pusher:reset", "rotor" ou null. */
  pick(e) {
    if (!this.model) return null;
    const r = this.renderer.domElement.getBoundingClientRect();
    const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(p, this.camera);
    for (const hit of rc.intersectObjects(this.model.root.children, true)) {
      let o = hit.object;
      while (o && !o.userData.role) o = o.parent;
      if (o?.userData.role) return o.userData.role;
      if (hit.object.material?.transmission || hit.object.material?.opacity < 0.5) continue; // o cristal não conta
      return null;
    }
    return null;
  }
  loop(now) {
    this.raf = requestAnimationFrame(this.loop);
    const s = this.state, t = this.target;
    let moving = false;
    for (const k of Object.keys(t)) {
      const d = t[k] - s[k];
      if (Math.abs(d) > 0.0008) { s[k] += d * 0.12; moving = true; } else s[k] = t[k];
    }
    if (moving) {
      this.pivot.rotation.set(s.tilt, s.flip, s.spin);
      this.pivot.scale.setScalar(s.fit);
      this.model?.explode(s.explode);
      this.shadow.material.opacity = (this.night ? 0.2 : 0.5) * (1 - s.explode) * (1 - Math.abs(Math.sin(s.flip)) * 0.6);
      this.needs = true;
    }
    if (this.controls) this.controls.update();
    if (!this.needs || !this.visible || document.hidden) return;
    this.needs = false;
    this.renderer.render(this.scene, this.camera);
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.controls?.dispose();
    this.model?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function supported() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

window.Watch3D = { create: (el, cfg, opts) => new Viewer(el, cfg, opts), supported, THREE };
window.dispatchEvent(new Event("watch3d-ready"));
