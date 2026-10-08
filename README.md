# Ferraro Atelier

Site da Ferraro Atelier, relojoaria sob encomenda. O cliente não compra relógios prontos: ele monta o próprio relógio no **ateliê virtual** e envia o projeto pelo WhatsApp.

## Página inicial

- **Abertura animada**: um mostrador se desenha, os ponteiros vão até 10:08 e a página se abre a partir do centro. Toca uma vez por visita; clique ou qualquer tecla pula.
- **Boas-vindas**: foto da bancada em tela cheia (`assets/movimento.jpg`) com o título e os botões por cima.
- **Anatomia**: ao rolar, o relógio se separa em camadas (pulseira, movimento, caixa, mostrador, ponteiros, luneta, cristal). No celular ele ocupa a tela toda, com uma legenda por vez embaixo.
- **Movimentos**: quartzo, automático (NH35) e corda manual (ST3600) funcionando como os de verdade. O automático gira o rotor quando o mouse passa por cima; o manual precisa de corda.
- **Dez estilos de ponteiros**, com um controle para ver todos em qualquer cor.
- **À venda**: relógios prontos com preço e botão "Comprar pelo WhatsApp" (mensagem já preenchida).
- Portfólio, ateliê, dúvidas e contato.

## Ateliê virtual (`#personalizar`)

Oito etapas: caixa, mostrador, ponteiros, luneta, pulseira, movimento, referência e resumo. O site não mostra preços: valor e prazo são combinados no atendimento.

- Todas as cores são livres (seletor de espectro completo e código HEX), inclusive a do aço da pulseira.
- Pulseira em duas cores: laterais de uma cor e centro de outra (no aço, elos de fora e elos do centro).
- Vistas de frente, explodida e de fundo.
- Origem do movimento: japonês (quartzo, Seiko NH35, Seagull ST3600) ou suíço premium (Sellita SW200-1 automático e Sellita SW210-1 corda manual). O mostrador esqueleto só existe no suíço. Na prévia, os Sellita andam a 8 passos por segundo (28.800 alternâncias/h).
- No automático e na corda manual: fundo de vidro ou fechado, e mostrador inteiro ou esqueleto (centro aberto mostrando o mecanismo).
- Referência: o cliente informa um relógio de referência, anexa até 6 imagens e escreve observações. No celular, o envio já leva as imagens junto (compartilhamento do sistema); no computador, o cliente anexa as imagens na conversa do WhatsApp.
- O relógio da prévia marca a hora real e anda conforme o movimento escolhido. Nos mecânicos dá para dar corda girando a coroa; no cronógrafo os botões laterais ligam, param e zeram.
- O resumo gera a mensagem do WhatsApp com todas as escolhas, os códigos das cores e a referência.

## Logo

Ficam em `assets/logo/`, em SVG e PNG sem fundo, nas versões creme, escura e dourada: `ferraro-asas-*` (só as asas, usada nos relógios) `ferraro-atelier-*` (logo completa com o nome, usada no topo, nas boas-vindas e no rodapé) e `ferraro-empilhada-*` (asas com FERRARO ATELIER embaixo, usada nos mostradores das fotos e dos desenhos). No site, a logo é um vetor só (`WINGS_D` em `js/watch.js` e o símbolo `#ferraro-wings` no `index.html`), usado no topo, na abertura, no rodapé, no ícone da aba e nos desenhos dos relógios (mostrador, rotor e fundo).

## Oficina (`#oficina`, uso interno)

Página para a Ferraro Atelier ver o relógio que o cliente montou. Abra o site com `#oficina` no fim do endereço (há também um link discreto "Oficina" no rodapé).

- Cole a mensagem que o cliente mandou pelo WhatsApp (ou só o código `CT2-...`; códigos antigos `CT1-...` também funcionam) e o relógio aparece montado, de frente, explodido e de fundo, com a ficha completa.
- O código do projeto vai no fim de toda mensagem enviada pelo ateliê virtual e reproduz o relógio exatamente. Sem o código, a Oficina lê as linhas da mensagem e avisa para conferir.
- "Abrir no ateliê virtual" carrega o projeto para ajustar; "Salvar projeto" guarda na lista deste aparelho.

## Como editar

- `js/app.js`, começo do arquivo: `STORE.whatsapp` e `STORE.instagram` (@ferraro_atelier).
- `js/app.js`, `PORTFOLIO`: fotos e descrições do portfólio. Fotos ficam em `assets/`. Para pôr uma peça à venda, coloque `price: 1500` nela; para tirar da venda, apague o `price`.
- `js/watch.js`: desenho do relógio e funcionamento dos movimentos.

## Análise de visitas (Vercel)

O `index.html` já tem o script do Vercel Web Analytics (o equivalente ao pacote `@vercel/analytics` para sites sem build). Ele passa a contar visitas quando o site está publicado na Vercel e a aba **Analytics** do projeto está ativada no painel da Vercel.

Também tem o script do Vercel Speed Insights (equivalente ao pacote `@vercel/speed-insights`), que mede a velocidade do site para os visitantes. Ele funciona quando a aba **Speed Insights** do projeto está ativada na Vercel.

## Rodar no computador

```sh
python3 -m http.server 8000
```

Depois abra http://localhost:8000. É um site estático: funciona direto no GitHub Pages, Vercel ou Netlify, sem build.
