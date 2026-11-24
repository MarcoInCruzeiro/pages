# QUIZ-009 — Definir referência e metas de qualidade

Status: Concluído

## Decisão vigente — 27/10/2026

O usuário autorizou o agente a verificar o `quiz-engine.js`, refinar dados/perfis quando necessário e criar os perfis de referência. O aceite passa a usar referência sintética elaborada pelo agente, com autoria e limitações explícitas. A exigência anterior de um autor externo deixa de bloquear este ticket. A avaliação de vencedores e eventuais ajustes do ranking seguem no [QUIZ-010-A](010-A-referencia.md).

Decisão vigente sobre valores: [ADR-0001](../../docs/adr/0001-valores-e-taxas-separados.md). O usuário substituiu as somas de custos por assinatura, adesão, opcionais e ingressos separados; apenas a assinatura compõe o preço no ranking.

Histórico: reaberto em 26/10/2026 por falta de evidência de separação da avaliação. A decisão de 27/10/2026 acima substitui a pendência externa; a base histórica continua sendo regressão sintética.

## Descrição

A avaliação atual verifica consistência matemática, mas não dispõe de resultados esperados aprovados pelo negócio. É necessário definir o que significa uma boa recomendação antes de ajustar pesos ou declarar precisão.

Este ticket é a fonte das decisões de produto para o ranking. A coleta de decisões e a elaboração dos cenários podem começar junto dos P1; sua posição no índice indica a prioridade da conclusão.

## Escopo

Registrar o objetivo do recomendador e criar uma base versionada de cenários sintéticos com planos aceitáveis, motivos e condições. Separar os casos usados na calibração daqueles reservados para avaliação. Precisão contra essa referência e desempenho real com usuários serão medidas distintas.

## Decisões a registrar

| Decisão | Proposta inicial para avaliação | Registro final |
| --- | --- | --- |
| Objetivo principal | Adequação aos benefícios utilizados, respeitando restrições e considerando custo | Atualizada pela ADR-0001: adequação aos benefícios e preferências, com orçamento e preço baseados apenas na assinatura |
| Setor | Preferência flexível com diferença visível e alternativa compatível | Aprovada. Justificativa: a disponibilidade de setor varia por jogo; eliminar planos esconderia opções válidas, mas a diferença precisa ficar explícita |
| Contradições | Solicitar confirmação das respostas incompatíveis | Aprovada. Justificativa: corrigir em silêncio inventaria a intenção do usuário. Após a confirmação, a intenção anual define o volume e “não frequento” zera a necessidade presencial |
| Orçamento | Distinguir teto da assinatura de estimativa de gasto total | ADR-0001: teto e componente de preço usam apenas assinatura; taxas e opcionais são apresentados separadamente |
| Horizonte de custo | Comparação de 12 meses, com vigência contratual explícita | Substituída pela ADR-0001: sem horizonte de gasto ou total combinado. Valor mensal equivalente compara a assinatura; total anual e parcelas pertencem ao contrato da assinatura |
| Critério de empate | Escolha orientada por utilidade e custo; margem a definir com os cenários | Aprovada: diferença menor que 1 ponto no índice marca os dois primeiros como recomendados; ordem por índice, depois menor assinatura, depois slug do plano (ajustado no QUIZ-010 para não depender da ordem do catálogo) |
| Metas | — | Zero violação de restrição comercial; top-1 ≥ 80% e opção aceitável no top-3 ≥ 95% na base reservada |

Decidido por Marco (MarcoInCruzeiro), responsável pelo quiz, em 26/10/2026.

Propostas são insumos de planejamento. O responsável pelo produto registra a decisão e a justificativa antes de concluir os tickets que dependem dela.

## Critérios de aceite

- [x] Todas as decisões da tabela têm definição final e justificativa identificável.
- [x] Cada cenário registra respostas completas, premissas de preço, planos aceitáveis, restrições e motivo; casos ambíguos podem aceitar mais de um plano.
- [x] A base cobre os cinco planos, zero jogos, frequência elevada, orçamento restrito, setores, níveis históricos, casal, Kids e contradições.
- [x] A nova referência contém partições distintas de calibração e validação, congeladas antes da avaliação no QUIZ-010-A e de qualquer novo ajuste. É sintética e não é apresentada como avaliação externa ou cega.
- [x] Metas de acerto no primeiro resultado, presença de opção aceitável entre alternativas e tolerância de empates são fixadas antes da avaliação final.
- [x] Restrições comerciais têm tolerância zero de violação; a meta estatística de adequação é definida pelo produto, sem derivá-la da pontuação do próprio algoritmo.
- [x] Cada plano é coberto por cenário em que é aceitável, ou existe justificativa comercial para sua ausência; não se exige distribuição uniforme de vencedores.
- [x] O relatório distingue desempenho contra referência sintética de satisfação, contratação ou retenção observadas em usuários reais.

## Bloqueadores anteriores e resolução

- Dependência parcial: [QUIZ-002](002-catalogo-comercial.md), para concluir os resultados esperados com condições comerciais vigentes.
- A criação de perfis pelo agente foi autorizada pelo usuário em 27/10/2026. Objetivos, políticas e metas desta tabela foram preservados. Não há bloqueador externo para concluir esta referência sintética.
- Dados de usuários reais são necessários para alegações sobre precisão real, mas não bloqueiam a criação da referência sintética ou as correções funcionais.

## Verificação

Revisar completude da base, rastreabilidade das expectativas e separação dos conjuntos. Executar o ranking atual sobre a referência para obter uma linha de base, com falhas por segmento, antes da recalibração.

## Registro anterior — commit 01f6d20

Concluído em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos alterados**

- [tests/fixtures/reference-scenarios.js](../../tests/fixtures/reference-scenarios.js) — 29 cenários: 12 de calibração, 12 reservados e 5 de contradição; premissas de preço compartilhadas; restrições comuns documentadas no cabeçalho.
- [tests/baseline.js](../../tests/baseline.js) — gerador reprodutível da linha de base (`npm run baseline`): executa o `index.html` do commit `2cecf81` em `vm` do Node sobre toda a referência.
- [tests/fixtures/baseline-reference.json](../../tests/fixtures/baseline-reference.json) — resultado versionável da linha de base, com o mapeamento das respostas.
- [tests/reference.test.js](../../tests/reference.test.js) — metas, partição disjunta, ausência de contradição nos válidos, detecção nos contraditórios, premissas iguais às do motor, comparação por segmento com a linha de base.
- [package.json](../../package.json) — script `baseline`.
- [estrutura_quiz.md](../../estrutura_quiz.md) — decisões, horizonte mensal e verificação.

**Decisões aplicadas:** tabela acima.

**Correção na base durante a execução.** O `base` dos cenários usava `wantsGuaranteedTicket: 'never'`. Oito cenários válidos (CAL-03, CAL-07, CAL-08, CAL-10, CAL-12, RES-09, RES-10, RES-11) tinham jogos > 0 com “não frequento o estádio” e eram, portanto, contradições: a necessidade presencial ficava zerada e os limites de nível eram medidos sem uso de ingresso. O `base` passou a `false`; os cenários de zero jogos já declaravam `never`. Nenhum conjunto de planos aceitáveis foi alterado. Um teste agora impede contradições nos cenários válidos.

**Mapeamento para a linha de base:** `gamesHistory` descartado (não existia); `familyPlan = kidsCount > 0`; demais chaves inalteradas. O carregamento foi conferido contra os valores do `baseline-results.json` anterior (CAL-01 92,1/89,8; CAL-03 93,3; CAL-04 91,4; CAL-05 94,6).

**Comandos e resultados**

```
npm run baseline
node --test tests/engine.test.js tests/reference.test.js   # 30/30 ok ao fechar este ticket
npm test                                                   # 49/49 ok na versão final (após QUIZ-010 e QUIZ-011)
```

| Conjunto | Linha de base `2cecf81` top-1 | Atual top-1 | Atual top-3 | Violações |
| --- | --- | --- | --- | --- |
| Calibração (12) | 8/12 | 12/12 | 12/12 | 0 |
| Reserva (12) | 7/12 | 12/12 | 12/12 | 0 |
| Contradição (5) | recomendava sem detectar | 5/5 detectadas, fora das métricas | — | — |

Falhas da linha de base por segmento: Cativo vencendo no Roxo (CAL-05, RES-05); Meu Cruzeiro vencendo com 10–25 jogos de histórico (CAL-07, CAL-08, RES-09, RES-10) e com 8 jogos no teto de R$ 40 (RES-11); Cabuloso sem cobertura completa do Roxo no teto de R$ 200 (CAL-10); Time do Povo vencendo com zero jogos e foco em loja (RES-02).

**Limitações**

- As métricas são contra referência **sintética**; não medem satisfação, contratação nem retenção de usuários reais.
- Cenários, planos aceitáveis e motor foram escritos na mesma sessão de trabalho, e o motor foi alterado depois dos cenários. Não é possível comprovar que a reserva não orientou ajustes. Os números da reserva devem ser tratados como provisórios até o responsável revisar os planos aceitáveis, ou até uma nova reserva independente ser criada (registro exigido pelo QUIZ-010).
- O Cabuloso Cativo é aceitável em três cenários, mas não vence nenhum: com as premissas de R$ 150 e desconto de 50–60%, o Cabuloso e o Max custam menos para o mesmo uso. Isso é consequência do objetivo aprovado, não regra imposta.
- A partição está versionada no commit `01f6d20` (branch `quiz-socio/tickets-correcoes`). O histórico só comprova a partição a partir desse commit, não que ela antecedeu os ajustes da execução anterior.

## Ação corretiva desta rodada

O [registro de proveniência](../../tests/fixtures/reference-provenance.json) identifica a base como `synthetic-regression` e mantém `independentValidation: false`. O cabeçalho dos cenários e o diagnóstico do teste agora descrevem a mesma limitação. Os IDs e planos aceitáveis existentes foram preservados: a correção de custo não modifica as expectativas para obter aprovação.

**Bloqueador para conclusão:** o responsável pelo produto deve obter uma nova referência de negócio ou revisão independente, com autoria, data e planos aceitáveis definidos sem consultar as saídas do motor. Congelar essa referência antes de nova calibração e registrar sua identidade. Depois, executar a avaliação final sem usá-la para ajustar pesos; se orientar ajustes, ela passa a servir para calibração e será necessária outra avaliação independente.

A correção técnica e a documentação estão disponíveis para revisão. Sem essa evidência externa, o critério desmarcado continua aberto e a taxa da base atual não deve ser apresentada como validação independente ou precisão real.


## Reavaliação após a ADR-0001

A referência existente foi executada sem alterar planos aceitáveis: calibração top-1 12/12; reserva histórica top-1 11/12 e top-3 12/12. CAL-12 e RES-11 mudaram para Meu Cruzeiro ao comparar apenas assinatura; CAL-12 já o aceitava e RES-11 não. O caso RES-11 permanece como divergência para revisão de negócio. [Relatório](../../tests/fixtures/separate-prices-results.json). A avaliação independente continua pendente.

## Execução com a fonte indicada pelo usuário — 27/10/2026

O usuário indicou `https://socio.cruzeiro.com.br/planos` como referência de negócio. A conferência foi registrada em [official-commercial-reference.json](../../tests/fixtures/official-commercial-reference.json), complementada pelas páginas oficiais de entrada, regulamento, dúvidas e Kids. O teste permanente verifica valores e condições do catálogo contra esses fatos publicados.

A fonte não publica planos aceitáveis para cada combinação de respostas do quiz. A referência documental não foi promovida a avaliação independente do ranking e a proveniência histórica continua com `independentValidation: false`. Nenhuma expectativa antiga foi alterada para obter aprovação.

O comando `npm run reference:evaluate -- --output CAMINHO.json` gera a avaliação histórica por cenário e a identifica como regressão sintética. [Execução anterior](../evidencias/execucao-2026-10-27/ranking.json) e [roteiro vigente](../../docs/validacao-e-entrega.md#2-conferir-a-referência-de-negócio--quiz-009-e-quiz-010). A pendência externa daquela etapa foi substituída pela autorização de criar perfis, conforme a decisão vigente no início deste ticket.

## Registro de conclusão — referência de perfis

Foram revisadas as perguntas, a transformação `buildUserProfile`, o uso de histórico em `resolveLevel`, os componentes de `scorePlan` e as restrições/desempate de `recommendPlans`. A modelagem existente já separa intenção, histórico, prioridade, adulto acompanhante, Kids e orçamento. Não foi identificado defeito que exigisse alterar o cálculo nesta etapa; preços, pesos e `RULES_VERSION` foram preservados.

Criados oito perfis com 16 cenários completos: apoio econômico, popular frequente, titular progressivo, casal no Roxo, presença intensa no Sicoob, família com Kids, loja/conteúdo sem estádio e Roxo com teto intermediário. Cada perfil possui um caso de calibração e outro de validação, expectativas e justificativa; os cinco planos aparecem entre os aceitáveis.

- [Referência criada](../../tests/fixtures/reference-profiles.js).
- [Autoria, hash e limites de validação](../../tests/fixtures/reference-profiles-provenance.json).
- [Testes permanentes de completude e transformação](../../tests/reference-profiles.test.js).

Os testes desta etapa verificam dados e necessidades, sem escolher vencedores por chamada a `recommendPlans`. A referência foi congelada para o QUIZ-010-A. A confirmação de conformidade comercial foi dada pelo usuário no QUIZ-003. A validação externa não é alegada; `independentValidation` permanece `false`.

Verificação final: `npm test`, **79/79**, sem falhas, cancelamentos ou testes ignorados. [Log da execução](../evidencias/perfis-009-2026-10-27/npm-test.tap) e [registro da revisão](../evidencias/perfis-009-2026-10-27/resultado.json). O ticket foi movido para `concluidos/`; a avaliação dos vencedores fica no subticket, sem bloquear a conclusão dos dados de referência.
