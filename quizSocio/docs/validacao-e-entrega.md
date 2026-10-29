# Validação externa e entrega do quiz

Registro histórico da versão estática (27/10/2026): QUIZ-003 foi validado pelo usuário; QUIZ-009, QUIZ-010-A/010 e QUIZ-011 estão concluídos. A avaliação sintética e a consolidação passaram, sem mudança no cálculo. A publicação em produção na Vercel foi realizada em 27/10/2026; seguem pendentes a validação do contrato publicado, o recebimento no GA4 e a continuidade no checkout. A configuração dos eventos continua em [estrutura_quiz.md](../estrutura_quiz.md#9-analytics); os status ficam no [backlog](../tickets/README.md).

## Estado vigente em 29/10/2026

A implementação local usa Vue 3 + Vite na branch `quiz/port-vue`, ainda sem merge ou publicação da versão Vue. A configuração operacional está em `config/planos/catalogo.json`, `config/questoes/questoes.json`, `config/pesos/{ranking,perfil}.json` e `config/ga4/ga4.json`; [revision.json](../config/revision.json) identifica catálogo `2026-10-28.2`, regras `2026-10-29.2` e GA4 `2026-10-28.3`.

A fotografia atual de testes e os resultados dos tickets ficam no [fechamento de qualidade e entrega](../tickets/qualidade-e-entrega/README.md). A avaliação dos quatro planos está no [dossiê de decisão](../tickets/evidencias/qualidade-e-entrega-2026-10-29/decisao-ranking.md): histórico 10/12 no top-1 e 12/12 no top-3 por partição; perfis 7/8 e 8/8 no top-1, ambos 8/8 no top-3; zero violações de orçamento. `releaseApproved: false`: as perdas CAL-02, CAL-10, PER-02-C e RES-05 exigem decisão do responsável. As evidências anteriores abaixo são históricas.

Verificação local e no CI: Node 22, `npm ci` e `npm test`, com Chrome indicado por `CHROME_PATH` quando necessário. O workflow [Quiz Socio CI](../../.github/workflows/quiz-socio.yml) usa cache npm pelo lockfile, instala Chrome e executa a mesma suíte, sem passos de publicação. A regra Git da Vercel desativa publicação automática nas branches `quiz/*`; não há deploy nesta fase. Para manter os validadores atualizados, execute `npm run config:validators` após alterar schemas; o build verifica identidade sem reescrever fontes.

Candidatos e backups locais ficam em `.scratch/port-vue/config-candidates/` (ignorado), e pacotes isolados ficam fora do projeto. Para registrar o diagnóstico: `npm run build` e `npm run release:prepare -- --diagnostic --output DIRETORIO_VAZIO_EXTERNO`. A publicação permanece uma ação específica posterior, após aceite e CI verde. O alvo histórico de rollback é `dpl_5aGzo4F5S9RtEUWzbGWdV9xZWoKh`; antes de publicar, conferir na Vercel se ele ainda é o deployment anterior e registrar seu URL. O comando de promoção é `vercel promote URL_DO_DEPLOYMENT_ANTERIOR`; não foi executado.

## 1. Conferir as ofertas — QUIZ-003

**Etapa concluída por confirmação do usuário em 27/10/2026:** preços, modalidades e destinos aceitos no [QUIZ-003](../tickets/concluidos/003-modalidade-e-checkout.md). Os valores foram preservados. Não é necessário repetir a conferência para encerrar esse ticket.

O comando `npm run verify:external -- --output CAMINHO_DO_RELATORIO.json` continua disponível para diagnósticos técnicos de publicação e redirecionamentos. Seus resultados HTTP não anulam o aceite comercial declarado pelo usuário.

As tentativas anteriores estão preservadas em [externos.json](../tickets/evidencias/execucao-2026-10-27/externos.json) como histórico automatizado, sem reabrir o QUIZ-003. A continuidade real da identidade continua sendo um aceite separado no QUIZ-019.

## 2. Conferir a referência de negócio — QUIZ-009 e QUIZ-010

O usuário indicou [a página oficial de planos](https://socio.cruzeiro.com.br/planos) em 27/10/2026. Sua leitura disponível expôs a estrutura da página; os detalhes foram conferidos nas páginas oficiais de [entrada](https://socio.cruzeiro.com.br/), [regulamento](https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso), [dúvidas](https://socio.cruzeiro.com.br/duvidas) e [Kids](https://socio.cruzeiro.com.br/kids).

A [referência documental](../tests/fixtures/official-commercial-reference.json) fixa os valores de assinatura, adesão, modalidades publicadas, benefícios de ingresso, limites de nível e Kids. Seus testes verificam o catálogo contra esses fatos. O aceite comercial vigente está no QUIZ-003.

Executar `npm run reference:evaluate -- --output CAMINHO_DO_RELATORIO.json` para registrar a regressão atual por cenário. Na rodada histórica de cinco planos: calibração 12/12 no top-1; reserva histórica 11/12 no top-1 e 12/12 no top-3, sem violação de orçamento. RES-11 continua divergente; as expectativas foram preservadas.

O usuário autorizou o agente a criar a referência do QUIZ-009. Foram criados [oito perfis e 16 cenários completos](../tests/fixtures/reference-profiles.js), com expectativas, partições distintas e [hash registrado](../tests/fixtures/reference-profiles-provenance.json). A transformação de necessidades do engine foi verificada e não exigiu alteração do cálculo nesta etapa. A referência permanece declarada como sintética, sem alegar validação externa ou cega.

**QUIZ-009 e QUIZ-010-A/010 concluídos:** os oito casos de calibração e oito de validação atingiram top-1/top-3 8/8, sem violações, mantendo o motor e as expectativas. A regressão histórica preservou os vencedores e RES-11. [Relatório dos perfis](../tickets/evidencias/010-A/perfis-final.json) e [comparação](../tickets/evidencias/010-A/comparacao.json). Os resultados permanecem sintéticos, sem alegação de precisão real.

## 3. Conferir a propriedade GA4 — QUIZ-017

Situação: o código usa `G-EF75QCTCTV`; o ID numérico da propriedade, o fluxo e a configuração do site de sócios ainda precisam ser conferidos. O usuário solicitou manter este ticket bloqueado e receber os [detalhes de configuração e aceite](../tickets/017-configuracao-e-validacao-ga4.md#detalhamento-solicitado-pelo-usuário). Não há sessão autenticada ou ferramenta GA4 conectada confirmada nesta execução.

O administrador deve conferir o que já existe antes de criar ou alterar definições. Inventário proposto para os relatórios:

| Parâmetros | Definição proposta | Escopo e uso |
| --- | --- | --- |
| `recommended_plan`, `plan`, `cta_location`, `clicked_recommended` | Dimensões | Evento; recomendação e intenção de contratar |
| `quiz_step`, `quiz_question`, `quiz_answer`, `quiz_answer_label` | Dimensões | Evento; análise das perguntas e respostas |
| `score_semantics`, `no_eligible_plan`, `catalog_version`, `rules_version` | Dimensões | Evento; interpretação e versionamento |
| `affinity_index` | Métrica | Número; afinidade estimada |
| `answer_time_sec`, `total_time_sec` | Métricas | Segundos; duração das interações |
| `compatibility` | Legado | Preservar consumidores existentes; usar `affinity_index` em novas análises |
| `answer_*` | Conferir necessidade | Respostas completas na conclusão; registrar apenas as dimensões necessárias ao produto |

O envio do parâmetro e sua disponibilidade nos relatórios são etapas distintas. [Documentação de parâmetros do Google](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters).

Definir com o produto quais eventos são principais: conclusão do quiz e clique indicam etapas do funil; o evento que comprova contratação pertence ao destino e ainda não foi identificado. Registrar também filtros internos/de desenvolvedor e a política de coleta vigente, com o responsável e a data.

### Roteiro de DebugView

1. Conferir a propriedade/fluxo, o domínio da execução e os filtros. Conclusão: o administrador identifica onde observar os eventos e como distinguir o dispositivo de validação.
2. Habilitar depuração somente no dispositivo de validação via Tag Assistant, conforme a [orientação do Google](https://support.google.com/analytics/answer/7201382?hl=pt-BR). Usar o fluxo normal; `?preview` é o cenário fictício do quiz e suprime coleta. Conclusão: o dispositivo aparece no DebugView.
3. Iniciar e concluir uma tentativa sem retornar. Esperar um `quiz_start`, 12 `quiz_answer` e um `quiz_complete`; conferir tipos, plano e versões no payload. Conclusão: os valores recebidos correspondem à tentativa.
4. Clicar em uma origem de CTA por tentativa: `resultado`, `lista`, `comparativo`. Conclusão: cada evento recebido identifica origem e plano corretos.
5. Registrar a evidência sem dados pessoais brutos e confirmar posteriormente a disponibilidade das definições nos relatórios, após processamento. Conclusão: o registro distingue recebimento de disponibilidade no relatório e informa os filtros aplicados.

As contagens pressupõem ausência de revisão/retorno: respostas reenviadas legitimamente geram novos eventos. O isolamento local dos testes não comprova recebimento no GA4.

## 4. Preparar e conferir a entrega — QUIZ-018

**Publicação realizada em 27/10/2026:** [quiz-socio.vercel.app](https://quiz-socio.vercel.app/), deployment `dpl_5aGzo4F5S9RtEUWzbGWdV9xZWoKh`, alvo `production`, estado `READY` e alias confirmados na Vercel. Foram enviados dez arquivos públicos, conferidos contra o workspace após 82/82 testes. [Registro e limites da verificação](../tickets/evidencias/deploy-2026-10-27/deploy.json) e [manifesto entregue](../tickets/evidencias/deploy-2026-10-27/release-manifest.json). A publicação direta não executou commit ou push; o Git ainda precisa ser sincronizado com o workspace. O aceite do contrato em execução e do recebimento permanece pendente.

Executar `npm run release:prepare -- --output DIRETORIO_VAZIO_FORA_DO_PROJETO`. O comando vigente copia somente o build Vite de `dist/` (HTML compilado, `assets/`, `img/` e `build-manifest.json`) para `public/`, e escreve `manifest.json` com commit, versões, hashes e lista de arquivos fora da pasta pública. O HTML-fonte e o motor legado não são entregues. Sem aceite das perdas, use `--diagnostic`; um pacote diagnóstico nunca é aprovado para produção. Arquivos de ambiente, credenciais, `.vercel`, testes e documentos internos ficam fora do candidato.

O candidato desta execução está em `/tmp/quizSocio-release-2026-10-27/public/`. O [manifesto persistido](../tickets/evidencias/execucao-2026-10-27/release-manifest.json) identifica os dez arquivos públicos e suas versões. É um candidato do workspace com alterações locais, não uma publicação concluída. Rodar o preparo novamente exige um novo diretório vazio; o comando recusa sobrescrita.

A consolidação local do QUIZ-011 foi concluída com 82/82 no workspace e 82/82 em uma cópia isolada. Domínio/projeto e acesso ao processo de entrega foram resolvidos no deploy. Para o aceite completo, conferir a execução do contrato publicado e o recebimento real definido no QUIZ-017.

Depois da entrega, executar `verify:external` contra o domínio confirmado e confrontar o manifesto com os recursos servidos. Confirmar também no DebugView: igualdade de HTML ou presença da tag não comprova ingestão.

### Retorno à versão anterior

O HTML público observado nesta execução tem SHA-256 `5d46a63533ff3c8d369886bc97b80bc834569efc6f920e1c66fd8ee475b30147`, idêntico ao `quizSocio/index.html` do commit `2cecf81`. A versão anterior usa a mesma tag `G-EF75QCTCTV` e o campo legado `compatibility`, sem as versões do contrato atual.

O deployment anterior foi identificado antes da entrega: `dpl_AqDicKu9ZniTnALtZ2hs2qgvbqYx`, URL `https://quiz-socio-lqsjwx39z-marco11.vercel.app`, correspondente ao commit `2cecf81` na Vercel. Em caso de retorno autorizado, restaurar esse deployment pelo processo do projeto, reconferir o hash e a medição correspondente e registrar o período servido.

**Critério para concluir a etapa:** domínio e versão publicados conferidos em execução, recebimento confirmado e registro de migração/retorno preenchido. O deploy foi concluído na plataforma; a execução do contrato e a medição real continuam pendentes.

## 5. Conferir continuidade no checkout — QUIZ-019

No Admin, conferir a configuração conjunta dos domínios do quiz e do checkout, incluindo eventuais intermediários de fila. Seguir a [orientação do Google sobre medição entre domínios](https://support.google.com/analytics/answer/10071811?hl=pt-BR).

Para cada origem de CTA, anotar: plano esperado, URL de saída, domínio intermediário/final, preservação da identificação e comparação da sessão nas duas pontas. Observar `_gl` quando aplicável, mas registrar apenas se houve continuidade, sem salvar o token ou cookies brutos. Interromper antes de contratação/pagamento.

Na consulta automatizada desta rodada, a navegação terminou em `fila.cruzeiro.com.br` sem alcançar a oferta. Não se infere a perda definitiva do plano ou da atribuição apenas pela URL da fila: a plataforma pode preservar estado fora da URL, exigindo conferência após o retorno.

**Conclusão da etapa:** continuidade comprovada para as três origens e identificação do evento que mede contratação no destino, ou registro específico de sua ausência. Testes locais já cobrem navegação e eventos de intenção; identidade real e redirecionamentos permanecem pendentes.
