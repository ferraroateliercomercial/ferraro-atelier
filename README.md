# Custom Time

Site da Custom Time, loja de relógios personalizados feitos à mão.

## O que tem no site

- **Abertura**: foto do ateliê e as garantias da loja.
- **Coleção**: vitrine de peças com filtro por pulseira. Cada peça vai para a sacola ou abre no configurador.
- **Carbon Edition**: ficha de produto com galeria de fotos, detalhes e ficha técnica.
- **Personalize o seu**: configurador com desenho do relógio que muda na hora (mostrador, luneta, ponteiros, pulseira e gravação) e marca a hora atual.
- **O ateliê**: como funciona, do pedido à entrega.
- **Serviços e valores**: tabela de preços por categoria.
- **Sacola**: envia o pedido pronto pelo WhatsApp.

## Como editar

Tudo fica em `js/app.js`, no começo do arquivo:

- `STORE.whatsapp`: seu número com DDI e DDD, só dígitos (ex.: `5511999998888`).
- `STORE.instagram`: link do seu Instagram.
- `STORE.basePrice`: preço do relógio base.
- `OPTIONS`: opções e preços do configurador.
- `COLLECTION`: peças da vitrine. Peças com `config` aparecem como desenho; para usar uma foto, coloque o arquivo em `assets/` e troque `config` por `image: "assets/arquivo.jpg"` e `price`.
- `SERVICE_GROUPS`: serviços e preços.

Os preços que estão lá são exemplos. Troque pelos seus.

Fotos ficam em `assets/`.

## Rodar no computador

É um site estático, sem instalação:

```sh
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar

Funciona direto no GitHub Pages, Vercel ou Netlify (sem passo de build).
