# QUIZ-006 — Corrigir a interpretação das respostas

Status: Concluído

## Descrição

Selecionar `Foco apenas no campo` na pergunta de conteúdo digital soma quatro pontos de frequência no estádio. Outros efeitos também inferem compra de produtos a partir de presença em jogos. São associações não demonstradas que podem contrariar respostas diretas.

Cenário de referência observado: zero jogos, `never`, sem acompanhantes, sem prioridade, interesse em experiências e produtos, frequência `occasional`, conteúdo digital `false`, orçamento 400 e setor Azul. O resultado foi Cabuloso 92,1% e Meu Cruzeiro 89,8%. O cenário expõe a necessidade de avaliar custo e utilidade; não determina por si só qual deve vencer.

Pontos de entrada: `questions`, `buildUserProfile` e validação das respostas em [index.html](../../index.html).

## Escopo

Mapear cada resposta somente para necessidades que seu texto sustenta. Identificar contradições entre perguntas e definir um tratamento explícito: confirmação pelo usuário ou precedência documentada. Revisar perguntas repetidas sobre frequência e preservar o significado das respostas válidas.

## Critérios de aceite

- [x] Preferência de conteúdo digital não acrescenta frequência presencial nem consumo de produtos sem evidência correspondente na resposta.
- [x] Frequência declarada não implica automaticamente interesse em produtos ou experiências.
- [x] Zero jogos e declaração de não frequentar o estádio resultam em necessidade presencial nula, salvo revisão explícita pelo usuário.
- [x] Uma combinação contraditória, como zero jogos e presença em todas as partidas, é resolvida pela política registrada no QUIZ-009 antes do resultado.
- [x] Cada efeito restante tem justificativa rastreável no significado da pergunta; regras de precedência ficam junto da transformação correspondente.
- [x] Retornar e editar uma resposta recompõe o perfil, sem acumular efeitos da seleção anterior.
- [x] O documento de apoio distingue soma e limitação de atributos de uma normalização de escala, quando aplicável.

## Bloqueadores

- Nenhum para remover inferências sem relação com a resposta.
- Decisão de produto para concluir: política de contradições e necessidade de manter perguntas redundantes, registrada no [QUIZ-009](009-referencia-de-qualidade.md).

## Verificação

Comparar pares de respostas que diferem apenas em conteúdo digital e verificar que frequência e consumo permanecem iguais. Cobrir zero jogos, retorno e edição, contradições e o cenário de referência completo descrito acima.

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [quiz-engine.js](../../quiz-engine.js) (`buildUserProfile`, `detectConflicts`), [index.html](../../index.html) (tela de revisão de conflitos), [estrutura_quiz.md](../../estrutura_quiz.md) (seções 2 e 3).

**Decisões aplicadas:** cada resposta afeta só o atributo que seu texto sustenta; conteúdo digital soma apenas a experiências; frequência não gera consumo; zero jogos ou “não frequento” zeram a necessidade presencial; contradições exigem confirmação ou revisão (política aprovada no [QUIZ-009](009-referencia-de-qualidade.md)), e confirmadas mantêm as duas respostas; perfil reconstruído a cada resposta. Atributos são somados e limitados a 0–10, sem normalização de escala, como descrito no documento de apoio.

**Evidência:** `tests/engine.test.js` (“conteúdo digital não acrescenta frequência nem consumo de produtos”, “frequência declarada não implica interesse…”, “zero jogos ou não frequentar resultam em necessidade presencial nula”, “contradições são detectadas sem correção silenciosa”); `tests/reference.test.js` (CON-01 a CON-05); `tests/browser.test.js` (“conflito pede confirmação…”, “revisar respostas a partir do conflito…”, “Voltar preserva as respostas…”). Cenário de referência deste ticket = CAL-01; resultado tratado no [QUIZ-010](010-recalibracao-do-ranking.md).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Limitações:** as perguntas sobre frequência (`wantsGuaranteedTicket`, `gameFrequency`) foram mantidas; a sobreposição é tratada pela detecção de conflitos.
