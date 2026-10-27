# QUIZ-008 — Modelar acompanhantes e valores separados

Status: Concluído

Decisão vigente: [ADR-0001](../../docs/adr/0001-valores-e-taxas-separados.md), solicitada pelo usuário em 26/10/2026. Ela substitui a soma de valores registrada nas etapas anteriores deste ticket.

## Descrição

O atributo `levaAcompanhantes` mistura ingresso do titular, segundo ingresso e dependentes. A pergunta familiar reúne filhos e cônjuge, sem idade ou quantidade. O orçamento filtra mensalidade, deixando de fora ingressos, opcionais e adesão.

Pontos de entrada: `buysTwoTickets`, `familyPlan`, `generatePlanProfile`, `fitsBudget` e dados dos planos em [index.html](../../index.html).

## Escopo

Separar titular, acompanhante adulto e Kids, apresentando o valor da assinatura, taxa de adesão, opcional por criança e benefício de ingresso individualmente. Aplicar a ADR-0001 ao resultado principal, cards, comparação e componente de preço do ranking.

## Critérios de aceite

- [x] Assinatura mantém o valor do catálogo, independentemente de frequência, acompanhante ou quantidade de Kids.
- [x] Adesão aparece em campo próprio, com a condição de cobrança única; planos isentos informam ausência da taxa.
- [x] Kids aparece com valor por criança e condições próprias, separado da assinatura.
- [x] Ingresso mantém benefício e eventual exemplo unitário identificado, incluindo a condição de até dois ingressos do Max.
- [x] O motor retorna valores separados; somas de gasto mensal e primeiro mês foram removidas.
- [x] Elegibilidade e componente de preço do ranking usam somente a assinatura mensal equivalente.
- [x] Testes de motor e navegador cobrem a separação, inclusive casal com dois Kids.

## Bloqueadores

- Dependências: [QUIZ-002](002-catalogo-comercial.md), [QUIZ-005](005-adequacao-de-setor.md), [QUIZ-006](006-coerencia-das-respostas.md) e [QUIZ-007](007-historico-e-niveis.md), para condições, respostas, setor e benefício atual.
- Decisão de produto no [QUIZ-009](../009-referencia-de-qualidade.md): horizonte da comparação e significado do orçamento.
- Externo e condicional: regras comerciais de dependentes ou valores sem confirmação devem ser esclarecidos pelo responsável comercial.

## Verificação

Cobrir titular sozinho, casal, adulto com Kids elegível, criança sem elegibilidade, mais acompanhantes que o benefício, zero jogos, presença esporádica e adesão isenta ou cobrada. Conferir totais contra cálculos independentes com entradas fictícias explícitas.

## Registro anterior — commit 01f6d20

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [quiz-engine.js](../../quiz-engine.js) (`buysTwoTickets` = acompanhante adulto, `kidsCount` 0–3 menores de 12, `getPlanCost`), [index.html](../../index.html) (custo de uso estimado e premissas no resultado), [estrutura_quiz.md](../../estrutura_quiz.md) (seção 5, com regra de arredondamento).

**Decisões aplicadas:** horizonte mensal e orçamento limitado à assinatura, aprovados no [QUIZ-009](../009-referencia-de-qualidade.md); adesão fora do custo comparado e exibida como custo do primeiro mês; ingresso do titular não vira capacidade de acompanhante (Max cobre titular + 1 adulto); cônjuge é acompanhante adulto, não Kids; R$ 150 e R$ 40 são premissas identificadas; custo marcado como estimativa parcial (`partial: true`). O custo entra no componente de preço sem tornar o mais barato vencedor obrigatório (ver RES-02, CAL-01).

**Evidência:** `tests/engine.test.js` (“custo separa assinatura, adesão, Kids e ingressos”, “um ingresso gratuito por temporada não zera todos os jogos”, “exemplo documentado da fórmula…” com R$ 156,25); referência CAL-06, CAL-11, RES-07, RES-12; `tests/browser.test.js` (premissas R$ 150/R$ 40 e “Custo de uso estimado” no resultado).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Limitações naquela versão:** o custo do acompanhante no Max foi posteriormente identificado como incorreto. A pendência de cobertura Kids e a expressão “até 12 anos” também foram revisadas na correção abaixo.

## Registro da correção — regras 2026-10-26.1

O ticket foi reavaliado após a reprodução da falha: com 12 jogos por ano, dois adultos e sem Kids, o Max retornava R$ 252,50/mês porque o acompanhante coberto pelo desconto não era cobrado.

**Correção:** `getPlanCost` agora cobra o acompanhante coberto pelo preço do benefício e o não coberto pela inteira de referência. O Max soma dois ingressos de R$ 52,50: R$ 105/mês em ingressos, R$ 305/mês com assinatura e R$ 335 no primeiro mês com adesão. O cenário individual continua em R$ 252,50/mês. Os pesos e planos aceitáveis não foram alterados.

**Kids:** a reconferência do [Termo de Uso, item 12.2](https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso) confirmou ingresso sem custo adicional após aprovação, no mesmo setor do titular, mediante disponibilidade e aquisição de seu ingresso. A simulação informa que considera Kids aprovado; o catálogo, a pergunta e o aviso agora usam menores de 12 anos e essas condições. O custo continua parcial por usar preços de ingresso de referência, não por ausência de confirmação da cobertura Kids.

**Regressão:** os três novos testes de custo falharam antes da correção e passaram depois. Cobrem o caso de R$ 305, preços de acompanhante nos cinco planos e volume de 0, 1 e 30 jogos. O teste de navegador `casal no Max vê o custo dos dois ingressos no resultado` verifica R$ 305 no card e adesão separada. Resultado completo desta rodada: [QUIZ-011](../011-regressao-e-entrega.md#verificação-desta-correção--26-de-outubro-de-2026).

**Arquivos:** [motor](../../quiz-engine.js), [testes de custo](../../tests/engine.test.js), [teste de navegador](../../tests/browser.test.js), [catálogo](../../catalogo-comercial.md) e [documentação do cálculo](../../estrutura_quiz.md).

## Aceite vigente — ADR-0001

Regras `2026-10-26.2`. `getPlanPricing` substituiu `getPlanCost`; a saída contém assinatura, adesão e preço unitário Kids, sem agregados. O resultado principal ganhou campo de adesão e os cards mantêm valores independentes. O teste de casal com dois Kids confirma R$ 200 de assinatura, R$ 30 de adesão, R$ 30/mês por criança e exemplo unitário de ingresso a R$ 52,50, sem preço combinado. `npm test`: 53/53 na rodada da ADR; [evidência](../evidencias/testes-adr-0001-2026-10-26.tap).

Os registros anteriores deste arquivo preservam o diagnóstico e as verificações das regras antigas. A sua soma de custos foi substituída pela ADR e não representa o comportamento atual.
