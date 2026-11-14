"""Cartão de visita, segunda versão: minimalista e texturizado, sem nada de mostrador.

Três caminhos, todos 9 × 5 cm com 3 mm de sangria:
  algodao  verde floresta com textura de papel de algodão (fibras), logo empilhada pequena em marfim
  genebra  verde floresta com as listras de Genebra tom sobre tom (o acabamento das pontes de um movimento)
  linho    linho claro com a trama do tecido, logo em tinta nogueira
O verso é sempre o oposto da frente (papel claro com tinta escura, ou o contrário).

Rodar da raiz do repositório: python3 branding/src/cartao.py  (depois: node branding/src/render.mjs cartao-de-visita)
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import build as B

DPI = 600
TW, TH = 90, 50
W, H = TW + 2 * B.BLEED, TH + 2 * B.BLEED
PX = lambda mm: int(round(mm / 25.4 * DPI))

FOREST = "#1d3323"     # verde floresta, um pouco mais fundo que a laca: lê como papel tingido, não como tela
FOREST_HI = "#24402c"


def smooth_noise(h, w, cell, rng):
    """Ruído suave: valores aleatórios numa grade de `cell` px, ampliados com interpolação."""
    gh, gw = h // cell + 3, w // cell + 3
    small = Image.fromarray(rng.standard_normal((gh, gw)).astype(np.float32), mode="F")
    big = np.asarray(small.resize((gw * cell, gh * cell), Image.BICUBIC))[:h, :w]
    return (big - big.mean()) / (big.std() + 1e-6)


def streaks(h, w, along, thread, rng):
    """Fios: ruído esticado numa direção (along='x' faz fios deitados). `thread` é a espessura do fio em px."""
    if along == "x":
        n = rng.standard_normal((h // thread + 2, max(4, w // 90))).astype(np.float32)
        img = Image.fromarray(n, mode="F").resize((w, (h // thread + 2) * thread), Image.BILINEAR)
        a = np.asarray(img)[:h, :w]
    else:
        n = rng.standard_normal((max(4, h // 90), w // thread + 2)).astype(np.float32)
        img = Image.fromarray(n, mode="F").resize(((w // thread + 2) * thread, h), Image.BILINEAR)
        a = np.asarray(img)[:h, :w]
    return (a - a.mean()) / (a.std() + 1e-6)


def fibers(h, w, n, rng, light, dark):
    """Fibras de papel de algodão: traços curtos e curvos, uns mais claros e outros mais escuros."""
    layer = Image.new("F", (w, h), 0.0)
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        ang = rng.uniform(0, math.pi)
        length = rng.uniform(PX(0.8), PX(3.2))
        pts = []
        for k in range(6):
            ang += rng.normal(0, 0.18)
            pts.append((x, y))
            x += math.cos(ang) * length / 5
            y += math.sin(ang) * length / 5
        val = light if rng.random() < 0.55 else -dark
        d.line(pts, fill=float(val * rng.uniform(0.4, 1.0)), width=int(rng.choice([1, 1, 2])))
    a = np.asarray(layer, dtype=np.float32)
    # desfoque leve (núcleo 1-2-1 nas duas direções): a fibra deixa de ser um traço duro
    a = (np.roll(a, 1, 0) + 2 * a + np.roll(a, -1, 0)) / 4
    return (np.roll(a, 1, 1) + 2 * a + np.roll(a, -1, 1)) / 4


def finish(base_hex, tone, name):
    """tone: variação de luz (−1 a 1, já na escala certa) somada à cor de base."""
    base = B.hex2rgb(base_hex)
    lum = np.clip(base[None, None, :] * (1 + tone[..., None]), 0, 255)
    Image.fromarray(lum.astype(np.uint8)).save(os.path.join(B.IMG, name), quality=94, dpi=(DPI, DPI))
    return f"../img/{name}"


def tex_cotton(base_hex, name, seed, strength=1.0):
    rng = np.random.default_rng(seed)
    h, w = PX(H), PX(W)
    # grão fino do papel, um pouco de ondulação e quase nada de nuvem (nuvem demais vira pergaminho)
    t = 0.02 * smooth_noise(h, w, 2, rng) + 0.012 * smooth_noise(h, w, 10, rng) + 0.007 * smooth_noise(h, w, 120, rng)
    t += fibers(h, w, 3200, rng, 0.09, 0.06)
    return finish(base_hex, t * strength, name)


def tex_linen(base_hex, name, seed, strength=1.0):
    rng = np.random.default_rng(seed)
    h, w = PX(H), PX(W)
    th = PX(0.3)  # espessura de um fio de linho
    # fios deitados e em pé, cada um com a sua espessura e o seu tom, somados: é a trama vista de perto
    a, b = streaks(h, w, "x", th, rng), streaks(h, w, "y", th, rng)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ridge = np.cos((yy / th) * 2 * math.pi) + np.cos((xx / th) * 2 * math.pi)
    t = 0.014 * (a + b) + 0.006 * ridge + 0.006 * smooth_noise(h, w, 120, rng) + 0.012 * smooth_noise(h, w, 2, rng)
    t += fibers(h, w, 700, rng, 0.05, 0.04)
    return finish(base_hex, t * strength, name)


def tex_geneva(base_hex, name, seed):
    """Listras de Genebra: faixas paralelas inclinadas, cada uma escovada em arco, tom sobre tom."""
    rng = np.random.default_rng(seed)
    h, w = PX(H), PX(W)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ang = math.radians(-22)
    period = PX(2.6)
    u = xx * math.cos(ang) + yy * math.sin(ang)          # atravessa as faixas
    v = -xx * math.sin(ang) + yy * math.cos(ang)         # ao longo da faixa
    f = (u / period) % 1.0
    # cada faixa é um cilindro escovado: clareia em direção à borda de cima e cai de repente na próxima
    band = 0.5 - 0.5 * np.cos(2 * math.pi * f) + 0.5 * np.exp(-((f - 0.97) / 0.025) ** 2) - 0.5
    # escovado em arco dentro da faixa (o raio da ferramenta)
    arc = np.sin((v / PX(3.5) + (f - 0.5) ** 2 * 6.0) * 2 * math.pi * 3) * 0.12
    brush = streaks(h, w, "x", 2, rng)
    t = 0.13 * band + 0.015 * arc + 0.014 * brush + 0.012 * smooth_noise(h, w, 2, rng) + 0.015 * smooth_noise(h, w, 120, rng)
    return finish(base_hex, t, name)


CSS = f"""
.mark{{position:absolute;left:50%;top:50%;translate:-50% -50%}}
.back-in{{position:absolute;inset:7mm 7.5mm}}
.tag{{font-weight:500;font-stretch:125%;text-transform:uppercase;letter-spacing:.32em;font-size:5.2pt}}
.ct{{position:absolute;left:0;bottom:0;display:grid;gap:1.1mm;font-size:7.4pt;letter-spacing:.02em;font-stretch:104%}}
.ct span{{display:inline-block;width:17.5mm;font-weight:500;font-stretch:125%;text-transform:uppercase;letter-spacing:.22em;font-size:4.8pt;opacity:.72}}
.wg{{position:absolute;right:0;top:0;width:8mm}}
.hair{{position:absolute;left:0;right:0;top:50%;height:0;border-top:.12mm solid currentColor;opacity:.22}}
"""


def page(bg, inner):
    return f'<section class="page"><img class="full" src="{bg}"><div class="trim" style="width:{TW}mm;height:{TH}mm">{inner}</div></section>'


def back(color, wings):
    return f"""<div class="back-in" style="color:{color}">
      <p class="tag">Relojoaria sob encomenda</p>
      <img class="wg" src="{wings}">
      <div class="ct"><p><span>WhatsApp</span>{B.WHATS}</p><p><span>Instagram</span>{B.INSTA}</p></div>
    </div>"""


def main():
    L = B.L
    gold_print = B.logo("asas-ouro-claro.svg", "#c9a95f", "assets/logo/ferraro-asas-escura.svg")
    linen_bg = tex_linen(B.LINEN, "cartao-linho-claro.jpg", 11)
    cotton_light = tex_cotton("#efe9db", "cartao-algodao-claro.jpg", 12, 0.8)
    forest_cotton = tex_cotton(FOREST, "cartao-algodao-verde.jpg", 13, 1.6)
    forest_geneva = tex_geneva(FOREST_HI, "cartao-genebra-verde.jpg", 14)

    stack_print = L["stack_print"]
    stack_ink = L["stack_ink"]
    options = {
        "algodao": (
            page(forest_cotton, f'<img class="mark" src="{stack_print}" style="width:21mm">'),
            page(cotton_light, back(B.INK, L["wings_gold"])),
        ),
        "genebra": (
            page(forest_geneva, f'<img class="mark" src="{L["lockup_print"]}" style="width:33mm">'),
            page(cotton_light, back(B.INK, L["wings_gold"])),
        ),
        "linho": (
            page(linen_bg, f'<img class="mark" src="{stack_ink}" style="width:21mm">'),
            page(forest_cotton, back(B.PRINT, gold_print)),
        ),
    }
    for k, (f, b) in options.items():
        B.doc(f"cartao-de-visita-{k}", W, H, [f, b], CSS)
    # a versão de mostrador sai de cena
    old = os.path.join(B.HTML, "cartao-de-visita.html")
    if os.path.exists(old):
        os.remove(old)
    print("ok", list(options))


if __name__ == "__main__":
    main()
