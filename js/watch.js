/* Custom Time — desenho do relógio em SVG e o "movimento" que faz os ponteiros andarem.
   Tudo é desenhado a partir de um objeto de configuração (veja DEFAULT_WATCH). */

const DEFAULT_WATCH = {
  caseShape: "redonda",      // redonda | almofada | octogonal
  size: 40,
  caseColor: "#c9cdd2",
  dialColor: "#1f4f8c",
  dialFume: true,
  dialFinish: "raios",       // liso | raios | listrado | texturizado | grade
  dialLayout: "data",        // data | sem-data | crono
  indexStyle: "bastao",      // bastao | romanos | arabicos | pontos
  indexColor: "#e9ecef",
  subdialColor: "#d9dad6",
  lume: true,
  handStyle: "espada",
  handColor: "#e6e9ee",
  secondStyle: "agulha",     // agulha | pirulito | seta
  secondColor: "#3fc1c9",
  bezelType: "mergulho",     // mergulho | taquimetro | lisa | canelada
  bezelColor: "#1a1d22",
  bezelTwoTone: false,
  bezelColor2: "#a51f2b",
  strapType: "nato",         // nato | couro | borracha | oyster | jubile | integrada
  strapColor: "#1e3a6e",     // pulseiras de tecido, couro e borracha: cor de fora
  strapColor2: "#9b2335",    // cor de dentro (faixa central), quando em duas cores
  braceletColor: "#c9cdd2",  // pulseiras de aço: elos de fora
  braceletColor2: "#d4b062", // elos do centro, quando em duas cores
  strapTwoTone: false,
  stitchColor: "#e8d6c0",
  movement: "automatico",    // quartzo | automatico | manual
  rotorColor: "#3fbfbd",
  refWatch: "",
  refNotes: "",
};

const Watch = (() => {
  const CX = 200;
  const CY = 260;
  let uidCounter = 0;

  // ---------- cores ----------
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  function hexToRgb(hex) {
    let h = String(hex).replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  const shade = (hex, t) => (t >= 0 ? mix(hex, "#ffffff", t) : mix(hex, "#000000", -t));
  function luminance(hex) {
    const c = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const ink = (hex) => (luminance(hex) > 0.36 ? "#16191e" : "#f3f4f1");

  // ---------- geometria ----------
  function polar(r, deg, cx = CX, cy = CY) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  }
  const circlePath = (r, cx = CX, cy = CY) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  function roundRectPath(x, y, w, h, r) {
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  }
  function octagonPath(hw, hh, ch) {
    const p = [[CX - hw + ch, CY - hh], [CX + hw - ch, CY - hh], [CX + hw, CY - hh + ch], [CX + hw, CY + hh - ch], [CX + hw - ch, CY + hh], [CX - hw + ch, CY + hh], [CX - hw, CY + hh - ch], [CX - hw, CY - hh + ch]];
    return "M" + p.map((q) => q.join(" ")).join("L") + "Z";
  }
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  const isOct = (c) => c.caseShape === "octogonal";
  const dialRadius = (c) => (isOct(c) ? 92 : 102);
  const dialShapePath = (c) => (isOct(c) ? roundRectPath(CX - 94, CY - 94, 188, 188, 46) : circlePath(102));
  const strapWidth = (c) => (c.strapType === "integrada" ? 172 : 124);
  const caseRight = (c) => (c.caseShape === "redonda" ? 340 : c.caseShape === "almofada" ? 336 : 351);
  const dateNum = () => new Date().getDate();

  // ---------- defs (ids únicos por desenho) ----------
  function metalGrad(id, m) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(m, 0.55)}"/><stop offset=".48" stop-color="${shade(m, -0.28)}"/><stop offset="1" stop-color="${shade(m, 0.32)}"/>
      </linearGradient>`;
  }
  function polishGrad(id, m) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${shade(m, -0.15)}"/><stop offset=".35" stop-color="${shade(m, 0.7)}"/><stop offset=".65" stop-color="${shade(m, -0.2)}"/><stop offset="1" stop-color="${shade(m, 0.45)}"/>
      </linearGradient>`;
  }

  function defs(u, c) {
    const m = c.caseColor;
    const b1 = c.braceletColor || m;
    const b2 = c.strapTwoTone ? (c.braceletColor2 || b1) : b1;
    return `<defs>${metalGrad(`${u}-bm`, b1)}${polishGrad(`${u}-bp`, b2)}
      <linearGradient id="${u}-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(m, 0.55)}"/><stop offset=".48" stop-color="${shade(m, -0.28)}"/><stop offset="1" stop-color="${shade(m, 0.32)}"/>
      </linearGradient>
      <linearGradient id="${u}-polish" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${shade(m, -0.15)}"/><stop offset=".35" stop-color="${shade(m, 0.7)}"/><stop offset=".65" stop-color="${shade(m, -0.2)}"/><stop offset="1" stop-color="${shade(m, 0.45)}"/>
      </linearGradient>
      <radialGradient id="${u}-shade" cx="50%" cy="38%" r="68%">
        <stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
      </radialGradient>
      <radialGradient id="${u}-fume" cx="50%" cy="46%" r="58%">
        <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".72"/>
      </radialGradient>
      <linearGradient id="${u}-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="${u}-dial"><path d="${dialShapePath(c)}"/></clipPath>
      <pattern id="${u}-weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#000" stroke-opacity=".22"/></pattern>
      <pattern id="${u}-leather" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".8" fill="#000" fill-opacity=".2"/><circle cx="7" cy="7" r=".7" fill="#000" fill-opacity=".16"/></pattern>
    </defs>`;
  }

  // ---------- pulseira ----------
  function strapSegment(u, c, top) {
    const w = strapWidth(c);
    const x = CX - w / 2;
    const y = top ? 0 : 370;
    const h = 150;
    const t = c.strapType;
    const two = !!c.strapTwoTone;
    const c1 = c.strapColor;
    const c2 = c.strapColor2 || c1;
    // faixa central (parte de dentro) quando a pulseira tem duas cores
    const center = (fill, inset = 0) => two ? `<rect x="${x + w * 0.32}" y="${y + inset}" width="${w * 0.36}" height="${h - inset * 2}" fill="${fill}"/>` : "";
    let s = "";
    if (t === "nato") {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c1}"/>${center(c2)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${u}-weave)"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${shade(c1, -0.3)}" stroke-width="1.5"/>`;
      const ky = top ? y + 40 : y + 92;
      s += `<rect x="${x - 4}" y="${ky}" width="${w + 8}" height="14" rx="3" fill="url(#${u}-metal)"/>`;
    } else if (t === "couro") {
      const far = 10;
      const d = top
        ? `M${x + far} ${y}H${x + w - far}L${x + w} ${y + h}H${x}Z`
        : `M${x} ${y}H${x + w}L${x + w - far} ${y + h}H${x + far}Z`;
      s += `<path d="${d}" fill="${c1}"/>${center(c2)}<path d="${d}" fill="url(#${u}-leather)"/>`;
      const ins = top
        ? `M${x + far + 6} ${y + 6}H${x + w - far - 6}L${x + w - 6} ${y + h - 4}H${x + 6}Z`
        : `M${x + 6} ${y + 4}H${x + w - 6}L${x + w - far - 6} ${y + h - 6}H${x + far + 6}Z`;
      s += `<path d="${ins}" fill="none" stroke="${c.stitchColor}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
      s += `<path d="${d}" fill="none" stroke="${shade(c1, -0.35)}" stroke-width="1.5"/>`;
    } else if (t === "borracha") {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c1}"/>${center(c2)}`;
      for (let gy = y + 10; gy < y + h - 4; gy += 13) s += `<rect x="${x + 14}" y="${gy}" width="${w - 28}" height="5" rx="2.5" fill="#000" fill-opacity=".2"/>`;
      s += `<rect x="${x + 4}" y="${y}" width="10" height="${h}" fill="#fff" opacity=".08"/>`;
    } else {
      // aço: oyster, jubile, integrada. Elos de fora na primeira cor, elos do centro na segunda.
      const metal = c.braceletColor || c.caseColor;
      const mid = `url(#${u}-bp)`;
      const rows = t === "jubile" ? 16 : t === "integrada" ? 30 : 24;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${u}-bm)"/>`;
      for (let ry = y; ry < y + h; ry += rows) {
        if (t === "oyster") {
          s += `<rect x="${x + w * 0.34}" y="${ry + 1}" width="${w * 0.32}" height="${rows - 2}" rx="2" fill="${mid}"/>`;
        } else if (t === "jubile") {
          const odd = Math.round((ry - y) / rows) % 2;
          s += `<rect x="${x + w * 0.3}" y="${ry + 2}" width="${w * 0.13}" height="${rows - 4}" rx="4" fill="${mid}"/>`;
          s += `<rect x="${x + w * 0.57}" y="${ry + 2}" width="${w * 0.13}" height="${rows - 4}" rx="4" fill="${mid}"/>`;
          if (odd) s += `<rect x="${x + w * 0.44}" y="${ry + 4}" width="${w * 0.12}" height="${rows - 8}" rx="3" fill="${mid}"/>`;
        } else {
          s += `<rect x="${x + w * 0.4}" y="${ry + 4}" width="${w * 0.2}" height="${rows - 8}" rx="3" fill="${mid}"/>`;
        }
        s += `<path d="M${x} ${ry + rows}h${w}" stroke="${shade(metal, -0.5)}" stroke-opacity=".55"/>`;
      }
      s += `<path d="M${x + w * 0.33} ${y}v${h}M${x + w * 0.67} ${y}v${h}" stroke="${shade(metal, -0.45)}" stroke-opacity=".35"/>`;
    }
    return s;
  }
  const strap = (u, c) => strapSegment(u, c, true) + strapSegment(u, c, false);

  // ---------- caixa ----------
  function crown(u, c) {
    const x = caseRight(c) - 4;
    const s = `<clipPath id="${u}-crown"><rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5"/></clipPath>
      <rect x="${x - 6}" y="${CY - 9}" width="10" height="18" fill="url(#${u}-metal)"/>
      <g data-crown style="cursor:grab">
        <rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5" fill="url(#${u}-metal)"/>
        <g clip-path="url(#${u}-crown)"><g data-knurl>${Array.from({ length: 14 }, (_, i) => `<rect x="${x}" y="${CY - 24 + i * 4}" width="26" height="1.6" fill="${shade(c.caseColor, -0.45)}" opacity=".55"/>`).join("")}</g></g>
        <rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5" fill="none" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".6"/>
      </g>`;
    let pushers = "";
    if (c.dialLayout === "crono") {
      for (const [deg, role] of [[60, "start"], [120, "reset"]]) {
        const [px, py] = polar(caseRight(c) - CX - 2, deg);
        pushers += `<g data-pusher="${role}" style="cursor:pointer" transform="rotate(${deg - 90} ${px} ${py})"><rect x="${px - 4}" y="${py - 7}" width="16" height="14" rx="3" fill="url(#${u}-metal)" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".5"/></g>`;
      }
    }
    return s + pushers;
  }

  function caseBody(u, c, hollow = false) {
    const m = `url(#${u}-metal)`;
    // na vista explodida a caixa é um anel: dá para ver o movimento lá dentro
    const hole = hollow ? circlePath(isOct(c) ? 96 : 104) : "";
    const edge = shade(c.caseColor, -0.45);
    let s = crown(u, c);
    if (c.caseShape === "redonda") {
      s += `<path d="M138 150 L150 116 H250 L262 150 Z M138 370 L150 404 H250 L262 370 Z" fill="${m}"/>`;
      s += `<path d="${circlePath(140)}${hole}" fill-rule="evenodd" fill="${m}"/><circle cx="${CX}" cy="${CY}" r="139" fill="none" stroke="${edge}" stroke-opacity=".35" stroke-width="2"/>`;
    } else if (c.caseShape === "almofada") {
      s += `<path d="M146 140 L154 112 H246 L254 140 Z M146 380 L154 408 H246 L254 380 Z" fill="${m}"/>`;
      s += `<path d="${roundRectPath(64, 124, 272, 272, 82)}${hole}" fill-rule="evenodd" fill="${m}"/><rect x="65" y="125" width="270" height="270" rx="81" fill="none" stroke="${edge}" stroke-opacity=".35" stroke-width="2"/>`;
    } else {
      s += `<rect x="${CX - 168}" y="${CY - 26}" width="24" height="52" rx="7" fill="${m}"/><rect x="${CX + 144}" y="${CY - 26}" width="24" height="52" rx="7" fill="${m}"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}" fill="none" stroke="${m}" stroke-width="22" stroke-linejoin="round"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}${hole}" fill-rule="evenodd" fill="${m}"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}" fill="none" stroke="${edge}" stroke-opacity=".25" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    return s;
  }

  // ---------- luneta ----------
  function bezel(u, c) {
    if (isOct(c)) {
      const d = octagonPath(122, 116, 40) + roundRectPath(CX - 99, CY - 99, 198, 198, 50);
      return `<path d="${d}" fill-rule="evenodd" fill="url(#${u}-polish)" stroke="${shade(c.caseColor, -0.35)}" stroke-opacity=".4"/>`;
    }
    const ring = circlePath(133) + circlePath(104);
    const t = c.bezelType;
    if (t === "lisa") return `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-polish)"/><circle cx="${CX}" cy="${CY}" r="133" fill="none" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".35"/>`;
    if (t === "canelada") {
      let s = `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-polish)"/>`;
      for (let i = 0; i < 72; i++) {
        const [x1, y1] = polar(106, i * 5);
        const [x2, y2] = polar(132, i * 5);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? shade(c.caseColor, 0.7) : shade(c.caseColor, -0.5)}" stroke-width="2.2" stroke-opacity=".7"/>`;
      }
      return s;
    }
    const base = c.bezelColor;
    const ik = ink(base);
    let s = `<path d="${ring}" fill-rule="evenodd" fill="${base}"/>`;
    if (c.bezelTwoTone) s += `<path d="M${CX - 133} ${CY}A133 133 0 0 1 ${CX + 133} ${CY}H${CX + 104}A104 104 0 0 0 ${CX - 104} ${CY}Z" fill="${c.bezelColor2}"/>`;
    const inkAt = (deg) => (c.bezelTwoTone && (deg <= 90 || deg >= 270) ? ink(c.bezelColor2) : ik);
    if (t === "mergulho") {
      const [tx, ty] = polar(124, 0);
      s += `<path d="M${tx - 7} ${ty - 5}L${tx + 7} ${ty - 5}L${tx} ${ty + 7}Z" fill="${inkAt(0)}"/><circle cx="${tx}" cy="${ty - 0.5}" r="2.4" fill="#dfeee0"/>`;
      for (let m = 5; m < 60; m += 5) {
        const deg = m * 6;
        const [x, y] = polar(119, deg);
        s += m % 10 === 0
          ? `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Jost, sans-serif" font-size="15" font-weight="500" fill="${inkAt(deg)}" transform="rotate(${deg} ${x} ${y})">${m}</text>`
          : `<rect x="${x - 2}" y="${y - 7}" width="4" height="14" rx="1" fill="${inkAt(deg)}" transform="rotate(${deg} ${x} ${y})"/>`;
      }
      for (let m = 1; m < 15; m++) {
        if (m % 5 === 0) continue;
        const [x1, y1] = polar(130, m * 6);
        const [x2, y2] = polar(124, m * 6);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${inkAt(m * 6)}" stroke-width="1.4"/>`;
      }
    } else {
      // taquímetro: velocidade v corresponde a 3600/v segundos
      const marks = [400, 300, 240, 200, 180, 160, 140, 120, 110, 100, 90, 85, 80, 75, 70, 65, 60];
      for (const v of marks) {
        const deg = (3600 / v) * 6;
        const [x, y] = polar(117, deg);
        const [l1x, l1y] = polar(131, deg);
        const [l2x, l2y] = polar(126, deg);
        s += `<line x1="${l1x}" y1="${l1y}" x2="${l2x}" y2="${l2y}" stroke="${inkAt(deg % 360)}" stroke-width="1.2"/>`;
        s += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="Jost, sans-serif" font-size="11" fill="${inkAt(deg % 360)}" transform="rotate(${deg} ${x} ${y})">${v}</text>`;
      }
      for (let v = 400; v > 60; v -= v > 200 ? 20 : v > 100 ? 10 : 5) {
        if (marks.includes(v)) continue;
        const deg = (3600 / v) * 6;
        const [a, b] = polar(131, deg);
        const [cx2, cy2] = polar(128, deg);
        s += `<line x1="${a}" y1="${b}" x2="${cx2}" y2="${cy2}" stroke="${inkAt(deg)}" stroke-width=".8"/>`;
      }
    }
    return s;
  }

  // ---------- mostrador ----------
  function dialFinish(u, c) {
    const f = c.dialFinish;
    const dr = dialRadius(c);
    let s = "";
    if (f === "raios") {
      for (let i = 0; i < 120; i++) {
        const [x2, y2] = polar(dr + 6, i * 3);
        s += `<line x1="${CX}" y1="${CY}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? "#fff" : "#000"}" stroke-opacity="${i % 2 ? 0.07 : 0.05}" stroke-width="1.6"/>`;
      }
      s += `<rect x="${CX - dr}" y="${CY - dr}" width="${dr * 2}" height="${dr * 2}" fill="url(#${u}-sheen)"/>`;
    } else if (f === "listrado") {
      for (let y = CY - dr; y < CY + dr; y += 5) {
        s += `<path d="M${CX - dr} ${y}h${dr * 2}" stroke="#000" stroke-opacity=".22" stroke-width="1.3"/><path d="M${CX - dr} ${y + 1.6}h${dr * 2}" stroke="#fff" stroke-opacity=".07"/>`;
      }
    } else if (f === "texturizado") {
      const rnd = seeded(7);
      for (let i = 0; i < 260; i++) {
        const a = rnd() * 360, r = Math.sqrt(rnd()) * dr;
        const [x, y] = polar(r, a);
        s += `<ellipse cx="${x}" cy="${y}" rx="${2 + rnd() * 6}" ry="${1.5 + rnd() * 4}" transform="rotate(${rnd() * 180} ${x} ${y})" fill="${rnd() > 0.5 ? "#fff" : "#000"}" fill-opacity="${0.05 + rnd() * 0.09}"/>`;
      }
    } else if (f === "grade") {
      for (let p = -dr; p <= dr; p += 9) {
        s += `<path d="M${CX - dr} ${CY + p}h${dr * 2}M${CX + p} ${CY - dr}v${dr * 2}" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/>`;
        s += `<path d="M${CX - dr} ${CY + p + 1.5}h${dr * 2}M${CX + p + 1.5} ${CY - dr}v${dr * 2}" stroke="#fff" stroke-opacity=".07"/>`;
      }
    }
    return s;
  }

  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  function indices(c) {
    const dr = dialRadius(c);
    const skip = new Set();
    if (c.dialLayout === "data") skip.add(3);
    if (c.dialLayout === "crono") { skip.add(3); skip.add(6); skip.add(9); }
    const lumeFill = "#eef3df";
    const body = c.indexColor;
    const edge = shade(body, -0.35);
    let s = "";
    for (let h = 0; h < 12; h++) {
      if (skip.has(h)) continue;
      const deg = h * 30;
      if (c.indexStyle === "romanos" || c.indexStyle === "arabicos") {
        const [x, y] = polar(dr * 0.8, deg);
        const txt = c.indexStyle === "romanos" ? ROMAN[h] : String(h || 12);
        const fam = c.indexStyle === "romanos" ? "'Bodoni Moda', Georgia, serif" : "Jost, sans-serif";
        const fs = c.indexStyle === "romanos" ? (txt.length > 2 ? 12 : 14) : 16;
        s += `<text x="${x}" y="${y + fs * 0.36}" text-anchor="middle" font-family="${fam}" font-size="${fs}" font-weight="500" fill="${body}">${txt}</text>`;
      } else if (c.indexStyle === "pontos") {
        const [x, y] = polar(dr * 0.86, deg);
        if (h === 0) s += `<path d="M${x - 7} ${y - 6}L${x + 7} ${y - 6}L${x} ${y + 6}Z" fill="${c.lume ? lumeFill : body}" stroke="${body}" stroke-width="1.4"/>`;
        else s += `<circle cx="${x}" cy="${y}" r="${h % 3 === 0 ? 6 : 5}" fill="${c.lume ? lumeFill : body}" stroke="${body}" stroke-width="1.4"/>`;
      } else {
        const len = h % 3 === 0 ? dr * 0.2 : dr * 0.15;
        const [x, y] = polar(dr * 0.93 - len / 2, deg);
        const bar = (dx) => `<rect x="${x - 2.6 + dx}" y="${y - len / 2}" width="5.2" height="${len}" rx="1" fill="${c.lume ? lumeFill : body}" stroke="${c.lume ? body : edge}" stroke-width="1.3" transform="rotate(${deg} ${x} ${y})"/>`;
        s += h === 0 ? bar(-4.2) + bar(4.2) : bar(0);
      }
    }
    // trilho de minutos
    const tk = ink(c.dialColor);
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(dr - 1, m * 6);
      const [x2, y2] = polar(dr - 5, m * 6);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tk}" stroke-opacity=".7" stroke-width=".8"/>`;
    }
    return s;
  }

  function subdial(c, cx, cy, r, role) {
    const col = c.subdialColor;
    const tk = ink(col);
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${shade(col, -0.35)}" stroke-width="1.2"/>`;
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = polar(r - 2, i * 30, cx, cy);
      const [x2, y2] = polar(r - (i % 3 === 0 ? 8 : 5), i * 30, cx, cy);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tk}" stroke-width="${i % 3 === 0 ? 1.4 : 0.8}"/>`;
    }
    s += `<g data-hand="${role}" data-cx="${cx}" data-cy="${cy}"><rect x="${cx - 1}" y="${cy - r + 5}" width="2" height="${r - 3}" rx="1" fill="${c.handColor}"/><circle cx="${cx}" cy="${cy}" r="2.6" fill="${c.handColor}"/></g>`;
    return s;
  }

  const MOVEMENT_LABEL = { quartzo: "QUARTZO", automatico: "AUTOMÁTICO", manual: "CORDA MANUAL" };

  function dial(u, c) {
    const dr = dialRadius(c);
    const shapeD = dialShapePath(c);
    let s = `<path d="${isOct(c) ? roundRectPath(CX - 98, CY - 98, 196, 196, 50) : circlePath(105)}" fill="#14171b"/>`;
    s += `<path d="${shapeD}" fill="${c.dialColor}"/>`;
    s += `<g clip-path="url(#${u}-dial)">${dialFinish(u, c)}${c.dialFume ? `<path d="${shapeD}" fill="url(#${u}-fume)"/>` : ""}<path d="${shapeD}" fill="url(#${u}-shade)"/></g>`;
    s += indices(c);
    const tk = ink(c.dialColor);
    if (c.dialLayout === "crono") {
      const off = dr * 0.5;
      const r = dr * 0.27;
      s += subdial(c, CX + off, CY, r, "cm") + subdial(c, CX, CY + off, r, "ch") + subdial(c, CX - off, CY, r, "sub");
      s += `<text x="${CX}" y="${CY - dr * 0.44}" text-anchor="middle" font-family="'Bodoni Moda', Georgia, serif" font-size="11" letter-spacing="1.4" fill="${tk}">Custom Time</text>`;
      s += `<text x="${CX}" y="${CY - dr * 0.33}" text-anchor="middle" font-family="Jost, sans-serif" font-size="5.6" letter-spacing="1.6" fill="${tk}" opacity=".85">CRONÓGRAFO</text>`;
    } else {
      s += `<text x="${CX}" y="${CY - dr * 0.47}" text-anchor="middle" font-family="'Bodoni Moda', Georgia, serif" font-size="11.5" letter-spacing="1.4" fill="${tk}">Custom Time</text>`;
      s += `<text x="${CX}" y="${CY + dr * 0.45}" text-anchor="middle" font-family="Jost, sans-serif" font-size="6" letter-spacing="1.8" fill="${tk}" opacity=".85">${MOVEMENT_LABEL[c.movement]}</text>`;
      if (c.dialLayout === "data") {
        const x = CX + dr * 0.66;
        s += `<rect x="${x - 12}" y="${CY - 9.5}" width="24" height="19" rx="2" fill="#f4f4f1" stroke="${shade(c.dialColor, -0.4)}" stroke-width="1"/>`;
        s += `<text x="${x}" y="${CY + 4.5}" text-anchor="middle" font-family="Jost, sans-serif" font-size="12" font-weight="500" fill="#16191e">${dateNum()}</text>`;
      }
    }
    return s;
  }

  // ---------- ponteiros ----------
  const P = (x, y) => `${+(CX + x).toFixed(2)},${+(CY + y).toFixed(2)}`;
  const poly = (pts, fill, extra = "") => `<polygon points="${pts.map(([x, y]) => P(x, y)).join(" ")}" fill="${fill}" ${extra}/>`;

  function hand(style, kind, c) {
    const col = c.handColor;
    const edge = `stroke="${shade(col, -0.45)}" stroke-width=".7" stroke-linejoin="round"`;
    const lume = c.lume ? "#eef3df" : null;
    const L = kind === "h" ? (isOct(c) ? 54 : 60) : (isOct(c) ? 82 : 92);
    const w = kind === "h" ? 9 : 7;
    let st = style;
    if (kind === "m" && ["mercedes", "flecha", "floco"].includes(style)) st = "espada";
    let s = "";
    switch (st) {
      case "bastao":
        s += `<rect x="${CX - w / 2}" y="${CY - L}" width="${w}" height="${L + 14}" rx="1.2" fill="${col}" ${edge}/>`;
        if (lume) s += `<rect x="${CX - w / 2 + 1.7}" y="${CY - L + 4}" width="${w - 3.4}" height="${L - 18}" rx="1" fill="${lume}"/>`;
        break;
      case "espada":
        s += poly([[-1.6, 16], [-w / 2, -L * 0.2], [-w / 2 + 0.4, -L * 0.82], [0, -L], [w / 2 - 0.4, -L * 0.82], [w / 2, -L * 0.2], [1.6, 16]], col, edge);
        if (lume) s += poly([[-w / 2 + 1.8, -L * 0.24], [-w / 2 + 2, -L * 0.8], [0, -L + 6], [w / 2 - 2, -L * 0.8], [w / 2 - 1.8, -L * 0.24]], lume);
        break;
      case "dauphine":
        s += poly([[0, 16], [-w * 0.62, -L * 0.1], [0, -L], [w * 0.62, -L * 0.1]], col, edge);
        s += poly([[0, 16], [0, -L], [w * 0.62, -L * 0.1]], shade(col, 0.35));
        if (lume) s += poly([[-0.9, -L * 0.2], [0, -L * 0.85], [0.9, -L * 0.2]], lume);
        break;
      case "folha":
        s += `<path d="M${P(0, 16)} C${P(-w * 1.15, -L * 0.25)} ${P(-w * 0.75, -L * 0.72)} ${P(0, -L)} C${P(w * 0.75, -L * 0.72)} ${P(w * 1.15, -L * 0.25)} ${P(0, 16)}Z" fill="${col}" ${edge}/>`;
        if (lume) s += `<path d="M${P(0, -L * 0.12)} C${P(-w * 0.7, -L * 0.3)} ${P(-w * 0.45, -L * 0.7)} ${P(0, -L * 0.88)} C${P(w * 0.45, -L * 0.7)} ${P(w * 0.7, -L * 0.3)} ${P(0, -L * 0.12)}Z" fill="${lume}"/>`;
        break;
      case "seringa":
        s += `<rect x="${CX - w / 2}" y="${CY - L * 0.56}" width="${w}" height="${L * 0.56 + 14}" rx="1.2" fill="${col}" ${edge}/>`;
        s += poly([[-w * 0.17, -L * 0.56], [0, -L], [w * 0.17, -L * 0.56]], col, edge);
        if (lume) s += `<rect x="${CX - w / 2 + 1.7}" y="${CY - L * 0.53}" width="${w - 3.4}" height="${L * 0.4}" rx="1" fill="${lume}"/>`;
        break;
      case "mercedes": {
        const cy = -L * 0.66, r = w * 1.05;
        s += `<rect x="${CX - 1.8}" y="${CY + cy + r - 1}" width="3.6" height="${-cy - r + 15}" fill="${col}" ${edge}/>`;
        s += poly([[-w * 0.36, cy - r + 1], [0, -L], [w * 0.36, cy - r + 1]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r}" fill="${col}" ${edge}/>`;
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r - 1.8}" fill="${lume || shade(col, -0.6)}"/>`;
        for (const a of [0, 120, 240]) {
          const [x2, y2] = polar(r - 1, a, CX, CY + cy);
          s += `<line x1="${CX}" y1="${CY + cy}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.8"/>`;
        }
        break;
      }
      case "catedral":
        s += `<rect x="${CX - 1.6}" y="${CY - L * 0.32}" width="3.2" height="${L * 0.32 + 14}" fill="${col}" ${edge}/>`;
        s += `<path d="M${P(-w * 0.75, -L * 0.3)} L${P(-w * 0.75, -L * 0.62)} Q${P(-w * 0.75, -L * 0.82)} ${P(0, -L * 0.88)} Q${P(w * 0.75, -L * 0.82)} ${P(w * 0.75, -L * 0.62)} L${P(w * 0.75, -L * 0.3)}Z" fill="${col}" ${edge}/>`;
        s += poly([[-1.4, -L * 0.86], [0, -L], [1.4, -L * 0.86]], col, edge);
        if (lume) {
          s += `<path d="M${P(-w * 0.45, -L * 0.34)} V${CY - L * 0.58} Q${P(-w * 0.45, -L * 0.68)} ${P(-0.8, -L * 0.7)} V${CY - L * 0.34}Z" fill="${lume}"/>`;
          s += `<path d="M${P(w * 0.45, -L * 0.34)} V${CY - L * 0.58} Q${P(w * 0.45, -L * 0.68)} ${P(0.8, -L * 0.7)} V${CY - L * 0.34}Z" fill="${lume}"/>`;
        }
        break;
      case "breguet": {
        const cy = -L * (kind === "h" ? 0.64 : 0.78), r = w * 0.85;
        s += poly([[-1.5, 14], [-1.1, cy + r], [1.1, cy + r], [1.5, 14]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r}" fill="none" stroke="${col}" stroke-width="2.4"/>`;
        s += poly([[-1.1, cy - r], [0, -L], [1.1, cy - r]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + 10}" r="3" fill="${col}"/>`;
        break;
      }
      case "flecha":
        s += `<rect x="${CX - 1.8}" y="${CY - L * 0.62}" width="3.6" height="${L * 0.62 + 14}" fill="${col}" ${edge}/>`;
        s += poly([[-w * 1.1, -L * 0.58], [0, -L], [w * 1.1, -L * 0.58]], col, edge);
        if (lume) s += poly([[-w * 0.7, -L * 0.62], [0, -L * 0.9], [w * 0.7, -L * 0.62]], lume);
        break;
      case "floco":
        s += `<rect x="${CX - 1.8}" y="${CY - L * 0.55}" width="3.6" height="${L * 0.55 + 14}" fill="${col}" ${edge}/>`;
        s += `<rect x="${CX - w * 0.85}" y="${CY - L * 0.86}" width="${w * 1.7}" height="${w * 1.7}" rx="1" fill="${col}" ${edge}/>`;
        if (lume) s += `<rect x="${CX - w * 0.85 + 1.8}" y="${CY - L * 0.86 + 1.8}" width="${w * 1.7 - 3.6}" height="${w * 1.7 - 3.6}" fill="${lume}"/>`;
        s += poly([[-1.6, -L * 0.86], [0, -L], [1.6, -L * 0.86]], col, edge);
        break;
    }
    return s;
  }

  function secondHand(c) {
    const col = c.secondColor;
    const L = isOct(c) ? 86 : 96;
    let s = `<rect x="${CX - 0.8}" y="${CY - L}" width="1.6" height="${L + 24}" fill="${col}"/>`;
    s += `<circle cx="${CX}" cy="${CY + 18}" r="3.4" fill="${col}"/>`;
    if (c.secondStyle === "pirulito") s += `<circle cx="${CX}" cy="${CY - L * 0.7}" r="4.6" fill="${col}"/>${c.lume ? `<circle cx="${CX}" cy="${CY - L * 0.7}" r="2.8" fill="#eef3df"/>` : ""}`;
    if (c.secondStyle === "seta") s += poly([[-4, -L * 0.82], [0, -L], [4, -L * 0.82]], col);
    return s;
  }

  function hands(u, c) {
    const role = c.dialLayout === "crono" ? "chrono" : "s";
    return `<g data-hand="h">${hand(c.handStyle, "h", c)}</g>
      <g data-hand="m">${hand(c.handStyle, "m", c)}</g>
      <g data-hand="${role}">${secondHand(c)}</g>
      <circle cx="${CX}" cy="${CY}" r="5" fill="${c.handColor}" stroke="${shade(c.handColor, -0.45)}" stroke-width=".7"/>
      <circle cx="${CX}" cy="${CY}" r="2" fill="${c.secondColor}"/>`;
  }

  // ---------- cristal ----------
  function crystal(u, c) {
    const d = isOct(c) ? roundRectPath(CX - 99, CY - 99, 198, 198, 50) : circlePath(104);
    return `<path d="${d}" fill="#dfe9f2" fill-opacity=".07"/><path d="${d}" fill="none" stroke="#9fb1c4" stroke-opacity=".45" stroke-width="1.4"/>
      <ellipse cx="${CX - 40}" cy="${CY - 62}" rx="66" ry="34" fill="#fff" opacity=".07" transform="rotate(-30 ${CX - 40} ${CY - 62})"/>`;
  }

  // ---------- movimento ----------
  function movement(u, c, r = 96) {
    const plate = "#c3c7cd";
    const brass = "#c9a44c";
    const ruby = "#b4233c";
    let s = `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${plate}"/>`;
    if (c.movement === "quartzo") {
      s = `<circle cx="${CX}" cy="${CY}" r="${r}" fill="#2a2d33"/>`;
      s += `<circle cx="${CX - 28}" cy="${CY + 28}" r="${r * 0.32}" fill="#d5d8dc" stroke="#9aa0a6" stroke-width="2"/><text x="${CX - 28}" y="${CY + 32}" text-anchor="middle" font-family="Jost, sans-serif" font-size="9" fill="#5b6067">SR920SW</text>`;
      s += `<rect x="${CX + 14}" y="${CY - 48}" width="46" height="22" rx="4" fill="#b8743a"/><g stroke="#8a5222">${Array.from({ length: 10 }, (_, i) => `<line x1="${CX + 18 + i * 4}" y1="${CY - 46}" x2="${CX + 18 + i * 4}" y2="${CY - 28}"/>`).join("")}</g>`;
      s += `<rect x="${CX + 10}" y="${CY + 4}" width="40" height="26" rx="3" fill="#3c6b4a"/><circle cx="${CX - 40}" cy="${CY - 40}" r="10" fill="#8c9096"/>`;
      s += `<text x="${CX}" y="${CY - 66}" text-anchor="middle" font-family="Jost, sans-serif" font-size="8" letter-spacing="1.5" fill="#9aa0a6">QUARTZ · 0 JEWELS</text>`;
      return s;
    }
    // perlage
    const rnd = seeded(3);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * 360, rr = Math.sqrt(rnd()) * (r - 8);
      const [x, y] = polar(rr, a);
      s += `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#fff" stroke-opacity=".28"/>`;
    }
    // pontes com côtes de Genève
    s += `<clipPath id="${u}-bridge"><path d="M${CX - r + 10} ${CY - 20} Q${CX - 20} ${CY - r + 6} ${CX + 50} ${CY - r + 20} L${CX + 40} ${CY - 10} Q${CX} ${CY + 10} ${CX - r + 14} ${CY + 20}Z"/></clipPath>`;
    s += `<path d="M${CX - r + 10} ${CY - 20} Q${CX - 20} ${CY - r + 6} ${CX + 50} ${CY - r + 20} L${CX + 40} ${CY - 10} Q${CX} ${CY + 10} ${CX - r + 14} ${CY + 20}Z" fill="#d3d6db" stroke="#8d939a"/>`;
    s += `<g clip-path="url(#${u}-bridge)">${Array.from({ length: 16 }, (_, i) => `<line x1="${CX - 120 + i * 14}" y1="${CY - 120}" x2="${CX - 40 + i * 14}" y2="${CY + 60}" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>`).join("")}</g>`;
    // trem de engrenagens
    for (const [gx, gy, gr] of [[CX + 18, CY + 30, 20], [CX - 30, CY + 50, 14], [CX + 54, CY - 6, 12]]) {
      s += `<circle cx="${gx}" cy="${gy}" r="${gr}" fill="${brass}"/><circle cx="${gx}" cy="${gy}" r="${gr - 4}" fill="none" stroke="#8f6e22" stroke-width="1.5" stroke-dasharray="2 2"/><circle cx="${gx}" cy="${gy}" r="2.6" fill="${ruby}"/>`;
    }
    // catraca (gira quando dá corda)
    s += `<g data-ratchet data-cx="${CX - 22}" data-cy="${CY - 32}"><circle cx="${CX - 22}" cy="${CY - 32}" r="26" fill="#aeb3ba" stroke="#7b8188"/>${Array.from({ length: 24 }, (_, i) => { const [a, b] = polar(26, i * 15, CX - 22, CY - 32); const [c2, d2] = polar(21, i * 15 + 6, CX - 22, CY - 32); return `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d2}" stroke="#6f757c"/>`; }).join("")}<circle cx="${CX - 22}" cy="${CY - 32}" r="6" fill="#868c93"/></g>`;
    // balanço (oscila)
    const bx = CX + 46, by = CY + 46;
    s += `<g data-balance data-cx="${bx}" data-cy="${by}"><circle cx="${bx}" cy="${by}" r="24" fill="none" stroke="${brass}" stroke-width="4"/>${[0, 120, 240].map((a) => { const [x, y] = polar(22, a, bx, by); return `<line x1="${bx}" y1="${by}" x2="${x}" y2="${y}" stroke="${brass}" stroke-width="2.5"/>`; }).join("")}<path d="M${bx} ${by} m-14 0 a14 14 0 1 1 28 0 a11 11 0 1 1 -22 0 a8 8 0 1 1 16 0" fill="none" stroke="#5b6170" stroke-width=".8"/><circle cx="${bx}" cy="${by}" r="2.6" fill="${ruby}"/></g>`;
    for (const [jx, jy] of [[CX - 60, CY + 10], [CX + 70, CY + 30], [CX - 10, CY + 78], [CX + 20, CY - 70]]) s += `<circle cx="${jx}" cy="${jy}" r="3" fill="${ruby}" stroke="#d9d9d9" stroke-width="1.2"/>`;
    if (c.movement === "automatico") {
      const rc = c.rotorColor;
      let waves = "";
      for (let row = 0; row < 6; row++) for (let col = -6; col < 7; col++) {
        const wx = CX + col * 16 + (row % 2) * 8, wy = CY - 20 - row * 11;
        waves += `<path d="M${wx - 8} ${wy} a8 8 0 0 1 16 0" fill="none" stroke="${shade(rc, 0.45)}" stroke-width="1.2"/><path d="M${wx - 5} ${wy} a5 5 0 0 1 10 0" fill="none" stroke="${shade(rc, 0.45)}" stroke-width="1"/>`;
      }
      s += `<clipPath id="${u}-rotor"><path d="M${CX - r + 4} ${CY} A${r - 4} ${r - 4} 0 0 1 ${CX + r - 4} ${CY} L${CX + 16} ${CY} A16 16 0 0 0 ${CX - 16} ${CY}Z"/></clipPath>`;
      s += `<g data-rotor><path d="M${CX - r + 4} ${CY} A${r - 4} ${r - 4} 0 0 1 ${CX + r - 4} ${CY} L${CX + 16} ${CY} A16 16 0 0 0 ${CX - 16} ${CY}Z" fill="${rc}" stroke="${shade(rc, -0.35)}"/><g clip-path="url(#${u}-rotor)">${waves}</g>
        <text x="${CX}" y="${CY - r * 0.66}" text-anchor="middle" font-family="'Bodoni Moda', Georgia, serif" font-size="10" letter-spacing="1.2" fill="${ink(rc)}">Custom Time</text></g>`;
      s += `<circle cx="${CX}" cy="${CY}" r="9" fill="#9aa0a6" stroke="#6f757c"/><circle cx="${CX}" cy="${CY}" r="3" fill="${ruby}"/>`;
    } else {
      s += `<text x="${CX}" y="${CY + r - 14}" text-anchor="middle" font-family="Jost, sans-serif" font-size="7" letter-spacing="1.4" fill="#5b6067">17 JEWELS · CORDA MANUAL</text>`;
    }
    return s;
  }

  // ---------- montagem ----------
  function wrap(u, c, inner, label) {
    return `<svg viewBox="0 0 400 520" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${defs(u, c)}${inner}</svg>`;
  }

  function front(c, label = "Desenho do relógio") {
    const u = `w${++uidCounter}`;
    return wrap(u, c, strap(u, c) + caseBody(u, c) + dial(u, c) + hands(u, c) + bezel(u, c) + crystal(u, c), label);
  }

  /** Camadas separadas, de baixo para cima, para a vista explodida. `level` é a altura de cada uma. */
  function layers(c) {
    const u = `w${++uidCounter}`;
    const parts = [
      ["pulseira", strapSegment(u, c, true), 0],
      ["pulseira-baixo", strapSegment(u, c, false), 0],
      ["movimento", movement(u, c), 1],
      ["caixa", caseBody(u, c, true), 2],
      ["mostrador", dial(u, c), 3],
      ["ponteiros", hands(u, c), 4],
      ["luneta", bezel(u, c), 5],
      ["cristal", crystal(u, c), 6],
    ];
    return parts.map(([name, inner, level]) => ({ name, level, svg: wrap(u, c, inner, name) }));
  }

  function back(c) {
    const u = `w${++uidCounter}`;
    const m = `url(#${u}-metal)`;
    let s = strap(u, c);
    if (c.caseShape === "redonda") s += `<path d="M138 150 L150 116 H250 L262 150 Z M138 370 L150 404 H250 L262 370 Z" fill="${m}"/><circle cx="${CX}" cy="${CY}" r="140" fill="${m}"/>`;
    else if (c.caseShape === "almofada") s += `<path d="M146 140 L154 112 H246 L254 140 Z M146 380 L154 408 H246 L254 380 Z" fill="${m}"/><rect x="64" y="124" width="272" height="272" rx="82" fill="${m}"/>`;
    else s += `<path d="${octagonPath(140, 134, 46)}" fill="${m}" stroke="${m}" stroke-width="22" stroke-linejoin="round"/>`;
    // coroa do lado esquerdo (vista de trás)
    s += `<rect x="${400 - caseRight(c) - 22}" y="${CY - 16}" width="26" height="32" rx="5" fill="${m}"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="124" fill="url(#${u}-polish)"/>`;
    for (let i = 0; i < 90; i++) {
      const [x1, y1] = polar(124, i * 4);
      const [x2, y2] = polar(119, i * 4);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${shade(c.caseColor, -0.45)}" stroke-opacity=".6" stroke-width="1.4"/>`;
    }
    if (c.movement === "quartzo") {
      s += `<circle cx="${CX}" cy="${CY}" r="112" fill="${m}"/>`;
      for (let r = 20; r < 110; r += 6) s += `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".08"/>`;
      s += `<text x="${CX}" y="${CY - 8}" text-anchor="middle" font-family="'Bodoni Moda', Georgia, serif" font-size="18" fill="${shade(c.caseColor, -0.55)}">Custom Time</text>`;
      s += `<text x="${CX}" y="${CY + 14}" text-anchor="middle" font-family="Jost, sans-serif" font-size="8" letter-spacing="2" fill="${shade(c.caseColor, -0.5)}">QUARTZO · AÇO · 100 M</text>`;
    } else {
      s += `<circle cx="${CX}" cy="${CY}" r="112" fill="${m}"/>`;
      s += `<path id="${u}-arc" d="M${CX - 103} ${CY} A103 103 0 0 1 ${CX + 103} ${CY}" fill="none"/>`;
      s += `<text font-family="'Bodoni Moda', Georgia, serif" font-style="italic" font-size="11" fill="${shade(c.caseColor, -0.6)}"><textPath href="#${u}-arc" startOffset="50%" text-anchor="middle">Custom Time · ateliê de relojoaria</textPath></text>`;
      s += `<circle cx="${CX}" cy="${CY}" r="92" fill="#0d0f12"/>`;
      s += movement(u, c, 90);
      s += `<circle cx="${CX}" cy="${CY}" r="91" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
      s += `<ellipse cx="${CX - 30}" cy="${CY - 50}" rx="55" ry="26" fill="#fff" opacity=".08" transform="rotate(-30 ${CX - 30} ${CY - 50})"/>`;
    }
    return wrap(u, c, s, "Fundo do relógio");
  }

  /** Ícone de um estilo de ponteiro, para os botões de escolha. */
  function handIcon(style, color = "#141b26") {
    const c = { ...DEFAULT_WATCH, handColor: color, lume: false, caseShape: "redonda" };
    return `<svg viewBox="140 160 120 130" aria-hidden="true"><g transform="rotate(-50 200 260)">${hand(style, "h", c)}</g><g transform="rotate(48 200 260)">${hand(style, "m", c)}</g><circle cx="200" cy="260" r="4" fill="${color}"/></svg>`;
  }

  return { front, back, layers, handIcon, shade, ink, mix, hexToRgb, rgbToHex, luminance };
})();

// ---------------------------------------------------------------------------
// Movimento: faz os ponteiros andarem conforme o tipo de máquina.
// quartzo: um salto por segundo · automático e manual: 6 batidas por segundo
// (21.600 alternâncias/h). Automático e manual param quando acaba a corda.
// ---------------------------------------------------------------------------
const DEMO_RESERVE_SECONDS = 120; // demonstração acelerada: a reserva toda dura 2 minutos

class Movement {
  constructor(root, cfg, { onState } = {}) {
    this.root = root;
    this.cfg = cfg;
    this.type = cfg.movement;
    this.reserve = 0.6;
    this.offset = 0;          // ms em que o relógio ficou parado
    this.stoppedAt = null;
    this.rotor = 0;
    this.rotorVel = 0;
    this.ratchet = 0;
    this.knurl = 0;
    this.chrono = { running: false, start: 0, elapsed: 0 };
    this.onState = onState;
    this.last = performance.now();
    this.bind();
  }

  setConfig(cfg) {
    const typeChanged = cfg.movement !== this.type;
    this.cfg = cfg;
    this.type = cfg.movement;
    if (typeChanged) { this.offset = 0; this.stoppedAt = null; this.reserve = Math.max(this.reserve, 0.6); }
    this.bind();
  }

  bind() {
    const q = (sel) => [...this.root.querySelectorAll(sel)];
    this.el = {
      h: q('[data-hand="h"]'), m: q('[data-hand="m"]'), s: q('[data-hand="s"]'),
      chrono: q('[data-hand="chrono"]'), sub: q('[data-hand="sub"]'), cm: q('[data-hand="cm"]'), ch: q('[data-hand="ch"]'),
      rotor: q("[data-rotor]"), balance: q("[data-balance]"), ratchet: q("[data-ratchet]"), knurl: q("[data-knurl]"),
    };
  }

  get mechanical() { return this.cfg.movement !== "quartzo"; }
  get running() { return !this.mechanical || this.reserve > 0; }

  wind(amount) {
    if (!this.mechanical) return;
    this.reserve = Math.min(1, this.reserve + amount);
    this.ratchet += amount * 900;
    this.knurl = (this.knurl + amount * 160) % 4;
  }

  shake(amount) {
    if (this.cfg.movement !== "automatico") return;
    this.rotorVel += amount * 2.2;
    this.reserve = Math.min(1, this.reserve + Math.abs(amount) * 0.0005);
  }

  resetTime() { this.offset = 0; if (this.stoppedAt) this.stoppedAt = performance.now(); }

  pusher(role) {
    const ch = this.chrono;
    if (role === "start") {
      if (ch.running) { ch.elapsed += performance.now() - ch.start; ch.running = false; }
      else { ch.start = performance.now(); ch.running = true; }
    } else if (!ch.running) ch.elapsed = 0;
  }

  tick(now) {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const wasRunning = this.running;
    if (this.mechanical && this.reserve > 0) this.reserve = Math.max(0, this.reserve - dt / DEMO_RESERVE_SECONDS);

    if (!this.running && this.stoppedAt === null) this.stoppedAt = now;
    if (this.running && this.stoppedAt !== null) { this.offset += now - this.stoppedAt; this.stoppedAt = null; }
    if (wasRunning !== this.running) this.onState?.(this);

    const t = new Date(Date.now() - this.offset - (this.stoppedAt !== null ? now - this.stoppedAt : 0));
    const ms = t.getMilliseconds() / 1000;
    let sec = t.getSeconds() + ms;
    sec = this.cfg.movement === "quartzo" ? Math.floor(sec) : Math.floor(sec * 6) / 6;
    const min = t.getMinutes() + sec / 60;
    const hr = (t.getHours() % 12) + min / 60;

    const rot = (els, deg, cx = 200, cy = 260) => els.forEach((e) => e.setAttribute("transform", `rotate(${deg.toFixed(2)} ${e.dataset.cx || cx} ${e.dataset.cy || cy})`));
    rot(this.el.h, hr * 30);
    rot(this.el.m, min * 6);
    rot(this.el.s, sec * 6);
    rot(this.el.sub, sec * 6);
    const ch = this.chrono;
    const el = (ch.elapsed + (ch.running ? now - ch.start : 0)) / 1000;
    rot(this.el.chrono, (el % 60) * 6);
    rot(this.el.cm, ((el / 60) % 30) * 12);
    rot(this.el.ch, ((el / 3600) % 12) * 30);

    // rotor com inércia; balanço oscilando a 3 Hz enquanto há corda
    this.rotorVel *= Math.pow(0.12, dt);
    this.rotor += this.rotorVel * dt * 60;
    if (this.cfg.movement === "automatico" && Math.abs(this.rotorVel) > 0.2) this.reserve = Math.min(1, this.reserve + Math.abs(this.rotorVel) * dt * 0.004);
    rot(this.el.rotor, this.rotor);
    const swing = this.running ? Math.sin(now / 1000 * Math.PI * 2 * 3) * 160 : 0;
    rot(this.el.balance, swing);
    rot(this.el.ratchet, this.ratchet);
    this.el.knurl.forEach((k) => k.setAttribute("transform", `translate(0 ${this.knurl.toFixed(2)})`));
  }
}

/** Um único laço de animação para todos os relógios da página. */
const Clockwork = {
  items: new Set(),
  started: false,
  add(m) { this.items.add(m); this.start(); return m; },
  remove(m) { this.items.delete(m); },
  start() {
    if (this.started) return;
    this.started = true;
    const loop = (now) => { this.items.forEach((m) => { if (m.root.isConnected) m.tick(now); else this.items.delete(m); }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },
};
