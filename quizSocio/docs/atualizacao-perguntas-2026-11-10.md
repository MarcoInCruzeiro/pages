# Atualização de textos e respostas das perguntas

Execução em 10/11/2026, a pedido do usuário. Regras `2026-11-10.5` (a `.4` trouxe textos e respostas; a `.5`, o novo help da Q2); catálogo e GA4 (`2026-11-03.1`) inalterados.

## Textos alterados

| Pergunta | Antes | Depois |
| --- | --- | --- |
| Q1 `gamesPerYear` | Em média, a quantos jogos do Cruzeiro você pretende ir por ano? | Em média, a quantos jogos do Cruzeiro você pretende ir em 2027? |
| Q2 `gamesHistory` | Nos últimos 15 meses, a quantos jogos do Cruzeiro você foi no Mineirão? | Nos últimos 15 meses, em quantos jogos do Cruzeiro você esteve presente no estádio? |
| Q2 checkbox | Não sei ou sou novo sócio | Não sei |
| Q2 ajuda | Não lembra ou ainda não é sócio? Marque a opção abaixo para continuar. | Não lembra? Marque a opção abaixo para continuar. |
| Q3 `wantsGuaranteedTicket` | O que melhor te define como torcedor? | O que melhor define seu perfil de torcedor? |
| Q8 `wantsStoreDiscount` | Sempre que sai um novo manto ou produto oficial, o que você faz? | Sempre que lança uma camisa nova ou produto oficial, o que você faz? |
| Q9 `gameFrequency` | Como você costuma viver a paixão nos dias de jogo? | Como você costuma acompanhar o Cabuloso nos dias de jogos? |

A mensagem de erro da Q2 passou a usar o texto configurado do checkbox (“Não sei”) em vez de um texto fixo.

## Respostas de três níveis

A Q8 e a Q10 passaram de duas para três respostas. A resposta do meio usa o valor `sometimes` e vale o ponto médio entre as outras duas, por decisão do usuário:

| Pergunta | Resposta | Valor | Efeito no perfil |
| --- | --- | --- | --- |
| Q8 | Sempre compro | `true` | `descuentos` 8 |
| Q8 | Compro às vezes | `sometimes` | `descuentos` 4,5 (`perfil.descuentos.sometimes`) |
| Q8 | Nunca compro | `false` | `descuentos` 1 |
| Q10 | Acompanho com frequência | `true` | `experiencias` +2 |
| Q10 | Acompanho às vezes | `sometimes` | `experiencias` +1 (`perfil.experiencias.bonusDigitalParcial`) |
| Q10 | Nunca acompanho | `false` | `experiencias` +0 |

`true` e `false` mantêm os valores anteriores. Por isso as referências congeladas, que só usam essas respostas, não mudam de resultado.

## Efeito no GA4

O GA4 recebe a resposta como texto. `resposta_quer_desconto_na_loja` e `resposta_experiencia_digital` agora também podem chegar com `sometimes`, além de `true` e `false`. Relatórios ou filtros que assumem só dois valores precisam incluir o novo. O contrato de nomes não mudou.

## Arquivos

`config/questoes/questoes.json`, `config/pesos/perfil.json`, `config/pesos/pesos.schema.json`, `config/validadores-compilados.mjs` (regenerado), `config/adapter.js`, `config/revision.json` (preparado por `npm run config:prepare`), `src/engine-core.mjs`, `tests/engine.test.js`, `tests/browser.test.js` (o cenário de orçamento/Roxo passa a clicar no índice 2 para continuar respondendo “nunca” na Q8 e na Q10), `estrutura_quiz.md`.

## Verificação

133/133 testes unitários, 44/44 de navegador, `check-delivery` em modo produção aprovado, `git diff --check` limpo.
