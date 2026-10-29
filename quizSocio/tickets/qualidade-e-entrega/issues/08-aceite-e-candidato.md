# 08: Registrar aceite e preparar candidato aprovado

**O que construir:** depois da decisão do responsável, o aceite das quatro perdas vira um registro verificável e o projeto produz um candidato de entrega aprovado, não diagnóstico.

**Bloqueado por:** 01 (dossiê), 02 (árvore limpa) e aceite explícito do responsável pelas perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`.

**Status:** ready-for-agent
**Situação da execução:** Bloqueado
**Prioridade:** P1

## Critérios de aceite

- [ ] `config/quality-approval.json` contém `approved: true`, `approvedBy`, `approvedAt`, o `configurationHash` vigente, os dois `referenceHashes` e exatamente os quatro IDs aceitos.
- [ ] `npm run release:prepare` sem `--diagnostic` conclui com `releaseApproved: true`, `diagnostic: false` e `workingTreeHasChanges: false`.
- [ ] O manifesto identifica commit, versões, hashes, referências e a lista de arquivos do pacote.
- [ ] O pacote isolado abre e conclui a jornada em navegador, sem asset quebrado, erro de inicialização ou coleta GA4.
- [ ] O alvo de rollback — deployment anterior — é registrado.
- [ ] Nenhum deploy é feito neste ticket.
- [ ] Se 03, 04 ou 05 forem concluídos depois deste candidato, ele é refeito antes da publicação.

## Verificação

Inspeção do JSON de aceite, do manifesto e dos hashes; jornada completa no pacote isolado.

## Registro de execução

Pendente: depende do aceite explícito do responsável.
