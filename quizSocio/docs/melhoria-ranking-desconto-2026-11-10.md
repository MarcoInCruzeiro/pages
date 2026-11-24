# Melhoria do recomendador: percentual de desconto entra na utilidade do ingresso

Execução em 10/11/2026. Regras `2026-11-10.3`; catálogo e GA4 inalterados. Nenhuma pergunta, opção ou texto do quiz foi alterado.

## Problema

Todos os 40 cenários sintéticos já acertavam o primeiro lugar, mas 10 deles eram decididos por **empate exato de índice resolvido pela ordem alfabética do slug**. Entre eles, CAL-04, RES-06, PER-05-C e PER-05-V empatavam Cabuloso e Cabuloso Max para torcedores com uso presencial: a utilidade do ingresso do tipo "desconto" era fixa em 0,80, então 50%, 55%, 60% e 65% de desconto valiam o mesmo. O Max, com 65% e até 2 ingressos, só vencia quando o acompanhante ou o Roxo inferior entravam na conta.

Os demais empates (CAL-01, RES-01, PER-01-C/V, PER-07-C/V) ocorrem sem uso presencial, quando os planos realmente oferecem os mesmos benefícios usáveis. Eles continuam por decisão registrada na [ADR-0003](adr/0003-orcamento-sem-prioridade-de-preco.md): preço não pontua nem desempata.

## Regra implementada

- `ticket.utilidades.desconto` passa a ser a utilidade do percentual de referência `ticket.descontoReferencia` (0,50). A utilidade cresce proporcionalmente: 50% → 0,80; 55% → 0,88; 60% → 0,96; 65% → 1 (limitado a 1).
- Nenhum custo monetário é calculado ([ADR-0001](adr/0001-valores-e-taxas-separados.md)): o percentual mede o tamanho do benefício, não um gasto.
- Os demais tipos de ingresso (gratuito, popular, garantido, sem benefício) mantêm as utilidades configuradas.
- Sem uso presencial, o componente de ingresso continua com peso zero; nada muda para quem não vai ao estádio.

## Resultado nas referências congeladas

| Referência / partição | Primeiro lugar aceitável | Empates no topo antes → depois |
| --- | --- | --- |
| Histórica / calibração + reserva | 24/24 | 4 → 2 |
| Perfis / calibração + validação | 16/16 | 4 → 2 |

Sem regressões (`reviewRequired: false`, `releaseApproved: true`), sem violações de orçamento. Os empates restantes são os de uso presencial zero. O exemplo documentado da fórmula (10 jogos, histórico 10, Sicoob, teto 100) passa de Cabuloso 93,4 para 95,0 e Max de 95,1 para 99,0; a ordem não muda.

As referências continuam sintéticas; o resultado não mede precisão com usuários reais.

## Refatoração do motor

Sem mudança de comportamento além da regra acima:

- `scorePlan` foi dividido em `getComponentWeights` (o quanto cada componente importa para a pessoa; depende só do perfil) e `getComponentValues` (o quanto o plano entrega; depende do catálogo). A tabela de pesos e valores em [estrutura_quiz.md](../estrutura_quiz.md) agora corresponde 1:1 às duas funções.
- `getTicketBenefit` usa uma tabela de textos por tipo e `getTicketUtility`, em vez da cadeia de `if`.
- `buildUserProfile` deixou de expor `productos` (cópia de `descuentos`) e `setorPreferido`: nenhum trecho os lia. Os testes de paridade com o motor histórico ignoram esses campos, como já faziam com `importanciaPreco`.

## Conferência independente e limpeza de configuração morta

Uma segunda implementação da fórmula, com constantes digitadas à mão, reproduziu perfil, índice, ordem e filtro de orçamento do motor em 483.840 combinações de respostas, sem divergência.

A conferência mostrou que o caminho "sem preferência de setor" nunca roda: a pergunta de setor é obrigatória e as respostas são validadas antes do ranking. Foram removidos `sector.semPreferencia`, `sector.cobertura.notPreferred` e `ticket.cobertura.notPreferred` da configuração e do schema, e o nível `not-preferred` de `getSectorFit`. Um setor ausente ou inválido agora é erro explícito. Índices e ordem não mudam.

O componente `experiences` vale 1 em todos os planos do catálogo atual (todos têm conteúdo exclusivo e votação), e o suporte a Kids também é igual em todos. Em 116.736 combinações válidas, retirar esse componente não muda a ordem em nenhum caso; ele só comprime as diferenças (distância média entre primeiro e segundo: 13,7 → 17,3 pontos) e, com isso, o aviso "também recomendado" dispara em 20,9% dos casos, 3,3% dos quais mudariam sem a compressão. Isso é calibração de pesos e do limiar de 1 ponto, não defeito de cálculo; a ADR-0003 rejeita pesos que dependem da composição do catálogo. Nada foi alterado nesse ponto.

## Arquivos

`src/engine-core.mjs`, `config/pesos/ranking.json`, `config/pesos/pesos.schema.json`, `config/validadores-compilados.mjs` (regenerado), `config/revision.json` (preparado por `npm run config:prepare`), `tests/engine.test.js`, `tests/configuration.test.mjs`, `tests/reference-profiles.test.js`, `estrutura_quiz.md`.

## Próximo passo possível, não implementado

O ingresso gratuito "por temporada" do Meu Cruzeiro vale 0,45 fixo, independentemente de a pessoa ir a 1 ou 30 jogos por ano. Um modelo que compare 1 ingresso por temporada com a quantidade de jogos declarada seria mais fiel, mas exige uma constante de calibração nova e decisão de negócio; não há cenário de referência que a sustente hoje.
