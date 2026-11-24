# QUIZ-018 — Alinhar o contrato de analytics da versão publicada

Status: Em andamento
Prioridade: P1

## Descrição

Na abertura deste ticket, o endereço indicado no `og:url` continha uma versão anterior ao código local, sem os campos atuais de afinidade, semântica e versão. Evidência histórica: [verificação pública de 26/10/2026](evidencias/ga4/verificacao-publica.json). O deploy de 27/10/2026 entregou o pacote estático daquela data à Vercel; a entrega e o recebimento da revisão Vue atual continuam pendentes.

Retomado por solicitação do usuário em 03/11/2026. A entrega de 27/10 foi da aplicação estática; a revisão local agora usa Vue e regras `2026-11-03.2`. O domínio ainda serve regras `2026-10-26.2`, confirmadas por leitura do motor público. [Registro da retomada](../docs/execucao-ga4-018-2026-11-03.md).

## Escopo

- Confirmar com o responsável qual domínio é o ambiente oficial, qual versão está publicada e como a entrega é feita.
- Preparar a revisão e a entrega das correções de GA4, com identificação da versão, configuração de ambientes do QUIZ-013 e roteiro de validação/retorno à versão anterior.
- Após a entrega pelo responsável, verificar o HTML, os recursos carregados, os payloads e o recebimento da versão publicada.
- Documentar a data da migração de semântica do score para distinguir os dados antigos dos atuais.

Criar este ticket não executa deploy. A publicação continua sendo uma ação separada, conforme o backlog existente.

## Critérios de aceite

- [x] Destino e histórico de entrega identificados: projeto `marco11/quiz-socio`, alias `quiz-socio.vercel.app`, entrega estática de 27/10 documentada e versão pública reconferida por HTTP em 03/11. A autorização de outubro não autoriza automaticamente publicar o novo pacote Vue.
- [x] Pacote após a revisão seletiva preparado e identificado por manifesto: 12 arquivos compilados, regras `2026-11-03.2`, alterações não commitadas declaradas e contrato isolado validado; entregue em preview em 04/11.
- [x] Escopo e bloqueadores atuais explícitos: preparo anterior documentado, novo pacote após a revisão seletiva pendente; candidato com árvore limpa/CI, publicação Vue, execução pública e recebimento real ainda pendentes.
- [ ] O artefato Vue atual é entregue pelo processo de integração/publicação, com o candidato rastreável e as condições de entrega atendidas.
- [ ] Após publicação, o domínio oficial carrega a versão identificada e emite o contrato vigente, incluindo `versao_das_regras` no contrato português.
- [ ] Uma execução controlada confirma recebimento e parâmetros no DebugView da propriedade correta, distinguindo intenção de contratar de contratação efetiva.
- [ ] O registro informa data, versão publicada, resultados e como relacionar o contrato inglês ao português, incluindo `compatibility` → `compatibilidade`, e segmentar a afinidade por versão.
- [ ] O roteiro de retorno da entrega Vue confirma na plataforma o deployment atualmente servido e registra o alvo válido antes da nova publicação. Os IDs de outubro abaixo são históricos, não reconfirmação atual.

## Bloqueadores

- Entrega atual: a versão Vue ainda não está publicada e o pacote preparado declara `workingTreeHasChanges: true`. A integração/candidato com árvore limpa e o CI pertencem à fase de entrega; não foram executados nesta retomada.

- Externo atual: falta de acesso à propriedade GA4 para comprovar recebimento da versão publicada. **Responsável:** administrador de analytics. **Desbloqueio:** acesso autorizado ou execução acompanhada do roteiro do QUIZ-017. O destino de produção e o acesso Vercel foram resolvidos.
- Dependências de validação: [QUIZ-016](concluidos/016-regressao-da-integracao-ga4.md) e [QUIZ-017](017-configuracao-e-validacao-ga4.md).
- Dependência atendida: [QUIZ-011](concluidos/011-regressao-e-entrega.md), concluído após a avaliação dos perfis e a consolidação local. Essa etapa não é mais um bloqueador.

## Verificação

Comparar versão e contrato no artefato preparado antes da entrega. Após a publicação, repetir a leitura do domínio oficial e uma execução de medição controlada seguindo o roteiro do QUIZ-017. Registrar o que foi comprovado por código, rede e painel; a presença da tag sozinha não comprova recebimento.

## Registro de conclusão

Entrega realizada e identificada abaixo. Pendente: executar o contrato no ambiente publicado e comprovar recebimento na propriedade correta.

## Preview publicado — 04/11/2026

Novo pacote de 12 arquivos preparado após a revisão seletiva, validado com 173 testes e contrato isolado, e entregue em preview no projeto existente. Estado `READY`; produção e recebimento real no GA4 continuam pendentes. [URL, manifesto e evidências](../docs/deploy-preview-2026-11-04.md). O pacote ainda declara alterações não commitadas.

## Revisão seletiva — 04/11/2026

A [revisão seletiva de respostas](../docs/revisao-seletiva-2026-11-04.md) alterou a aplicação após a conferência isolada abaixo. Preparar outro build e candidato e repetir a conferência antes da entrega. Os manifestos existentes permanecem como evidência dos pacotes anteriores.

## Atualização do pacote — 04/11/2026

O pacote de 03/11 foi superado pela mudança de GA4. A revisão vigente usa catálogo `2026-10-28.2`, regras `2026-11-03.2`, GA4 `2026-11-03.1` e hash `3fca088a0572f28d19df8287caa05527180717404397b999784b93448da54813`.

O novo [manifesto](evidencias/018/2026-11-04/release-manifest.json) identifica 12 arquivos e declara alterações não commitadas. Os 12 hashes foram conferidos no pacote isolado, e o [contrato em português](evidencias/018/2026-11-04/contrato-isolado.json) concluiu o cenário CAL-02 com 20 parâmetros e 12 respostas traduzidas, sem envio ao GA4. O procedimento vigente usa [verify-package-contract.cjs](../scripts/verify-package-contract.cjs), que recusa pacotes de outra revisão. O script de 03/11 permanece apenas para reproduzir a evidência histórica daquele contrato.

A [migração dos consumidores](../docs/migracao-ga4-portugues.md), entrega com árvore limpa/CI, publicação e confirmação no DebugView continuam pendentes. Não houve leitura pública nova, acesso ao Admin nem deploy nesta correção documental. [Roteiro e comandos atuais](../docs/execucao-ga4-018-2026-11-03.md).

## Retomada — 03/11/2026 (pacote histórico)

O [verificador de build publicado](../scripts/verify-published-build.mjs) compara os arquivos compilados com o manifesto de um pacote preparado, em vez de comparar o HTML público com o HTML-fonte. A leitura do domínio retornou HTML legado (HTTP 200), motor público com regras `2026-10-26.2`/catálogo `2026-09-11` e `build-manifest.json` ausente (HTTP 404). A comparação recusou a identidade com o Vue local, saída 2. [Evidência pública](evidencias/018/2026-11-03/publicacao.json) e [versões extraídas por HTTP](evidencias/018/2026-11-03/versao-legada.json).

O pacote de revisão atual contém 12 arquivos, identificados no [manifesto](evidencias/018/2026-11-03/release-manifest.json). Os 12 hashes coincidem quando o pacote é servido isoladamente. No Chrome, a jornada local gerou 1 início, 12 respostas e 1 conclusão com 20 parâmetros, versões corretas, afinidade/alias e CTA do Time do Povo no caso CAL-02. A captura foi local e os destinos de coleta bloqueados; não houve envio de eventos ao GA4. [Contrato isolado](evidencias/018/2026-11-03/contrato-isolado.json).

Os nove testes de verificação passaram. A aprovação do gate local do ranking está registrada no manifesto, mas não equivale a candidato com árvore limpa, autorização de publicar ou validação no GA4. Não houve commit, merge ou deploy. O ticket permanece em andamento para a entrega atual e os aceites externos.

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
