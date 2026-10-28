# Tickets de correção do Quiz Sócio

Backlog local criado em 26/10/2026 a partir da avaliação do projeto no commit `2cecf81`, ampliado pela análise de GA4. O escopo abrange navegação, dados comerciais, qualidade das recomendações e confiabilidade da medição.

## Situação em 27/10/2026

O backlog tem **20 registros: 19 tickets principais e o subticket QUIZ-010-A**. São **17 concluídos e três bloqueados (QUIZ-017, 018 e 019)**. QUIZ-010-A, seu pai QUIZ-010 e a consolidação QUIZ-011 foram concluídos e arquivados nesta rodada. O usuário solicitou manter QUIZ-017 bloqueado e receber seu detalhamento.

Última execução, em 27/10/2026: `npm test` teve **82 aprovações e 0 falhas** (46 de motor/referência/perfis/avaliação, quatro verificações de referência documental/ferramentas e 32 de navegador). [Log do workspace](evidencias/011-consolidacao-2026-10-27/npm-test-workspace.tap) e [da cópia isolada, também 82/82](evidencias/011-consolidacao-2026-10-27/npm-test-isolado.tap). As execuções anteriores permanecem históricas.

O código local de GA4 está no commit `8250641`, na branch `quiz-socio/tickets-correcoes`, com alterações adicionais de catálogo, referência e verificação no workspace. Em 27/10/2026, o pacote público do workspace foi publicado em produção em [quiz-socio.vercel.app](https://quiz-socio.vercel.app/), após 82/82 testes. A Vercel confirmou `READY` e o alias de produção; [registro, manifesto e limites da verificação](evidencias/deploy-2026-10-27/deploy.json). Não houve commit ou push. A revisão anterior de interface passou 55/55; seu registro histórico está no [QUIZ-011](concluidos/011-regressao-e-entrega.md#revisão-visual-e-textual).

Decisão vigente: [ADR-0001 — valores e taxas separados](../docs/adr/0001-valores-e-taxas-separados.md). A assinatura é apresentada pelo preço do catálogo, com adesão e opcionais em campos separados; as antigas somas de gasto mensal e primeiro mês foram removidas. O ranking considera apenas a assinatura no componente de preço. Os relatórios da versão `2026-10-26.1` são históricos e foram substituídos, para a regra atual, pela reavaliação da ADR.

A revisão visual corrigiu confirmação, contraste, ações, abertura responsiva, navegação por teclado e legibilidade do comparativo. [Capturas antes e depois](evidencias/interface/README.md).

Os tickets abertos ficam nesta pasta. Os concluídos foram movidos para [`concluidos/`](concluidos), cada um com seu registro de conclusão.

## Planejamento de Vue e configuração externa

A branch `quiz/port-vue` foi criada a partir de `quiz-socio/tickets-correcoes`, preservando as alterações locais. A [spec](../docs/spec-port-vue.md) cobre migração do quiz público para Vue 3 + Vite, configuração JSON e retirada do Cabuloso Cativo. O painel administrativo foi adiado por decisão do usuário. Os [oito tickets locais individuais](../.scratch/port-vue/README.md) têm critérios de aceite e bloqueadores. Após a correção em 28/10/2026, 01–05 estão concluídos tecnicamente e 06–08 aguardam revisão das regressões de ranking; a suíte atual tem 120 aprovações e zero falhas. [Relatório da revisão](../docs/revisao-port-vue-2026-10-28.md). A numeração 01–08 pertence à feature `port-vue` e sua contagem é separada dos 20 registros `QUIZ-*` deste índice. A aprovação técnica dos testes não libera as perdas de qualidade documentadas no ticket 06. Os QUIZ-017, 018 e 019 continuam bloqueados.

| Ordem | Ticket | Prioridade | Status |
| --- | --- | --- | --- |
| 1 | [QUIZ-001 — Impedir salto de perguntas e resultado incompleto](concluidos/001-navegacao-e-validacao.md) | P1 | Concluído |
| 2 | [QUIZ-002 — Conciliar o catálogo com as condições oficiais](concluidos/002-catalogo-comercial.md) | P1 | Concluído |
| 3 | [QUIZ-003 — Alinhar modalidade de contratação e checkout](concluidos/003-modalidade-e-checkout.md) | P1 | Concluído |
| 4 | [QUIZ-004 — Apresentar a pontuação como afinidade estimada](concluidos/004-comunicacao-da-pontuacao.md) | P1 | Concluído |
| 5 | [QUIZ-005 — Considerar setor no benefício recomendado](concluidos/005-adequacao-de-setor.md) | P1 | Concluído |
| 6 | [QUIZ-006 — Corrigir a interpretação das respostas](concluidos/006-coerencia-das-respostas.md) | P2 | Concluído |
| 7 | [QUIZ-007 — Separar histórico de frequência futura no Cabuloso](concluidos/007-historico-e-niveis.md) | P2 | Concluído |
| 8 | [QUIZ-008 — Modelar acompanhantes e valores separados](concluidos/008-familia-e-custo.md) | P2 | Concluído |
| 9 | [QUIZ-009 — Definir referência e metas de qualidade](concluidos/009-referencia-de-qualidade.md) | P2 | Concluído |
| 10 | [QUIZ-010 — Recalibrar o ranking com regras verificáveis](concluidos/010-recalibracao-do-ranking.md) | P2 | Concluído |
| 11 | [QUIZ-011 — Consolidar regressão e verificar a entrega](concluidos/011-regressao-e-entrega.md) | P2 | Concluído |

P1: defeito funcional, informação que pode direcionar uma contratação inadequada ou falha que compromete a medição principal. P2: qualidade do modelo, atribuição e comprovação da correção. Prioridade indica impacto; dependências definem a sequência de execução.

## Subtickets

| Ticket pai | Subticket | Prioridade | Status |
| --- | --- | --- | --- |
| [QUIZ-010](concluidos/010-recalibracao-do-ranking.md) | [QUIZ-010-A — Avaliar o ranking na referência de perfis](concluidos/010-A-referencia.md) | P2 | Concluído |

O QUIZ-009 entregou oito perfis e 16 cenários completos, com partições e hash registrado antes da avaliação. O QUIZ-010-A atingiu **8/8 no top-1 e top-3 em ambas as partições**, sem violações, mantendo o motor sem novos ajustes. A referência é sintética, criada pelo agente por autorização do usuário, e não é apresentada como validação externa ou desempenho real.

## Correções de GA4

Origem: [análise da integração](../docs/analise-ga4.md). A auditoria inicial confirmou geração local de eventos e 17/17 testes de navegador antes das alterações posteriores. A revisão de 27/10/2026 encontrou regressões e motivou a reabertura de três tickets. Recebimento na propriedade, configuração do Admin e continuidade no checkout permanecem sem comprovação. As evidências estão em [`evidencias/ga4/`](evidencias/ga4/).

| Ordem por prioridade | Ticket | Prioridade | Status |
| --- | --- | --- | --- |
| 1 | [QUIZ-012 — Reconhecer preview explícito](concluidos/012-preview-explicito.md) | P1 | Concluído |
| 2 | [QUIZ-013 — Isolar coleta de preview e desenvolvimento](concluidos/013-isolamento-da-coleta-ga4.md) | P1 | Concluído |
| 3 | [QUIZ-016 — Cobrir inicialização e contrato em regressão](concluidos/016-regressao-da-integracao-ga4.md) | P1 | Concluído |
| 4 | [QUIZ-018 — Alinhar a versão publicada](018-alinhamento-publicado-ga4.md) | P1 | **Bloqueado** |
| 5 | [QUIZ-014 — Identificar a versão das regras](concluidos/014-versao-das-regras-no-ga4.md) | P2 | Concluído |
| 6 | [QUIZ-015 — Usar link no CTA principal](concluidos/015-cta-principal-com-link.md) | P2 | Concluído |
| 7 | [QUIZ-017 — Conferir propriedade e relatórios](017-configuracao-e-validacao-ga4.md) | P2 | **Bloqueado** |
| 8 | [QUIZ-019 — Comprovar continuidade até o checkout](019-continuidade-ate-checkout-ga4.md) | P2 | **Bloqueado** |

Cinco tickets de GA4 (QUIZ-012 a QUIZ-016) foram concluídos em 27/10/2026: reconhecimento de preview por sinal explícito, isolamento da coleta (tag só injeta para `quiz-socio.vercel.app` e não-preview), `rules_version` no evento `quiz_complete`, CTA principal como link real e suíte de regressão permanente. Os bloqueados (017, 018, 019) dependem de acesso externo para validar recebimento no GA4 e continuidade no checkout. O destino e o acesso de publicação na Vercel foram resolvidos.

As pendências locais de documentação e preparo foram executadas: links corrigidos, referência comercial oficial incorporada, comandos reproduzíveis de diagnóstico/avaliação/preparo e roteiro de Admin, DebugView, entrega e continuidade. [Roteiro vigente](../docs/validacao-e-entrega.md).

O aceite comercial do QUIZ-003 está encerrado. A referência, a avaliação e a consolidação dos QUIZ-009/010-A/010/011 também foram concluídas, e os critérios dos QUIZ-012 a 016 foram reexecutados. A publicação foi executada; restam o aceite no GA4 (017), a validação do contrato e recebimento da versão publicada (018) e a continuidade real no destino (019). Nenhuma alteração na propriedade GA4 foi realizada.

## O que falta e quem precisa agir

| Pendência | Ticket | Responsável | O que destrava |
| --- | --- | --- | --- |
| Conferir Admin, definições, filtros e recebimento real | QUIZ-017 | Administrador GA4 | Disponibilizar sessão/conexão autorizada ou executar o inventário; mantido bloqueado a pedido do usuário |
| Conferir contrato e recebimento da versão publicada | QUIZ-018 | Mantenedor do site + analytics | Executar a validação em produção e concluir o aceite GA4; deploy Vercel já realizado |
| Comprovar identidade e sessão até o checkout | QUIZ-019 | Plataforma de sócios + analytics | Observação nas duas pontas após entrega/configuração, sem concluir compra |
| Merge e push da branch `quiz-socio/tickets-correcoes` | — | Responsável pelo quiz | Sincronizar posteriormente o Git com a entrega direta realizada pela CLI |

## Onde ficam as definições

Cada definição tem uma única fonte. Novas regras devem apontar para ela.

| Definição | Fonte |
| --- | --- |
| Condições comerciais, divergências e campos pendentes | [catalogo-comercial.md](../catalogo-comercial.md) |
| Objetivo do ranking, políticas de setor, contradições, orçamento, horizonte e metas | [QUIZ-009](concluidos/009-referencia-de-qualidade.md), decidido em 26/10/2026 |
| Perguntas, perfil, fórmula do ranking, valores e interface | [estrutura_quiz.md](../estrutura_quiz.md) |
| Catálogo, validação, valores e ranking em código | [quiz-engine.js](../quiz-engine.js) (`CATALOG_VERSION = 2026-09-11`, `RULES_VERSION = 2026-10-26.2`) |
| Cenários de referência e linha de base | [tests/fixtures/](../tests/fixtures) |
| Perfis sintéticos autorizados e expectativas para o QUIZ-010-A | [reference-profiles.js](../tests/fixtures/reference-profiles.js) |
| Autoria, identidade e limites da nova referência | [reference-profiles-provenance.json](../tests/fixtures/reference-profiles-provenance.json) |
| Proveniência da avaliação e situação de independência | [reference-provenance.json](../tests/fixtures/reference-provenance.json) |
| Regra de valores separados | [ADR-0001](../docs/adr/0001-valores-e-taxas-separados.md) |
| Reavaliação da regra vigente | [separate-prices-results.json](../tests/fixtures/separate-prices-results.json) |
| Histórico da antiga soma de custos | [cost-fix-results.json](../tests/fixtures/cost-fix-results.json) — regras anteriores à ADR |
| Nova conferência dos cinco destinos comerciais | [evidências de checkout](evidencias/checkouts-2026-10-26.json) |

## Verificação

```
npm test                  # motor, referência e navegador (Node ≥ 22 e Google Chrome)
npm run test:unit         # sem navegador
npm run test:browser      # Chrome headless; analytics bloqueado
npm run baseline          # regenera a linha de base do commit 2cecf81
npm run verify:external -- --output RELATORIO.json       # leitura HTTP, sem compra ou scripts remotos
npm run reference:evaluate -- --output RELATORIO.json    # regressão sintética por cenário
npm run reference:evaluate -- --reference profiles --enforce --output RELATORIO.json
npm run release:prepare -- --output DIRETORIO_VAZIO      # candidato público fora do projeto
```

O preparo inicial ficou em `/tmp/quizSocio-release-2026-10-27/public/`. A publicação posterior usou um novo pacote com os mesmos dez arquivos públicos, conferidos contra o workspace: [manifesto publicado](evidencias/deploy-2026-10-27/release-manifest.json). Os aceites de contrato e recebimento do QUIZ-018 permanecem pendentes.

Resultados das regras `2026-10-26.2`, contra a referência sintética existente:

| Conjunto | Linha de base `2cecf81` (top-1) | Atual (top-1) | Atual (top-3) |
| --- | --- | --- | --- |
| Calibração (12) | 8/12 | 12/12 | 12/12 |
| Partição histórica reserva, já consultada (12) | 7/12 | 11/12 | 12/12 |
| Contradições (5) | Não detectava | 5/5 detectadas | — |

Essas taxas descrevem a referência histórica e não representam avaliação externa, satisfação, contratação ou retenção. Os aceitáveis e vencedores históricos foram preservados, incluindo a divergência RES-11. A referência do QUIZ-009 foi avaliada no QUIZ-010-A, com classificação explícita de validação sintética. [Relatório dos perfis](evidencias/010-A/perfis-final.json) e [comparação](evidencias/010-A/comparacao.json).

## Convenção de subclasses alfabéticas

Quando um ticket exigir desdobramento, manter o número do pai e acrescentar uma letra maiúscula em sequência: `010-A`, `010-B`, `010-C`. Usar IDs como `QUIZ-010-A` e arquivos como `010-A-referencia.md`, com o restante do nome em minúsculas e palavras separadas por hífen. Não criar outro número principal para esse desdobramento nem reutilizar um ID existente.

Cada subticket deve indicar o pai, ter descrição, escopo, prioridade, critérios de aceite, dependências, verificação e registro de conclusão próprios. O pai deve apontar para seus subtickets e permanece aberto até que os desdobramentos necessários estejam concluídos. Registrar cada subticket no índice e contá-lo separadamente dos tickets principais.

Subtickets abertos ficam na raiz de `tickets/`. Ao concluir, movê-los para `concluidos/`, atualizar as referências relativas e preservar o vínculo com o pai, seguindo a mesma regra dos tickets principais.

## Como trabalhar num ticket

1. Leia os bloqueadores e confira se as dependências estão concluídas. A ordem da tabela permite iniciar o trabalho; as dependências definem quando ele pode terminar.
2. Reproduza o defeito ou registre o estado anterior com o cenário descrito no ticket, anotando a entrada e a saída observadas.
3. Implemente o escopo e execute a verificação indicada até atender todos os critérios de aceite.
4. Mude o status para `Concluído` somente com evidência de execução e bloqueadores resolvidos. Critérios que não se aplicam pela política aprovada são marcados `[N/A]` com justificativa.
5. Preencha o registro de conclusão ao final do ticket: arquivos alterados, decisões aplicadas, comandos executados, resultados e limitações. Depois, mova o ticket para `concluidos/` e atualize os links.

Status disponíveis: `Planejado`, `Em andamento`, `Bloqueado`, `Concluído`. Um bloqueio externo deve indicar a informação ausente e quem precisa fornecê-la; uma dependência de código deve indicar o ticket necessário. Use dados fictícios nos cenários de teste.

## Evidência inicial (avaliação do commit `2cecf81`)

- A execução matemática percorreu as 214.272 combinações daquela versão: nenhum score inválido e nenhum resultado acima do teto selecionado. Isso verificava invariantes, não precisão comercial.
- No Chrome, um clique duplo em `Continuar` levava da primeira à terceira pergunta, com a segunda resposta ausente.
- A tela de resultado só era verificada no modo preview, com um cenário pré-definido.
- Os scripts da avaliação eram temporários. A cobertura reproduzível está agora em [tests/](../tests).

## Fontes oficiais

- [Regulamento e Termo de Uso](https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso) — publicação de 11/09/2026, consultada em 26/10/2026
- [Perguntas frequentes](https://socio.cruzeiro.com.br/duvidas)

Condições comerciais podem mudar. Antes de publicar, repita a conferência e atualize a data no catálogo e no motor.
