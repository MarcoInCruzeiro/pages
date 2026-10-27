# QUIZ-016 — Cobrir a inicialização e o contrato GA4 em regressão

Status: Concluído
Prioridade: P1

## Descrição

Os testes atuais substituem `gtag` depois da navegação. Eles verificam os eventos do quiz, mas não detectaram a inicialização da coleta no preview. A auditoria complementar dependeu de um roteiro temporário. A correção precisa de cobertura permanente executável pelo projeto.

## Escopo

- Integrar à suíte existente os cenários de [QUIZ-012](012-preview-explicito.md), [QUIZ-013](013-isolamento-da-coleta-ga4.md), [QUIZ-014](014-versao-das-regras-no-ga4.md) e [QUIZ-015](015-cta-principal-com-link.md).
- Instalar observação e interceptação antes de navegar, distinguindo fila de comandos, tentativa de coleta e recebimento externo.
- Manter os testes determinísticos e executar a verificação normal sem baixar uma biblioteca remota mutável. Se houver teste adicional com biblioteca real, documentar sua execução e manter bloqueio de coletores antes da transmissão.

Pontos de entrada: [tests/browser.test.js](../tests/browser.test.js), [tests/cdp.js](../tests/cdp.js) e scripts de [package.json](../package.json).

## Critérios de aceite

- [x] A suíte detecta os dois defeitos originais de preview (substring `includes('preview')` e tag incondicional) e passa após as correções.
- [x] Os testes cobrem modo normal habilitado, preview, desenvolvimento excluído (`localhost`, `127.0.0.2`, `[::1]`, `file://`) e host remoto fora da lista explícita.
- [x] Um percurso sem retorno gera 1 início, 12 respostas (uma por pergunta) e 1 conclusão; cliques descartados (duplo `Continuar`, resposta ausente) não duplicam eventos.
- [x] Retorno (`Voltar`), revisão de conflitos e refazer têm contagens coerentes com o contrato (2× start, 24× answer, 2× complete no refazer), preservando reenvios de resposta legítimos.
- [x] Os três locais de CTA (`resultado`, `lista`, `comparativo`) e o resultado sem plano elegível têm cobertura de evento e navegação.
- [x] A inicialização (`js`, `set`, `config`) e os campos de versão (`rules_version`, `catalog_version`) são inspecionados desde o carregamento da página.
- [x] O bloqueio ocorre antes da transmissão (Fetch, estágio Request); ausência de resposta HTTP, isoladamente, não é tratada como prova de ausência de envio (tentativas registradas em `page.analyticsAttempts`).
- [x] Os testes pertinentes e a suíte completa passam, com logs registrados em `tickets/evidencias/ga4/`.

## Comandos da implementação

```
npm test                  # 71/71 aprovados (motor, referência, navegador)
npm run test:browser      # 32/32 aprovados (Chrome headless; analytics bloqueado)
```

Resultados da suíte completa:
- `Quiz Sócio — fluxo de navegador`: 14/14
- `Quiz Sócio — isolamento da coleta GA4`: 9/9
- `Quiz Sócio — reconhecimento do preview`: 3/3
- `Quiz Sócio — CTAs de contratação`: 6/6
- Motor + referência: 39/39

## Evidências

- Log de execução: `tickets/evidencias/ga4/implementacao-2026-10-27/npm-test.tap` (71 testes, 0 falhas, 115 s).
- Arquivos alterados: `tests/browser.test.js`, `tests/cdp.js`, `index.html`, `tests/engine.test.js`, `tests/static-server.js`, `estrutura_quiz.md`.

## Limitações

- Não há acesso ao GA4 Admin nem ao checkout real (QUIZ-017, QUIZ-018, QUIZ-019 bloqueados por dependência externa); a verificação local é feita com interceptação pré-transmissão e dados fictícios.
- O script de visitas da Vercel (`/_vercel/insights/`) não é GA4; filtrado explicitamente nos testes (`ga4Attempts()`), documentado como limitação de escopo.
- Nenhuma biblioteca remota mutável é baixada durante os testes (gtag é mockado na página).

## Registro de conclusão

Data: 27/10/2026
Arquivos alterados: `tests/browser.test.js` (4 describes integrados: fluxo, isolamento GA4, reconhecimento preview, CTAs; helpers `openPage`/`setup`/`waitUntil`/`ga4Attempts`), `tests/cdp.js` (cliente CDP com Fetch em sessão principal + browser-WS auto-attach, `targetId` passado no construtor, hosts bloquados, navegação aguarda `loadEventFired`), `index.html` (decisão de coleta no head, CTA como link, `rules_version`), `tests/engine.test.js` (teste de unidade de `rulesVersion`), `tests/static-server.js` (dual-stack, TLS, loopback guard), `estrutura_quiz.md` (seção 9 atualizada).
Decisões aplicadas: interceptação antes da transmissão; tentativa de coleta ≠ transmissão confirmada; child-tab document request como gravadora confiável de checkout; `window.open` removido do CTA.
Comandos executados: `npm test` (71/71), `npm run test:browser` (32/32).
Resultados: todos os critérios de aceite atendidos; suíte verde e logs salvos.
Limitações: acima.
Status: Concluído.
