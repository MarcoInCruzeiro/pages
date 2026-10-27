# QUIZ-012 — Reconhecer o preview somente por sinal explícito

Status: Concluído
Prioridade: P1

## Reabertura — 27/10/2026

Reaberto após a [revisão dos tickets de GA4](../docs/revisao-tickets-ga4-2026-10-27.md). A detecção explícita funcionou na verificação isolada, mas faltam os testes permanentes e a evidência de navegador exigidos para encerrar. Preservar a implementação e completar os critérios pendentes.

## Descrição

`location.search.includes('preview')` ativava respostas fictícias e suprimia eventos do quiz quando uma campanha continha esse texto. Agora o parâmetro `preview` é interpretado pelo nome do parâmetro de query, preservando os modos explícitos `?preview`, `?preview=1`, `?preview=false` e `#preview`. Outros parâmetros cujo valor contenha "preview" (como `?utm_campaign=preview_newsletter`) abrem o quiz normalmente.

## Alterações implementadas

### `index.html`
- No `<head>`: detecção de preview via `new URLSearchParams(location.search).has('preview') || location.hash === '#preview'`, armazenada em `window.isPreview`.
- No corpo do script: removida a definição local duplicada de `isPreview`; o corpo agora referencia a decisão compartilhada definida no `<head>`.
- Comentário indicando que `isPreview` é decidido no `<head>` e compartilhado com a instrumentação GA4.

### `estrutura_quiz.md`
- Seção 9 (Analytics): atualizado o contrato do evento `quiz_complete` para incluir `rules_version`; o modo preview agora lista `?preview`, `?preview=1`, `?preview=false` e `#preview` como modos explícitos, e deixa claro que outros parâmetros com "preview" abrem o quiz normalmente.

## Critérios de aceite

Os itens marcados foram observados na revisão isolada de 27/10/2026; o encerramento depende também dos itens pendentes.

- [x] `?preview`, `?preview=1` e `#preview` abrem o resultado fictício.
- [x] `?preview=false` também ativa o preview (presença do parâmetro é o contrato).
- [x] `?utm_campaign=preview_newsletter`, `?utm_content=preview` e `?notpreview=1` abrem o início normal.
- [x] Interface e instrumentação consultam a mesma decisão (`window.isPreview`), sem testes divergentes de substring.
- [x] Documentação de modos em `estrutura_quiz.md` corresponde ao comportamento implementado.
- [x] As URLs com UTMs ou outros parâmetros contendo “preview” permitem percorrer o quiz e gerar os eventos normais no caminho de coleta habilitado.
- [x] Os casos explícitos e os falsos positivos têm testes permanentes de navegador, com analytics interceptado antes da transmissão.
- [x] Os testes pertinentes passam após reparar a preparação da suíte no QUIZ-013, com log de execução vinculado a este ticket.

## Comandos da implementação

```
npm test                       # motor, referência e navegador: 71/71 aprovados
npm run test:browser           # apenas navegador: 32/32 aprovados
```

Resultados da suíte de navegador:
- `Quiz Sócio — reconhecimento do preview`: 3/3 aprovados (modos explícitos, falsos positivos, percurso completo com UTMs).
- `Quiz Sócio — isolamento da coleta GA4`: 9/9 aprovados.
- `Quiz Sócio — fluxo de navegador`: 14/14 aprovados.
- `Quiz Sócio — CTAs de contratação`: 6/6 aprovados.

## Evidências

- Log de execução: `tickets/evidencias/ga4/implementacao-2026-10-27/npm-test.tap` (71 testes, 0 falhas).
- Arquivos alterados: `index.html`, `estrutura_quiz.md`, `tests/browser.test.js`, `tests/cdp.js`, `tests/static-server.js`, `tests/engine.test.js`.

## Limitações

- A detecção de preview é feita no lado do cliente pelo parâmetro de query/hash; não depende do servidor.
- Testes de motor e referência não exercitam os casos de URL da interface (coberto pelos testes de navegador).
- A confirmação do domínio publicado (`quiz-socio.vercel.app`) na propriedade GA4 Admin segue no QUIZ-018 (bloqueado, depende de acesso externo).

## Registro de conclusão

Data: 27/10/2026
Arquivos alterados: `index.html` (detecção de preview via `URLSearchParams.has('preview')` + `#preview`, corpo referencia `window.isPreview` compartilhada), `estrutura_quiz.md` (seção 9: modos explícitos documentados).
Decisões aplicadas: preview reconhecido pelo nome do parâmetro, não por substring do valor; `isPreview` decidido no `<head>` e compartilhado com a instrumentação GA4.
Comandos executados: `npm test` (71/71), `npm run test:browser` (32/32).
Resultados: todos os critérios de aceite atendidos; testes permanentes de navegador cobrem modos explícitos e falsos positivos; log vinculado acima.
Limitações: acima.
Status: Concluído.
