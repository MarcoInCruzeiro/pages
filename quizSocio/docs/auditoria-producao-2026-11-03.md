# Avaliação de produção do quiz/recomendador — 03/11/2026

Atualização posterior à auditoria: o usuário rejeitou o aceite das perdas. A [correção do ranking sem preço](correcao-ranking-sem-preco-2026-11-03.md) substitui a situação do item 1. Os resultados e hashes abaixo são a fotografia anterior à correção; os demais achados de produção permanecem separados.

**Parecer: solicitar ajustes antes de liberar a versão Vue para produção.** A aplicação está funcional nos testes locais, mas ainda há decisões de qualidade do ranking, correções de acessibilidade e validações externas necessárias. Não foi encontrado defeito crítico de segurança nesta revisão; isso não equivale a uma auditoria completa de segurança.

A análise partiu da implementação, dos testes executados nesta sessão e de leituras HTTP dos destinos. Os tickets foram consultados depois, para comparar sua relevância, e não para definir o resultado. Não houve alteração de regras, aprovação de perdas, merge, publicação ou configuração de serviços externos.

## Escopo e evidências

- Branch `quiz/port-vue`, commit `feb130b`; Node `v22.22.1`, npm `9.2.0`, Chrome headless via CDP.
- Catálogo `2026-10-28.2`, regras `2026-10-29.2`, GA4 `2026-10-28.3`.
- `npm test`: **147 aprovados, zero falhas, zero ignorados**, aproximadamente 104 segundos. O comando também validou configuração, validadores gerados e build Vite. [Log completo](evidencias/auditoria-producao-2026-11-03/npm-test.log).
- Jornada no navegador: avanço, retorno, respostas zero/false, clique duplo, conflitos, revisão, conclusão, refazer, Kids, preços separados, comparativo, teclado, CTAs e isolamento de analytics.
- `node scripts/verify-layout.cjs dist /tmp/quiz-audit-layout`: **48 estados de pergunta**, nas larguras 320, 390, 768 e 1280 px, sem recortes ou overflow inesperado e sem recurso local ausente. Capturas do comparativo móvel e pergunta desktop inspecionadas visualmente. [Geometria](evidencias/auditoria-producao-2026-11-03/layout.json).
- `npm audit --json`: **zero vulnerabilidades reportadas** no conjunto de dependências travadas. Não avalia todas as vulnerabilidades possíveis da aplicação. [Resultado](evidencias/auditoria-producao-2026-11-03/dependencias.json).
- axe-core 4.14.0 nos estados início, primeira pergunta, resultado e comparativo, com movimento reduzido para evitar medir cores durante transições. [Resultado](evidencias/auditoria-producao-2026-11-03/acessibilidade.json).
- `inspectConfiguration()` e `inspectQuality()`: configuração sem mudanças pendentes; pisos agregados atendidos; **`releaseApproved: false`**. [Avaliação completa](evidencias/auditoria-producao-2026-11-03/qualidade.json).
- `VERCEL_ENV=production node scripts/check-delivery.mjs`: saída **1**, com `Entrega bloqueada: revisão pendente dos cenários CAL-02, CAL-10, PER-02-C, RES-05.` Trata-se de execução local do gate, sem chamada à Vercel.
- `npm run release:prepare -- --diagnostic --output /tmp/quiz-audit-candidate-2026-11-03`: pacote diagnóstico com 12 arquivos compilados, aprovação falsa. O pacote não é candidato aprovado de produção.
- `node scripts/verify-external.mjs --output /tmp/quiz-audit-external.json`: leitura pública do domínio e dos quatro destinos comerciais. [Resultado](evidencias/auditoria-producao-2026-11-03/externos.json).

## Pendências para liberação

### 1. P1 — Resolver as divergências do recomendador e obter decisão de negócio

O motor respeitou o orçamento de assinatura e manteve os índices dentro da faixa esperada nos cenários avaliados. Entretanto, cinco dos 40 cenários sintéticos não colocaram um plano considerado aceitável em primeiro lugar; quatro são regressões em relação à referência anterior. A suíte verde verifica também a identificação dessas perdas, portanto não significa aprovação de negócio.

| Referência | Primeiro lugar aceitável | Algum aceitável nos três primeiros | Violações de orçamento |
| --- | --- | --- | --- |
| Histórica / calibração | 10/12 | 12/12 | 0 |
| Histórica / reserva | 10/12 | 12/12 | 0 |
| Perfis / calibração | 7/8 | 8/8 | 0 |
| Perfis / validação | 8/8 | 8/8 | 0 |

| Caso | Esperado pela referência | Primeiro lugar atual | Impacto |
| --- | --- | --- | --- |
| CAL-02 | Time do Povo | Meu Cruzeiro | Perfil com dez jogos/ano e teto de R$ 40 recebe plano com um ingresso por temporada, em vez do benefício popular por jogo |
| PER-02-C | Time do Povo | Meu Cruzeiro | O mesmo problema aparece no perfil popular frequente; margem de apenas 0,4 ponto |
| CAL-10 | Cabuloso Max | Cabuloso | Preferência por Roxo recebe cobertura parcial em vez de cobertura completa |
| RES-05 | Cabuloso Max | Cabuloso | Nova perda envolvendo cobertura do Roxo |
| RES-11 | Time do Povo | Meu Cruzeiro | Divergência histórica já existente, sem regressão nova |

O componente financeiro em [engine-core.mjs](../src/engine-core.mjs) normaliza preços pelo mínimo e máximo de todo o catálogo. A retirada de um plano altera o peso relativo dos restantes mesmo sem mudar seus preços ou respostas; a avaliação comparativa registra essa sensibilidade. Não basta mudar os resultados esperados para tornar a avaliação verde.

**Para liberar:** o responsável deve decidir se os quatro novos resultados são aceitáveis, com justificativa por caso e registro vinculado aos hashes vigentes, ou pedir ajuste do ranking e nova avaliação. RES-11 também merece decisão explícita como limitação conhecida. Uma rodada com especialistas/torcedores e casos novos ajudaria a validar a adequação real: as referências atuais são sintéticas, não medem conversão ou satisfação. Não há fundamento para anunciar a pontuação como probabilidade de acerto.

### 2. P1 — Validar o destino real de contratação

Os quatro links chegaram a `fila.cruzeiro.com.br`, com **HTTP 429 e desafio**, sem expor a oferta final. Os testes locais confirmam os links e os eventos de clique, mas interceptam a navegação externa.

**Para liberar o funil comercial:** atravessar a fila em sessão normal e conferir plano, modalidade, valor e condições efetivamente apresentados, nas origens resultado, lista, comparativo e alternativa de setor quando disponível, interrompendo antes de contratar. Comparar com a configuração vigente. Não foi demonstrado que os links estão quebrados nem que os parâmetros se perdem definitivamente: a fila pode preservar estado fora da URL. O aceite comercial anterior não foi anulado; falta evidência atual de funcionamento ponta a ponta.

### 3. P1 para campanha mensurada — Comprovar recebimento e atribuição no GA4

O isolamento local/preview e os contratos de eventos passaram. Isso não comprova chegada dos eventos à propriedade, disponibilidade dos parâmetros nos relatórios ou continuidade até o checkout. A inicialização em [analytics.mjs](../src/analytics.mjs) depende do hostname autorizado; domínio novo exige atualizar a configuração.

**Para liberar uma campanha com avaliação de conversão:** confirmar propriedade/fluxo, filtros e dimensões; observar uma tentativa no DebugView; conferir o plano e as versões recebidos; testar continuidade da identidade/sessão após a fila; identificar o evento de contratação efetiva no destino. Incluir a origem `alternativa-setor`, presente em [App.vue](../src/App.vue), além das três origens principais. Conferir também a política de coleta aplicável; esta revisão não determina obrigação de criar um banner.

O Google recomenda conferir a mesma tag/fluxo e a configuração de medição entre domínios; UTMs e um evento de clique não demonstram essa continuidade. [Documentação oficial](https://support.google.com/analytics/answer/10071811?hl=pt-BR).

Esta pendência não impede tecnicamente renderizar o quiz; impede afirmar que o funil de conversão está validado.

### 4. P1 — Corrigir dois pontos de acessibilidade

**CTA:** em [App.vue](../src/App.vue), o texto visível é `Assinar agora`, enquanto o nome acessível é `Assinar o plano Cabuloso Max` no cenário testado. O axe identificou `label-content-name-mismatch`, impacto `serious`. O texto visível deve fazer parte do nome acessível, conforme [WCAG 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

Correção sugerida: `:aria-label="winner ? \`Assinar agora o plano ${winner.plan.nome}\` : 'Sem plano no orçamento'"`. Verificar também o estado sem elegível. Reexecutar o teste de CTA e a checagem axe.

**Vídeo de fundo:** [SiteFrame.vue](../src/components/SiteFrame.vue) inicia automaticamente um vídeo em loop de **60,75 segundos**, sem controle de pausar/parar/ocultar para o visitante com preferências padrão. A opção global de movimento reduzido o esconde via CSS, mas não oferece esse controle a todos. Conteúdo em movimento automático por mais de cinco segundos precisa desse mecanismo quando apresentado em paralelo ao conteúdo e sem função essencial. [WCAG 2.2.2](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

Correção sugerida: oferecer botão acessível de pausar/retomar, ou usar o pôster estático. Ao esconder o vídeo por movimento reduzido, também pausar/descarregar a mídia: no navegador testado, `display: none` coexistiu com `paused: false`.

### 5. P1 — Entregar e conferir a versão que foi validada

A leitura pública de `https://quiz-socio.vercel.app/` retornou HTTP 200 e HTML de 120.728 bytes, com `./quiz-engine.js` e `/_vercel/insights/script.js`. `build-manifest.json` retornou 404. O domínio ainda serve a aplicação estática anterior; o build local Vue usa assets compilados e manifesto.

**Para liberar a versão atual:** após resolver o gate, gerar candidato aprovado, validar o pacote isolado, obter CI verde, integrar pela política do repositório e publicar a entrega autorizada. Depois comparar manifesto/hashes e executar smoke test no domínio final. Registrar o deployment anterior e o procedimento de rollback. Merge não é uma exigência intrínseca do Vue, mas faz parte da rastreabilidade adotada neste projeto.

Não executar deploy apenas porque `npm run build` passa: o gate de produção está corretamente recusando a configuração atual. Nenhuma publicação foi realizada nesta auditoria.

## Melhorias relevantes que não bloqueiam sozinhas a publicação

| Prioridade | Achado | Ação recomendada e critério de conclusão |
| --- | --- | --- |
| P2 | O build tem cerca de 15 MiB; aproximadamente 14 MiB são do vídeo | Medir abertura em aparelho/rede móvel, reduzir/remover mídia ou carregá-la sob demanda. Não confundir tamanho de `dist` com bytes transferidos ou Core Web Vitals medidos. JS: 299,65 kB bruto / 65,77 kB gzip; CSS: 30,91 / 6,86 kB |
| P2 | Validação de navegador executada somente em Chrome; fontes e imagens externas são bloqueadas pelo harness | Fazer smoke em Safari/iPhone e Android real, com fontes e branding reais, zoom e teclado/leitor de tela. As imagens externas quebradas nas capturas isoladas são efeito deliberado do bloqueio de rede, não prova de defeito público |
| P2 | `verify-external.mjs` ainda compara o HTML público com `index.html` fonte e procura marcadores de lógica no HTML | Adaptar a verificação para o `dist`, assets e manifesto Vite. A igualdade com o HTML-fonte deixará de ser um critério válido após a migração. A identificação do legado nesta revisão usou também os scripts públicos e o 404 do manifesto |
| P2 | Cabeçalhos públicos não incluíam CSP, X-Content-Type-Options, Referrer-Policy ou proteção contra enquadramento; HSTS estava presente | Avaliar e configurar uma política compatível com GA4, fontes, imagens e mídia. Não foi explorada vulnerabilidade nem demonstrado comprometimento; ausência isolada não foi tratada como bloqueador crítico |
| P2 | Inicialização tem mensagem amigável e erro no console, mas não há evidência de alerta operacional de indisponibilidade/erros | Definir responsável e uma verificação simples de disponibilidade e erros no ambiente final, sem enviar respostas pessoais para logs |
| P2 | Árvore de acessibilidade do Chrome ainda expõe controles de fundo com o comparativo aberto | Validar com leitor de tela real e considerar `inert` no conteúdo de fundo. O componente já tem `aria-modal`, Escape, contenção de Tab e retorno de foco; exposição na árvore isoladamente não prova falha em todas as tecnologias assistivas |

## Relevância dos tickets existentes

Esta comparação foi feita depois do diagnóstico acima. A existência ou o status do ticket não foi usado como prova de problema.

| Ticket/grupo | Relevância observada |
| --- | --- |
| Qualidade/08 — aceite e candidato | **Alta, bloqueador atual:** a execução independente confirmou quatro regressões e `releaseApproved: false`. O artefato diagnóstico não atende à entrega aprovada |
| Qualidade/09 — integração e publicação | **Alta:** o domínio serve o legado e a versão validada continua local. Fazer depois do aceite/correções, não como tentativa de resolver o gate |
| QUIZ-017 — propriedade e relatórios GA4 | **Alta para mensuração:** eventos locais passam; ingestão e relatórios continuam sem comprovação. Não há evidência nesta revisão para declarar a propriedade incorreta |
| QUIZ-018 — contrato publicado | **Alta:** precisa distinguir legado público de Vue local e verificar o contrato efetivamente servido depois da entrega |
| QUIZ-019 — continuidade até checkout | **Alta para conversão:** os redirecionamentos e a fila impediram confirmar oferta/atribuição nesta rodada |
| Qualidade/01–07 | As entregas locais principais estão presentes e a suíte passou. Não há motivo para reabrir em bloco. O peso da mídia e o diagnóstico de publicação ainda admitem melhorias específicas |
| Migração `port-vue` | A implementação e os testes existem. Repetir a migração não resolve as pendências atuais; a decisão sobre ranking e a entrega continuam relevantes |

As lacunas do nome acessível do CTA e do controle do vídeo merecem registro próprio; não estão resolvidas pela mera conclusão dos tickets de navegação/teclado. Não foi alterado o status de nenhum ticket.

## Limites do parecer

A amostragem de invariantes da suíte executou 1.546 combinações, em espaço nominal de 6.856.704; não foi uma avaliação exaustiva de todas as respostas. Os 40 cenários de qualidade são sintéticos. Não houve teste com usuários reais, Safari/Firefox, carga de campanha, Core Web Vitals de campo, inspeção autenticada no GA4 ou acesso ao checkout após o desafio. O axe deixou verificações de contraste/áudio como inconclusivas; ausência de violação automática nesses itens não constitui certificação de acessibilidade. Um achado inicial de contraste durante transição não persistiu com movimento reduzido e foi descartado.

Os pontos fortes são concretos: motor compartilhado entre aplicação e testes, configuração validada, empates determinísticos, defesa do orçamento, regressões identificadas sem alterar as expectativas, coleta isolada em testes/preview, pacote público restrito e CI configurado no monorepo. Não foi consultado o estado remoto atual do CI nem da proteção de branch. As pendências acima não justificam uma reescrita ou a introdução de backend/banco de dados no escopo atual.
