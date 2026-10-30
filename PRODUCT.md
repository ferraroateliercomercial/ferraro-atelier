# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que gostam de relógio, mas não são especialistas, e querem uma peça única que ninguém mais tem (confirmado pelo dono em 2026-10-18). Inferido, não confirmado: boa parte chega pelo Instagram e navega pelo celular.

## Product Purpose

A Ferraro Atelier monta relógios sob encomenda. O site existe para levar o visitante a montar o próprio relógio no ateliê virtual e enviar o projeto pelo WhatsApp; valor e prazo são combinados no atendimento. Sucesso é um projeto recebido no WhatsApp. Caminho secundário: comprar uma das peças prontas à venda.

## Positioning

Cada relógio é montado à mão a partir das escolhas do cliente, peça por peça: caixa, mostrador, ponteiros, luneta, pulseira e movimento japonês (quartzo, Seiko NH35, Seagull ST3600) ou suíço premium (Sellita SW200-1 automático, Sellita SW210-1 corda manual). A cor é livre em tudo (espectro completo), e a prévia do ateliê funciona como um relógio de verdade: marca a hora, recebe corda, gira o rotor e aciona o cronógrafo.

## Operating Context

- Atendimento e fechamento pelo WhatsApp (48) 99695-0800 (wa.me/5548996950800). Instagram: @ferraro_atelier.
- O projeto viaja como mensagem de WhatsApp com um código (CT3-…) e um link `#p-…` que reabre o relógio montado no ateliê.
- A Oficina (`#oficina`) é a ferramenta interna que reconstrói o relógio a partir da mensagem ou do código do cliente.

## Capabilities and Constraints

- Site estático (HTML, CSS e JavaScript sem etapa de build), publicado na Vercel com Analytics e Speed Insights por script. Também é publicado como Artifact por um build que embute CSS e JS.
- Ateliê virtual em 8 etapas (caixa, mostrador, ponteiros, luneta, pulseira, movimento, referência, resumo), com Surpreenda-me, aviso de combinação, modo noite, vista explodida e fundo, link de projeto.
- Sem preços no configurador e sem gravação. Mostrador esqueleto só nos movimentos suíços; fundo de vidro só nos mecânicos.
- Códigos de projeto CT1, CT2 e CT3 continuam válidos.
- Peças à venda, nesta ordem: Carbon Edition (R$ 2.199, 20 ATM), Geleira (R$ 1.399, Miyota 8285, dia e data, 10 ATM) e Arcanjo (R$ 1.599, mostrador branco com cruz e asas, 20 ATM). O Cipreste (antes Verde Fumê) saiu da loja.

## Brand Commitments

- Nome: Ferraro Atelier (antes Custom Time).
- Logo: asas + FERRARO | ATELIER (versão em negrito), e a versão empilhada (asas, FERRARO, ATELIER) nos mostradores dos relógios desenhados e das fotos.
- Português do Brasil, tom de ateliê: direto, artesanal, sem exagero.
- Pedido explícito do dono (2026-10-18): site "de 100 mil", com abertura em motion design de um relógio (no espírito do loader da prancha do site da Alívio), primeira dobra sem botões e as melhores animações possíveis.
- Pedidos do dono (2026-10-19): animações mais suaves e fluidas, e uma paleta que remeta a floresta: verde terroso, um toque de dourado e marrom.

## Evidence on Hand

- Fotos reais: `assets/carbon-edition.jpg`, `assets/geleira.jpg`, `assets/arcanjo.jpg`, `assets/atelie.jpg`, `assets/movimento.jpg`. Logos em `assets/logo/`.
- O relógio desenhado em SVG (`js/watch.js`) com todas as peças, camadas da vista explodida e movimento animado.
- Não existem depoimentos, número de clientes, prêmios ou imprensa: não inventar.
- Fora do site até o dono confirmar (2026-10-18): estojo, certificado, garantia de 12 meses, teste de vedação, fotos da bancada enviadas ao cliente e prazo fixo de 15 a 30 dias úteis. O texto de Montagem, Entrega e da dúvida sobre prazo foi reescrito sem essas promessas.

## Product Principles

1. Montar é o caminho principal: cada parte do site leva ao ateliê virtual.
2. Mostrar em vez de prometer: o relógio do site funciona de verdade.
3. Peça única: escolhas reais e cor livre, nunca um catálogo para escolher.
4. Conversa humana: valor e prazo no WhatsApp, nunca na tela.

## Accessibility & Inclusion

- Respeitar movimento reduzido com transições curtas e suaves, nunca cortando o conteúdo.
- Texto funcional com no mínimo 12px; campos de texto com 16px.
