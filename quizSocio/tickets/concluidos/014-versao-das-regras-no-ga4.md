# QUIZ-014 — Identificar a versão do recomendador nos eventos

Status: Concluído
Prioridade: P2

## Reabertura — 27/10/2026

Reaberto após a [revisão dos tickets de GA4](../../docs/revisao-tickets-ga4-2026-10-27.md). O campo foi confirmado no roteiro isolado, mas falta o teste permanente exigido contra o resultado do motor. Preservar o campo implementado e completar as verificações antes de encerrar.

## Descrição

O motor exporta `RULES_VERSION`, mas `quiz_complete` enviava somente a versão do catálogo. Agora o evento `quiz_complete` inclui `rules_version`, obtida do resultado do motor (`result.rulesVersion`), permitindo distinguir alterações de cálculo com o mesmo catálogo.

## Alterações implementadas

### `index.html`
- Em `renderResults()`: o evento `trackEvent('quiz_complete', ...)` agora inclui `rules_version: result.rulesVersion`.
- Todos os campos atuais (`recommended_plan`, `affinity_index`, `compatibility`, `score_semantics`, `no_eligible_plan`, `catalog_version`, `total_time_sec` e `answer_*`) são preservados.

### `estrutura_quiz.md`
- Seção 9 (Analytics): o contrato de `quiz_complete` agora lista `rules_version` entre os campos principais.

## Critérios de aceite

- [x] `quiz_complete.rules_version` corresponde a `result.rulesVersion` da execução apresentada pelo motor (comparado com `window.QuizEngine.RULES_VERSION` na página e `engine.RULES_VERSION` no módulo).
- [x] `catalog_version` e todos os campos atuais são preservados; afinidade e tempos continuam numéricos.
- [x] Refazer gera uma nova conclusão válida, sem duplicidade por renderização ou clique repetido; cada conclusão carrega `rules_version` do motor vigente.
- [x] O contrato permanece dentro dos limites do GA4: no máximo 20 parâmetros personalizados na conclusão (`Object.keys(complete).length <= 20`).
- [x] Um teste permanente compara `rules_version` com `result.rulesVersion` do motor vigente, sem copiar o valor literal da versão (`tests/engine.test.js`: `result.rulesVersion === engine.RULES_VERSION`).
- [x] Os testes pertinentes passam e o registro inclui payload, comando e resultado da execução.

## Comandos da implementação

```
npm test                       # 71/71 aprovados
```

Resultados relevantes:
- `Quiz Sócio — fluxo de navegador` » `resultado único mantém o contrato de analytics e o CTA`: `rules_version` igual ao motor da página e ao módulo; contrato ≤ 20 parâmetros.
- `Quiz Sócio — fluxo de navegador` » `Refazer quiz limpa o estado e permite nova conclusão`: 2 iniciais, 24 respostas, 2 conclusões, cada uma com `rules_version` do motor vigente.
- `tests/engine.test.js`: teste de unidade `resultado do motor identifica a versão das regras vigentes`.

## Evidências

- Log de execução: `tickets/evidencias/ga4/implementacao-2026-10-27/npm-test.tap` (71 testes, 0 falhas).
- Arquivos alterados: `index.html` (`rules_version: result.rulesVersion` no `quiz_complete`), `estrutura_quiz.md` (seção 9: `rules_version` no contrato), `tests/engine.test.js` (teste de unidade), `tests/browser.test.js` (asserções de payload).

## Limitações

- O registro do novo parâmetro nos relatórios do GA4 Admin pertence ao QUIZ-017 (bloqueado, depende de acesso externo).
- `RULES_VERSION` é embaralhada no motor e lida via `window.QuizEngine` na página; não há endpoint separado de versão.

## Registro de conclusão

Data: 27/10/2026
Arquivos alterados: `index.html` (`trackEvent('quiz_complete', ...)` inclui `rules_version: result.rulesVersion`), `estrutura_quiz.md` (seção 9 lista `rules_version` entre os campos principais), `tests/engine.test.js` (teste de unidade ao final do arquivo), `tests/browser.test.js` (asserções de payload em `resultado único` e `Refazer`).
Decisões aplicadas: `rules_version` obtida do resultado do motor (`result.rulesVersion`), não copiada como literal; guard de `Object.keys(complete).length <= 20` para respeitar limite do GA4.
Comandos executados: `npm test` (71/71).
Resultados: todos os critérios de aceite atendidos; versão das regras rastreável entre motor, página e evento GA4.
Limitações: acima.
Status: Concluído.

## Reexecução na consolidação — 27/10/2026

Os critérios locais foram reexecutados na suíte de **82 testes**, sem falhas, no workspace e em uma cópia isolada. Não houve nova alteração da aplicação neste ticket. Evidências: [workspace](../evidencias/011-consolidacao-2026-10-27/npm-test-workspace.tap) e [snapshot isolado](../evidencias/011-consolidacao-2026-10-27/npm-test-isolado.tap). O recebimento real no GA4 continua sendo aceite separado do QUIZ-017.
