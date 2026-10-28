# QUIZ-018 — Alinhar o contrato de analytics da versão publicada

Status: Bloqueado
Prioridade: P1

## Descrição

Na abertura deste ticket, o endereço indicado no `og:url` continha uma versão anterior ao código local, sem os campos atuais de afinidade, semântica e versão. Evidência histórica: [verificação pública de 26/10/2026](evidencias/ga4/verificacao-publica.json). O deploy de 27/10/2026 entregou o pacote atual à Vercel; a execução do contrato em produção e o recebimento no GA4 continuam pendentes.

## Escopo

- Confirmar com o responsável qual domínio é o ambiente oficial, qual versão está publicada e como a entrega é feita.
- Preparar a revisão e a entrega das correções de GA4, com identificação da versão, configuração de ambientes do QUIZ-013 e roteiro de validação/retorno à versão anterior.
- Após a entrega pelo responsável, verificar o HTML, os recursos carregados, os payloads e o recebimento da versão publicada.
- Documentar a data da migração de semântica do score para distinguir os dados antigos dos atuais.

Criar este ticket não executa deploy. A publicação continua sendo uma ação separada, conforme o backlog existente.

## Critérios de aceite

- [x] Destino de produção, versão de origem e processo de entrega registrados: projeto `marco11/quiz-socio`, alias `quiz-socio.vercel.app`, pacote do workspace identificado por manifesto e deploy direto via CLI autorizado pelo usuário.
- [x] O artefato entregue contém as correções locais verificadas no QUIZ-016 e a política de ambientes aplicável ao domínio de produção. Hashes conferidos contra o workspace; 82/82 testes aprovados antes da publicação.
- [x] O escopo da entrega e seus bloqueadores estão explícitos. Publicação concluída na Vercel; restam a execução do contrato em produção e o aceite de recebimento do QUIZ-017.
- [ ] Após publicação, o domínio oficial carrega a versão identificada e emite o contrato vigente, incluindo `rules_version`.
- [ ] Uma execução controlada confirma recebimento e parâmetros no DebugView da propriedade correta, distinguindo intenção de contratar de contratação efetiva.
- [ ] O registro informa data, versão publicada, resultados e como separar a série antiga de `compatibility` da afinidade atual.
- [x] O roteiro de retorno identifica a versão anterior e a configuração de analytics correspondente: HTML público idêntico ao commit `2cecf81`, com tag `G-EF75QCTCTV`; deployment anterior `dpl_AqDicKu9ZniTnALtZ2hs2qgvbqYx`, registrado antes da entrega.

## Bloqueadores

- Externo atual: falta de acesso à propriedade GA4 para comprovar recebimento da versão publicada. **Responsável:** administrador de analytics. **Desbloqueio:** acesso autorizado ou execução acompanhada do roteiro do QUIZ-017. O destino de produção e o acesso Vercel foram resolvidos.
- Dependências de validação: [QUIZ-016](concluidos/016-regressao-da-integracao-ga4.md) e [QUIZ-017](017-configuracao-e-validacao-ga4.md).
- Dependência atendida: [QUIZ-011](concluidos/011-regressao-e-entrega.md), concluído após a avaliação dos perfis e a consolidação local. Essa etapa não é mais um bloqueador.

## Verificação

Comparar versão e contrato no artefato preparado antes da entrega. Após a publicação, repetir a leitura do domínio oficial e uma execução de medição controlada seguindo o roteiro do QUIZ-017. Registrar o que foi comprovado por código, rede e painel; a presença da tag sozinha não comprova recebimento.

## Registro de conclusão

Entrega realizada e identificada abaixo. Pendente: executar o contrato no ambiente publicado e comprovar recebimento na propriedade correta.

## Candidato preparado — 27/10/2026

Executado `npm run release:prepare -- --output /tmp/quizSocio-release-2026-10-27`. Foram preparados dez arquivos públicos em `/tmp/quizSocio-release-2026-10-27/public/`, com [manifesto de versões e hashes](evidencias/execucao-2026-10-27/release-manifest.json). A lista explícita exclui ambiente, credenciais, testes e documentos. O comando recusa sobrescrita e saída dentro do projeto.

O vínculo local identifica o projeto Vercel `quiz-socio`, mas não confirma o domínio oficial ou o processo de entrega. Vercel não estava conectado na preparação do candidato. A consolidação do QUIZ-011 foi concluída posteriormente; acesso à entrega e recebimento no GA4 permanecem pendentes.

A nova [verificação HTTP](evidencias/execucao-2026-10-27/externos.json) confirma o contrato antigo no endereço referenciado. Seu hash é idêntico ao HTML do commit `2cecf81`, identificando o código anterior para o [roteiro de retorno](../docs/validacao-e-entrega.md#retorno-à-versão-anterior). O manifesto representa o workspace com alterações locais, não um checkout limpo do commit.

Continuam pendentes a confirmação do domínio, o acesso à entrega e o recebimento no GA4. O candidato local está disponível para revisão e futura publicação pelo processo confirmado.

## Publicação em produção — 27/10/2026

O usuário solicitou o deploy após a configuração da Vercel. O projeto vinculado `marco11/quiz-socio` foi preservado, com diretório raiz `quizSocio`. Uma cópia isolada enviou exclusivamente os dez arquivos públicos; `vercel deploy --dry --json` confirmou a lista, e os hashes coincidiram com o workspace. `npm test` aprovou 82 testes, sem falhas, antes do envio.

Deployment `dpl_5aGzo4F5S9RtEUWzbGWdV9xZWoKh`, alvo `production`, estado `READY`, com alias [quiz-socio.vercel.app](https://quiz-socio.vercel.app/) confirmado por `vercel inspect`. [Registro e limites](evidencias/deploy-2026-10-27/deploy.json), [manifesto](evidencias/deploy-2026-10-27/release-manifest.json) e [inspeção Vercel](evidencias/deploy-2026-10-27/deployment-inspect.json). Regras `2026-10-26.2`, catálogo `2026-09-11`. O pacote representa o workspace; não houve commit ou push.

Para retorno, o deployment anterior é `dpl_AqDicKu9ZniTnALtZ2hs2qgvbqYx`, URL `https://quiz-socio-lqsjwx39z-marco11.vercel.app`, originado no commit `2cecf81`. Uma restauração exige uma ação específica de rollback; ela não foi executada.

Não foi feita leitura HTTP nem execução do site publicado nesta etapa. A inspeção da plataforma comprova conclusão do deploy e associação do domínio, sem comprovar o recebimento dos eventos. O status permanece bloqueado para esses aceites, e o QUIZ-017 continua bloqueado conforme solicitado pelo usuário.
