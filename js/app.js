/* Ferraro Atelier — página inicial e ateliê virtual */

// ---------------------------------------------------------------------------
// Configurações da loja
// ---------------------------------------------------------------------------
const STORE = {
  whatsapp: "5548996950800", // DDI + DDD + número, só dígitos
  instagram: "https://www.instagram.com/ferraro_atelier/",
};

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
// Catálogo de opções
// ---------------------------------------------------------------------------
const HAND_STYLES = [
  { id: "bastao", name: "Bastão", desc: "Retos e finos. Clássicos, discretos e muito legíveis." },
  { id: "espada", name: "Espada", desc: "Lâmina larga e pontuda. Padrão dos relógios de ferramenta." },
  { id: "mercedes", name: "Mercedes", desc: "Círculo com estrela de três pontas no ponteiro das horas. Ícone dos relógios de mergulho." },
  { id: "dauphine", name: "Dauphine", desc: "Triangulares e facetados, refletem a luz. Elegância social." },
  { id: "folha", name: "Folha", desc: "Curvas finas em forma de folha. Ar vintage e delicado." },
  { id: "seringa", name: "Seringa", desc: "Corpo reto que termina em agulha. Usados desde os anos 1930." },
  { id: "catedral", name: "Catedral", desc: "Recortes que lembram vitrais góticos. Aviação e militares." },
  { id: "breguet", name: "Breguet", desc: "Haste fina com lua vazada. Criados por Breguet em 1783." },
  { id: "flecha", name: "Flecha", desc: "Ponta larga em seta no ponteiro das horas. Relógios de ferramenta antigos." },
  { id: "floco", name: "Floco de neve", desc: "Bloco quadrado de lume. Nasceu na Marinha francesa nos anos 1970." },
];

const MOVEMENTS = {
  quartzo: { name: "Quartzo", caliber: "Quartzo", text: "Bateria e salto de um em um segundo. Preciso, prático e sem manutenção." },
  automatico: { name: "Automático", caliber: "Seiko NH35", text: "Dá corda sozinho com o movimento do pulso. Segundos deslizando e reserva de cerca de 41 horas." },
  manual: { name: "Corda manual", caliber: "Seagull ST3600", text: "Você dá corda girando a coroa. Reserva de mais de 40 horas e visual de relógio de bolso no fundo." },
};

const isOct = (c) => c.caseShape === "octogonal";
const metalStrap = (c) => ["oyster", "jubile", "integrada"].includes(c.strapType);
const bezelHasInsert = (c) => !isOct(c) && ["mergulho", "taquimetro"].includes(c.bezelType);

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
      { type: "toggle", key: "dialFume", label: "Degradê fumê", note: "Escurece suavemente em direção às bordas" },
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
      { type: "toggle", key: "bezelTwoTone", label: "Luneta bicolor", note: "Metade de cima em outra cor", when: bezelHasInsert },
      { type: "color", key: "bezelColor2", label: "Segunda cor", when: (c) => bezelHasInsert(c) && c.bezelTwoTone },
    ],
  },
  {
    id: "pulseira", title: "Pulseira", intro: "Do nylon esportivo ao aço maciço.",
    fields: [
      { type: "choice", key: "strapType", label: "Tipo", options: [
        ["nato", "NATO", "Nylon trançado"], ["couro", "Couro"], ["borracha", "Borracha"], ["oyster", "Aço Oyster", "Três elos"], ["jubile", "Aço Jubilee", "Cinco elos"], ["integrada", "Integrada", "Só na octogonal"],
      ] },
      { type: "toggle", key: "strapTwoTone", label: "Pulseira em duas cores", note: "Uma cor por fora e outra no centro" },
      { type: "color", key: "strapColor", label: "Cor da pulseira", when: (c) => !metalStrap(c) && !c.strapTwoTone },
      { type: "color", key: "strapColor", label: "Cor de fora", note: "Laterais da pulseira", when: (c) => !metalStrap(c) && c.strapTwoTone },
      { type: "color", key: "strapColor2", label: "Cor de dentro", note: "Faixa central", when: (c) => !metalStrap(c) && c.strapTwoTone },
      { type: "color", key: "braceletColor", label: "Cor do aço", note: "Aço, dourado, PVD preto ou o tom que quiser", when: (c) => metalStrap(c) && !c.strapTwoTone },
      { type: "color", key: "braceletColor", label: "Cor dos elos de fora", when: (c) => metalStrap(c) && c.strapTwoTone },
      { type: "color", key: "braceletColor2", label: "Cor dos elos do centro", when: (c) => metalStrap(c) && c.strapTwoTone },
      { type: "color", key: "stitchColor", label: "Cor da costura", when: (c) => c.strapType === "couro" },
    ],
  },
  {
    id: "movimento", title: "Movimento", intro: "O coração do relógio. Teste na prévia: cada um anda de um jeito.",
    fields: [
      { type: "movement", key: "movement" },
      { type: "toggle", key: "displayBack", label: "Fundo de vidro", note: "Mostra o mecanismo na parte de trás. Desligado, o fundo é fechado.", when: (c) => c.movement !== "quartzo" },
      { type: "toggle", key: "skeleton", label: "Mostrador esqueleto", note: "Abre o centro do mostrador e mostra o mecanismo pela frente", when: (c) => c.movement !== "quartzo" },
      { type: "note", text: "No quartzo o fundo é fechado e o mostrador é inteiro. Fundo de vidro e mostrador esqueleto estão disponíveis no automático e na corda manual.", when: (c) => c.movement === "quartzo" },
      { type: "color", key: "rotorColor", label: "Cor do rotor", note: "Aparece pelo fundo de vidro", when: (c) => c.movement === "automatico" && c.displayBack !== false },
    ],
  },
  {
    id: "referencia", title: "Referência", intro: "Tem um relógio ou uma imagem que inspira o seu? Mostre para a gente. Esta etapa é opcional.",
    fields: [{ type: "reference" }],
  },
  { id: "resumo", title: "Resumo", intro: "Confira o projeto e envie para a gente pelo WhatsApp. O valor é combinado no atendimento.", fields: [{ type: "summary" }] },
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
// Portfólio. Peças com `price` aparecem também na seção "À venda".
// Para vender outra peça, coloque `price: 1500` nela; para tirar da venda, apague o `price`.
// ---------------------------------------------------------------------------
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const buyUrl = (p) => whatsUrl(`Olá, Ferraro Atelier! Quero comprar o ${p.name} (${brl.format(p.price)}). Ainda está disponível?`);
const PORTFOLIO = [
  {
    id: "carbon", name: "Carbon Edition", img: "assets/carbon-edition.jpg", price: 1799,
    text: "Mostrador azul texturizado, luneta de aço com relevo e fundo de vidro com rotor turquesa.",
    spec: [["Caixa", "Redonda, aço"], ["Mostrador", "Azul texturizado"], ["Ponteiros", "Espada com lume"], ["Movimento", "Automático"]],
    cfg: { caseShape: "redonda", dialColor: "#1d4e8f", dialFinish: "texturizado", dialFume: true, dialLayout: "data", indexStyle: "bastao", handStyle: "espada", handColor: "#e6e9ee", secondColor: "#3fc1c9", bezelType: "mergulho", bezelColor: "#575d64", bezelTwoTone: false, strapType: "nato", strapColor: "#1e3a6e", movement: "automatico", rotorColor: "#3fbfbd" },
  },
  {
    id: "verde", name: "Verde Fumê", img: "assets/verde-fume.jpg", price: 1600,
    text: "Caixa octogonal com parafusos na luneta, pulseira integrada e mostrador verde em degradê com relevo horizontal. Fundo de vidro com rotor verde.",
    spec: [["Caixa", "Octogonal integrada, aço"], ["Mostrador", "Verde fumê listrado, com data"], ["Ponteiros", "Bastão com lume"], ["Movimento", "Automático, fundo de vidro"], ["Rotor", "Verde"]],
    cfg: { caseShape: "octogonal", caseColor: "#c9cdd2", dialColor: "#2f7a64", dialFume: true, dialFinish: "listrado", dialLayout: "data", indexStyle: "bastao", indexColor: "#e9ecef", lume: true, handStyle: "bastao", handColor: "#e6e9ee", secondColor: "#e6e9ee", secondStyle: "agulha", strapType: "integrada", strapTwoTone: false, braceletColor: "#c9cdd2", movement: "automatico", displayBack: true, skeleton: false, rotorColor: "#6d9474" },
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
  const hero = $("#anatomia");
  const sticky = $(".hero__sticky", hero);
  const stack = $("#heroStack");
  const stage = $("#heroStage");
  const text = $("#heroText");
  const scene = $("#heroScene");
  const caption = $("#partCaption");
  let captionKey = "";
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
    const top = parseFloat(getComputedStyle(sticky).top) || 0;
    const span = Math.max(1, r.height - sticky.offsetHeight);
    target = clamp01((top - r.top) / span);
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
    const mobile = window.innerWidth < 860;
    // no celular, o texto sai de cena primeiro e o relógio toma a tela toda
    let e;
    if (mobile) {
      const q = smooth(clamp01(cur / 0.22));
      text.style.opacity = String(1 - q);
      text.style.transform = `translateY(${(-24 * q).toFixed(1)}px)`;
      text.style.pointerEvents = q > 0.5 ? "none" : "";
      const H = stage.offsetHeight;
      const flatH = stack.offsetHeight;
      const startY = text.offsetTop + text.offsetHeight + 16;
      const offset = Math.max(0, startY - (H - flatH) / 2);
      scene.style.transform = `translateY(${((1 - q) * offset).toFixed(1)}px)`;
      e = smooth(clamp01((cur - 0.16) / 0.62));
    } else {
      text.style.opacity = "";
      text.style.transform = "";
      scene.style.transform = "";
      e = smooth(clamp01(cur * 1.35));
    }
    const t = now / 1000;
    const W = stack.offsetWidth;
    const k = W / 330;
    const gap = (mobile ? 46 : 62) * k;
    const tilt = 60 * e;
    const spin = -20 * e - 18 * cur;
    const lift = (mobile ? 95 : 125) * k * e;
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
      const x = (m.dx * k * (mobile ? 0.45 : 1) + Math.cos(t * 0.7 + m.level) * 4 * ei) * ei;
      const y = m.dy * k * ei;
      const rot = m.rot * ei;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      pos[m.level === 0 ? (m.baseY ? 0 : -1) : m.level] = { x, y: y + (m.baseY || 0) * (W / 400), z };
    }

    if (mobile) {
      // uma legenda por vez, embaixo, com a última peça que se soltou
      let shown = null;
      callouts.forEach((li, idx) => { if (e > 0.12 + idx * 0.11) shown = li; });
      const key = shown ? shown.dataset.layer : "";
      if (key !== captionKey) {
        captionKey = key;
        caption.classList.toggle("is-on", !!shown);
        if (shown) caption.innerHTML = shown.innerHTML;
      }
      return;
    }

    // legendas acompanham a altura de cada peça na tela
    const sr = stage.getBoundingClientRect();
    const sceneRect = scene.getBoundingClientRect();
    const cy = sceneRect.top + sceneRect.height / 2 - sr.top + lift;
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
      <button class="work__img" type="button" data-open="${p.id}" aria-label="Ver ${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" width="900" height="900" />${p.price ? `<span class="work__tag">À venda · ${brl.format(p.price)}</span>` : ""}</button>
      <h3>${p.name}</h3>
      <p>${p.text}</p>
      <button class="link-arrow" type="button" data-open="${p.id}">Ver detalhes</button>
    </article>`).join("");

  // À venda
  const forSale = PORTFOLIO.filter((p) => p.price);
  $("#a-venda").hidden = forSale.length === 0;
  $$(".nav-sale").forEach((a) => { a.hidden = forSale.length === 0; });
  $("#saleGrid").innerHTML = forSale.map((p) => `
    <article class="sale-card reveal">
      <button class="sale-card__img" type="button" data-open="${p.id}" aria-label="Ver ${p.name}"><img src="${p.img}" alt="${p.name}" loading="lazy" width="900" height="900" /><span class="sale-card__tag">Disponível</span></button>
      <div class="sale-card__info">
        <p class="label">Feito no ateliê</p>
        <h3>${p.name}</h3>
        <p class="sale-card__text">${p.text}</p>
        <ul class="sale-card__spec">${p.spec.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join("")}</ul>
        <p class="sale-card__price">${brl.format(p.price)}</p>
        <div class="sale-card__actions">
          <a class="btn" href="${buyUrl(p)}" target="_blank" rel="noopener">Comprar pelo WhatsApp</a>
          <button class="link-arrow link-arrow--small" type="button" data-open="${p.id}">Ver em detalhe</button>
        </div>
      </div>
    </article>`).join("");

  const lb = $("#lightbox");
  let current = null;
  const open = (p) => {
    current = p;
    $("#lbImg").src = p.img;
    $("#lbImg").alt = p.name;
    $("#lbLabel").textContent = p.price ? "À venda" : "Portfólio";
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
    (p.price ? $("#lbBuy") : $("#lbStart")).focus();
  };
  const close = () => { lb.hidden = true; current = null; };
  [grid, $("#saleGrid")].forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]");
    if (b) open(PORTFOLIO.find((p) => p.id === b.dataset.open));
  }));
  $$("[data-close]", lb).forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) close(); });
  $("#lbStart").addEventListener("click", () => {
    if (current) Studio.apply({ ...DEFAULT_WATCH, ...current.cfg }, "caixa", `Projeto iniciado a partir do ${current.name}`);
    close();
  });
}

// ---------------------------------------------------------------------------
// Ficha do projeto (resumo) e código do projeto
// ---------------------------------------------------------------------------
function projectGroups(c, nImages = 0) {
  const color = (hex) => ({ color: hex });
  const hand = HAND_STYLES.find((h) => h.id === c.handStyle) || HAND_STYLES[0];
  const hasRef = (c.refWatch || "").trim() || (c.refNotes || "").trim() || nImages;
  return [
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
    ["Pulseira", [
      ["Tipo", LABELS.strapType[c.strapType] + (c.strapTwoTone ? ", duas cores" : "")],
      ...(metalStrap(c)
        ? (c.strapTwoTone ? [["Elos de fora", color(c.braceletColor)], ["Elos do centro", color(c.braceletColor2)]] : [["Cor do aço", color(c.braceletColor)]])
        : (c.strapTwoTone ? [["Cor de fora", color(c.strapColor)], ["Cor de dentro", color(c.strapColor2)]] : [["Cor", color(c.strapColor)]])),
      ...(c.strapType === "couro" ? [["Costura", color(c.stitchColor)]] : []),
    ]],
    ["Movimento", [
      ["Tipo", MOVEMENTS[c.movement].name + (c.dialLayout === "crono" ? " (cronógrafo)" : "")],
      ...(c.movement !== "quartzo" ? [
        ["Calibre", MOVEMENTS[c.movement].caliber],
        ["Frente", c.skeleton ? "Mostrador esqueleto" : "Mostrador inteiro"],
        ["Fundo", c.displayBack !== false ? "De vidro" : "Fechado"],
      ] : []),
      ...(c.movement === "automatico" && c.displayBack !== false ? [["Rotor", color(c.rotorColor)]] : []),
    ]],
    ...(hasRef ? [["Referência", [
      ...((c.refWatch || "").trim() ? [["Relógio", c.refWatch.trim()]] : []),
      ...((c.refNotes || "").trim() ? [["Observações", c.refNotes.trim()]] : []),
      ...(nImages ? [["Imagens", `${nImages} ${nImages === 1 ? "imagem" : "imagens"}`]] : []),
    ]]] : []),
  ];
}

function groupsHtml(groups) {
  return groups.map(([title, rows]) => `
    <div class="summary__group"><h3>${title}</h3>${rows.map(([k, v]) => `<div class="summary__row"><span>${k}</span><span>${typeof v === "object" ? `<i class="summary__chip" style="background:${v.color}"></i>${v.color.toUpperCase()}` : escapeHtml(v)}</span></div>`).join("")}</div>`).join("");
}

// Código compacto com todas as escolhas (sem a referência). A ordem dos campos não pode mudar:
// campos novos entram no fim, com uma versão nova do código. CT1 = os 28 primeiros campos.
const CODE_FIELDS = [
  ["caseShape", ["redonda", "almofada", "octogonal"]], ["size", [38, 40, 42]], ["caseColor"],
  ["dialColor"], ["dialFume", "bool"], ["dialFinish", ["liso", "raios", "listrado", "texturizado", "grade"]],
  ["dialLayout", ["data", "sem-data", "crono"]], ["subdialColor"], ["indexStyle", ["bastao", "romanos", "arabicos", "pontos"]],
  ["indexColor"], ["lume", "bool"], ["handStyle", HAND_STYLES.map((h) => h.id)], ["handColor"],
  ["secondStyle", ["agulha", "pirulito", "seta"]], ["secondColor"], ["bezelType", ["mergulho", "taquimetro", "lisa", "canelada"]],
  ["bezelColor"], ["bezelTwoTone", "bool"], ["bezelColor2"], ["strapType", ["nato", "couro", "borracha", "oyster", "jubile", "integrada"]],
  ["strapTwoTone", "bool"], ["strapColor"], ["strapColor2"], ["braceletColor"], ["braceletColor2"], ["stitchColor"],
  ["movement", ["quartzo", "automatico", "manual"]], ["rotorColor"],
  // CT2
  ["displayBack", "bool"], ["skeleton", "bool"],
];
const CODE_VERSIONS = { 1: 28, 2: 30 };

function encodeProject(c) {
  return "CT2-" + CODE_FIELDS.map(([k, kind]) => {
    if (kind === "bool") return c[k] === undefined ? (DEFAULT_WATCH[k] ? "1" : "0") : c[k] ? "1" : "0";
    if (Array.isArray(kind)) return Math.max(0, kind.indexOf(c[k])).toString(36);
    return String(c[k] || "#000000").replace("#", "").toLowerCase().padEnd(6, "0").slice(0, 6);
  }).join("");
}

function decodeProject(text) {
  const m = String(text).match(/CT([12])-([0-9a-z]+)/i);
  if (!m) return null;
  const raw = m[2].toLowerCase();
  const cfg = {};
  let i = 0;
  for (const [k, kind] of CODE_FIELDS.slice(0, CODE_VERSIONS[m[1]])) {
    if (kind === "bool") { cfg[k] = raw[i] === "1"; i += 1; }
    else if (Array.isArray(kind)) { const v = kind[parseInt(raw[i], 36)]; if (v === undefined) return null; cfg[k] = v; i += 1; }
    else { const hex = raw.slice(i, i + 6); if (!/^[0-9a-f]{6}$/.test(hex)) return null; cfg[k] = `#${hex}`; i += 6; }
  }
  return i === raw.length ? cfg : null;
}

/** Lê a mensagem do resumo (para mensagens sem código ou editadas pelo cliente). */
function parseProjectMessage(text) {
  const cfg = {};
  let found = 0;
  let group = "";
  const rev = (map, v) => Object.keys(map).find((k) => map[k].toLowerCase() === v.toLowerCase());
  const hex = (v) => { const m = v.match(/#?([0-9a-f]{6})\b/i); return m ? `#${m[1].toLowerCase()}` : null; };
  for (const line of String(text).split(/\r?\n/)) {
    const g = line.match(/^\s*\*([^*]+)\*\s*$/);
    if (g) { group = g[1].trim(); continue; }
    const kv = line.match(/^\s*[-•]\s*([^:]+):\s*(.+)$/);
    if (!kv) continue;
    const k = kv[1].trim();
    const v = kv[2].trim();
    const set = (key, val) => { if (val !== undefined && val !== null) { cfg[key] = val; found++; } };
    const key = `${group}|${k}`;
    switch (key) {
      case "Caixa|Formato": set("caseShape", rev(LABELS.caseShape, v)); break;
      case "Caixa|Diâmetro": { const n = parseInt(v, 10); set("size", [38, 40, 42].includes(n) ? n : undefined); break; }
      case "Caixa|Metal": set("caseColor", hex(v)); break;
      case "Mostrador|Cor": set("dialColor", hex(v)); break;
      case "Mostrador|Acabamento": set("dialFinish", rev(LABELS.dialFinish, v.split(",")[0].trim())); set("dialFume", /fum/i.test(v)); break;
      case "Mostrador|Disposição": set("dialLayout", rev(LABELS.dialLayout, v)); break;
      case "Mostrador|Submostradores": set("subdialColor", hex(v)); break;
      case "Mostrador|Índices": set("indexStyle", rev(LABELS.indexStyle, v)); break;
      case "Mostrador|Cor dos índices": set("indexColor", hex(v)); break;
      case "Mostrador|Lume": set("lume", /^s/i.test(v)); break;
      case "Ponteiros|Estilo": set("handStyle", HAND_STYLES.find((h) => h.name.toLowerCase() === v.toLowerCase())?.id); break;
      case "Ponteiros|Cor": set("handColor", hex(v)); break;
      case "Ponteiros|Segundos": set("secondStyle", rev(LABELS.secondStyle, v)); break;
      case "Ponteiros|Cor dos segundos": set("secondColor", hex(v)); break;
      case "Luneta|Tipo": set("bezelType", rev(LABELS.bezelType, v)); break;
      case "Luneta|Cor": set("bezelColor", hex(v)); break;
      case "Luneta|Segunda cor": set("bezelColor2", hex(v)); set("bezelTwoTone", true); break;
      case "Pulseira|Tipo": set("strapType", rev(LABELS.strapType, v.split(",")[0].trim())); set("strapTwoTone", /duas cores/i.test(v)); break;
      case "Pulseira|Cor": case "Pulseira|Cor de fora": set("strapColor", hex(v)); break;
      case "Pulseira|Cor de dentro": set("strapColor2", hex(v)); break;
      case "Pulseira|Cor do aço": case "Pulseira|Elos de fora": set("braceletColor", hex(v)); break;
      case "Pulseira|Elos do centro": set("braceletColor2", hex(v)); break;
      case "Pulseira|Costura": set("stitchColor", hex(v)); break;
      case "Movimento|Tipo": set("movement", Object.keys(MOVEMENTS).find((m) => v.toLowerCase().startsWith(MOVEMENTS[m].name.toLowerCase()))); break;
      case "Movimento|Rotor": set("rotorColor", hex(v)); break;
      case "Movimento|Frente": set("skeleton", /esqueleto/i.test(v)); break;
      case "Movimento|Fundo": set("displayBack", /vidro/i.test(v)); break;
      case "Referência|Relógio": set("refWatch", v); break;
      case "Referência|Observações": set("refNotes", v); break;
    }
  }
  const imgs = String(text).match(/mandar (\d+) image/i);
  return { cfg, found, images: imgs ? +imgs[1] : 0 };
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
  refImages: [],

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
    $("#toSummary").addEventListener("click", () => this.go("resumo"));
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
    this.body.addEventListener("change", (e) => {
      if (e.target.id === "refFiles") { this.addImages(e.target.files); e.target.value = ""; }
    });
    this.body.addEventListener("dragover", (e) => {
      const z = e.target.closest("#refDrop");
      if (!z) return;
      e.preventDefault();
      z.classList.add("is-over");
    });
    this.body.addEventListener("dragleave", (e) => e.target.closest("#refDrop")?.classList.remove("is-over"));
    this.body.addEventListener("drop", (e) => {
      if (!e.target.closest("#refDrop")) return;
      e.preventDefault();
      this.addImages(e.dataTransfer.files);
    });
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
    if (id === "movimento" && this.cfg.movement !== "quartzo") this.setView("fundo");
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
          const small = sub || "";
          return `<button type="button" class="choice" data-set="${f.key}" data-value="${v}" aria-pressed="${String(c[f.key]) === String(v)}" ${disabled(v) ? "disabled" : ""}><b>${name}</b>${small ? `<small>${small}</small>` : ""}</button>`;
        }).join("");
        return `<div class="field">${head()}<div class="choices">${opts}</div></div>`;
      }
      case "hands": {
        const opts = HAND_STYLES.map((h) => `<button type="button" class="choice" data-set="handStyle" data-value="${h.id}" aria-pressed="${c.handStyle === h.id}" title="${h.desc}">${Watch.handIcon(h.id, "#141b26")}<b>${h.name}</b></button>`).join("");
        const cur = HAND_STYLES.find((h) => h.id === c.handStyle);
        return `<div class="field">${head()}<div class="choices choices--icons">${opts}</div><p class="field__note">${cur.name}: ${cur.desc}</p></div>`;
      }
      case "movement": {
        const opts = Object.entries(MOVEMENTS).map(([k, m]) => `
          <button type="button" class="choice" data-set="movement" data-value="${k}" aria-pressed="${c.movement === k}">
            <b>${m.name}${k !== "quartzo" ? ` · ${m.caliber}` : ""}</b><span>${m.text}</span>
          </button>`).join("");
        return `<div class="field"><div class="choices choices--cards">${opts}</div></div>`;
      }
      case "toggle": {
        return `<button type="button" class="toggle" role="switch" aria-checked="${!!c[f.key]}" data-toggle="${f.key}"><span><b>${f.label}</b><small>${f.note || ""}</small></span><span class="toggle__track"></span></button>`;
      }
      case "color":
        return `<div class="color-field" data-color="${f.key}">
          <button type="button" class="color-field__btn" aria-expanded="false"><span class="color-field__swatch" style="background:${c[f.key]}"></span><span><b>${f.label}</b><small>${c[f.key].toUpperCase()}${f.note ? ` · ${f.note}` : ""}</small></span></button>
          <div class="color-field__body" hidden></div>
        </div>`;
      case "reference": {
        const imgs = this.refImages.map((r, i) => `<li><img src="${r.url}" alt="Imagem de referência ${i + 1}" /><button type="button" data-remove-ref="${i}" aria-label="Remover imagem ${i + 1}">×</button></li>`).join("");
        return `<div class="field text-field">
            <div class="field__head"><label class="label" for="f-refWatch">Relógio de referência</label></div>
            <input type="text" id="f-refWatch" data-text="refWatch" maxlength="120" placeholder="Ex.: um modelo, uma marca ou um link" value="${escapeHtml(c.refWatch || "")}" />
          </div>
          <div class="field">
            <div class="field__head"><span class="label">Imagens de referência</span><span class="field__note">${this.refImages.length ? `${this.refImages.length} de 6` : "até 6"}</span></div>
            <label class="dropzone" id="refDrop" for="refFiles">
              <input type="file" id="refFiles" accept="image/*" multiple />
              <strong>Escolher imagens</strong>
              <span>ou arraste para cá. Fotos de relógios, detalhes, cores que você gosta.</span>
            </label>
            ${imgs ? `<ul class="ref-thumbs">${imgs}</ul>` : ""}
            <p class="field__note">${this.canShareFiles() ? "No celular, o botão de envio do resumo já manda as imagens junto." : "As imagens não vão sozinhas pelo link do WhatsApp: quando a conversa abrir, anexe as fotos por lá."}</p>
          </div>
          <div class="field text-field">
            <div class="field__head"><label class="label" for="f-refNotes">Observações</label></div>
            <textarea id="f-refNotes" data-text="refNotes" rows="3" maxlength="600" placeholder="Conte o que você gosta nessa referência">${escapeHtml(c.refNotes || "")}</textarea>
          </div>`;
      }
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
      const key = tg.dataset.toggle;
      this.cfg[key] = !this.cfg[key];
      // mostra na prévia o lado que mudou
      if (key === "skeleton") this.setView("frente");
      if (key === "displayBack") this.setView("fundo");
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
    const rm = e.target.closest("[data-remove-ref]");
    if (rm) {
      e.preventDefault();
      const [gone] = this.refImages.splice(+rm.dataset.removeRef, 1);
      if (gone) URL.revokeObjectURL(gone.url);
      this.renderPanel();
      return;
    }
    if (e.target.closest("#shareProject")) { this.shareProject(); return; }
    if (e.target.closest("#copySummary")) {
      navigator.clipboard?.writeText(this.message()).then(() => toast("Resumo copiado"), () => toast("Não foi possível copiar. Selecione o texto e copie."));
      return;
    }
    if (e.target.closest("#resetDesign")) {
      this.cfg = { ...DEFAULT_WATCH };
      this.refImages.forEach((r) => URL.revokeObjectURL(r.url));
      this.refImages = [];
      this.save();
      this.renderWatch();
      this.go("caixa");
      toast("Projeto recomeçado");
    }
  },

  // ---------- referência ----------
  hasReference() {
    const c = this.cfg;
    return !!((c.refWatch || "").trim() || (c.refNotes || "").trim() || this.refImages.length);
  },

  canShareFiles() {
    try {
      const f = new File(["x"], "x.png", { type: "image/png" });
      return /Android|iPhone|iPad/i.test(navigator.userAgent) && !!navigator.canShare?.({ files: [f] });
    } catch { return false; }
  },

  addImages(list) {
    const files = [...(list || [])].filter((f) => f.type.startsWith("image/"));
    const room = 6 - this.refImages.length;
    if (!files.length) return;
    files.slice(0, room).forEach((file) => this.refImages.push({ file, url: URL.createObjectURL(file) }));
    if (files.length > room) toast("Máximo de 6 imagens");
    else toast(files.length === 1 ? "Imagem adicionada" : `${files.length} imagens adicionadas`);
    this.renderPanel();
  },

  async shareProject() {
    try {
      await navigator.share({ files: this.refImages.map((r) => r.file), text: this.message() });
    } catch (err) {
      if (err?.name !== "AbortError") window.open(whatsUrl(this.message()), "_blank", "noopener");
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
  groups() { return projectGroups(this.cfg, this.refImages.length); },

  message() {
    const lines = this.groups().map(([title, rows]) => `*${title}*\n` + rows.map(([k, v]) => `- ${k}: ${typeof v === "object" ? v.color.toUpperCase() : v}`).join("\n"));
    const n = this.refImages.length;
    const pics = n ? `\n\nVou mandar ${n === 1 ? "1 imagem" : `${n} imagens`} de referência aqui na conversa.` : "";
    return `Olá, Ferraro Atelier! Montei este relógio no ateliê virtual:\n\n${lines.join("\n\n")}${pics}\n\nCódigo do projeto: ${encodeProject(this.cfg)}\n\nPodem me passar o valor e o prazo?`;
  },

  renderSummary() {
    const el = $("#summary");
    if (!el) return;
    el.innerHTML = `<div class="summary">${groupsHtml(this.groups())}
      <div class="summary__group"><h3>Código do projeto</h3><code class="project-code">${encodeProject(this.cfg)}</code></div>
    </div>
    <div class="summary__actions">
      ${this.refImages.length && this.canShareFiles()
        ? `<button type="button" class="btn" id="shareProject">Enviar projeto com as imagens</button><a class="link-arrow link-arrow--small" href="${whatsUrl(this.message())}" target="_blank" rel="noopener">Enviar só o texto pelo WhatsApp</a>`
        : `<a class="btn" href="${whatsUrl(this.message())}" target="_blank" rel="noopener">Enviar projeto pelo WhatsApp</a>`}
      <button type="button" class="link-arrow link-arrow--small" id="copySummary">Copiar resumo</button>
      <button type="button" class="link-arrow link-arrow--small" id="resetDesign">Recomeçar</button>
    </div>
    <p class="summary__note">Valor e prazo são combinados no atendimento, antes de qualquer pagamento. WhatsApp: (48) 99695-0800.${this.refImages.length && !this.canShareFiles() ? " Lembre de anexar as imagens de referência na conversa." : ""}</p>`;
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
// Oficina: você cola a mensagem do cliente e vê o relógio montado
// ---------------------------------------------------------------------------
const Workshop = {
  ready: false,
  cfg: null,
  images: 0,
  view: "frente",
  savedKey: "ct-oficina",

  init() {
    if (this.ready) return;
    this.ready = true;
    this.text = $("#wsText");
    this.name = $("#wsName");
    this.stack = $("#wsStack");
    this.back = $("#wsBack");
    this.mv = null;
    this.text.addEventListener("input", () => { clearTimeout(this.timer); this.timer = setTimeout(() => this.build(true), 350); });
    $("#wsBuild").addEventListener("click", () => { clearTimeout(this.timer); this.build(); });
    $("#wsClear").addEventListener("click", () => this.clear());
    $("#wsSave").addEventListener("click", () => this.save());
    $("#wsEdit").addEventListener("click", () => {
      Studio.apply({ ...DEFAULT_WATCH, ...this.cfg }, "resumo", "Projeto do cliente aberto no ateliê virtual");
      location.hash = "personalizar";
    });
    $("#wsCopy").addEventListener("click", () => {
      const code = encodeProject(this.cfg);
      navigator.clipboard?.writeText(code).then(() => toast("Código copiado"), () => toast(code));
    });
    $$("[data-wsview]").forEach((b) => b.addEventListener("click", () => this.setView(b.dataset.wsview)));
    $("#wsList").addEventListener("click", (e) => {
      const open = e.target.closest("[data-open-saved]");
      const del = e.target.closest("[data-del-saved]");
      const list = this.list();
      if (open) {
        const item = list[+open.dataset.openSaved];
        this.name.value = item.name || "";
        this.text.value = item.text;
        this.build();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (del) {
        list.splice(+del.dataset.delSaved, 1);
        storage.set(this.savedKey, list);
        this.renderList();
      }
    });
    bindCrown($("#wsCanvas"), () => this.mv);
    this.renderList();
  },

  status(msg, kind) {
    const el = $("#wsStatus");
    el.textContent = msg;
    el.className = `workshop__status${kind ? ` is-${kind}` : ""}`;
  },

  build(quiet = false) {
    const text = this.text.value.trim();
    if (!text) { this.clear(true); return; }
    const parsed = parseProjectMessage(text);
    const fromCode = decodeProject(text);
    if (!fromCode && parsed.found < 3) {
      if (!quiet) this.status("Não encontrei um projeto nesse texto. Cole a mensagem inteira que o cliente mandou, ou o código que começa com CT.", "error");
      else this.status("");
      return;
    }
    // o código tem todas as escolhas; a mensagem traz a referência do cliente
    this.cfg = { ...DEFAULT_WATCH, ...parsed.cfg, ...(fromCode || {}) };
    this.images = parsed.images;
    this.status(fromCode
      ? "Projeto lido pelo código. Tudo igual ao que o cliente montou."
      : "Projeto lido pela mensagem (sem código). Confira as cores e detalhes com o cliente.", fromCode ? "ok" : "warn");
    $("#wsPlaceholder").hidden = true;
    $("#wsShow").hidden = false;
    this.render();
    if (!quiet && window.innerWidth < 860) $("#wsShow").scrollIntoView({ behavior: "smooth", block: "start" });
  },

  clear(keepText) {
    if (!keepText) { this.text.value = ""; this.name.value = ""; }
    this.cfg = null;
    this.status("");
    $("#wsPlaceholder").hidden = false;
    $("#wsShow").hidden = true;
  },

  setView(v) {
    this.view = v;
    $$("[data-wsview]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.wsview === v)));
    const ex = v === "explodida";
    const mobile = window.innerWidth < 860;
    this.stack.style.setProperty("--tilt", ex ? "56deg" : "0deg");
    this.stack.style.setProperty("--spin", ex ? "-24deg" : "0deg");
    this.stack.style.setProperty("--gap", ex ? (mobile ? "24px" : "40px") : "0px");
    this.stack.style.setProperty("--lift", ex ? (mobile ? "40px" : "80px") : "0px");
    if (this.cfg) this.render();
  },

  render() {
    const c = this.cfg;
    const back = this.view === "fundo";
    this.stack.parentElement.hidden = back;
    this.back.hidden = !back;
    if (back) this.back.innerHTML = Watch.back(c);
    else renderStack(this.stack, c);
    if (!this.mv) this.mv = Clockwork.add(new Movement($("#wsCanvas"), c));
    this.mv.reserve = 1;
    this.mv.setConfig(c);
    const name = this.name.value.trim();
    $("#wsSpec").innerHTML = `${name ? `<div class="summary__group"><h3>Cliente</h3><div class="summary__row"><span>Nome</span><span>${escapeHtml(name)}</span></div></div>` : ""}${groupsHtml(projectGroups(c, this.images))}`;
  },

  list() { return storage.get(this.savedKey, []); },

  save() {
    if (!this.cfg) return;
    const list = this.list();
    const name = this.name.value.trim() || `Projeto ${list.length + 1}`;
    list.unshift({ name, text: this.text.value.trim(), dial: this.cfg.dialColor, rim: this.cfg.caseColor, date: new Date().toISOString() });
    storage.set(this.savedKey, list.slice(0, 40));
    this.renderList();
    toast("Projeto salvo neste aparelho");
  },

  renderList() {
    const list = this.list();
    $("#wsEmpty").hidden = list.length > 0;
    $("#wsList").innerHTML = list.map((p, i) => `
      <li class="ws-item">
        <span class="ws-item__swatch" style="background:${p.dial};border-color:${p.rim}"></span>
        <button type="button" class="ws-item__open" data-open-saved="${i}"><b>${escapeHtml(p.name)}</b><small>${new Date(p.date).toLocaleDateString("pt-BR")}</small></button>
        <button type="button" class="ws-item__del" data-del-saved="${i}">Apagar</button>
      </li>`).join("");
  },
};

// ---------------------------------------------------------------------------
// Navegação entre a página inicial e o ateliê
// ---------------------------------------------------------------------------
function route() {
  const hash = location.hash.slice(1);
  const studio = hash.startsWith("personalizar");
  const workshop = hash === "oficina";
  const wasStudio = !$("#viewStudio").hidden || !$("#viewWorkshop").hidden;
  $("#viewHome").hidden = studio || workshop;
  $("#viewStudio").hidden = !studio;
  $("#viewWorkshop").hidden = !workshop;
  if (workshop) {
    Workshop.init();
    window.scrollTo(0, 0);
    document.title = "Oficina · Ferraro Atelier";
  } else if (studio) {
    Studio.init();
    if (!wasStudio) window.scrollTo(0, 0);
    document.title = "Ateliê virtual · Ferraro Atelier";
  } else {
    document.title = "Ferraro Atelier";
    if (wasStudio) {
      const target = hash && document.getElementById(hash);
      requestAnimationFrame(() => (target ? target.scrollIntoView() : window.scrollTo(0, 0)));
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#whatsLink").href = whatsUrl("Olá, Ferraro Atelier! Quero montar um relógio personalizado.");
  $$(".insta-link").forEach((a) => { a.href = STORE.instagram; });
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
