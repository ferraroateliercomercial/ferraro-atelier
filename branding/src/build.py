"""Gera as peças impressas da Ferraro Atelier (HTML com medidas em milímetros) e as texturas de laca.

Rodar da raiz do repositório:  python3 branding/src/build.py
Depois:                        node branding/src/render.mjs   (PDF, conversão para CMYK e prévias)

Cada peça tem a área de corte (formato final) mais 3 mm de sangria de cada lado. Nada importante fica a menos de
4 mm do corte (margem de segurança).
"""
import math
import os
import re

import numpy as np
from PIL import Image
import segno

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(ROOT, "..", ".."))
IMG = os.path.join(ROOT, "img")
HTML = os.path.join(ROOT, "html")
os.makedirs(IMG, exist_ok=True)
os.makedirs(HTML, exist_ok=True)

BLEED = 3.0  # mm

# ---------------------------------------------------------------- paleta (a mesma do site: DESIGN.md)
LQ, LQ_HI, LQ_LO = "#46603a", "#7f9c5f", "#0f190d"
LINEN, INK, INK2 = "#ebe5d4", "#2a2119", "#5f5244"
PRINT, SAGE = "#efe6cf", "#c6cdaf"
GOLD, GOLD_INK = "#d4ad5c", "#7a5a1c"

WHATS = "(48) 99695-0800"
WHATS_URL = "https://wa.me/5548996950800"
INSTA = "@ferraro_atelier"


def hex2rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


# ---------------------------------------------------------------- logos recoloridos
def logo(name, color, src):
    """Copia um SVG da logo trocando a cor. Devolve o caminho relativo ao HTML."""
    s = open(os.path.join(REPO, src)).read()
    s = re.sub(r'fill="#[0-9a-fA-F]{6}"', f'fill="{color}"', s)
    out = os.path.join(IMG, name)
    open(out, "w").write(s)
    return f"../img/{name}"


L = {
    "stack_print": logo("empilhada-marfim.svg", PRINT, "assets/logo/ferraro-empilhada-creme.svg"),
    "stack_ink": logo("empilhada-tinta.svg", INK, "assets/logo/ferraro-empilhada-escura.svg"),
    "stack_gold": logo("empilhada-ouro.svg", GOLD_INK, "assets/logo/ferraro-empilhada-escura.svg"),
    "lockup_ink": logo("horizontal-tinta.svg", INK, "assets/logo/ferraro-atelier-escura.svg"),
    "lockup_print": logo("horizontal-marfim.svg", PRINT, "assets/logo/ferraro-atelier-creme.svg"),
    "wings_ink": logo("asas-tinta.svg", INK, "assets/logo/ferraro-asas-escura.svg"),
    "wings_gold": logo("asas-ouro.svg", GOLD_INK, "assets/logo/ferraro-asas-escura.svg"),
    "wings_print": logo("asas-marfim.svg", PRINT, "assets/logo/ferraro-asas-creme.svg"),
}


# ---------------------------------------------------------------- laca (o mostrador fumê com raios de sol)
def lacquer(name, wmm, hmm, cxmm, cymm, dpi=400, seed=1974):
    """A mesma laca do site: fumê claro no eixo e quase preto na borda, raios de sol finos e dois feixes de luz.
    Pintada em alta resolução para impressão (a página inteira, com a sangria)."""
    k = dpi / 25.4
    W, H = round(wmm * k), round(hmm * k)
    cx, cy = cxmm * k, cymm * k
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    px, py = x + 0.5 - cx, y + 0.5 - cy
    R = max(math.hypot(cx, cy), math.hypot(W - cx, cy), math.hypot(cx, H - cy), math.hypot(W - cx, H - cy))
    r = np.hypot(px, py) / R

    stops = [0, 0.3, 0.62, 1.0]
    lq, hi, lo = hex2rgb(LQ), hex2rgb(LQ_HI), hex2rgb(LQ_LO)
    cols = [hi, lq, lq + (lo - lq) * 0.55, lo]
    base = np.stack([np.interp(r, stops, [c[i] for c in cols]) for i in range(3)], axis=-1)

    # raios: ruído suave em volta do eixo, como a escovação de um mostrador
    rng = np.random.default_rng(seed)
    n = 3600
    raw = rng.uniform(-1, 1, n)
    val = (np.roll(raw, 1) + 2 * raw + np.roll(raw, -1)) / 4
    val /= np.abs(val).max()
    th = np.arctan2(py, px)
    v = val[(((th + np.pi) / (2 * np.pi)) * n).astype(np.int64) % n]
    fade = np.clip((r - 0.07) / 0.33, 0, 1)[..., None]
    a_l = (np.clip(v, 0, None)[..., None] * 0.085) * fade
    a_d = (np.clip(-v, 0, None)[..., None] * 0.13) * fade
    out = base * (1 - a_l) + np.array([250, 238, 205], np.float32) * a_l
    out = out * (1 - a_d) + np.array([6, 10, 4], np.float32) * a_d

    # os dois feixes de luz do site (0° no 12, sentido horário), girados 30° para a esquerda
    ang = (np.degrees(np.arctan2(px, -py)) + 30) % 360
    beam = [(0, 0), (8, .05), (18, .13), (24, .17), (30, .13), (40, .05), (50, 0), (182, 0), (190, .04), (199, .1),
            (204, .12), (209, .1), (218, .04), (228, 0), (360, 0)]
    a_b = np.interp(ang, [b[0] for b in beam], [b[1] for b in beam])[..., None]
    out = out * (1 - a_b) + np.array([250, 232, 190], np.float32) * a_b

    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(IMG, name), quality=93, dpi=(dpi, dpi))
    return f"../img/{name}"


# ---------------------------------------------------------------- trilho de minutos (o motivo do site)
def track(w, h, cx, cy, e, t, color, five=0.9, sw=(0.16, 0.34), op=(0.7, 0.95), rails=True, batons=None,
          numerals=None, rail_op=0.45):
    """Trilho de minutos correndo por um retângulo w×h (mm), com cada traço apontando para o eixo (cx, cy).
    e: distância da borda · t: largura do trilho · batons: índices aplicados · numerals: 12 e 6."""
    def hit(deg, d):
        a = math.radians(deg)
        dx, dy = math.sin(a), -math.cos(a)
        tx = (w - d - cx) / dx if dx > 1e-6 else (d - cx) / dx if dx < -1e-6 else math.inf
        ty = (h - d - cy) / dy if dy > 1e-6 else (d - cy) / dy if dy < -1e-6 else math.inf
        k = min(tx, ty)
        return cx + dx * k, cy + dy * k

    f = lambda n: f"{n:.3f}"
    s = [f'<svg class="track" viewBox="0 0 {w} {h}" width="{w}mm" height="{h}mm" xmlns="http://www.w3.org/2000/svg">']
    s.append('<defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8c6a2e"/>'
             '<stop offset=".45" stop-color="#f2dca0"/><stop offset=".55" stop-color="#d4ad5c"/><stop offset="1" stop-color="#7e5d24"/></linearGradient></defs>')
    if rails:
        s.append(f'<g fill="none" stroke="{color}" stroke-opacity="{rail_op}" stroke-width="0.12">'
                 f'<rect x="{e}" y="{e}" width="{f(w - 2 * e)}" height="{f(h - 2 * e)}"/>'
                 f'<rect x="{e + t}" y="{e + t}" width="{f(w - 2 * (e + t))}" height="{f(h - 2 * (e + t))}"/></g>')
    for m in range(60):
        big = m % 5 == 0
        ax, ay = hit(m * 6, e)
        bx, by = hit(m * 6, e + t + (five if big else 0))
        s.append(f'<line x1="{f(ax)}" y1="{f(ay)}" x2="{f(bx)}" y2="{f(by)}" stroke="{color}" '
                 f'stroke-opacity="{op[1] if big else op[0]}" stroke-width="{sw[1] if big else sw[0]}"/>')
    if batons:
        L, bw, gap, skip = batons["L"], batons["bw"], batons["gap"], batons.get("skip", ())
        for hr in range(12):
            if hr in skip:
                continue
            deg = hr * 30
            ox, oy = hit(deg, e + t + gap)
            a = math.radians(deg)
            mx, my = ox - math.sin(a) * L / 2, oy + math.cos(a) * L / 2
            offs = (-bw * 0.85, bw * 0.85) if hr == 0 else (0,)
            for dx in offs:
                s.append(f'<g transform="rotate({deg} {f(mx)} {f(my)})">'
                         f'<rect x="{f(mx - bw / 2 + dx + 0.12)}" y="{f(my - L / 2 + 0.3)}" width="{bw}" height="{L}" rx="{bw / 4}" fill="#000" fill-opacity=".3"/>'
                         f'<rect x="{f(mx - bw / 2 + dx)}" y="{f(my - L / 2)}" width="{bw}" height="{L}" rx="{bw / 4}" fill="url(#gold)"/>'
                         f'<rect x="{f(mx - bw * 0.23 + dx)}" y="{f(my - L / 2 + bw * 0.27)}" width="{f(bw * 0.46)}" height="{f(L - bw * 0.54)}" rx="{bw / 8}" fill="#eef0dc"/></g>')
    if numerals:
        g = numerals["glyph"]
        top = e + t + numerals.get("gap", 1.5)
        fs = g / 0.7
        style = f'font-family="Saira" font-weight="300" font-stretch="125%" font-size="{f(fs)}" fill="{color}" text-anchor="middle"'
        s.append(f'<text x="{f(cx)}" y="{f(top + g)}" {style}>12</text><text x="{f(cx)}" y="{f(h - top)}" {style}>6</text>')
    s.append("</svg>")
    return "".join(s)


def tick_rule(width_mm, color, op=0.45):
    """A régua de minutos que abre listas (o divisor da casa): uma linha com um traço a cada minuto."""
    n = int(width_mm / 1.6)
    step = width_mm / n
    lines = "".join(
        f'<line x1="{i * step:.3f}" y1="0.1" x2="{i * step:.3f}" y2="{(1.6 if i % 5 == 0 else 0.9):.2f}" stroke="{color}" stroke-width="{0.2 if i % 5 == 0 else 0.12}"/>'
        for i in range(n + 1))
    return (f'<svg class="rule" viewBox="0 0 {width_mm} 1.7" width="{width_mm}mm" height="1.7mm" xmlns="http://www.w3.org/2000/svg">'
            f'<g stroke-opacity="{op}"><line x1="0" y1="0.1" x2="{width_mm}" y2="0.1" stroke="{color}" stroke-width="0.14"/>{lines}</g></svg>')


def seal(size_mm, color, wings):
    """Selo da casa: um mostrador com o nome correndo em volta e as asas no centro."""
    ticks = "".join(
        f'<line x1="{30 * math.sin(math.radians(i * 6)):.3f}" y1="{-30 * math.cos(math.radians(i * 6)):.3f}" '
        f'x2="{(26.5 if i % 5 == 0 else 28.4) * math.sin(math.radians(i * 6)):.3f}" y2="{-(26.5 if i % 5 == 0 else 28.4) * math.cos(math.radians(i * 6)):.3f}" '
        f'stroke="{color}" stroke-width="{0.9 if i % 5 == 0 else 0.45}"/>' for i in range(60))
    return f'''<svg class="seal" viewBox="-50 -50 100 100" width="{size_mm}mm" height="{size_mm}mm" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs><path id="sp" d="M -39.5 0 a39.5 39.5 0 1 1 79 0 a39.5 39.5 0 1 1 -79 0"/></defs>
      <circle r="48" fill="none" stroke="{color}" stroke-width=".7"/><circle r="45.6" fill="none" stroke="{color}" stroke-width=".3"/>
      <circle r="31.6" fill="none" stroke="{color}" stroke-width=".4"/>
      <text font-family="Saira" font-weight="500" font-stretch="125%" font-size="6.6" fill="{color}">
        <textPath href="#sp" xlink:href="#sp" textLength="246" lengthAdjust="spacing">FERRARO ATELIER · RELOJOARIA SOB ENCOMENDA ·</textPath></text>
      <g stroke-linecap="butt">{ticks}</g>
      <image href="{wings}" xlink:href="{wings}" x="-17" y="-6.5" width="34" height="7.04"/>
      <text y="9" font-family="Saira" font-weight="300" font-stretch="125%" font-size="5.2" letter-spacing="1.4" fill="{color}" text-anchor="middle">MONTADO</text>
      <text y="15.5" font-family="Saira" font-weight="300" font-stretch="125%" font-size="5.2" letter-spacing="1.4" fill="{color}" text-anchor="middle">À MÃO</text>
    </svg>'''


def qdial(q, size_mm, ink=INK):
    """Mini mostrador que conta os passos (do site): o ponteiro aponta o quarto de hora do passo."""
    ticks = "".join(
        f'<line x1="{9 * math.sin(math.radians(i * 30)):.2f}" y1="{-9 * math.cos(math.radians(i * 30)):.2f}" '
        f'x2="{7.6 * math.sin(math.radians(i * 30)):.2f}" y2="{-7.6 * math.cos(math.radians(i * 30)):.2f}" stroke="{ink}" stroke-width=".55"/>' for i in range(12))
    a = math.radians(q * 90)
    return (f'<svg class="qd" viewBox="-11 -11 22 22" width="{size_mm}mm" height="{size_mm}mm" xmlns="http://www.w3.org/2000/svg">'
            f'<circle r="10.4" fill="#f4efe2" stroke="{ink}" stroke-opacity=".45" stroke-width=".35"/>{ticks}'
            f'<line x1="0" y1="0" x2="{6.6 * math.sin(a):.2f}" y2="{-6.6 * math.cos(a):.2f}" stroke="{ink}" stroke-width="1.1" stroke-linecap="round"/>'
            f'<circle r="1.4" fill="{GOLD_INK}"/></svg>')


def qr(url, color=INK):
    q = segno.make(url, error="m")
    s = q.svg_inline(dark=color, light=None, border=0, scale=1, omitsize=True)
    return s


# ---------------------------------------------------------------- documento
FONT = '<link href="https://fonts.googleapis.com/css2?family=Saira:wdth,wght@50..125,100..900&display=swap" rel="stylesheet">'

BASE_CSS = f"""
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:#888}}
body{{font-family:Saira,sans-serif;color:{INK};-webkit-print-color-adjust:exact;print-color-adjust:exact}}
.page{{position:relative;overflow:hidden;break-after:page;background:{LINEN}}}
.page:last-child{{break-after:auto}}
.trim{{position:absolute;left:{BLEED}mm;top:{BLEED}mm}}
.full{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}}
.track{{position:absolute;left:0;top:0;overflow:visible}}
.abs{{position:absolute}}
.label{{font-weight:500;font-stretch:125%;text-transform:uppercase;letter-spacing:.2em;font-size:5.6pt;color:{INK2}}}
.display{{font-weight:300;font-stretch:112%;letter-spacing:-.01em;line-height:1.08}}
.print{{color:{PRINT}}}
.rule{{display:block}}
img{{display:block}}
"""


def doc(name, w, h, pages, css=""):
    """Um HTML com uma página por peça (frente e verso). w × h é o tamanho com a sangria, em mm."""
    html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{name}</title>{FONT}
<style>@page{{size:{w}mm {h}mm;margin:0}}{BASE_CSS}.page{{width:{w}mm;height:{h}mm}}{css}</style></head>
<body>{''.join(pages)}</body></html>"""
    open(os.path.join(HTML, f"{name}.html"), "w").write(html)


# =================================================================== 1. cartão de visita 90 × 50
def card():
    tw, th = 90, 50
    w, h = tw + 2 * BLEED, th + 2 * BLEED
    lq = lacquer("laca-cartao.jpg", w, h, w / 2, h / 2)
    front = f"""<section class="page">
      <img class="full" src="{lq}">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        {track(tw, th, tw / 2, th / 2, 3.6, 1.3, PRINT, five=0.7, sw=(0.12, 0.26), batons={"L": 3.2, "bw": 0.85, "gap": 0.9, "skip": (3,)})}
        <img class="abs" src="{L['stack_print']}" style="width:31mm;left:{(tw - 31) / 2}mm;top:{th / 2 - 31 * 319 / 586 / 2}mm">
      </div></section>"""
    back = f"""<section class="page">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        <img class="abs" src="{L['lockup_ink']}" style="width:38mm;left:6mm;top:6.2mm">
        <p class="abs label" style="right:6mm;top:9.6mm;text-align:right;line-height:1.7">Relojoaria<br>sob encomenda</p>
        <div class="abs" style="left:6mm;top:25.4mm">{tick_rule(78, INK, .42)}</div>
        <div class="abs contact" style="left:6mm;bottom:6mm">
          <p class="label">WhatsApp</p><p class="v">{WHATS}</p></div>
        <div class="abs contact" style="left:36mm;bottom:6mm">
          <p class="label">Instagram</p><p class="v">{INSTA}</p></div>
        <div class="abs qr" style="right:6mm;bottom:6mm;width:13.5mm;height:13.5mm">{qr(WHATS_URL)}</div>
      </div></section>"""
    css = f""".contact .v{{font-size:8.2pt;font-weight:400;font-stretch:108%;letter-spacing:.01em;margin-top:1mm;color:{INK}}}
      .qr svg{{width:100%;height:100%;display:block}}"""
    doc("cartao-de-visita", w, h, [front, back], css)


# =================================================================== 2. certificado de autenticidade + garantia (A5)
def certificate():
    tw, th = 148, 210
    w, h = tw + 2 * BLEED, th + 2 * BLEED
    field = lambda lab, cls="": f'<div class="f {cls}"><p class="label">{lab}</p><i></i></div>'
    front = f"""<section class="page">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        {track(tw, th, tw / 2, th / 2, 7, 1.6, INK, five=1.1, sw=(0.1, 0.22), op=(0.32, 0.55), rail_op=0.3)}
        <img class="abs" src="{L['stack_ink']}" style="width:36mm;left:{(tw - 36) / 2}mm;top:17mm">
        <h1 class="abs display c-title">Certificado de autenticidade</h1>
        <p class="abs c-lead">Este relógio foi projetado por quem vai usá-lo e montado à mão, peça por peça, no ateliê Ferraro.</p>
        <div class="abs c-num"><p class="label">Relógio nº</p><i></i></div>
        <div class="abs c-fields">
          {field("Proprietário", "w2")}{field("Nome da peça", "w2")}
          {field("Caixa")}{field("Diâmetro")}
          {field("Mostrador")}{field("Ponteiros")}
          {field("Luneta")}{field("Pulseira")}
          {field("Movimento e calibre")}{field("Resistência à água")}
          {field("Data da entrega")}{field("Garantia válida até")}
        </div>
        <div class="abs c-sign"><i></i><p class="label">Montado e conferido por</p></div>
        <div class="abs" style="right:17mm;bottom:13.5mm">{seal(23, GOLD_INK, L['wings_gold'])}</div>
      </div></section>"""

    check = lambda t: f'<li><b></b><span>{t}</span></li>'
    back = f"""<section class="page">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        {track(tw, th, tw / 2, th / 2, 7, 1.6, INK, five=1.1, sw=(0.1, 0.22), op=(0.32, 0.55), rail_op=0.3)}
        <div class="abs g-col">
          <h2 class="display g-title">Garantia</h2>
          <p class="g-p">A Ferraro Atelier garante este relógio contra defeitos de montagem e de funcionamento do movimento pelo prazo indicado na frente deste certificado, contado da data de entrega. Esta garantia se soma à garantia legal do Código de Defesa do Consumidor.</p>
          <div class="g-two">
            <div><p class="label">A garantia cobre</p><ul class="g-list">
              <li>Peças soltas, ponteiros desalinhados ou mostrador fora do lugar.</li>
              <li>Falhas do movimento em uso normal.</li></ul></div>
            <div><p class="label">A garantia não cobre</p><ul class="g-list">
              <li>Cristal ou caixa quebrados por queda ou impacto.</li>
              <li>Entrada de água com a coroa aberta ou uso além da resistência indicada.</li>
              <li>Desgaste natural da pulseira e do acabamento.</li>
              <li>Troca de bateria e relógio aberto fora do ateliê.</li></ul></div>
          </div>
          <p class="label" style="margin-top:4.2mm">Como acionar</p>
          <p class="g-p" style="margin-top:1.2mm">Fale com o ateliê pelo WhatsApp {WHATS}, informando o número deste certificado. O envio e o reparo são combinados no atendimento.</p>
          <div style="margin:5mm 0 4mm">{tick_rule(112, INK, .42)}</div>
          <h3 class="display i-title">Inspeção final</h3>
          <p class="g-p" style="margin-top:1mm">Feita no ateliê antes da entrega.</p>
          <ul class="i-list">
            {check("Hora e data acertadas")}{check("Ponteiros alinhados e livres")}
            {check("Mostrador e índices limpos e no lugar")}{check("Coroa conferida em todas as posições")}
            {check("Cristal limpo por dentro e por fora")}{check("Funcionamento conferido por 24 horas")}
            {check("Pulseira e fecho ajustados")}{check("Caixa e fundo fechados e limpos")}
          </ul>
          <div class="i-foot">
            <div class="f"><p class="label">Marcha observada (opcional)</p><i></i><span class="u">s/dia</span></div>
            <div class="f"><p class="label">Conferido por</p><i></i></div>
          </div>
          <p class="label" style="margin-top:5.5mm">Histórico de revisões</p>
          <table class="rev"><thead><tr><th>Data</th><th>Serviço</th><th>Relojoeiro</th></tr></thead>
            <tbody>{"<tr><td></td><td></td><td></td></tr>" * 3}</tbody></table>
        </div>
      </div></section>"""
    css = f"""
      .c-title{{left:0;right:0;top:41mm;text-align:center;font-size:19pt}}
      .c-lead{{left:26mm;right:26mm;top:52mm;text-align:center;font-size:8pt;line-height:1.5;color:{INK2}}}
      .c-num{{left:{(tw - 52) / 2}mm;width:52mm;top:66mm;text-align:center}}
      .c-num i{{display:block;height:8.5mm;border-bottom:.3mm solid {GOLD_INK}}}
      .c-fields{{left:18mm;right:18mm;top:82mm;display:grid;grid-template-columns:1fr 1fr;column-gap:8mm;row-gap:2.3mm}}
      .f .label{{font-size:5.4pt}}
      .f i{{display:block;height:6.5mm;border-bottom:.2mm solid rgba(42,33,25,.55)}}
      .f.w2{{grid-column:1 / -1}}
      .c-sign{{left:18mm;bottom:19mm;width:66mm}}
      .c-sign i{{display:block;height:9mm;border-bottom:.2mm solid rgba(42,33,25,.7);margin-bottom:1.4mm}}
      .g-col{{left:18mm;right:18mm;top:17mm}}
      .g-title{{font-size:17pt}}
      .i-title{{font-size:13pt}}
      .g-p{{font-size:7.4pt;line-height:1.5;color:{INK2};margin-top:2.4mm}}
      .g-two{{display:grid;grid-template-columns:1fr 1fr;gap:7mm;margin-top:4.2mm}}
      .g-list{{list-style:none;margin-top:1.3mm}}
      .g-list li{{font-size:7.2pt;line-height:1.42;color:{INK};padding:1.1mm 0;border-top:.15mm solid rgba(42,33,25,.22)}}
      .i-list{{list-style:none;display:grid;grid-template-columns:1fr 1fr;column-gap:7mm;row-gap:1.9mm;margin-top:3.2mm}}
      .i-list li{{display:flex;align-items:center;gap:2.2mm;font-size:7.3pt}}
      .i-list b{{flex:none;width:3.4mm;height:3.4mm;border:.22mm solid {INK}}}
      .i-foot{{display:grid;grid-template-columns:1fr 1fr;gap:7mm;margin-top:5mm}}
      .i-foot .f{{position:relative}}
      .i-foot .u{{position:absolute;right:0;bottom:1mm;font-size:6.6pt;color:{INK2}}}
      .rev{{width:100%;border-collapse:collapse;margin-top:2mm;font-size:5.4pt}}
      .rev th{{text-align:left;font-weight:500;font-stretch:125%;letter-spacing:.18em;text-transform:uppercase;color:{INK2};padding:0 0 1.2mm;border-bottom:.2mm solid rgba(42,33,25,.55)}}
      .rev th:nth-child(1){{width:22%}} .rev th:nth-child(3){{width:28%}}
      .rev td{{height:6.4mm;border-bottom:.15mm solid rgba(42,33,25,.35)}}
      .rev td + td, .rev th + th{{border-left:.15mm solid rgba(42,33,25,.2);padding-left:2mm}}
    """
    doc("certificado-garantia", w, h, [front, back], css)


# =================================================================== 3. folheto A5 (frente e verso)
def flyer():
    tw, th = 148, 210
    w, h = tw + 2 * BLEED, th + 2 * BLEED
    cy = th * 0.47
    lq = lacquer("laca-folheto.jpg", w, h, w / 2, cy + BLEED)
    front = f"""<section class="page">
      <img class="full" src="{lq}">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        {track(tw, th, tw / 2, cy, 6, 2.0, PRINT, five=1.2, sw=(0.15, 0.36), batons={"L": 9, "bw": 2.3, "gap": 2.2, "skip": (0, 6)}, numerals={"glyph": 15, "gap": 2.4})}
        <img class="abs" src="{L['stack_print']}" style="width:44mm;left:{(tw - 44) / 2}mm;top:{cy - 37}mm">
        <h1 class="abs display print fl-title">Seu relógio,<br>peça por peça.</h1>
        <p class="abs label print fl-sub">Montado à mão, com a cor, os ponteiros<br>e o movimento que você escolher.</p>
      </div></section>"""
    steps = [
        ("Você projeta", "Monte o relógio no ateliê virtual, junte um relógio ou uma imagem de referência se quiser, e envie o projeto pelo WhatsApp."),
        ("Aprovação", "Confirmamos peças, cores, prazo e valor. Nada é montado antes da sua aprovação."),
        ("Montagem", "Com o projeto aprovado, o ateliê monta as peças que você escolheu, uma a uma."),
        ("Entrega", "O relógio pronto vai para o seu pulso. A forma de entrega é combinada no atendimento."),
    ]
    steps_html = "".join(f'<li>{qdial(i, 8.5)}<div><h3>{t}</h3><p>{p}</p></div></li>' for i, (t, p) in enumerate(steps))
    parts = ["Caixa", "Mostrador", "Ponteiros", "Luneta", "Pulseira", "Movimento"]
    back = f"""<section class="page">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        <div class="abs fb-head">
          <h2 class="display fb-title">O seu ainda não existe.</h2>
          <p class="fb-intro">Na Ferraro, um relógio começa com uma pergunta: como você quer o seu?</p>
          <p class="fb-p">Em vez de escolher entre modelos prontos, você decide como ele vai ser, peça por peça, na cor que quiser. Depois o ateliê monta esse relógio à mão, só para você.</p>
        </div>
        <div class="abs fb-photo"><img src="../../../assets/atelie.jpg"></div>
        <div class="abs fb-steps">
          <p class="label">Como funciona</p>
          <ol>{steps_html}</ol>
        </div>
        <div class="abs fb-parts">
          {tick_rule(124, INK, .42)}
          <div class="fb-parts-row"><p class="label">Seis escolhas, todas suas</p>
            <p class="names">{' · '.join(parts)}</p></div>
        </div>
        <div class="abs fb-foot">
          <div class="qr">{qr(WHATS_URL)}</div>
          <div><p class="label">Fale com o ateliê</p><p class="big">{WHATS}</p><p class="small">WhatsApp · Instagram {INSTA}</p>
            <p class="small">Valor e prazo são combinados no atendimento, antes de qualquer pagamento.</p></div>
          <img src="{L['lockup_ink']}" class="lk">
        </div>
      </div></section>"""
    css = f"""
      .fl-title{{left:0;right:0;top:{cy + 16}mm;text-align:center;font-size:25pt}}
      .fl-sub{{left:0;right:0;top:{cy + 41}mm;text-align:center;font-size:5.8pt;line-height:1.8;color:{PRINT}}}
      .fb-head{{left:12mm;right:12mm;top:13mm}}
      .fb-title{{font-size:23pt}}
      .fb-intro{{font-size:11pt;font-weight:300;font-stretch:108%;line-height:1.35;margin-top:4mm;max-width:100mm}}
      .fb-p{{font-size:7.6pt;line-height:1.55;color:{INK2};margin-top:2.6mm;max-width:104mm}}
      .fb-photo{{right:12mm;top:66mm;width:48mm;height:70mm;overflow:hidden}}
      .fb-photo img{{width:100%;height:100%;object-fit:cover}}
      .fb-steps{{left:12mm;top:66mm;width:68mm}}
      .fb-steps ol{{list-style:none;display:grid;gap:3.4mm;margin-top:3mm}}
      .fb-steps li{{display:grid;grid-template-columns:8.5mm 1fr;gap:3.2mm;align-items:start}}
      .fb-steps h3{{font-size:9.2pt;font-weight:400;font-stretch:108%;margin-top:.4mm}}
      .fb-steps li p{{font-size:6.9pt;line-height:1.45;color:{INK2};margin-top:.6mm}}
      .fb-parts{{left:12mm;right:12mm;top:150mm}}
      .fb-parts-row{{display:grid;gap:1.6mm;margin-top:3mm}}
      .fb-parts .names{{font-size:10.5pt;font-weight:400;font-stretch:108%;letter-spacing:.01em}}
      .fb-foot{{left:12mm;right:12mm;bottom:12mm;display:grid;grid-template-columns:20mm 1fr auto;gap:5mm;align-items:end}}
      .fb-foot .qr svg{{width:20mm;height:20mm;display:block}}
      .fb-foot .big{{font-size:13pt;font-weight:300;font-stretch:108%;margin:.8mm 0 .6mm}}
      .fb-foot .small{{font-size:6.6pt;line-height:1.5;color:{INK2}}}
      .fb-foot .lk{{width:30mm}}
    """
    doc("folheto-a5", w, h, [front, back], css)


# =================================================================== 4. cartão de cuidados 10 × 15
def care():
    tw, th = 100, 150
    w, h = tw + 2 * BLEED, th + 2 * BLEED
    cy = th * 0.42
    lq = lacquer("laca-cuidados.jpg", w, h, w / 2, cy + BLEED)
    front = f"""<section class="page">
      <img class="full" src="{lq}">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        {track(tw, th, tw / 2, cy, 4.5, 1.6, PRINT, five=0.9, sw=(0.13, 0.3), batons={"L": 6, "bw": 1.6, "gap": 1.5, "skip": (3,)})}
        <img class="abs" src="{L['stack_print']}" style="width:34mm;left:{(tw - 34) / 2}mm;top:{cy - 9.3}mm">
        <h1 class="abs display print ca-title">Cuidados com<br>o seu relógio</h1>
        <p class="abs label print ca-sub">Guarde este cartão junto do certificado.</p>
      </div></section>"""
    items = [
        ("Corda", "Automático: o uso diário mantém a corda. Se ele parar, gire a coroa umas 30 vezes antes de colocar no pulso. Corda manual: dê corda todo dia, no mesmo horário, até sentir resistência, sem forçar."),
        ("Água", "Respeite a resistência indicada no certificado. Antes de molhar, confira se a coroa está fechada. Nunca mexa na coroa debaixo d'água e enxágue com água doce depois do mar ou da piscina."),
        ("Data", "Evite mudar a data entre 21h e 3h: é quando o mecanismo está trocando o dia."),
        ("Impactos e ímãs", "Quedas e batidas fortes podem desregular o movimento. Ímãs fortes, como os de caixas de som, podem fazer um mecânico adiantar."),
        ("Limpeza", "Pano macio e seco no cristal e na caixa. Pulseira de couro longe da água e do perfume."),
        ("Revisão", "Um relógio mecânico pede revisão a cada 4 ou 5 anos, ou antes, se começar a adiantar ou atrasar muito."),
    ]
    back = f"""<section class="page">
      <div class="trim" style="width:{tw}mm;height:{th}mm">
        <div class="abs cb">
          <h2 class="display cb-title">Para durar gerações</h2>
          <div style="margin:3.4mm 0 1mm">{tick_rule(80, INK, .42)}</div>
          <dl>{''.join(f'<div><dt class="label">{t}</dt><dd>{d}</dd></div>' for t, d in items)}</dl>
        </div>
        <div class="abs cb-foot">
          <div><p class="label">Dúvidas</p><p class="v">WhatsApp {WHATS}</p></div>
          <img src="{L['wings_ink']}" style="width:12mm;opacity:.8">
        </div>
      </div></section>"""
    css = f"""
      .ca-title{{left:0;right:0;top:{cy + 22}mm;text-align:center;font-size:19pt}}
      .ca-sub{{left:0;right:0;top:{cy + 41}mm;text-align:center;font-size:5.4pt;color:{PRINT}}}
      .cb{{left:10mm;right:10mm;top:10mm}}
      .cb-title{{font-size:15pt}}
      .cb dl > div{{padding:2.1mm 0;border-bottom:.15mm solid rgba(42,33,25,.2)}}
      .cb dt{{font-size:5.4pt;color:{GOLD_INK}}}
      .cb dd{{font-size:7.2pt;line-height:1.45;margin-top:.7mm;color:{INK}}}
      .cb-foot{{left:10mm;right:10mm;bottom:8.5mm;display:flex;justify-content:space-between;align-items:end}}
      .cb-foot .v{{font-size:8pt;margin-top:.6mm}}
    """
    doc("cartao-de-cuidados", w, h, [front, back], css)


# =================================================================== 5. manual da marca (A4 deitado)
def manual():
    w, h = 297, 210
    lq = lacquer("laca-manual.jpg", 92, 62, 46, 31, dpi=300)

    def cmyk(hexc):
        r, g, b = [c / 255 for c in hex2rgb(hexc)]
        k = 1 - max(r, g, b)
        if k >= 1:
            return "0 0 0 100"
        c, m, y = [(1 - v - k) / (1 - k) for v in (r, g, b)]
        return " ".join(str(round(v * 100)) for v in (c, m, y, k))

    swatches = [
        ("Laca musgo", LQ, "Fundo dos impressos escuros e do mostrador"),
        ("Laca clara", LQ_HI, "O brilho no centro do fumê"),
        ("Noite", LQ_LO, "A borda do fumê"),
        ("Linho", LINEN, "O papel: fundo dos impressos claros"),
        ("Tinta nogueira", INK, "Textos sobre o linho"),
        ("Casca", INK2, "Textos de apoio e rótulos"),
        ("Marfim", PRINT, "Textos e logo sobre a laca"),
        ("Ouro", GOLD, "Só em detalhes: índices, selo"),
        ("Ouro escuro", GOLD_INK, "Ouro legível sobre o linho"),
    ]
    sw_html = "".join(
        f'<div class="sw"><i style="background:{c}"></i><p class="n">{n}</p><p class="c">{c.upper()} · CMYK {cmyk(c)}</p><p class="u">{u}</p></div>'
        for n, c, u in swatches)
    page = f"""<section class="page" style="background:{LINEN}">
      <div class="m">
        <header><img src="{L['lockup_ink']}" style="width:52mm"><div><h1 class="display">Manual da marca</h1>
          <p class="sub">O mesmo mundo do site, no papel: a laca musgo do mostrador, o linho, a tinta nogueira e um toque de ouro.</p></div></header>
        <div class="grid">
          <div class="blk">
            <p class="label">Logo</p>
            <div class="logos">
              <div class="lg" style="background:{LQ}"><img src="{lq}" class="full"><img src="{L['stack_print']}" class="on"></div>
              <div class="lg" style="background:#f4efe2;border:.2mm solid rgba(42,33,25,.15)"><img src="{L['stack_ink']}" class="on"></div>
            </div>
            <p class="t">Empilhada (asas, FERRARO, ATELIER) para peças em pé e centralizadas; horizontal, com o fio vertical, para cabeçalhos e rodapés. Sobre a laca vai em marfim; sobre o linho, em tinta nogueira. Respiro em volta: no mínimo a altura das asas. Menor tamanho: 18 mm de largura (empilhada) e 25 mm (horizontal).</p>
          </div>
          <div class="blk">
            <p class="label">Tipografia</p>
            <p class="ty1 display">Saira Light</p>
            <p class="ty2">Títulos em Saira Light, um pouco expandida. Texto corrido em Saira Regular, 7 a 9 pt.</p>
            <p class="label" style="margin-top:3mm;color:{INK}">Rótulos em caixa alta, espaçados</p>
            <p class="t">A mesma fonte do site, gratuita no Google Fonts. Nada de segunda fonte.</p>
            <p class="label" style="margin-top:6mm">Motivos</p>
            <div class="motifs">
              <div>{tick_rule(40, INK, .5)}<p class="t">Régua de minutos: abre listas e separa blocos.</p></div>
              <div>{seal(16, GOLD_INK, L['wings_gold'])}<p class="t">Selo: certificados e lacres.</p></div>
              <div>{qdial(2, 9)}<p class="t">Mini mostrador: conta passos.</p></div>
            </div>
          </div>
          <div class="blk sws"><p class="label">Cores</p><div class="swg">{sw_html}</div>
            <p class="t" style="margin-top:2mm">Valores CMYK aproximados. Peça uma prova de cor na gráfica antes da primeira tiragem grande.</p></div>
        </div>
        <div class="kit"><p class="label">As peças</p><div class="kit-row">
          <figure><img src="../../previa/cartao-de-visita-algodao-frente.png" style="width:36mm"><img src="../../previa/cartao-de-visita-algodao-verso.png" style="width:36mm"><figcaption>Cartão de visita · 9 × 5 cm</figcaption></figure>
          <figure><img src="../../previa/certificado-garantia-frente.png" style="height:38mm"><img src="../../previa/certificado-garantia-verso.png" style="height:38mm"><figcaption>Certificado e garantia · A5</figcaption></figure>
          <figure><img src="../../previa/folheto-a5-frente.png" style="height:38mm"><img src="../../previa/folheto-a5-verso.png" style="height:38mm"><figcaption>Folheto · A5</figcaption></figure>
          <figure><img src="../../previa/cartao-de-cuidados-frente.png" style="height:38mm"><img src="../../previa/cartao-de-cuidados-verso.png" style="height:38mm"><figcaption>Cuidados · 10 × 15 cm</figcaption></figure>
        </div></div>
      </div></section>"""
    css = f"""
      .m{{position:absolute;inset:12mm 16mm}}
      header{{display:grid;grid-template-columns:auto 1fr;gap:12mm;align-items:end;padding-bottom:6mm;border-bottom:.2mm solid rgba(42,33,25,.25)}}
      header h1{{font-size:24pt}}
      header .sub{{font-size:8.5pt;color:{INK2};margin-top:1.6mm}}
      .grid{{display:grid;grid-template-columns:1fr 1fr 1.25fr;gap:10mm;margin-top:6mm}}
      .logos{{display:grid;gap:3mm;margin-top:2.6mm}}
      .lg{{position:relative;height:25mm;display:grid;place-items:center;overflow:hidden}}
      .lg .on{{position:relative;width:28mm}}
      .t{{font-size:6.8pt;line-height:1.5;color:{INK2};margin-top:2.4mm}}
      .ty1{{font-size:26pt;margin-top:2mm}}
      .ty2{{font-size:8pt;line-height:1.5;margin-top:1.5mm}}
      .motifs{{display:grid;gap:1.6mm;margin-top:2mm}}
      .motifs > div{{display:grid;grid-template-columns:42mm 1fr;align-items:center;gap:3mm}}
      .motifs .t{{margin:0}}
      .swg{{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm 3mm;margin-top:2.6mm}}
      .sw i{{display:block;height:9mm;border:.15mm solid rgba(42,33,25,.15)}}
      .sw .n{{font-size:7.4pt;margin-top:1.2mm}}
      .sw .c{{font-size:5.4pt;letter-spacing:.04em;color:{INK2};margin-top:.3mm}}
      .sw .u{{font-size:5.6pt;line-height:1.35;color:{INK2};margin-top:.4mm}}
      .kit{{position:absolute;left:0;right:0;bottom:0;padding-top:4mm;border-top:.2mm solid rgba(42,33,25,.25)}}
      .kit-row{{display:flex;justify-content:space-between;align-items:end;margin-top:3mm}}
      .kit figure{{display:grid;grid-auto-flow:column;gap:1.6mm;align-items:end;position:relative;padding-bottom:5mm}}
      .kit img{{box-shadow:0 0 0 .15mm rgba(42,33,25,.18)}}
      .kit figcaption{{position:absolute;left:0;bottom:0;font-size:6.4pt;color:{INK2};white-space:nowrap}}
    """
    doc("manual-da-marca", w, h, [page], css)


if __name__ == "__main__":
    # o cartão de visita mora em cartao.py (a versão de mostrador saiu)
    certificate()
    flyer()
    care()
    manual()
    print("html ok:", sorted(os.listdir(HTML)))
