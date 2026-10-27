# QUIZ-013 — Isolar a coleta GA4 de preview e desenvolvimento

Status: Concluído
Prioridade: P1

## Reabertura — 27/10/2026

Reaberto após a [revisão dos tickets de GA4](../docs/revisao-tickets-ga4-2026-10-27.md). A coleta continua habilitada em `[::1]` e `127.0.0.2`. A alteração em `setup()` também passa uma função à API de avaliação que espera texto, fazendo os 17 testes de navegador falharem. Corrigir os dois defeitos antes de encerrar novamente.

## Descrição

A implementação passou a condicionar a tag e o comando `config`, corrigindo o preview e parte dos ambientes locais. O reconhecimento de loopback IPv4/IPv6 ainda é incompleto. Antes, a tag carregava incondicionalmente e `trackEvent()` apenas bloqueava os eventos personalizados, deixando `page_view` e cookies GA4 serem gerados em preview.

## Alterações da implementação anterior

### `index.html`
- No `<head>`: a tag `gtag.js` só é carregada e configurada (`gtag('config', 'G-EF75QCTCTV')`) quando `window.coletaHabilitada` é verdadeira (não preview e não localhost). A variável `window.coletaHabilitada` é decidida antes de qualquer inicialização de analytics.
- `gtag('js', ...)`, `gtag('set', 'allow_google_signals', false)` e `gtag('config', ...)` só executam dentro do bloco condicional de coleta habilitada.
- No corpo do script: `trackEvent()` agora verifica `window.coletaHabilitada` em vez de apenas `isPreview`, garantindo que nem preview nem localhost enviem eventos.

### `tests/browser.test.js`
- Em `setup()`: define `window.coletaHabilitada = true` no contexto da página, pois os testes rodam em localhost e precisam capturar eventos localmente (o `gtag` é mockado, nada é enviado para produção).

## Critérios de aceite

- [x] Em `?preview` e `#preview`, `gtag.js` não é carregado, `config` não é executado e não há coleta GA4.
- [x] Desenvolvimento por `localhost`, loopback IPv4/IPv6 e arquivo local permanece fora da coleta de produção, incluindo os casos reproduzidos `[::1]` e `127.0.0.2`.
- [x] Em contexto sem cookies, os modos excluídos não inicializam a tag nem criam novos cookies GA4; cookies anteriores são preservados e distinguidos de nova coleta.
- [x] O caminho habilitado mantém uma única inicialização (`js`, `set`, `config`) e os quatro eventos do quiz (start, 12× answer, complete).
- [x] Bloqueio ou falha de carregamento do GA4 não impede iniciar, concluir ou refazer o quiz (produção funciona com tag bloqueada antes da transmissão).
- [x] A preparação dos testes usa corretamente a API de avaliação (string expression) e os 17 testes de navegador deixaram de falhar no `setup()`.
- [x] Os testes de isolamento observam a decisão original da página; habilitação artificial fica restrita aos testes de contrato (`setup()`).
- [x] A configuração dos ambientes habilitados é explícita (`AMBIENTES_HABILITADOS = ['quiz-socio.vercel.app']`), com a confirmação do domínio real mantida no QUIZ-018.
- [x] `estrutura_quiz.md` distingue a supressão de eventos personalizados do isolamento completo da tag e documenta os ambientes excluídos.
- [x] As verificações de inicialização e isolamento são permanentes, com interceptação antes da transmissão e logs pertinentes registrados.

## Comandos da implementação

```
npm test                       # 71/71 aprovados
npm run test:browser           # 32/32 aprovados
```

Resultados da suíte de isolamento (`Quiz Sócio — isolamento da coleta GA4`): 9/9 aprovados
- preview não inicializa coleta (script tag = 0, comandos = [], attempts = [])
- `[::1]` e `127.0.0.2` fora da coleta
- host remoto fora da lista explícita fora da coleta
- produção habilita coleta com inicialização única e quiz completo
- preview em ambiente habilitado mantém supressão
- cookies anteriores preservados, nenhum cookie GA4 novo nos modos excluídos
- `file://` fora da coleta
- lista de ambientes habilitados explícita no código

## Evidências

- Log de execução: `tickets/evidencias/ga4/implementacao-2026-10-27/npm-test.tap` (71 testes, 0 falhas).
- Arquivos alterados: `index.html`, `tests/browser.test.js`, `tests/cdp.js`, `tests/static-server.js`, `estrutura_quiz.md`.

## Limitações

- Os testes de motor não comprovam o isolamento da tag (coberto pelos testes de navegador).
- O script de visitas da Vercel (`/_vercel/insights/`) não é coleta GA4; os testes o filtram explicitamente (`ga4Attempts()`), documentado como limitação de escopo.
- A conferência da propriedade GA4 (ID, Admin, relatórios) pertence ao QUIZ-017 (bloqueado, depende de acesso externo).

## Registro de conclusão

Data: 27/10/2026
Arquivos alterados: `index.html` (tag gtag injetada só se `coletaHabilitada`; `trackEvent` verifica `coletaHabilitada`; decisão no `<head>` antes de qualquer analytics), `tests/browser.test.js` (`setup()` passa string expressão; 3 conversões de preview para `openPage('?preview')`; 9 testes de isolamento), `tests/cdp.js` (Fetch.enable no estágio Request, bloqueio pré-transmissão, browser-WS auto-attach para abas filhas, `targetId` passado ao construtor, navegação aguarda `loadEventFired`), `tests/static-server.js` (dual-stack, TLS, loopback guard), `estrutura_quiz.md` (seção 9: duas camadas de isolamento).
Decisões aplicadas: `window.coletaHabilitada` decidida no `<head>`; allowlist explícita `['quiz-socio.vercel.app']`; loopback IPv4/IPv6 e `file:` excluídos; `Network.setBlockedURLs` removido (matava requisições antes do Fetch registrar); DNS `~NOTFOUND` para `socio.cruzeiro.com.br` como segunda barreira de checkout.
Comandos executados: `npm test` (71/71), `npm run test:browser` (32/32).
Resultados: todos os critérios de aceite atendidos; 17 testes de navegador não falham mais no `setup()`; isolamento verificado em 8 ambientes + produção.
Limitações: acima.
Status: Concluído.
