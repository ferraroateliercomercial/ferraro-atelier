# Custom Time

Site da Custom Time, ateliê de relojoaria. O cliente não compra relógios prontos: ele monta o próprio relógio no **ateliê virtual** e envia o projeto pelo WhatsApp.

## Página inicial

- **Abertura animada**: um mostrador se desenha, os ponteiros vão até 10:08 e a página se abre a partir do centro. Toca uma vez por visita; clique ou qualquer tecla pula.
- **Relógio que se desmonta**: ao rolar, o relógio se separa em camadas (pulseira, movimento, caixa, mostrador, ponteiros, luneta, cristal).
- **Movimentos**: quartzo, automático (NH35) e corda manual (ST3600) funcionando como os de verdade. O automático gira o rotor quando o mouse passa por cima; o manual precisa de corda.
- **Dez estilos de ponteiros**, com um controle para ver todos em qualquer cor.
- Portfólio, ateliê, dúvidas e contato.

## Ateliê virtual (`#personalizar`)

Oito etapas: caixa, mostrador, ponteiros, luneta, pulseira, movimento, gravação e resumo.

- Todas as cores são livres (seletor de espectro completo e código HEX).
- Vistas de frente, explodida e de fundo.
- O relógio da prévia marca a hora real e anda conforme o movimento escolhido. Nos mecânicos dá para dar corda girando a coroa; no cronógrafo os botões laterais ligam, param e zeram.
- O resumo gera a mensagem do WhatsApp com todas as escolhas e os códigos das cores.

## Como editar

- `js/app.js`, começo do arquivo: `STORE.whatsapp` e `STORE.instagram`.
- `js/app.js`, `PRICES`: valores de cada opção (são estimativas de exemplo).
- `js/app.js`, `PORTFOLIO`: fotos e descrições do portfólio. Fotos ficam em `assets/`.
- `js/watch.js`: desenho do relógio e funcionamento dos movimentos.

## Rodar no computador

```sh
python3 -m http.server 8000
```

Depois abra http://localhost:8000. É um site estático: funciona direto no GitHub Pages, Vercel ou Netlify, sem build.
