# Tickets de correção do Quiz Sócio

Backlog local criado em 26/10/2026 a partir da avaliação do projeto no commit `2cecf81`, ampliado pela análise de GA4. O escopo abrange navegação, dados comerciais, qualidade das recomendações e confiabilidade da medição.

## Situação em 27/10/2026

O backlog tem 19 tickets: sete concluídos na navegação/dados, cinco concluídos em GA4 (QUIZ-012 a QUIZ-016) e sete bloqueados. Dos onze originais, QUIZ-003, QUIZ-009, QUIZ-010 e QUIZ-011 continuam bloqueados por evidências externas. Os oito tickets de GA4 estão na seção [Correções de GA4](#correções-de-ga4).

Última execução, em 27/10/2026: `npm test` teve 71 aprovações e 0 falhas (39 motor/referência + 32 navegador). Log: [`evidencias/ga4/implementacao-2026-10-27/npm-test.tap`](evidencias/ga4/implementacao-2026-10-27/npm-test.tap).

A separação de valores desta rodada está localmente sobre o commit `01f6d20`, na branch `quiz-socio/tickets-correcoes`, sem publicação. A revisão de interface passou 55/55 testes; o relatório está no [QUIZ-011](011-regressao-e-entrega.md#revisão-visual-e-textual). Esses resultados são evidências anteriores à implementação dos tickets novos.

Decisão vigente: [ADR-0001 — valores e taxas separados](../docs/adr/0001-valores-e-taxas-separados.md). A assinatura é apresentada pelo preço do catálogo, com adesão e opcionais em campos separados; as antigas somas de gasto mensal e primeiro mês foram removidas. O ranking considera apenas a assinatura no componente de preço. Os relatórios da versão `2026-10-26.1` são históricos e foram substituídos, para a regra atual, pela reavaliação da ADR.

A revisão visual corrigiu confirmação, contraste, ações, abertura responsiva, navegação por teclado e legibilidade do comparativo. [Capturas antes e depois](evidencias/interface/README.md).

Os tickets abertos ficam nesta pasta. Os concluídos foram movidos para [`concluidos/`](concluidos), cada um com seu registro de conclusão.

| Ordem | Ticket | Prioridade | Status |
| --- | --- | --- | --- |
| 1 | [QUIZ-001 — Impedir salto de perguntas e resultado incompleto](concluidos/001-navegacao-e-validacao.md) | P1 | Concluído |
| 2 | [QUIZ-002 — Conciliar o catálogo com as condições oficiais](concluidos/002-catalogo-comercial.md) | P1 | Concluído |
| 3 | [QUIZ-003 — Alinhar modalidade de contratação e checkout](003-modalidade-e-checkout.md) | P1 | **Bloqueado** |
| 4 | [QUIZ-004 — Apresentar a pontuação como afinidade estimada](concluidos/004-comunicacao-da-pontuacao.md) | P1 | Concluído |
| 5 | [QUIZ-005 — Considerar setor no benefício recomendado](concluidos/005-adequacao-de-setor.md) | P1 | Concluído |
| 6 | [QUIZ-006 — Corrigir a interpretação das respostas](concluidos/006-coerencia-das-respostas.md) | P2 | Concluído |
| 7 | [QUIZ-007 — Separar histórico de frequência futura no Cabuloso](concluidos/007-historico-e-niveis.md) | P2 | Concluído |
| 8 | [QUIZ-008 — Modelar acompanhantes e valores separados](concluidos/008-familia-e-custo.md) | P2 | Concluído |
| 9 | [QUIZ-009 — Definir referência e metas de qualidade](009-referencia-de-qualidade.md) | P2 | **Bloqueado** |
| 10 | [QUIZ-010 — Recalibrar o ranking com regras verificáveis](010-recalibracao-do-ranking.md) | P2 | **Bloqueado** |
| 11 | [QUIZ-011 — Consolidar regressão e verificar a entrega](011-regressao-e-entrega.md) | P2 | **Bloqueado** |

P1: defeito funcional, informação que pode direcionar uma contratação inadequada ou falha que compromete a medição principal. P2: qualidade do modelo, atribuição e comprovação da correção. Prioridade indica impacto; dependências definem a sequência de execução.

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

Cinco tickets de GA4 (QUIZ-012 a QUIZ-016) foram concluídos em 27/10/2026: reconhecimento de preview por sinal explícito, isolamento da coleta (tag só injeta para `quiz-socio.vercel.app` e não-preview), `rules_version` no evento `quiz_complete`, CTA principal como link real e suíte de regressão permanente. Os bloqueados (017, 018, 019) dependem de acesso externo (GA4 Admin, confirmação de domínio publicado, checkout real).

Na retomada, reparar primeiro a preparação dos testes e o isolamento no QUIZ-013 para permitir a verificação permanente dos QUIZ-012 e QUIZ-014, cuja implementação central já foi observada no roteiro isolado.

Os novos tickets documentam correções propostas. Sua criação não publica o site nem modifica a propriedade GA4. A conferência comercial do QUIZ-003 e a consolidação original do QUIZ-011 mantêm seus escopos e status.

## O que falta e quem precisa agir

| Pendência | Ticket | Responsável | O que destrava |
| --- | --- | --- | --- |
| Conferir os cinco destinos de checkout. Em 26/10/2026, o checkout e `/planos` retornaram 403 com desafio do Cloudflare | QUIZ-003 | Responsável pela plataforma de sócios | Fornecer um destino verificável ou evidência da configuração dos `plano_id` com cobrança anual. O roteiro está no QUIZ-011 |
| Obter referência de negócio independente, com autoria e congelamento anteriores à nova calibração | QUIZ-009 | Responsável pelo produto | Definir cenários e planos aceitáveis sem consultar as saídas do motor, seguindo o ticket |
| Avaliar a versão final nessa referência | QUIZ-010 | Implementação, após QUIZ-009 | Executar as metas sobre o conjunto independente; a reavaliação sintética da correção já foi registrada |
| Fechar a consolidação | QUIZ-011 | Implementação, após dependências | Concluir QUIZ-003, QUIZ-009 e QUIZ-010 e executar a verificação final |
| Confirmar a disponibilidade do Cabuloso Cativo, ausente da tabela pública `/planos` | QUIZ-002 (decidido) | Responsável comercial do programa | Até a confirmação, o Cativo fica na recomendação com o aviso de disponibilidade, por decisão do responsável pelo quiz |
| Merge e push da branch `quiz-socio/tickets-correcoes` | — | Responsável pelo quiz | Publicação é uma ação separada deste backlog |

## Onde ficam as definições

Cada definição tem uma única fonte. Novas regras devem apontar para ela.

| Definição | Fonte |
| --- | --- |
| Condições comerciais, divergências e campos pendentes | [catalogo-comercial.md](../catalogo-comercial.md) |
| Objetivo do ranking, políticas de setor, contradições, orçamento, horizonte e metas | [QUIZ-009](009-referencia-de-qualidade.md), decidido em 26/10/2026 |
| Perguntas, perfil, fórmula do ranking, valores e interface | [estrutura_quiz.md](../estrutura_quiz.md) |
| Catálogo, validação, valores e ranking em código | [quiz-engine.js](../quiz-engine.js) (`CATALOG_VERSION = 2026-09-11`, `RULES_VERSION = 2026-10-26.2`) |
| Cenários de referência e linha de base | [tests/fixtures/](../tests/fixtures) |
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
```

Resultados das regras `2026-10-26.2`, contra a referência sintética existente:

| Conjunto | Linha de base `2cecf81` (top-1) | Atual (top-1) | Atual (top-3) |
| --- | --- | --- | --- |
| Calibração (12) | 8/12 | 12/12 | 12/12 |
| Partição histórica reserva, já consultada (12) | 7/12 | 11/12 | 12/12 |
| Contradições (5) | Não detectava | 5/5 detectadas | — |

Essas taxas são evidência de regressão, não de avaliação independente, satisfação, contratação ou retenção. A ADR mudou o vencedor de CAL-12 e RES-11 em relação à regra anterior; RES-11 está fora do conjunto aceitável antigo e permanece visível no relatório. Os planos aceitáveis foram preservados. O aceite independente dos QUIZ-009 e QUIZ-010 permanece aberto.

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
