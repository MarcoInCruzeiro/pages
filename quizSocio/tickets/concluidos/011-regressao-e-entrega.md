# QUIZ-011 — Consolidar regressão e verificar a entrega

Status: Concluído

Regra vigente: [ADR-0001](../../docs/adr/0001-valores-e-taxas-separados.md). Situação atual: QUIZ-003, QUIZ-009 e QUIZ-010/010-A concluídos; consolidação verificada em 27/10/2026. Os relatórios anteriores preservam o histórico.

## Descrição

O projeto não possui cobertura permanente equivalente à avaliação realizada. A entrega precisa de uma verificação reproduzível do motor e do fluxo, abrangendo os defeitos corrigidos e os limites da validação comercial.

## Escopo

Integrar os testes adicionados nos tickets anteriores, fornecer comandos locais reproduzíveis e registrar evidências da versão final. A suíte deve usar o motor de produção e interações reais de navegador onde o comportamento depende da interface.

## Critérios de aceite

- [x] Um checkout limpo consegue preparar e executar a verificação com os comandos documentados, sem depender de arquivos temporários da avaliação.
- [x] A suíte cobre todos os critérios verificáveis dos tickets anteriores, incluindo cliques repetidos, respostas incompletas, retomada, novo quiz e comparação atualizada.
- [x] Eventos de resposta, conclusão e clique são inspecionados com captura local; o resultado e o plano recomendado correspondem à execução atual.
- [x] O motor é verificado quanto a pontuação finita, ordenação determinística, restrições de orçamento, setor, capacidade e dados ausentes.
- [x] A enumeração de respostas finitas informa quantidade executada; mudanças de perguntas recalculam o espaço. Para entradas numéricas adicionais, cobrir limites e classes representativas com justificativa da cobertura.
- [x] Casos contraditórios são distinguidos dos casos válidos e seguem o tratamento definido, em vez de serem contados como recomendações normais.
- [x] O relatório final inclui versão do catálogo e regras, métricas da referência reservada, falhas, limitações e roteiro de verificação dos destinos comerciais.
- [x] O fluxo funciona em viewport móvel e desktop, com navegação por teclado entre perguntas, resultado e comparação.
- [x] Todos os tickets anteriores estão concluídos, com evidência registrada; a publicação permanece uma ação separada deste backlog.

## Dependências concluídas

- Dependências: QUIZ-001 a QUIZ-010. Este ticket consolida a entrega após os testes de cada correção.
- O aceite comercial do QUIZ-003 foi confirmado pelo usuário. QUIZ-009 entregou os perfis autorizados e QUIZ-010-A/010 concluíram a avaliação sintética; não restam bloqueadores deste escopo local.

## Verificação

Executar a suíte sobre a versão final e repetir os roteiros de clique duplo, refazer quiz e destino de contratação. Registrar saída dos comandos e resultados do navegador. Taxa de acerto contra cenários sintéticos deve ser apresentada com esse rótulo; alegações sobre usuários reais exigem evidência própria.

## Registro de conclusão

Registro anterior verificado no commit `01f6d20`. As rodadas posteriores e a conclusão atual estão ao final. [QUIZ-010](010-recalibracao-do-ranking.md) e [QUIZ-010-A](010-A-referencia.md) concluídos; [QUIZ-003](003-modalidade-e-checkout.md) e [QUIZ-009](009-referencia-de-qualidade.md) aceitos conforme a decisão do usuário.

### Relatório da versão verificada

| Item | Valor |
| --- | --- |
| Catálogo | `CATALOG_VERSION = 2026-09-11` (Termo de Uso publicado em 11/09/2026, consultado em 26/10/2026) |
| Regras | `RULES_VERSION = 2026-10-26` (perfil e ranking descritos em [estrutura_quiz.md](../../estrutura_quiz.md), seções 3 a 7) |
| Suíte | `npm test` — 49/49 (35 unitários e de referência, 14 de navegador em Chrome headless) |
| Referência reservada (sintética) | top-1 12/12, top-3 12/12, 0 violação; linha de base `2cecf81`: 7/12 |
| Calibração (sintética) | top-1 12/12, top-3 12/12; linha de base: 8/12 |
| Contradições | 5/5 detectadas e excluídas das métricas |
| Enumeração | Espaço nominal 13.713.408 respostas; 3.082 executadas (todas as combinações categoriais sem conflito + 10 classes numéricas de limite); 10.752 combinações categoriais com conflito confirmável tratadas à parte |

As taxas acima são contra a referência sintética do [QUIZ-009](009-referencia-de-qualidade.md). Não medem satisfação, contratação nem retenção de usuários reais.

### Comandos

```
node --version            # >= 22
npm test                  # motor, referência e navegador; usa /usr/bin/google-chrome ou CHROME_PATH
npm run test:unit         # sem navegador
npm run test:browser
npm run baseline          # opcional; regenera a linha de base a partir do histórico git
```

Execução em checkout limpo: `git archive 01f6d20 quizSocio` extraído em diretório isolado (sem `tickets/` nem `.env*`), `npm test` 49/49. Não há dependências npm. Requisitos: Node ≥ 22 e Google Chrome.

### Correções feitas durante a consolidação anterior

- **Analytics em testes:** o `gtag.js` real carregava antes do substituto. `tests/cdp.js` passou a bloquear GA, DoubleClick e Vercel Insights, e cada teste falha se alguma resposta de analytics chegar.
- **Versão das regras:** o motor ganhou `RULES_VERSION`, exposta no resultado de `recommendPlans`, para o relatório identificar regras além do catálogo.
- **Ingressos das crianças:** o custo estimado não os inclui, porque o catálogo não confirma se o opcional Kids os cobre. O resultado informa a exclusão, e um teste de navegador confere o aviso.
- **Teclado no comparativo:** abrir pelo teclado não levava o foco ao diálogo `aria-modal`, porque as transições de `visibility` impediam o foco. O foco agora entra no botão Fechar e volta a `Comparar planos` ao fechar com `Escape`; Tab segue para `Assinar agora`. Há teste com teclas reais.

### Roteiro de verificação dos destinos comerciais (pendente, QUIZ-003)

Para cada plano (Meu Cruzeiro 21, Time do Povo 34, Cabuloso 10, Cabuloso Max 11, Cabuloso Cativo 115):

1. Abrir o CTA a partir do resultado, dos cards e do comparativo, sem login e sem concluir compra.
2. Registrar a URL final sem dados pessoais, o plano exibido, a modalidade (semestral/anual) e o valor.
3. Comparar com [catalogo-comercial.md](../../catalogo-comercial.md). No Cativo, confirmar a oferta anual de R$ 4.800 em 12x de R$ 400.
4. Fechar a aba antes de qualquer pagamento.

Em 26/10/2026 o passo 1 retornou 403 com desafio do Cloudflare.

### Pendências para fechar

- QUIZ-003: conferência dos destinos (externo: responsável pela plataforma de sócios).
- QUIZ-009 e QUIZ-010: referência e avaliação independente (externo: responsável pelo produto).
- Versionamento: feito no commit `01f6d20`, branch local `quiz-socio/tickets-correcoes`, sem push. `tickets/` fica fora do git (`.gitignore`). Merge e push são decisões do responsável.
- Publicação: ação separada deste backlog.

## Verificação desta correção — 26 de outubro de 2026

Regras `2026-10-26.1`, alterações locais sobre `01f6d20`. Corrigido o preço do acompanhante com desconto no Max, acrescentados três testes de custo e um de navegador e reconferida a cobertura Kids no item 12.2 do Termo de Uso. O índice recebe o custo corrigido sem alteração de pesos ou dos planos aceitáveis da referência.

**Resultado da execução final:** `npm test` passou 53/53, com 38 testes de motor/referência e 15 de navegador em Chrome headless; zero falha, cancelamento ou teste ignorado. O [log completo](../evidencias/testes-2026-10-26.tap) registra a execução. O diagnóstico da referência informa explicitamente `avaliação independente: pendente`. `git diff --check` também passou.

Os novos testes de custo passaram de 0/3 na versão anterior para 3/3 após a correção. A verificação do navegador confirmou R$ 305,00/mês no card do Max para dois adultos com 12 jogos/ano; o teste preserva a adesão separada. A nota de Kids foi conferida no DOM com a condição de aprovação e disponibilidade. Comandos direcionados usados durante a correção:

```sh
node --test --test-name-pattern='Cabuloso Max cobra|acompanhante paga|custo do casal' tests/engine.test.js
node --test --test-name-pattern='casal no Max|resultado único mantém' tests/browser.test.js
npm test
git diff --check
```

**Escopo da evidência:** a base existente passou a ser identificada como regressão sintética nos testes e em [reference-provenance.json](../../tests/fixtures/reference-provenance.json). O [relatório de reavaliação](../../tests/fixtures/cost-fix-results.json) compara os 24 cenários válidos com `01f6d20`; a métrica atual não comprova independência de avaliação. A enumeração representativa continua cobrindo 3.082 combinações, com limites numéricos e conflitos separados.

**Destinos comerciais:** nova consulta dos cinco links retornou HTTP 403 com desafio do Cloudflare; [evidência por destino](../evidencias/checkouts-2026-10-26.json). Oferta, modalidade e preço real continuam não confirmados. Os testes de navegação e CTA são locais e mantêm analytics bloqueado.

**Para fechar:** concluir QUIZ-003, obter a referência independente do QUIZ-009, avaliar o ranking no QUIZ-010 e executar novamente a consolidação. O critério final permanece desmarcado. As correções desta rodada não foram publicadas nem enviadas ao remoto.


## Verificação vigente — ADR-0001

`npm test` passou 53/53 (38 testes de motor/referência e 15 de navegador), sem falhas ou testes ignorados. [Log desta rodada](../evidencias/testes-adr-0001-2026-10-26.tap). Regras `2026-10-26.2`.

A aplicação removeu os agregados de gasto mensal e primeiro mês. O motor retorna assinatura, adesão e preço unitário Kids separados; o ranking compara apenas assinatura no componente de preço. No navegador, o cenário de casal com dois Kids mostra preço de assinatura do Max em R$ 200, adesão de R$ 30, Kids de R$ 30 por criança e exemplo de ingresso a R$ 52,50, cada qual em sua condição. O resultado principal e cards informam adesão em campo próprio.

O [relatório da ADR](../../tests/fixtures/separate-prices-results.json) registra os 24 cenários: calibração 12/12; reserva histórica top-1 11/12 e top-3 12/12. O caso RES-11 continua como divergência observada, sem alteração dos aceitáveis para fazê-lo passar. Avaliação independente e conferência real de checkout continuam pendentes nos QUIZ-009/010 e QUIZ-003.

Os 53 testes da etapa anterior validavam a regra agora substituída. O log desta seção é a evidência do comportamento vigente.

## Revisão visual e textual

Correções aplicadas em 26/10/2026: contraste do painel de confirmação, mensagem de erro e histórico desconhecido; botões de mesma altura, sem herança da margem de abertura; textos curtos e CTAs consistentes; fonte Outfit carregada corretamente; abertura responsiva; menu acessível por teclado; preços e taxas separados conforme ADR; notas legíveis e valores de afinidade formatados em pt-BR.

O comparativo deixou de truncar condições e de comprimir todas as colunas no celular. Detalhes têm pelo menos 14 px, a tabela usa largura mínima de 1120 px e rolagem horizontal, e CTAs mantêm área de 44 px. O teste aguarda a animação de abertura antes de medir as dimensões.

Os quatro testes direcionados de erro, confirmação desktop/celular e menu falharam na versão anterior e passaram após a correção. A revisão por captura identificou ainda a regra antiga de 390 px que comprimia a tabela; a regressão agora verifica a largura da tabela e das colunas, além do tamanho do texto. [Capturas e roteiro visual](../evidencias/interface/README.md).

Resultado da suíte final desta revisão: `npm test` passou 55/55 (38 de motor/referência e 17 de navegador), sem falhas, cancelamentos ou testes ignorados. [Log completo](../evidencias/testes-interface-2026-10-26.tap). A verificação de whitespace passou nos arquivos alterados nesta revisão; a alteração já existente em `.gitignore` foi preservada.

As pendências externas de QUIZ-003, QUIZ-009 e QUIZ-010 continuam; esta revisão conclui as correções de interface e não altera esses aceites.

## Revisão de linguagem com foco na experiência

Em 26/10/2026, restaurados o título original de abertura, o botão “Iniciar”, a descrição de divulgação e os CTAs de campanha. Textos comerciais verificados e a separação de valores da ADR-0001 permanecem; o Time do Povo continua descrito como ingresso popular, sem preço fixo de ingresso não confirmado.

O apoio de histórico passou a “Não lembra ou ainda não é sócio? Marque a opção abaixo para continuar.” O primeiro slider volta a “Frequência estimada”. Kids usa descrições diretas de inclusão, e o resultado orienta a conferir benefícios na conta sem expor regras de histórico desconhecido ou versões de catálogo. “Sobre a recomendação” explica o resultado como sugestão em linguagem simples. A confirmação “Confira suas respostas”, enviada na foto anterior, foi preservada integralmente.

`npm test`: 55/55, sem falhas ou testes ignorados. O navegador verifica a orientação de histórico sem explicação de regras internas, mantém revisão de respostas e captura de analytics e valida as condições comerciais em campos separados. [Log](../evidencias/testes-linguagem-ux-2026-10-26.tap). As capturas de abertura e histórico foram atualizadas em [evidências da interface](../evidencias/interface/README.md); a abertura foi reconferida em 320, 390, 768 e 1280 px, sem conteúdo cortado ou sobreposição do cabeçalho.

## Verificação de transições de UX — plano-transicoes-ux.md

Em 26/10/2026, aplicadas as seguintes mudanças de animação e transição em `index.html`, seguindo o plano em `docs/plano-transicoes-ux.md`:

### CSS — `:root`
- Novas variáveis: `--duracao-secao: 400ms`, `--duracao-pergunta: 220ms`, `--duracao-modal: 220ms`, `--duracao-botao: 150ms`, `--ease-fade: ease-out`, `--ease-modal: cubic-bezier(0.22, 1, 0.36, 1)`.

### CSS — seções dinâmicas e hero
- `.dynamic-section`, `.hero-card`, `.result-card`, `.plans-card`, `.hero`: fade puro (apenas `opacity`), sem `translateY`. Duração de até 400 ms para troca de seção.
- `.question`, `.options`, `.step-info`: fade puro, até 220 ms entre perguntas.
- `.option`: todas as opções aparecem juntas, sem stagger, transição de 150 ms.
- `.btn`: fundo, borda e sombra com transição de 150 ms.

### CSS — modal
- `.modal-overlay`: fade de até 220 ms.
- `.modal-content`: escala sutil de 0,98 → 1 com `cubic-bezier(0.22, 1, 0.36, 1)`, 220 ms. Sem deslocamento vertical.

### JavaScript — `transitionSection()`
- Duração de 400 ms com margem de segurança de 100 ms.
- Usa evento `transitionend` como mecanismo primário, `setTimeout` como rede de segurança.
- `prefers-reduced-motion`: quando ativo, pula atrasos e aplica mudanças diretamente.
- Foco transferido ao título da nova etapa após cada transição (resultado, herói, quiz).

### JavaScript — `renderQuestion()`
- Fade puro entre perguntas (sem deslocamento vertical), duração de 220 ms.
- Respeita `prefers-reduced-motion`.

### Modal — foco
- Foco entra no botão Fechar ao abrir, retorna ao elemento de origem ao fechar, `Escape` fecha o diálogo.

### Resultado dos testes
- `npm test`: 55/55 (38 motor/referência + 17 navegador), sem falhas, cancelamentos ou testes ignorados.
- [Log de execução](../evidencias/testes-transicoes-2026-10-26.tap).
- Critérios de aceite do plano: todos verificados (fluxo início → 12 perguntas → resultado → reinício; cliques rápidos; erro de resposta; conflito; modal por teclado e Escape; movimento reduzido; larguras 320/390/768/1280 px; durações e apresentação simultânea das opções).

## Execução das pendências abertas — 27/10/2026

Executado `npm test` após integrar a referência comercial indicada pelo usuário e os comandos permanentes de verificação externa, avaliação e preparo da entrega. Resultado: **75/75**, sem falhas, cancelamentos ou testes ignorados; [log completo](../evidencias/execucao-2026-10-27/npm-test.tap). São 39 testes de motor/referência, quatro da referência documental e ferramentas, e 32 de navegador.

Os 11 links documentais quebrados encontrados na auditoria foram corrigidos; a orientação de retomar defeitos já resolvidos foi removida do README. O [roteiro vigente](../../docs/validacao-e-entrega.md) concentra a conferência de ofertas, referência independente, Admin/DebugView, entrega e continuidade no checkout.

O candidato de entrega foi preparado em `/tmp/quizSocio-release-2026-10-27/public/` e empacotado em `/tmp/quizSocio-release-2026-10-27.tar.gz`. Seus dez arquivos públicos foram conferidos contra o [manifesto](../evidencias/execucao-2026-10-27/release-manifest.json), e uma abertura local do preview confirmou carregamento do motor, resultado e link de contratação com coleta desabilitada. Não houve publicação.

O [relatório externo](../evidencias/execucao-2026-10-27/externos.json) registra o contrato público ainda antigo e os cinco destinos terminando na fila com 429/desafio. O [relatório do ranking](../evidencias/execucao-2026-10-27/ranking.json) mantém a avaliação como regressão sintética, com a divergência RES-11 preservada.

O critério final continua pendente: QUIZ-003 requer leitura das ofertas; QUIZ-009/010 requerem rótulos independentes e sua avaliação. Os bloqueios de Admin, publicação e identidade dos QUIZ-017/018/019 também foram documentados nos próprios tickets. A execução das etapas locais não foi registrada como encerramento desses aceites externos.

## Atualização após o aceite do usuário e criação de perfis — 27/10/2026

O usuário confirmou o QUIZ-003 e autorizou o agente a criar os perfis do QUIZ-009. Ambos foram concluídos e movidos para `concluidos/`; os bloqueios descritos nas seções anteriores são históricos e não serão reaplicados a esses tickets.

A suíte com a nova referência de oito perfis/16 cenários passou **79/79**, sem falhas; [log atual](../evidencias/perfis-009-2026-10-27/npm-test.tap). A transformação de necessidades do engine foi conferida sem alterar preços, pesos ou versão das regras. Os vencedores da nova base serão avaliados no [QUIZ-010-A](010-A-referencia.md), planejado e vinculado ao QUIZ-010. Essa é a pendência atual para a consolidação final.

## Conclusão da consolidação — 27/10/2026

QUIZ-010-A avaliou a referência congelada: calibração e validação com 8/8 no top-1 e top-3, sem violações de orçamento ou pontuação. O motor e os preços permaneceram iguais. A regressão histórica preservou os vencedores e a divergência RES-11; os relatórios identificam os resultados como sintéticos.

`npm test` passou **82/82** no workspace e **82/82** em uma cópia isolada contendo apenas `index.html`, `quiz-engine.js`, `package.json`, `img/`, `tests/` e `scripts/`. A cópia recebeu metadados Git locais mínimos para as ferramentas de preparo; nenhum arquivo de ambiente, credencial ou histórico do usuário foi modificado. Essa execução verifica o snapshot não commitado e não afirma que as alterações já foram publicadas ou commitadas.

- [Log do workspace](../evidencias/011-consolidacao-2026-10-27/npm-test-workspace.tap).
- [Log da cópia isolada](../evidencias/011-consolidacao-2026-10-27/npm-test-isolado.tap) e [composição do snapshot](../evidencias/011-consolidacao-2026-10-27/snapshot.json).
- [Relatório dos perfis](../evidencias/010-A/perfis-final.json) e [comparação histórica](../evidencias/010-A/comparacao.json).

Os testes reexecutaram os critérios dos QUIZ-012 a 016: modos de preview, isolamento da coleta, versões, três origens de CTA e interceptação antes da transmissão. O recebimento no GA4 não é inferido desses testes e continua no QUIZ-017. Publicação e identidade real seguem nos QUIZ-018/019. O ticket foi concluído e arquivado conforme o README.
