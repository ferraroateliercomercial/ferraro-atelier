/* Custom Time — interações do site */

// ---------------------------------------------------------------------------
// Configurações da loja: troque pelos seus dados
// ---------------------------------------------------------------------------
const STORE = {
  // Número com DDI + DDD, só dígitos. Ex.: "5511999998888".
  // Vazio: o WhatsApp abre e o cliente escolhe o contato.
  whatsapp: "5548996950800",
  instagram: "https://instagram.com/",
  basePrice: 1490, // relógio base: caixa de aço + movimento automático
  engravingPrice: 60,
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const SVG_NS = "http://www.w3.org/2000/svg";

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
// Serviços
// ---------------------------------------------------------------------------
const ICONS = {
  watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1M9 6l1-4h4l1 4M9 18l1 4h4l1-4"/>',
  dial: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v2M21 12h-2M12 21v-2M3 12h2"/>',
  bezel: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6"/><path d="M12 3l1.5 2.5h-3Z"/>',
  hands: '<circle cx="12" cy="12" r="9"/><path d="M12 12V6M12 12l4 3"/>',
  strap: '<rect x="8" y="2" width="8" height="20" rx="2"/><path d="M8 8h8M8 16h8"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M13 7l4 4"/>',
  wrench: '<path d="M14 6a4 4 0 0 0 5 5l-8 8a2 2 0 0 1-3-3l8-8a4 4 0 0 0-2-2Z"/>',
  drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/>',
};

const SERVICES = [
  { id: "sob-medida", cat: "novo", icon: "watch", title: "Relógio sob medida", text: "Do zero, com as peças que você escolher. Montado, regulado e testado.", price: STORE.basePrice, from: true, cta: "monte" },
  { id: "replica-carbon", cat: "novo", icon: "watch", title: "Carbon Edition", text: "A peça da foto: mostrador azul texturizado, luneta topográfica e fundo de vidro.", price: 1890 },
  { id: "mostrador", cat: "personalizar", icon: "dial", title: "Troca de mostrador", text: "Novo mostrador e índices para o seu relógio, com acabamento original.", price: 220, from: true },
  { id: "luneta", cat: "personalizar", icon: "bezel", title: "Troca de luneta", text: "Cerâmica, aço gravado ou bicolor. Muda a cara do relógio na hora.", price: 160, from: true },
  { id: "ponteiros", cat: "personalizar", icon: "hands", title: "Troca de ponteiros", text: "Ponteiros em prata, dourado, preto ou rosé, com lume.", price: 120, from: true },
  { id: "pulseira", cat: "personalizar", icon: "strap", title: "Pulseira nova", text: "NATO, couro ou aço, ajustada ao seu pulso.", price: 90, from: true },
  { id: "gravacao", cat: "personalizar", icon: "pen", title: "Gravação no fundo", text: "Nome, data ou mensagem gravada no fundo da caixa.", price: STORE.engravingPrice },
  { id: "revisao", cat: "cuidado", icon: "wrench", title: "Revisão do movimento", text: "Limpeza, lubrificação e regulagem do automático.", price: 250, from: true },
  { id: "vedacao", cat: "cuidado", icon: "drop", title: "Teste de vedação", text: "Troca de juntas e teste de pressão para voltar a mergulhar tranquilo.", price: 120 },
];

// ---------------------------------------------------------------------------
// Detalhes da Carbon Edition (pontos na foto)
// ---------------------------------------------------------------------------
const SPOTS = [
  { title: "Luneta topográfica", text: "Aço gravado com curvas de nível, como um mapa. Gira em um só sentido, com marcações azuis a cada 10 minutos." },
  { title: "Mostrador texturizado", text: "Azul profundo com textura que lembra gelo e fundo do mar. Cada mostrador sai com um desenho diferente." },
  { title: "Ponteiros com lume", text: "Ponteiros em aço polido com material luminescente, e o ponteiro de segundos em turquesa." },
  { title: "Coroa azul", text: "Coroa de rosca anodizada em azul, combinando com o mostrador e a pulseira." },
  { title: "Data com lupa", text: "Janela de data às 3 horas com lupa no vidro, para ler o dia sem esforço." },
  { title: "Pulseira NATO", text: "Nylon trançado azul, resistente à água e fácil de trocar." },
  { title: "Rotor decorado", text: "Rotor em turquesa com padrão de ondas japonês (seigaiha). É ele que dá corda ao relógio com o movimento do pulso." },
  { title: "Fundo de vidro", text: "Fundo transparente para ver o movimento automático trabalhando." },
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
function svg(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function polar(r, deg, cx = 200, cy = 260) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

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

// ---------------------------------------------------------------------------
// Navegação
// ---------------------------------------------------------------------------
function initNav() {
  const nav = $("#nav");
  const menu = $("#menu");
  const btn = $("#menuBtn");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    nav.classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
}

function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) return items.forEach((el) => el.classList.add("is-in"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Hero: inclinação da foto e relógio ao vivo
// ---------------------------------------------------------------------------
function initHero() {
  const visual = $("#heroVisual");
  const img = $("#heroImg");
  if (window.matchMedia("(hover: hover)").matches) {
    visual.addEventListener("mousemove", (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      img.style.setProperty("--ry", `${x * 10}deg`);
      img.style.setProperty("--rx", `${-y * 10}deg`);
    });
    visual.addEventListener("mouseleave", () => {
      img.style.setProperty("--ry", "0deg");
      img.style.setProperty("--rx", "0deg");
    });
  }
  const clock = $("#liveClock");
  const tick = () => { clock.textContent = new Date().toLocaleTimeString("pt-BR"); };
  tick();
  setInterval(tick, 1000);
}

// ---------------------------------------------------------------------------
// Carbon Edition: pontos interativos
// ---------------------------------------------------------------------------
function initShowcase() {
  let current = 0;
  const dots = $("#spotDots");
  SPOTS.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Detalhe ${i + 1}`);
    b.addEventListener("click", () => show(i));
    dots.append(b);
  });

  const setView = (view) => {
    $$(".showcase__toggle button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === view)));
    $$(".showcase__view").forEach((f) => f.classList.toggle("is-active", f.dataset.view === view));
  };

  function show(i) {
    current = (i + SPOTS.length) % SPOTS.length;
    const spot = SPOTS[current];
    const hotspot = $(`.hotspot[data-spot="${current}"]`);
    setView(hotspot.closest(".showcase__view").dataset.view);
    $$(".hotspot").forEach((h) => h.classList.toggle("is-active", h === hotspot));
    $$("button", dots).forEach((d, k) => d.classList.toggle("is-active", k === current));
    $("#spotNum").textContent = String(current + 1).padStart(2, "0");
    $("#spotTitle").textContent = spot.title;
    $("#spotText").textContent = spot.text;
    $$("#spotTitle, #spotText").forEach((el) => {
      el.classList.remove("is-changing"); void el.offsetWidth; el.classList.add("is-changing");
    });
  }

  $$(".hotspot").forEach((h) => h.addEventListener("click", () => show(Number(h.dataset.spot))));
  $$(".showcase__toggle button").forEach((b) => b.addEventListener("click", () => {
    const first = SPOTS.findIndex((_, i) => $(`.hotspot[data-spot="${i}"]`).closest(".showcase__view").dataset.view === b.dataset.view);
    show(first);
  }));
  $("#spotPrev").addEventListener("click", () => show(current - 1));
  $("#spotNext").addEventListener("click", () => show(current + 1));
  $("#addCarbon").addEventListener("click", () => {
    const s = SERVICES.find((x) => x.id === "replica-carbon");
    cart.add({ title: s.title, detail: "Igual à peça da foto", price: s.price });
  });
  show(0);
}

// ---------------------------------------------------------------------------
// Configurador
// ---------------------------------------------------------------------------
const builder = {
  config: { ...DEFAULT_CONFIG },

  init() {
    for (const [group, opts] of Object.entries(OPTIONS)) {
      const wrap = $(`.swatches[data-group="${group}"]`);
      opts.forEach((o) => {
        const id = `opt-${group}-${o.id}`;
        const div = document.createElement("div");
        div.className = "swatch";
        const bg = o.half ? `linear-gradient(180deg, ${o.half} 50%, ${o.color} 50%)` : o.color;
        div.innerHTML = `
          <input type="radio" name="${group}" id="${id}" value="${o.id}" ${this.config[group] === o.id ? "checked" : ""}>
          <label for="${id}">
            <span class="swatch__color" style="background:${bg}"></span>
            <span>${o.label}${o.price ? ` <span class="swatch__price">+${brl.format(o.price)}</span>` : ""}</span>
          </label>`;
        wrap.append(div);
      });
    }

    const form = $("#builder");
    form.addEventListener("change", (e) => {
      if (e.target.name in OPTIONS) { this.config[e.target.name] = e.target.value; this.render(); }
    });
    $("#engraving").addEventListener("input", () => this.render());
    $("#randomize").addEventListener("click", () => this.randomize());
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { lines, total } = this.summary();
      cart.add({ title: "Relógio sob medida", detail: lines.map((l) => l.value).join(" · "), price: total });
    });

    $("#dateText").textContent = new Date().getDate();
    this.drawIndices();
    this.render();
    this.startClock();
  },

  pick(group) { return OPTIONS[group].find((o) => o.id === this.config[group]); },

  summary() {
    const lines = Object.keys(OPTIONS).map((g) => {
      const o = this.pick(g);
      return { label: GROUP_LABEL[g], value: o.label, price: o.price };
    });
    const engraving = $("#engraving").value.trim();
    if (engraving) lines.push({ label: "Gravação", value: `“${engraving}”`, price: STORE.engravingPrice });
    const total = STORE.basePrice + lines.reduce((s, l) => s + l.price, 0);
    return { lines, total };
  },

  randomize() {
    for (const g of Object.keys(OPTIONS)) {
      const opts = OPTIONS[g];
      this.config[g] = opts[Math.floor(Math.random() * opts.length)].id;
      $(`#opt-${g}-${this.config[g]}`).checked = true;
    }
    this.render();
  },

  drawIndices() {
    const g = $("#indices");
    for (let h = 0; h < 12; h++) {
      if (h === 3) continue; // janela da data
      const deg = h * 30;
      const wide = h === 0;
      const len = h % 3 === 0 ? 18 : 14;
      const w = 5;
      const [x, y] = polar(94 - len / 2, deg);
      const make = (dx) => svg("rect", {
        x: x - w / 2 + dx, y: y - len / 2, width: w, height: len, rx: 1.2,
        transform: `rotate(${deg} ${x} ${y})`, class: "index",
      });
      if (wide) { g.append(make(-4), make(4)); } else { g.append(make(0)); }
    }
    // minutos
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(101, m * 6);
      const [x2, y2] = polar(97, m * 6);
      g.append(svg("line", { x1, y1, x2, y2, class: "minute-tick", "stroke-width": 0.8 }));
    }
  },

  drawBezel(b) {
    const pat = $("#bezelPattern");
    const marks = $("#bezelMarks");
    pat.replaceChildren();
    marks.replaceChildren();
    $("#bezel").setAttribute("fill", b.color);

    if (b.half) pat.append(svg("path", { d: "M68 260 A132 132 0 0 1 332 260 Z", fill: b.half }));
    if (b.topo) {
      // curvas de nível irregulares
      for (let i = 0; i < 9; i++) {
        const base = 108 + i * 2.8;
        let d = "";
        for (let a = 0; a <= 360; a += 6) {
          const r = base + Math.sin((a + i * 37) * 0.07) * 1.4 + Math.cos((a * 3 + i * 11) * 0.031) * 1.1;
          const [x, y] = polar(r, a);
          d += `${a ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        }
        pat.append(svg("path", { d: `${d}Z`, fill: "none", stroke: "#2b3036", "stroke-opacity": 0.55, "stroke-width": 0.7 }));
      }
    }

    // triângulo no 12
    const [tx, ty] = polar(124, 0);
    marks.append(svg("path", { d: `M${tx - 7} ${ty - 5} L${tx + 7} ${ty - 5} L${tx} ${ty + 7} Z`, fill: b.ink }));
    marks.append(svg("circle", { cx: tx, cy: ty - 0.5, r: 2.4, fill: "#cfe9f6" }));
    for (let m = 5; m < 60; m += 5) {
      const deg = m * 6;
      const [x, y] = polar(119, deg);
      if (m % 10 === 0) {
        const t = svg("text", { x, y: y + 5, "text-anchor": "middle", class: "bezel-num", fill: b.ink, transform: `rotate(${deg} ${x} ${y})` });
        t.textContent = m;
        marks.append(t);
      } else {
        marks.append(svg("rect", { x: x - 2, y: y - 7, width: 4, height: 14, rx: 1, fill: b.topo ? "#4fb3e8" : b.ink, transform: `rotate(${deg} ${x} ${y})` }));
      }
    }
    for (let m = 1; m < 15; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(130, m * 6);
      const [x2, y2] = polar(124, m * 6);
      marks.append(svg("line", { x1, y1, x2, y2, stroke: b.ink, "stroke-width": 1.4 }));
    }
  },

  drawStrap(s) {
    const g = $("#strap");
    g.replaceChildren();
    for (const y of [0, 370]) {
      const fill = s.kind === "links" ? "url(#links)" : s.color;
      g.append(svg("rect", { x: 138, y, width: 124, height: 150, rx: s.kind === "links" ? 4 : 10, fill }));
      if (s.kind === "weave") g.append(svg("rect", { x: 138, y, width: 124, height: 150, rx: 10, fill: "url(#weave)" }));
      if (s.kind === "leather") {
        g.append(svg("rect", { x: 138, y, width: 124, height: 150, rx: 10, fill: "url(#leather)" }));
        g.append(svg("rect", { x: 143, y: y + 5, width: 114, height: 140, rx: 7, fill: "none", stroke: "#e8d6c0", "stroke-opacity": 0.55, "stroke-dasharray": "4 3" }));
      }
    }
  },

  render() {
    const dial = this.pick("dial");
    const bezel = this.pick("bezel");
    const hands = this.pick("hands");
    const strap = this.pick("strap");

    $("#dial").setAttribute("fill", dial.color);
    $("#dialTexture").style.display = dial.texture ? "" : "none";
    $$(".dial-text").forEach((t) => t.setAttribute("fill", dial.ink));
    $$(".minute-tick").forEach((t) => t.setAttribute("stroke", dial.ink));
    $$(".index").forEach((i) => { i.setAttribute("fill", "#f3f6ea"); i.setAttribute("stroke", hands.color); i.setAttribute("stroke-width", 1.2); });
    $$(".hand").forEach((h) => h.setAttribute("fill", hands.color));
    $$(".lume").forEach((l) => l.setAttribute("fill", "#f3f6ea"));
    $("#secondBar").setAttribute("fill", hands.second);
    $("#secondDot").setAttribute("fill", hands.second);
    $("#pinion").setAttribute("fill", hands.second);
    $("#crown").setAttribute("fill", "url(#steel)");
    this.drawBezel(bezel);
    this.drawStrap(strap);

    const engraving = $("#engraving").value.trim();
    const preview = $("#engravingPreview");
    preview.hidden = !engraving;
    $("strong", preview).textContent = `“${engraving}”`;

    const { lines, total } = this.summary();
    $("#summaryList").innerHTML = `<li><span>Relógio base (automático)</span><span>${brl.format(STORE.basePrice)}</span></li>` +
      lines.map((l) => `<li><span>${l.label}: ${escapeHtml(l.value)}</span><span>${l.price ? "+" + brl.format(l.price) : "incluso"}</span></li>`).join("");
    $("#total").textContent = brl.format(total);
  },

  startClock() {
    const hour = $("#hourHand");
    const minute = $("#minuteHand");
    const second = $("#secondHand");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = () => {
      const now = new Date();
      const s = now.getSeconds() + (reduced ? 0 : now.getMilliseconds() / 1000);
      const m = now.getMinutes() + s / 60;
      const h = (now.getHours() % 12) + m / 60;
      hour.setAttribute("transform", `rotate(${h * 30} 200 260)`);
      minute.setAttribute("transform", `rotate(${m * 6} 200 260)`);
      second.setAttribute("transform", `rotate(${s * 6} 200 260)`);
      if (reduced) setTimeout(frame, 1000); else requestAnimationFrame(frame);
    };
    frame();
  },
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------------------------------------------------------------------------
// Serviços com filtro
// ---------------------------------------------------------------------------
function initServices() {
  const wrap = $("#services");
  const render = (filter) => {
    wrap.innerHTML = SERVICES.filter((s) => filter === "todos" || s.cat === filter).map((s) => `
      <article class="card">
        <div class="card__icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[s.icon]}</svg></div>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <div class="card__foot">
          <span class="card__price">${s.from ? "a partir de" : "valor"}<strong>${brl.format(s.price)}</strong></span>
          ${s.cta === "monte"
            ? '<a class="btn btn--ghost" href="#monte">Montar</a>'
            : `<button class="btn btn--ghost" data-add="${s.id}">Adicionar</button>`}
        </div>
      </article>`).join("");
  };
  render("todos");

  $$(".filters .chip").forEach((chip) => chip.addEventListener("click", () => {
    $$(".filters .chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    render(chip.dataset.filter);
  }));

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const s = SERVICES.find((x) => x.id === btn.dataset.add);
    cart.add({ title: s.title, detail: s.from ? "Valor inicial, confirmado na avaliação" : "", price: s.price });
  });
}

// ---------------------------------------------------------------------------
// Pedido (carrinho) e envio pelo WhatsApp
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
    $("#checkout").addEventListener("click", (e) => { if (!this.items.length) e.preventDefault(); });
    this.render();
  },

  add(item) {
    this.items.push({ ...item, key: Date.now() + Math.random() });
    this.save();
    toast(`${item.title} adicionado ao pedido`);
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
    const count = $("#cartCount");
    count.textContent = this.items.length;
    count.toggleAttribute("data-zero", this.items.length === 0);
    $("#cartEmpty").hidden = this.items.length > 0;
    const checkout = $("#checkout");
    checkout.setAttribute("aria-disabled", String(this.items.length === 0));
    checkout.href = this.items.length ? this.checkoutUrl() : "#";
    $("#cartTotal").textContent = brl.format(this.total());
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
    $(".drawer__head .icon-btn").focus();
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

function whatsUrl(text) {
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}

// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#whatsLink").href = whatsUrl("Olá, Custom Time! Tenho uma ideia de relógio personalizado.");
  $("#instaLink").href = STORE.instagram;
  initNav();
  initReveal();
  initHero();
  initShowcase();
  builder.init();
  initServices();
  cart.init();
});
