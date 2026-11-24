# Correção do recomendador: preço somente como filtro de orçamento

Decisão do usuário em 03/11/2026: o recomendador jamais deve priorizar a assinatura mais barata; os resultados divergentes não foram aceitos. A [proposta de aceite](proposta-aceite-divergencias-2026-11-03.md) está rejeitada. Não foi criado `config/quality-approval.json`.

## Regra implementada

- O preço mensal equivalente determina somente se o plano cabe no orçamento informado.
- Os seis componentes de afinidade são ingresso, prioridade, setor, desconto na loja, experiências e família. O orçamento não altera os pesos desses benefícios.
- O preço não desempata planos: a ordem é índice decrescente e, no empate exato do índice arredondado, slug. A ordem de entrada do catálogo não interfere.
- Sem necessidade presencial declarada, ingresso, prioridade de compra e setor têm peso zero. Assim, diferenças entre benefícios de estádio que a pessoa não pretende usar não decidem a ordem.
- Assinatura, adesão, Kids e exemplos de ingresso continuam apresentados separadamente. O campo `cheapest` é mantido apenas para informar o menor preço quando nenhum plano cabe no orçamento; esse estado não possui vencedor nem recomendação acima do teto.

Foram removidos `price` de `config/pesos/ranking.json` e `importanciaPreco` do perfil, dos schemas e do motor. Os validadores foram regenerados e recusam a reintrodução desses campos. A interface explica o papel do orçamento em “Sobre a recomendação”.

## Causa e verificação da correção

O motor anterior normalizava preços pelo mínimo e máximo do catálogo e somava esse componente à afinidade. Também usava menor assinatura como desempate. Por isso, mudar apenas o preço podia mudar o vencedor sem alterar os benefícios. Quatro testes de regressão reproduziram as falhas antes da correção. [Saída anterior](evidencias/ranking-sem-preco-2026-11-03/repro-antes.log).

A remoção do preço expôs um segundo problema: ainda havia peso residual de benefícios de estádio para quem declarou zero uso presencial. Esse peso foi zerado; o validador também passou a exigir soma residual positiva dos demais componentes para manter o cálculo finito nesse caso.

Os testes novos verificam independência de preço e orçamento na afinidade, desempate sem preço, resolução dos quatro casos rejeitados e ausência de peso presencial quando não há necessidade presencial. A cobertura também confirma que adicionar um plano ao catálogo não renormaliza os índices dos planos existentes.

Os testes de paridade com a fórmula financeira antiga foram substituídos pela regra explicitamente solicitada. A comparação histórica continua preservando condições comerciais, perfil de necessidades, setores e detecção de conflitos. As expectativas das referências congeladas não foram alteradas.

## Resultado das referências congeladas

| Referência / partição | Primeiro lugar aceitável | Aceitável nos três primeiros | Violações de orçamento |
| --- | --- | --- | --- |
| Histórica / calibração | 12/12 | 12/12 | 0 |
| Histórica / reserva | 12/12 | 12/12 | 0 |
| Perfis / calibração | 8/8 | 8/8 | 0 |
| Perfis / validação | 8/8 | 8/8 | 0 |

| Caso | Antes | Depois |
| --- | --- | --- |
| CAL-02 | Meu Cruzeiro | Time do Povo |
| PER-02-C | Meu Cruzeiro | Time do Povo |
| CAL-10 | Cabuloso | Cabuloso Max |
| RES-05 | Cabuloso | Cabuloso Max |
| RES-11, divergência histórica | Meu Cruzeiro | Time do Povo |

São **40/40 primeiros lugares aceitáveis**, contra 35/40 na avaliação anterior, com zero regressões e zero violações de orçamento ou faixa de índice. [Avaliação completa](evidencias/ranking-sem-preco-2026-11-03/qualidade.json) e [comparação por caso](evidencias/ranking-sem-preco-2026-11-03/comparacao.json).

As referências continuam sintéticas. O resultado não mede precisão com usuários reais, satisfação ou conversão.

## Identidade da avaliação de 03/11 e entrega

- Catálogo: `2026-10-28.2`.
- Regras: `2026-11-03.2`.
- GA4: `2026-10-28.3`.
- Hash da configuração: `017b48ef2eb86078ed88e91b128012b3dd5dcd243abc4a28df585cb4fa60a1b6`.
- As referências histórica e de perfis mantêm os hashes `14d5440c6377222552c745c77800709163ec9db7a6f99a3aaedcab66e74a6f23` e `e7128debfadfbf3948b3cdfbff12e9238043e969674c13481867f0c4393b0e9e`.

O gate de qualidade retorna `reviewRequired: false`, `reviewAccepted: false` e `releaseApproved: true`: as divergências foram corrigidas, sem aceite de perdas. O gate que recusa regressões não foi removido; os testes simulam novas perdas e verificam que o bloqueio continua ativo, mesmo quando os pisos agregados passam.

A condição sem regressões também expôs uma inconsistência do manifesto de pacotes diagnósticos. `prepare-release.mjs` agora preserva `releaseApproved: false` para qualquer pacote com `diagnostic: true`, mesmo quando o ranking passa. O gerador de dossiê passou a descrever os IDs efetivamente encontrados, sem exigir aceite de quatro casos fixos, e usa `.scratch/quality-dossier` como saída padrão para preservar evidências históricas.

Esta execução não realizou commit, merge, consulta de CI remoto ou deploy. O candidato com árvore limpa e as demais pendências de acessibilidade, checkout, GA4 e publicação da [auditoria](auditoria-producao-2026-11-03.md) continuam separados da correção do motor.

Atualização documental em 04/11: as regras de ranking permanecem `2026-11-03.2`, mas a migração do contrato GA4 para `2026-11-03.1` mudou o hash agregado da configuração. Os hashes e logs acima pertencem à avaliação de 03/11. A identidade operacional atual está em [revision.json](../config/revision.json), e o pacote atualizado está no [QUIZ-018](execucao-ga4-018-2026-11-03.md).

## Reprodução

Verificação final nesta sessão: `npm test` concluiu em aproximadamente 105 segundos com **157 testes aprovados, zero falhas e zero ignorados**, incluindo build, configuração, motor e navegador. O gate local de produção passou; os links locais e `git diff --check` também foram conferidos.

```sh
npm run config:check
npm test
node scripts/evaluate-reference.mjs --enforce
node scripts/evaluate-reference.mjs --reference profiles --enforce
VERCEL_ENV=production node scripts/check-delivery.mjs
node scripts/quality-dossier.mjs DIRETORIO_DE_SAIDA
```

A execução local de `VERCEL_ENV=production` apenas verifica o gate; não chama a plataforma Vercel. O log da suíte final fica em [npm-test.log](evidencias/ranking-sem-preco-2026-11-03/npm-test.log).
