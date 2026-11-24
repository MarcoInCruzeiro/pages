# Diagnóstico local de desempenho — 2026-10-28

Área de diagnóstico. Nenhum arquivo da aplicação foi alterado, nenhum deploy foi feito e nenhuma validação foi removida do produto. Os protótipos ficam aqui identificados como diagnóstico; não são testes de CI nem correções prontas.

## Ambiente e sinal

Chrome headless pelo harness CDP do projeto (GPU desativada pelo harness, fontes externas e analytics interceptados). Viewport 1280 × 900. Servidor Vue existente em http://127.0.0.1:5173; comparação com dist servido em loopback. CPU normal e emulação de CPU 6× mais lenta, sem limitação de rede. Não representa o navegador gráfico real do usuário, sua GPU, fontes, extensões ou disputa por recursos.

O loop observa apresentação do vídeo (requestVideoFrameCallback e getVideoPlaybackQuality), intervalos de requestAnimationFrame e long tasks. Sinal vermelho: perda de vídeo >5%, intervalo de vídeo >250 ms, intervalo de UI >150 ms, tarefa JS >150 ms ou ausência de quadros. A decisão do processo exige falha em pelo menos metade das amostras. São limites operacionais deste diagnóstico; não foram apresentados como SLA ou teste determinístico de CI.

## Reproduções e minimização

```sh
node .scratch/perf/video-ui.cjs
PERF_URL=http://127.0.0.1:5173 PERF_LABEL=dev node .scratch/perf/video-ui.cjs
PERF_URL=http://127.0.0.1:5173 PERF_LABEL=dev-loop PERF_LOOP=1 node .scratch/perf/video-ui.cjs
PERF_URL=http://127.0.0.1:5173 PERF_LABEL=dev-open PERF_OPEN=1 PERF_CPU=6 node .scratch/perf/video-ui.cjs
```

Build e desenvolvimento com CPU normal: três amostras por cenário sem pausas longas reproduzidas durante oito perguntas. Na versão dev, perda de vídeo zero e maior intervalo de apresentação ~66,8 ms. UI com p95 ~16,7–16,8 ms. Três amostras atravessando o fim do vídeo também sem pausa longa; duração do arquivo 60,75 s. Os eventos waiting nas amostras de loop incluem a busca deliberada para perto do fim e não indicam, sozinhos, travamento.

CPU 6× e somente abertura, sem iniciar o quiz: três falhas, tarefas de **615, 286 e 298 ms**. Assim, a reprodução mínima do atraso da abertura é carregar a página nessa emulação; não depende de respostas ou navegação. Isso reproduz um gargalo de abertura sob carga controlada, não confirma a travada de vídeo relatada no computador do usuário.

## Hipóteses e isolamento

As três hipóteses foram apresentadas antes dos testes: inicialização/compilação dos validadores JSON; medição síncrona dos cards; vídeo. Cada variação altera só um fator, em respostas de rede interceptadas exclusivamente no navegador de diagnóstico.

```sh
node .scratch/perf/profile-startup.cjs
node .scratch/perf/variants.cjs
```

| Variação, CPU 6× | Maior tarefa, três execuções (ms) | Mediana (ms) | Acima de 150 ms |
| --- | --- | --- | --- |
| Código atual | 563, 289, 275 | 289 | 3/3 |
| Sem carregar/compilar Ajv e schemas no probe | 113, 90, 206 | 113 | 1/3 |
| Sem executar medição dos cards no probe | 202, 251, 258 | 251 | 3/3 |
| Vídeo bloqueado no probe | 239, 315, 396 | 315 | 3/3 |

Remover a carga/compilação dos validadores no probe reduziu em ~61% a mediana do maior bloqueio. A medição dos cards teve contribuição menor nesse isolamento (~13%). Bloquear o vídeo não melhorou consistentemente o atraso de abertura. O profile confirmou trabalho em Ajv/compilação e em `measure` de useQuestionSpace. Os resultados não medem cada custo isoladamente com precisão de laboratório, e as três execuções não constituem garantia estatística.

No código, `config/adapter.js` importa Ajv e compila cinco validadores durante a importação; `useQuestionSpace.js` renderiza e mede os estados das 12 perguntas ao montar e pode medir novamente após fontes. Esses mecanismos são explicações sustentadas para o gargalo de abertura sob CPU limitada. Não há evidência aqui de que bloqueiem continuamente após a abertura.

O vídeo tem 36.348.058 bytes, 1080 × 1920 e 60,75 s. Essas características foram observadas; não provam causa das travadas. A composição gráfica e aceleração de vídeo do navegador real permanecem sem diagnóstico, pois o harness é headless e desativa GPU.

## Encaminhamento e limites

Priorizar validadores pré-compilados no build mantendo a mesma validação e as proteções de configuração. O Ajv documenta essa opção em [Standalone validation code](https://ajv.js.org/standalone.html), que evita inicializar/compilar Ajv no navegador. Depois, reduzir/reaproveitar as medições dos cards preservando a altura máxima e o rodapé estável.

A solicitação desta etapa foi diagnóstico, portanto não houve correção aplicada nem teste de regressão funcional novo (fase de correção não iniciada). Não foi declarada resolução da travada original. A identificação do navegador e do momento exato da travada está pendente; para confirmar o vídeo será necessário reproduzir nesse ambiente ou obter um trace Performance redigido, sem dados pessoais ou credenciais.

A instrumentação existiu somente nos processos de diagnóstico, encerrados ao fim. Os probes deliberadamente ignoram schemas ou medições em respostas interceptadas; não devem ser copiados para o produto como solução. `git diff -- src config scripts` permaneceu vazio.


## Continuação: lentidão persistente na porta 5173

O usuário confirmou travadas em repouso, nas perguntas e na rolagem. O gargalo de abertura não explica esse relato inteiro.

O teste `node .scratch/perf/steady-graphics.cjs` repetiu o caminho de renderização sem a flag `--disable-gpu` do harness original. O ambiente continuou usando SwiftShader/renderização por software, portanto não representa a GPU real do usuário. Resultados: repouso na abertura (6 s), repouso na pergunta (6 s) e rolagem (6,2 s), p95 de UI ~16,7–16,8 ms, maior intervalo de UI 33,3 ms, maior intervalo do vídeo 66,7 ms, perda de vídeo de 0% a 0,67%. Zero exceções, uma única navegação e somente um evento HMR `connected`; não houve evidência de recargas repetidas. O sintoma persistente não foi reproduzido. [Resultados](steady-graphics.json).

Nenhum navegador do usuário estava conectado às ferramentas de UI. Para alcançar o caminho gráfico real, a alternativa estruturada é o recorder local [browser-report.html](browser-report.html), servido pelo Vite. Ele inclui o quiz em iframe da mesma origem, registra 20 s de RAF, quadros apresentados/perdidos, tarefas longas, estado do vídeo e recargas. O relatório usa uma lista fixa de métricas e user agent, sem respostas, cookies, armazenamento ou cabeçalhos; não é enviado automaticamente.

Abrir `http://localhost:5173/.scratch/perf/browser-report.html`, clicar em medir, reproduzir as travadas normalmente por 20 s, marcar se elas ocorreram e copiar o relatório JSON para a conversa. A mesma sequência está no [loop HITL](hitl-video.sh), derivado do template obrigatório da skill: `bash .scratch/perf/hitl-video.sh`.

O recorder é temporário e não altera `src/`, `config/` ou `scripts/`. A correção do problema persistente continua sem causa confirmada até coletar o sinal no navegador real. Não foi criada uma regressão artificial para declarar o vídeo resolvido.

## Relatório recebido do navegador do usuário

O usuário enviou uma captura de 20.000,7 ms com `perceived: no`. O user agent identifica Code 1.143 / Electron 43.7 / Chromium 150 em Linux, com viewport de 634 × 1115 e escala de 0,8. [Resumo fiel dos campos relevantes](user-electron-summary.json).

- UI: 1084 callbacks, p95 de 33,3 ms, maior intervalo de 66,7 ms, nenhuma tarefa longa e nenhum intervalo acima de 150 ms.
- Vídeo: 481 quadros contabilizados, 4 perdidos (0,8%), maior intervalo de apresentação de 133,4 ms e nenhum evento `waiting` ou `stalled`.
- Zero recargas do app ou mudanças de visibilidade.
- As amostras do vídeo vão de 36,2 s a 55,2 s; não cobrem abertura nem reinício do loop.

O sintoma persistente também não apareceu nessa captura do usuário. A ausência de eventos de espera mostra que não houve buffering registrado nessa janela; não descarta ocorrências em outros momentos. O intervalo de UI no p95 indica cadência irregular nessa amostra, sem evidência de congelamento longo. O user agent não comprova que Electron seja a causa e não informa por si só a aceleração de vídeo.

Não há base para corrigir o vídeo como causa confirmada. O gargalo de abertura medido anteriormente permanece um achado separado, sob CPU limitada. Para concluir o diagnóstico persistente, é necessário capturar uma ocorrência percebida, preferencialmente comparando a mesma URL no preview do VS Code e em um navegador externo. Nenhum arquivo da aplicação foi alterado nesta continuação.
