# Ferraro Atelier

Site da Ferraro Atelier, relojoaria sob encomenda. O cliente não compra relógios prontos: ele monta o próprio relógio no **ateliê virtual** e envia o projeto pelo WhatsApp.

## Página inicial: o mostrador vivo

A primeira tela é o mostrador inteiro de um relógio, visto de cima. Laca fumê azul (o azul é só o padrão: a cor é livre), impressão branca de mostrador, partes claras em opalino e o vermelho do ponteiro de segundos como único acento. Os fundos escuros do site inteiro são a mesma laca fumê: azul no meio, quase preta nas bordas.

- **Abertura em motion design** (uma vez por visita; quem volta na mesma sessão vê uma versão curta): a laca escorre do centro até cobrir a tela, o trilho de minutos é impresso pelas bordas da tela, os índices descem um a um, o 12 e o 6 gigantes entram cortados pela borda (no computador), a logo é impressa, a janela da data gira até o dia de hoje (é o contador da abertura) e os ponteiros saem do meio-dia e acertam a hora de quem está vendo. Um toque, clique, tecla ou tentativa de rolar acelera o resto.
- **Primeira tela sem botões**: só o mostrador, o título impresso na metade de baixo ("Seu relógio, peça por peça.") e a **coroa** na borda direita, que é a ação ("Monte o seu"). O cabeçalho com o menu só aparece quando a pessoa começa a rolar (ou ao navegar pelo teclado).
- O relógio marca a hora real, com o segundo andando 8 vezes por segundo. O brilho de raios de sol acompanha o mouse; no celular, ele oscila sozinho. Das 19h às 6h (no relógio de quem visita), o lume dos índices e dos ponteiros acende em verde.
- **Ao rolar**: a laca que cobria a tela se fecha num círculo, o trilho das bordas some e o do mostrador redondo aparece, a luneta e a caixa crescem em volta (a luneta gira em cliques de meio minuto) e o relógio inteiro desce para a vista explodida: sete peças num eixo só, com as legendas dos dois lados, cada uma com um fio até a sua peça. No computador, passar o mouse numa legenda isola a peça.
- **Cor livre**: oito lacas de exemplo e um controle para qualquer tom. O fundo da seção acompanha a cor; enquanto ninguém mexe, as lacas se alternam sozinhas. "Montar com esta cor" leva a cor para o ateliê.
- **Três jeitos de marcar o tempo**: quartzo, automático e corda manual funcionando de verdade; o compasso de cada um aparece numa janelinha, como a da data.
- **Dez estilos de ponteiros** num mostrador de amostra: ao trocar, o ponteiro de minutos dá uma volta e pousa em 10:08. Dá para mudar a cor e levar o ponteiro escolhido para o ateliê.
- **Da bancada**: todas as peças do `PORTFOLIO` num lugar só. As que têm preço aparecem como disponíveis, com "Comprar pelo WhatsApp"; as outras aparecem como portfólio, com "Começar com esta base", que abre o ateliê com aquela configuração.
- **Na bancada**: a foto do movimento se abre como vista por uma lupa enquanto a página rola.
- **Do projeto ao pulso** (cada etapa ganha um mini mostrador marcando um quarto de hora), **Dúvidas** e o fechamento, com a coroa de novo como botão final.
- Os divisores são réguas de minutos (um traço por minuto, um maior a cada cinco).
- **Menu**: abre em círculo a partir do botão; o ponteiro do mostrador aponta para o item sob o mouse.
- Rolagem suave com Lenis e animações com GSAP + ScrollTrigger, carregados do cdnjs e do unpkg. Com "reduzir movimento" ligado no aparelho, ou se essas bibliotecas não carregarem, a página aparece completa e parada: o mostrador ocupa a primeira tela e o relógio inteiro aparece embaixo, com as peças listadas.
- O código da página inicial fica em `js/home.js`; os dados (peças, ponteiros, receitas) continuam em `js/app.js`.

## Ateliê virtual (`#personalizar`)

Oito etapas: caixa, mostrador, ponteiros, luneta, pulseira, movimento, referência e resumo. O site não mostra preços: valor e prazo são combinados no atendimento.

- Todas as cores são livres (seletor de espectro completo e código HEX), inclusive a do aço da pulseira.
- Pulseira em duas cores: laterais de uma cor e centro de outra (no aço, elos de fora e elos do centro).
- Vistas de frente, explodida e de fundo. Ao passar da frente para o fundo, o relógio vira no próprio eixo (meio segundo).
- **Surpreenda-me** (botão "Surpreenda-me" na prévia, "Sortear" no celular, e um convite na etapa Caixa): sorteia uma de 12 receitas inspiradas em relógios clássicos (Azul de mergulho, GMT Pepsi, Panda de corrida, Salmão clássico, Militar, Gelo e outras), com pequenas variações de tom a cada vez. As peças trocam uma a uma na prévia e o aviso mostra o nome da receita. Movimento, tamanho e referência continuam como o cliente escolheu. As receitas ficam em `SURPRISES`, no `js/app.js`.
- **Aviso de combinação**: quando uma cor some sobre a outra (ponteiros, índices, segundos ou ponteirinhos do cronógrafo sobre o mostrador, ou pulseira bicolor com cores quase iguais), aparece um aviso discreto na etapa, com um botão que corrige. A etapa com aviso ganha um pontinho, e o resumo lista todos.
- **Modo noite** (botão com a lua na prévia): o fundo escurece, o relógio apaga e os índices e ponteiros com lume brilham em verde. Se o projeto estiver sem lume, o site avisa onde ativar.
- Origem do movimento: japonês (quartzo, Seiko NH35, Seagull ST3600) ou suíço premium (Sellita SW200-1 automático e Sellita SW210-1 corda manual). O mostrador esqueleto só existe no suíço. Na prévia, os Sellita andam a 8 passos por segundo (28.800 alternâncias/h).
- No automático e na corda manual: fundo de vidro ou fechado, e mostrador inteiro ou esqueleto (centro aberto mostrando o mecanismo).
- Referência: o cliente informa um relógio de referência, anexa até 6 imagens e escreve observações. No celular, o envio já leva as imagens junto (compartilhamento do sistema); no computador, o cliente anexa as imagens na conversa do WhatsApp.
- O relógio da prévia marca a hora real e anda conforme o movimento escolhido. Nos mecânicos dá para dar corda girando a coroa; no cronógrafo os botões laterais ligam, param e zeram.
- O resumo gera a mensagem do WhatsApp com todas as escolhas, os códigos das cores e a referência.
- **Link do projeto**: o botão "Copiar link do projeto" (no celular, abre o compartilhar do sistema) gera um endereço `#p-CT3-…` que abre o ateliê com o relógio já montado, direto no resumo. O mesmo link vai na mensagem do WhatsApp, em "Ver montado".

## Logo

Ficam em `assets/logo/`, em SVG e PNG sem fundo, nas versões creme, escura e dourada: `ferraro-asas-*` (só as asas, usada nos relógios) `ferraro-atelier-*` (logo completa com o nome, usada no topo, nas boas-vindas e no rodapé) e `ferraro-empilhada-*` (asas com FERRARO ATELIER embaixo, usada nos mostradores das fotos e dos desenhos). No site, a logo é um vetor só (`WINGS_D` em `js/watch.js` e o símbolo `#ferraro-wings` no `index.html`), usado no topo, no mostrador da abertura, no rodapé, no ícone da aba e nos desenhos dos relógios (mostrador, rotor e fundo).

## Oficina (`#oficina`, uso interno)

Página para a Ferraro Atelier ver o relógio que o cliente montou. Abra o site com `#oficina` no fim do endereço (há também um link discreto "Oficina" no rodapé).

- Cole a mensagem que o cliente mandou pelo WhatsApp (ou só o código `CT2-...`; códigos antigos `CT1-...` também funcionam) e o relógio aparece montado, de frente, explodido e de fundo, com a ficha completa.
- O código do projeto vai no fim de toda mensagem enviada pelo ateliê virtual e reproduz o relógio exatamente. Sem o código, a Oficina lê as linhas da mensagem e avisa para conferir.
- "Abrir no ateliê virtual" carrega o projeto para ajustar; "Salvar projeto" guarda na lista deste aparelho.

## Como editar

- `js/app.js`, começo do arquivo: `STORE.whatsapp` e `STORE.instagram` (@ferraro_atelier).
- `js/app.js`, `PORTFOLIO`: fotos e descrições das peças da seção "Da bancada". Fotos ficam em `assets/`. Para pôr uma peça à venda, coloque `price: 1500` nela; para tirar da venda, apague o `price` (ela continua no site como portfólio).
- `js/watch.js`: desenho do relógio e funcionamento dos movimentos.
- `js/home.js`: abertura, mostrador vivo, vista explodida, lupa e animações da página inicial. As lacas de exemplo ficam em `LACQUERS`; o horário do lume noturno, em `setNight`.
- `css/styles.css`, começo do arquivo: as cores da casa (laca, impressão, opalino, o vermelho do ponteiro de segundos e o fundo de laca `--ground`).

## Análise de visitas (Vercel)

O `index.html` já tem o script do Vercel Web Analytics (o equivalente ao pacote `@vercel/analytics` para sites sem build). Ele passa a contar visitas quando o site está publicado na Vercel e a aba **Analytics** do projeto está ativada no painel da Vercel.

Também tem o script do Vercel Speed Insights (equivalente ao pacote `@vercel/speed-insights`), que mede a velocidade do site para os visitantes. Ele funciona quando a aba **Speed Insights** do projeto está ativada na Vercel.

## Rodar no computador

```sh
python3 -m http.server 8000
```

Depois abra http://localhost:8000. É um site estático: funciona direto no GitHub Pages, Vercel ou Netlify, sem build.
