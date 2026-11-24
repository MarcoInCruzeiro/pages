# Calibração de pesos e valores do recomendador

Execução em 12/11/2026, a pedido do usuário ("melhore a precisão do quiz ajustando os pesos e valores"). Regras `2026-11-12.2` (a `.1` ainda incluía a mudança descartada abaixo); catálogo `2026-10-28.2` e GA4 `2026-11-03.1` inalterados. Nenhuma pergunta, opção ou texto do quiz foi alterado. A [ADR-0003](adr/0003-orcamento-sem-prioridade-de-preco.md) continua vigente: preço não pontua nem desempata.

## Diagnóstico

As duas referências congeladas já acertavam 40/40 primeiros lugares, então a precisão a ganhar estava fora delas. Uma varredura de 387.072 combinações válidas e sem contradição (10 valores de jogos por ano, 4 históricos, todas as demais respostas, 4 tetos, 3 setores) encontrou dois erros de recomendação:

1. **Ingresso gratuito por temporada com valor fixo.** O Meu Cruzeiro valia 0,45 no componente de ingresso tanto para 1 jogo por ano quanto para 30. Com teto de R$ 40, o Time do Povo vencia em todos os casos com presença, inclusive para quem vai a um único jogo, que o ingresso gratuito cobre. Era o "próximo passo possível" registrado na [melhoria de 10/11](melhoria-ranking-desconto-2026-11-10.md).
2. **Capacidade de ingressos sem uso presencial.** Quem declarava zero uso presencial, interesse na loja, acompanhante adulto e teto de R$ 200 ou mais recebia sempre o Cabuloso Max (1.152 combinações). O componente `family` premiava os dois ingressos do Max, que essa pessoa nunca usaria. Isso contrariava a regra de 03/11 de que benefícios presenciais não usados não decidem.

## Regras implementadas

| Item | Antes | Depois |
| --- | --- | --- |
| Utilidade do ingresso gratuito por temporada | 0,45 fixo | 0,45 + 0,40 × min(1, ingressos por temporada / `gamesPerYear`): 1 jogo → 0,85; 2 → 0,65; 5 → 0,53; 10 → 0,49; 30 → 0,46 (`ticket.bonusCoberturaTemporada`, novo) |
| Cobertura de ingressos no componente `family` | quantidade / (1 + adultos), sempre | igual com uso presencial; vale 1 para todos os planos quando `frecuencia` = 0 |

Os ingressos popular, garantido e com desconto não mudam, nem os pesos dos componentes. Nenhum custo monetário é calculado ([ADR-0001](adr/0001-valores-e-taxas-separados.md)): a parcela de jogos cobertos mede o tamanho do benefício, não um gasto. Sem uso presencial o componente de ingresso continua com peso zero.

## Resultado

| Medida | Antes | Depois |
| --- | --- | --- |
| Referência histórica, primeiro lugar aceitável | 24/24 | 24/24 |
| Referência de perfis, primeiro lugar aceitável | 16/16 | 16/16 |
| Regressões (`reviewRequired`) | 0 | 0 |
| Sem presença, loja "sempre compro", acompanhante, teto ≥ R$ 200: Cabuloso ou Meu Cruzeiro | 0/1.152 | 1.152/1.152 |
| Teto R$ 40, com presença, 1 jogo por ano: Meu Cruzeiro, com índice estritamente maior | 0/10.368 | 10.368/10.368 |
| Teto R$ 40, com presença, 2 jogos por ano: Time do Povo, com índice estritamente maior | 10.368/10.368 | 10.368/10.368 |
| Empates exatos no topo com presença | 0 | 0 |
| "Também recomendado" (diferença < 1 ponto), todas as combinações | 20,8% | 21,8% |

O aumento de "também recomendado" vem de duas fontes. A maior parte é a correção 2: sem uso presencial e com acompanhante, Cabuloso e Max agora empatam, como já acontecia nos demais casos sem presença; o slug decide e a ADR-0003 mantém esses empates. A regra do ingresso por temporada responde por 0,2 ponto, todo no teto de R$ 40, onde Meu Cruzeiro e Time do Povo ficaram mais próximos. Os empates das referências sem uso presencial (CAL-01, RES-01, PER-01-C, PER-01-V) permanecem.

O exemplo documentado da fórmula (10 jogos, histórico 10, Sicoob, teto 100) continua Cabuloso 95,0, Time do Povo 56,2, Meu Cruzeiro 55,6 e Max 99,0. O ingresso gratuito sobe de 0,45 para 0,49, mas fica fora do setor preferido (× 0,1), e o arredondamento absorve a diferença.

As referências continuam sintéticas; o resultado não mede precisão com usuários reais. A constante 0,40 foi escolhida para que um jogo por ano favoreça o ingresso gratuito e dois ou mais o popular. É decisão de calibração, não dado de mercado.

## Mudança avaliada e descartada

Reduzir a base dos pesos de loja e experiências de 0,2 para 0,1 (escala 0,8 → 0,9) foi testada junto com as regras acima. Ela mudou só 8 vencedores, todos com 2 jogos por ano e teto de R$ 40, que passaram a empatar e a ir para o Meu Cruzeiro pelo slug. Como não corrigia nenhuma recomendação, foi revertida.

## Arquivos

`config/pesos/ranking.json`, `config/pesos/pesos.schema.json`, `config/validadores-compilados.mjs` (regenerado), `config/revision.json` (preparado por `npm run config:prepare`), `src/engine-core.mjs`, `tests/engine.test.js` (três testes novos), `estrutura_quiz.md`, `docs/validacao-e-entrega.md`.

## Verificação

```sh
npm run config:check
node scripts/evaluate-reference.mjs --enforce
node scripts/evaluate-reference.mjs --reference profiles --enforce
npm test
```
