# QUIZ-017 — Conferir a configuração da propriedade e dos relatórios GA4

Status: Bloqueado
Prioridade: P2

Bloqueio mantido por solicitação expressa do usuário em 27/10/2026. Os detalhes abaixo indicam o que foi preparado localmente e o que requer acesso à propriedade.

## Descrição

O código contém uma tag e parâmetros personalizados, mas o Admin, o DebugView e os relatórios não foram acessados. Não está comprovado que os parâmetros possam ser usados nas análises nem que o checkout compartilhe a configuração de medição. Esta é uma validação pendente, sem presumir erro na propriedade.

## Escopo

- Confirmar a propriedade e os fluxos correspondentes ao quiz e ao site de contratação, com seus domínios e responsáveis.
- Inventariar dimensões, métricas, eventos principais e filtros existentes; ajustar os itens necessários aos relatórios definidos pelo responsável pelo produto.
- Definir os domínios aplicáveis à medição conjunta e uma forma controlada de validar recebimento sem confundir o preview fictício com depuração GA4.
- Registrar a política de coleta vigente. Se houver requisito de escolha prévia, documentar a lacuna e abrir um ticket específico de implementação; esta conferência não presume a necessidade de uma nova interface de consentimento.

Fontes: contrato em [estrutura_quiz.md](../estrutura_quiz.md#9-analytics) e [pendências da análise](../docs/analise-ga4.md#pendências-de-configuração-e-política).

## Critérios de aceite

- [ ] Propriedade, fluxos, domínio oficial do quiz e destinos de contratação estão identificados por evidência datada.
- [ ] Os parâmetros necessários estão registrados com escopo e tipo adequados, incluindo `rules_version` após QUIZ-014; decisões sobre campos dispensados ficam justificadas.
- [ ] Conclusão do quiz, clique para contratar e contratação efetiva têm significados distintos nos eventos principais e relatórios.
- [ ] Filtros internos/de desenvolvedor e suas consequências para a validação estão registrados.
- [ ] A configuração entre os domínios foi conferida nas duas pontas, ou o impedimento está explicitado; compartilhar um identificador por comentário não basta como evidência.
- [x] Um roteiro de DebugView identifica eventos e parâmetros esperados do contrato vigente e o ambiente no qual será executado. Preparado em `docs/validacao-e-entrega.md`; sua execução na propriedade continua pendente.
- [ ] A coleta de validação é diferenciada do tráfego normal; evidências e decisões são registradas sem credenciais ou identificadores pessoais brutos.

## Bloqueadores

- Externo atual: falta de acesso à propriedade e às configurações do destino. **Responsável:** administrador de analytics e responsável pela plataforma de sócios. **Desbloqueio:** acesso adequado ou execução acompanhada por esses responsáveis, com evidências das configurações.
- Dependência de código para conferir o campo novo: [QUIZ-014](concluidos/014-versao-das-regras-no-ga4.md). O inventário pode começar antes.
- Definição dos eventos principais: responsável pelo produto deve indicar quais ações deseja medir como resultado de negócio.

## Verificação

Conferir o inventário no Admin e registrar a configuração antes/depois dos ajustes. Usar uma execução controlada no DebugView para validar o contrato disponível; a confirmação da versão em produção é o aceite do QUIZ-018, e a identidade entre domínios é o aceite do QUIZ-019. A disponibilidade posterior nas explorações deve ser conferida após o processamento, sem inferi-la apenas do DebugView.

## Registro de conclusão

Pendente: responsável pela conferência, configurações e decisões, data, evidências e validação nos relatórios.

## Execução local — 27/10/2026

Preparados o [inventário de dimensões/métricas e o roteiro de DebugView](../docs/validacao-e-entrega.md#3-conferir-a-propriedade-ga4--quiz-017), com tipos dos campos, versões e distinção entre conclusão, clique e contratação. O inventário é uma proposta de configuração, não um registro de alterações feitas no Admin.

A busca de integrações encontrou Vercel e Windsor.ai, mas ambas estavam sem conexão confirmada. Nenhum navegador conectado estava disponível. O código contém o ID de medição `G-EF75QCTCTV`; não há ID numérico da propriedade ou acesso ao Admin confirmado, nem comprovação do fluxo do checkout.

O status permanece bloqueado para executar o inventário na propriedade e confirmar recebimento. A parte local do roteiro está pronta; os demais critérios mantêm o aceite original.

## Tentativa de execução do Admin/DebugView — 27/10/2026

O acesso foi reconferido durante a execução dos QUIZ-010-A a 017. Não há sessão de navegador disponível, ferramenta GA4 conectada, CLI Google autenticada disponível ou credencial Google configurada para esta execução. A integração Windsor.ai foi localizada, mas permanece não instalada/conectada. Nenhuma sugestão de integração foi repetida nesta rodada.

[Diagnóstico de acesso](evidencias/017/acesso-2026-10-27.json). O ID `G-EF75QCTCTV` foi identificado no código; ID numérico da propriedade e fluxo continuam desconhecidos. Não foram lidos nem alterados filtros, dimensões, métricas ou eventos principais, e nenhum recebimento no DebugView foi declarado.

As verificações locais do contrato e os roteiros estão disponíveis, mas o encerramento deste ticket exige uma sessão autenticada com acesso à propriedade, conexão GA4 autorizada ou execução acompanhada pelo administrador. A falta é de acesso externo, não de permissão para continuar as correções locais. O status permanece bloqueado apenas nesses critérios.

## Detalhamento solicitado pelo usuário

### O que esta tarefa deve entregar

Comprovar que os eventos e parâmetros produzidos pelo quiz chegam à propriedade correta, podem ser usados nos relatórios e seguem a configuração de filtros e conversões definida pelo produto. Esse aceite é administrativo e de recebimento real; os testes locais do QUIZ-016 não o substituem.

### O que já está pronto

- Tag de medição no código: `G-EF75QCTCTV`; domínio habilitado localmente: `quiz-socio.vercel.app`.
- Eventos: `quiz_start`, `quiz_answer`, `quiz_complete`, `quiz_subscribe_click`.
- Payload com plano, origem do CTA, respostas, tempos, afinidade e versões de catálogo/regras.
- Isolamento de preview/desenvolvimento e captura local antes da transmissão.
- [Inventário de parâmetros e roteiro de DebugView](../docs/validacao-e-entrega.md#3-conferir-a-propriedade-ga4--quiz-017).
- Reexecução dos critérios locais dos QUIZ-012 a 016: 82 testes aprovados no workspace e na cópia isolada. [Log](evidencias/011-consolidacao-2026-10-27/npm-test-workspace.tap).

### O que falta conferir na conta

| Item | Conferência necessária | Evidência de aceite |
| --- | --- | --- |
| Propriedade e fluxo | Identificar o ID numérico/nome da propriedade e o fluxo que contém `G-EF75QCTCTV`; confirmar o domínio do quiz | Registro datado de propriedade, fluxo e domínio |
| Definições personalizadas | Conferir plano/origem/pergunta/resposta/versões como dimensões e afinidade/tempos como métricas, conforme o inventário | Lista do que existe, do que foi criado e do que foi dispensado com justificativa |
| Eventos principais | Definir se conclusão e clique serão eventos principais; contratação efetiva pertence ao evento do checkout | Decisão do produto e configuração conferida no Admin |
| Filtros | Verificar tráfego interno e de desenvolvedor, distinguindo dados de validação de tráfego normal | Configuração e efeito esperado documentados |
| DebugView | Acompanhar uma tentativa normal com depuração do dispositivo; preview do quiz permanece excluído | Eventos recebidos e parâmetros coerentes com a tentativa |
| Relatórios | Conferir a disponibilidade dos parâmetros registrados após processamento | Registro de consulta ao relatório/exploração |
| Domínios | Conferir a tag/fluxo no site de sócios e a configuração conjunta aplicável | Configuração das duas pontas ou impedimento específico registrado |

Para uma tentativa sem retorno/revisão, o roteiro espera um início, 12 respostas e uma conclusão. Um clique de contratação acrescenta um evento com a origem correta. Voltar/refazer pode gerar eventos adicionais legítimos e deve ser interpretado pelo contrato.

### Acesso necessário e retomada

É necessária uma sessão autorizada na propriedade ou execução do roteiro pelo administrador. Para criar/alterar definições e configuração de domínio, o responsável deve ter função Editor ou superior, conforme a [documentação de parâmetros](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters) e [medição entre domínios](https://support.google.com/analytics/answer/10071811?hl=pt-BR). Uma conexão apenas de leitura pode ajudar a conferir dados, mas não comprova nem executa alterações do Admin.

Quando esse acesso estiver disponível, registrar os IDs da propriedade/fluxo, conferir o inventário existente, aplicar as decisões necessárias e executar o DebugView. O ticket só será concluído com as evidências acima. O QUIZ-018 usa esse resultado para o aceite da versão publicada; o QUIZ-019 comprova a continuidade de identidade no checkout. Preços e ofertas já aceitos no QUIZ-003 não serão revalidados por esta tarefa.
