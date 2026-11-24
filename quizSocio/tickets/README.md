# Tickets do Quiz Sócio 5 Estrelas

Índice vigente, atualizado em 04/11/2026. A implementação local usa Vue 3 + Vite na branch `quiz/port-vue`; sua publicação e os aceites externos continuam pendentes. Os estados de outubro e das primeiras execuções de novembro estão no [índice histórico](history/README-ate-2026-11-03.md).

## Decisões e revisão atual

- [ADR-0001](../docs/adr/0001-valores-e-taxas-separados.md): assinatura, adesão, Kids e ingressos apresentados separadamente.
- [ADR-0003](../docs/adr/0003-orcamento-sem-prioridade-de-preco.md): preço somente como filtro de orçamento; afinidade por benefícios e desempate por slug. O usuário rejeitou aceitar os quatro resultados divergentes; as perdas foram corrigidas, sem arquivo de aceite.
- [Contrato GA4 em português](../docs/migracao-ga4-portugues.md): eventos/parâmetros atuais e mapa para consumidores do contrato anterior. A configuração local não comprova migração na propriedade.
- [revision.json](../config/revision.json): catálogo `2026-10-28.2`, regras `2026-11-03.2`, GA4 `2026-11-03.1`.
- Qualidade do ranking: 40/40 cenários sintéticos com primeiro lugar aceitável, zero regressões e zero violações de orçamento. Os testes não comprovam satisfação ou conversão reais.

## Tickets principais

São 20 registros: 19 tickets principais e o subticket QUIZ-010-A. Há 17 concluídos, dois em andamento e um bloqueado. Os concluídos ficam em `concluidos/`; os três tickets externos mantêm seus critérios individuais.

| Ticket | Status |
| --- | --- |
| [QUIZ-001 — Impedir salto de perguntas e resultado incompleto](concluidos/001-navegacao-e-validacao.md) | Concluído |
| [QUIZ-002 — Conciliar o catálogo com as condições oficiais](concluidos/002-catalogo-comercial.md) | Concluído |
| [QUIZ-003 — Alinhar modalidade de contratação e checkout](concluidos/003-modalidade-e-checkout.md) | Concluído |
| [QUIZ-004 — Apresentar a pontuação como afinidade estimada](concluidos/004-comunicacao-da-pontuacao.md) | Concluído |
| [QUIZ-005 — Considerar setor no benefício recomendado](concluidos/005-adequacao-de-setor.md) | Concluído |
| [QUIZ-006 — Corrigir a interpretação das respostas](concluidos/006-coerencia-das-respostas.md) | Concluído |
| [QUIZ-007 — Separar histórico de frequência futura no Cabuloso](concluidos/007-historico-e-niveis.md) | Concluído |
| [QUIZ-008 — Modelar acompanhantes e valores separados](concluidos/008-familia-e-custo.md) | Concluído |
| [QUIZ-009 — Definir referência e metas de qualidade](concluidos/009-referencia-de-qualidade.md) | Concluído |
| [QUIZ-010 — Recalibrar o ranking com regras verificáveis](concluidos/010-recalibracao-do-ranking.md) | Concluído |
| [QUIZ-010-A — Avaliar o ranking na referência de perfis](concluidos/010-A-referencia.md) | Concluído |
| [QUIZ-011 — Consolidar regressão e verificar a entrega](concluidos/011-regressao-e-entrega.md) | Concluído |
| [QUIZ-012 — Reconhecer o preview somente por sinal explícito](concluidos/012-preview-explicito.md) | Concluído |
| [QUIZ-013 — Isolar a coleta GA4 de preview e desenvolvimento](concluidos/013-isolamento-da-coleta-ga4.md) | Concluído |
| [QUIZ-014 — Identificar a versão do recomendador nos eventos](concluidos/014-versao-das-regras-no-ga4.md) | Concluído |
| [QUIZ-015 — Usar um link real no CTA principal de contratação](concluidos/015-cta-principal-com-link.md) | Concluído |
| [QUIZ-016 — Cobrir a inicialização e o contrato GA4 em regressão](concluidos/016-regressao-da-integracao-ga4.md) | Concluído |
| [QUIZ-017 — Conferir a configuração da propriedade e dos relatórios GA4](017-configuracao-e-validacao-ga4.md) | Em andamento |
| [QUIZ-018 — Alinhar o contrato de analytics da versão publicada](018-alinhamento-publicado-ga4.md) | Em andamento |
| [QUIZ-019 — Comprovar a continuidade da medição até o checkout](019-continuidade-ate-checkout-ga4.md) | Bloqueado |

## Pendências externas e de entrega

| Pendência | Responsável | Próximo resultado necessário |
| --- | --- | --- |
| QUIZ-017: propriedade, fluxo, definições, filtros e recebimento | Administrador GA4 e responsável pelo produto | Identificar o fluxo de `G-EF75QCTCTV`, inventariar consumidores e validar o contrato português no Admin/DebugView e nos relatórios |
| QUIZ-018: revisão pública e contrato entregue | Mantenedor do quiz e analytics | Entregar candidato rastreável, conferir hashes públicos e observar recebimento; preview com revisão seletiva entregue em 04/11; candidato ainda declara alterações não commitadas |
| QUIZ-019: continuidade até checkout | Plataforma de sócios e analytics | Comprovar identidade/sessão e atribuição para as quatro origens de CTA, incluindo `alternativa-setor` quando disponível |
| Qualidade/08: candidato com árvore limpa | Mantenedor do quiz | Preparar o candidato final após integração das alterações e validar seu manifesto e pacote isolado |
| Qualidade/09: integração e publicação Vue | Mantenedor do quiz | CI no commit integrado, publicação e rollback identificados; nenhuma entrega foi executada nesta correção documental |

O aceite comercial do QUIZ-003 permanece concluído. Respostas HTTP de fila/desafio não anulam esse aceite nem comprovam o funcionamento completo do funil. O recebimento real no GA4 e a continuidade de identidade continuam sem comprovação.

## Trackers da implementação

A numeração de cada fase é própria e não substitui os IDs `QUIZ-*`:

- [Migração Vue e configuração JSON](port-vue/README.md): implementação técnica e evidências dos oito tickets.
- [Qualidade e entrega](qualidade-e-entrega/README.md): candidato com árvore limpa, CI, integração e publicação. O fim do bloqueio do ranking não conclui os critérios restantes de entrega.

## Fontes de definição

| Definição | Fonte vigente |
| --- | --- |
| Condições comerciais e proveniência | [Catálogo documental](../catalogo-comercial.md) e [catálogo operacional](../config/planos/catalogo.json) |
| Perguntas, perfil, ranking e interface | [estrutura_quiz.md](../estrutura_quiz.md) |
| Contrato de eventos e migração | [ga4.json](../config/ga4/ga4.json) e [mapa de migração](../docs/migracao-ga4-portugues.md) |
| Versões e identidade | [revision.json](../config/revision.json) |
| Validação, entrega e rollback | [Roteiro vigente](../docs/validacao-e-entrega.md) |
| Retomadas dos aceites externos | [QUIZ-017](../docs/execucao-ga4-017-2026-11-03.md) e [QUIZ-018](../docs/execucao-ga4-018-2026-11-03.md), atualizados em 04/11 |
| Relatórios e decisões anteriores | [Índice histórico](history/README-ate-2026-11-03.md), referências congeladas em `tests/fixtures/` e evidências datadas |

## Verificação e manutenção

```sh
npm test
npm run test:unit
npm run test:browser
npm run reference:evaluate -- --enforce --output RELATORIO.json
npm run reference:evaluate -- --reference profiles --enforce --output PERFIS.json
npm run release:prepare -- --output DIRETORIO_VAZIO_FORA_DO_PROJETO
node scripts/verify-package-contract.cjs DIRETORIO_DO_PACOTE CONTRATO.json
node scripts/verify-published-build.mjs --package DIRETORIO_DO_PACOTE --output PUBLICACAO.json
```

Cada ticket deve registrar a reprodução, alterações, verificações e limites. Status disponíveis: Planejado, Em andamento, Bloqueado e Concluído. Concluir exige comprovar seus critérios; coleta local, build e manifesto não substituem aceites externos. Não alterar evidências históricas para acompanhar resultados novos.

Subtickets preservam o número do pai e acrescentam letras sequenciais, como `QUIZ-010-A`, com vínculo nos dois registros. Ao concluir um ticket principal, mover para `concluidos/`, ajustar os links e atualizar este índice. Os trackers das fases Vue e qualidade mantêm suas pastas próprias.

## Fontes oficiais

O [catálogo documental](../catalogo-comercial.md#fonte-e-vigência) reúne regulamento, tabela de planos, datas de consulta e limites da conferência comercial. Uma mudança operacional precisa manter essa proveniência.

## Evidência inicial (avaliação do commit `2cecf81`)

A avaliação inicial e os defeitos daquela revisão estão preservados no [índice histórico](history/README-ate-2026-11-03.md#evidência-inicial-avaliação-do-commit-2cecf81). Esse registro não representa a implementação atual.
