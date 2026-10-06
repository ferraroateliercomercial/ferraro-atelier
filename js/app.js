/* Custom Time — página inicial e ateliê virtual */

// ---------------------------------------------------------------------------
// Configurações da loja
// ---------------------------------------------------------------------------
const STORE = {
  whatsapp: "5548996950800", // DDI + DDD + número, só dígitos
  instagram: "https://instagram.com/",
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const whatsUrl = (text) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const storage = {
  get(k, f) { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sem armazenamento */ } },
};
let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
}
function hslHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return Watch.rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

// ---------------------------------------------------------------------------
// Catálogo de opções e valores (estimativas)
// ---------------------------------------------------------------------------
const HAND_STYLES = [
  { id: "bastao", name: "Bastão", desc: "Retos e finos. Clássicos, discretos e muito legíveis." },
  { id: "espada", name: "Espada", desc: "Lâmina larga e pontuda. Padrão dos relógios de ferramenta." },
  { id: "mercedes", name: "Mercedes", desc: "Círculo com estrela de três pontas no ponteiro das horas. Ícone dos relógios de mergulho." },
  { id: "dauphine", name: "Dauphine", desc: "Triangulares e facetados, refletem a luz. Elegância social." },
  { id: "folha", name: "Folha", desc: "Curvas finas em forma de folha. Ar vintage e delicado.", price: 40 },
  { id: "seringa", name: "Seringa", desc: "Corpo reto que termina em agulha. Usados desde os anos 1930." },
  { id: "catedral", name: "Catedral", desc: "Recortes que lembram vitrais góticos. Aviação e militares.", price: 40 },
  { id: "breguet", name: "Breguet", desc: "Haste fina com lua vazada. Criados por Breguet em 1783.", price: 60 },
  { id: "flecha", name: "Flecha", desc: "Ponta larga em seta no ponteiro das horas. Relógios de ferramenta antigos." },
  { id: "floco", name: "Floco de neve", desc: "Bloco quadrado de lume. Nasceu na Marinha francesa nos anos 1970.", price: 40 },
];

const MOVEMENTS = {
  quartzo: { name: "Quartzo", caliber: "Quartzo", text: "Bateria e salto de um em um segundo. Preciso, prático e sem manutenção." },
  automatico: { name: "Automático", caliber: "Seiko NH35", text: "Dá corda sozinho com o movimento do pulso. Segundos deslizando e reserva de cerca de 41 horas." },
  manual: { name: "Corda manual", caliber: "Seagull ST3600", text: "Você dá corda girando a coroa. Reserva de mais de 40 horas e visual de relógio de bolso no fundo." },
};

const PRICES = {
  movement: { quartzo: 790, automatico: 1190, manual: 1390 },
  caseShape: { redonda: 0, almofada: 120, octogonal: 280 },
  dialFinish: { liso: 0, raios: 60, listrado: 90, texturizado: 120, grade: 90 },
  dialLayout: { data: 0, "sem-data": 0, crono: 380 },
  indexStyle: { bastao: 0, romanos: 40, arabicos: 40, pontos: 0 },
  handStyle: Object.fromEntries(HAND_STYLES.map((h) => [h.id, h.price || 0])),
  bezelType: { mergulho: 0, taquimetro: 60, lisa: 0, canelada: 120 },
  strapType: { nato: 0, couro: 120, borracha: 90, oyster: 220, jubile: 260, integrada: 320 },
  dialFume: 40,
  bezelTwoTone: 60,
  engraving: 60,
};

const isOct = (c) => c.caseShape === "octogonal";
const metalStrap = (c) => ["oyster", "jubile", "integrada"].includes(c.strapType);
const bezelHasInsert = (c) => !isOct(c) && ["mergulho", "taquimetro"].includes(c.bezelType);

function priceOf(c) {
  let t = PRICES.movement[c.movement] + PRICES.caseShape[c.caseShape] + PRICES.dialFinish[c.dialFinish] + PRICES.dialLayout[c.dialLayout]
    + PRICES.indexStyle[c.indexStyle] + PRICES.handStyle[c.handStyle] + PRICES.strapType[c.strapType];
  if (!isOct(c)) t += PRICES.bezelType[c.bezelType];
  if (c.dialFume) t += PRICES.dialFume;
  if (bezelHasInsert(c) && c.bezelTwoTone) t += PRICES.bezelTwoTone;
  if ((c.engraving || "").trim()) t += PRICES.engraving;
  return t;
}

const plus = (v) => (v ? `+ ${brl.format(v)}` : "");

const TABS = [
  {
    id: "caixa", title: "Caixa", intro: "O formato e o metal definem o caráter do relógio.",
    fields: [
      { type: "choice", key: "caseShape", label: "Formato", options: [
        ["redonda", "Redonda", "Mergulho, esporte ou social"],
        ["almofada", "Almofada", "Quadrada de cantos suaves"],
        ["octogonal", "Octogonal integrada", "Luneta e pulseira integradas"],
      ] },
      { type: "choice", key: "size", label: "Diâmetro", options: [[38, "38 mm", "Pulsos finos"], [40, "40 mm", "O mais pedido"], [42, "42 mm", "Mais presença"]] },
      { type: "color", key: "caseColor", label: "Cor do metal", note: "Aço, dourado, bronze, PVD preto ou o tom que você imaginar." },
    ],
  },
  {
    id: "mostrador", title: "Mostrador", intro: "A cor exata que você quiser, com o acabamento que der o brilho certo.",
    fields: [
      { type: "color", key: "dialColor", label: "Cor do mostrador" },
      { type: "toggle", key: "dialFume", label: "Degradê fumê", note: "Escurece suavemente em direção às bordas", price: () => PRICES.dialFume },
      { type: "choice", key: "dialFinish", label: "Acabamento", options: [
        ["liso", "Liso"], ["raios", "Raios de sol"], ["listrado", "Listrado"], ["texturizado", "Texturizado"], ["grade", "Tapisserie"],
      ] },
      { type: "choice", key: "dialLayout", label: "Disposição", options: [["data", "Com data"], ["sem-data", "Sem data"], ["crono", "Cronógrafo", "3 submostradores"]] },
      { type: "color", key: "subdialColor", label: "Cor dos submostradores", when: (c) => c.dialLayout === "crono" },
      { type: "choice", key: "indexStyle", label: "Índices", options: [["bastao", "Bastões"], ["romanos", "Romanos"], ["arabicos", "Arábicos"], ["pontos", "Pontos"]] },
      { type: "color", key: "indexColor", label: "Cor dos índices" },
      { type: "toggle", key: "lume", label: "Material luminescente", note: "Índices e ponteiros brilham no escuro" },
    ],
  },
  {
    id: "ponteiros", title: "Ponteiros", intro: "Dez estilos levantados na pesquisa de mercado, todos em qualquer cor.",
    fields: [
      { type: "hands", key: "handStyle", label: "Estilo" },
      { type: "color", key: "handColor", label: "Cor dos ponteiros" },
      { type: "choice", key: "secondStyle", label: "Ponteiro de segundos", options: [["agulha", "Agulha"], ["pirulito", "Pirulito"], ["seta", "Seta"]] },
      { type: "color", key: "secondColor", label: "Cor do ponteiro de segundos" },
    ],
  },
  {
    id: "luneta", title: "Luneta", intro: "O aro em volta do cristal.",
    fields: [
      { type: "note", text: "Na caixa octogonal a luneta é integrada à caixa, polida e na mesma cor do metal.", when: isOct },
      { type: "choice", key: "bezelType", label: "Tipo", when: (c) => !isOct(c), options: [
        ["mergulho", "Mergulho", "Escala de 60 minutos"], ["taquimetro", "Taquímetro", "Mede velocidade"], ["lisa", "Lisa polida"], ["canelada", "Canelada", "Sulcos verticais"],
      ] },
      { type: "color", key: "bezelColor", label: "Cor da luneta", when: bezelHasInsert },
      { type: "toggle", key: "bezelTwoTone", label: "Luneta bicolor", note: "Metade de cima em outra cor", when: bezelHasInsert, price: () => PRICES.bezelTwoTone },
      { type: "color", key: "bezelColor2", label: "Segunda cor", when: (c) => bezelHasInsert(c) && c.bezelTwoTone },
    ],
  },
  {
    id: "pulseira", title: "Pulseira", intro: "Do nylon esportivo ao aço maciço.",
    fields: [
      { type: "choice", key: "strapType", label: "Tipo", options: [
        ["nato", "NATO", "Nylon trançado"], ["couro", "Couro"], ["borracha", "Borracha"], ["oyster", "Aço Oyster", "Três elos"], ["jubile", "Aço Jubilee", "Cinco elos"], ["integrada", "Integrada", "Só na octogonal"],
      ] },
      { type: "color", key: "strapColor", label: "Cor da pulseira", when: (c) => !metalStrap(c) },
      { type: "color", key: "stitchColor", label: "Cor da costura", when: (c) => c.strapType === "couro" },
      { type: "note", text: "Pulseiras de metal acompanham a cor escolhida para a caixa.", when: metalStrap },
    ],
  },
  {
    id: "movimento", title: "Movimento", intro: "O coração do relógio. Teste na prévia: cada um anda de um jeito.",
    fields: [
      { type: "movement", key: "movement" },
      { type: "color", key: "rotorColor", label: "Cor do rotor", note: "Aparece pelo fundo de vidro", when: (c) => c.movement === "automatico" },
    ],
  },
  {
    id: "gravacao", title: "Gravação", intro: "Um nome, uma data ou uma frase no fundo da caixa.",
    fields: [{ type: "text", key: "engraving", label: "Texto no fundo", placeholder: "Ex.: Para o Lucas · 2026", max: 28 }],
  },
  { id: "resumo", title: "Resumo", intro: "Confira o projeto e envie para a gente pelo WhatsApp.", fields: [{ type: "summary" }] },
];

const LABELS = {
  caseShape: { redonda: "Redonda", almofada: "Almofada", octogonal: "Octogonal integrada" },
  dialFinish: { liso: "Liso", raios: "Raios de sol", listrado: "Listrado", texturizado: "Texturizado", grade: "Tapisserie" },
  dialLayout: { data: "Com data", "sem-data": "Sem data", crono: "Cronógrafo" },
  indexStyle: { bastao: "Bastões", romanos: "Romanos", arabicos: "Arábicos", pontos: "Pontos" },
  secondStyle: { agulha: "Agulha", pirulito: "Pirulito", seta: "Seta" },
  bezelType: { mergulho: "Mergulho", taquimetro: "Taquímetro", lisa: "Lisa polida", canelada: "Canelada" },
  strapType: { nato: "NATO", couro: "Couro", borracha: "Borracha", oyster: "Aço Oyster", jubile: "Aço Jubilee", integrada: "Integrada" },
};

// ---------------------------------------------------------------------------
// Portfólio
// ---------------------------------------------------------------------------
const PORTFOLIO = [
  {
    id: "carbon", name: "Carbon Edition", img: "assets/carbon-edition.jpg",
    text: "Mostrador azul texturizado, luneta de aço gravada e fundo de vidro com rotor turquesa.",
    spec: [["Caixa", "Redonda, aço"], ["Mostrador", "Azul texturizado"], ["Ponteiros", "Espada com lume"], ["Movimento", "Automático"]],
    cfg: { caseShape: "redonda", dialColor: "#1d4e8f", dialFinish: "texturizado", dialFume: true, dialLayout: "data", indexStyle: "bastao", handStyle: "espada", handColor: "#e6e9ee", secondColor: "#3fc1c9", bezelType: "mergulho", bezelColor: "#575d64", bezelTwoTone: false, strapType: "nato", strapColor: "#1e3a6e", movement: "automatico", rotorColor: "#3fbfbd" },
  },
  {
    id: "verde", name: "Verde Fumê", img: "assets/verde-fume.jpg",
    text: "Caixa octogonal com pulseira integrada e mostrador verde em degradê, com relevo horizontal.",
    spec: [["Caixa", "Octogonal integrada, aço"], ["Mostrador", "Verde fumê listrado"], ["Ponteiros", "Bastão com lume"], ["Movimento", "Automático"]],
    cfg: { caseShape: "octogonal", caseColor: "#c9cdd2", dialColor: "#2f7a64", dialFume: true, dialFinish: "listrado", dialLayout: "sem-data", indexStyle: "bastao", indexColor: "#e9ecef", handStyle: "bastao", handColor: "#e6e9ee", secondColor: "#e6e9ee", strapType: "integrada", movement: "automatico" },
  },
  {
    id: "panda", name: "Panda Reverso", img: "assets/panda-reverso.jpg",
    text: "Cronógrafo de mostrador preto com submostradores claros e luneta taquimétrica.",
    spec: [["Caixa", "Redonda, aço"], ["Mostrador", "Preto, submostradores prata"], ["Luneta", "Taquímetro preta"], ["Movimento", "Cronógrafo de quartzo"]],
    cfg: { caseShape: "redonda", caseColor: "#c9cdd2", dialColor: "#111316", dialFume: false, dialFinish: "liso", dialLayout: "crono", subdialColor: "#d9dad6", indexStyle: "bastao", indexColor: "#e9ecef", handStyle: "bastao", handColor: "#e6e9ee", secondColor: "#e6e9ee", bezelType: "taquimetro", bezelColor: "#141517", bezelTwoTone: false, strapType: "oyster", movement: "quartzo" },
  },
];

// ---------------------------------------------------------------------------
// Laço de animação compartilhado: também atualiza medidores de corda
// ---------------------------------------------------------------------------
const frameHooks = new Set();
(function loop(now) {
  frameHooks.forEach((fn) => fn(now));
  requestAnimationFrame(loop);
})(performance.now());

function renderStack(el, cfg) {
  el.innerHTML = Watch.layers(cfg).map((l) => `<div class="layer" style="--i:${l.level}" data-name="${l.name}">${l.svg}</div>`).join("");
}

/** Segurar um botão para dar corda (mouse, toque e teclado). */
function holdToWind(btn, getMovement) {
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; btn.classList.remove("is-winding"); };
  btn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    btn.setPointerCapture?.(e.pointerId);
    btn.classList.add("is-winding");
    getMovement()?.wind(0.02);
    timer = setInterval(() => getMovement()?.wind(0.012), 50);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => btn.addEventListener(ev, stop));
  btn.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); getMovement()?.wind(0.06); }
  });
}

/** Girar a coroa arrastando sobre ela ou com a roda do mouse. */
function bindCrown(container, getMovement) {
  container.addEventListener("pointerdown", (e) => {
    const crown = e.target.closest("[data-crown]");
    const pusher = e.target.closest("[data-pusher]");
    if (pusher) { getMovement()?.pusher(pusher.dataset.pusher); return; }
    if (!crown) return;
    e.preventDefault();
    let y = e.clientY;
    container.setPointerCapture(e.pointerId);
    const move = (ev) => { const d = Math.abs(ev.clientY - y); y = ev.clientY; getMovement()?.wind(d * 0.0016); };
    const up = () => { container.removeEventListener("pointermove", move); container.removeEventListener("pointerup", up); };
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerup", up);
  });
  container.addEventListener("wheel", (e) => {
    if (!e.target.closest("[data-crown]")) return;
    e.preventDefault();
    getMovement()?.wind(Math.abs(e.deltaY) * 0.0006);
  }, { passive: false });
}

// ---------------------------------------------------------------------------
// Abertura
// ---------------------------------------------------------------------------
function initIntro() {
  const root = document.documentElement;
  if (root.dataset.intro !== "on") return;
  try { sessionStorage.setItem("ct-intro", "1"); } catch { /* sem armazenamento */ }
  const intro = $("#intro");
  let done = false;
  const finish = (state) => { if (done) return; done = true; root.dataset.intro = state; };
  const natural = setTimeout(() => finish("done"), 4150);
  const skip = () => {
    if (done || intro.classList.contains("is-skipping")) return;
    clearTimeout(natural);
    root.dataset.intro = "skip";
    intro.classList.add("is-skipping");
    setTimeout(() => finish("skipped"), 720);
  };
  intro.addEventListener("click", skip);
  window.addEventListener("keydown", (e) => { if (e.key !== "Tab") skip(); }, { once: true });
}

// ---------------------------------------------------------------------------
// Página inicial
// ---------------------------------------------------------------------------
const HERO_CFG = { ...DEFAULT_WATCH, dialColor: "#1d4e8f", dialFinish: "raios", bezelColor: "#1a1d22", handStyle: "mercedes", strapType: "oyster" };

function initNav() {
  const menu = $("#menu");
  const btn = $("#menuBtn");
  const set = (open) => { menu.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => set(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => set(false)));
}

// Como cada peça se afasta na vista explodida da abertura: deslocamento lateral (dx, dy),
// giro próprio (rot) e altura (level). As medidas valem para um relógio de 330 px de largura.
const HERO_MOTION = {
  "pulseira": { level: 0, dx: 0, dy: -40, rot: 0 },
  "pulseira-baixo": { level: 0, dx: 0, dy: 40, rot: 0, baseY: 185 },
  "movimento": { level: 1, dx: -80, dy: 16, rot: -75 },
  "caixa": { level: 2, dx: 10, dy: 0, rot: 0 },
  "mostrador": { level: 3, dx: 62, dy: -14, rot: 0 },
  "ponteiros": { level: 4, dx: -40, dy: -6, rot: 0 },
  "luneta": { level: 5, dx: 86, dy: 4, rot: 135 },
  "cristal": { level: 6, dx: -58, dy: -16, rot: 0 },
};

function initHero() {
  const hero = $("#topo");
  const stack = $("#heroStack");
  const stage = $(".hero__stage");
  const hint = $(".hero__hint");
  const orbit = $("#heroOrbit");
  const callouts = $$("#heroCallouts li");
  renderStack(stack, HERO_CFG);
  Clockwork.add(new Movement(stack, HERO_CFG));
  const layers = $$(".layer", stack).map((el) => ({ el, m: HERO_MOTION[el.dataset.name] }));

  // mostrador decorativo ao fundo
  let ticks = "";
  for (let i = 0; i < 120; i++) {
    const a = (i * 3 * Math.PI) / 180;
    const r1 = i % 10 === 0 ? 176 : 184;
    ticks += `<line x1="${(200 + Math.sin(a) * r1).toFixed(1)}" y1="${(200 - Math.cos(a) * r1).toFixed(1)}" x2="${(200 + Math.sin(a) * 190).toFixed(1)}" y2="${(200 - Math.cos(a) * 190).toFixed(1)}" stroke-width="${i % 10 === 0 ? 1.2 : 0.6}"/>`;
  }
  orbit.innerHTML = `<circle cx="200" cy="200" r="196" stroke-width=".8"/><circle cx="200" cy="200" r="150" stroke-width=".6" stroke-dasharray="2 6"/>${ticks}`;

  const smooth = (t) => t * t * (3 - 2 * t);
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  let target = 0;
  let cur = 0;
  let last = performance.now();
  const readScroll = () => {
    const r = hero.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    target = clamp01(-r.top / span);
  };
  window.addEventListener("scroll", readScroll, { passive: true });
  window.addEventListener("resize", readScroll);
  readScroll();

  frameHooks.add((now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (hero.offsetParent === null) return;
    const r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    // segue a rolagem com atraso suave, em vez de pular junto com ela
    cur += (target - cur) * (1 - Math.exp(-dt * 4.5));
    const e = smooth(clamp01(cur * 1.35));
    const t = now / 1000;
    const mobile = window.innerWidth < 860;
    const W = stack.offsetWidth;
    const k = W / 330;
    const gap = (mobile ? 34 : 62) * k;
    const tilt = 60 * e;
    const spin = -20 * e - 18 * cur;
    const lift = (mobile ? 60 : 125) * k * e;
    stack.style.setProperty("--tilt", `${tilt.toFixed(2)}deg`);
    stack.style.setProperty("--spin", `${spin.toFixed(2)}deg`);
    stack.style.setProperty("--lift", `${lift.toFixed(1)}px`);
    orbit.style.transform = `rotate(${(cur * 120 + t * 2).toFixed(2)}deg) scale(${(1 + e * 0.08).toFixed(3)})`;
    hint.style.opacity = String(1 - clamp01(cur * 8));

    const pos = {};
    for (const { el, m } of layers) {
      // as peças de cima saem primeiro
      const ei = smooth(clamp01((e - (6 - m.level) * 0.055) / 0.67));
      const breathe = Math.sin(t * 1.3 + m.level * 0.9) * 6 * ei;
      const z = m.level * gap * ei + breathe;
      const x = (m.dx * k + Math.cos(t * 0.7 + m.level) * 4 * ei) * ei;
      const y = m.dy * k * ei;
      const rot = m.rot * ei;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      pos[m.level === 0 ? (m.baseY ? 0 : -1) : m.level] = { x, y: y + (m.baseY || 0) * (W / 400), z };
    }

    // legendas acompanham a altura de cada peça na tela
    const sr = stage.getBoundingClientRect();
    const scene = stack.parentElement.getBoundingClientRect();
    const cy = scene.top + scene.height / 2 - sr.top + lift;
    const sinT = Math.sin((tilt * Math.PI) / 180);
    const cosT = Math.cos((tilt * Math.PI) / 180);
    const sp = (spin * Math.PI) / 180;
    const minGap = mobile ? 30 : 50;
    let prevY = -Infinity;
    callouts.forEach((li, idx) => {
      const p = pos[+li.dataset.layer];
      if (!p) return;
      const yr = p.x * Math.sin(sp) + p.y * Math.cos(sp);
      // nunca deixa uma legenda encostar na de cima
      const yScreen = Math.max(cy + yr * cosT - p.z * sinT, prevY + minGap);
      prevY = yScreen;
      li.style.top = `${(yScreen - 14).toFixed(1)}px`;
      li.classList.toggle("is-on", e > 0.32 + idx * 0.075);
    });
  });
}

function initHeroText() {
  const intro = document.documentElement.dataset.intro === "on";
  const startAt = intro ? 3600 : 700;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // contadores
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count;
    const dec = +(el.dataset.decimals || 0);
    const fmt = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
    if (reduced) { el.textContent = fmt(to); return; }
    setTimeout(() => {
      const t0 = performance.now();
      const step = (now) => {
        const q = Math.min(1, (now - t0) / 1600);
        el.textContent = fmt(to * (1 - Math.pow(1 - q, 3)));
        if (q < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, startAt);
  });

  // palavra que troca no título
  const words = $$("#heroRotator .rotator__word");
  if (reduced || words.length < 2) return;
  let i = 0;
  setTimeout(() => setInterval(() => {
    if (document.hidden) return;
    const prev = words[i];
    i = (i + 1) % words.length;
    prev.classList.remove("is-on");
    prev.classList.add("is-out");
    words[i].classList.remove("is-out");
    words[i].classList.add("is-on");
    setTimeout(() => prev.classList.remove("is-out"), 900);
  }, 2800), startAt);
}

function initMovements() {
  const mvs = {};
  const make = (id, cfg, back) => {
    const el = $(`#${id}`);
    el.innerHTML = back ? Watch.back(cfg) : Watch.front(cfg, `Relógio ${cfg.movement}`);
    mvs[id] = Clockwork.add(new Movement(el, cfg));
    return el;
  };
  make("mvQuartzo", { ...DEFAULT_WATCH, movement: "quartzo", dialColor: "#ebe8e1", dialFume: false, dialFinish: "raios", indexStyle: "romanos", indexColor: "#1c2c4a", handStyle: "breguet", handColor: "#1c2c4a", secondColor: "#1c2c4a", bezelType: "lisa", strapType: "couro", strapColor: "#5a3420", lume: false });
  const auto = make("mvAutomatico", { ...DEFAULT_WATCH, movement: "automatico", strapType: "borracha", strapColor: "#22262c" }, true);
  make("mvManual", { ...DEFAULT_WATCH, movement: "manual", caseColor: "#c7a46a", strapType: "couro", strapColor: "#3d2a1d" }, true);
  mvs.mvManual.reserve = 0.35;

  let lastX = null;
  auto.addEventListener("pointermove", (e) => {
    if (lastX !== null) mvs.mvAutomatico.shake((e.clientX - lastX) * 0.06);
    lastX = e.clientX;
  });
  auto.addEventListener("pointerleave", () => { lastX = null; });
  holdToWind($("#mvWind"), () => mvs.mvManual);

  const autoMeter = $("#mvAutoMeter");
  const manualMeter = $("#mvManualMeter");
  frameHooks.add(() => {
    autoMeter.style.setProperty("--v", mvs.mvAutomatico.reserve.toFixed(3));
    manualMeter.style.setProperty("--v", mvs.mvManual.reserve.toFixed(3));
  });
}

function initHands() {
  const grid = $("#handsGrid");
  const hue = $("#handHue");
  const paint = () => {
    const color = hslHex(+hue.value, 55, 34);
    grid.innerHTML = HAND_STYLES.map((h) => `
      <a class="hand-tile" href="#personalizar" data-hand-style="${h.id}">
        <span class="hand-tile__icon">${Watch.handIcon(h.id, color)}</span>
        <strong>${h.name}</strong>
        <span>${h.desc}</span>
      </a>`).join("");
  };
  hue.addEventListener("input", paint);
  paint();
  grid.addEventListener("click", (e) => {
    const t = e.target.closest("[data-hand-style]");
    if (!t) return;
    Studio.apply({ handStyle: t.dataset.handStyle }, "ponteiros");
  });
}

function initPortfolio() {
  const grid = $("#portfolioGrid");
  grid.innerHTML = PORTFOLIO.map((p) => `
    <article class="work reveal">
      <button class="work__img" type="button" data-open="${p.id}" aria-label="Ver ${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" width="900" height="900" /></button>
      <h3>${p.name}</h3>
      <p>${p.text}</p>
      <button class="link-arrow" type="button" data-open="${p.id}">Ver detalhes</button>
    </article>`).join("");

  const lb = $("#lightbox");
  let current = null;
  const open = (p) => {
    current = p;
    $("#lbImg").src = p.img;
    $("#lbImg").alt = p.name;
    $("#lbTitle").textContent = p.name;
    $("#lbText").textContent = p.text;
    $("#lbSpec").innerHTML = p.spec.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("");
    lb.hidden = false;
    $("#lbStart").focus();
  };
  const close = () => { lb.hidden = true; current = null; };
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) open(PORTFOLIO.find((p) => p.id === b.dataset.open));
  });
  $$("[data-close]", lb).forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
  $("#lbStart").addEventListener("click", () => {
    if (current) Studio.apply({ ...DEFAULT_WATCH, ...current.cfg, engraving: "" }, "caixa", `Projeto iniciado a partir do ${current.name}`);
    close();
  });
}

// ---------------------------------------------------------------------------
// Ateliê virtual
// ---------------------------------------------------------------------------
const Studio = {
  cfg: { ...DEFAULT_WATCH, ...storage.get("ct-design", {}) },
  tab: "caixa",
  view: "frente",
  ready: false,
  openColor: null,

  init() {
    if (this.ready) return;
    this.ready = true;
    this.stack = $("#studioStack");
    this.backEl = $("#studioBack");
    this.canvas = $("#studioCanvas");
    this.body = $("#studioBody");
    this.mv = Clockwork.add(new Movement(this.canvas, this.cfg));

    $("#steps").innerHTML = TABS.map((t, i) => `<button role="tab" data-tab="${t.id}" aria-selected="false"><small>${i + 1}</small>${t.title}</button>`).join("");
    $("#steps").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) this.go(b.dataset.tab); });
    $("#stepPrev").addEventListener("click", () => this.step(-1));
    $("#stepNext").addEventListener("click", () => this.step(1));
    $$(".views button").forEach((b) => b.addEventListener("click", () => this.setView(b.dataset.view)));

    bindCrown(this.canvas, () => this.mv);
    holdToWind($("#studioWind"), () => this.mv);
    $("#studioSetTime").addEventListener("click", () => { this.mv.resetTime(); toast("Hora acertada"); });
    let lastX = null;
    this.canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" && !e.target.closest("[data-rotor], .studio__back-view")) return;
      if (lastX !== null) this.mv.shake((e.clientX - lastX) * 0.05);
      lastX = e.clientX;
    });
    this.canvas.addEventListener("pointerleave", () => { lastX = null; });

    this.body.addEventListener("click", (e) => this.onClick(e));
    this.body.addEventListener("input", (e) => {
      const t = e.target.closest("[data-text]");
      if (!t) return;
      this.cfg[t.dataset.text] = t.value;
      this.refresh();
    });
    frameHooks.add(() => this.status());
    this.renderWatch();
    this.go(this.tab, false);
  },

  /** Aplica mudanças vindas de fora (portfólio, ponteiros) e abre o ateliê. */
  apply(patch, tab, message) {
    Object.assign(this.cfg, patch);
    this.fix();
    this.save();
    this.tab = tab || this.tab;
    if (this.ready) { this.renderWatch(); this.go(this.tab, false); }
    if (message) setTimeout(() => toast(message), 400);
  },

  save() { storage.set("ct-design", this.cfg); },

  /** Mantém combinações coerentes. */
  fix(changed) {
    const c = this.cfg;
    if (c.dialLayout === "crono") c.movement = "quartzo";
    if (c.strapType === "integrada" && !isOct(c)) c.strapType = "oyster";
    if (changed === "caseShape" && isOct(c)) c.strapType = "integrada";
  },

  step(d) {
    const i = TABS.findIndex((t) => t.id === this.tab);
    const n = TABS[Math.min(TABS.length - 1, Math.max(0, i + d))];
    this.go(n.id);
  },

  go(id, scroll = true) {
    this.tab = id;
    this.openColor = null;
    $$("#steps button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === id)));
    $(`#steps [data-tab="${id}"]`)?.scrollIntoView({ block: "nearest", inline: "center" });
    const i = TABS.findIndex((t) => t.id === id);
    $("#stepPrev").style.visibility = i === 0 ? "hidden" : "visible";
    const next = $("#stepNext");
    next.hidden = i === TABS.length - 1;
    next.textContent = i < TABS.length - 1 ? `Próximo: ${TABS[i + 1].title}` : "";
    // vista que mais mostra o que está sendo escolhido
    if (id === "gravacao" || (id === "movimento" && this.cfg.movement !== "quartzo")) this.setView("fundo");
    else if (this.view === "fundo") this.setView("frente");
    this.renderPanel();
    if (scroll && window.innerWidth < 860) $(".studio__panel").scrollIntoView({ behavior: "smooth", block: "start" });
    else if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setView(v) {
    this.view = v;
    $$(".views button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
    const exploded = v === "explodida";
    const mobile = window.innerWidth < 860;
    this.stack.style.setProperty("--tilt", exploded ? "56deg" : "0deg");
    this.stack.style.setProperty("--spin", exploded ? "-24deg" : "0deg");
    this.stack.style.setProperty("--gap", exploded ? (mobile ? "22px" : "40px") : "0px");
    this.stack.style.setProperty("--lift", exploded ? (mobile ? "34px" : "80px") : "0px");
    this.renderWatch();
  },

  renderWatch() {
    const back = this.view === "fundo";
    this.stack.parentElement.hidden = back;
    this.backEl.hidden = !back;
    if (back) this.backEl.innerHTML = Watch.back(this.cfg);
    else renderStack(this.stack, this.cfg);
    this.mv.setConfig(this.cfg);
    $("#studioTotal").textContent = brl.format(priceOf(this.cfg));
  },

  refresh() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      this.renderWatch();
      this.save();
      if (this.tab === "resumo") this.renderSummary();
    });
  },

  // ---------- painel ----------
  renderPanel() {
    const tab = TABS.find((t) => t.id === this.tab);
    const c = this.cfg;
    const html = tab.fields.filter((f) => !f.when || f.when(c)).map((f) => this.field(f)).join("");
    this.body.innerHTML = `<h2>${tab.title}</h2><p class="intro-text">${tab.intro}</p>${html}`;
    this.body.style.animation = "none"; void this.body.offsetWidth; this.body.style.animation = "";
    if (tab.id === "resumo") this.renderSummary();
    if (this.openColor) this.openPicker(this.openColor);
  },

  field(f) {
    const c = this.cfg;
    const head = (extra = "") => `<div class="field__head"><span class="label">${f.label}</span>${extra}</div>`;
    switch (f.type) {
      case "choice": {
        const disabled = (v) => (f.key === "strapType" && v === "integrada" && !isOct(c));
        const opts = f.options.map(([v, name, sub]) => {
          const p = PRICES[f.key]?.[v];
          const small = [sub, p ? plus(p) : ""].filter(Boolean).join(" · ");
          return `<button type="button" class="choice" data-set="${f.key}" data-value="${v}" aria-pressed="${String(c[f.key]) === String(v)}" ${disabled(v) ? "disabled" : ""}><b>${name}</b>${small ? `<small>${small}</small>` : ""}</button>`;
        }).join("");
        return `<div class="field">${head()}<div class="choices">${opts}</div></div>`;
      }
      case "hands": {
        const opts = HAND_STYLES.map((h) => `<button type="button" class="choice" data-set="handStyle" data-value="${h.id}" aria-pressed="${c.handStyle === h.id}" title="${h.desc}">${Watch.handIcon(h.id, "#141b26")}<b>${h.name}</b>${h.price ? `<small>${plus(h.price)}</small>` : ""}</button>`).join("");
        const cur = HAND_STYLES.find((h) => h.id === c.handStyle);
        return `<div class="field">${head()}<div class="choices choices--icons">${opts}</div><p class="field__note">${cur.name}: ${cur.desc}</p></div>`;
      }
      case "movement": {
        const crono = c.dialLayout === "crono";
        const opts = Object.entries(MOVEMENTS).map(([k, m]) => `
          <button type="button" class="choice" data-set="movement" data-value="${k}" aria-pressed="${c.movement === k}" ${crono && k !== "quartzo" ? "disabled" : ""}>
            <b>${m.name}${k !== "quartzo" ? ` · ${m.caliber}` : ""}</b><span>${m.text}</span><small>${brl.format(PRICES.movement[k])} com caixa e montagem</small>
          </button>`).join("");
        return `<div class="field"><div class="choices choices--cards">${opts}</div>${crono ? `<p class="field__note">Com cronógrafo o movimento é de quartzo. Para automático ou manual, escolha outra disposição em Mostrador.</p>` : ""}</div>`;
      }
      case "toggle": {
        const p = f.price ? plus(f.price()) : "";
        return `<button type="button" class="toggle" role="switch" aria-checked="${!!c[f.key]}" data-toggle="${f.key}"><span><b>${f.label}</b><small>${[f.note, p].filter(Boolean).join(" · ")}</small></span><span class="toggle__track"></span></button>`;
      }
      case "color":
        return `<div class="color-field" data-color="${f.key}">
          <button type="button" class="color-field__btn" aria-expanded="false"><span class="color-field__swatch" style="background:${c[f.key]}"></span><span><b>${f.label}</b><small>${c[f.key].toUpperCase()}${f.note ? ` · ${f.note}` : ""}</small></span></button>
          <div class="color-field__body" hidden></div>
        </div>`;
      case "text":
        return `<div class="field text-field">${head(`<span class="field__note">${plus(PRICES.engraving)}</span>`)}<input type="text" id="f-${f.key}" data-text="${f.key}" maxlength="${f.max}" placeholder="${f.placeholder}" value="${escapeHtml(c[f.key] || "")}" /><p class="field__note">A prévia mudou para a vista do fundo para você ver a gravação.</p></div>`;
      case "note":
        return `<p class="field__note">${f.text}</p>`;
      case "summary":
        return `<div id="summary"></div>`;
    }
    return "";
  },

  onClick(e) {
    const set = e.target.closest("[data-set]");
    if (set && !set.disabled) {
      const key = set.dataset.set;
      const raw = set.dataset.value;
      this.cfg[key] = key === "size" ? +raw : raw;
      this.fix(key);
      if (key === "movement") this.setView(raw === "quartzo" ? "frente" : "fundo");
      this.refresh();
      this.renderPanel();
      return;
    }
    const tg = e.target.closest("[data-toggle]");
    if (tg) {
      this.cfg[tg.dataset.toggle] = !this.cfg[tg.dataset.toggle];
      this.refresh();
      this.renderPanel();
      return;
    }
    const cb = e.target.closest(".color-field__btn");
    if (cb) {
      const key = cb.closest("[data-color]").dataset.color;
      if (this.openColor === key) { this.closePickers(); this.openColor = null; }
      else this.openPicker(key);
      return;
    }
    if (e.target.closest("#copySummary")) {
      navigator.clipboard?.writeText(this.message()).then(() => toast("Resumo copiado"), () => toast("Não foi possível copiar. Selecione o texto e copie."));
      return;
    }
    if (e.target.closest("#resetDesign")) {
      this.cfg = { ...DEFAULT_WATCH };
      this.save();
      this.renderWatch();
      this.go("caixa");
      toast("Projeto recomeçado");
    }
  },

  closePickers() {
    $$(".color-field", this.body).forEach((f) => { f.classList.remove("is-open"); $(".color-field__body", f).hidden = true; $(".color-field__btn", f).setAttribute("aria-expanded", "false"); });
  },

  openPicker(key) {
    this.closePickers();
    const wrap = $(`[data-color="${key}"]`, this.body);
    if (!wrap) return;
    this.openColor = key;
    wrap.classList.add("is-open");
    $(".color-field__btn", wrap).setAttribute("aria-expanded", "true");
    const body = $(".color-field__body", wrap);
    body.hidden = false;
    const sw = $(".color-field__swatch", wrap);
    const small = $(".color-field__btn small", wrap);
    const note = small.textContent.split(" · ").slice(1).join(" · ");
    ColorPicker.create(body, {
      value: this.cfg[key],
      idPrefix: `pk-${key}`,
      onInput: (hex) => {
        this.cfg[key] = hex;
        sw.style.background = hex;
        small.textContent = hex.toUpperCase() + (note ? ` · ${note}` : "");
        this.refresh();
      },
      onCommit: () => this.save(),
    });
  },

  // ---------- resumo ----------
  groups() {
    const c = this.cfg;
    const color = (hex) => ({ color: hex });
    const hand = HAND_STYLES.find((h) => h.id === c.handStyle);
    const g = [
      ["Caixa", [["Formato", LABELS.caseShape[c.caseShape]], ["Diâmetro", `${c.size} mm`], ["Metal", color(c.caseColor)]]],
      ["Mostrador", [
        ["Cor", color(c.dialColor)],
        ["Acabamento", LABELS.dialFinish[c.dialFinish] + (c.dialFume ? ", degradê fumê" : "")],
        ["Disposição", LABELS.dialLayout[c.dialLayout]],
        ...(c.dialLayout === "crono" ? [["Submostradores", color(c.subdialColor)]] : []),
        ["Índices", LABELS.indexStyle[c.indexStyle]],
        ["Cor dos índices", color(c.indexColor)],
        ["Lume", c.lume ? "Sim" : "Não"],
      ]],
      ["Ponteiros", [["Estilo", hand.name], ["Cor", color(c.handColor)], ["Segundos", LABELS.secondStyle[c.secondStyle]], ["Cor dos segundos", color(c.secondColor)]]],
      ["Luneta", isOct(c) ? [["Tipo", "Integrada à caixa"]] : [
        ["Tipo", LABELS.bezelType[c.bezelType]],
        ...(bezelHasInsert(c) ? [["Cor", color(c.bezelColor)], ...(c.bezelTwoTone ? [["Segunda cor", color(c.bezelColor2)]] : [])] : []),
      ]],
      ["Pulseira", [["Tipo", LABELS.strapType[c.strapType]], ...(metalStrap(c) ? [] : [["Cor", color(c.strapColor)]]), ...(c.strapType === "couro" ? [["Costura", color(c.stitchColor)]] : [])]],
      ["Movimento", [["Tipo", MOVEMENTS[c.movement].name + (c.dialLayout === "crono" ? " (cronógrafo)" : "")], ...(c.movement !== "quartzo" ? [["Calibre", MOVEMENTS[c.movement].caliber]] : []), ...(c.movement === "automatico" ? [["Rotor", color(c.rotorColor)]] : [])]],
      ["Gravação", [["Texto", (c.engraving || "").trim() || "Sem gravação"]]],
    ];
    return g;
  },

  message() {
    const lines = this.groups().map(([title, rows]) => `*${title}*\n` + rows.map(([k, v]) => `- ${k}: ${typeof v === "object" ? v.color.toUpperCase() : v}`).join("\n"));
    return `Olá, Custom Time! Montei este relógio no ateliê virtual:\n\n${lines.join("\n\n")}\n\nEstimativa: ${brl.format(priceOf(this.cfg))}`;
  },

  renderSummary() {
    const el = $("#summary");
    if (!el) return;
    el.innerHTML = `<div class="summary">${this.groups().map(([title, rows]) => `
      <div class="summary__group"><h3>${title}</h3>${rows.map(([k, v]) => `<div class="summary__row"><span>${k}</span><span>${typeof v === "object" ? `<i class="summary__chip" style="background:${v.color}"></i>${v.color.toUpperCase()}` : escapeHtml(v)}</span></div>`).join("")}</div>`).join("")}
      <div class="summary__total"><span>Estimativa</span><strong>${brl.format(priceOf(this.cfg))}</strong></div>
    </div>
    <div class="summary__actions">
      <a class="btn" href="${whatsUrl(this.message())}" target="_blank" rel="noopener">Enviar projeto pelo WhatsApp</a>
      <button type="button" class="link-arrow link-arrow--small" id="copySummary">Copiar resumo</button>
      <button type="button" class="link-arrow link-arrow--small" id="resetDesign">Recomeçar</button>
    </div>
    <p class="summary__note">O valor é uma estimativa. Preço final e prazo são confirmados no atendimento, antes de qualquer pagamento. WhatsApp: (48) 99695-0800.</p>`;
  },

  // ---------- estado do movimento ----------
  status() {
    if (!this.ready || $("#viewStudio").hidden) return;
    const mv = this.mv;
    const c = this.cfg;
    const mech = c.movement !== "quartzo";
    const key = `${c.movement}|${c.dialLayout}|${mv.running}|${Math.round(mv.reserve * 100)}`;
    if (key === this.lastStatus) return;
    this.lastStatus = key;
    $("#statusDot").classList.toggle("is-off", !mv.running);
    $("#statusMeterWrap").hidden = !mech;
    $("#studioWind").hidden = !mech;
    $("#statusMeter").style.setProperty("--v", mv.reserve.toFixed(3));
    $("#statusText").textContent = !mech
      ? "Quartzo · ponteiro salta a cada segundo"
      : mv.running ? `Corda: ${Math.round(mv.reserve * 100)}%` : "Parado: sem corda";
    $("#statusHint").textContent = c.dialLayout === "crono"
      ? "Toque nos botões ao lado da coroa: o de cima liga e para o cronógrafo, o de baixo zera."
      : c.movement === "automatico" ? "Gire a coroa arrastando sobre ela, ou mexa o mouse sobre o relógio para girar o rotor."
      : c.movement === "manual" ? "Gire a coroa arrastando sobre ela, ou segure o botão. Sem corda, o relógio para."
      : "Movimento a bateria: não precisa de corda.";
  },
};

// ---------------------------------------------------------------------------
// Navegação entre a página inicial e o ateliê
// ---------------------------------------------------------------------------
function route() {
  const hash = location.hash.slice(1);
  const studio = hash.startsWith("personalizar");
  const wasStudio = !$("#viewStudio").hidden;
  $("#viewHome").hidden = studio;
  $("#viewStudio").hidden = !studio;
  if (studio) {
    Studio.init();
    if (!wasStudio) window.scrollTo(0, 0);
    document.title = "Ateliê virtual · Custom Time";
  } else {
    document.title = "Custom Time";
    if (wasStudio) {
      const target = hash && document.getElementById(hash);
      requestAnimationFrame(() => (target ? target.scrollIntoView() : window.scrollTo(0, 0)));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#whatsLink").href = whatsUrl("Olá, Custom Time! Quero montar um relógio personalizado.");
  $("#instaLink").href = STORE.instagram;
  initIntro();
  initNav();
  initHero();
  initHeroText();
  initMovements();
  initHands();
  initPortfolio();
  window.addEventListener("hashchange", route);
  route();
});
