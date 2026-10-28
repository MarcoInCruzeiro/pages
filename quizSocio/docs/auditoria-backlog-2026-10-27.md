# Auditoria dos tickets executados e abertos

Data: 27/10/2026. Referência: `8250641`, com alterações locais no catálogo e em arquivos de referência/testes. A verificação usa o estado atual do workspace, não um checkout limpo desse commit.

## Resultado

O backlog tem **19 tickets: 12 concluídos e sete bloqueados**. As correções locais dos concluídos estão presentes no código e a suíte atual passou **71/71**, sem falhas, cancelamentos ou testes ignorados: 39 testes de motor/referência e 32 de navegador.

Os sete tickets abertos contêm trabalho parcial ou dependem de comprovação externa. **Não foi identificado ticket aberto com todos os critérios comprovados que possa ser encerrado apenas por atualizar seu status.**

As falhas da revisão anterior foram corrigidas: a preparação do navegador usa expressão em texto, o isolamento cobre os loopbacks examinados, existem testes permanentes de preview e versões, e o CTA principal usa um link HTML real.

## Tickets concluídos

| Ticket | Implementação e verificação encontrada |
| --- | --- |
| QUIZ-001 | Bloqueio de navegação, validação, preservação de respostas e conclusão única; testes de cliques repetidos, retorno, conflito e refazer. |
| QUIZ-002 | Catálogo central, condições e pendências documentadas, benefícios derivados do cadastro. A conferência da oferta real no checkout permanece no QUIZ-003. |
| QUIZ-004 | Afinidade estimada, motivos e campos de analytics preservados; apresentação e contrato exercitados no navegador. |
| QUIZ-005 | Cobertura de setores explícita, aviso e alternativa; testes de motor e interface. |
| QUIZ-006 | Mapeamento das respostas e confirmação de contradições; testes de perfil, conflitos e revisão. |
| QUIZ-007 | Histórico separado da intenção futura; limites de nível, desconto e prioridade cobertos por testes. |
| QUIZ-008 | Assinatura, adesão, Kids e benefício de ingresso separados; orçamento e preço usam a assinatura conforme a ADR-0001. |
| QUIZ-012 | Preview por parâmetro/hash explícitos; falsos positivos de UTM e percurso completo possuem testes permanentes. |
| QUIZ-013 | Lista explícita de ambientes, exclusão de preview e desenvolvimento, incluindo `[::1]` e `127.0.0.2`; observação da decisão original e interceptação antes da transmissão. |
| QUIZ-014 | `rules_version` vem do resultado do motor; testes de unidade e navegador comparam com a versão vigente, inclusive ao refazer. |
| QUIZ-015 | CTA principal como link real; resultado, lista, comparativo e teclado exercitados com navegação interceptada. |
| QUIZ-016 | Regressão integrada de inicialização, URLs, contrato e CTAs, executada pelos comandos normais do projeto. |

Limites: os testes usam captura local de analytics, não comprovam recebimento na propriedade. O estado sem plano elegível é simulado no DOM no teste do CTA, pois não é alcançável pelos orçamentos atuais da interface; o motor também possui cobertura própria desse estado. A conferência documental de condições comerciais não substitui abrir a oferta real.

## Tickets abertos: o que já existe e o que falta

| Ticket | Trabalho já implementado | Pendência para encerrar | Status recomendado |
| --- | --- | --- | --- |
| [QUIZ-003](../tickets/concluidos/003-modalidade-e-checkout.md) | Contratação anual, parcelas, adesão separada, links e UTMs ajustados no código. | Confirmar oferta, plano, modalidade e preço nos cinco destinos, especialmente Meu Cruzeiro. A nova consulta dos cinco links retornou 403 com desafio do Cloudflare. | Manter bloqueado: implementação local parcial, conferência externa pendente. |
| [QUIZ-009](../tickets/concluidos/009-referencia-de-qualidade.md) | Políticas, metas, cenários completos, partições e proveniência versionados. | Referência de negócio independente, definida sem consultar resultados e congelada antes de nova calibração. `independentValidation` continua `false`. | Manter bloqueado: a base atual comprova regressão sintética. |
| [QUIZ-010](../tickets/concluidos/010-recalibracao-do-ranking.md) | Ranking atual com restrição de orçamento, componentes documentados, setor explícito e desempate determinístico. | Avaliar a versão final na referência independente do QUIZ-009 e comprovar as metas. | Manter bloqueado: cálculo implementado, validação independente pendente. |
| [QUIZ-011](../tickets/concluidos/011-regressao-e-entrega.md) | Suíte permanente, relatórios, cenários e roteiros locais disponíveis; a regressão atual passa. | Concluir QUIZ-003, QUIZ-009 e QUIZ-010 e consolidar as evidências finais. | Manter bloqueado: a execução local não encerra as dependências. |
| [QUIZ-017](../tickets/017-configuracao-e-validacao-ga4.md) | Tag, eventos e parâmetros implementados nos tickets locais de GA4. | Conferir propriedade/fluxos, dimensões, métricas, eventos principais, filtros e recebimento no Admin/DebugView. Não há evidência nova dessa conferência. | Manter bloqueado: instrumentação não comprova configuração da propriedade. |
| [QUIZ-018](../tickets/018-alinhamento-publicado-ga4.md) | Correções locais e contrato atual preparados no commit `8250641`; há configuração explícita de ambiente. | Confirmar o domínio oficial, processo e escopo da entrega, publicar pelo fluxo definido e comprovar recebimento. O endereço referenciado pelo projeto ainda entrega o contrato antigo. | Manter bloqueado: a parte local existe, o alinhamento publicado não foi concluído. |
| [QUIZ-019](../tickets/019-continuidade-ate-checkout-ga4.md) | Três origens de CTA, links reais, UTMs e eventos de intenção verificados localmente. | Comprovar transferência de identificação/sessão e preservação após redirecionamentos, com observação nas duas pontas; identificar o evento de contratação no destino. | Manter bloqueado: cliques locais não comprovam continuidade entre domínios. |

## Problemas documentais encontrados

**P2 — 11 links locais quebrados.** A movimentação para `concluidos/` deixou referências com a profundidade antiga. Há links incorretos para código e relatório nos tickets concluídos, além de dependências em QUIZ-017, QUIZ-018 e QUIZ-019 apontando para arquivos que mudaram de pasta. A lista completa está no [inventário](../tickets/evidencias/ga4/auditoria-backlog-2026-10-27/inventario.json).

**P2 — Instrução de retomada desatualizada.** O [README do backlog](../tickets/README.md) informa que QUIZ-012 a QUIZ-016 foram concluídos, mas ainda manda reparar primeiro a preparação dos testes e o isolamento no QUIZ-013. Essa orientação corresponde ao estado anterior à correção e deve ser removida ou identificada como histórica.

Esses problemas prejudicam a navegação e a leitura dos registros. Não demonstram uma regressão funcional nas correções locais examinadas e não justificam, isoladamente, reabrir os tickets de implementação.

## Conferência pública e limites da medição

A leitura HTTP de [quiz-socio.vercel.app](https://quiz-socio.vercel.app/) respondeu 200. O `quiz_complete` servido ainda contém `compatibility: winner.compatibilityPercent`, sem os campos locais `affinity_index`, `score_semantics`, `catalog_version` e `rules_version`. Também não importa o motor externo atual. Isso confirma a pendência de alinhamento desse endereço; sua condição de domínio oficial ainda precisa ser confirmada pelo responsável.

Os cinco links atuais de contratação foram consultados por GET, sem login, envio de formulário ou compra, e retornaram 403 com desafio do Cloudflare. O bloqueio impede confirmar a oferta; não comprova que as URLs ou os preços estejam incorretos.

Não houve acesso ao GA4 Admin. A suíte bloqueia analytics e contratação antes da transmissão; seus resultados comprovam comportamento local, não ingestão, atribuição real ou conversão no destino.

## Evidências desta rodada

- [Execução de `npm test`: 71/71](../tickets/evidencias/ga4/auditoria-backlog-2026-10-27/npm-test.tap).
- [Consultas HTTP do quiz e cinco destinos](../tickets/evidencias/ga4/auditoria-backlog-2026-10-27/verificacao-http.json).
- [Inventário de status, critérios pendentes e links quebrados](../tickets/evidencias/ga4/auditoria-backlog-2026-10-27/inventario.json).
- [Proveniência da referência sintética](../tests/fixtures/reference-provenance.json).

Esta rodada adiciona relatório e evidências. Código e status dos tickets foram preservados.
