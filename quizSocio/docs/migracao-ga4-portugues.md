# Contrato GA4 em português

Contrato implementado localmente na revisão GA4 `2026-11-03.1`, conferido em 04/11/2026. Fonte operacional: [ga4.json](../config/ga4/ga4.json); identidade de conteúdo: [revision.json](../config/revision.json). A tag continua `G-EF75QCTCTV`.

Este registro descreve a alteração encontrada no código. A implantação em produção, o inventário de consumidores e o recebimento no GA4 continuam pendentes dos QUIZ-017 e 018. A data de revisão local não é a data de início da coleta pública.

## Eventos

| Contrato anterior | Contrato local atual | Significado |
| --- | --- | --- |
| `quiz_start` | `inicio_do_quiz` | Início de uma tentativa |
| `quiz_answer` | `resposta_do_quiz` | Resposta aceita ao avançar; revisão pode gerar reenvio legítimo |
| `quiz_complete` | `quiz_concluido` | Resultado gerado; não comprova contratação |
| `quiz_subscribe_click` | `clique_de_assinatura` | Intenção de contratar pelo link |

As identidades `chave` e os nomes enviados `nome` da configuração atual usam os valores em português. O despachante resolve o nome enviado pela chave configurada.

## Parâmetros

| Nome anterior | Nome atual | Tipo |
| --- | --- | --- |
| `quiz_step` | `etapa_do_quiz` | Número |
| `quiz_question` | `pergunta_do_quiz` | String; conserva a chave interna da pergunta, como `gamesPerYear` |
| `quiz_answer` | `valor_da_resposta` | String com o valor tipado convertido em texto |
| `quiz_answer_label` | `rotulo_da_resposta` | String com o texto apresentado |
| `answer_time_sec` | `tempo_de_resposta_seg` | Número, segundos |
| `recommended_plan` | `plano_recomendado` | String; ausência de elegível é `nenhum` (antes, `none`) |
| `affinity_index` | `indice_de_afinidade` | Número ou nulo |
| `compatibility` | `compatibilidade` | Número ou nulo, igual ao índice no contrato atual |
| `score_semantics` | `semantica_do_score` | String; valor `indice_afinidade_estimado` |
| `no_eligible_plan` | `sem_plano_elegivel` | Booleano |
| `catalog_version` | `versao_do_catalogo` | String |
| `rules_version` | `versao_das_regras` | String |
| `total_time_sec` | `tempo_total_seg` | Número, segundos |
| `plan` | `plano` | String |
| `clicked_recommended` | `clicou_no_recomendado` | String `true` ou `false` |
| `cta_location` | `local_do_cta` | `resultado`, `lista`, `comparativo` ou `alternativa-setor` quando disponível |

O campo `compatibilidade` duplica o valor de `indice_de_afinidade` no payload atual. O nome inglês `compatibility` deixou de ser enviado; consumidores que dependem desse nome precisam de adaptação. A migração não oferece envio simultâneo dos contratos inglês e português.

## Respostas na conclusão

O evento `quiz_concluido` contém oito parâmetros gerais e 12 respostas, totalizando o teto interno de 20 parâmetros. Os nomes das respostas são formados pelo mapa `respostas` da configuração:

| Nome anterior | Nome atual |
| --- | --- |
| `answer_gamesPerYear` | `resposta_jogos_por_ano` |
| `answer_gamesHistory` | `resposta_historico_de_jogos` |
| `answer_wantsGuaranteedTicket` | `resposta_quer_ingresso_garantido` |
| `answer_buysTwoTickets` | `resposta_compra_dois_ingressos` |
| `answer_kidsCount` | `resposta_quantidade_de_criancas` |
| `answer_needsPriority` | `resposta_precisa_de_prioridade` |
| `answer_wantsParticipation` | `resposta_quer_participacao` |
| `answer_wantsStoreDiscount` | `resposta_quer_desconto_na_loja` |
| `answer_gameFrequency` | `resposta_frequencia_de_jogos` |
| `answer_digitalExperience` | `resposta_experiencia_digital` |
| `answer_budget` | `resposta_orcamento` |
| `answer_preferredSector` | `resposta_setor_preferido` |

## Aplicação nos consumidores

O inventário do QUIZ-017 deve registrar quais relatórios, definições, filtros, eventos principais e integrações usam os nomes antigos. Aplicar o mapa acima aos consumidores escolhidos pelo responsável, conferir os nomes realmente recebidos e registrar a data efetiva da migração. A disponibilidade do contrato atual em código não comprova ajustes na propriedade nem autoriza declarar esses critérios concluídos.

Preservar definições e evidências históricas identificadas pelo contrato anterior. Comparações entre períodos precisam explicitar o mapeamento dos nomes e as versões das regras; a afinidade continua sendo um índice do modelo, sem interpretação de probabilidade de acerto. O [roteiro vigente do QUIZ-017](execucao-ga4-017-2026-11-03.md) usa os nomes atuais.
