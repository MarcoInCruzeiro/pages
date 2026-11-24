# Qualidade e entrega — 29/10/2026

Execução local na branch `quiz/port-vue`. Nenhum aceite de ranking ou publicação é inferido da execução técnica. O tracker canônico fica em [tickets/qualidade-e-entrega](../../qualidade-e-entrega/README.md).

## Qualidade do ranking

[Dossiê de decisão](decisao-ranking.md) e [relatório completo](quality.json), gerados por `node scripts/quality-dossier.mjs`. Os hashes vinculam avaliação histórica e perfis à configuração ativa. Expectativas, pesos, schemas e regras foram preservados. As perdas CAL-02, CAL-10, PER-02-C e RES-05 continuam exigindo aceite; `releaseApproved: false`.

## Abertura e reserva do espaço

Os validadores são gerados por `npm run config:validators`. `config:check` verifica a configuração com o Ajv real e confere se o módulo gerado está atualizado, sem alterar fontes. O navegador usa somente os validadores e auxiliares reduzidos; o compilador Ajv não integra seu startup. O teste de desenvolvimento cobre a falha real de import CommonJS/ESM (`fullFormats`) e o início da jornada.

A reserva de altura compara fragmentos inertes de texto e opções em um único layout, sem montar os 12 estados Vue. Mede com os componentes reais o maior candidato de opções e os controles de faixa, e reaproveita a reserva por largura/fonte. Mudança de fonte invalida o cache; redimensionamento seleciona a reserva adequada. Não há canvas ou estimativa por quantidade de caracteres.

Reprodução das três variantes controladas, com a mesma configuração, mídia e máquina:

```sh
node scripts/build-profile-variants.mjs /tmp/quiz-quality-profiles
node scripts/profile-startup.cjs /tmp/quiz-quality-profiles/01-ajv tickets/evidencias/qualidade-e-entrega-2026-10-29/startup-01-ajv.json
node scripts/profile-startup.cjs /tmp/quiz-quality-profiles/02-compilados tickets/evidencias/qualidade-e-entrega-2026-10-29/startup-02-compilados.json
node scripts/profile-startup.cjs /tmp/quiz-quality-profiles/03-medicao tickets/evidencias/qualidade-e-entrega-2026-10-29/startup-03-medicao.json
```

O builder usa somente a versão histórica de `useQuestionSpace` do commit `4b569bd` para as variantes 01 e 02. A variante 01 mantém o Ajv de runtime; a 02 usa o módulo compilado; a 03 acrescenta a nova medição. São artefatos exclusivamente diagnósticos, fora do projeto, sem permissão de entrega. Cada relatório contém três amostras de abertura, maior tarefa e mediana sob CPU 6×, cache HTTP desativado, Chrome headless 1280×900 e fontes externas interceptadas. Executar a sequência sem outros workloads de CPU; são amostras pequenas, não uma garantia estatística.

| Variante | Maiores tarefas (ms) | Mediana (ms) |
| --- | --- | --- |
| Ajv em runtime + medição anterior | [974, 383, 534] | 534 |
| Pré-compilados + medição anterior | [394, 148, 185] | 185 |
| Pré-compilados + medição nova | [580, 213, 173] | 213 |

A pré-compilação reduziu a mediana de 534 para 185 ms (−65,4%). Na comparação isolada da medição, 185 → 213 ms (+15,1%); não foi demonstrado ganho de tempo dessa segunda mudança nesta amostra. O benefício comprovado do ticket 04 é eliminar a montagem dos 12 estados Vue e reaproveitar reservas, preservando a geometria. O conjunto ficou em 213 ms, 60,1% abaixo da variante com Ajv em runtime. Não se esconde a variação desfavorável do segundo passo; o número de amostras é pequeno e há dispersão entre aberturas frias e aquecidas. O [diagnóstico anterior](diagnostico-historico.md) é histórico: o gargalo de abertura sob CPU limitada é separado da travada persistente, que não foi reproduzida. Nenhuma melhoria de abertura comprova resolução desse sintoma persistente.

`node scripts/verify-layout.cjs DIRETORIO_BUILD DIRETORIO_EVIDENCIAS` percorre as 12 perguntas, resultado e comparativo, em 320, 390, 768 e 1280 px, com movimento reduzido. Compara rodapé, reserva, recortes, overflow, exceções e assets locais. As reservas antes/depois foram idênticas: 983, 947, 795 e 815 px, respectivamente. O teste permanente de navegador cobre as mesmas larguras, retorno, reinício e resize.

## Artefato público e mídia

[Inventário antes/depois, tamanhos e hashes](assets.json). Total: 45.164.158 → 15.334.997 bytes (−66,0%). Vídeo: 36.348.058 → 13.830.472 bytes (−62,0%). Zero grupos de imagens duplicadas no build final. Os arquivos usados no CSS e por referências estáticas compartilham o mesmo caminho `img/`; o plugin só emite os ainda ausentes e só roda no build.

[Metadados anteriores](video-antes.txt) e [atuais](video-depois.txt): H.264, 60,75 s, 24 fps, proporção 9:16; resolução 1080×1920 → 720×1280. `autoplay`, `muted`, `loop`, `playsinline`, pôster e `preload=metadata` foram preservados no componente. A faixa de áudio não é necessária no fundo mudo. Pôster JPEG: 866.124 → 95.196 bytes. Fundo estrelado JPEG: 3.216.121 → 69.166 bytes. Catálogo, planos, regras e medição não foram alterados por esta otimização.

Conversão reproduzível a partir dos assets anteriores: FFmpeg com `-an -vf scale=720:1280 -c:v libx264 -crf 28 -preset slow -movflags +faststart`; Sharp com `resize({width:720,withoutEnlargement:true}).jpeg({quality:78,mozjpeg:true})` no pôster e largura 1600 no fundo estrelado. As ferramentas de conversão foram instaladas somente em `/tmp/quiz-media-tools`, sem dependências de mídia no produto.

## CI, rastreio e entrega

O workflow [Quiz Socio CI](../../../../.github/workflows/quiz-socio.yml) instala Node 22, dependências travadas e Chrome, usa cache npm pelo lockfile e executa `npm test`. Todo PR recebe o check, evitando checks obrigatórios pendentes por filtro de caminhos no monorepo. O workflow não publica nada; a configuração Git da Vercel desativa deploy automático nas branches `quiz/*`. Os destinos de analytics e checkout continuam bloqueados pelo harness CDP.

Referências do workflow: [setup-node](https://github.com/actions/setup-node/tree/v4), [setup-chrome](https://github.com/browser-actions/setup-chrome/tree/v2) e [configuração Git da Vercel](https://vercel.com/docs/project-configuration/git-configuration).

`node scripts/check-local-links.mjs` verifica os links dos documentos versionados e novos, excluindo `.scratch/` ignorado. Tickets Vue e de fechamento são versionados. Probes e snapshots locais em `.scratch/` são ignorados; o [protótipo do percentual](../../../docs/prototypes/README.md) foi arquivado fora das entradas do Vite. Pacotes públicos contêm somente `dist/`, sem documentos, testes, snapshots ou backups.

Os registros finais de testes, CI e checkout limpo complementam esta evidência. Os tickets 08 e 09 aguardam decisão do responsável, CI/candidato e autorização específica de publicação; nenhum arquivo de aceite foi criado. QUIZ-017, 018 e 019 continuam com seus bloqueios externos.

Verificação local final: `npm test` aprovou **147 testes**, zero falhas, em 109,8 s ([log](npm-test.log)). Capturas e geometria: [layout/layout.json](layout/layout.json), com início, pergunta 11 e comparativo em 390 e 1280 px. Os ícones externos do site de sócios aparecem bloqueados nas capturas por política do harness; os assets locais têm zero falhas HTTP. A reprodução automática real e os atributos do vídeo são registrados em [video-browser.json](video-browser.json).

Checkout limpo verificado: [clean-checkout.json](clean-checkout.json), com `npm ci`, build, links e jornada no pacote isolado. [Manifesto diagnóstico](diagnostic-manifest.json): 12 arquivos, `workingTreeHasChanges: false`, `diagnostic: true`, `releaseApproved: false`. O escopo da árvore limpa é `quizSocio/` e o workflow do monorepo; diretórios alheios não rastreados do workspace original foram preservados.

## CI hospedado e bloqueio de merge

- [Execução verde](https://github.com/MarcoInCruzeiro/pages/actions/runs/40925172854): commit `5a29253`, **147 passam, zero falhas**, suíte em 108,6 s; job completo em 129 s. [Metadados](ci-green.json), [etapas](ci-green-jobs.json) e [sinal do log](ci-green-signal.log).
- [Controle negativo](https://github.com/MarcoInCruzeiro/pages/actions/runs/40925195956): commit temporário `c9c710c`, 146 passam e exatamente uma falha intencional no teste de startup. O teste exigiu uma exceção inexistente, comprovando que a falha do teste torna o workflow vermelho. [Metadados](ci-red.json), [etapas](ci-red-jobs.json) e [sinal do log](ci-red-signal.log). A mutação ficou apenas na branch descartável `quiz/ci-negative-control-2026-10-29`, sem entrar na branch de trabalho nem na main; a branch foi removida após a verificação.
- Cache npm configurado por `package-lock.json`; as duas primeiras execuções foram frias (`npm cache is not found`). O cache da execução verde foi salvo ao final. O Chrome é provisionado por `browser-actions/setup-chrome`, sem dependência do navegador instalado no runner.
- [Proteção da main](main-protection.json): exige `Quiz Socio / testes`, branch atualizada e aplica a regra a administradores; force push e exclusão da main estão desabilitados. Não foi realizado merge.

Correção complementar de testes: sem `dist/`, a inspeção do bundle usa `t.skip`, preservando os 13 testes de validação em vez de lançar `assert.skip is not a function`. [Vermelho/verde em checkout descartável](unit-without-dist.log). Com o build presente, os 14 testes do arquivo passam.
