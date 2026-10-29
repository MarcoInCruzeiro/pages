# 06: Quatro planos com avaliação dos efeitos

**O que construir:** deixar disponíveis apenas Meu Cruzeiro, Time do Povo, Cabuloso e Cabuloso Max, exibidos e avaliados a partir do catálogo JSON validado.

**Bloqueado por:** [03 — Perfil e ranking configurados por JSON](03-perfil-e-ranking-json.md)

**Status:** ready-for-agent
**Situação da execução:** Bloqueado
**Prioridade:** P1
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Catálogo operacional contém exatamente quatro slugs únicos; Cativo desaparece de recomendações, listas, comparativo, links próprios e textos ativos.
- [x] Condições dos quatro planos restantes são preservadas; catálogo documental e descrição ativa do quiz refletem a remoção sem apagar evidência histórica.
- [x] Schema e invariantes validam modalidades, preços separados, níveis, setores, opcionais e destinos permitidos; catálogo vazio é rejeitado.
- [x] A normalização usa os quatro planos ativos, sem âncora residual do plano removido; catálogo reordenado mantém os resultados.
- [x] Criar e congelar revisão derivada das referências antes de calibração, documentando a exclusão do slug e preservando as revisões históricas.
- [ ] Relatório compara vencedores, índices, top-1/top-3, conflitos e violações por partição, com hashes e versões. Perdas de acerto recebem resolução ou aceite explícito vinculado ao relatório.
- [x] Atender top-1 ≥ 80%, top-3 ≥ 95%, zero violações de orçamento e zero scores inválidos em cada partição, sem ajustar expectativas para acompanhar saídas observadas.
- [x] Sem elegíveis, recomendações ficam vazias e vencedor nulo; alternativas informativas ficam separadas e não apresentam contratação como recomendada.
- [x] Substituir cobertura exclusiva do Cativo por testes aplicáveis, preservando as invariantes de setor, orçamento e valores separados.

## Verificação

testes do catálogo e do navegador, avaliação sintética reproduzível e revisão individual das perdas. A geração de um relatório não constitui automaticamente aceite das regressões.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.

**Bloqueio vigente:** revisão individual das perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`, identificadas pela configuração e referências. Não foi registrado aceite em nome do usuário. A implementação técnica e o pacote diagnóstico estão verificados; a liberação depende do aceite/resolução previsto no ticket 06. [Avaliação](../../../tickets/evidencias/port-vue-2026-10-28/quality.json).

Dossiê atualizado em 29/10/2026: [decisão e hashes vigentes](../../evidencias/qualidade-e-entrega-2026-10-29/decisao-ranking.md). O aceite das perdas permanece pendente.
