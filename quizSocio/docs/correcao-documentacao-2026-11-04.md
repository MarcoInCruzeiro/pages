# Correção da documentação e dos procedimentos de validação

Executada em 04/11/2026 a partir da revisão de consistência solicitada pelo usuário. As fontes vigentes foram conferidas contra o código, os JSONs e as decisões desta conversa. A implementação de recomendação e o contrato GA4 já existente foram preservados; o ajuste executável é um validador de pacote que entende o contrato atual.

## Regras e fontes vigentes

| Tema | Correção |
| --- | --- |
| Papel do preço | A ADR-0001 foi parcialmente substituída pela [ADR-0003](adr/0003-orcamento-sem-prioridade-de-preco.md): orçamento filtra, preço não pontua nem desempata. A spec deixou de exigir normalização financeira |
| Contrato GA4 | O [mapa de migração](migracao-ga4-portugues.md) registra eventos, parâmetros, respostas, valores sentinela e consumidores que precisam de adaptação |
| Compatibilidade | `compatibilidade` duplica `indice_de_afinidade`; o campo inglês `compatibility` não é enviado. Foram removidas as promessas de compatibilidade por nome com consumidores anteriores |
| Arquitetura | `estrutura_quiz.md` aponta para App.vue e componentes, main.js e analytics.mjs; o head começa com coleta desligada e a decisão ocorre no bootstrap configurado |
| Métricas | A documentação ativa registra 40/40 referências sintéticas e RES-11 corrigido, mantendo métricas e hashes anteriores como evidências datadas |
| CTAs | O roteiro e o QUIZ-019 incluem `resultado`, `lista`, `comparativo` e `alternativa-setor` quando disponível |
| Estados e entrega | 017/018 em andamento; 019 bloqueado externamente. A conclusão técnica dos tickets Vue/06–08 foi registrada com evidência atual. Qualidade/08 e 09 continuam pendentes de candidato com árvore limpa, CI e publicação |

As fontes operacionais continuam sendo os JSONs e [revision.json](../config/revision.json). O índice de tickets e o roteiro de entrega foram consolidados; as versões anteriores desses textos foram preservadas como [histórico do índice](../tickets/history/README-ate-2026-11-03.md) e [histórico do roteiro](history/validacao-e-entrega-ate-2026-11-03.md).

## Pacote e contrato do QUIZ-018

O pacote anterior de 03/11 usava GA4 `2026-10-28.3`. Ele permanece como evidência histórica, mas não identifica a revisão atual. Foi preparado um pacote de revisão de 04/11 com:

- Catálogo `2026-10-28.2`, regras `2026-11-03.2`, GA4 `2026-11-03.1`.
- Hash agregado `3fca088a0572f28d19df8287caa05527180717404397b999784b93448da54813`.
- 12 arquivos compilados, todos conferidos por SHA-256 quando servidos isoladamente.
- `workingTreeHasChanges: true`: o pacote ainda representa alterações locais. O gate de ranking aprovado não conclui o candidato com árvore limpa nem os aceites externos.

O novo [verify-package-contract.cjs](../scripts/verify-package-contract.cjs) recusa pacotes de outra revisão e percorre as 12 perguntas no pacote atual. Confere nomes de eventos resolvidos pela configuração, respostas e campos traduzidos, versões, índice, duplicata de compatibilidade e CTA. O script original de 03/11 foi preservado para a evidência daquela revisão. [Manifesto e execução atuais](execucao-ga4-018-2026-11-03.md).

A recusa da revisão GA4 antiga também foi executada com um manifesto histórico em diretório temporário: o validador rejeitou o pacote antes de abrir o navegador, pedindo um pacote da revisão atual.

## Verificação executada

| Verificação | Resultado |
| --- | --- |
| `npm test`, incluindo build, configuração, motor, referências, ferramentas e navegador | **161 testes aprovados, zero falhas e zero ignorados**, aproximadamente 102 segundos. [Log](evidencias/correcao-documentacao-2026-11-04/npm-test.log) |
| Avaliação das referências congeladas | **40/40 primeiros lugares aceitáveis**, zero regressões, zero violações. [Qualidade da configuração atual](evidencias/correcao-documentacao-2026-11-04/qualidade.json) |
| Seleção de testes GA4/resultado/CTAs | **17 testes aprovados**. [Log](../tickets/evidencias/017/2026-11-04/testes-analytics.log) |
| Comparação do pacote isolado com seu manifesto | **12/12 hashes coincidentes**. [Relatório](../tickets/evidencias/018/2026-11-04/comparacao-isolada.json) |
| Validação do contrato no pacote atual | Um `inicio_do_quiz`, 12 `resposta_do_quiz` e um `quiz_concluido`, com 20 parâmetros e 12 respostas traduzidas, sem erros de execução ou tentativas de coleta GA4. [Relatório](../tickets/evidencias/018/2026-11-04/contrato-isolado.json) |
| Consistência documental | Destinos dos links e âncoras locais conferidos nos **73 documentos Markdown**; `git diff --check` sem erros |

A captura no navegador é local, com `gtag` substituído e destinos reais bloqueados. Os resultados não comprovam recebimento no GA4. Nenhuma nova observação do domínio público, alteração no Admin, commit, merge ou deploy foi realizada nesta correção.

Os próximos critérios continuam nos tickets: propriedade/fluxo e consumidores no QUIZ-017, publicação e contrato recebido no QUIZ-018, identidade/atribuição no QUIZ-019 e candidato com árvore limpa/CI na fase de entrega.
