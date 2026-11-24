# Correção da pergunta Kids e da apresentação dos preços

Em 28/10/2026, a continuação da tarefa confirmou a pergunta binária sobre interesse em incluir uma criança e a retirada do valor anual da interface. A branch utilizada é `quiz/port-vue`.

## Comportamento final

- A pergunta oferece Não (`0`) e Sim (`1`). Voltar preserva a escolha; os eventos registram esses valores e os rótulos correspondentes. Respostas `2`, `3`, booleanas ou strings não são aceitas pelo questionário.
- O perfil mantém a compatibilidade anterior de `true` como uma criança e os limites defensivos para chamadas diretas do motor. Isso não amplia os valores válidos da interface.
- Resultado, cards e comparativo mostram o valor mensal de referência, sem total anual ou parcelas. A referência mensal é indicada uma vez em cada apresentação, sem textos duplicados.
- Os dados comerciais e a modalidade real de checkout permanecem no catálogo. Assinatura, adesão, Kids e exemplos de ingresso continuam separados, conforme ADR-0001.
- O rodapé continua usando a maior altura das perguntas mais o padding; o resultado usa altura natural.

## Referências e rastreabilidade

As referências ativas foram migradas explicitamente: quantidades positivas de Kids passaram a `1`; nomes, descrições e necessidades acompanharam a pergunta. IDs, partições e listas de planos aceitáveis foram preservados. Nenhuma expectativa foi redefinida a partir dos resultados do recomendador.

As versões anteriores das referências e suas identidades estão em [history/before-binary-kids](../tests/fixtures/history/before-binary-kids/). As novas identidades e o motivo da revisão estão na [proveniência dos quatro planos](../tests/fixtures/four-plans/provenance.json) e na [proveniência dos perfis](../tests/fixtures/reference-profiles-provenance.json). Um teste verifica os hashes históricos e a preservação das expectativas e partições.

`config:check` inicialmente detectou que os hashes manuais da revisão divergiam da configuração real. A identidade foi preparada pelo comando oficial `npm run config:prepare -- --diagnostic`, sem aprovação de publicação. A revisão resultante está em [config/revision.json](../config/revision.json), com regras `2026-10-28.4`.

O commit também inclui dependências da correção anterior da migração que ainda estavam somente no workspace: adaptador Node para o núcleo ESM, scripts de configuração/build/avaliação, fixtures e componentes compartilhados de layout. O painel administrativo continua adiado.

## Verificação

`npm test` executado no projeto real: validação da configuração, build Vite e **131 testes aprovados, zero falhas**. São 91 testes sem navegador e 40 de navegador, incluindo Sim/Não, retorno à pergunta, eventos, preços, comparativo, rodapé, teclado, contratação interceptada e isolamento GA4. [Log integral](../tickets/evidencias/kids-precos-2026-10-28/npm-test.log).

O preparo da configuração continua apontando `releaseApproved: false`, com as regressões `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`. [Saída do preparo](../tickets/evidencias/kids-precos-2026-10-28/config-prepare.log). A aprovação técnica dos testes não aceita essas regressões nem desbloqueia QUIZ-017, 018 ou 019. Não houve deploy.
