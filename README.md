# Ferraro Atelier

Site da Ferraro Atelier, relojoaria sob encomenda. O cliente não compra relógios prontos: ele monta o próprio relógio no **ateliê virtual** e envia o projeto pelo WhatsApp.

## Página inicial: o mostrador vivo

A primeira tela é o mostrador inteiro de um relógio, visto de cima, numa paleta de floresta: laca verde-musgo (o verde é só o padrão: a cor é livre), impressão marfim, índices e ponteiros dourados, caixa e coroa de bronze, nogueira e couro no segundo fundo escuro, linho nas partes claras e o dourado do ponteiro de segundos como único acento. Os fundos escuros do site são a mesma laca: clara no meio, quase preta nas bordas.

- **Abertura em motion design** (uma vez por visita; quem volta na mesma sessão vê uma versão curta): a laca se derrama do centro até cobrir a tela, com a borda esfumada e o reflexo dos raios de sol dando uma volta, o cristal entra por cima com um reflexo atravessando a tela, o trilho de minutos é impresso pelas bordas da tela, os índices descem um a um (no computador, o 12 e o 6 são numerais inteiros no anel dos índices), a logo é impressa, a janela da data gira até o dia de hoje (é o contador da abertura) e os ponteiros saem do meio-dia e acertam a hora de quem está vendo. Um toque, clique, tecla ou tentativa de rolar acelera o resto.
- **Primeira tela sem botões**: só o mostrador, o título impresso na metade de baixo ("Seu relógio, peça por peça.") e a **coroa** na borda direita, que é a ação ("Monte o seu"). O cabeçalho com o menu só aparece quando a pessoa começa a rolar (ou ao navegar pelo teclado).
- O relógio marca a hora real, com o ponteiro de segundos deslizando sem parar. A abertura e o recuo só movem e esmaecem camadas já prontas (a laca é pintada uma vez num canvas e abre por escala; trilho, índices, logo e aro da luneta são camadas próprias), então rodam lisos também no celular. O brilho de raios de sol acompanha o mouse; no celular, ele oscila sozinho. Das 19h às 6h (no relógio de quem visita), o lume dos índices e dos ponteiros acende em verde.
- **Ao rolar**: a laca que cobria a tela se fecha num círculo enquanto o relógio já vai para o seu lugar, ao lado do texto (a luneta gira em cliques de meio minuto); ali ele vira de lado, em três quartos, e se abre em sete camadas com as legendas dos dois lados, cada uma com um fio até a sua peça; depois a câmera entra pelo cristal até o mostrador, que cresce e desliza para o outro lado da tela, e o texto troca ("De perto, cada detalhe é seu."). No computador, passar o mouse numa legenda isola a peça.
- **Sob encomenda, com o filme** ("O seu ainda não existe."): logo depois da vista explodida, uma página dupla em fundo linho, como as grandes casas fazem com filme vertical. À esquerda, o texto que apresenta a personalização: a frase de abertura, um parágrafo, três compromissos (as seis escolhas são suas; nada é montado sem o seu sim; a sua ideia cabe aqui) e os botões "Montar o meu relógio" e "Como funciona". À direita, o filme de 10,5 s da Carbon Edition, em pé como foi filmado, numa moldura que cabe inteira na tela; a legenda diz qual é a peça e "Ver a peça" abre a ficha dela. Nada segura a rolagem: na primeira chegada a moldura se abre como uma janela e o filme se dissolve do escuro, devagar. Em telas baixas a moldura acompanha a leitura. No celular o filme vem primeiro, de borda a borda, com o título sobre ele, e o texto segue embaixo. O vídeo só carrega quando a seção se aproxima, só roda enquanto aparece, não tem som e tem botão de pausar; com "reduzir movimento", fica parado e só começa pelo botão. Os arquivos ficam em `assets/film/` (WebM VP9 e MP4 H.264, mais a imagem de capa).
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

Oito etapas: caixa, mostrador, ponteiros, luneta, pulseira, movimento, referência e resumo. O site não mostra preços: valor e prazo são combinados no atendimento. Quem abre o ateliê pela primeira vez começa do relógio da página inicial (mostrador verde-musgo, caixa de bronze, luneta marrom e pulseira de couro); "Recomeçar" volta para ele. Os códigos de projeto continuam lidos a partir do `DEFAULT_WATCH`, então projetos antigos não mudam.

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

- `js/app.js`, começo do arquivo: `STORE.whatsapp`, `STORE.instagram` (@ferraro_atelier) e `STORE.email` (ferraroatelier.comercial@gmail.com).
- `js/app.js`, `PORTFOLIO`: fotos e descrições das peças da seção "Da bancada". Fotos ficam em `assets/`. Para pôr uma peça à venda, coloque `price: 1500` nela; para tirar da venda, apague o `price` (ela continua no site como portfólio).
- `js/watch.js`: desenho do relógio e funcionamento dos movimentos.
- `js/home.js`: abertura, mostrador vivo, vista explodida, lupa e animações da página inicial. As lacas de exemplo ficam em `LACQUERS`; o horário do lume noturno, em `setNight`.
- `assets/film/`: para trocar o filme, substitua os dois vídeos mantendo os nomes (`ferraro-filme-9x16.webm` e `ferraro-filme-9x16.mp4`, vertical, sem som) e a capa `ferraro-filme-9x16.webp` (um quadro do começo do vídeo). O site usa só a versão vertical.
- `css/styles.css`, começo do arquivo: as cores da casa (laca, impressão, opalino, o vermelho do ponteiro de segundos e o fundo de laca `--ground`).

## Publicação (Cloudflare Pages)

O site é publicado na Cloudflare Pages, ligada a este repositório: cada push na branch `main` vai para o ar sozinho.

- Comando de build: `bash scripts/build.sh` · pasta de saída: `dist`.
- Se o projeto foi criado pelo caminho **Workers** (e não Pages): comando de build `bash scripts/build.sh` e comando de deploy `npx wrangler deploy`; o `wrangler.jsonc` já aponta para `dist`.
- O script copia só `index.html`, `css/`, `js/` e `assets/` para `dist/`; o resto (branding, documentos, ferramentas) fica no repositório e não é publicado.
- Visitas: ative o **Web Analytics** do projeto no painel da Cloudflare (gratuito, sem cookies, não precisa de código no site).

## Rodar no computador

```sh
python3 -m http.server 8000
```

Depois abra http://localhost:8000. É um site estático: funciona em qualquer hospedagem de site estático (Cloudflare Pages, Netlify, GitHub Pages).
