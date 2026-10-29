# 01: Motor configurável com paridade

**O que construir:** permitir instanciar o recomendador com configuração independente, preservando o comportamento da configuração atual para o quiz e para o avaliador.

**Bloqueado por:** Nenhum; pode começar imediatamente.

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Registrar o baseline do workspace, com revisão de código e hashes dos insumos; distinguir alterações locais do HEAD.
- [x] Instanciar o motor com dados recebidos, sem DOM, analytics, rede ou sistema de arquivos na lógica de cálculo.
- [x] Preservar as entradas públicas usadas pelos consumidores durante a transição; remover compatibilidade temporária somente na integração final.
- [x] Configuração equivalente mantém respostas válidas, conflitos, índices, ranking, elegibilidade, motivos e valores separados nos cenários existentes.
- [x] Duas instâncias com configurações diferentes não compartilham mutações nem alteram a configuração recebida.
- [x] Executar a suíte aplicável e registrar o resultado, sem alegar que o commit isolado representa o baseline do workspace.

## Verificação

comparação comportamental pelo ponto público de recomendação e testes existentes de respostas/conflitos, mantendo os cinco planos apenas nesta etapa de paridade.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.
