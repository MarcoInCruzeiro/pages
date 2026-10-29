# 04: Medição configurada com isolamento

**O que construir:** controlar ID, hosts e contrato GA4 por JSON, mantendo decisão de coleta única antes da tag e dos eventos do quiz.

**Bloqueado por:** [02 — Perguntas JSON do build ao quiz](02-perguntas-json-e-vite.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] A configuração inicial preserva o ID, allowlist, quatro eventos e parâmetros atuais, com identidades semânticas estáveis para emissão.
- [x] O bootstrap no head lê o snapshot incorporado ao build e decide coleta antes de inicializar ou inserir a tag.
- [x] Preview, localhost, loopbacks e protocolo local nunca coletam, inclusive quando inseridos por engano na allowlist; hosts permitidos usam igualdade exata.
- [x] Configuração de medição inválida é rejeitada no build; falha em execução mantém coleta desligada e uso do quiz disponível.
- [x] Validar o payload final contra teto interno de 20 parâmetros personalizados, incluindo os 12 campos de resposta na conclusão; documentar limite técnico GA4 de 25 separadamente.
- [x] Preservar versões, afinidade, semântica, compatibilidade legada e origem do CTA; migração de nome ou remoção de campo protegido exige registro e aprovação próprios.
- [x] Inicialização e eventos ocorrem uma única vez por ação legítima; o adaptador é reutilizável pela jornada Vue.
- [x] Testes interceptam analytics antes do bootstrap e não enviam dados à propriedade real. Os aceites administrativos externos continuam pendentes.

## Verificação

navegador contra o artefato compilado, com produção simulada, hosts excluídos, preview e payloads capturados localmente.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.
