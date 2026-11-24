# Plano de transições do quiz

Status: implementado. O texto abaixo preserva as decisões do plano. A execução vigente está em [useQuizTransitions.js](../src/composables/useQuizTransitions.js), [App.vue](../src/App.vue), [ComparisonModal.vue](../src/components/ComparisonModal.vue) e [style.css](../src/style.css), com testes de navegação, movimento reduzido, foco e rodapé em [browser.test.js](../tests/browser.test.js). Evidências: [paridade Vue](paridade-vue-original-2026-10-28.md) e [fechamento atual](../tickets/qualidade-e-entrega/README.md).

## Objetivo e decisões

Dar continuidade visual à navegação sem atrasar a resposta ao usuário. A suavidade deve vir de transições curtas, estáveis e sincronizadas com a atualização do conteúdo.

Respostas às três perguntas do plano inicial:

| Pergunta | Decisão | Motivo |
| --- | --- | --- |
| Qual duração usar nas seções? | Até **400 ms** para a troca completa entre início, quiz e resultado; até **220 ms** entre perguntas. | Preservar o ritmo de um fluxo com 12 perguntas. |
| Fade puro ou com escala? | **Fade puro no quiz**; escala sutil de **0,98 a 1 somente no modal**. | Manter perguntas e opções estáveis durante a leitura. |
| Aplicar stagger nas opções? | **Exibir todas as opções juntas.** | Permitir comparação e seleção imediatas. |

Os limites de troca incluem saída e entrada. Por exemplo, uma troca de pergunta pode usar 90 ms de saída e 130 ms de entrada, sem acrescentar uma espera entre elas.

## Escopo

Transições implementadas nos componentes Vue e no composable acima: seções principais, perguntas, confirmação de respostas, botões e modal de comparação. Preservar os textos vigentes, as respostas preenchidas, as regras do recomendador e a apresentação de valores e taxas separados.

## Etapas em ordem de execução

### 1. P1 — Sincronizar CSS e navegação

- Mapear `transitionSection()`, a troca de perguntas e a abertura/fechamento do modal, incluindo os temporizadores associados.
- Centralizar durações e easing em propriedades CSS no `:root`. Usar `ease-out` no fade e `cubic-bezier(0.22, 1, 0.36, 1)` na escala do modal.
- Reaproveitar transições CSS; criar keyframes apenas se uma sequência exigir esse recurso.
- Concluir cada fase pelo evento da propriedade e do elemento esperados. Prever cancelamento e um prazo de segurança derivado da duração efetiva, incluindo eventual delay.
- Garantir que apenas a navegação vigente atualize o DOM, libere os controles e aplique foco. Remover listeners e temporizadores ao finalizar ou cancelar.

**Critério de conclusão:** um clique aceito produz uma única troca; eventos de elementos filhos, cliques repetidos e callbacks antigos não alteram a próxima tela nem deixam o fluxo travado.

### 2. P1 — Aplicar movimento reduzido

Dependência: etapa 1.

- Consultar `prefers-reduced-motion` no CSS e no JavaScript.
- Quando a preferência estiver ativa, atualizar conteúdo, controles e foco diretamente, sem aguardar eventos de animação ou temporizadores.
- Se a preferência mudar durante uma transição, concluir o estado vigente e liberar a navegação.

**Critério de conclusão:** iniciar, avançar, voltar, confirmar, reiniciar e abrir/fechar o modal funcionam com movimento reduzido, inclusive ao ativá-lo durante uma troca.

### 3. P2 — Aplicar fade e estabilizar o layout

Dependências: etapas 1 e 2.

- Remover o deslocamento vertical das trocas de seções e perguntas, aplicando os tempos definidos na tabela de decisões.
- Fazer pergunta, ajuda e opções aparecerem como um conjunto, evitando animações sobrepostas no contêiner e nos filhos.
- Reservar o espaço do conteúdo durante a troca. Quando a altura variar, medir origem e destino, interpolar somente essa diferença e restaurar a altura automática ao terminar.
- Manter somente a tela vigente acessível ao teclado e às tecnologias assistivas. Transferir o foco ao título da nova etapa quando ela estiver disponível.
- Preservar a posição de rolagem quando o novo conteúdo estiver visível; reposicionar somente quando necessário para alcançar o início da etapa.

**Critério de conclusão:** não há colapso intermediário do cartão, sobreposição de textos ou foco em conteúdo que saiu de cena. Diferenças de altura acomodam o conteúdo sem recortes, e o rodapé acompanha a mudança de forma contínua.

### 4. P2 — Ajustar botões e modal

Dependências: etapas 1 e 2.

- Aplicar transições de aproximadamente 150 ms a fundo, borda e sombra dos botões, preservando legibilidade, dimensões e indicação de foco.
- Abrir e fechar o modal com fade de até 220 ms por operação; animar a escala do conteúdo simultaneamente.
- Colocar o foco no modal ao abrir, contê-lo enquanto estiver aberto, permitir fechar com Escape e devolvê-lo ao acionador ao fechar.
- Manter o comparativo navegável por rolagem horizontal e os controles utilizáveis em telas pequenas.

**Critério de conclusão:** hover e foco não deslocam controles; o modal abre e fecha por mouse e teclado, restaura o foco e continua legível durante a interação.

### 5. P1 — Verificar regressão e registrar evidências

Dependências: etapas 1 a 4.

- Usar a infraestrutura de testes existente em [tests/](../tests/) e os comandos definidos em [package.json](../package.json).
- Cobrir os cenários de aceite abaixo com testes de comportamento e inspeção visual. Medir os tempos configurados ou a duração efetiva com tolerância explícita, evitando testes dependentes de um instante exato da animação.
- Registrar comandos, resultados e capturas em `tickets/evidencias/interface/`. Atualizar o registro de interface do [QUIZ-011](../tickets/concluidos/011-regressao-e-entrega.md) com as evidências desta mudança.

**Critério de conclusão:** os cenários de aceite estão verificados, a suíte pertinente passa e o registro distingue os resultados executados das pendências externas do QUIZ-011.

## Cenários de aceite

- [x] Percorrer início → 12 perguntas → resultado → reinício, preservando as respostas ao voltar.
- [x] Alternar entre perguntas curtas, opções extensas e controles de faixa sem recortes ou colapso do cartão.
- [x] Validar erro de resposta ausente e confirmação de respostas incompatíveis, mantendo mensagens legíveis e foco previsível.
- [x] Repetir cliques rápidos em avançar, voltar e confirmar: nenhuma pergunta é pulada e há um único resultado.
- [x] Abrir e fechar o comparativo repetidamente, inclusive com Escape, sem perder foco ou deixar uma camada invisível bloqueando a página.
- [x] Repetir o fluxo com movimento reduzido e ativar essa preferência durante uma transição.
- [x] Inspecionar larguras de 320, 390, 768 e 1280 px: página sem overflow horizontal; rolagem do comparativo restrita à sua área.
- [x] Confirmar os limites de duração e a apresentação simultânea das opções definidos na tabela de decisões.
- [x] Confirmar que textos, preços, taxas e resultados dos cenários existentes permanecem preservados.

## Dependências e bloqueadores

O trabalho de animação pode ser implementado e verificado localmente. As dependências técnicas estão indicadas em cada etapa; não há bloqueador externo identificado para este escopo.

O encerramento desta melhoria comprova apenas as transições e sua regressão. A situação comercial e de validação do recomendador continua registrada no [backlog](../tickets/README.md).
