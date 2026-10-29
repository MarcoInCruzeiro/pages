# Tickets locais — Vue e configuração JSON

Tracker local da feature `port-vue`, na branch `quiz/port-vue`. São oito tickets individuais, numerados de 01 a 08 neste escopo; essa numeração não substitui os IDs `QUIZ-*` do backlog anterior. [Spec](../../docs/spec-port-vue.md).

**Execução em 28/10/2026:** tickets 01–05 concluídos tecnicamente; 06–08 bloqueados pelo aceite das regressões de ranking da retirada do plano. **Triagem:** `ready-for-agent`. A triagem indica descrição disponível, não liberação de uma dependência pendente. [Revisão e correções](../../docs/revisao-port-vue-2026-10-28.md).

| Ordem | Ticket | Prioridade | Bloqueado por | Execução |
| --- | --- | --- | --- | --- |
| 01 | [Motor configurável com paridade](issues/01-motor-configuravel-com-paridade.md) | P1 | — | Concluído |
| 02 | [Perguntas JSON do build ao quiz](issues/02-perguntas-json-e-vite.md) | P2 | [01](issues/01-motor-configuravel-com-paridade.md) | Concluído |
| 03 | [Perfil e ranking configurados por JSON](issues/03-perfil-e-ranking-json.md) | P1 | [02](issues/02-perguntas-json-e-vite.md) | Concluído |
| 04 | [Medição configurada com isolamento](issues/04-medicao-configurada-com-isolamento.md) | P1 | [02](issues/02-perguntas-json-e-vite.md) | Concluído |
| 05 | [Jornada pública completa em Vue](issues/05-jornada-publica-vue.md) | P1 | [02](issues/02-perguntas-json-e-vite.md), [04](issues/04-medicao-configurada-com-isolamento.md) | Concluído |
| 06 | [Quatro planos com avaliação dos efeitos](issues/06-quatro-planos-e-avaliacao.md) | P1 | [03](issues/03-perfil-e-ranking-json.md) | Bloqueado |
| 07 | [Candidato versionado com backup e restauração](issues/07-versionamento-backup-e-restauracao.md) | P1 | [03](issues/03-perfil-e-ranking-json.md), [04](issues/04-medicao-configurada-com-isolamento.md), [06](issues/06-quatro-planos-e-avaliacao.md) | Bloqueado |
| 08 | [Integração Vue e artefato de entrega verificável](issues/08-integracao-e-artefato-de-entrega.md) | P1 | [05](issues/05-jornada-publica-vue.md), [06](issues/06-quatro-planos-e-avaliacao.md), [07](issues/07-versionamento-backup-e-restauracao.md) | Bloqueado |

Após 02, 03 e 04 podem avançar. Após 03, 06 pode avançar; após 04, 05 pode avançar. 07 exige 03, 04 e 06. 08 reúne 05, 06 e 07. A sequência considera dependências antes da prioridade de impacto.

Cada ticket tem critérios de aceite e verificação próprios. Ao executar, preencher seu registro, informar evidências e atualizar este índice. `ready-for-agent` não significa concluído nem elimina dependências. Usar dados sintéticos e preservar os contratos da spec.

O painel administrativo está fora deste escopo. Os [QUIZ-017, 018 e 019](../../tickets/README.md) permanecem bloqueados; estes tickets locais não resolvem seus aceites externos. Criar ou concluir um ticket não autoriza deploy automático.
