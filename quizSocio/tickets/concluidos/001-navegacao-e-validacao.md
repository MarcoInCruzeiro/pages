# QUIZ-001 — Impedir salto de perguntas e resultado incompleto

Status: Concluído

## Descrição

Cliques consecutivos em `Continuar` podem executar `onNextClick` antes de a próxima pergunta terminar de renderizar. Na reprodução, o estado passou de `step = 0` para `step = 2` e `wantsGuaranteedTicket` permaneceu `null`. O resultado pode, portanto, usar um perfil incompleto.

Pontos de entrada: `onNextClick`, `onBackClick`, `renderQuestion`, `transitionSection` e finalização do quiz em [index.html](../../index.html).

## Escopo

Aplicar um bloqueio síncrono durante mudança de pergunta e transição de seção. Validar a resposta atual antes de avançar e todas as respostas antes de recomendar. A validação deve reconhecer `0` e `false` como respostas válidas e rejeitar valores ausentes ou fora das opções permitidas.

## Critérios de aceite

- [x] Dois ou mais cliques consecutivos em `Continuar` avançam exatamente uma pergunta.
- [x] Alternar rapidamente `Voltar` e `Continuar` mantém título, opções e índice correspondentes à mesma pergunta.
- [x] Zero jogos e opções de valor `false` permitem avançar normalmente; `null`, `undefined` e opções inválidas mantêm o usuário na pergunta que precisa responder.
- [x] A finalização verifica todas as perguntas ativas; em caso de ausência, retorna à primeira resposta inválida com orientação visível.
- [x] Repetir a ação final cria uma única seção de resultado e um único evento `quiz_complete` para aquela conclusão.
- [x] Eventos de resposta correspondem à pergunta efetivamente respondida; um clique descartado durante a transição não produz outro evento.
- [x] Refazer o quiz limpa o bloqueio e permite uma nova conclusão.

## Bloqueadores

Nenhum. A correção pode começar sobre o fluxo atual.

## Verificação

Teste no navegador com cliques consecutivos sem espera, durante a primeira pergunta, durante retorno e na finalização. Cubra também zero, `false`, resposta ausente e valor inválido. Capture eventos de analytics localmente, sem enviá-los à propriedade real. Registre uma falha na versão anterior e o resultado após a correção.

## Registro de conclusão

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Arquivos:** [index.html](../../index.html) (bloqueio síncrono de navegação e transição, validação por pergunta e na finalização, resultado único), [quiz-engine.js](../../quiz-engine.js) (`isAnswerValid`, `validateAnswers`), [tests/browser.test.js](../../tests/browser.test.js), [tests/cdp.js](../../tests/cdp.js).

**Estado anterior:** reprodução da avaliação no commit `2cecf81`: clique duplo em `Continuar` levou de `step = 0` a `step = 2`, com `wantsGuaranteedTicket = null` (descrição deste ticket e [README](../README.md#evidência-inicial-avaliação-do-commit-2cecf81)).

**Evidência (Chrome headless, `tests/browser.test.js`):** clique duplo avança uma pergunta e gera um único `quiz_answer` da pergunta 1; Voltar+Continuar rápidos mantêm título e resposta da pergunta 2; Voltar preserva seleção; resposta ausente não avança e mostra orientação; zero jogos e `false` avançam; `null`, `undefined` e valores fora das opções são rejeitados (`tests/engine.test.js`); finalização com conflito produz um único resultado; fluxo completo gera 1 `quiz_start`, 12 `quiz_answer` com passo e chave corretos e 1 `quiz_complete`; Refazer permite segunda conclusão (2/24/2 eventos).

**Analytics local:** eventos capturados por `gtag` substituto. Nesta execução foi encontrado e corrigido um vazamento: o `gtag.js` real carregava antes do substituto e enviaria `page_view` à propriedade G-EF75QCTCTV. `tests/cdp.js` agora bloqueia `googletagmanager.com`, `google-analytics.com`, `analytics.google.com`, `doubleclick.net` e o Vercel Insights; cada teste falha se alguma resposta de analytics chegar. Bloqueio conferido: as requisições do `gtag.js` e do Insights aparecem como `blockedReason: inspector`.

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Limitações:** execuções de navegador anteriores a esta correção podem ter enviado `page_view` de teste ao GA4 (não verificável daqui).
