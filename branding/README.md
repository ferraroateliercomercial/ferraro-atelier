# Branding da Ferraro Atelier: impressos

O mesmo mundo do site, no papel: a laca musgo do mostrador (com o trilho de minutos e os índices dourados), o linho,
a tinta nogueira e um toque de ouro. Fonte única: Saira. As regras estão em `pdf/manual-da-marca.pdf`.

## Arquivos para a gráfica (`pdf/`)

Todos em CMYK, com 3 mm de sangria em cada lado, fontes embutidas e frente e verso no mesmo arquivo (página 1 é a
frente, página 2 é o verso). Na gráfica online, escolha a opção "arquivo com sangria" e o formato final indicado.
Nada importante fica a menos de 4 mm do corte.

| Arquivo | Formato final | Arquivo com sangria | Papel sugerido |
|---|---|---|---|
| `cartao-de-visita-algodao.pdf` | 9 × 5 cm | 9,6 × 5,6 cm | Verde floresta com textura de papel de algodão; verso claro. Couché fosco 350 g com laminação fosca (ou soft touch) |
| `cartao-de-visita-genebra.pdf` | 9 × 5 cm | 9,6 × 5,6 cm | Verde com as listras de Genebra tom sobre tom; verso claro. Mesmo papel |
| `cartao-de-visita-linho.pdf` | 9 × 5 cm | 9,6 × 5,6 cm | Linho claro com a trama do tecido; verso verde. Mesmo papel |
| `certificado-garantia.pdf` | A5 (14,8 × 21 cm) | 15,4 × 21,6 cm | Offset (papel sem revestimento) 180 a 240 g, sem laminação: precisa aceitar caneta |
| `folheto-a5.pdf` | A5 (14,8 × 21 cm) | 15,4 × 21,6 cm | Couché fosco 150 g |
| `cartao-de-cuidados.pdf` | 10 × 15 cm | 10,6 × 15,6 cm | Couché fosco 300 g |
| `manual-da-marca.pdf` | A4 deitado | (sem sangria) | Referência, não é para imprimir em quantidade |

- A tinta total nas áreas mais escuras da laca fica abaixo de 290%, dentro do limite das gráficas (300%).
- As cores CMYK são uma conversão automática das cores do site. Na primeira tiragem, peça uma prova de cor (ou
  imprima poucas unidades) para conferir o verde.
- O dourado sai como cor impressa (amarelo ocre), não metálico. Para ouro ou prata metálicos de verdade (hot
  stamping) a gráfica pede um arquivo separado só com a área do metal: dá para gerar a partir destes.

## Cartão de visita: três caminhos

As texturas são impressas (simulam o papel). Para o resultado mais sofisticado de verdade, o mesmo desenho vai em
papel texturizado tingido (por exemplo um papel verde escuro de linha especial, 300 g ou mais) com a logo em hot
stamping marfim ou dourado, sem imprimir a textura: nesse caso a gráfica pede o arquivo só com a logo, que dá para
gerar a partir de `src/cartao.py`.

## O que preencher à mão

O certificado é preenchido na entrega de cada relógio: número do relógio, proprietário, nome da peça, as seis peças,
diâmetro, movimento e calibre, resistência à água, data da entrega, garantia válida até, assinatura, e no verso a
inspeção final (com a marcha observada, opcional) e, depois, o histórico de revisões.

## Prévias (`previa/`)

Uma imagem de cada lado de cada peça, feita a partir dos PDFs em CMYK (é o que a gráfica recebe).

## Como alterar

Os textos e as medidas estão em `src/build.py`. Da raiz do repositório:

```
python3 -m http.server 8771 --bind 127.0.0.1 &
python3 branding/src/build.py
(cd branding/src && python3 cartao.py)
node branding/src/render.mjs            # ou: node branding/src/render.mjs cartao-de-visita
```

Precisa de Python com `numpy`, `Pillow` e `segno`, do Chromium com Playwright, do Ghostscript (`gs`) e do
`pdftoppm`. A pasta `branding/` não vai para o site publicado (está no `.vercelignore`).
