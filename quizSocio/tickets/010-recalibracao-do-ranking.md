# QUIZ-010 — Recalibrar o ranking com regras verificáveis

Status: Bloqueado

Decisão vigente: [ADR-0001](../docs/adr/0001-valores-e-taxas-separados.md). O preço agora compara exclusivamente a assinatura; as antigas somas descritas nos registros anteriores são históricas.

Reaberto na correção de 26/10/2026 para reavaliar o custo do acompanhante e o aceite da avaliação reservada. A correção funcional foi aplicada; a validação independente depende do QUIZ-009.

## Descrição

O modelo atual combina cosseno, escala limitada a 20, preço em múltiplas etapas e bônus manual de setor. O cosseno ignora intensidade absoluta; os atributos têm amplitudes diferentes e parte da informação de desconto é contada em mais de uma dimensão. O bônus de seis pontos foi escolhido para um cenário específico.

Pontos de entrada: `buildUserProfile`, `generatePlanProfile`, `calculateCosineSimilarity`, `applyPricePenalty`, `calculateFinalMatch` e `recommendPlans` em [index.html](../index.html).

## Escopo

Comparar a linha de base com um ranking que aplique restrições primeiro e avalie utilidade, preferências e custo depois. Escolher a alternativa com base na referência do QUIZ-009; manter cosseno somente se houver evidência favorável. Receber respostas e catálogo explicitamente no motor para permitir execução determinística independente da interface.

## Critérios de aceite

- [x] A fórmula final, escalas, pesos, restrições e regra de desempate estão documentados com exemplos de entrada e saída.
- [x] O preço tem papéis explícitos em elegibilidade e utilidade; qualquer penalização adicional possui justificativa e comparação de resultados.
- [x] A influência de desconto, consumo e frequência é revisada para evitar duplicação não intencional da mesma preferência.
- [x] O bônus de setor é substituído por cobertura explícita ou mantido com evidência de calibração abrangente; um único cenário não define seu valor.
- [x] O cenário de zero jogos descrito no QUIZ-006 recebe recomendação justificável pelo objetivo aprovado, pelo consumo estimado e pelo custo, sem vencedor imposto apenas para passar o teste.
- [x] Mesmas entradas e mesma versão das regras geram o mesmo ranking; empates usam política explícita, independente da ordem do catálogo.
- [x] O motor trata ausência de plano elegível de forma explícita, sem substituir silenciosamente por um plano acima de uma restrição obrigatória.
- [ ] A avaliação reservada atinge todas as metas do QUIZ-009 e registra comparação por segmento com a linha de base. A regressão sintética passa; a avaliação independente continua pendente.
- [x] Explicações correspondem às regras que determinaram elegibilidade e classificação; o documento de apoio é atualizado.

## Bloqueadores

- Dependências: [QUIZ-005](concluidos/005-adequacao-de-setor.md), [QUIZ-006](concluidos/006-coerencia-das-respostas.md), [QUIZ-007](concluidos/007-historico-e-niveis.md), [QUIZ-008](concluidos/008-familia-e-custo.md) e [QUIZ-009](009-referencia-de-qualidade.md).
- A comparação experimental pode começar com a linha de base. A escolha final exige regras, custos, referência e metas resolvidos.

## Verificação

Executar linha de base e candidatos nos mesmos cenários de calibração; avaliar a escolha final no conjunto reservado. Registrar métricas, violações, falhas por segmento, empates e mudanças de vencedor. Se o conjunto reservado orientar um novo ajuste, separá-lo de uma nova avaliação independente e registrar essa mudança.

## Registro anterior — commit 01f6d20

Executado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos alterados**

- [quiz-engine.js](../quiz-engine.js) — `recommendPlans(respostas, catalogo)` recebe o catálogo explicitamente; desempate final por slug (`compareRanked`); utilidade do ingresso com desconto fixa em 0,80; peso do setor escalado pela presença; motivo de custo separa assinatura de custo de uso.
- [tests/engine.test.js](../tests/engine.test.js) — ordem do catálogo, desempate por slug, exemplo numérico da fórmula, desconto só pelo custo, motivos coerentes com as regras.
- [estrutura_quiz.md](../estrutura_quiz.md) — seções 6 e 7: fórmula, papéis do preço, revisão de duplicações, exemplo verificado, desempate.

**Ponto de partida.** O motor desta entrega já substituía cosseno, escala limitada a 20, penalidade de preço em etapas e bônus manual de setor por uma média ponderada de sete componentes com restrição de orçamento aplicada antes. A linha de base `2cecf81` e as metas são as do [QUIZ-009](009-referencia-de-qualidade.md).

**Candidatos comparados na calibração (12 cenários)**

| Candidato | Top-1 | Top-3 | Observação |
| --- | --- | --- | --- |
| A — motor de partida | 12/12 | 12/12 | Desconto de ingresso contado na utilidade e no custo; setor pesa 0,8 mesmo sem presença |
| B — desconto só pelo custo | 12/12 | 12/12 | Remove a duplicação do desconto. **Adotado** |
| C — sem multiplicador de setor no ingresso | 12/12 | 12/12 | Perde a noção de onde o benefício vale; descartado |
| D — sem componente de setor | 11/12 | 12/12 | CAL-10 passa ao Cabuloso, que não cobre Roxo Inferior; descartado |
| F — B + peso do setor × presença | 12/12 | 12/12 | Com zero jogos, a cobertura de setor deixa de decidir. **Adotado** |

**Cenário de zero jogos do QUIZ-006 (= CAL-01).** Antes de F: Cabuloso 93,1, Max 86,9, Meu Cruzeiro 66,6; a cobertura do Sicoob decidia, para quem não vai ao estádio. Depois: Cabuloso 91,2, Meu Cruzeiro 85,2, Max 83,2. O Cabuloso vence pelo maior desconto de loja (15%) e conteúdo, com orçamento “sem limite” e peso de preço baixo; o Meu Cruzeiro fica em segundo pelo custo. Ambos são aceitáveis na referência; nenhum vencedor foi imposto.

**Avaliação final na reserva (12 cenários):** top-1 12/12, top-3 12/12, zero violação de orçamento; linha de base 7/12. Comparação por segmento: diagnóstico do teste `linha de base do ranking anterior cobre toda a referência, por segmento` em `tests/reference.test.js`.

**Comandos**

```
node --test tests/engine.test.js tests/reference.test.js   # 35/35 ok
npm test                                                   # 49/49 ok na versão final
```

**Limitações**

- Nesta execução, a reserva foi consultada duas vezes, após B e após F, ambos escolhidos só pela calibração; nenhum ajuste derivou da reserva. Não há como comprovar o mesmo para a execução anterior, que escreveu motor e cenários juntos (ver limitações do QUIZ-009). Uma reserva nova, escrita por outra pessoa sem ver o motor, seria a avaliação independente.
- A calibração não diferencia A, B, C e F; B e F foram escolhidos por coerência com o objetivo aprovado, não por ganho de acerto.
- Pesos (0,8 de setor, 0,45/0,75/0,80/1 de ingresso etc.) continuam escolhas manuais documentadas, não estimadas a partir de dados de usuários.

## Reavaliação após a correção de custo

Regras `2026-10-26.1`, sobre o commit `01f6d20`, sem alterar pesos, partições ou planos aceitáveis. O custo do acompanhante no Max passou a incluir o preço com desconto, alimentando o componente de preço e as explicações com o total correto.

O [relatório por cenário](../tests/fixtures/cost-fix-results.json) compara o motor anterior com o corrigido: calibração 12/12 no top-1 e top-3, partição histórica reserva 12/12 no top-1 e top-3, zero violação de orçamento e nenhum vencedor alterado nos 24 casos válidos. Os custos e alguns índices mudam nos perfis acompanhados; o relatório registra os valores antes e depois.

**Aceite restante:** avaliar a versão final na referência independente definida no [QUIZ-009](009-referencia-de-qualidade.md). A base atual permanece útil para regressão, com a proveniência declarada. O ticket continua bloqueado por essa dependência, mesmo com a regressão local passando.


## Regra vigente — ADR-0001

Regras `2026-10-26.2`: componente de preço normalizado pelo valor mensal equivalente da assinatura. Adesão, Kids e exemplos de ingresso não são somados nem entram nesse componente. Os demais pesos foram preservados. Testes verificam que alterar valores de taxas e opcionais não muda o índice e que frequência, acompanhante e Kids não mudam os valores de assinatura apresentados.

A [comparação com a regra anterior](../tests/fixtures/separate-prices-results.json) registra calibração 12/12, reserva histórica 11/12 no top-1 e 12/12 no top-3, zero violação do teto. CAL-12 e RES-11 mudaram de vencedor; RES-11 é divergência conhecida da referência antiga. O ticket continua bloqueado pela avaliação independente do QUIZ-009.
