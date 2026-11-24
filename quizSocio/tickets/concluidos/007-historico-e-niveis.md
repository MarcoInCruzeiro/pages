# QUIZ-007 — Separar histórico de frequência futura no Cabuloso

Status: Concluído

## Descrição

A primeira pergunta coleta intenção de jogos por ano. `getFrequentLevel` usa esse valor como se fosse histórico dos últimos 15 meses; `generatePlanProfile` atribui prioridade e desconto fixos ao Cabuloso. Os auxiliares calculados em `renderResults` não influenciam o ranking.

## Escopo

Tratar frequência futura como estimativa de uso e o histórico ou nível confirmado como condição atual. Para adesão nova ou histórico desconhecido, usar a condição inicial confirmada no catálogo, distinguindo projeções de benefícios já disponíveis.

## Critérios de aceite

- [x] O perfil distingue intenção anual de histórico elegível na janela comercial vigente.
- [x] Adesão nova e histórico desconhecido seguem regra inicial explícita; intenção futura elevada não concede automaticamente nível superior.
- [x] Se os limites atuais forem confirmados, 0/9 jogos históricos usam nível 1, 10/19 usam nível 2 e 20 ou mais usam nível 3.
- [x] Cada nível confirmado altera desconto e prioridade usados na avaliação do plano e na explicação do resultado.
- [x] Comparações de custo usam o benefício atual; projeções futuras, quando oferecidas, aparecem identificadas como estimativas.
- [x] Um único cálculo de nível alimenta ranking, custos e apresentação, eliminando regras concorrentes.

## Bloqueadores

- Dependência: [QUIZ-002](002-catalogo-comercial.md), para confirmar janela, limites e regra de adesão.
- Dependência: [QUIZ-006](006-coerencia-das-respostas.md), para o contrato das respostas revisadas.
- Externo e condicional: ausência de regra oficial para início ou manutenção de nível deve ser resolvida pelo responsável comercial do programa.

## Verificação

Exercitar limites de nível, histórico desconhecido e torcedor novo com intenção de 30 jogos. Verificar que alterar somente o histórico altera os benefícios atuais quando cruza um limite; alterar somente a intenção não concede esse benefício.

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [quiz-engine.js](../../quiz-engine.js) (pergunta `gamesHistory` com “Não sei ou sou novo sócio”, `resolveLevel` único para ranking, custo, prioridade e textos), [estrutura_quiz.md](../../estrutura_quiz.md) (seção 4).

**Decisões aplicadas:** intenção anual (`gamesPerYear`) separada de histórico de 15 meses (`gamesHistory`); limites 0–9/10–19/20+ do Termo de Uso; histórico desconhecido usa nível 1 e o resultado identifica como condição inicial; intenção alta não concede nível.

**Evidência:** `tests/engine.test.js` (“níveis do Cabuloso usam histórico e seguem os limites oficiais”, “desconto e prioridade derivam do mesmo nível”); `tests/reference.test.js` (“mudar apenas o histórico cruza o nível…”, “mudar apenas a intenção futura não concede nível superior”; RES-09, RES-10, CAL-07, CAL-08, CAL-09).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Limitações:** regra de manutenção de nível ao longo da temporada não é modelada; o quiz usa o nível atual pelo histórico declarado. Não há projeção de nível futuro.
