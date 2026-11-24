# 08: Integração Vue e artefato de entrega verificável

**O que construir:** consolidar a jornada Vue, quatro planos e configuração versionada num artefato estático verificável, pronto para a próxima entrega autorizada na Vercel.

**Bloqueado por:** [05 — Jornada pública completa em Vue](05-jornada-publica-vue.md); [06 — Quatro planos com avaliação dos efeitos](06-quatro-planos-e-avaliacao.md); [07 — Candidato versionado com backup e restauração](07-versionamento-backup-e-restauracao.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Remover renderizador, cópias de dados e adaptadores provisórios sem consumidores; restam um motor e uma fonte operacional de configuração.
- [x] Executar a suíte atualizada, com cobertura aplicável do baseline de 82 testes e novos contratos. Não exigir contagem idêntica nem aceitar exclusões para esconder falhas.
- [x] Gerar saída Vite após as validações e avaliar o mesmo snapshot incorporado ao build; manifesto identifica o candidato final e a revisão de referências.
- [x] Empacotamento usa somente saída compilada e assets necessários; excluir testes, documentação, ambiente, credenciais, backups e admin.
- [x] O navegador abre o artefato isolado e conclui a jornada, sem assets quebrados, erro de inicialização ou coleta indevida.
- [x] Preparar configuração de build/saída compatível com o projeto Vercel e sua raiz existente; não alterar configuração de produção nesta tarefa de preparo.
- [x] Registrar procedimento de corte, candidato e retorno à revisão anterior; produção depende de ação específica posterior.
- [x] Os QUIZ-017, 018 e 019 mantêm status e critérios externos; esta integração não alega recebimento GA4 ou continuidade até o checkout.

## Verificação

build limpo com dependências travadas, regressão Node/CDP e conferência do pacote isolado e manifesto; revisão documental final das limitações.

## Fechamento técnico — 04/11/2026

O bloqueio pelas quatro perdas foi resolvido pela correção do motor, sem aceite dos resultados rejeitados. A revisão atual tem 40/40 cenários sintéticos no primeiro lugar e zero regressões. A suíte completa executou 161 testes aprovados; build, configuração, versionamento/restauração em cópia isolada e empacotamento passaram. O pacote da revisão GA4 `2026-11-03.1` teve os 12 hashes conferidos e concluiu a jornada em navegador com o contrato português.

[Evidências atuais de qualidade e testes](../../../docs/correcao-documentacao-2026-11-04.md) e [manifesto/contrato do pacote](../../../docs/execucao-ga4-018-2026-11-03.md). O fechamento é da implementação técnica desta feature. O candidato com árvore limpa, CI remoto, publicação, rollback atual e aceites externos continuam na fase `qualidade-e-entrega` e nos QUIZ-017 a 019.

## Registro histórico de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.

**Bloqueio histórico de 28/10, resolvido em 03/11:** revisão individual das perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`, identificadas pela configuração e referências. Não foi registrado aceite em nome do usuário. A implementação técnica e o pacote diagnóstico estão verificados; a liberação depende do aceite/resolução previsto no ticket 06. [Avaliação](../../../tickets/evidencias/port-vue-2026-10-28/quality.json).

Registro histórico de 29/10/2026: [decisão e hashes vigentes](../../evidencias/qualidade-e-entrega-2026-10-29/decisao-ranking.md). O aceite das perdas permanece pendente.
