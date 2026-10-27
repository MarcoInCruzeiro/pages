# QUIZ-002 — Conciliar o catálogo com as condições oficiais

Status: Concluído

## Descrição

O catálogo influencia conteúdo e ranking. Na avaliação, o Time do Povo tinha desconto de loja de 15%, prioridade 3 e ausência de conteúdo exclusivo e votação; o regulamento consultado descrevia 10%, prioridade 4 e acesso a esses benefícios. A promessa de ingresso fixo a R$ 40 também divergia da descrição de ingresso popular pelo menor preço online da arquibancada.

Pontos de entrada: `assinaturasSocios`, `generatePlanProfile`, CTAs e tabela comparativa em [index.html](../../index.html).

## Escopo

Conferir os cinco planos e registrar uma fonte comercial única no projeto, com URL, data da consulta e condições de aplicação. Conciliar preço, cobrança, adesão, setores, quantidade de ingressos, descontos, prioridade, disponibilidade, conteúdo e opcionais. Manter apresentação e motor de recomendação derivados desse cadastro.

## Critérios de aceite

- [x] Os cinco planos possuem os campos relevantes conferidos e evidência rastreável da condição vigente. Exceção decidida: disponibilidade do Cativo (ver limitações).
- [x] Cada divergência encontrada registra valor anterior, condição confirmada, fonte e impacto no ranking ou conteúdo.
- [x] Time do Povo tem ingresso popular, desconto de loja, prioridade, conteúdo e votação conciliados com a fonte vigente.
- [x] Garantia de ingresso e prioridade de compra são campos distintos; textos e perfis respeitam essa distinção.
- [x] Valores monetários de exemplo respeitam o percentual anunciado: R$ 150 com 65% de desconto resulta em R$ 52,50, quando esse exemplo for mantido.
- [x] Cards, comparação e CTAs apresentam as mesmas condições; a estrutura de apoio descreve a regra implementada.
- [x] Campos sem confirmação ficam explicitamente pendentes no registro comercial, sem serem promovidos a benefícios confirmados.

## Bloqueadores

- Externo e condicional: conflito entre fontes oficiais que não possa ser resolvido pela vigência ou pelas condições descritas. Registrar a divergência exata e obter esclarecimento do responsável comercial do programa para aquele campo.
- O acesso às fontes permite iniciar o trabalho. A conclusão exige que todos os campos usados para recomendar ou contratar estejam confirmados.

## Verificação

Comparar cadastro e saída da aplicação contra a matriz comercial conferida. Registrar os perfis numéricos antes e depois da atualização para identificar mudanças causadas apenas pelos dados. As fontes de partida estão no [índice](../README.md#fontes-oficiais).

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [catalogo-comercial.md](../../catalogo-comercial.md) (fonte única: URL, publicação 11/09/2026, consulta 26/10/2026, matriz dos cinco planos, divergências e pendências), [quiz-engine.js](../../quiz-engine.js) (`assinaturasSocios`, `CATALOG_VERSION`, `camposPendentes`), [estrutura_quiz.md](../../estrutura_quiz.md).

**Decisões aplicadas:** Time do Povo com loja 10%, prioridade 4, conteúdo e votação, ingresso popular sem preço fixo; garantia (`garantiaIngresso`) separada de prioridade; exemplo do Max R$ 150 → R$ 52,50; desconto em parceiros removido e mantido como pendente. Tabela de divergências com valor anterior, condição confirmada e impacto em `catalogo-comercial.md`.

**Evidência:** `tests/engine.test.js` (“catálogo concilia os cinco planos com o regulamento”, “exemplo de desconto do Max respeita 65% de R$ 150”); `tests/browser.test.js` (“comparativo apresenta a matriz oficial, contrato anual e checkout correto”). Perfis antes/depois: linha de base `2cecf81` em `tests/fixtures/baseline-reference.json` (ver [QUIZ-009](../009-referencia-de-qualidade.md)).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Limitações:** em 26/10/2026, nova tentativa de conferir `/planos` por requisição direta retornou 403 com desafio do Cloudflare; os dados operacionais registrados no catálogo vêm da consulta anterior do mesmo dia. O Cabuloso Cativo consta no Termo de Uso, mas não na tabela pública `/planos`. **Decisão do responsável pelo quiz (Marco, 26/10/2026):** manter o Cativo na recomendação e no CTA, com o aviso “Oferta sujeita à disponibilidade no checkout”, até a confirmação do responsável comercial do programa. Hoje ele é aceitável em 3 cenários da referência e não vence nenhum. A conferência do destino segue no [QUIZ-003](../003-modalidade-e-checkout.md).
