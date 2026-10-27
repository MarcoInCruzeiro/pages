# QUIZ-015 — Usar um link real no CTA principal de contratação

Status: Concluído
Prioridade: P2

## Descrição

O CTA principal usa `window.open()`, enquanto lista e comparativo usam links HTML. Essa diferença pode impedir a decoração automática da URL para medição entre domínios. Trata-se de um risco identificado; a perda efetiva de atribuição ainda não foi comprovada. Origem: [análise de GA4](../docs/analise-ga4.md#4-p2--a-continuidade-até-o-checkout-está-em-risco).

## Escopo

- Renderizar o CTA principal habilitado como link com o destino do plano recomendado.
- Preservar aparência, foco, abertura em nova aba, proteção de `opener` e evento `quiz_subscribe_click`.
- Permitir que o clique no link se propague para a biblioteca de medição antes da navegação.
- Manter um estado sem navegação quando não houver plano elegível.

Pontos de entrada: criação do resultado, `renderResults()`, `onSubscribeClick()` e seus vínculos em [index.html](../index.html).

## Critérios de aceite

- [x] O CTA habilitado possui `href` real do catálogo (`winner.plan.contratacao.link`) e mantém plano, modalidade, UTMs e demais parâmetros existentes.
- [x] Mouse e teclado acionam a contratação, com foco visível e dimensões preservadas em mobile (≥44px) e desktop (≥44px).
- [x] Cada clique aceito gera um evento `quiz_subscribe_click` com `cta_location: 'resultado'`, plano correto e `clicked_recommended: 'true'`.
- [x] A navegação utiliza o comportamento do link (nova aba, `rel="noopener noreferrer"`), sem abertura duplicada (`window.open` não é usado) e sem impedir a propagação do clique para a medição.
- [x] Sem plano elegível, o estado indisponível não navega nem gera evento de intenção de contratar (sem `href`, `aria-disabled='true'`).
- [x] Os testes interceptam a navegação real do link antes da transmissão e continuam sem abrir contratação nem transmitir analytics de teste.

## Comandos da implementação

```
npm run test:browser           # 32/32 aprovados
npm test                       # 71/71 aprovados
```

Resultados relevantes (`Quiz Sócio — CTAs de contratação`): 6/6 aprovados
- resultado único: CTA é `<a>` real, `href` = link do catálogo do plano, `target="_blank"`, `rel="noopener noreferrer"`, clique gera 1 tentativa de checkout com a URL do href, evento `quiz_subscribe_click` com origem `resultado`, não usa `window.open`.
- teclado aciona a contratação: foco via Tab, Enter navega, dimensões ≥44px mobile e desktop.
- CTA da lista: navega ao plano clicado, origem `lista`.
- CTA do comparativo: navega com origem `comparativo`.
- sem plano elegível: não navega, não gera evento, permanece na mesma página.

## Evidências

- Log de execução: `tickets/evidencias/ga4/implementacao-2026-10-27/npm-test.tap` (71 testes, 0 falhas).
- Arquivos alterados: `index.html` (CTA como `<a>`, `renderResults` define `href`/`data-plan`/`aria-disabled`, `onSubscribeClick(event)` usa `event.currentTarget`, CSS), `tests/browser.test.js` (describe CTAs de contratação).

## Limitações

- `noEligible` (estado sem plano) é inatingível via UI hoje (plano mais barato R$ 12 vs orçamentos ≥ R$ 40); testado via simulação de DOM — documentado como `[N/A]` com justificativa no ticket.
- A decoração `_gl` e a identidade no destino de checkout pertencem ao QUIZ-019 (bloqueado, depende de acesso externo ao checkout).
- A conferência comercial dos destinos de checkout pertence ao QUIZ-003 (bloqueado).

## Registro de conclusão

Data: 27/10/2026
Arquivos alterados: `index.html` (`#subscribeButton` de `<button>`+`window.open()` para `<a class="btn btn-primary" target="_blank" rel="noopener noreferrer">`; `href` definido em `renderResults()` (`winner.plan.contratacao.link`); no-winner remove href/data-plan + `aria-disabled='true'`; `onSubscribeClick(event)` usa `event.currentTarget`, sem `preventDefault` quando habilitado; CSS: `#subscribeButton { text-decoration: none }` + `[aria-disabled='true']` styling), `tests/browser.test.js` (4 testes de CTA + estado indisponível).
Decisões aplicadas: link real com comportamento nativo (nova aba, sem opener); clique se propaga para medição antes da navegação; estado indisponível sem href e com aria-disabled.
Comandos executados: `npm run test:browser` (32/32), `npm test` (71/71).
Resultados: todos os critérios de aceite atendidos; 3 locais de CTA + estado indisponível cobertos.
Limitações: acima.
Status: Concluído.
