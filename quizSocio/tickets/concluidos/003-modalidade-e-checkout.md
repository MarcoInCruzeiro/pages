# QUIZ-003 — Alinhar modalidade de contratação e checkout

Status: Concluído

## Aceite vigente — 27/10/2026

O usuário confirmou expressamente que o QUIZ-003 já foi validado e que os preços estão corretos. Essa confirmação encerra a conferência de ofertas e substitui os bloqueios anteriores de acesso automatizado. Não é necessária nova validação de preços para este ticket.

## Descrição

Defeito original, já corrigido: o Cativo era apresentado como R$ 400/mês e seu link usava `intervalo_cobrancas=mensal`, embora o contrato fosse anual de R$ 4.800, parcelável em 12 vezes. O Meu Cruzeiro também exigia conferir a combinação de referência mensal e destino anual. A validação final foi confirmada pelo usuário em 27/10/2026.

Pontos de entrada: links dos planos, `renderResults`, `renderComparisonTable`, `onSubscribeClick` e `formatMoney` em [index.html](../../index.html).

## Escopo

Alinhar preço, prazo, parcelas e destino de contratação para os cinco planos usando as condições confirmadas no QUIZ-002. Conferir o destino real, preservando identificadores e parâmetros de atribuição compatíveis com a oferta.

## Critérios de aceite

- [x] O Cativo identifica contratação anual, valor total e parcelamento confirmado em todas as superfícies de preço.
- [x] Cada CTA abre a oferta do plano e da modalidade apresentados ao usuário, com preço correspondente. Aceite confirmado pelo usuário em 27/10/2026.
- [x] O destino do Meu Cruzeiro corresponde à modalidade e ao valor anunciados no quiz. Aceite confirmado pelo usuário em 27/10/2026.
- [x] A tabela comparativa distingue mensalidade de parcela de contrato anual.
- [x] Taxa de adesão aparece separada e não é confundida com preço anual ou parcela.
- [x] Links preservam UTMs e o evento identifica o plano clicado e o recomendado corretamente.
- [x] A conferência termina antes de qualquer contratação ou pagamento.

## Bloqueadores anteriores — resolvidos pelo aceite do usuário

- Dependência: [QUIZ-002](002-catalogo-comercial.md), para obter modalidades e preços confirmados.
- Externo e condicional: checkout indisponível ou protegido de forma que impeça conferir a oferta. O responsável pela plataforma de sócios deverá fornecer um destino verificável ou evidência da configuração comercial.
- Um parâmetro de URL presumido não resolve a confirmação do destino.

## Verificação

Abrir os cinco destinos sem concluir a compra e registrar plano, modalidade, valor e URL final sem dados pessoais. Exercitar CTA principal, cards e comparação; comparar todos com o cadastro comercial.

## Registro anterior de implementação

Verificado em 26/10/2026.

Versão verificada: commit `01f6d20`, branch local `quiz-socio/tickets-correcoes` (sem merge nem push).

**Bloqueio externo:** em 26/10/2026, `GET` direto em `https://socio.cruzeiro.com.br/assinar/checkout?plano_id=115&intervalo_cobrancas=anual…` e em `/planos` retornou **403 com desafio do Cloudflare** (“Just a moment”, `challenge-platform`). Nenhuma compra foi iniciada. Para concluir, o responsável pela plataforma de sócios precisa fornecer um destino verificável (ou acesso liberado ao checkout) ou evidência da configuração comercial dos cinco `plano_id` com intervalo anual.

**Feito:** Cativo como contratação anual de R$ 4.800 em 12x de R$ 400 em card, resultado e comparativo, com `intervalo_cobrancas=anual`; demais planos com valor mensal de referência e cobrança semestral/anual; Meu Cruzeiro com destino anual; adesão exibida separada; UTMs preservados; `quiz_subscribe_click` com `plan`, `recommended_plan`, `clicked_recommended` e `cta_location`. Conferência estrutural (`plano_id`, intervalo, valor, UTMs) contra a tabela operacional registrada em [catalogo-comercial.md](../../catalogo-comercial.md).

**Evidência:** `tests/engine.test.js` (vínculos de checkout no catálogo); `tests/browser.test.js` (“comparativo apresenta a matriz oficial, contrato anual e checkout correto”, “resultado único mantém o contrato de analytics e o CTA”).

```
npm test   # 49/49 ok em 26/10/2026 (35 unitários + 14 de navegador)
```

**Pendente:** abrir os cinco destinos e registrar plano, modalidade, valor e URL final, seguindo o roteiro do [QUIZ-011](011-regressao-e-entrega.md#roteiro-de-verificação-dos-destinos-comerciais-pendente-quiz-003). Os critérios desmarcados acima dependem dessa conferência. O QUIZ-011 também depende da avaliação independente dos QUIZ-009 e QUIZ-010.

## Reconferência desta correção — 26/10/2026

Os cinco links atuais do catálogo foram consultados por HTTP, sem login, envio de dados ou compra. Todos retornaram `403`, título `Just a moment...` e desafio do Cloudflare. A URL final permaneceu a solicitada. Também não havia navegador conectado disponível para uma conferência visual da oferta.

O [registro dos cinco destinos](../evidencias/checkouts-2026-10-26.json) contém URL solicitada, URL final, status e indicador de desafio; `ofertaConfirmada` permanece `false`. O teste local de CTA verifica o vínculo e os parâmetros, não a oferta real. O responsável pela plataforma de sócios precisa fornecer acesso de leitura à oferta ou evidência da configuração comercial para concluir os dois critérios pendentes.

## Execução das pendências locais — 27/10/2026

Executado `npm run verify:external -- --output tickets/evidencias/execucao-2026-10-27/externos.json`. O comando permanente consulta os cinco links atuais sem login, formulário ou compra. Nesta rodada, todos redirecionaram à fila e responderam **429 com desafio**, sem expor a oferta; a tentativa não foi repetida para contornar a limitação.

A página oficial indicada pelo usuário foi incorporada à [referência documental](../../tests/fixtures/official-commercial-reference.json), com teste contra o catálogo. As modalidades do regulamento e a disponibilidade operacional no checkout permanecem distintas.

[Resultado por destino](../evidencias/execucao-2026-10-27/externos.json) e [roteiro](../../docs/validacao-e-entrega.md#1-conferir-as-ofertas--quiz-003). Naquela tentativa automatizada o status ainda estava bloqueado; a confirmação posterior do usuário, registrada no aceite vigente, encerrou os dois critérios de oferta real.

## Registro de conclusão — 27/10/2026

Concluído por validação declarada pelo usuário: preços, modalidades e destinos aceitos. Os resultados HTTP anteriores são históricos e não reabrem esse aceite. Valores e URLs foram preservados. Os registros e links foram atualizados; o ticket passa para `concluidos/` conforme o README. [Registro do aceite](../evidencias/perfis-009-2026-10-27/resultado.json).
