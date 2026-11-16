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

// Versão suíça (premium) de cada movimento
// O suíço só tem automático e corda manual (sem quartzo).
const SWISS = {
  automatico: { caliber: "Sellita SW200-1", text: "Automático suíço com 26 rubis, 28.800 alternâncias/h (o ponteiro de segundos dá 8 passos por segundo) e reserva de cerca de 38 horas." },
  manual: { caliber: "Sellita SW210-1", text: "Corda manual suíça com 28.800 alternâncias/h e reserva de cerca de 42 horas. Fino e elegante, com acabamento suíço." },
};

/** Calibre que vai no relógio, conforme o tipo, a origem e a disposição do mostrador. */
function caliberOf(c) {
  return c.swiss && SWISS[c.movement] ? SWISS[c.movement].caliber : MOVEMENTS[c.movement].caliber;
}

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
      { type: "toggle", key: "skeleton", label: "Mostrador esqueleto", note: "Abre o centro do mostrador e mostra o mecanismo suíço pela frente", when: (c) => c.swiss },
      { type: "note", text: "No quartzo o fundo é fechado e o mostrador é inteiro.", when: (c) => c.movement === "quartzo" },
      { type: "note", text: "O mostrador esqueleto está disponível com os movimentos suíços.", when: (c) => !c.swiss },
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
// Peças da bancada (seção "Da bancada" da página inicial). Com `price`, a peça aparece como
// disponível, com preço e botão de compra; sem `price`, aparece como portfólio e ponto de partida.
// Para vender outra peça, coloque `price: 1500` nela; para tirar da venda, apague o `price`.
// ---------------------------------------------------------------------------
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const buyUrl = (p) => whatsUrl(`Olá, Ferraro Atelier! Quero comprar o ${p.name} (${brl.format(p.price)}). Ainda está disponível?`);
const PORTFOLIO = [
  {
    id: "carbon", name: "Carbon Edition", img: "assets/carbon-edition.jpg", price: 2199,
    text: "Mostrador azul texturizado, luneta de aço com relevo e fundo de vidro com rotor turquesa.",
    spec: [["Caixa", "Redonda, aço"], ["Diâmetro", "40 mm"], ["Mostrador", "Azul texturizado"], ["Ponteiros", "Espada com lume"], ["Movimento", "Seiko NH35, automático, fundo de vidro"], ["Resistência à água", "20 ATM (200 m)"]],
    cfg: { caseShape: "redonda", dialColor: "#1d4e8f", dialFinish: "texturizado", dialFume: true, dialLayout: "data", indexStyle: "bastao", handStyle: "espada", handColor: "#e6e9ee", secondColor: "#3fc1c9", bezelType: "mergulho", bezelColor: "#575d64", bezelTwoTone: false, strapType: "nato", strapColor: "#1e3a6e", movement: "automatico", rotorColor: "#3fbfbd" },
  },
  {
    id: "geleira", name: "Geleira", img: "assets/geleira.jpg", price: 1399,
    text: "Mostrador azul-gelo com raios de sol, algarismos romanos aplicados e janelas de dia da semana e data. Luneta canelada, pulseira de couro marrom com fecho borboleta e fundo de vidro com rotor azul.",
    spec: [["Caixa", "Redonda, aço, luneta canelada"], ["Diâmetro", "36 mm"], ["Mostrador", "Azul-gelo, raios de sol, dia e data"], ["Ponteiros", "Bastão, aço"], ["Movimento", "Miyota 8285, automático, fundo de vidro"], ["Pulseira", "Couro marrom, fecho borboleta"], ["Resistência à água", "10 ATM (100 m)"]],
    cfg: { caseShape: "redonda", caseColor: "#c9cdd2", dialColor: "#8fcbe0", dialFume: false, dialFinish: "raios", dialLayout: "data", indexStyle: "romanos", indexColor: "#d9dde1", lume: false, handStyle: "bastao", handColor: "#d9dde1", secondColor: "#d9dde1", secondStyle: "agulha", bezelType: "canelada", strapType: "couro", strapColor: "#4a2618", stitchColor: "#e8dcc6", movement: "automatico", displayBack: true, rotorColor: "#6cc6dc" },
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

const LUME = "#eef3df";
/** Desenha as camadas. No modo noite, as camadas com lume ganham uma cópia só com o lume, que brilha por cima. */
function renderStack(el, cfg, night = false) {
  el.innerHTML = Watch.layers(cfg).map((l) => {
    const glow = night && l.svg.includes(LUME) ? `<div class="layer__lume" aria-hidden="true">${l.svg}</div>` : "";
    return `<div class="layer" style="--i:${l.level}" data-name="${l.name}">${l.svg}${glow}</div>`;
  }).join("");
}

/** Vira o relógio no eixo vertical entre frente e fundo (meia volta para sair, meia para entrar). */
/** Tela cheia com zoom: roda, pinça, toque duplo e arraste. Mostra uma cópia do relógio como está agora. */
function initZoomView(getSource) {
  const root = $("#zoomView"), stage = $("#zoomStage"), pan = $("#zoomPan"), hint = $("#zoomHint");
  const MIN = 1, MAX = 8;
  let k = 1, x = 0, y = 0, lastFocus = null;
  const pts = new Map();
  let pinch = null;
  const apply = () => { pan.style.transform = `translate(${x}px, ${y}px) scale(${k})`; };
  // no modo 3D o próprio visualizador cuida de girar e aproximar (arrastar e rolar); os botões mudam a distância
  const is3d = () => root.dataset.mode === "3d";
  let viewer3d = null;
  const clamp = () => {
    // o relógio nunca sai por inteiro da tela
    const w = pan.offsetWidth * k, h = pan.offsetHeight * k, vw = stage.clientWidth, vh = stage.clientHeight;
    x = Math.min(Math.max(x, -w + 80), vw - 80);
    y = Math.min(Math.max(y, -h + 80), vh - 80);
  };
  const zoomAt = (nk, cx, cy) => {
    nk = Math.min(MAX, Math.max(MIN, nk));
    const r = nk / k;
    x = cx - (cx - x) * r; y = cy - (cy - y) * r; k = nk;
    if (k === MIN) fit(); else { clamp(); apply(); }
    hint.classList.add("is-off");
  };
  const fit = () => {
    k = 1;
    x = (stage.clientWidth - pan.offsetWidth) / 2;
    y = (stage.clientHeight - pan.offsetHeight) / 2;
    apply();
  };
  const center = () => { const r = stage.getBoundingClientRect(); return [r.width / 2, r.height / 2]; };
  const open = () => {
    const src = getSource();
    if (!src) return;
    lastFocus = document.activeElement;
    pan.innerHTML = "";
    const copy = src.cloneNode(true);
    copy.hidden = false;
    // os ids ficam: gradientes e máscaras da cópia apontam para os mesmos do relógio da bancada, que continua na tela por baixo
    pan.append(copy);
    root.hidden = false;
    document.documentElement.style.overflow = "hidden";
    hint.classList.remove("is-off");
    pan.style.transform = "none";
    fit();
    setTimeout(() => hint.classList.add("is-off"), 4500);
    $("#zoomClose").focus();
  };
  const close = () => {
    root.hidden = true;
    if (viewer3d) { viewer3d.dispose(); viewer3d = null; }
    delete root.dataset.mode;
    pan.innerHTML = "";
    document.documentElement.style.overflow = "";
    lastFocus?.focus?.();
  };
  /** Tela cheia com o relógio em 3D: arrastar gira, rolar ou pinçar aproxima. */
  open.open3d = (cfg, view, night) => {
    lastFocus = document.activeElement;
    pan.innerHTML = "";
    root.dataset.mode = "3d";
    root.hidden = false;
    document.documentElement.style.overflow = "hidden";
    pan.style.transform = "none";
    viewer3d = Watch3D.create(pan, cfg, { orbit: true, distance: 0.92 });
    viewer3d.setView(view === "explodida" ? "explodida" : "frente");
    if (view === "fundo") viewer3d.setView("fundo");
    viewer3d.setNight(!!night);
    hint.textContent = "Arraste para girar. Role ou pince para aproximar.";
    hint.classList.remove("is-off");
    setTimeout(() => hint.classList.add("is-off"), 4500);
    $("#zoomClose").focus();
  };
  stage.addEventListener("wheel", (e) => {
    if (is3d()) return;
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    zoomAt(k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0018)), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  stage.addEventListener("pointerdown", (e) => {
    if (is3d()) return;
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, [e.clientX, e.clientY]);
    stage.classList.add("is-drag");
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k }; }
  });
  stage.addEventListener("pointermove", (e) => {
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    const cur = [e.clientX, e.clientY];
    pts.set(e.pointerId, cur);
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()];
      const r = stage.getBoundingClientRect();
      zoomAt(pinch.k * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top);
    } else if (pts.size === 1 && k > MIN) {
      x += cur[0] - prev[0]; y += cur[1] - prev[1];
      clamp(); apply();
    }
  });
  const up = (e) => {
    pts.delete(e.pointerId);
    pinch = null;
    if (!pts.size) stage.classList.remove("is-drag");
  };
  stage.addEventListener("pointerup", up);
  stage.addEventListener("pointercancel", up);
  stage.addEventListener("dblclick", (e) => {
    if (is3d()) { viewer3d?.dolly(0); return; }
    const r = stage.getBoundingClientRect();
    if (k > 1.05) { fit(); } else zoomAt(3, e.clientX - r.left, e.clientY - r.top);
  });
  $("#zoomIn").addEventListener("click", () => (is3d() ? viewer3d?.dolly(1 / 1.5) : zoomAt(k * 1.6, ...center())));
  $("#zoomOut").addEventListener("click", () => (is3d() ? viewer3d?.dolly(1.5) : zoomAt(k / 1.6, ...center())));
  $("#zoomReset").addEventListener("click", () => (is3d() ? viewer3d?.dolly(0) : fit()));
  $("#zoomClose").addEventListener("click", close);
  root.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "+" || e.key === "=") (is3d() ? viewer3d?.dolly(1 / 1.5) : zoomAt(k * 1.6, ...center()));
    else if (e.key === "-") (is3d() ? viewer3d?.dolly(1.5) : zoomAt(k / 1.6, ...center()));
    else if (e.key === "0") (is3d() ? viewer3d?.dolly(0) : fit());
    else if (e.key.startsWith("Arrow") && k > MIN && !is3d()) {
      const d = 60;
      if (e.key === "ArrowLeft") x += d; else if (e.key === "ArrowRight") x -= d; else if (e.key === "ArrowUp") y += d; else y -= d;
      e.preventDefault(); clamp(); apply();
    } else if (e.key === "Tab") {
      const f = [...root.querySelectorAll("button")];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  window.addEventListener("resize", () => { if (!root.hidden && k === 1 && !is3d()) fit(); });
  return open;
}

function flipWatch(outEl, inEl, toBack, swap) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dir = toBack ? 1 : -1;
  const half = reduced ? 140 : 240;
  const out = reduced
    ? [{ opacity: 1 }, { opacity: 0 }]
    : [{ transform: "rotateY(0deg)" }, { transform: `rotateY(${90 * dir}deg)`, opacity: 0.7 }];
  const enter = reduced
    ? [{ opacity: 0 }, { opacity: 1 }]
    : [{ transform: `rotateY(${-90 * dir}deg)`, opacity: 0.7 }, { transform: "rotateY(0deg)" }];
  return outEl.animate(out, { duration: half, easing: "cubic-bezier(.55,0,1,.45)" }).finished.then(() => {
    swap();
    return inEl.animate(enter, { duration: half, easing: "cubic-bezier(.23,1,.32,1)" }).finished;
  }).catch(() => swap());
}

// ---------------------------------------------------------------------------
// Aviso de combinação: cores que somem umas sobre as outras
// ---------------------------------------------------------------------------
function luminance(hex) {
  const n = parseInt(String(hex).replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch((n >> 16) & 255) + 0.7152 * ch((n >> 8) & 255) + 0.0722 * ch(n & 255);
}
function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** Distância entre duas cores (0 a 441): para tons de matiz diferente com o mesmo brilho. */
function colorDistance(a, b) {
  const rgb = (h) => { const n = parseInt(String(h).replace("#", "").padEnd(6, "0").slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const [x, y] = [rgb(a), rgb(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}
/** Tom que aparece bem sobre `bg`: claro em mostrador escuro, azul-marinho em mostrador claro. */
const readableOn = (bg) => (luminance(bg) < 0.28 ? "#e6e9ee" : "#1c2c4a");

function adviceFor(c) {
  const out = [];
  const dial = c.dialColor;
  if (contrast(c.handColor, dial) < 1.5) {
    out.push({ tab: "ponteiros", text: "Os ponteiros quase somem sobre o mostrador: a hora fica difícil de ler.", label: "Usar um tom que aparece", patch: { handColor: readableOn(dial) } });
  }
  if (!c.lume && contrast(c.indexColor, dial) < 1.5) {
    out.push({ tab: "mostrador", text: "Os índices estão muito próximos da cor do mostrador.", label: "Destacar os índices", patch: { indexColor: readableOn(dial) } });
  }
  if (contrast(c.secondColor, dial) < 1.3) {
    out.push({ tab: "ponteiros", text: "O ponteiro de segundos desaparece no mostrador.", label: "Usar um tom que aparece", patch: { secondColor: readableOn(dial) } });
  }
  if (c.dialLayout === "crono" && contrast(c.handColor, c.subdialColor) < 1.5) {
    out.push({ tab: "mostrador", text: "Os ponteirinhos do cronógrafo somem nos submostradores.", label: "Ajustar os submostradores", patch: { subdialColor: luminance(c.handColor) < 0.28 ? "#d9dad6" : "#22262d" } });
  }
  if (c.strapTwoTone) {
    const [a, b] = metalStrap(c) ? [c.braceletColor, c.braceletColor2] : [c.strapColor, c.strapColor2];
    if (colorDistance(a, b) < 40) {
      out.push({ tab: "pulseira", text: "As duas cores da pulseira estão quase iguais: o efeito bicolor quase não aparece.", label: "Deixar de uma cor só", patch: { strapTwoTone: false } });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Surpreenda-me: sorteia uma combinação que funciona
// ---------------------------------------------------------------------------
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const rnd = (a, b) => a + Math.random() * (b - a);
const STEEL = "#c9cdd2", GOLD = "#c8a55a", BRONZE = "#a97a4a", PVD = "#2c2e33", ROSE = "#c49480";
const WHITE = "#e9ecef", NAVY = "#1c2c4a";

/** Mexe um pouco no tom (matiz e luz) para cada sorteio sair único sem perder a receita. */
function jitter(hex, dh = 6, dl = 3) {
  const n = parseInt(hex.slice(1), 16);
  let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  let h = 0, sat = 0;
  if (d) {
    sat = d / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return hslHex((h + rnd(-dh, dh) + 360) % 360, sat * 100, Math.min(96, Math.max(4, l * 100 + rnd(-dl, dl))));
}

/**
 * Receitas do Surpreenda-me, inspiradas em relógios clássicos.
 * Valores em lista são sorteados; cores de mostrador e pulseira variam um pouco a cada vez.
 */
const SURPRISES = [
  { name: "Azul de mergulho", caseShape: ["redonda"], caseColor: STEEL, dialColor: "#1d3f7a", dialFume: true, dialFinish: ["raios", "liso"], dialLayout: ["data", "sem-data"],
    indexStyle: ["bastao", "pontos"], indexColor: WHITE, lume: true, handStyle: ["espada", "mercedes", "bastao"], handColor: "#e6e9ee", secondStyle: ["agulha", "pirulito"], secondColor: ["#c7372f", "#e6e9ee"],
    bezelType: "mergulho", bezelColor: "#15213b", strap: [{ strapType: "oyster" }, { strapType: "nato", strapColor: "#1e3060" }, { strapType: "borracha", strapColor: "#16213a" }] },
  { name: "Verde floresta", caseShape: ["redonda", "almofada"], caseColor: STEEL, dialColor: "#23523f", dialFume: true, dialFinish: ["raios", "liso", "listrado"], dialLayout: ["data", "sem-data"],
    indexStyle: ["bastao", "pontos"], indexColor: WHITE, lume: true, handStyle: ["dauphine", "espada", "bastao"], handColor: "#e6e9ee", secondStyle: ["agulha"], secondColor: ["#e6e9ee", "#d9bf7a"],
    bezelType: ["lisa", "mergulho"], bezelColor: "#1a2b23", strap: [{ strapType: "couro", strapColor: "#5a3420", stitchColor: "#e8d6c0" }, { strapType: "jubile" }] },
  { name: "Noite dourada", caseShape: ["redonda", "almofada"], caseColor: GOLD, dialColor: "#141518", dialFume: false, dialFinish: ["liso", "raios"], dialLayout: ["sem-data", "data"],
    indexStyle: ["romanos", "bastao"], indexColor: "#e3c98a", lume: false, handStyle: ["dauphine", "folha", "breguet"], handColor: "#e3c98a", secondStyle: ["agulha"], secondColor: "#e3c98a",
    bezelType: ["lisa", "canelada"], bezelColor: "#141518", strap: [{ strapType: "couro", strapColor: "#1c1a19", stitchColor: "#1c1a19" }, { strapType: "jubile" }] },
  { name: "Salmão clássico", caseShape: ["almofada", "redonda"], caseColor: [STEEL, ROSE], dialColor: "#e7ae94", dialFume: false, dialFinish: ["liso", "raios"], dialLayout: ["sem-data", "data"],
    indexStyle: ["romanos", "arabicos"], indexColor: NAVY, lume: false, handStyle: ["breguet", "folha", "dauphine"], handColor: NAVY, secondStyle: ["agulha"], secondColor: NAVY,
    bezelType: "lisa", bezelColor: "#1a1d22", strap: [{ strapType: "couro", strapColor: "#6b3a22", stitchColor: "#e8d6c0" }, { strapType: "couro", strapColor: "#24324f", stitchColor: "#e8d6c0" }] },
  { name: "Panda de corrida", caseShape: ["redonda"], caseColor: STEEL, dialColor: "#16171a", dialFume: false, dialFinish: ["liso"], dialLayout: "crono", subdialColor: "#e9e8e3",
    indexStyle: ["bastao"], indexColor: WHITE, lume: true, handStyle: ["bastao", "espada"], handColor: "#c7372f", secondStyle: ["agulha"], secondColor: "#c7372f",
    bezelType: "taquimetro", bezelColor: "#141518", strap: [{ strapType: "borracha", strapColor: "#1a1b1f" }, { strapType: "oyster" }, { strapType: "couro", strapColor: "#3a2416", stitchColor: "#e8d6c0" }] },
  { name: "Gelo", caseShape: ["octogonal", "redonda"], caseColor: STEEL, dialColor: "#bcd6e4", dialFume: false, dialFinish: ["raios", "listrado", "grade"], dialLayout: ["data", "sem-data"],
    indexStyle: ["bastao"], indexColor: "#2b3440", lume: false, handStyle: ["bastao", "dauphine"], handColor: "#2b3440", secondStyle: ["agulha"], secondColor: "#2b3440",
    bezelType: "lisa", bezelColor: "#1a1d22", strap: [{ strapType: "oyster" }] },
  { name: "Turquesa", caseShape: ["octogonal", "redonda"], caseColor: STEEL, dialColor: "#7fcfc6", dialFume: false, dialFinish: ["liso", "listrado"], dialLayout: ["sem-data", "data"],
    indexStyle: ["bastao"], indexColor: NAVY, lume: false, handStyle: ["bastao", "espada"], handColor: NAVY, secondStyle: ["agulha"], secondColor: NAVY,
    bezelType: "lisa", bezelColor: "#1a1d22", strap: [{ strapType: "oyster" }, { strapType: "jubile" }] },
  { name: "GMT Pepsi", caseShape: ["redonda"], caseColor: STEEL, dialColor: "#121316", dialFume: false, dialFinish: ["liso"], dialLayout: "data",
    indexStyle: ["pontos", "bastao"], indexColor: WHITE, lume: true, handStyle: ["mercedes"], handColor: "#e6e9ee", secondStyle: ["pirulito", "agulha"], secondColor: "#c7372f",
    bezelType: "mergulho", bezelColor: "#1e3f8a", bezelTwoTone: true, bezelColor2: "#b0262e", strap: [{ strapType: "jubile" }, { strapType: "oyster" }] },
  { name: "Militar", caseShape: ["redonda"], caseColor: [BRONZE, STEEL], dialColor: "#3e4930", dialFume: true, dialFinish: ["texturizado", "liso"], dialLayout: ["sem-data", "data"],
    indexStyle: ["arabicos"], indexColor: "#e8e0c8", lume: true, handStyle: ["seringa", "flecha", "espada"], handColor: "#e8e0c8", secondStyle: ["agulha", "seta"], secondColor: ["#e8e0c8", "#c7372f"],
    bezelType: ["lisa", "mergulho"], bezelColor: "#262b20", strap: [{ strapType: "nato", strapColor: "#4b5338" }, { strapType: "couro", strapColor: "#6b4a2b", stitchColor: "#e8e0c8" }] },
  { name: "Vinho", caseShape: ["almofada", "redonda"], caseColor: [ROSE, GOLD], dialColor: "#5a1a24", dialFume: true, dialFinish: ["raios"], dialLayout: ["sem-data", "data"],
    indexStyle: ["bastao", "romanos"], indexColor: "#ead0c4", lume: false, handStyle: ["dauphine", "folha"], handColor: "#ead0c4", secondStyle: ["agulha"], secondColor: "#ead0c4",
    bezelType: "lisa", bezelColor: "#1a1d22", strap: [{ strapType: "couro", strapColor: "#2a1a14", stitchColor: "#ead0c4" }] },
  { name: "Furtivo", caseShape: ["redonda", "octogonal"], caseColor: PVD, dialColor: "#1a1b1e", dialFume: false, dialFinish: ["grade", "texturizado"], dialLayout: ["sem-data", "data"],
    indexStyle: ["bastao", "arabicos"], indexColor: "#d9dad6", lume: true, handStyle: ["seringa", "espada"], handColor: "#d9dad6", secondStyle: ["seta", "agulha"], secondColor: "#e2902f",
    bezelType: "mergulho", bezelColor: "#1a1b1e", strap: [{ strapType: "borracha", strapColor: "#1a1b1f" }] },
  { name: "Sol de verão", caseShape: ["redonda"], caseColor: STEEL, dialColor: "#c4601f", dialFume: true, dialFinish: ["raios"], dialLayout: ["data", "sem-data"],
    indexStyle: ["bastao"], indexColor: WHITE, lume: true, handStyle: ["bastao", "espada"], handColor: "#e6e9ee", secondStyle: ["agulha"], secondColor: "#e6e9ee",
    bezelType: "mergulho", bezelColor: "#1a1d22", strap: [{ strapType: "borracha", strapColor: "#1a1b1f" }, { strapType: "oyster" }] },
];
let lastSurprise = -1;
const DICE_ICON = `<svg class="dice" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/></svg>`;

/** Devolve a receita em etapas, na ordem do ateliê, para as peças trocarem em sequência. */
function surpriseSteps(current) {
  let i;
  do { i = Math.floor(Math.random() * SURPRISES.length); } while (i === lastSurprise);
  lastSurprise = i;
  const r = SURPRISES[i];
  const v = (x) => (Array.isArray(x) ? pick(x) : x);
  const caseColor = v(r.caseColor);
  const caseShape = v(r.caseShape);
  const strap = { ...v(r.strap) };
  if (strap.strapColor) strap.strapColor = jitter(strap.strapColor, 4, 2);
  if (["oyster", "jubile"].includes(strap.strapType) && caseShape === "octogonal") strap.strapType = "integrada";
  const steps = [
    { caseShape, caseColor },
    { dialColor: jitter(r.dialColor), dialFume: r.dialFume, dialFinish: v(r.dialFinish), dialLayout: v(r.dialLayout), subdialColor: r.subdialColor || current.subdialColor,
      indexStyle: v(r.indexStyle), indexColor: r.indexColor, lume: r.lume },
    { handStyle: v(r.handStyle), handColor: r.handColor, secondStyle: v(r.secondStyle), secondColor: v(r.secondColor) },
    { bezelType: v(r.bezelType), bezelColor: r.bezelColor, bezelTwoTone: !!r.bezelTwoTone, bezelColor2: r.bezelColor2 || current.bezelColor2 },
    { strapTwoTone: false, braceletColor: caseColor, ...strap },
  ];
  // o cronógrafo usa os ponteiros nos submostradores: sem receita própria, o submostrador acompanha
  if (steps[1].dialLayout === "crono" && !r.subdialColor) steps[1].subdialColor = luminance(r.handColor) < 0.28 ? "#e9e8e3" : "#1d1f24";
  // movimento, tamanho e referência ficam como o cliente escolheu
  if (current.swiss) steps.push({ skeleton: Math.random() < 0.2 });
  steps.name = r.name;
  return steps;
}

/** Link que abre o projeto já montado no ateliê. */
function shareLink(cfg) {
  let base = location.href.split("#")[0];
  try {
    if (window.top !== window && /^https:\/\/claude\.ai\//.test(document.referrer)) base = document.referrer.split("#")[0];
  } catch { /* sem acesso à janela de cima */ }
  return `${base}#p-${encodeProject(cfg)}`;
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
/** O que está sob o ponteiro no desenho em SVG: "crown", "pusher:start", "pusher:reset" ou null. */
const hitSvg = (e) => {
  const pusher = e.target.closest("[data-pusher]");
  if (pusher) return "pusher:" + pusher.dataset.pusher;
  return e.target.closest("[data-crown]") ? "crown" : null;
};
function bindCrown(container, getMovement, hit = hitSvg) {
  container.addEventListener("pointerdown", (e) => {
    const what = hit(e);
    if (what?.startsWith("pusher:")) { getMovement()?.pusher(what.slice(7)); return; }
    if (what !== "crown") return;
    e.preventDefault();
    let y = e.clientY;
    container.setPointerCapture(e.pointerId);
    const move = (ev) => { const d = Math.abs(ev.clientY - y); y = ev.clientY; getMovement()?.wind(d * 0.0016); };
    const up = () => { container.removeEventListener("pointermove", move); container.removeEventListener("pointerup", up); };
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerup", up);
  });
  container.addEventListener("wheel", (e) => {
    if (hit(e) !== "crown") return;
    e.preventDefault();
    getMovement()?.wind(Math.abs(e.deltaY) * 0.0006);
  }, { passive: false });
}

// ---------------------------------------------------------------------------
// Página inicial (o resto mora em home.js)
// ---------------------------------------------------------------------------
// O relógio da página inicial: mostrador verde-musgo em raios de sol, caixa de bronze, luneta marrom,
// ponteiros e índices dourados, pulseira de couro.
const HERO_CFG = {
  ...DEFAULT_WATCH, dialColor: "#46603a", dialFinish: "raios", caseColor: "#b48a58", bezelColor: "#2c2017", bezelInk: "#d9b56b", bezelGloss: true, dialLabel: false,
  indexColor: "#d9b56b", handStyle: "mercedes", handColor: "#d9b56b", secondColor: "#e0b860",
  strapType: "couro", strapColor: "#5a3a22", stitchColor: "#d9c29a", rotorColor: "#b8924f",
};

function initMovements() {
  const mvs = {};
  const make = (id, cfg, back) => {
    const el = $(`#${id}`);
    el.innerHTML = back ? Watch.back(cfg) : Watch.front(cfg, `Relógio ${cfg.movement}`);
    mvs[id] = Clockwork.add(new Movement(el, cfg));
    return el;
  };
  make("mvQuartzo", { ...DEFAULT_WATCH, movement: "quartzo", dialColor: "#ebe5d4", dialFume: false, dialFinish: "raios", indexStyle: "romanos", indexColor: "#2a2119", handStyle: "breguet", handColor: "#2a2119", secondColor: "#8c6a22", bezelType: "lisa", strapType: "couro", strapColor: "#5a3420", lume: false });
  const auto = make("mvAutomatico", { ...DEFAULT_WATCH, movement: "automatico", strapType: "borracha", strapColor: "#1f2a1e", rotorColor: "#b8924f" }, true);
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
  let lastAuto = "", lastManual = "";
  frameHooks.add(() => {
    const a = mvs.mvAutomatico.reserve.toFixed(3), m = mvs.mvManual.reserve.toFixed(3);
    if (a !== lastAuto) { lastAuto = a; autoMeter.style.setProperty("--v", a); }
    if (m !== lastManual) { lastManual = m; manualMeter.style.setProperty("--v", m); }
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
      ["Origem", c.swiss ? "Suíço" : "Japonês"],
      ...(c.movement === "quartzo" ? [["Calibre", "Quartzo"]] : []),
      ...(c.movement !== "quartzo" ? [
        ["Calibre", caliberOf(c)],
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
  // CT3
  ["swiss", "bool"],
];
const CODE_VERSIONS = { 1: 28, 2: 30, 3: 31 };

function encodeProject(c) {
  return "CT3-" + CODE_FIELDS.map(([k, kind]) => {
    if (kind === "bool") return c[k] === undefined ? (DEFAULT_WATCH[k] ? "1" : "0") : c[k] ? "1" : "0";
    if (Array.isArray(kind)) return Math.max(0, kind.indexOf(c[k])).toString(36);
    return String(c[k] || "#000000").replace("#", "").toLowerCase().padEnd(6, "0").slice(0, 6);
  }).join("");
}

function decodeProject(text) {
  const m = String(text).match(/CT([123])-([0-9a-z]+)/i);
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
      case "Movimento|Calibre": set("swiss", /su[ií]ço|sellita/i.test(v)); break;
      case "Movimento|Origem": set("swiss", /su[ií]ço/i.test(v)); break;
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
// Quem abre o ateliê pela primeira vez começa do relógio da página inicial (o padrão de decodificação continua
// sendo DEFAULT_WATCH, para os códigos antigos de projeto não mudarem).
const Studio = {
  cfg: { ...HERO_CFG, ...storage.get("ct-design", {}) },
  tab: "caixa",
  view: "frente",
  night: false,
  flipping: null,
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
    // o relógio em 3D, quando o navegador tem WebGL; o desenho em SVG fica por baixo até ele ficar pronto (e no lugar dele se não der)
    const start3d = () => {
      if (!window.Watch3D?.supported() || this.viewer3d) return;
      const host = $("#studio3d");
      host.hidden = false;
      this.viewer3d = Watch3D.create(host, this.cfg, { onReady: () => { this.canvas.classList.add("is-3d"); } });
      this.viewer3d.setView(this.view);
      this.viewer3d.setNight(this.night);
      this.mv.onAngles = (a) => this.viewer3d.setAngles(a);
    };
    if (window.Watch3D) start3d(); else window.addEventListener("watch3d-ready", start3d, { once: true });

    $("#steps").innerHTML = TABS.map((t, i) => `<button role="tab" data-tab="${t.id}" aria-selected="false"><small>${i + 1}</small>${t.title}</button>`).join("");
    $("#steps").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) this.go(b.dataset.tab); });
    $("#stepPrev").addEventListener("click", () => this.step(-1));
    $("#toSummary").addEventListener("click", () => this.go("resumo"));
    $("#stepNext").addEventListener("click", () => this.step(1));
    $$(".views button").forEach((b) => b.addEventListener("click", () => this.setView(b.dataset.view)));
    $("#studioNight").addEventListener("click", () => this.setNight(!this.night));
    const openZoomSvg = initZoomView(() => (this.view === "fundo" ? this.backEl : this.stack.parentElement));
    const openZoom = () => (this.viewer3d ? openZoomSvg.open3d(this.cfg, this.view, this.night) : openZoomSvg());
    $("#studioZoom").addEventListener("click", openZoom);
    // clicar no relógio também amplia (a coroa e os botões do relógio seguem com a função deles)
    this.canvas.addEventListener("click", (e) => {
      if (e.target.closest("[data-crown], [data-pusher], [data-rotor], button")) return;
      if (this.viewer3d && e.target.tagName === "CANVAS") { if (!this.viewer3d.pick(e)) openZoom(); return; }
      if (e.target.closest(".stack, .studio__back-view")) openZoom();
    });
    $("#studioSurprise").addEventListener("click", () => this.surprise());

    bindCrown(this.canvas, () => this.mv, (e) => (this.viewer3d && e.target.tagName === "CANVAS" ? this.viewer3d.pick(e) : hitSvg(e)));
    holdToWind($("#studioWind"), () => this.mv);
    $("#studioSetTime").addEventListener("click", () => { this.mv.resetTime(); toast("Hora acertada"); });
    let lastX = null;
    this.canvas.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch" && !e.target.closest("[data-rotor], .studio__back-view") && !(this.viewer3d && this.view === "fundo")) return;
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
    // suíço não tem quartzo; esqueleto só existe no suíço
    if (c.swiss && c.movement === "quartzo") c.movement = "automatico";
    if (!c.swiss) c.skeleton = false;
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
    if (this.viewer3d) { this.viewer3d.setView(v); this.renderWatch(); return; }
    const exploded = v === "explodida";
    const mobile = window.innerWidth < 860;
    this.stack.style.setProperty("--tilt", exploded ? "56deg" : "0deg");
    this.stack.style.setProperty("--spin", exploded ? "-24deg" : "0deg");
    this.stack.style.setProperty("--gap", exploded ? (mobile ? "22px" : "40px") : "0px");
    this.stack.style.setProperty("--lift", exploded ? (mobile ? "34px" : "80px") : "0px");
    const scene = this.stack.parentElement;
    const toBack = v === "fundo";
    const showingBack = !this.backEl.hidden;
    if (toBack === showingBack || this.flipping || !this.canvas.offsetParent) { if (!this.flipping) this.renderWatch(); return; }
    this.flipping = flipWatch(toBack ? scene : this.backEl, toBack ? this.backEl : scene, toBack, () => this.renderWatch())
      .then(() => {
        this.flipping = null;
        // o cliente pode ter trocado de vista no meio da virada
        if ((this.view === "fundo") !== !this.backEl.hidden) this.setView(this.view); else this.renderWatch();
      });
  },

  renderWatch() {
    this.mv.setConfig(this.cfg);
    if (this.viewer3d) {
      // só reconstrói o 3D quando o projeto mudou de verdade
      const key = JSON.stringify(this.cfg);
      if (key !== this.cfgKey3d) { this.cfgKey3d = key; this.viewer3d.setConfig(this.cfg); }
      return;
    }
    const back = this.view === "fundo";
    this.stack.parentElement.hidden = back;
    this.backEl.hidden = !back;
    if (back) this.backEl.innerHTML = Watch.back(this.cfg);
    else renderStack(this.stack, this.cfg, this.night);
  },

  surprise() {
    if (this.surprising) return;
    const btn = $("#studioSurprise");
    this.surprising = true;
    btn.disabled = true;
    $$("[data-surprise]").forEach((b) => { b.disabled = true; });
    const steps = surpriseSteps(this.cfg);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      if (this.view !== "frente") { this.setView("frente"); await wait(560); }
      for (const patch of reduced ? [Object.assign({}, ...steps)] : steps) {
        Object.assign(this.cfg, patch);
        this.fix();
        this.renderWatch();
        if (!reduced) await wait(170);
      }
      this.save();
      this.openColor = null;
      this.renderPanel();
      this.surprising = false;
      btn.disabled = false;
      toast(`Sorteado: ${steps.name}. Ajuste o que quiser.`);
    })();
  },

  /** Mostra os avisos de combinação da etapa aberta (no resumo, todos). */
  advise() {
    const slot = this.body.querySelector(".advice-slot");
    this.advice = adviceFor(this.cfg);
    $$("#steps button").forEach((b) => b.classList.toggle("has-advice", this.advice.some((a) => a.tab === b.dataset.tab)));
    if (!slot) return;
    const list = this.advice.map((a, i) => ({ ...a, i })).filter((a) => this.tab === "resumo" || a.tab === this.tab);
    const key = list.map((a) => a.text).join("|");
    if (slot.dataset.key === key) return;
    slot.dataset.key = key;
    slot.innerHTML = list.map((a) => `<div class="advice"><p>${a.text}</p><button type="button" class="link-arrow link-arrow--small" data-advice-fix="${a.i}">${a.label}</button></div>`).join("");
  },

  setNight(on) {
    this.night = on;
    const btn = $("#studioNight");
    btn.setAttribute("aria-pressed", String(on));
    $(".studio__stage").classList.toggle("is-night", on);
    this.viewer3d?.setNight(on);
    if (!this.flipping) this.renderWatch();
    if (on && !this.cfg.lume) toast("Este projeto está sem lume. Ative em Mostrador › Material luminescente.");
    else if (on && this.view === "fundo") toast("O lume fica na frente. Vire o relógio para ver.");
  },

  refresh() {
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(() => {
      this.pending = false;
      if (!this.flipping) this.renderWatch();
      this.save();
      this.advise();
      if (this.tab === "resumo") this.renderSummary();
    });
  },

  // ---------- painel ----------
  renderPanel() {
    const tab = TABS.find((t) => t.id === this.tab);
    const c = this.cfg;
    const html = tab.fields.filter((f) => !f.when || f.when(c)).map((f) => this.field(f)).join("");
    const kick = tab.id === "caixa" ? `<div class="kickstart"><p><b>Sem ideia por onde começar?</b> Sorteie uma combinação pronta, inspirada em relógios clássicos, e ajuste depois.</p><button type="button" class="btn btn--line btn--small" data-surprise>${DICE_ICON}Surpreenda-me</button></div>` : "";
    this.body.innerHTML = `<h2>${tab.title}</h2><p class="intro-text">${tab.intro}</p>${kick}<div class="advice-slot" role="status" aria-live="polite"></div>${html}`;
    this.advise();
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
        // 1) origem  2) movimentos daquela origem
        const origin = `
          <button type="button" class="choice" data-set="swiss" data-value="0" aria-pressed="${!c.swiss}">
            <b>Japonês</b><span>Quartzo, automático Seiko NH35 ou corda manual Seagull ST3600. Confiáveis e fáceis de manter.</span>
          </button>
          <button type="button" class="choice choice--premium" data-set="swiss" data-value="1" aria-pressed="${!!c.swiss}">
            <b>Suíço</b><span>Automático Sellita SW200-1 ou corda manual Sellita SW210-1. Única origem com mostrador esqueleto.</span><small class="premium-tag">Premium</small>
          </button>`;
        const list = c.swiss ? Object.keys(SWISS) : Object.keys(MOVEMENTS);
        const opts = list.map((k) => {
          const m = MOVEMENTS[k];
          return `
          <button type="button" class="choice" data-set="movement" data-value="${k}" aria-pressed="${c.movement === k}">
            <b>${m.name}${k !== "quartzo" ? ` · ${caliberOf({ ...c, movement: k })}` : ""}</b><span>${c.swiss ? SWISS[k].text : m.text}</span>
          </button>`;
        }).join("");
        return `<div class="field"><div class="field__head"><span class="label">Origem do movimento</span></div><div class="choices choices--cards">${origin}</div></div>
          <div class="field"><div class="field__head"><span class="label">Movimento</span></div><div class="choices choices--cards">${opts}</div></div>`;
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
    if (e.target.closest("[data-surprise]")) { this.surprise(); return; }
    const fixBtn = e.target.closest("[data-advice-fix]");
    if (fixBtn) {
      const a = this.advice?.[+fixBtn.dataset.adviceFix];
      if (a) { Object.assign(this.cfg, a.patch); this.fix(); this.save(); this.renderWatch(); this.openColor = null; this.renderPanel(); toast("Ajustado"); }
      return;
    }
    const set = e.target.closest("[data-set]");
    if (set && !set.disabled) {
      const key = set.dataset.set;
      const raw = set.dataset.value;
      this.cfg[key] = key === "size" ? +raw : key === "swiss" ? raw === "1" : raw;
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
    if (e.target.closest("#copyLink")) {
      const url = shareLink(this.cfg);
      const done = () => toast("Link copiado. Quem abrir vê este relógio montado.");
      if (navigator.share && matchMedia("(pointer: coarse)").matches) {
        navigator.share({ title: "Meu relógio · Ferraro Atelier", url }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(url).then(done, () => toast(url));
      }
      return;
    }
    if (e.target.closest("#copySummary")) {
      navigator.clipboard?.writeText(this.message()).then(() => toast("Resumo copiado"), () => toast("Não foi possível copiar. Selecione o texto e copie."));
      return;
    }
    if (e.target.closest("#resetDesign")) {
      this.cfg = { ...HERO_CFG };
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
    return `Olá, Ferraro Atelier! Montei este relógio no ateliê virtual:\n\n${lines.join("\n\n")}${pics}\n\nCódigo do projeto: ${encodeProject(this.cfg)}\nVer montado: ${shareLink(this.cfg)}\n\nPodem me passar o valor e o prazo?`;
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
      <button type="button" class="link-arrow link-arrow--small" id="copyLink">Copiar link do projeto</button>
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
    if (!this.cfg) return;
    const scene = this.stack.parentElement;
    const toBack = v === "fundo";
    if (toBack === !this.back.hidden || this.flipping) { if (!this.flipping) this.render(); return; }
    this.flipping = flipWatch(toBack ? scene : this.back, toBack ? this.back : scene, toBack, () => this.render())
      .then(() => { this.flipping = null; if ((this.view === "fundo") !== !this.back.hidden) this.setView(this.view); });
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
  let hash = location.hash.slice(1);
  if (hash.startsWith("p-")) {
    const cfg = decodeProject(hash.slice(2));
    Studio.apply(cfg ? { ...DEFAULT_WATCH, ...cfg } : {}, cfg ? "resumo" : null, cfg ? "Projeto aberto a partir do link" : "Link de projeto inválido");
    hash = "personalizar";
    try { history.replaceState(null, "", "#personalizar"); } catch { /* segue com o hash antigo */ }
  }
  const studio = hash.startsWith("personalizar");
  const workshop = hash === "oficina";
  const home = !studio && !workshop;
  const wasAway = !$("#viewStudio").hidden || !$("#viewWorkshop").hidden;
  const first = !route.ran;
  route.ran = true;
  $("#viewHome").hidden = !home;
  $("#viewStudio").hidden = !studio;
  $("#viewWorkshop").hidden = !workshop;
  if (workshop) {
    window.Home?.onRoute("away");
    Workshop.init();
    window.scrollTo(0, 0);
    document.title = "Oficina · Ferraro Atelier";
  } else if (studio) {
    window.Home?.onRoute("away");
    Studio.init();
    if (!wasAway) window.scrollTo(0, 0);
    document.title = "Ateliê virtual · Ferraro Atelier";
  } else {
    document.title = "Ferraro Atelier";
    // volta do ateliê (ou abre com um endereço de seção): reposiciona a página inicial
    if (wasAway || (first && hash && hash !== "topo")) window.Home?.onRoute("home", hash);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $$(".whats-link").forEach((a) => { a.href = whatsUrl("Olá, Ferraro Atelier! Quero montar um relógio personalizado."); });
  $$(".insta-link").forEach((a) => { a.href = STORE.instagram; });
  initMovements();
  window.Home?.init();
  window.addEventListener("hashchange", route);
  route();
});
