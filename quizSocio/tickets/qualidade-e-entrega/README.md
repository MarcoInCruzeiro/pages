# Tickets locais — qualidade e entrega

Tracker versionado da fase de fechamento após a migração Vue. São nove tickets numerados por dependência; esta numeração é separada dos `QUIZ-*` e dos tickets 01–08 da feature `port-vue`.

**Contexto histórico do planejamento:** branch `quiz/port-vue`, 132 testes aprovados naquele momento, `releaseApproved: false` pelas perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`. Produção ainda serve a versão estática anterior. Os QUIZ-017, 018 e 019 permanecem bloqueados externamente e não são resolvidos por este tracker.

A numeração segue a ordem de dependência: primeiro os tickets sem bloqueio, depois os que dependem deles.

| Ordem | Ticket | Bloqueado por | Entrega |
| --- | --- | --- | --- |
| 01 | [Dossiê de decisão das perdas de ranking](issues/01-dossie-de-decisao-das-perdas.md) | — | Evidência atual + relatório para decisão |
| 02 | [Rastrear tickets locais e limpar o workspace](issues/02-rastreio-e-limpeza.md) | — | Clone reproduzível e árvore limpa |
| 03 | [Pré-compilar os validadores de configuração](issues/03-validadores-pre-compilados.md) | — | Ajv fora do startup do navegador |
| 04 | [Reaproveitar a medição do espaço das perguntas](issues/04-medicao-das-perguntas.md) | — | Abertura sem medir 12 estados escondidos |
| 05 | [Reduzir o peso do artefato público](issues/05-peso-do-artefato.md) | — | Menos duplicação e mídia mais leve |
| 06 | [Adicionar CI de testes](issues/06-ci-de-testes.md) | — | Suíte completa em push/PR |
| 07 | [Documentação do estado vigente](issues/07-documentacao-do-estado-vigente.md) | 01, 02 | Backlog e docs alinhados ao Vue/JSON |
| 08 | [Registrar aceite e preparar candidato aprovado](issues/08-aceite-e-candidato.md) | 01, 02 + aceite do responsável | Candidato aprovado, não diagnóstico |
| 09 | [Fundir a branch e publicar a versão Vue](issues/09-merge-e-publicacao.md) | 06, 08 | Produção na versão Vue atual |

## Sequência

```
01 ─┐
02 ─┴─> 07
01,02 + aceite ─> 08 ─┐
                     ├─> 09
06 ──────────────────┘
03, 04, 05 independentes
```

Os tickets 03–05 não bloqueiam o candidato 08 por decisão do responsável. Se forem concluídos depois do candidato e antes da publicação, o candidato deve ser refeito para incluir as mudanças.

## Limites

- O aceite das perdas é decisão do responsável; nenhum ticket cria esse aceite por conta própria.
- O ticket 09 entrega a versão; a comprovação de recebimento no GA4 e a continuidade no checkout continuam nos QUIZ-017, 018 e 019.
- Nenhum ticket autoriza deploy automático. A publicação do 09 exige ação explícita posterior.

## Execução em 29/10/2026

Local canônico: `tickets/qualidade-e-entrega/`; migração preservada em `tickets/port-vue/`. `.scratch/` é apenas diagnóstico e snapshots ignorados. O protótipo de percentual está arquivado em `docs/prototypes/` e fora do build.

Fotografia vigente: **147 testes aprovados, zero falhas**, com build Vite, motor, referências, configuração, startup dev e navegador. Contagens de outras datas são históricas. [Evidências desta execução](../evidencias/qualidade-e-entrega-2026-10-29/README.md).

O aceite comercial das quatro perdas é separado do pedido de executar tickets. Os tickets 08 e 09 permanecem bloqueados; nenhum arquivo `quality-approval.json` é criado sem a decisão do responsável. A publicação continua dependendo de ação explícita posterior.

| Ticket | Fechamento |
| --- | --- |
| 01 | Concluído: dossiê e hashes, sem aceite |
| 02 | Concluído: tickets versionados, snapshots ignorados, clone e diagnóstico com árvore limpa |
| 03 | Concluído: validadores gerados, gate de identidade e medição de abertura |
| 04 | Concluído: poucos estados Vue medidos, reservas reutilizadas e geometria preservada; ganho isolado de tempo não demonstrado |
| 05 | Concluído: vídeo −62%, artefato −66%, sem duplicação de imagens |
| 06 | Concluído: CI verde/vermelho no GitHub e check obrigatório na main |
| 07 | Concluído: backlog, configuração, entrega, links e transições atualizados |
| 08 | Bloqueado: falta aceite explícito das quatro perdas, com nome do responsável |
| 09 | Bloqueado: depende de 08 e autorização posterior de publicação |
