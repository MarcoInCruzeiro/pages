# Rodapé estável durante o questionário

Pedido de 2026-10-28: reservar a altura máxima possível do card de pergunta mais o padding vertical, mantendo o rodapé abaixo dessa área. Após finalizar, a altura acompanha o resultado. Ao refazer, a reserva é restaurada.

O componente compartilhado `QuizCard.vue` é usado tanto na tela quanto na medição temporária das 12 perguntas. A medição considera mensagens de validação e o estado desconhecido do histórico. Os elementos temporários ficam invisíveis, inertes, fora da árvore de acessibilidade e são removidos ao terminar a medição. `ResizeObserver` e os eventos de carregamento de fontes atualizam a reserva. O rodapé permanece no fluxo normal da página.

## Evidência de geometria

Chrome local, fonte de fallback e recursos externos interceptados pelo harness. As capturas verificam o layout local; ícones externos indisponíveis não fazem parte desta alteração.

| Viewport | Altura reservada no main, incluindo padding | Topo do rodapé nas 12 perguntas |
| --- | --- | --- |
| 1280 × 900 | 815 px | 916 px em todas |
| 390 × 844 | 947 px | 1048 px em todas |

[Métricas por pergunta](metrics.json). Capturas da pergunta curta e da pergunta de orçamento: [desktop, pergunta 1](1280-pergunta-1.png), [desktop, pergunta 11](1280-pergunta-11.png), [celular, pergunta 1](390-pergunta-1.png), [celular, pergunta 11](390-pergunta-11.png).

Os testes permanentes verificam a estabilidade durante as 12 perguntas em desktop/celular, a expansão natural do resultado, o retorno à abertura e o recálculo ao redimensionar durante o questionário. Conferências de geometria aguardam a renderização do navegador e a atualização do `ResizeObserver`.

## Configuração usada na validação

Durante a execução, `config/questoes/questoes.json` recebeu uma edição independente: `kidsCount` passou de quatro quantidades numéricas para duas opções booleanas. A validação atual rejeita essa alteração: `Configuração inválida [questoes] kidsCount: tipo e valores semânticos das opções precisam ser preservados`. [Saída no projeto atual](config-current.log).

A edição foi preservada. Para validar o rodapé, a suíte foi executada em cópia temporária do código atual com apenas esse JSON obtido do HEAD válido. As métricas e capturas também usam essa configuração anterior. Isso não comprova funcionamento da configuração booleana editada. Nenhum deploy foi realizado.

## Resultado dos testes

`npm test` na cópia isolada: **126 de 127 testes aprovados, incluindo os 39 de navegador**. A única falha foi no empacotamento, pois a cópia temporária não continha metadados Git e `git rev-parse HEAD` falhou. Após carregar nessa cópia os metadados do HEAD original, `node --test tests/verification.test.mjs` aprovou os seis testes desse arquivo, incluindo o teste que havia falhado. O código não foi alterado entre essas duas execuções; não houve nova execução integral após ajustar o ambiente da cópia.

[Log integral](npm-test-isolated.log), [reexecução do arquivo de verificação](verification-rerun.log) e [identificação dos arquivos verificados](verification.json). `git diff --check` também passou no workspace.
