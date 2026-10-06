/* Custom Time — interações do site */

// ---------------------------------------------------------------------------
// Configurações da loja: troque pelos seus dados
// ---------------------------------------------------------------------------
const STORE = {
  // Número com DDI + DDD, só dígitos.
  whatsapp: "5548996950800",
  instagram: "https://instagram.com/",
  basePrice: 1490, // relógio base: caixa de aço + movimento automático
  engravingPrice: 60,
  carbonPrice: 1890,
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------------------------------------------------------------------------
// Opções do configurador
// ---------------------------------------------------------------------------
const OPTIONS = {
  dial: [
    { id: "oceano", label: "Azul oceano", color: "#1f5a96", ink: "#f2f6fb", texture: true, price: 0 },
    { id: "preto", label: "Preto fosco", color: "#15171b", ink: "#f2f2f2", price: 0 },
    { id: "verde", label: "Verde floresta", color: "#1f4d3a", ink: "#eef5ef", price: 80 },
    { id: "turquesa", label: "Turquesa", color: "#2b8f9c", ink: "#f2fbfb", texture: true, price: 120 },
    { id: "salmao", label: "Salmão", color: "#d99e86", ink: "#2a1a14", price: 120 },
    { id: "branco", label: "Branco gelo", color: "#ebe8e1", ink: "#1a1c20", price: 80 },
  ],
  bezel: [
    { id: "topo", label: "Aço topográfico", color: "#6c737b", ink: "#eef1f4", topo: true, price: 180 },
    { id: "ceramica", label: "Cerâmica preta", color: "#16181c", ink: "#e9ecef", price: 0 },
    { id: "azul", label: "Azul royal", color: "#1d3c78", ink: "#eef2fa", price: 60 },
    { id: "pepsi", label: "Pepsi", color: "#1d3c78", half: "#a51f2b", ink: "#f4f4f4", price: 120 },
    { id: "batman", label: "Batman", color: "#1d3c78", half: "#16181c", ink: "#f4f4f4", price: 120 },
  ],
  hands: [
    { id: "prata", label: "Prata", color: "#e6e9ee", second: "#5fd3d0", price: 0 },
    { id: "dourado", label: "Dourado", color: "#d4b062", second: "#d4b062", price: 90 },
    { id: "preto", label: "Preto", color: "#202227", second: "#e0483b", price: 40 },
    { id: "rose", label: "Rosé", color: "#d49a86", second: "#d49a86", price: 90 },
  ],
  strap: [
    { id: "nato-azul", label: "NATO azul", color: "#1e3a6e", kind: "weave", price: 0 },
    { id: "nato-preta", label: "NATO preta", color: "#1b1c20", kind: "weave", price: 0 },
    { id: "nato-oliva", label: "NATO oliva", color: "#4a5233", kind: "weave", price: 0 },
    { id: "couro", label: "Couro marrom", color: "#6b4226", kind: "leather", price: 140 },
    { id: "aco", label: "Aço Oyster", color: "#c3c9d0", kind: "links", price: 260 },
  ],
};

const GROUP_LABEL = { dial: "Mostrador", bezel: "Luneta", hands: "Ponteiros", strap: "Pulseira" };
const DEFAULT_CONFIG = { dial: "oceano", bezel: "topo", hands: "prata", strap: "nato-azul" };

// ---------------------------------------------------------------------------
// Coleção. Para usar uma foto sua, troque `config` por `image: "assets/arquivo.jpg"`
// e informe o preço em `price`.
// ---------------------------------------------------------------------------
const COLLECTION = [
  { id: "carbon", name: "Carbon Edition", ref: "CT-001", image: "assets/carbon-edition.jpg", strap: "weave", price: STORE.carbonPrice, spec: "Mostrador texturizado · luneta topográfica", tag: "Destaque", link: "#carbon" },
  { id: "abissal", name: "Abissal", ref: "CT-002", config: { dial: "preto", bezel: "pepsi", hands: "prata", strap: "aco" }, spec: "Mostrador preto · luneta Pepsi" },
  { id: "floresta", name: "Floresta", ref: "CT-003", config: { dial: "verde", bezel: "ceramica", hands: "dourado", strap: "couro" }, spec: "Mostrador verde · ponteiros dourados" },
  { id: "laguna", name: "Laguna", ref: "CT-004", config: { dial: "turquesa", bezel: "topo", hands: "prata", strap: "nato-azul" }, spec: "Mostrador turquesa · luneta topográfica" },
  { id: "gelo", name: "Gelo", ref: "CT-005", config: { dial: "branco", bezel: "batman", hands: "preto", strap: "aco" }, spec: "Mostrador branco · luneta Batman" },
  { id: "aurora", name: "Aurora", ref: "CT-006", config: { dial: "salmao", bezel: "ceramica", hands: "rose", strap: "couro" }, spec: "Mostrador salmão · ponteiros rosé" },
];

// ---------------------------------------------------------------------------
// Serviços
// ---------------------------------------------------------------------------
const SERVICE_GROUPS = [
  { title: "Relógio novo", items: [
    { id: "sob-medida", title: "Relógio sob medida", text: "Montado do zero com as peças que você escolher.", price: STORE.basePrice, from: true, link: "#personalizar" },
    { id: "carbon", title: "Carbon Edition", text: "A peça em destaque, montada para você.", price: STORE.carbonPrice },
  ] },
  { title: "Personalização", items: [
    { id: "mostrador", title: "Troca de mostrador", text: "Novo mostrador e índices para o seu relógio.", price: 220, from: true },
    { id: "luneta", title: "Troca de luneta", text: "Cerâmica, aço gravado ou bicolor.", price: 160, from: true },
    { id: "ponteiros", title: "Troca de ponteiros", text: "Prata, dourado, preto ou rosé, com lume.", price: 120, from: true },
    { id: "pulseira", title: "Pulseira nova", text: "NATO, couro ou aço, ajustada ao seu pulso.", price: 90, from: true },
    { id: "gravacao", title: "Gravação no fundo", text: "Nome, data ou mensagem.", price: STORE.engravingPrice },
  ] },
  { title: "Manutenção", items: [
    { id: "revisao", title: "Revisão do movimento", text: "Limpeza, lubrificação e regulagem.", price: 250, from: true },
    { id: "vedacao", title: "Teste de vedação", text: "Troca de juntas e teste de pressão.", price: 120 },
    { id: "polimento", title: "Polimento de caixa", text: "Acabamento escovado e polido refeito.", price: 180, from: true },
  ] },
];

// ---------------------------------------------------------------------------
// Detalhes da Carbon Edition
// ---------------------------------------------------------------------------
const CARBON_DETAILS = [
  { title: "Luneta topográfica", text: "Aço gravado com curvas de nível, como um mapa. Gira em um só sentido, com marcações azuis a cada 10 minutos." },
  { title: "Mostrador texturizado", text: "Azul profundo com textura que lembra gelo e fundo do mar. Nenhum sai igual ao outro." },
  { title: "Ponteiros e coroa", text: "Ponteiros em aço polido com lume, segundos em turquesa e coroa de rosca anodizada em azul." },
  { title: "Fundo de vidro", text: "Rotor turquesa com padrão de ondas japonês (seigaiha). É ele que dá corda ao relógio com o movimento do pulso." },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function polar(r, deg, cx = 200, cy = 260) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const pick = (group, id) => OPTIONS[group].find((o) => o.id === id);
const configPrice = (config) => STORE.basePrice + Object.keys(OPTIONS).reduce((s, g) => s + pick(g, config[g]).price, 0);
const configText = (config) => Object.keys(OPTIONS).map((g) => pick(g, config[g]).label).join(" · ");

const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: segue sem salvar */ }
  },
};

let toastTimer;
function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2400);
}

function whatsUrl(text) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
// Desenho do relógio (SVG)
// ---------------------------------------------------------------------------
const TOPO_PATHS = (() => {
  let out = "";
  for (let i = 0; i < 9; i++) {
    const base = 108 + i * 2.8;
    let d = "";
    for (let a = 0; a <= 360; a += 6) {
      const r = base + Math.sin((a + i * 37) * 0.07) * 1.4 + Math.cos((a * 3 + i * 11) * 0.031) * 1.1;
      const [x, y] = polar(r, a);
      d += `${a ? "L" : "M"}${x} ${y}`;
    }
    out += `<path d="${d}Z" fill="none" stroke="#2b3036" stroke-opacity=".55" stroke-width=".7"/>`;
  }
  return out;
})();

function watchSVG(config, { time = { h: 10, m: 8, s: 38 }, title = "Desenho do relógio" } = {}) {
  const dial = pick("dial", config.dial);
  const bezel = pick("bezel", config.bezel);
  const hands = pick("hands", config.hands);
  const strap = pick("strap", config.strap);

  // pulseira
  let strapSvg = "";
  for (const y of [0, 370]) {
    if (strap.kind === "links") {
      strapSvg += `<rect x="138" y="${y}" width="124" height="150" rx="4" fill="url(#links)"/>`;
    } else {
      strapSvg += `<rect x="138" y="${y}" width="124" height="150" rx="10" fill="${strap.color}"/>`;
      strapSvg += `<rect x="138" y="${y}" width="124" height="150" rx="10" fill="url(#${strap.kind})"/>`;
      if (strap.kind === "leather") strapSvg += `<rect x="143" y="${y + 5}" width="114" height="140" rx="7" fill="none" stroke="#e8d6c0" stroke-opacity=".55" stroke-dasharray="4 3"/>`;
    }
  }

  // luneta
  let bezelSvg = `<circle cx="200" cy="260" r="132" fill="${bezel.color}"/>`;
  if (bezel.half) bezelSvg += `<path d="M68 260 A132 132 0 0 1 332 260 Z" fill="${bezel.half}"/>`;
  if (bezel.topo) bezelSvg += TOPO_PATHS;
  const [tx, ty] = polar(124, 0);
  bezelSvg += `<path d="M${tx - 7} ${ty - 5} L${tx + 7} ${ty - 5} L${tx} ${ty + 7} Z" fill="${bezel.ink}"/><circle cx="${tx}" cy="${ty - 0.5}" r="2.4" fill="#cfe9f6"/>`;
  for (let m = 5; m < 60; m += 5) {
    const deg = m * 6;
    const [x, y] = polar(119, deg);
    bezelSvg += m % 10 === 0
      ? `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Jost, sans-serif" font-size="15" font-weight="500" fill="${bezel.ink}" transform="rotate(${deg} ${x} ${y})">${m}</text>`
      : `<rect x="${x - 2}" y="${y - 7}" width="4" height="14" rx="1" fill="${bezel.topo ? "#4fb3e8" : bezel.ink}" transform="rotate(${deg} ${x} ${y})"/>`;
  }
  for (let m = 1; m < 15; m++) {
    if (m % 5 === 0) continue;
    const [x1, y1] = polar(130, m * 6);
    const [x2, y2] = polar(124, m * 6);
    bezelSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${bezel.ink}" stroke-width="1.4"/>`;
  }

  // índices e minutos
  let idx = "";
  for (let h = 0; h < 12; h++) {
    if (h === 3) continue; // janela da data
    const deg = h * 30;
    const len = h % 3 === 0 ? 18 : 14;
    const [x, y] = polar(94 - len / 2, deg);
    const bar = (dx) => `<rect x="${x - 2.5 + dx}" y="${y - len / 2}" width="5" height="${len}" rx="1.2" fill="#f3f6ea" stroke="${hands.color}" stroke-width="1.2" transform="rotate(${deg} ${x} ${y})"/>`;
    idx += h === 0 ? bar(-4) + bar(4) : bar(0);
  }
  for (let m = 0; m < 60; m++) {
    if (m % 5 === 0) continue;
    const [x1, y1] = polar(101, m * 6);
    const [x2, y2] = polar(97, m * 6);
    idx += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${dial.ink}" stroke-width=".8"/>`;
  }

  const sec = time.s;
  const min = time.m + sec / 60;
  const hr = (time.h % 12) + min / 60;

  return `<svg viewBox="0 0 400 520" role="img" aria-label="${escapeHtml(title)}">
    <g>${strapSvg}</g>
    <path d="M140 150 L150 120 H250 L260 150 Z M140 370 L150 400 H250 L260 370 Z" fill="url(#steel)"/>
    <rect x="338" y="246" width="24" height="28" rx="5" fill="url(#steel)"/>
    <circle cx="200" cy="260" r="140" fill="url(#steel)"/>
    <circle cx="200" cy="260" r="136" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    ${bezelSvg}
    <circle cx="200" cy="260" r="104" fill="#1b1f24"/>
    <circle cx="200" cy="260" r="102" fill="${dial.color}"/>
    ${dial.texture ? '<rect x="96" y="156" width="208" height="208" fill="url(#texture)" clip-path="url(#dialClip)"/>' : ""}
    <circle cx="200" cy="260" r="102" fill="url(#dialShade)"/>
    ${idx}
    <rect x="262" y="250" width="26" height="20" rx="2" fill="#f4f4f1" stroke="#999" stroke-width=".8"/>
    <text x="275" y="265" text-anchor="middle" font-family="Jost, sans-serif" font-size="12" font-weight="500" fill="#111">${new Date().getDate()}</text>
    <text x="200" y="210" text-anchor="middle" font-family="'Bodoni Moda', Georgia, serif" font-size="11" letter-spacing="1.5" fill="${dial.ink}">Custom Time</text>
    <text x="200" y="306" text-anchor="middle" font-family="Jost, sans-serif" font-size="6" letter-spacing="1.6" fill="${dial.ink}">AUTOMATIC · 200m</text>
    <g data-hand="h" transform="rotate(${hr * 30} 200 260)"><path d="M196 268 L196 205 L200 196 L204 205 L204 268 Z" fill="${hands.color}"/><rect x="197.5" y="208" width="5" height="40" rx="1.5" fill="#f3f6ea"/></g>
    <g data-hand="m" transform="rotate(${min * 6} 200 260)"><path d="M197 270 L197 178 L200 168 L203 178 L203 270 Z" fill="${hands.color}"/><rect x="198.3" y="180" width="3.4" height="62" rx="1.2" fill="#f3f6ea"/></g>
    <g data-hand="s" transform="rotate(${sec * 6} 200 260)"><rect x="199.2" y="182" width="1.6" height="100" fill="${hands.second}"/><circle cx="200" cy="215" r="4" fill="${hands.second}"/></g>
    <circle cx="200" cy="260" r="5" fill="${hands.color}"/>
    <circle cx="200" cy="260" r="2" fill="${hands.second}"/>
    <ellipse cx="160" cy="200" rx="70" ry="38" fill="#fff" opacity=".06" transform="rotate(-30 160 200)"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Cabeçalho
// ---------------------------------------------------------------------------
function initNav() {
  const menu = $("#menu");
  const btn = $("#menuBtn");
  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
}

// ---------------------------------------------------------------------------
// Coleção
// ---------------------------------------------------------------------------
function productPrice(p) { return p.config ? configPrice(p.config) : p.price; }
function productStrap(p) { return p.config ? pick("strap", p.config.strap).kind : p.strap; }

function initCollection() {
  const grid = $("#products");
  const render = (filter) => {
    const list = COLLECTION.filter((p) => filter === "todos" || productStrap(p) === filter);
    $("#productCount").textContent = `${list.length} ${list.length === 1 ? "peça" : "peças"}`;
    grid.innerHTML = list.map((p) => `
      <article class="item">
        <a class="item__media" href="${p.link || "#personalizar"}" data-open="${p.id}" aria-label="${p.link ? "Ver" : "Personalizar"} ${escapeHtml(p.name)}">
          ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />` : watchSVG(p.config, { title: p.name })}
          ${p.tag ? `<span class="item__tag">${p.tag}</span>` : ""}
        </a>
        <div class="item__body">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="item__spec">${escapeHtml(p.spec)}</p>
          <p class="item__price">${brl.format(productPrice(p))}</p>
          <div class="item__actions">
            <button type="button" data-add="${p.id}">Adicionar à sacola</button>
            ${p.config ? `<a href="#personalizar" data-open="${p.id}">Personalizar</a>` : `<a href="${p.link}">Ver detalhes</a>`}
          </div>
        </div>
      </article>`).join("");
  };
  render("todos");

  $$(".tabs button").forEach((tab) => tab.addEventListener("click", () => {
    $$(".tabs button").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    render(tab.dataset.filter);
  }));

  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const p = COLLECTION.find((x) => x.id === add.dataset.add);
      cart.add({ title: p.name, detail: p.config ? configText(p.config) : p.spec, price: productPrice(p) });
      return;
    }
    const open = e.target.closest("[data-open]");
    const p = open && COLLECTION.find((x) => x.id === open.dataset.open);
    if (p?.config) builder.load(p.config);
  });
}

// ---------------------------------------------------------------------------
// Ficha da Carbon Edition
// ---------------------------------------------------------------------------
function initCarbon() {
  $("#carbonPrice").textContent = brl.format(STORE.carbonPrice);
  $("#carbonDetails").innerHTML = CARBON_DETAILS.map((d, i) => `
    <details ${i === 0 ? "open" : ""}><summary>${d.title}</summary><p>${d.text}</p></details>`).join("");

  const main = $("#galleryMain");
  $$(".product__thumbs button").forEach((b) => b.addEventListener("click", () => {
    $$(".product__thumbs button").forEach((t) => t.setAttribute("aria-selected", String(t === b)));
    main.src = b.dataset.src;
    main.alt = b.dataset.alt;
    main.style.animation = "none"; void main.offsetWidth; main.style.animation = "";
  }));

  $("#addCarbon").addEventListener("click", () => cart.add({ title: "Carbon Edition", detail: "Ref. CT-001", price: STORE.carbonPrice }));
  $("#askCarbon").href = whatsUrl("Olá, Custom Time! Quero saber mais sobre o Carbon Edition.");
}

// ---------------------------------------------------------------------------
// Personalizar
// ---------------------------------------------------------------------------
const builder = {
  config: { ...DEFAULT_CONFIG },

  init() {
    for (const [group, opts] of Object.entries(OPTIONS)) {
      const wrap = $(`.option[data-group="${group}"] .option__swatches`);
      wrap.innerHTML = opts.map((o) => {
        const id = `opt-${group}-${o.id}`;
        const bg = o.half ? `linear-gradient(180deg, ${o.half} 50%, ${o.color} 50%)` : o.color;
        const title = `${o.label}${o.price ? ` (+${brl.format(o.price)})` : ""}`;
        return `<span class="sw"><input type="radio" name="${group}" id="${id}" value="${o.id}"><label for="${id}" title="${title}" style="background:${bg}"></label></span>`;
      }).join("");
      $$("label", wrap).forEach((l, i) => l.setAttribute("aria-label", opts[i].label));
    }
    $("#engravingPrice").textContent = `opcional, + ${brl.format(STORE.engravingPrice)}`;

    const form = $("#builder");
    form.addEventListener("change", (e) => {
      if (e.target.name in OPTIONS) { this.config[e.target.name] = e.target.value; this.render(); }
    });
    $("#engraving").addEventListener("input", () => this.render());
    $("#randomize").addEventListener("click", () => {
      const cfg = {};
      for (const g of Object.keys(OPTIONS)) cfg[g] = OPTIONS[g][Math.floor(Math.random() * OPTIONS[g].length)].id;
      this.load(cfg, false);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { lines, total } = this.summary();
      cart.add({ title: "Relógio sob medida", detail: lines.map((l) => l.value).join(" · "), price: total });
    });

    this.load(this.config, false);
    this.startClock();
  },

  load(config, notify = true) {
    this.config = { ...config };
    for (const g of Object.keys(OPTIONS)) $(`#opt-${g}-${this.config[g]}`).checked = true;
    this.render();
    if (notify) toast("Combinação carregada no configurador");
  },

  summary() {
    const lines = Object.keys(OPTIONS).map((g) => {
      const o = pick(g, this.config[g]);
      return { label: GROUP_LABEL[g], value: o.label, price: o.price };
    });
    const engraving = $("#engraving").value.trim();
    if (engraving) lines.push({ label: "Gravação", value: `“${engraving}”`, price: STORE.engravingPrice });
    return { lines, total: STORE.basePrice + lines.reduce((s, l) => s + l.price, 0) };
  },

  render() {
    $("#builderWatch").innerHTML = watchSVG(this.config, { time: this.now(), title: "Prévia do seu relógio" });
    this.hands = {
      h: $('#builderWatch [data-hand="h"]'),
      m: $('#builderWatch [data-hand="m"]'),
      s: $('#builderWatch [data-hand="s"]'),
    };
    for (const g of Object.keys(OPTIONS)) {
      const o = pick(g, this.config[g]);
      $(`.option[data-group="${g}"] .option__value`).textContent = o.price ? `${o.label} · +${brl.format(o.price)}` : o.label;
    }

    const engraving = $("#engraving").value.trim();
    const preview = $("#engravingPreview");
    preview.hidden = !engraving;
    $("em", preview).textContent = `“${engraving}”`;

    const { lines, total } = this.summary();
    $("#summaryList").innerHTML = `<li><span>Caixa de aço e movimento automático</span><span>${brl.format(STORE.basePrice)}</span></li>` +
      lines.map((l) => `<li><span>${l.label}: ${escapeHtml(l.value)}</span><span>${l.price ? "+ " + brl.format(l.price) : "incluso"}</span></li>`).join("");
    $("#total").textContent = brl.format(total);
  },

  reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  now() {
    const d = new Date();
    return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() + (this.reduced ? 0 : d.getMilliseconds() / 1000) };
  },

  startClock() {
    const frame = () => {
      const { h, m, s } = this.now();
      const min = m + s / 60;
      const hr = (h % 12) + min / 60;
      this.hands.h.setAttribute("transform", `rotate(${hr * 30} 200 260)`);
      this.hands.m.setAttribute("transform", `rotate(${min * 6} 200 260)`);
      this.hands.s.setAttribute("transform", `rotate(${s * 6} 200 260)`);
      if (this.reduced) setTimeout(frame, 1000); else requestAnimationFrame(frame);
    };
    frame();
  },
};

// ---------------------------------------------------------------------------
// Serviços
// ---------------------------------------------------------------------------
function initServices() {
  const all = SERVICE_GROUPS.flatMap((g) => g.items);
  const wrap = $("#services");
  wrap.innerHTML = SERVICE_GROUPS.map((g) => `
    <div class="price-group">
      <h3>${g.title}</h3>
      <ul>${g.items.map((s) => `
        <li class="price-row">
          <div class="price-row__top">
            <span class="price-row__name">${s.title}</span>
            <span class="price-row__dots" aria-hidden="true"></span>
            <span class="price-row__price">${s.from ? "<small>a partir de</small>" : ""}${brl.format(s.price)}</span>
          </div>
          <p>${s.text}</p>
          ${s.link ? `<a class="price-row__add" href="${s.link}">Personalizar</a>` : `<button type="button" class="price-row__add" data-add="${s.id}">Adicionar à sacola</button>`}
        </li>`).join("")}
      </ul>
    </div>`).join("");

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const s = all.find((x) => x.id === btn.dataset.add);
    cart.add({ title: s.title, detail: s.from ? "Valor inicial, confirmado na avaliação" : "", price: s.price });
  });
}

// ---------------------------------------------------------------------------
// Sacola e envio pelo WhatsApp
// ---------------------------------------------------------------------------
const cart = {
  items: storage.get("ct-cart", []),

  init() {
    $("#cartOpen").addEventListener("click", () => this.open());
    $$("[data-close]").forEach((el) => el.addEventListener("click", () => this.close()));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") this.close(); });
    $("#cartList").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (btn) this.remove(Number(btn.dataset.remove));
    });
    this.render();
  },

  add(item) {
    this.items.push(item);
    this.save();
    toast(`${item.title} na sacola`);
    const btn = $("#cartOpen");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  },

  remove(index) {
    this.items.splice(index, 1);
    this.save();
  },

  save() {
    storage.set("ct-cart", this.items);
    this.render();
  },

  total() { return this.items.reduce((s, i) => s + i.price, 0); },

  render() {
    const empty = this.items.length === 0;
    $("#cartCount").textContent = this.items.length;
    $("#cartEmpty").hidden = !empty;
    $("#cartTotal").textContent = brl.format(this.total());
    const checkout = $("#checkout");
    checkout.setAttribute("aria-disabled", String(empty));
    checkout.href = empty ? "#" : this.checkoutUrl();
    $("#cartList").innerHTML = this.items.map((i, idx) => `
      <li class="drawer__item">
        <h3>${escapeHtml(i.title)}</h3>
        <strong>${brl.format(i.price)}</strong>
        ${i.detail ? `<p>${escapeHtml(i.detail)}</p>` : ""}
        <button class="drawer__remove" data-remove="${idx}">Remover</button>
      </li>`).join("");
  },

  open() {
    this.lastFocus = document.activeElement;
    const d = $("#drawer");
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
    $(".drawer__close").focus();
  },

  close() {
    const d = $("#drawer");
    if (!d.classList.contains("is-open")) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    this.lastFocus?.focus();
  },

  checkoutUrl() {
    const lines = this.items.map((i, n) => `${n + 1}. ${i.title} — ${brl.format(i.price)}${i.detail ? `\n   ${i.detail}` : ""}`);
    const msg = `Olá, Custom Time! Quero fazer este pedido:\n\n${lines.join("\n")}\n\nTotal estimado: ${brl.format(this.total())}`;
    return whatsUrl(msg);
  },
};

// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#whatsLink").href = whatsUrl("Olá, Custom Time! Tenho uma ideia de relógio personalizado.");
  $("#instaLink").href = STORE.instagram;
  initNav();
  initCollection();
  initCarbon();
  builder.init();
  initServices();
  cart.init();
});
