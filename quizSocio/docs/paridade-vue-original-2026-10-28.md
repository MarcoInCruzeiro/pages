# Correções da interface Vue com base na versão publicada

Referência solicitada: [quiz-socio.vercel.app](https://quiz-socio.vercel.app/), obtida em 28/10/2026 por GET do HTML e do motor. O HTML tinha 120.728 bytes, SHA-256 `5460bce5a118c77c543244d7b94407482af0382dc43b11c1de4f1be513482d02`. A comparação usou uma cópia local dessa referência, preservando seu HTML, CSS e JavaScript.

A base Git da migração é `8250641`, comparada ao commit `3d0d1cc` e às alterações locais. Os dois eixos da revisão foram executados separadamente. A correção trata apresentação e interação; os quatro planos ativos e a configuração do cálculo permanecem como aprovados na migração.

## Standards

1. [QuizQuestion.vue](../src/components/QuizQuestion.vue): o título da opção usava um `span` secundário, contrariando a hierarquia original e a ADR-0002. **Corrigido:** título em `strong`, azul principal, peso e espaçamento originais; descrição na linha seguinte.
2. [style.css](../src/style.css): o novo contêiner Vue interrompia o layout flex do documento. **Corrigido:** a aplicação assume a organização vertical original; a abertura ocupa o espaço disponível e o rodapé deixa de flutuar acima do fim da tela no desktop.
3. [ComparisonModal.vue](../src/components/ComparisonModal.vue): células distintas tinham sido reduzidas a texto uniforme. **Corrigido:** preço destacado, total separado, quebras entre benefício/setores, indicadores coloridos e estado discreto para plano acima do orçamento. Cabeçalhos mantêm hierarquia acessível com dimensões equivalentes às originais.
4. [App.vue](../src/App.vue): trocar telas com foco sem rolagem perdia o reposicionamento original. **Corrigido:** resultado entra na região visível; refazer volta ao topo e devolve foco ao início, respeitando redução de movimento.

Standards: quatro achados corrigidos; maior impacto neste eixo: estrutura dos controles e layout vertical quebrados.

## Spec

A [spec](spec-port-vue.md) exige preservar textos, identidade visual, responsividade, navegação e foco. A versão publicada confirmou seis desvios:

1. Título e descrição das opções tinham perdido a separação visual. Restaurados, sem reescrever as perguntas.
2. O comparativo havia perdido preço em destaque, total em linha própria e símbolos de disponibilidade. Restaurados com células declarativas, sem HTML executável em configuração.
3. O aviso de plano acima do orçamento recebia o mesmo tratamento visual do recomendado. Restaurado o badge discreto original.
4. Marcar histórico desconhecido apagava a quantidade anterior do slider. Agora o controle conserva o valor e o recupera ao desmarcar.
5. Concluir e refazer não reposicionavam a leitura como no original. Restaurados rolagem e foco.
6. A troca entre perguntas era instantânea e usava apenas uma animação genérica na entrada da seção. Restaurados fades de saída/entrada e estabilização de altura; animações são canceladas na desmontagem e suprimidas com movimento reduzido.

Também foi recuperado o singular “ponto” nos cards quando a diferença é exatamente um ponto. Nenhum desses ajustes altera pesos, preços, elegibilidade ou desempate.

Spec: seis desvios corrigidos; maior impacto neste eixo: opções tinham perdido a apresentação principal/secundária da referência.

## Verificação

`npm test` executou validação, build e regressão completa: **125 testes aprovados, zero falhas**, incluindo 37 de navegador. [Log](../tickets/evidencias/interface-vue-2026-10-28/npm-test.log).

Foram adicionados cinco cenários permanentes: posição do rodapé na abertura, hierarquia das opções, preservação do slider ao alternar desconhecido, formatação/avisos do comparativo e rolagem ao concluir/refazer. A regressão existente mantém clique duplo, retorno rápido, coleta GA4, teclado, foco, modal, responsividade e contratação interceptada.

A comparação controlada em Chrome usou viewports de 1280 × 900 e 390 × 844, com os mesmos recursos externos bloqueados pelo harness e fonte de fallback. Movimento reduzido e vídeo parado estabilizaram as capturas; a suíte funcional também exercitou a navegação com movimento normal. Isso não representa comparação de todos os frames de animação ou de todas as combinações possíveis de respostas.

| Conferência | Antes | Depois |
| --- | --- | --- |
| Abertura desktop, topo do rodapé | 551 px | 664 px, igual à referência no viewport de 900 px |
| Título da opção | Texto secundário de 15,2 px, na linha da descrição | Texto principal de 16,8 px, em bloco, como na referência |
| Captura da pergunta de opções, desktop e celular | Divergente | Idêntica byte a byte à referência nos dois viewports controlados |
| Preço em destaque no comparativo | Ausente | Presente nos quatro planos, com total separado |
| Indicadores dos benefícios | Texto uniforme | Classes e cores originais restauradas |
| Dados de cálculo | Quatro planos configurados | Preservados, sem mudanças |

[Identificação da referência e resultados da comparação](../tickets/evidencias/interface-vue-2026-10-28/verification.json), [métricas anteriores](../tickets/evidencias/interface-vue-2026-10-28/metrics-before.json) e [métricas finais](../tickets/evidencias/interface-vue-2026-10-28/metrics-final.json).

### Capturas para conferência

| Estado | Antes | Depois |
| --- | --- | --- |
| Abertura desktop | [Captura](../tickets/evidencias/interface-vue-2026-10-28/before-vue-1280-hero.png) | [Captura](../tickets/evidencias/interface-vue-2026-10-28/final-vue-1280-hero.png) |
| Opções desktop | [Captura](../tickets/evidencias/interface-vue-2026-10-28/before-vue-1280-question.png) | [Captura](../tickets/evidencias/interface-vue-2026-10-28/final-vue-1280-question.png) |
| Opções no celular | [Captura](../tickets/evidencias/interface-vue-2026-10-28/before-vue-390-question.png) | [Captura](../tickets/evidencias/interface-vue-2026-10-28/final-vue-390-question.png) |
| Comparativo desktop | [Captura](../tickets/evidencias/interface-vue-2026-10-28/before-vue-1280-modal.png) | [Captura](../tickets/evidencias/interface-vue-2026-10-28/final-vue-1280-modal.png) |

As capturas da pergunta original também foram preservadas para [desktop](../tickets/evidencias/interface-vue-2026-10-28/reference-1280-question.png) e [celular](../tickets/evidencias/interface-vue-2026-10-28/reference-390-question.png). O comparativo conserva quatro planos e pode destacar um resultado diferente da referência de cinco planos; isso pertence à decisão comercial/matemática anterior, não a esta correção visual.

Não houve deploy. Permanecem os bloqueios de liberação por regressões de ranking e dos QUIZ-017, 018 e 019.

Standards: quatro achados (maior impacto: hierarquia e layout); Spec: seis achados (maior impacto: apresentação das opções).

## Pedido posterior: posição estável do rodapé

O pedido posterior de reservar a maior altura das perguntas substitui o critério de posicionar o rodapé da abertura exatamente como na referência. A implementação e as verificações desse comportamento estão nas [evidências do rodapé estável](../tickets/evidencias/rodape-estavel-2026-10-28/README.md). Os resultados e capturas acima descrevem a etapa anterior.
