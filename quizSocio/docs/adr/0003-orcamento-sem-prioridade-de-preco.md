# Usar preço somente como limite de orçamento

Status: accepted. Decisão explícita do usuário em 03/11/2026; registro consolidado em 04/11/2026. Substitui a parte da [ADR-0001](0001-valores-e-taxas-separados.md) que incluía preço na afinidade. A apresentação separada de assinatura, adesão, Kids e ingressos permanece vigente.

O usuário rejeitou o aceite das quatro divergências e determinou que o recomendador jamais priorize a assinatura mais barata. A assinatura mensal equivalente passa a determinar somente elegibilidade: planos acima do orçamento não entram nas recomendações. Entre os elegíveis, preço não pontua nem desempata; a ordem usa afinidade com os benefícios e slug em empate exato do índice arredondado.

A normalização financeira pelo menor e maior preço do catálogo foi removida porque podia inverter a recomendação sem mudar os benefícios. O modelo usa seis componentes de benefícios; ingresso, prioridade e setor têm peso zero quando não há necessidade presencial. Mudanças de preço que preservem elegibilidade não alteram índices ou ordem. Não houve aceite dos resultados rejeitados. [Implementação, avaliação sintética e limites](../correcao-ranking-sem-preco-2026-11-03.md).
