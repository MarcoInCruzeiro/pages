# 08: Preparar candidato aprovado após corrigir o ranking

**O que construir:** produzir um candidato de entrega aprovado, não diagnóstico, após resolver as divergências do ranking. Em 03/11/2026 o usuário rejeitou o aceite das perdas e determinou a correção do motor; a revisão `2026-11-03.2` tem zero regressões e não requer arquivo de aceite.

**Bloqueado por:** preparo do candidato com árvore limpa (02) e validação dos critérios de entrega restantes. O bloqueio por aceite das quatro perdas foi resolvido pela correção, sem aprovação dos resultados rejeitados.

**Status:** ready-for-agent
**Situação da execução:** Bloqueado
**Prioridade:** P1

## Critérios de aceite

- [x] As quatro perdas foram corrigidas sem alterar as expectativas: a revisão `2026-11-03.2` atende às 40 referências sintéticas e passa no gate sem `config/quality-approval.json`. Aceite seria necessário apenas se houvesse perdas novas a aceitar; o usuário rejeitou essa solução para os quatro casos originais.
- [ ] `npm run release:prepare` sem `--diagnostic` conclui com `releaseApproved: true`, `diagnostic: false` e `workingTreeHasChanges: false`.
- [ ] O manifesto identifica commit, versões, hashes, referências e a lista de arquivos do pacote.
- [ ] O pacote isolado abre e conclui a jornada em navegador, sem asset quebrado, erro de inicialização ou coleta GA4.
- [ ] O alvo de rollback — deployment anterior — é registrado.
- [ ] Nenhum deploy é feito neste ticket.
- [ ] Se 03, 04 ou 05 forem concluídos depois deste candidato, ele é refeito antes da publicação.

## Verificação

Conferir ausência de regressões, manifesto, hashes e árvore limpa; executar a jornada completa no pacote isolado. Não há JSON de aceite a inspecionar na revisão atual, pois o usuário rejeitou as perdas e o motor foi corrigido.

## Registro de execução

Revisão documental em 04/11/2026: o pacote local de GA4 `2026-11-03.1` e seu contrato em português foram preparados/conferidos no QUIZ-018. Ele ainda declara `workingTreeHasChanges: true`. A geração do candidato com árvore limpa, os critérios de integração e o alvo de rollback permanecem pendentes; este ticket não foi concluído por atualização documental.

Atualização em 03/11/2026: [correção do ranking e evidências](../../../docs/correcao-ranking-sem-preco-2026-11-03.md). Não há aceite nem aprovação dos resultados anteriores. O gate do ranking passou, mas o ticket não está concluído: candidato com árvore limpa, validação isolada e registro do alvo de rollback continuam pendentes nesta execução.

Preparação técnica em 29/10/2026: dossiê disponível, CI hospedado aprovado e protegido, clone limpo e pacote diagnóstico verificados nas [evidências](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). Não houve aceite, merge ou publicação. O manifesto diagnóstico não atende ao requisito de candidato aprovado deste ticket.
