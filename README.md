# Custom Time

Site da Custom Time, loja de relógios personalizados feitos à mão.

## O que tem no site

- **Início**: apresentação com a foto da Carbon Edition e um relógio ao vivo.
- **Carbon Edition**: foto com pontos clicáveis que explicam cada detalhe (frente e fundo).
- **Monte o seu**: configurador com prévia do relógio que muda na hora (mostrador, luneta, ponteiros, pulseira e gravação) e marca a hora atual.
- **Serviços**: cards com filtro (relógio novo, personalização, manutenção).
- **Pedido**: carrinho lateral que envia o pedido pronto pelo WhatsApp.
- Processo, perguntas frequentes e contato.

## Como editar

Tudo fica em `js/app.js`, no começo do arquivo:

- `STORE.whatsapp`: seu número com DDI e DDD, só dígitos (ex.: `5511999998888`).
- `STORE.instagram`: link do seu Instagram.
- `STORE.basePrice`: preço do relógio base.
- `OPTIONS`: opções e preços do configurador.
- `SERVICES`: serviços e preços.

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
