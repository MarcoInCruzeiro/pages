# QUIZ-004 — Apresentar a pontuação como afinidade estimada

Status: Concluído

## Descrição

O resultado apresenta percentuais de compatibilidade com uma casa decimal. O cálculo combina pesos manuais, cosseno, penalidade de preço e bônus de setor; não há validação que transforme esse número em probabilidade de acerto. A comunicação deve explicar o que foi calculado e quais condições limitam a recomendação.

Pontos de entrada: `renderResults`, `renderComparisonTable`, `calculateFinalMatch`, `influences` e textos de abertura em [index.html](../../index.html).

## Escopo

Usar a expressão `afinidade estimada` ou equivalente igualmente explícito. Se a pontuação numérica for mantida, apresentá-la como índice de 0 a 100. Explicar os motivos com respostas relevantes e benefícios confirmados; a distância absoluta entre atributos, isoladamente, não comprova a contribuição de um motivo para o ranking.

## Critérios de aceite

- [x] Todas as superfícies de resultado usam a mesma interpretação de índice estimado, sem prometer taxa de acerto ou certeza de adequação.
- [x] Uma explicação curta, acessível junto ao resultado, informa que respostas e regras do quiz geram o índice.
- [x] O vencedor apresenta motivos associados a respostas do usuário e benefícios cadastrados, com as condições aplicáveis.
- [x] A recomendação distingue maior afinidade dentro do orçamento de maior afinidade entre todos os planos.
- [x] Resultados próximos mantêm indicação de proximidade; arredondamento não vira evidência de superioridade significativa.
- [x] O contrato atual dos eventos de analytics é preservado ou sua migração é documentada com o significado do valor enviado.

## Bloqueadores

- Nenhum para corrigir a interpretação da pontuação.
- Dependência parcial: [QUIZ-002](002-catalogo-comercial.md) para concluir os motivos que citam condições comerciais. Essa dependência permite entregar primeiro a comunicação do índice.

## Verificação

Renderizar resultado, alternativas e comparação para orçamento restrito, orçamento abrangente e pontuações próximas. Conferir que cada motivo pode ser ligado à resposta utilizada e ao campo comercial correspondente.

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [index.html](../../index.html) (resultado, cards, comparativo, “Como calculamos a afinidade estimada”), [quiz-engine.js](../../quiz-engine.js) (`buildReasons`, `closeCall`, `allPlansFit`), [estrutura_quiz.md](../../estrutura_quiz.md) (seção 9).

**Decisões aplicadas:** índice de 0 a 100 chamado “afinidade estimada” em todas as superfícies, com aviso de que não é probabilidade de acerto; resumo distingue “a maior entre todos os planos” de “a maior entre os planos que cabem no seu orçamento”; diferença < 1 ponto vira “praticamente empatado” e “Também recomendado”; cards mostram pontos abaixo do recomendado; motivos citam respostas e benefícios do catálogo, e o motivo de custo separa assinatura de custo de uso (corrigido nesta execução: antes rotulava o custo total como “Assinatura estimada”). Analytics: `compatibility` mantido como alias, `affinity_index` e `score_semantics = indice_afinidade_estimado` adicionados (migração documentada em `estrutura_quiz.md`).

**Evidência:** `tests/browser.test.js` (“resultado único mantém o contrato de analytics e o CTA”, “orçamento restrito, setor incompatível e custo de uso aparecem separados”); `tests/engine.test.js` (“motivos do resultado citam respostas e condições comerciais”, “motivos seguem as regras que classificaram o plano”).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```
