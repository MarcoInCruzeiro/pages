# Validação e entrega do quiz

Roteiro vigente, revisado em 12/11/2026. A identidade operacional está em [revision.json](../config/revision.json); a fonte de analytics é [ga4.json](../config/ga4/ga4.json). A revisão atual usa catálogo `2026-10-28.2`, regras `2026-11-12.2` (ingresso gratuito por temporada sensível ao volume de jogos, capacidade de ingressos só com uso presencial, [calibração](calibracao-pesos-2026-11-12.md); antes, percentual de desconto na utilidade do ingresso, [melhoria](melhoria-ranking-desconto-2026-11-10.md), e novos textos das perguntas com respostas de três níveis na Q8 e na Q10, [atualização](atualizacao-perguntas-2026-11-10.md)) e GA4 `2026-11-03.1`.

A interface local é Vue 3 + Vite. O preço filtra orçamento; afinidade e desempate seguem a [ADR-0003](adr/0003-orcamento-sem-prioridade-de-preco.md). Assinatura, adesão, Kids e ingressos seguem a apresentação separada da [ADR-0001](adr/0001-valores-e-taxas-separados.md).

## 1. Conferir as ofertas — QUIZ-003

O aceite comercial foi confirmado pelo usuário em 27/10/2026 e está no [QUIZ-003](../tickets/concluidos/003-modalidade-e-checkout.md). Valores e destinos operacionais permanecem no [catálogo JSON](../config/planos/catalogo.json), com fonte e limites no [catálogo documental](../catalogo-comercial.md).

`npm run verify:external -- --output RELATORIO.json` continua útil para observar respostas HTTP e redirecionamentos dos destinos. Uma fila ou desafio não anula o aceite comercial anterior nem comprova perda de parâmetros. A continuidade real até a contratação pertence ao QUIZ-019.

## 2. Conferir a referência de negócio — QUIZ-009 e QUIZ-010

As regras `2026-11-03.2` atendem às expectativas congeladas: histórico 12/12 no primeiro lugar tanto na calibração quanto na reserva; perfis 8/8 na calibração e 8/8 na validação. São 40/40 cenários sintéticos com primeiro lugar aceitável, sem regressões ou violações de orçamento. RES-11 também foi corrigido. [Correção e evidências](correcao-ranking-sem-preco-2026-11-03.md).

```sh
npm run reference:evaluate -- --enforce --output HISTORICO.json
npm run reference:evaluate -- --reference profiles --enforce --output PERFIS.json
```

O usuário rejeitou aceitar os quatro resultados anteriores; a solução foi corrigir o motor. Não há arquivo de aceite de perdas. As métricas são sintéticas e não comprovam satisfação, precisão com usuários reais ou contratação.

## 3. Conferir a propriedade GA4 — QUIZ-017

O ticket está **em andamento**, por solicitação de retomada em 03/11. O ID numérico da propriedade e o fluxo correspondente a `G-EF75QCTCTV` ainda precisam de conferência. O [inventário vigente](execucao-ga4-017-2026-11-03.md) lista os campos a registrar e o [mapa de migração](migracao-ga4-portugues.md) relaciona o contrato inglês ao português.

Antes de alterar o Admin, conferir as definições existentes, filtros, eventos principais e consumidores. A conclusão usa `quiz_concluido`, com `versao_das_regras`, `versao_do_catalogo`, `indice_de_afinidade`, `compatibilidade` e as respostas traduzidas. O antigo `compatibility` não é enviado; relatórios e integrações que o usam precisam de adaptação. A configuração de eventos principais e o evento de contratação efetiva no destino continuam pendentes de decisão/conferência.

### Roteiro de DebugView

1. Identificar propriedade, fluxo, domínio e filtros, registrando a versão realmente servida.
2. Habilitar depuração apenas no dispositivo de validação pelo Tag Assistant. `?preview` e `#preview` são demonstração fictícia e suprimem coleta. [Orientação do Google](https://support.google.com/analytics/answer/7201382?hl=pt-BR).
3. Percorrer uma tentativa sem retorno/revisão: esperar um `inicio_do_quiz`, 12 `resposta_do_quiz` e um `quiz_concluido`; conferir os nomes, tipos, versões e plano recebidos. Revisões legítimas podem gerar respostas adicionais.
4. Em tentativas separadas, conferir `clique_de_assinatura` com `local_do_cta` igual a `resultado`, `lista`, `comparativo` e `alternativa-setor`, quando houver alternativa elegível.
5. Registrar o recebimento e depois consultar os relatórios/explorações, considerando o processamento das definições. Confirmar a adaptação dos consumidores do contrato anterior.

A captura local e a presença da tag não comprovam recebimento na propriedade. O acesso externo não foi reconferido nesta correção documental; o último diagnóstico disponível é de 03/11.

## 4. Preparar e conferir a entrega — QUIZ-018

O ticket está **em andamento**. A observação HTTP de 03/11 identificou produção estática com regras `2026-10-26.2`; a revisão Vue ainda depende do processo de entrega. O [registro atual do QUIZ-018](execucao-ga4-018-2026-11-03.md) identifica o pacote de 04/11 com GA4 `2026-11-03.1`, os hashes e o contrato isolado. O pacote anterior de GA4 `2026-10-28.3` é histórico e foi superado.

Depois de editar a configuração, usar o fluxo de revisão do projeto: atualizar validadores quando schemas mudarem, preparar a revisão explicitamente, avaliar e compilar. Com a revisão já preparada:

```sh
npm run build
npm run release:prepare -- --output DIRETORIO_VAZIO_FORA_DO_PROJETO
node scripts/verify-package-contract.cjs DIRETORIO_DO_PACOTE CONTRATO.json
node scripts/verify-published-build.mjs --package DIRETORIO_DO_PACOTE --public-url https://quiz-socio.vercel.app/ --output PUBLICACAO.json
```

O preparo copia somente os arquivos compilados de `dist/` para `public/` e escreve `manifest.json` com versões, commit, hashes e indicação de alterações locais. Recusa diretório preenchido e build desatualizado. `--diagnostic` permite revisão local de uma configuração ainda não aprovada; seu pacote sempre declara `releaseApproved: false`.

Um gate de ranking aprovado não comprova candidato com árvore limpa, CI, publicação ou recebimento. A fase de entrega exige esses critérios próprios e verificação dos demais achados de produção. O pacote de 04/11 ainda declara `workingTreeHasChanges: true`.

O verificador público compara os hashes dos arquivos compilados; sai com 2 se o domínio divergir. A comparação de HTML público com o `index.html` fonte do diagnóstico legado não identifica um build Vite. Após a entrega, repetir a comparação e exercitar o contrato público com a coleta controlada, seguido da conferência no DebugView pelo QUIZ-017.

### Retorno à versão anterior

Antes da nova entrega, conferir na Vercel qual deployment está associado ao domínio e registrar ID/URL como alvo de rollback. Os IDs dos registros de outubro são históricos. Confirmar a revisão a restaurar antes de uma ação específica de rollback; não reutilizar automaticamente o alvo anterior à entrega de 27/10.

Registrar a data/hora efetiva da publicação e do primeiro evento recebido com o contrato português, junto às versões do manifesto. Essa migração pública ainda não foi comprovada. Separar análises pelas versões e pelo contrato de eventos, conforme o mapa de migração.

## 5. Conferir continuidade no checkout — QUIZ-019

Executar uma matriz para as quatro origens `resultado`, `lista`, `comparativo` e `alternativa-setor` quando disponível. Registrar plano, URL de saída, domínio intermediário/final e se a identidade/sessão permanece coerente, interrompendo antes de contratar ou pagar. Não persistir cookies, tokens ou valores brutos de `_gl` nas evidências. [Ticket e critérios](../tickets/019-continuidade-ate-checkout-ga4.md).

Conferir a configuração de domínios e a tag nas duas pontas; UTMs e o mesmo ID em um comentário não comprovam continuidade. [Medição entre domínios](https://support.google.com/analytics/answer/10071811?hl=pt-BR). A passagem pela fila e o evento que comprova contratação efetiva ainda requerem observação no destino.

## Histórico

O [roteiro preservado até 03/11](history/validacao-e-entrega-ate-2026-11-03.md) contém os registros de publicação de outubro, os bloqueios anteriores e as evidências daquela revisão. A [correção documental de 04/11](correcao-documentacao-2026-11-04.md) registra as verificações atuais. Os status correntes ficam no [índice de tickets](../tickets/README.md).
