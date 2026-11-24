# Deploy de preview — 04/11/2026

Entrega solicitada pelo usuário e executada pela CLI Vercel no projeto `marco11/quiz-socio`. O preview inclui a revisão seletiva de respostas e as demais alterações atuais do workspace.

- URL: https://quiz-socio-g5q5ozq1o-marco11.vercel.app
- Deployment: `dpl_FrmkH3bmJxnr6u1AsDziznSktTfo`.
- Destino `preview`, estado `READY`, conferidos na [inspeção Vercel](../tickets/evidencias/deploy-preview-2026-11-04/deployment-inspect.json).
- `npm test`: 173 testes aprovados, zero falhas ou testes ignorados. [Log](../tickets/evidencias/deploy-preview-2026-11-04/tests.log).
- Pacote com 12 arquivos compilados, gate de ranking aprovado e alterações não commitadas declaradas. [Manifesto](../tickets/evidencias/deploy-preview-2026-11-04/release-manifest.json).
- O dry-run coincide com o manifesto e os hashes conferem. A pasta de envio respeita o diretório raiz `quizSocio` configurado no projeto e contém somente os arquivos compilados. [Preflight](../tickets/evidencias/deploy-preview-2026-11-04/preflight.json).
- Jornada isolada de 12 perguntas, conclusão com 20 parâmetros e CTA conferidos antes do envio, usando captura local. [Contrato](../tickets/evidencias/deploy-preview-2026-11-04/contrato-isolado.json).

O pacote atual está em `/tmp/quiz-vercel-preview-2026-11-04-ucy_b0i4/candidate`, substituindo o pacote anterior à revisão seletiva para revisão local. Não houve commit, push, alteração de configurações do projeto nem promoção a produção. A Vercel informa proteção por autenticação neste preview.

A verificação remota foi feita pela inspeção da plataforma. Não houve leitura HTTP ou execução do site publicado, nem comprovação de recebimento no GA4. Os aceites de produção e analytics dos QUIZ-017 a 019 permanecem pendentes. Hosts de preview continuam fora da coleta de produção.
