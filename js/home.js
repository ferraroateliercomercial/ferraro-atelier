/* Ferraro Atelier — página inicial.
   A tela é um mostrador: ele se monta na abertura, marca a hora de quem visita e, ao rolar,
   se afasta até virar o relógio inteiro, que então se desmonta peça por peça.
   GSAP + ScrollTrigger cuidam das animações e o Lenis da rolagem suave. Sem essas bibliotecas,
   ou com movimento reduzido, a página continua completa, só que parada. */
const Home = (() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasG = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const motion = hasG && !reduce;
  // tela em pé (celular, tablet na vertical): mesma regra do CSS
  const portrait = matchMedia("(max-aspect-ratio: 1/1), (max-width: 759px)");
  const isMobile = () => portrait.matches;
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const smooth = (t) => t * t * (3 - 2 * t);

  // Curvas da casa: saída forte para o que entra; ida e volta para o que se move na tela.
  let OUT = "expo.out";
  let IN_OUT = "power4.inOut";
  if (hasG) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.CustomEase) {
      gsap.registerPlugin(CustomEase);
      CustomEase.create("ferraroOut", "0.23,1,0.32,1");
      CustomEase.create("ferraroInOut", "0.77,0,0.175,1");
      OUT = "ferraroOut";
      IN_OUT = "ferraroInOut";
    }
    // o recálculo do load cairia no meio da abertura e travaria um quadro; ele é feito à mão, antes ou depois dela
    ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,resize" });
  }
  // O compasso da abertura: as entradas em sequência andam em oitavos de segundo, como um Sellita (28.800 alternâncias/h).
  const BEAT = 1 / 8;

  let lenis = null;
  let heroST = null;
  let introDone = false;

  // ---------------------------------------------------------------------------
  // Rolagem suave
  // ---------------------------------------------------------------------------
  function startLenis() {
    if (!motion || lenis || typeof window.Lenis === "undefined") return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
  }
  function stopLenis() {
    if (!lenis) return;
    lenis.destroy();
    lenis = null;
  }
  if (motion) {
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToY(y, immediate = false) {
    if (lenis) lenis.scrollTo(y, { immediate, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: immediate || reduce ? "auto" : "smooth" });
  }
  /** Rola até uma seção da página inicial. A anatomia vive dentro do mostrador fixado. */
  function goTo(id, immediate = false) {
    if (id === "topo") return scrollToY(0, immediate);
    if (id === "anatomia" && heroST) return scrollToY(heroST.start + (heroST.end - heroST.start) * 0.66, immediate);
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (id === "contato" ? 0 : 0);
    scrollToY(y, immediate);
  }

  // ---------------------------------------------------------------------------
  // Mostrador vivo: desenho
  // ---------------------------------------------------------------------------
  const K = 500 / 102;               // o mostrador do desenho tem raio 102; aqui, 500
  const HERO = { ...HERO_CFG };
  const PRINT = "#efe6cf";   // impressão marfim
  const GILT = "#d9b56b";    // dourado aplicado: escala da luneta

  function polar(r, deg) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [+(Math.cos(a) * r).toFixed(2), +(Math.sin(a) * r).toFixed(2)];
  }

  function buildBezel() {
    const R1 = 133 * K, R0 = 104 * K, RC = 140 * K; // luneta, abertura e caixa: as mesmas medidas do relógio da vista explodida
    let s = `<defs>
      <linearGradient id="hb-case" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${Watch.shade(HERO.caseColor, 0.55)}"/><stop offset=".48" stop-color="${Watch.shade(HERO.caseColor, -0.28)}"/><stop offset="1" stop-color="${Watch.shade(HERO.caseColor, 0.32)}"/>
      </linearGradient>
      <radialGradient id="hb-ceramic" cx=".38" cy=".3" r=".9">
        <stop offset="0" stop-color="${Watch.shade(HERO.bezelColor, 0.22)}"/><stop offset=".55" stop-color="${HERO.bezelColor}"/><stop offset="1" stop-color="${Watch.shade(HERO.bezelColor, -0.5)}"/>
      </radialGradient>
      <linearGradient id="hb-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".07"/>
      </linearGradient>
    </defs>`;
    // caixa de bronze polido em volta da luneta
    s += `<circle r="${RC}" fill="url(#hb-case)"/><circle r="${RC - 6}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>`;
    s += `<circle r="${R0}" fill="#0a0d08"/>`;
    // três desenhos empilhados: a caixa parada, o aro que gira em cliques (camada própria) e o reflexo, que não gira com ele
    const box = (cls, inner, id = "") => `<svg class="${cls}"${id ? ` id="${id}"` : ""} viewBox="-720 -720 1440 1440">${inner}</svg>`;
    let ring = `<path d="M${-R1} 0a${R1} ${R1} 0 1 0 ${R1 * 2} 0a${R1} ${R1} 0 1 0 ${-R1 * 2} 0ZM${-R0} 0a${R0} ${R0} 0 1 1 ${R0 * 2} 0a${R0} ${R0} 0 1 1 ${-R0 * 2} 0Z" fill="url(#hb-ceramic)" fill-rule="evenodd"/>`;
    ring += `<circle r="${R1 - 2}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>`;
    // escala de mergulho: triângulo com lume no 12, números de 10 em 10, barras de 5 em 5, minutos nos primeiros 15
    const [tx, ty] = polar(124 * K, 0);
    ring += `<path d="M${tx - 34} ${ty - 25}L${tx + 34} ${ty - 25}L${tx} ${ty + 34}Z" fill="${GILT}"/><circle cx="${tx}" cy="${ty - 3}" r="11" fill="#dfeee0"/>`;
    for (let m = 5; m < 60; m += 5) {
      const deg = m * 6;
      const [x, y] = polar(119 * K, deg);
      ring += m % 10 === 0
        ? `<text x="${x}" y="${y + 26}" text-anchor="middle" font-family="Saira, sans-serif" font-size="74" font-weight="600" fill="${GILT}" transform="rotate(${deg} ${x} ${y})">${m}</text>`
        : `<rect x="${x - 10}" y="${y - 34}" width="20" height="68" rx="4" fill="${GILT}" transform="rotate(${deg} ${x} ${y})"/>`;
    }
    for (let m = 1; m < 15; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(130 * K, m * 6);
      const [x2, y2] = polar(124 * K, m * 6);
      ring += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${GILT}" stroke-width="7"/>`;
    }
    const sheen = `<path d="M${-R1} 0a${R1} ${R1} 0 1 0 ${R1 * 2} 0a${R1} ${R1} 0 1 0 ${-R1 * 2} 0ZM${-R0} 0a${R0} ${R0} 0 1 1 ${R0 * 2} 0a${R0} ${R0} 0 1 1 ${-R0 * 2} 0Z" fill="url(#hb-sheen)" fill-rule="evenodd"/>`;
    $("#heroBezel").innerHTML = box("bezel__case", s) + box("bezel__ring", ring, "heroBezelRing") + box("bezel__sheen", sheen);
    // a luneta entra girada 60° e gira, em cliques, até o 12 ficar no alto, como no relógio da vista explodida
    $("#heroBezelRing").style.transform = "rotate(60deg)";
  }

  function buildPrint() {
    let s = `<defs>
      <linearGradient id="hp-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8c6a2e"/><stop offset=".45" stop-color="#f5e1a8"/><stop offset=".55" stop-color="#d9b76f"/><stop offset="1" stop-color="#7e5d24"/>
      </linearGradient>
    </defs>`;
    // trilho de minutos
    s += `<g class="print__track">`;
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(495, m * 6);
      const [x2, y2] = polar(472, m * 6);
      s += `<line class="tk" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PRINT}" stroke-opacity=".72" stroke-width="4.5"/>`;
    }
    s += `</g>`;
    // índices aplicados: bastões polidos com lume, como no relógio desenhado (sem o 3, onde fica a data).
    // A sombra é uma cópia escura deslocada: um filtro SVG aqui repintaria o mostrador a cada passo do segundo.
    s += `<g class="print__indices">`;
    for (let h = 0; h < 12; h++) {
      if (h === 3) continue;
      const deg = h * 30;
      const len = h % 3 === 0 ? 100 : 74;
      const [x, y] = polar(465 - len / 2, deg);
      const bar = (dx) => `<rect x="${x - 13 + dx}" y="${y - len / 2}" width="26" height="${len}" rx="5" fill="#000" fill-opacity=".38" transform="translate(4 9) rotate(${deg} ${x} ${y})"/>
        <rect x="${x - 13 + dx}" y="${y - len / 2}" width="26" height="${len}" rx="5" fill="url(#hp-steel)" transform="rotate(${deg} ${x} ${y})"/>
        <rect class="lume" x="${x - 7 + dx}" y="${y - len / 2 + 7}" width="14" height="${len - 14}" rx="3" fill="#eef3df" transform="rotate(${deg} ${x} ${y})"/>`;
      s += `<g class="ix">${h === 0 ? bar(-21) + bar(21) : bar(0)}</g>`;
    }
    s += `</g>`;
    $("#dialPrint").innerHTML = s;
    // logo empilhada abaixo do 12, num desenho à parte: ela entra na abertura e se move no recuo sem redesenhar o mostrador
    $("#dialLogoArt").innerHTML = Watch.mark(0, -250, 245, PRINT);
  }

  function buildDate() {
    const strip = $("#dateStrip");
    strip.innerHTML = Array.from({ length: 31 }, (_, i) => `<span>${i + 1}</span>`).join("");
    const today = new Date().getDate();
    setDate(today);
    return today;
  }
  function setDate(n) {
    $("#dateStrip").style.transform = `translateY(${(-(n - 1) * 100) / 31}%)`;
  }

  // ---------------------------------------------------------------------------
  // A tela é o mostrador: geometria, trilho de minutos nas bordas e os raios de sol
  // ---------------------------------------------------------------------------
  const geo = { W: 0, H: 0, cx: 0, cy: 0, D: 0, Rr: 0, RS: 0, logoY: 0, logoS: 1, handS: 1, key: "" };
  // medidas do trilho das bordas (celular / computador)
  const EDGE = { m: { e: 10, t: 9, gap: 12, L: 34, bw: 8 }, d: { e: 18, t: 13, gap: 20, L: 70, bw: 15 } };

  function measureHero() {
    const stage = $("#heroStage0");
    const head = $("#heroHead");
    geo.W = stage.clientWidth;
    geo.H = stage.clientHeight;
    geo.cx = head.offsetLeft + head.offsetWidth / 2;
    geo.cy = head.offsetTop + head.offsetHeight / 2;
    geo.D = $("#heroDial").offsetWidth;
    if (!geo.W || !geo.D) return false;
    // distância do eixo até o canto mais longe da tela
    geo.Rr = Math.hypot(Math.max(geo.cx, geo.W - geo.cx), Math.max(geo.cy, geo.H - geo.cy));
    // o disco de laca passa um pouco do canto mais longe, para a borda nunca aparecer na tela cheia
    geo.RS = Math.ceil(geo.Rr * 2 * 1.02);
    head.style.setProperty("--RS", `${geo.RS}px`);
    // o trilho das bordas mora dentro da cabeça (abaixo dos ponteiros), mas cobre a tela inteira
    const edge = $("#heroEdge");
    edge.style.left = `${-head.offsetLeft}px`;
    edge.style.top = `${-head.offsetTop}px`;
    edge.style.width = `${geo.W}px`;
    edge.style.height = `${geo.H}px`;
    // em pé, os ponteiros e a data ficam maiores na tela cheia (--hs no CSS) e voltam ao tamanho do relógio no recuo
    geo.handS = parseFloat(getComputedStyle($("#heroPin")).getPropertyValue("--hs")) || 1;
    // em pé, a logo sobe para perto do 12 e cresce; no recuo ela volta ao lugar do mostrador redondo
    if (isMobile()) {
      const k = EDGE.m;
      const top = k.e + k.t + k.gap + k.L;
      const want = top + (geo.cy - top) * 0.42;
      geo.logoY = ((want - (geo.cy - 0.25 * geo.D)) * 1000) / geo.D;
      geo.logoS = Math.min(2.2, (geo.W * 0.4) / (0.245 * geo.D));
    } else {
      geo.logoY = 0;
      geo.logoS = 1;
    }
    return true;
  }

  // 0 = peças na posição da tela cheia, 1 = no mostrador redondo
  let placeT = 0;
  function placeParts(t = placeT) {
    placeT = t;
    const u = 1 - t;
    const y = geo.logoY * u;
    const k = 1 + (geo.logoS - 1) * u;
    // a logo escala em volta do próprio centro (transform-origin no CSS) e desloca na vertical
    $("#dialLogo").style.transform = `translate3d(0, ${((y * geo.D) / 1000).toFixed(2)}px, 0) scale(${k.toFixed(4)})`;
    const hk = (1 + (geo.handS - 1) * u).toFixed(4);
    $("#heroHands").style.transform = hk === "1.0000" ? "" : `scale(${hk})`;
    $("#dialDate").style.transform = hk === "1.0000" ? "" : `scale(${hk})`;
  }

  /** Trilho de minutos e índices aplicados correndo pelas bordas da tela, apontando para o eixo dos ponteiros.
      Cada grupo é um SVG pequeno e separado (trilho, os minutos de cada hora, cada índice, o 12 e o 6): na abertura eles
      entram um a um só com opacidade e escala, sem redesenhar a tela inteira a cada quadro. */
  function buildEdge() {
    const { W, H, cx, cy } = geo;
    if (!W || !H) return;
    const mobile = isMobile();
    // e: margem da borda · t: largura do trilho · gap: do trilho até os índices · L e bw: bastões
    const { e, t, gap, L, bw } = mobile ? EDGE.m : EDGE.d;
    const numerals = !mobile && W / H > 1.05;
    // ponto em que o raio do ângulo `deg` (0 = 12h) encontra o retângulo recuado `d` da borda
    const hit = (deg, d) => {
      const a = (deg * Math.PI) / 180;
      const dx = Math.sin(a), dy = -Math.cos(a);
      const tx = dx > 1e-6 ? (W - d - cx) / dx : dx < -1e-6 ? (d - cx) / dx : Infinity;
      const ty = dy > 1e-6 ? (H - d - cy) / dy : dy < -1e-6 ? (d - cy) / dy : Infinity;
      const k = Math.min(tx, ty);
      return [cx + dx * k, cy + dy * k];
    };
    const f = (n) => n.toFixed(1);
    // um SVG posicionado na tela, com o viewBox nas mesmas coordenadas da tela
    const part = (cls, x, y, w, h, inner) =>
      `<svg class="edge__part ${cls}" style="left:${f(x)}px;top:${f(y)}px;width:${f(w)}px;height:${f(h)}px" viewBox="${f(x)} ${f(y)} ${f(w)} ${f(h)}" aria-hidden="true">${inner}</svg>`;

    // trilho: duas linhas paralelas pelas bordas
    let s = part("edge__rails", 0, 0, W, H, `<defs>
      <linearGradient id="he-steel" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#8c6a2e"/><stop offset=".45" stop-color="#f5e1a8"/><stop offset=".55" stop-color="#d9b76f"/><stop offset="1" stop-color="#7e5d24"/>
      </linearGradient>
    </defs><g fill="none" stroke="${PRINT}" stroke-opacity=".45" stroke-width="1">
      <rect x="${e}" y="${e}" width="${f(W - 2 * e)}" height="${f(H - 2 * e)}"/>
      <rect x="${e + t}" y="${e + t}" width="${f(W - 2 * (e + t))}" height="${f(H - 2 * (e + t))}"/></g>`);

    // os minutos, em doze grupos (um por hora, no sentido horário a partir do 12)
    for (let h = 0; h < 12; h++) {
      let lines = "";
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let m = h * 5; m < h * 5 + 5; m++) {
        const five = m % 5 === 0;
        const [ax, ay] = hit(m * 6, e);
        const [bx, by] = hit(m * 6, e + t + (five ? 6 : 0));
        x0 = Math.min(x0, ax, bx); y0 = Math.min(y0, ay, by); x1 = Math.max(x1, ax, bx); y1 = Math.max(y1, ay, by);
        lines += `<line x1="${f(ax)}" y1="${f(ay)}" x2="${f(bx)}" y2="${f(by)}" stroke="${PRINT}" stroke-opacity="${five ? 0.95 : 0.7}" stroke-width="${five ? (mobile ? 2.4 : 3.2) : (mobile ? 1 : 1.4)}"/>`;
      }
      s += part("edge__ticks", x0 - 3, y0 - 3, x1 - x0 + 6, y1 - y0 + 6, lines);
    }

    // índices aplicados, como os do mostrador redondo; sem o 3 (data e coroa) e, no computador, sem 12 e 6 (números grandes).
    // Sombra: cópia escura deslocada para baixo (luz vindo de cima), sem filtro.
    const sh = mobile ? [1, 3] : [2, 5];
    for (let h = 0; h < 12; h++) {
      if (h === 3 || (numerals && (h === 0 || h === 6))) continue;
      const deg = h * 30;
      const [ox, oy] = hit(deg, e + t + gap);
      const a = (deg * Math.PI) / 180;
      const mx = ox - Math.sin(a) * (L / 2), my = oy + Math.cos(a) * (L / 2);
      const bar = (dx) => `<rect x="${f(mx - bw / 2 + dx)}" y="${f(my - L / 2)}" width="${bw}" height="${L}" rx="${bw / 4}" fill="#000" fill-opacity=".34" transform="translate(${sh[0]} ${sh[1]}) rotate(${deg} ${f(mx)} ${f(my)})"/>
        <rect x="${f(mx - bw / 2 + dx)}" y="${f(my - L / 2)}" width="${bw}" height="${L}" rx="${bw / 4}" fill="url(#he-steel)" transform="rotate(${deg} ${f(mx)} ${f(my)})"/>
        <rect class="lume" x="${f(mx - bw / 2 + bw * 0.27 + dx)}" y="${f(my - L / 2 + bw * 0.27)}" width="${f(bw * 0.46)}" height="${f(L - bw * 0.54)}" rx="${bw / 8}" fill="#eef3df" transform="rotate(${deg} ${f(mx)} ${f(my)})"/>`;
      // caixa do bastão girado (e do par, no 12), com folga para a sombra
      const hw = bw / 2 + (h === 0 ? bw * 0.85 : 0), hl = L / 2;
      const ex = Math.abs(hw * Math.cos(a)) + Math.abs(hl * Math.sin(a)) + 2;
      const ey = Math.abs(hw * Math.sin(a)) + Math.abs(hl * Math.cos(a)) + 2;
      s += part("edge__bt", mx - ex, my - ey, ex * 2 + sh[0], ey * 2 + sh[1], h === 0 ? bar(-bw * 0.85) + bar(bw * 0.85) : bar(0));
    }

    // 12 e 6 grandes, cortados pela borda da tela
    if (numerals) {
      const fs = H * 0.3;
      const num = (txt, base) => part("edge__num", cx - fs, base - fs * 0.85, fs * 2, fs, `<text x="${f(cx)}" y="${f(base)}" fill="${PRINT}" font-family="Saira, sans-serif" font-weight="200" font-stretch="125%" text-anchor="middle" font-size="${f(fs)}">${txt}</text>`);
      s += num("12", fs * 0.36) + num("6", H + fs * 0.34);
    }
    $("#heroEdge").innerHTML = s;
  }

  /** A laca pintada uma vez num canvas: o fumê (claro no meio, quase preto na borda) e os raios de sol, estrias finas e
      irregulares que somem perto do eixo. Fora do disco fica transparente: abrir e fechar o mostrador é só mudar a escala. */
  function paintField() {
    const c = $("#heroLacquer");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = Math.min(isMobile() ? 1536 : 2048, Math.max(512, Math.round(geo.RS * dpr)));
    if (c.width === N) return;
    c.width = N;
    c.height = N;
    drawLacquer(c.getContext("2d"), N);
  }

  /** A laca do mostrador vivo, num disco de N px: a mesma pintura da tela cheia e do relógio da vista explodida. */
  function drawLacquer(out, N) {
    const R = N / 2;
    // os raios vão num canvas à parte, para apagar o centro deles sem apagar a laca
    const rays = document.createElement("canvas");
    rays.width = N;
    rays.height = N;
    const ctx = rays.getContext("2d");
    ctx.save();
    ctx.translate(R, R);
    // ruído suave: estrias agrupadas, como a escovação de um mostrador de verdade
    let seed = 1974;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const n = 3600;
    const raw = Array.from({ length: n }, () => rnd() * 2 - 1);
    const val = raw.map((_, i) => (raw[(i - 1 + n) % n] + 2 * raw[i] + raw[(i + 1) % n]) / 4);
    const max = Math.max(...val.map(Math.abs));
    const step = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const v = val[i] / max;
      const a0 = i * step, a1 = a0 + step * 1.02;
      ctx.fillStyle = v > 0 ? `rgba(250, 238, 205, ${(v * 0.085).toFixed(3)})` : `rgba(6, 10, 4, ${(-v * 0.13).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a0) * R, Math.sin(a0) * R);
      ctx.lineTo(Math.cos(a1) * R, Math.sin(a1) * R);
      ctx.closePath();
      ctx.fill();
    }
    // some perto do eixo, onde as estrias se juntam
    ctx.globalCompositeOperation = "destination-in";
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.07, "rgba(0,0,0,0)");
    g.addColorStop(0.4, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = g;
    ctx.fillRect(-R, -R, N, N);
    ctx.restore();

    // a laca: os tons da casa (--lq-hi, --lq, --lq-lo), recortados no disco, e os raios por cima
    const tok = (name) => getComputedStyle(root).getPropertyValue(name).trim();
    const lq = tok("--lq"), lqHi = tok("--lq-hi"), lqLo = tok("--lq-lo");
    out.clearRect(0, 0, N, N);
    out.save();
    out.beginPath();
    out.arc(R, R, R, 0, Math.PI * 2);
    out.clip();
    const fume = out.createRadialGradient(R, R, 0, R, R, R);
    fume.addColorStop(0, lqHi);
    fume.addColorStop(0.3, lq);
    fume.addColorStop(0.62, Watch.mix(lq, lqLo, 0.55));
    fume.addColorStop(1, lqLo);
    out.fillStyle = fume;
    out.fillRect(0, 0, N, N);
    out.drawImage(rays, 0, 0);
    out.restore();
  }

  /** O reflexo dos raios de sol: dois feixes de luz opostos, pintados uma vez num canvas pequeno. Só ele gira. */
  function paintLight() {
    const c = $("#dialLight");
    if (c.dataset.painted) return;
    const ctx = c.getContext("2d");
    if (!ctx.createConicGradient) { c.hidden = true; return; }
    c.dataset.painted = "1";
    const R = c.width / 2;
    const g = ctx.createConicGradient(-Math.PI / 2, R, R); // 0° no 12, como um conic-gradient do CSS
    [[0, 0], [8, 0.05], [18, 0.13], [24, 0.17], [30, 0.13], [40, 0.05], [50, 0], [182, 0], [190, 0.04], [199, 0.1],
      [204, 0.12], [209, 0.1], [218, 0.04], [228, 0], [360, 0]].forEach(([deg, a]) => g.addColorStop(deg / 360, `rgba(250, 232, 190, ${a})`));
    ctx.beginPath();
    ctx.arc(R, R, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  function layoutHero() {
    if (!measureHero()) return;
    // o trilho só é redesenhado se a tela mudou (o ScrollTrigger recalcula no load, no meio da abertura)
    const key = [geo.W, geo.H, geo.cx, geo.cy, geo.D, isMobile()].join(":");
    if (key !== geo.key) {
      geo.key = key;
      buildEdge();
    }
    paintField();
    paintLight();
    placeParts();
  }

  // ponteiros: cada um é uma camada do tamanho do mostrador que gira em volta do centro
  const hands = {};
  function buildHands() {
    const box = "98 158 204 204";
    const svg = (inner, cls) => `<div class="hand ${cls}"><svg viewBox="${box}" aria-hidden="true">${inner}</svg></div>`;
    const c = HERO;
    const h = Watch.hand(c.handStyle, "h", c);
    const m = Watch.hand(c.handStyle, "m", c);
    const sec = Watch.secondHand(c);
    const cap = `<circle cx="200" cy="260" r="5" fill="${c.handColor}" stroke="${Watch.shade(c.handColor, -0.45)}" stroke-width=".7"/><circle cx="200" cy="260" r="2" fill="${c.secondColor}"/>`;
    $("#heroHands").innerHTML =
      svg(h, "hand--shadow hand--h") + svg(m, "hand--shadow hand--m") + svg(sec, "hand--shadow hand--s") +
      svg(h, "hand--h") + svg(m, "hand--m") + svg(sec + cap, "hand--s");
    ["h", "m", "s"].forEach((k) => { hands[k] = $$(`#heroHands .hand--${k}`); });
  }

  // relógio: a hora de quem visita, com o ponteiro de segundos deslizando sem parar (no movimento reduzido, um salto por segundo)
  const clock = { live: false, angles: { h: 0, m: 0, s: 0 }, last: { h: null, m: null, s: null } };
  function timeAngles(at = Date.now(), steps = reduce ? 1 : 0) {
    const t = new Date(at);
    let sec = t.getSeconds() + t.getMilliseconds() / 1000;
    if (steps) sec = Math.floor(sec * steps) / steps;
    const min = t.getMinutes() + sec / 60;
    const hr = (t.getHours() % 12) + min / 60;
    return { h: hr * 30, m: min * 6, s: sec * 6 };
  }
  function paintHands(a) {
    for (const k of ["h", "m", "s"]) {
      const v = a[k].toFixed(2);
      if (v === clock.last[k]) continue;
      clock.last[k] = v;
      hands[k].forEach((el) => { el.style.transform = `rotate(${v}deg)`; });
    }
  }
  /** Das 19h às 6h no relógio de quem visita, o lume acende. */
  let nightHour = -1;
  function setNight() {
    const h = new Date().getHours();
    if (h === nightHour) return;
    nightHour = h;
    $("#heroPin").classList.toggle("is-night", h >= 19 || h < 6);
  }
  function clockFrame() {
    if (!clock.live) return;
    // horas e minutos andam a cada segundo; o ponteiro de segundos desliza a cada quadro
    const now = Date.now();
    const a = timeAngles(now);
    const whole = timeAngles(now - (now % 1000), 1);
    paintHands({ h: whole.h, m: whole.m, s: a.s });
    const minute = Math.floor(now / 60000);
    if (minute !== clock.minute) { clock.minute = minute; setNight(); }
  }

  // luz dos raios de sol: segue o ponteiro do mouse; no celular, oscila devagar sozinha
  const light = { target: -30, cur: -30, el: null, last: "" };
  function lightFrame(now, dt) {
    if (!light.el) return;
    if (!fine) light.target = -30 + Math.sin(now / 2600) * 22;
    light.cur += (light.target - light.cur) * (1 - Math.exp(-dt * 4));
    const v = light.cur.toFixed(1);
    if (v !== light.last) { light.last = v; light.el.style.transform = `rotate(${v}deg)`; }
  }

  // ---------------------------------------------------------------------------
  // Abertura: o mostrador se monta no compasso
  // ---------------------------------------------------------------------------
  function introTimeline(mode) {
    const short = mode === "short";
    const today = new Date().getDate();
    const tl = gsap.timeline({ paused: true, defaults: { ease: OUT } });
    const ticks = $$("#heroEdge .edge__ticks");
    const batons = $$("#heroEdge .edge__bt");
    const nums = $$("#heroEdge .edge__num");
    const titleLines = $$("#heroTitle .hero__line");
    const dateState = { n: 1 };
    const sweep = { h: 0, m: 0, s: 0 };
    const sweepDur = short ? 0.75 : 1.25;
    const sweepAt = short ? 0.25 : 1.875;

    gsap.set(["#heroHead", "#heroEdge", "#heroCopy", "#heroCrown"], { autoAlpha: 1 });
    // a laca começa como uma gota no eixo dos ponteiros
    gsap.set("#heroPour", { scale: 0.02, autoAlpha: 0, force3D: true });
    gsap.set("#heroEdge .edge__rails", { autoAlpha: 0 });
    gsap.set(ticks, { autoAlpha: 0 });
    gsap.set(batons, { autoAlpha: 0, scale: 1.3, transformOrigin: "50% 50%" });
    // durante a abertura cada peça do trilho é uma camada própria; no fim elas voltam a ser um desenho só
    $("#heroEdge").classList.add("is-printing");
    if (nums[0]) gsap.set(nums[0], { autoAlpha: 0, yPercent: -24 });
    if (nums[1]) gsap.set(nums[1], { autoAlpha: 0, yPercent: 24 });
    gsap.set("#dialLogoArt", { autoAlpha: 0, y: 10 });
    gsap.set(titleLines, { autoAlpha: 0, yPercent: 40 });
    gsap.set(["#heroSub", "#heroHint"], { autoAlpha: 0, y: 12 });
    gsap.set("#heroCrown .crown__body", { autoAlpha: 0, x: 28 });
    gsap.set("#heroCrown .crown__label", { autoAlpha: 0, x: 12 });
    gsap.set("#dialDate", { autoAlpha: 0 });
    gsap.set("#heroHands", { autoAlpha: 0 });
    paintHands(sweep);
    setDate(1);

    if (short) {
      tl.to("#heroPour", { autoAlpha: 1, duration: 0.15, ease: "none" }, 0.05)
        .to("#heroPour", { scale: 1, duration: 0.8, ease: IN_OUT }, 0.05)
        .to("#heroEdge .edge__rails", { autoAlpha: 1, duration: 0.3, ease: "none" }, 0.15)
        .to(ticks, { autoAlpha: 1, duration: 0.3, stagger: 0.02, ease: "none" }, 0.2)
        .to(batons, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.02 }, 0.3)
        .to("#dialLogoArt", { autoAlpha: 1, y: 0, duration: 0.5 }, 0.4)
        .to("#dialDate", { autoAlpha: 1, duration: 0.3 }, 0.4)
        .to(dateState, { n: today, duration: 0.6, ease: "power2.inOut", onUpdate: () => setDate(dateState.n) }, 0.4);
    } else {
      // 1. a laca escorre do eixo dos ponteiros até cobrir a tela inteira
      tl.to("#heroPour", { autoAlpha: 1, duration: 0.2, ease: "none" }, 0.25)
        .to("#heroPour", { scale: 1, duration: 1.35, ease: IN_OUT }, 0.25)
        // 2. o trilho é impresso pelas bordas, no sentido horário, a partir do 12
        .to("#heroEdge .edge__rails", { autoAlpha: 1, duration: 0.5, ease: "none" }, 0.75)
        .to(ticks, { autoAlpha: 1, duration: 0.35, stagger: 0.075, ease: "none" }, 0.875)
        // 3. os índices descem no mostrador, meio compasso cada
        .to(batons, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: BEAT / 2 }, 1.125)
        // 4. a logo é impressa
        .to("#dialLogoArt", { autoAlpha: 1, y: 0, duration: 0.75 }, 1.625)
        // 5. a janela da data gira até hoje (é o contador da abertura)
        .to("#dialDate", { autoAlpha: 1, duration: 0.25 }, 1.375)
        .to(dateState, { n: today, duration: 1.25, ease: "power2.inOut", onUpdate: () => setDate(dateState.n) }, 1.5);
    }

    // o 12 e o 6 (só no computador) entram cortados pela borda
    if (nums.length) tl.to(nums, { autoAlpha: 1, yPercent: 0, duration: short ? 0.6 : 1.0, stagger: short ? 0 : BEAT }, short ? 0.3 : 1.25);

    // os ponteiros saem do meio-dia e acertam a hora de agora
    const endAt = (k) => () => timeAngles(Date.now() + sweepDur * 1000)[k];
    tl.to("#heroHands", { autoAlpha: 1, duration: 0.375, ease: "none" }, sweepAt - 0.25);
    tl.to(sweep, {
      h: endAt("h"), m: endAt("m"), s: endAt("s"), duration: sweepDur, ease: IN_OUT,
      onUpdate: () => paintHands(sweep),
      onComplete: () => { clock.live = true; },
    }, sweepAt);

    // texto impresso no mostrador e, por último, a coroa (o cabeçalho só aparece quando a pessoa rolar)
    const textAt = short ? 0.375 : 2.5;
    const k = short ? 0.625 : 1;
    tl.to(titleLines, { autoAlpha: 1, yPercent: 0, duration: 1.0 * k, stagger: BEAT }, textAt)
      .to(["#heroSub", "#heroHint"], { autoAlpha: 1, y: 0, duration: 0.75 * k, stagger: BEAT * 2 }, textAt + 0.375 * k)
      .to(["#heroCrown .crown__body", "#heroCrown .crown__label"], { autoAlpha: 1, x: 0, duration: 0.9 * k, stagger: BEAT }, textAt + 0.5 * k);
    return tl;
  }

  function runIntro() {
    const mode = root.dataset.intro;
    if (!motion || (mode !== "on" && mode !== "short")) {
      clock.live = true;
      finishIntro();
      return;
    }
    try { sessionStorage.setItem("ct-intro", "1"); } catch { /* sem armazenamento */ }
    // a rolagem não é travada: travar esconde a barra de rolagem e muda a largura da página. Rolar só acelera a abertura
    // (a abertura e o recuo mexem em camadas diferentes, então os dois podem acontecer juntos).
    const tl = introTimeline(mode);
    tl.eventCallback("onComplete", finishIntro);
    // pular: um toque, um clique, uma tecla ou a tentativa de rolar aceleram o resto da abertura
    const events = ["pointerdown", "keydown", "wheel", "touchmove"];
    const skip = (e) => {
      if (introDone || (e.type === "keydown" && e.key === "Tab")) return;
      tl.timeScale(5);
      events.forEach((ev) => window.removeEventListener(ev, skip));
    };
    events.forEach((ev) => window.addEventListener(ev, skip, { passive: true }));
    // espera as fontes (no máximo um instante) para o texto não pular no meio do desenho; recalcula as posições da
    // rolagem antes de começar (nada se move ainda) e dá dois quadros para as camadas ficarem prontas
    const fonts = document.fonts?.ready || Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(() => {
      ScrollTrigger.refresh();
      // durante a abertura, um quadro atrasado faz a animação esperar em vez de pular
      gsap.ticker.lagSmoothing(120, 33);
      requestAnimationFrame(() => requestAnimationFrame(() => tl.play()));
    });
  }

  // o load não recalcula a rolagem no meio da abertura: fica para depois dela, num momento ocioso
  let refreshAfterIntro = false;
  const refreshWhenIdle = () => {
    if (!hasG) return;
    if (window.requestIdleCallback) requestIdleCallback(() => ScrollTrigger.refresh(), { timeout: 1500 });
    else setTimeout(() => ScrollTrigger.refresh(), 300);
  };
  window.addEventListener("load", () => {
    if (introDone) refreshWhenIdle();
    else refreshAfterIntro = true;
  });

  function finishIntro() {
    if (introDone) return;
    introDone = true;
    clock.live = true;
    root.dataset.intro = "done";
    if (hasG) {
      gsap.set(["#heroHead", "#heroEdge", "#heroCopy", "#heroHint", "#heroCrown", "#heroSub", "#dialDate", "#heroHands"], { clearProps: "opacity,visibility" });
      // as partes da coroa voltam para o CSS (o passar do mouse puxa a coroa)
      gsap.set(["#heroCrown .crown__body", "#heroCrown .crown__label"], { clearProps: "all" });
    }
    $("#heroEdge").classList.remove("is-printing");
    lenis?.start();
    if (hasG) gsap.ticker.lagSmoothing(0);
    if (refreshAfterIntro) refreshWhenIdle();
  }

  // ---------------------------------------------------------------------------
  // Ao rolar: o mostrador se afasta, vira o relógio inteiro e se desmonta
  // ---------------------------------------------------------------------------
  // Vista explodida num eixo só, como um desenho técnico: cada peça sobe na sua altura (level),
  // as metades da pulseira se afastam (dy) e algumas giram um pouco (rot). Medidas para 330 px de largura.
  const HERO_MOTION = {
    "pulseira": { level: 0, dy: -40, rot: 0, half: 0.16 },
    "pulseira-baixo": { level: 0, dy: 40, rot: 0, baseY: 185, half: 0.16 },
    "movimento": { level: 1, dy: 0, rot: -40, half: 0.27 },
    "caixa": { level: 2, dy: 0, rot: 0, half: 0.37 },
    "mostrador": { level: 3, dy: 0, rot: 0, half: 0.26 },
    "ponteiros": { level: 4, dy: 0, rot: 0, half: 0.2 },
    "luneta": { level: 5, dy: 0, rot: 45, half: 0.33 },
    "cristal": { level: 6, dy: 0, rot: 0, half: 0.3 },
  };

  const anatomy = { target: 0, cur: 0, layers: [], stack: null, isolated: null, captionKey: "", active: true };

  function initAnatomy() {
    const stack = $("#heroStack");
    anatomy.stack = stack;
    // o mostrador do relógio redondo é a mesma laca da tela cheia: a cor não muda na troca
    const lac = document.createElement("canvas");
    lac.width = lac.height = 720;
    drawLacquer(lac.getContext("2d"), 720);
    HERO.dialImage = lac.toDataURL("image/webp", 0.92);
    renderStack(stack, HERO);
    Clockwork.add(new Movement(stack, HERO));
    anatomy.layers = $$(".layer", stack).map((el) => ({ el, m: HERO_MOTION[el.dataset.name] }));
    // as legendas ficam em volta do relógio, alternando os lados
    $$("#heroCallouts li").forEach((li, i) => { li.dataset.side = i % 2 ? "l" : "r"; });

    // passar o mouse numa legenda isola a peça e apaga as outras
    if (fine) {
      $$("#heroCallouts li").forEach((li) => {
        li.addEventListener("pointerenter", () => isolate(li.dataset.name));
        li.addEventListener("pointerleave", () => isolate(null));
      });
    }
  }
  function isolate(name) {
    anatomy.isolated = name;
    anatomy.stack.classList.toggle("is-isolating", !!name);
    anatomy.layers.forEach(({ el }) => {
      const on = !!name && (el.dataset.name === name || (name === "pulseira" && el.dataset.name === "pulseira-baixo"));
      el.classList.toggle("is-focus", on);
    });
    $$("#heroCallouts li").forEach((li) => li.classList.toggle("is-focus", li.dataset.name === name));
  }

  function anatomyFrame(now, dt) {
    const stack = anatomy.stack;
    // parado (movimento reduzido ou sem bibliotecas), o relógio fica inteiro e as legendas viram lista
    if (!motion || !stack || !anatomy.active || stack.offsetParent === null) return;
    anatomy.cur += (anatomy.target - anatomy.cur) * (1 - Math.exp(-dt * 6));
    const cur = anatomy.cur;
    const e = smooth(clamp01(cur));
    const mobile = isMobile();
    const t = now / 1000;
    const W = stack.offsetWidth;
    const k = W / 330;
    const gap = (mobile ? 50 : 64) * k;
    const tilt = 58 * e;
    const spin = -14 * e - 10 * cur;
    const sinT = Math.sin((tilt * Math.PI) / 180);
    const cosT = Math.cos((tilt * Math.PI) / 180);
    const lift = 2.6 * gap * sinT * 0.92;
    stack.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    stack.style.setProperty("--spin", `${spin.toFixed(2)}deg`);
    stack.style.setProperty("--lift", `${lift.toFixed(1)}px`);

    const pos = {};
    for (const { el, m } of anatomy.layers) {
      // as peças de cima saem primeiro
      const ei = smooth(clamp01((e - (6 - m.level) * 0.055) / 0.67));
      const breathe = Math.sin(t * 1.3 + m.level * 0.9) * 4 * ei;
      const z = m.level * gap * ei + breathe;
      const y = m.dy * k * ei;
      el.style.transform = `translate3d(0px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${(m.rot * ei).toFixed(1)}deg)`;
      pos[m.level === 0 ? (m.baseY ? 0 : -1) : m.level] = { y: y + (m.baseY || 0) * (W / 400), z, half: m.half };
    }

    const callouts = $$("#heroCallouts li");
    if (mobile) {
      // uma legenda por vez, embaixo, com a última peça que se soltou
      let shown = null;
      callouts.forEach((li, idx) => { if (e > 0.12 + idx * 0.11) shown = li; });
      const key = shown ? shown.dataset.layer : "";
      if (key !== anatomy.captionKey) {
        anatomy.captionKey = key;
        const cap = $("#partCaption");
        cap.classList.toggle("is-on", !!shown);
        if (shown) cap.innerHTML = shown.innerHTML;
      }
      return;
    }
    // cada legenda fica na altura da sua peça, de um lado ou do outro, com o fio até a borda dela
    const stage = $("#heroStage");
    const sr = stage.getBoundingClientRect();
    const scene = $("#heroScene").getBoundingClientRect();
    const cx = scene.left + scene.width / 2 - sr.left;
    const cy = scene.top + scene.height / 2 - sr.top + lift;
    const reach = W * 0.46 + 28;
    const prev = { l: -Infinity, r: -Infinity };
    callouts.forEach((li, idx) => {
      const p = pos[+li.dataset.layer];
      if (!p) return;
      const side = li.dataset.side;
      const yScreen = Math.max(cy + p.y * cosT - p.z * sinT, prev[side] + 58);
      prev[side] = yScreen;
      li.style.transform = `translate3d(0, ${(yScreen - 14).toFixed(1)}px, 0)`;
      // lado e comprimento do fio só mudam quando a tela muda de tamanho
      const x = side === "r" ? `${(cx + reach).toFixed(1)}px` : `${(sr.width - cx + reach).toFixed(1)}px`;
      const lead = `${Math.max(16, reach - p.half * W - 10).toFixed(1)}px`;
      if (li._x !== x) { li._x = x; li.style[side === "r" ? "left" : "right"] = x; }
      if (li._lead !== lead) { li._lead = lead; li.style.setProperty("--lead", lead); }
      li.classList.toggle("is-on", e > 0.26 + idx * 0.045);
    });
  }

  /** Onde o mostrador do relógio da vista explodida está na tela, para o mostrador pousar nele. */
  function pullTarget() {
    const head = $("#heroHead");
    const stack = anatomy.stack;
    const sw = stack.offsetWidth;
    const sh = stack.offsetHeight;
    // posição do relógio sem nenhuma transformação (vista de frente)
    let el = stack, left = 0, top = 0;
    while (el && el !== $("#heroPin")) { left += el.offsetLeft; top += el.offsetTop; el = el.offsetParent; }
    const dialD = sw * (204 / 400);
    const hx = head.offsetLeft + head.offsetWidth / 2;
    const hy = head.offsetTop + head.offsetHeight / 2;
    return { x: left + sw / 2 - hx, y: top + sh / 2 - hy, k: dialD / geo.D };
  }

  let bezelClicks = 0;
  function initScroll() {
    if (!motion) {
      $("#viewHome").classList.add("home--static");
      anatomy.target = 0;
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    let target = pullTarget();
    const lg = { t: 0 };
    // 1. a laca que cobria a tela se fecha num círculo; o trilho e os índices das bordas somem, os do
    //    mostrador redondo aparecem, a logo volta ao lugar e a luneta e a caixa crescem em volta: vira um relógio
    tl.to("#heroCopy", { autoAlpha: 0, y: -30, duration: 0.08 }, 0.01)
      .to("#heroCrown", { autoAlpha: 0, x: 30, duration: 0.06 }, 0.01)
      .to("#heroEdge", { autoAlpha: 0, duration: 0.08 }, 0.03)
      .fromTo("#heroField", { scale: 1 }, { scale: () => geo.D / geo.RS, duration: 0.15, ease: "power2.inOut" }, 0.02)
      .fromTo(lg, { t: 0 }, { t: 1, duration: 0.15, ease: "power2.inOut", onUpdate: () => placeParts(lg.t) }, 0.02)
      .fromTo([".dial__rim", "#dialPrint .print__track", "#dialPrint .print__indices"], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06 }, 0.1)
      .fromTo([".head__case", "#heroBezel"], { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 0.08, ease: "power2.out" }, 0.11)
      // 2. o relógio inteiro vai até o lugar da vista explodida
      .to("#heroHead", { x: () => target.x, y: () => target.y, scale: () => target.k, duration: 0.14, ease: "power2.inOut" }, 0.17)
      .to(".head__case", { autoAlpha: 0, duration: 0.05 }, 0.26)
      .fromTo("#heroStage", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0.27)
      .to("#heroHead", { autoAlpha: 0, duration: 0.04 }, 0.31)
      .fromTo("#anatomyText", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.33)
      .to({}, { duration: 0.55 }, 0.45);

    heroST = ScrollTrigger.create({
      animation: tl,
      trigger: "#topo",
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * (isMobile() ? 2.6 : 3.2))}`,
      pin: "#heroPin",
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // medidas novas antes de o ScrollTrigger recalcular (mudou o tamanho da tela, voltou do ateliê)
      onRefreshInit: () => {
        gsap.set("#heroHead", { x: 0, y: 0, scale: 1 });
        layoutHero();
        target = pullTarget();
      },
      onToggle: (self) => { anatomy.active = self.isActive || self.progress < 1; },
      onUpdate: (self) => {
        const p = self.progress;
        anatomy.target = clamp01((p - 0.34) / 0.56);
        // a luneta gira em cliques de meio minuto enquanto o mostrador vira relógio
        const clicks = Math.round(clamp01((p - 0.1) / 0.2) * 20);
        if (clicks !== bezelClicks) {
          bezelClicks = clicks;
          $("#heroBezelRing").style.transform = `rotate(${(20 - clicks) * 3}deg)`;
        }
        $("#masthead").classList.toggle("is-past-hero", p > 0.3);
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Cor livre
  // ---------------------------------------------------------------------------
  const LACQUERS = [
    ["Verde musgo", "#46603a"],
    ["Verde fumê", "#2f6e5a"],
    ["Chocolate", "#4a3326"],
    ["Laca negra", "#18191c"],
    ["Vinho", "#5c1d27"],
    ["Azul mergulho", "#1d4e8f"],
    ["Salmão", "#e0a68a"],
    ["Laranja queimado", "#c25e1f"],
  ];
  const colors = { current: LACQUERS[0][1], name: LACQUERS[0][0], auto: true, timer: null, mv: null, pending: false };

  function colorCfg(hex) {
    // mostrador escuro: índices e ponteiros dourados com lume; claro: tinta de nogueira. Caixa de bronze.
    const dark = readableOn(hex) === "#e6e9ee";
    return {
      ...DEFAULT_WATCH, caseShape: "redonda", caseColor: "#b48a58", dialColor: hex, dialFume: true, dialFinish: "raios",
      dialLayout: "data", indexStyle: "bastao", indexColor: dark ? "#dcc081" : "#2a2119", lume: dark,
      handStyle: "dauphine", handColor: dark ? "#dcc081" : "#2a2119", secondColor: "#d9b25f", secondStyle: "agulha",
      bezelType: "lisa", strapType: "couro", strapColor: "#2b1d16", stitchColor: "#cbb8a2", movement: "automatico",
    };
  }
  const colorCache = new Map();
  function paintColor(hex, name, live = false) {
    colors.current = hex;
    colors.name = name;
    $("#colorName").textContent = name;
    $("#colorHex").textContent = hex.toUpperCase();
    $$("#colorChips button").forEach((bt) => bt.setAttribute("aria-pressed", String(bt.dataset.hex === hex)));
    colors.live = live;
    if (colors.pending) return;
    colors.pending = true;
    requestAnimationFrame(() => {
      colors.pending = false;
      const hex2 = colors.current;
      const fade = motion && !colors.live;
      // fundo: duas camadas que se alternam; no arraste do seletor a camada de cima muda direto
      const sec = $("#cores");
      const grounds = $$(".colors__bg", sec);
      let on = grounds.find((g) => g.classList.contains("is-on")) || grounds[0];
      const next = fade ? grounds.find((g) => g !== on) : on;
      next.style.setProperty("--cq", Watch.mix(hex2, "#090e08", 0.8));
      next.style.setProperty("--cq-hi", Watch.mix(hex2, "#090e08", 0.45));
      if (next !== on) { next.classList.add("is-on"); on.classList.remove("is-on"); } else next.classList.add("is-on");
      // relógio: a troca por opacidade só nas cores escolhidas; no arraste a única camada é redesenhada
      const host = $("#colorWatch");
      const cfg = colorCfg(hex2);
      let svg = colorCache.get(hex2);
      if (!svg) { svg = Watch.front(cfg, "Relógio com mostrador " + colors.name); if (colorCache.size > 24) colorCache.clear(); colorCache.set(hex2, svg); }
      const layers = $$(".colors__layer", host);
      if (!fade) {
        layers.slice(1).forEach((l) => l.remove());
        let only = layers[0];
        if (!only) { only = document.createElement("div"); only.className = "colors__layer"; host.appendChild(only); }
        gsap.killTweensOf(only);
        only.style.opacity = "";
        only.style.visibility = "";
        only.innerHTML = svg;
      } else {
        // uma troca em andamento termina na hora: nunca ficam mais de duas camadas
        layers.slice(0, -1).forEach((l) => { gsap.killTweensOf(l); l.remove(); });
        const top = $$(".colors__layer", host)[0];
        const el = document.createElement("div");
        el.className = "colors__layer";
        el.innerHTML = svg;
        host.appendChild(el);
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none", onComplete: () => top?.remove() });
      }
      if (!colors.mv) colors.mv = Clockwork.add(new Movement(host, cfg));
      colors.mv.setConfig(cfg);
    });
  }
  function initColors() {
    $("#colorChips").innerHTML = LACQUERS.map(([name, hex]) =>
      `<button type="button" data-hex="${hex}" data-name="${name}" aria-pressed="false" style="--chip:${hex}"><span class="chip__dot"></span><span class="chip__name">${name}</span></button>`).join("");
    paintColor(LACQUERS[0][1], LACQUERS[0][0]);
    const stopAuto = () => { colors.auto = false; clearInterval(colors.timer); };
    $("#colorChips").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-hex]");
      if (!b) return;
      stopAuto();
      paintColor(b.dataset.hex, b.dataset.name);
    });
    const hue = $("#colorHue");
    hue.addEventListener("input", () => {
      stopAuto();
      const hex = hslHex(+hue.value, 52, 34);
      paintColor(hex, "Seu tom", true);
    });
    $("#colorsCta").addEventListener("click", () => {
      Studio.apply({ dialColor: colors.current }, "mostrador", "Cor do mostrador aplicada");
    });
    // demonstração: enquanto ninguém mexe, as lacas se alternam sozinhas
    if (!reduce && "IntersectionObserver" in window) {
      let i = 0;
      new IntersectionObserver(([entry]) => {
        clearInterval(colors.timer);
        if (!entry.isIntersecting || !colors.auto) return;
        colors.timer = setInterval(() => {
          if (document.hidden || !colors.auto) return;
          i = (i + 1) % LACQUERS.length;
          paintColor(LACQUERS[i][1], LACQUERS[i][0]);
        }, 2400);
      }, { threshold: 0.35 }).observe($("#cores"));
    }
  }

  // ---------------------------------------------------------------------------
  // Ponteiros: um mostrador de amostra
  // ---------------------------------------------------------------------------
  const specimen = { style: "espada", color: "#5a3a1e", angles: { h: 304, m: 48 } };
  function specimenSvg(style, color) {
    const c = { ...DEFAULT_WATCH, handColor: color, lume: false, handStyle: style };
    let ticks = "";
    for (let m = 0; m < 60; m++) {
      const [x1, y1] = [200 + Math.sin((m * 6 * Math.PI) / 180) * 98, 260 - Math.cos((m * 6 * Math.PI) / 180) * 98];
      const r2 = m % 5 === 0 ? 86 : 93;
      const [x2, y2] = [200 + Math.sin((m * 6 * Math.PI) / 180) * r2, 260 - Math.cos((m * 6 * Math.PI) / 180) * r2];
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2a2119" stroke-opacity="${m % 5 === 0 ? 0.8 : 0.35}" stroke-width="${m % 5 === 0 ? 2 : 0.8}"/>`;
    }
    return `<svg viewBox="96 156 208 208" role="img" aria-label="Ponteiros estilo ${style}">
      <defs><radialGradient id="sp-dial" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#f6f1e4"/><stop offset=".7" stop-color="#e6dcc7"/><stop offset="1" stop-color="#d3c6aa"/></radialGradient></defs>
      <circle cx="200" cy="260" r="102" fill="url(#sp-dial)"/>${ticks}
      ${Watch.mark(200, 214, 46, "#2a2119")}
      <g class="sp-h">${Watch.hand(style, "h", c)}</g>
      <g class="sp-m">${Watch.hand(style, "m", c)}</g>
      <circle cx="200" cy="260" r="5" fill="${color}"/><circle cx="200" cy="260" r="1.8" fill="#f6f1e4"/>
    </svg>`;
  }
  function paintSpecimen(animate) {
    const h = HAND_STYLES.find((x) => x.id === specimen.style);
    const host = $("#specimenDial");
    host.innerHTML = specimenSvg(specimen.style, specimen.color);
    $("#specimenName").textContent = h.name;
    $("#specimenDesc").textContent = h.desc;
    $$("#handList button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.style === specimen.style)));
    const gh = $(".sp-h", host), gm = $(".sp-m", host);
    if (animate && motion) {
      // troca de ponteiro: o minuto dá uma volta inteira e o conjunto pousa de novo em 10:08
      // o ângulo é animado num objeto e gravado direto no atributo: o pivô fica sempre no centro do mostrador
      const spin = (g, from, to) => {
        const a = { v: from };
        g.setAttribute("transform", `rotate(${from} 200 260)`);
        gsap.to(a, { v: to, duration: 1.0, ease: OUT, onUpdate: () => g.setAttribute("transform", `rotate(${a.v.toFixed(2)} 200 260)`) });
      };
      spin(gm, specimen.angles.m - 360, specimen.angles.m);
      spin(gh, specimen.angles.h - 30, specimen.angles.h);
    } else {
      gh.setAttribute("transform", `rotate(${specimen.angles.h} 200 260)`);
      gm.setAttribute("transform", `rotate(${specimen.angles.m} 200 260)`);
    }
  }
  function initHands() {
    $("#handList").innerHTML = HAND_STYLES.map((h) =>
      `<button type="button" data-style="${h.id}" aria-pressed="false"><span class="hand-opt__icon">${Watch.handIcon(h.id, PRINT)}</span><span>${h.name}</span></button>`).join("");
    $("#handList").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-style]");
      if (!b || b.dataset.style === specimen.style) return;
      specimen.style = b.dataset.style;
      paintSpecimen(true);
    });
    const hue = $("#handHue");
    hue.addEventListener("input", () => {
      specimen.color = hslHex(+hue.value, 55, 30);
      paintSpecimen(false);
    });
    specimen.color = hslHex(+hue.value, 55, 30);
    paintSpecimen(false);
    $("#handsCta").addEventListener("click", () => {
      Studio.apply({ handStyle: specimen.style, handColor: specimen.color }, "ponteiros", "Ponteiro escolhido no ateliê");
    });
  }

  // ---------------------------------------------------------------------------
  // Da bancada: as peças montadas no ateliê (à venda ou ponto de partida) e o detalhe ampliado
  // ---------------------------------------------------------------------------
  function initPieces() {
    $("#saleGrid").innerHTML = PORTFOLIO.map((p, i) => {
      const forSale = !!p.price;
      const [cur, value] = forSale ? brl.format(p.price).split(/\s+/) : [];
      return `
      <article class="sale__item${i % 2 ? " sale__item--flip" : ""}${forSale ? "" : " sale__item--base"}">
        <button class="sale__img" type="button" data-open="${p.id}" aria-label="Ver ${p.name} em detalhe"><img src="${p.img}" alt="${p.name}" loading="lazy" width="900" height="900" /><span class="sale__tag${forSale ? "" : " sale__tag--base"}">${forSale ? "Disponível" : "Portfólio"}</span></button>
        <div class="sale__info">
          <h3>${p.name}</h3>
          <p class="sale__text">${p.text}</p>
          <ul class="spec">${p.spec.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("")}</ul>
          ${forSale ? `<p class="sale__price"><span>${cur}</span>${value}</p>` : ""}
          <div class="sale__actions">
            ${forSale
              ? `<a class="btn" href="${buyUrl(p)}" target="_blank" rel="noopener">Comprar pelo WhatsApp</a>
            <button class="link-arrow" type="button" data-open="${p.id}">Ver em detalhe<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></button>`
              : `<a class="link-arrow" href="#personalizar" data-start="${p.id}">Começar com esta base<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-arrow" /></svg></a>`}
          </div>
        </div>
      </article>`;
    }).join("");

    const startFrom = (p) => Studio.apply({ ...DEFAULT_WATCH, ...p.cfg }, "caixa", `Projeto iniciado a partir do ${p.name}`);
    const lb = $("#lightbox");
    let current = null;
    let lastFocus = null;
    const open = (p) => {
      current = p;
      lastFocus = document.activeElement;
      // a situação da peça vai na foto, como na lista (nunca como sobretítulo)
      $("#lbMedia").innerHTML = `<img src="${p.img}" alt="${p.name}" width="900" height="900" /><span class="sale__tag${p.price ? "" : " sale__tag--base"}">${p.price ? "Disponível" : "Portfólio"}</span>`;
      $("#lbTitle").textContent = p.name;
      $("#lbText").textContent = p.text;
      $("#lbSpec").innerHTML = p.spec.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("");
      $("#lbPrice").hidden = !p.price;
      $("#lbBuy").hidden = !p.price;
      if (p.price) {
        $("#lbPrice").textContent = brl.format(p.price);
        $("#lbBuy").href = buyUrl(p);
      }
      $("#lbStart").textContent = p.price ? "Montar um parecido" : "Começar com esta base";
      $("#lbStart").classList.toggle("btn--line", !!p.price);
      lb.hidden = false;
      lenis?.stop();
      (p.price ? $("#lbBuy") : $("#lbStart")).focus();
    };
    const close = () => {
      lb.hidden = true;
      current = null;
      lenis?.start();
      lastFocus?.focus?.();
    };
    $("#saleGrid").addEventListener("click", (e) => {
      const start = e.target.closest("[data-start]");
      if (start) {
        const p = PORTFOLIO.find((x) => x.id === start.dataset.start);
        if (p) startFrom(p);
        return;
      }
      const b = e.target.closest("[data-open]");
      const p = b && PORTFOLIO.find((x) => x.id === b.dataset.open);
      if (p) open(p);
    });
    $$("[data-close]", lb).forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
    $("#lbStart").addEventListener("click", () => {
      if (current) startFrom(current);
      close();
    });
  }

  // ---------------------------------------------------------------------------
  // Na bancada: a foto do movimento aparece por uma lupa que se abre até tomar a tela
  // ---------------------------------------------------------------------------
  function initLoupe() {
    if (!motion) return;
    const pin = $("#loupePin");
    const ring = $("#loupeRing");
    const img = $("#loupeFrame img");
    const lens = { r: 0 };
    // raio que cobre a tela inteira a partir do centro da lupa (51% 45%)
    const full = () => Math.hypot(Math.max(0.51, 0.49) * pin.clientWidth, Math.max(0.45, 0.55) * pin.clientHeight) + 40;
    const start = () => Math.min(pin.clientWidth, pin.clientHeight) * 0.2;
    const paint = () => {
      pin.style.setProperty("--r", lens.r.toFixed(1));
      ring.style.transform = `scale(${(lens.r / 100).toFixed(4)})`;
    };
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.fromTo(lens, { r: start }, { r: full, duration: 1, ease: "power2.in", onUpdate: paint }, 0)
      .fromTo(ring, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.15 }, 0.85)
      .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1, ease: "power1.out" }, 0)
      .fromTo("#loupeCaption", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: OUT }, 0.75)
      .to({}, { duration: 0.25 }, 1);
    ScrollTrigger.create({
      animation: tl,
      trigger: "#bancada",
      start: "top top",
      end: () => `+=${Math.round(window.innerHeight * 1.2)}`,
      pin: pin,
      scrub: 0.6,
      invalidateOnRefresh: true,
    });
    paint();
  }

  // ---------------------------------------------------------------------------
  // O filme: horizontal no computador, em pé no celular. Só carrega perto da tela e só roda enquanto aparece.
  // ---------------------------------------------------------------------------
  function initFilm() {
    const sec = $("#filme");
    if (!sec) return;
    const pin = $("#filmPin");
    const win = $("#filmWindow");
    const video = $("#filmVideo");
    const toggle = $("#filmToggle");
    const tall = () => pin.clientWidth / pin.clientHeight < 0.9;
    let kind = "";
    let near = false;
    let inView = false;
    // movimento reduzido: o filme não começa sozinho, só com o botão
    let userPaused = !motion;
    const pick = () => {
      const want = tall() ? "port" : "land";
      if (want === kind) return;
      kind = want;
      video.poster = video.dataset[`${want}Poster`];
      if (!near) return;
      const t = video.currentTime || 0;
      // VP9 (WebM) primeiro, que é mais leve; H.264 (MP4) para quem não tem VP9
      const base = video.dataset[want];
      video.innerHTML = `<source src="${base}.webm" type='video/webm; codecs="vp9"' /><source src="${base}.mp4" type='video/mp4; codecs="avc1.640028"' />`;
      video.muted = true;
      video.load();
      if (t) video.addEventListener("loadedmetadata", () => { try { video.currentTime = t % (video.duration || 1); } catch (e) {} }, { once: true });
      sync();
    };
    const label = () => {
      const paused = video.paused || userPaused;
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", paused ? "Assistir ao filme" : "Pausar o filme");
      $(".film__toggle-txt", toggle).textContent = paused ? "Assistir" : "Pausar";
    };
    const sync = () => {
      if (inView && !userPaused) video.play().catch(() => {}).then(label);
      else video.pause();
      label();
    };
    // carrega quando falta uma tela e meia para chegar; toca só com o filme na tela
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || near) return;
      near = true;
      kind = "";
      pick();
    }, { rootMargin: "150% 0px" }).observe(sec);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }, { threshold: 0.15 }).observe(pin);
    document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); else sync(); });
    video.addEventListener("pause", label);
    video.addEventListener("play", label);
    toggle.addEventListener("click", () => {
      userPaused = !(video.paused || userPaused);
      if (!userPaused && !near) { near = true; kind = ""; pick(); }
      if (!userPaused) inView = true;
      sync();
    });
    $("#filmOpen").addEventListener("click", () => $('#saleGrid [data-open="carbon"]')?.click());
    let rt = 0;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(pick, 200); });
    kind = "";
    pick();
    label();

    if (!motion) return;
    // Como as grandes marcas mostram os seus filmes: em tela cheia, sem segurar a rolagem. Na primeira chegada o
    // filme acende a partir do escuro, assentando de leve, e o texto sobe logo depois; enquanto a página passa,
    // o filme corre um pouco mais devagar que ela (paralaxe suave, presa à rolagem, então nunca pula).
    gsap.set(video, { scale: 1.1 });
    gsap.fromTo(video, { yPercent: -4 }, {
      yPercent: 4, ease: "none",
      scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true },
    });
    const copy = [$(".film__kicker", sec), $("#filmCopy p:not(.film__kicker)"), $("#filmOpen")];
    const reveal = gsap.timeline({ paused: true });
    reveal.fromTo(video, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.3, ease: "power2.out" }, 0)
      .fromTo(video, { scale: 1.18 }, { scale: 1.1, duration: 2, ease: OUT }, 0)
      .fromTo("#filmCopy", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.6)
      .fromTo(".film__line > span", { yPercent: 105 }, { yPercent: 0, duration: 0.9, ease: OUT }, 0.68)
      .fromTo(copy, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: OUT, stagger: 0.08 }, 0.62)
      .fromTo(toggle, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "none" }, 1);
    ScrollTrigger.create({ trigger: sec, start: "top 70%", once: true, onEnter: () => reveal.play() });
  }

  // ---------------------------------------------------------------------------
  // Menu: os itens são horas; o ponteiro aponta para onde você vai
  // ---------------------------------------------------------------------------
  function initMenu() {
    const menu = $("#menu");
    const btn = $("#menuBtn");
    const dial = $("#menuDial");
    let ticks = "";
    for (let m = 0; m < 60; m++) {
      const [x1, y1] = polar(96, m * 6);
      const [x2, y2] = polar(m % 5 === 0 ? 84 : 90, m * 6);
      ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-opacity="${m % 5 === 0 ? 0.9 : 0.4}" stroke-width="${m % 5 === 0 ? 2.2 : 1}"/>`;
    }
    dial.innerHTML = `<circle r="99" fill="none" stroke="currentColor" stroke-opacity=".25"/>${ticks}
      <g class="md-h"><path d="M-2.6 6 L-2.6 -46 L0 -54 L2.6 -46 L2.6 6Z" fill="currentColor"/></g>
      <g class="md-m"><path d="M-1.6 8 L-1.6 -74 L0 -82 L1.6 -74 L1.6 8Z" fill="currentColor"/></g>
      <circle r="4.5" fill="var(--second)"/>`;
    const mh = $(".md-m", dial), hh = $(".md-h", dial);
    const point = (hour) => {
      const a = hour == null ? timeAngles() : { m: hour * 30, h: hour * 30 - 8 };
      if (motion) {
        gsap.to(mh, { rotation: a.m, duration: 0.5, ease: OUT, svgOrigin: "0 0", overwrite: true });
        gsap.to(hh, { rotation: a.h, duration: 0.5, ease: OUT, svgOrigin: "0 0", overwrite: true });
      } else {
        mh.setAttribute("transform", `rotate(${a.m})`);
        hh.setAttribute("transform", `rotate(${a.h})`);
      }
    };
    $$("#menuList a").forEach((a) => {
      a.addEventListener("pointerenter", () => point(+a.dataset.hour));
      a.addEventListener("focus", () => point(+a.dataset.hour));
    });
    $("#menuList").addEventListener("pointerleave", () => point(null));

    const set = (open) => {
      btn.setAttribute("aria-expanded", String(open));
      $("#masthead").classList.toggle("is-menu", open);
      if (open) {
        menu.hidden = false;
        point(null);
        lenis?.stop();
        if (motion) {
          const r = btn.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          gsap.fromTo(menu, { clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${cx}px ${cy}px)`, duration: 0.6, ease: IN_OUT });
          gsap.fromTo("#menuList li", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: OUT, stagger: 0.04, delay: 0.15 });
          gsap.fromTo(".menu__side", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, delay: 0.3 });
        }
        $("#menuList a").focus({ preventScroll: true });
      } else {
        const done = () => { menu.hidden = true; lenis?.start(); };
        if (motion) {
          const r = btn.getBoundingClientRect();
          gsap.to(menu, { clipPath: `circle(0px at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`, duration: 0.35, ease: "power2.in", onComplete: done });
        } else done();
      }
    };
    btn.addEventListener("click", () => set(menu.hidden));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { set(false); btn.focus(); }
    });
    menu.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (href.startsWith("#") && document.getElementById(href.slice(1)) && !/^#(personalizar|oficina)/.test(href)) {
        e.preventDefault();
        menu.hidden = true;
        btn.setAttribute("aria-expanded", "false");
        $("#masthead").classList.remove("is-menu");
        lenis?.start();
        goTo(href.slice(1));
      } else set(false);
    });
  }

  // ---------------------------------------------------------------------------
  // Cabeçalho: muda de cor conforme o fundo da seção que passa por baixo
  // ---------------------------------------------------------------------------
  let pickGround = () => {};
  function initMasthead() {
    const head = $("#masthead");
    const sections = $$("#viewHome main > section, #viewHome footer");
    const pick = () => {
      const y = 36;
      let ground = "night";
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { ground = s.dataset.ground || "night"; break; }
      }
      if (head.dataset.ground !== ground) head.dataset.ground = ground;
      head.classList.toggle("is-scrolled", window.scrollY > 24);
      // na primeira tela só existem o mostrador e a coroa; o cabeçalho chega quando a pessoa rola
      head.classList.toggle("is-hero", heroST ? heroST.progress < 0.02 : window.scrollY < 40);
    };
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    pickGround = pick;
    pick();
    // links internos rolam suavemente; os do ateliê e da oficina trocam de tela
    $("#viewHome").addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.closest("#menu")) return;
      const id = a.getAttribute("href").slice(1);
      if (!id || /^(personalizar|oficina|p-)/.test(id)) return;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      goTo(id);
    });
  }

  // ---------------------------------------------------------------------------
  // Revelações (uma por tipo de conteúdo, nunca a mesma em tudo)
  // ---------------------------------------------------------------------------
  function initReveals() {
    if (!motion) return;
    // títulos de seção: a linha sobe de dentro de uma máscara
    $$(".sec-head h2, .process__body h2, .faq-sec h2, .colors__copy h2").forEach((h) => {
      h.innerHTML = `<span class="mask"><span class="mask__in">${h.innerHTML}</span></span>`;
      gsap.from($(".mask__in", h), { yPercent: 110, duration: 1.1, ease: OUT, scrollTrigger: { trigger: h, start: "top 88%", once: true } });
    });
    // fotos das peças à venda: o recorte se abre como uma janela
    $$(".sale__img").forEach((el) => {
      const img = $("img", el);
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 82%", once: true } });
      tl.fromTo(el, { clipPath: "inset(14% 10% 14% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: OUT, clearProps: "clipPath" })
        .from(img, { scale: 1.25, duration: 1.6, ease: OUT }, 0);
    });
    // movimentos: os três chegam em sequência, como uma lista
    gsap.from(".movement", { y: 40, autoAlpha: 0, duration: 1.0, ease: OUT, stagger: 0.08, scrollTrigger: { trigger: ".movements", start: "top 80%", once: true } });
    // cores: o relógio sobe da bancada
    gsap.from(".colors__bench", { y: 60, autoAlpha: 0, duration: 1.2, ease: OUT, scrollTrigger: { trigger: "#cores", start: "top 70%", once: true } });
    // passos: cada mini mostrador aponta o seu quarto de hora quando chega
    $$("#processSteps li").forEach((li) => {
      const q = +$(".qdial", li).dataset.q;
      gsap.fromTo($(".qdial i", li), { rotation: 0 }, { rotation: q * 90, duration: 1.0, ease: OUT, scrollTrigger: { trigger: li, start: "top 80%", once: true } });
      gsap.from($("div", li), { y: 18, autoAlpha: 0, duration: 0.9, ease: OUT, scrollTrigger: { trigger: li, start: "top 80%", once: true } });
    });
    gsap.fromTo(".process__steps", { "--fill": 0 }, { "--fill": 1, ease: "none", scrollTrigger: { trigger: ".process__steps", start: "top 70%", end: "bottom 60%", scrub: true } });
    gsap.from(".process__photo img", { scale: 1.18, ease: "none", scrollTrigger: { trigger: ".process__photo", start: "top bottom", end: "bottom top", scrub: true } });
    // fechamento: as letras sobem uma a uma; a logo gigante desliza devagar
    const line = $(".close__line");
    // letra por letra, mas a palavra nunca se parte no meio
    line.innerHTML = line.textContent.split(" ").map((w) => `<span class="word">${[...w].map((ch) => `<span class="ch">${ch}</span>`).join("")}</span>`).join(" ");
    gsap.from(".close__line .ch", { yPercent: 105, duration: 1.0, ease: OUT, stagger: 0.035, scrollTrigger: { trigger: ".close__cta", start: "top 85%", once: true } });
    gsap.fromTo(".close__mark", { yPercent: 18 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".close", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  // ---------------------------------------------------------------------------
  // Laço único: relógio, luz e vista explodida
  // ---------------------------------------------------------------------------
  function startLoop() {
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!$("#viewHome").hidden) {
        clockFrame();
        lightFrame(now, dt);
        anatomyFrame(now, dt);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    if (fine) {
      const pin = $("#heroPin");
      pin.addEventListener("pointermove", (e) => {
        const r = $("#heroDial").getBoundingClientRect();
        const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
        light.target = a * 0.6 - 20;
      });
    }
  }

  // ---------------------------------------------------------------------------
  function init() {
    buildBezel();
    buildPrint();
    buildDate();
    buildHands();
    light.el = $("#dialLight");
    paintHands(timeAngles());
    setNight();
    initAnatomy();
    layoutHero();
    initColors();
    initHands();
    initPieces();
    initMenu();
    startLenis();
    initScroll();
    initFilm();
    initLoupe();
    initMasthead();
    initReveals();
    startLoop();
    // sem ScrollTrigger (parado), o próprio mostrador se refaz quando a tela muda de tamanho
    if (!motion) {
      let t = 0;
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(layoutHero, 150); });
    }
    $$(".whats-link").forEach((a) => { a.href = whatsUrl("Olá, Ferraro Atelier! Quero montar um relógio personalizado."); });
    runIntro();
  }

  /** Chamado pelo roteador quando a tela muda entre a página inicial e o ateliê/oficina. */
  function onRoute(view, hash) {
    if (view === "home") {
      startLenis();
      if (!motion) requestAnimationFrame(layoutHero);
      if (hasG) {
        ScrollTrigger.getAll().forEach((t) => t.enable(false));
        ScrollTrigger.refresh();
      }
      const id = hash && hash !== "topo" ? hash : "topo";
      // de volta ao topo pode não haver evento de rolagem: o cabeçalho confere o lugar por conta própria
      requestAnimationFrame(() => { goTo(id, true); requestAnimationFrame(pickGround); });
    } else {
      stopLenis();
      if (hasG) ScrollTrigger.getAll().forEach((t) => t.disable(false));
      $("#menu").hidden = true;
      $("#menuBtn").setAttribute("aria-expanded", "false");
    }
  }

  return { init, onRoute, goTo };
})();
window.Home = Home;
