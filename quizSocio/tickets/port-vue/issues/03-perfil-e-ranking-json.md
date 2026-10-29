# 03: Perfil e ranking configurados por JSON

**O que construir:** permitir simular ajustes documentados de perfil e ranking sem editar o algoritmo, usando a mesma configuração no quiz e no avaliador.

**Bloqueado por:** [02 — Perguntas JSON do build ao quiz](02-perguntas-json-e-vite.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Extrair os parâmetros do perfil e os sete componentes do ranking, incluindo escalas, fatores de cobertura, utilidades de ingresso e mistura familiar pertinentes.
- [x] Configurar presença como modulador existente, sem acrescentar um oitavo componente nem criar campos de perfil inexistentes.
- [x] Validar ranking e perfil contra as definições corretas do schema compartilhado, rejeitando campos desconhecidos, expressões e combinações inválidas.
- [x] Com os coeficientes originais e cinco planos, preservar resultados e métricas da referência; manter assinatura como única entrada financeira do componente de preço.
- [x] Uma configuração alternativa válida produz o comportamento previsto em cenário controlado, sem contaminar outra instância.
- [x] O avaliador aceita a instância configurada e informa os insumos usados; comparação não depende de dados capturados em uma instância global diferente.
- [x] Orçamento e desempate permanecem invariantes do algoritmo, fora dos controles editáveis.

## Verificação

avaliação das referências pelas entradas públicas do motor, além de casos de rejeição e isolamento de instâncias; nenhuma calibração comercial integra esta extração.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.
