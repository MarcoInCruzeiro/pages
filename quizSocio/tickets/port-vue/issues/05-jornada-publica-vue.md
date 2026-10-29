# 05: Jornada pública completa em Vue

**O que construir:** entregar em Vue a jornada completa do torcedor com a aparência, os textos e o comportamento aceitos, usando o mesmo motor e adaptador de medição.

**Bloqueado por:** [02 — Perguntas JSON do build ao quiz](02-perguntas-json-e-vite.md); [04 — Medição configurada com isolamento](04-medicao-configurada-com-isolamento.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Início, progresso, 12 perguntas, retorno, confirmação/revisão de conflitos, resultado, comparativo e refazer funcionam pelo fluxo Vue.
- [x] Respostas ausentes impedem avanço com orientação; confirmação não corrige incompatibilidades silenciosamente.
- [x] Resultado mantém valores financeiros separados, motivos coerentes, condições de setor/nível e afinidade estimada.
- [x] Comparativo usa o catálogo recebido, sem depender de quantidade fixa de planos; três origens de CTA mantêm links e dimensões corretos.
- [x] Cliques repetidos, troca rápida de direção e remontagem não avançam duas perguntas, repetem resultado ou duplicam eventos/listeners.
- [x] Teclado, foco de modal, navegação móvel, contraste, ausência de overflow e redução de movimento permanecem atendidos.
- [x] Testes de jornada usam a aplicação compilada e verificam comportamento observável; não introduzir uma nova ferramenta de E2E sem necessidade.
- [x] Não criar painel, rota, scaffold ou dependências exclusivas de admin.

## Verificação

regressão CDP adaptada e inspeção responsiva dos estados principais. Este ticket pode ser demonstrado com o catálogo vigente; a retirada do Cativo pertence ao 06.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.
