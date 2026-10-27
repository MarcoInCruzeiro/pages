# QUIZ-005 — Considerar setor no benefício recomendado

Status: Concluído

## Descrição

A escolha de setor altera atributos genéricos e concede bônus ao Time do Povo, mas não verifica onde cada benefício vale. No cenário de 30 jogos, sozinho, prioridade alta, interesse nos extras, orçamento 400 e setor Roxo, o Cativo venceu com 93,8%, embora seu ingresso garantido seja em outro setor.

Pontos de entrada: pergunta `preferredSector`, cadastro dos planos, `getSectorBonus` e `recommendPlans` em [index.html](../../index.html).

## Escopo

Representar os setores cobertos por cada benefício e distinguir preferência de exigência. Proposta inicial: a pergunta atual expressa preferência; se o vencedor não a atender, o resultado deve destacar a diferença e oferecer uma alternativa que a atenda. Caso o produto escolha setor obrigatório, a pergunta deve expressar essa exigência e aplicar elegibilidade coerente.

## Critérios de aceite

- [x] Cada benefício de ingresso utiliza os setores confirmados no cadastro, incluindo restrições entre superior e inferior.
- [x] A política escolhida para preferência ou exigência está registrada no [QUIZ-009](../009-referencia-de-qualidade.md) e corresponde ao texto da pergunta.
- [x] Preferência pelo Roxo não apresenta o ingresso garantido do Cativo como benefício naquele setor.
- [x] Sob preferência flexível, uma incompatibilidade do vencedor aparece de forma visível, com alternativa compatível quando disponível.
- [N/A] Sob setor obrigatório, apenas benefícios que atendem ao setor participam como compatíveis; ausência de plano viável produz orientação explícita, sem afirmar atendimento inexistente.
- [x] A relação Amarelo/Laranja com Time do Povo é derivada da cobertura comercial. O tratamento do bônus de 6 pontos é registrado para a recalibração no QUIZ-010.
- [x] A ausência de alternativa que atenda simultaneamente ao setor e orçamento é tratada sem exceder silenciosamente o teto.

## Bloqueadores

- Dependência: [QUIZ-002](002-catalogo-comercial.md), para cobertura de setores confirmada.
- Decisão de produto: escolher entre a proposta de preferência flexível e exigência de setor. O responsável pelo quiz registra a escolha no QUIZ-009; a modelagem da cobertura pode começar antes dela.

## Verificação

Cobrir Amarelo/Laranja, Azul/Sicoob e Roxo, subdivisões aplicáveis, Cativo em setor diferente e ausência de alternativa dentro do orçamento. Verificar a mesma condição no resultado principal, cards e comparação.

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [quiz-engine.js](../../quiz-engine.js) (`SECTOR_GROUPS`, `ingresso.setores` por plano, `getSectorFit`, `sectorAlternative`), [index.html](../../index.html) (aviso de setor e alternativa), [catalogo-comercial.md](../../catalogo-comercial.md), [estrutura_quiz.md](../../estrutura_quiz.md) (seção 7).

**Critério N/A:** “Sob setor obrigatório…” não se aplica, porque a política aprovada é de preferência flexível.

**Decisões aplicadas:** preferência flexível, aprovada no [QUIZ-009](../009-referencia-de-qualidade.md); cobertura por subdivisão (inferior/superior) derivada do catálogo; Cativo só no Sicoob — Leste Inferior; Amarelo/Laranja coberto por Meu Cruzeiro, Time do Povo, Cabuloso e Max pelo cadastro, não por bônus. O bônus manual de 6 pontos foi removido; o tratamento de setor no ranking foi revisado no [QUIZ-010](../010-recalibracao-do-ranking.md) (peso escalado pela presença). Sem plano no orçamento, não há vencedor e o CTA é desativado; o teto nunca é excedido em silêncio.

**Evidência:** `tests/engine.test.js` (“cobertura de setor distingue completo, parcial e ausente”, “preferência pelo Roxo não apresenta o Cativo como benefício no setor”, “ausência de plano elegível é explícita…”); referência CAL-05, CAL-10, RES-05, RES-08, RES-11, RES-12; `tests/browser.test.js` (“orçamento restrito, setor incompatível e custo de uso aparecem separados”).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```
