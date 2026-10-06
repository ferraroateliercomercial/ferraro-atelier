/* Seletor de cor livre: quadrado de saturação/brilho, barra de matiz e código hexadecimal. */

const ColorPicker = (() => {
  function hexToHsv(hex) {
    const [r, g, b] = Watch.hexToRgb(hex).map((v) => v / 255);
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h, s: max ? d / max : 0, v: max };
  }

  function hsvToHex(h, s, v) {
    const f = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return Watch.rgbToHex(f(5) * 255, f(3) * 255, f(1) * 255);
  }

  const RECENT_KEY = "ct-recent-colors";
  const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; } };
  const writeRecent = (list) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch { /* sem armazenamento */ } };

  function rememberColor(hex) {
    const list = [hex, ...readRecent().filter((c) => c !== hex)].slice(0, 10);
    writeRecent(list);
  }

  /** Cria o seletor dentro de `host`. `onInput` dispara enquanto arrasta, `onCommit` ao soltar. */
  function create(host, { value, onInput, onCommit, idPrefix }) {
    let hsv = hexToHsv(value);
    host.innerHTML = `
      <div class="picker">
        <div class="picker__sv" tabindex="0" role="slider" aria-label="Saturação e brilho" aria-valuetext="">
          <span class="picker__sv-white"></span><span class="picker__sv-black"></span>
          <span class="picker__dot"></span>
        </div>
        <input class="picker__hue" id="${idPrefix}-hue" type="range" min="0" max="360" step="1" aria-label="Matiz">
        <div class="picker__row">
          <span class="picker__preview"></span>
          <label class="picker__hex"><span>HEX</span><input id="${idPrefix}-hex" type="text" maxlength="7" spellcheck="false" autocomplete="off"></label>
        </div>
        <div class="picker__recent" aria-label="Cores que você usou"></div>
      </div>`;
    const sv = host.querySelector(".picker__sv");
    const dot = host.querySelector(".picker__dot");
    const hue = host.querySelector(".picker__hue");
    const hex = host.querySelector(".picker__hex input");
    const preview = host.querySelector(".picker__preview");
    const recent = host.querySelector(".picker__recent");

    const current = () => hsvToHex(hsv.h, hsv.s, hsv.v);
    function paint(updateHex = true) {
      const c = current();
      sv.style.background = `hsl(${hsv.h} 100% 50%)`;
      dot.style.left = `${hsv.s * 100}%`;
      dot.style.top = `${(1 - hsv.v) * 100}%`;
      dot.style.background = c;
      hue.value = Math.round(hsv.h);
      preview.style.background = c;
      if (updateHex) hex.value = c.toUpperCase();
      sv.setAttribute("aria-valuetext", c.toUpperCase());
    }
    function paintRecent() {
      const list = readRecent();
      recent.hidden = list.length === 0;
      recent.innerHTML = list.length ? `<span>Usadas por você</span>` + list.map((c) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="Usar ${c}"></button>`).join("") : "";
    }
    const emit = () => onInput?.(current());
    const commit = () => { rememberColor(current()); paintRecent(); onCommit?.(current()); };

    function fromPointer(e) {
      const r = sv.getBoundingClientRect();
      hsv.s = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      hsv.v = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      paint();
      emit();
    }
    sv.addEventListener("pointerdown", (e) => {
      sv.setPointerCapture(e.pointerId);
      fromPointer(e);
      const move = (ev) => fromPointer(ev);
      const up = () => { sv.removeEventListener("pointermove", move); sv.removeEventListener("pointerup", up); commit(); };
      sv.addEventListener("pointermove", move);
      sv.addEventListener("pointerup", up);
    });
    sv.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 0.1 : 0.02;
      const map = { ArrowLeft: ["s", -step], ArrowRight: ["s", step], ArrowUp: ["v", step], ArrowDown: ["v", -step] };
      if (!map[e.key]) return;
      e.preventDefault();
      const [k, d] = map[e.key];
      hsv[k] = Math.min(1, Math.max(0, hsv[k] + d));
      paint(); emit(); commit();
    });
    hue.addEventListener("input", () => { hsv.h = +hue.value; paint(); emit(); });
    hue.addEventListener("change", commit);
    hex.addEventListener("input", () => {
      const v = hex.value.trim();
      if (/^#?[0-9a-f]{6}$/i.test(v)) { hsv = hexToHsv(v.startsWith("#") ? v : "#" + v); paint(false); emit(); }
    });
    hex.addEventListener("change", () => { paint(); commit(); });
    recent.addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]");
      if (!b) return;
      hsv = hexToHsv(b.dataset.c);
      paint(); emit(); onCommit?.(current());
    });

    paint();
    paintRecent();
    return { set(v) { hsv = hexToHsv(v); paint(); } };
  }

  return { create };
})();
