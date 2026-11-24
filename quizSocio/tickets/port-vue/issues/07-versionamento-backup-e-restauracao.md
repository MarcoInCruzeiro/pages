# 07: Candidato versionado com backup e restauração

**O que construir:** oferecer ao mantenedor um fluxo local para validar, avaliar e preparar uma configuração identificável, preservando a revisão anterior e permitindo restaurá-la sem alterar o site publicado.

**Bloqueado por:** [03 — Perfil e ranking configurados por JSON](03-perfil-e-ranking-json.md); [04 — Medição configurada com isolamento](04-medicao-configurada-com-isolamento.md); [06 — Quatro planos com avaliação dos efeitos](06-quatro-planos-e-avaliacao.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Comando explícito prepara candidato somente após validação, avaliação e resolução dos bloqueios de qualidade; build de verificação não modifica fontes ou versões.
- [x] Revisões de catálogo/regras/medição e hashes por domínio/agregado são determinísticos e idempotentes para o mesmo conteúdo.
- [x] Manifesto diferencia revisão operacional, datas da fonte oficial, revisão de código e workspace modificado; identidade das regras inclui lógica e dados que afetam o cálculo.
- [x] Canonicalização mantém tipos e ordem dos arrays, ordena chaves de objetos e exclui campos autorreferentes/timestamps do hash de identidade.
- [x] Antes da substituição de um candidato, backup completo preserva a revisão anterior; erro na preparação não a altera.
- [x] Restauração local valida os dados, reproduz a revisão e preserva o histórico; snapshots e backups ficam fora da saída pública.
- [x] Nenhum comando desta rotina faz push, deploy, edição do código do motor ou alteração administrativa no GA4.
- [x] Documentar como o futuro admin poderá chamar os mesmos contratos, mantendo sua implementação fora do escopo.

## Verificação

cenário externo de preparar candidato válido, repetir sem mudança, rejeitar inválido, simular falha e restaurar a revisão anterior, inspecionando manifesto e comportamento do motor.

## Fechamento técnico — 04/11/2026

O bloqueio pelas quatro perdas foi resolvido pela correção do motor, sem aceite dos resultados rejeitados. A revisão atual tem 40/40 cenários sintéticos no primeiro lugar e zero regressões. A suíte completa executou 161 testes aprovados; build, configuração, versionamento/restauração em cópia isolada e empacotamento passaram. O pacote da revisão GA4 `2026-11-03.1` teve os 12 hashes conferidos e concluiu a jornada em navegador com o contrato português.

[Evidências atuais de qualidade e testes](../../../docs/correcao-documentacao-2026-11-04.md) e [manifesto/contrato do pacote](../../../docs/execucao-ga4-018-2026-11-03.md). O fechamento é da implementação técnica desta feature. O candidato com árvore limpa, CI remoto, publicação, rollback atual e aceites externos continuam na fase `qualidade-e-entrega` e nos QUIZ-017 a 019.

## Registro histórico de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.

**Bloqueio histórico de 28/10, resolvido em 03/11:** revisão individual das perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`, identificadas pela configuração e referências. Não foi registrado aceite em nome do usuário. A implementação técnica e o pacote diagnóstico estão verificados; a liberação depende do aceite/resolução previsto no ticket 06. [Avaliação](../../../tickets/evidencias/port-vue-2026-10-28/quality.json).

Backup e restauração foram testados em cópia isolada com JSON sintaticamente válido, inclusive com erro semântico. JSON com sintaxe quebrada exige recuperar o arquivo do snapshot antes de abrir a ferramenta; recuperação irrestrita não foi comprovada.

Registro histórico de 29/10/2026: [decisão e hashes vigentes](../../evidencias/qualidade-e-entrega-2026-10-29/decisao-ranking.md). O aceite das perdas permanece pendente.
