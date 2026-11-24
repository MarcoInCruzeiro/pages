# Code Review — Tickets QUIZ-012 a QUIZ-016 (GA4)

**Data:** 27/10/2026  
**Branch:** `quiz-socio/tickets-correcoes`  
**Base:** commit `01f6d20` (quiz socios: correções dos tickets QUIZ-001 a QUIZ-011)  
**Revisor:** revisão manual baseada na skill `code-reviewer`

## 1. Resumo

Implementa os 5 tickets GA4 pendentes (QUIZ-012, 013, 014, 015, 016): preview reconhecido por sinal explícito, isolamento da coleta GA4 (tag injetada somente para `quiz-socio.vercel.app` e não-preview), `rules_version` no evento `quiz_complete`, CTA principal como `<a>` real (substitui `window.open`) e suíte de regressão permanente com interceptação CDP antes da transmissão.

**Veredito:** APROVADO — sem bloqueadores. Todos os 71 testes da suíte passam (`npm test`: 71/71; `npm run test:browser`: 32/32).

## 2. Problemas críticos

Nenhum.

## 3. Problemas maiores

Nenhum.

## 4. Ajustes menores (não bloqueantes)

- `tests/cdp.js`: o `<link rel="preconnect" href="https://fonts.gstatic.com">` pré-existente no `<head>` ainda inicia um handshake DNS/TCP para fontes externas. Não afeta a assertiva de ausência de transmissão de analytics/checkout, mas não é coberto pelo bloqueio de `HOSTS_BLOQUEADOS`. Considerar remover se o requisito de "sem tráfego de rede de teste" for interpretado estritamente.
- O script de visitas da Vercel (`/_vercel/insights/`) permanece carregado na página; documentado no ticket como fora do escopo GA4 e filtrado pelo helper `ga4Attempts()` nos testes.

## 5. Feedback positivo

- Separação clara das duas camadas de isolamento (supressão de eventos vs. isolamento completo da tag) documentada em `estrutura_quiz.md` seção 9.
- Uso de `resourceType === 'Document'` para distinguir tentativa de navegação de checkout de subrecursos (evita falsos positivos com imagens do site do checkout).
- Correção do bug de `Target.attachedToTarget`: o `sessionId` da nova sessão vem em `params.sessionId`, não no campo de topo da mensagem.
- Navegação aguarda `Page.loadEventFired` antes de ler `readyState`, eliminando race de documento antigo.
- DNS `~NOTFOUND` para `socio.cruzeiro.com.br` como segunda barreira de checkout, além do bloqueio Fetch.
- Testes TDD: QUIZ-015 teve testes RED confirmados antes da implementação.

## 6. Perguntas para o autor

Nenhuma bloqueadora. A confirmação do domínio publicado (`quiz-socio.vercel.app`) na propriedade GA4 Admin depende do QUIZ-018 (bloqueado, acesso externo).

## 7. Veredito

Aprovado para merge na branch `quiz-socio/tickets-correcoes`. Commit estilo repo: `quiz socios: correções dos tickets QUIZ-012 a QUIZ-016 (GA4)`.
