# QUIZ-017 — Conferir a configuração da propriedade e dos relatórios GA4

Status: Bloqueado
Prioridade: P2

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
- [ ] Um roteiro de DebugView identifica eventos e parâmetros esperados do contrato vigente e o ambiente no qual será executado.
- [ ] A coleta de validação é diferenciada do tráfego normal; evidências e decisões são registradas sem credenciais ou identificadores pessoais brutos.

## Bloqueadores

- Externo atual: falta de acesso à propriedade e às configurações do destino. **Responsável:** administrador de analytics e responsável pela plataforma de sócios. **Desbloqueio:** acesso adequado ou execução acompanhada por esses responsáveis, com evidências das configurações.
- Dependência de código para conferir o campo novo: [QUIZ-014](014-versao-das-regras-no-ga4.md). O inventário pode começar antes.
- Definição dos eventos principais: responsável pelo produto deve indicar quais ações deseja medir como resultado de negócio.

## Verificação

Conferir o inventário no Admin e registrar a configuração antes/depois dos ajustes. Usar uma execução controlada no DebugView para validar o contrato disponível; a confirmação da versão em produção é o aceite do QUIZ-018, e a identidade entre domínios é o aceite do QUIZ-019. A disponibilidade posterior nas explorações deve ser conferida após o processamento, sem inferi-la apenas do DebugView.

## Registro de conclusão

Pendente: responsável pela conferência, configurações e decisões, data, evidências e validação nos relatórios.
