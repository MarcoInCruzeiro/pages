# QUIZ-019 — Comprovar a continuidade da medição até o checkout

Status: Bloqueado
Prioridade: P2

## Descrição

Há UTMs nos destinos comerciais e um evento local de clique, mas a identificação da pessoa e da sessão entre quiz e contratação não foi comprovada. A mudança do CTA principal para link reduz um risco de implementação; a configuração e os redirecionamentos do destino ainda precisam ser exercitados.

## Escopo

- Verificar resultado, lista e comparativo no ambiente oficial, nas condições de coleta definidas pelo QUIZ-017.
- Conferir a decoração de URL quando aplicável e a continuidade dos identificadores de medição após redirecionamentos.
- Identificar se o destino já mede contratação concluída e registrar seu contrato, separando essa medição da intenção capturada pelo quiz.

Este ticket comprova atribuição. A conferência de plano, modalidade e preço continua no [QUIZ-003](003-modalidade-e-checkout.md).

## Critérios de aceite

- [ ] Cada origem de CTA gera o evento correto e abre o destino sem perder os parâmetros necessários à atribuição.
- [ ] Em navegação entre domínios com coleta habilitada, a transferência de identificação é comprovada por URL e observação nas duas pontas; UTMs isoladas não satisfazem o critério.
- [ ] Os identificadores de pessoa e sessão permanecem coerentes no destino dentro da mesma execução controlada. Se o mesmo domínio de cookie tornar `_gl` dispensável, a justificativa e a continuidade observada ficam registradas.
- [ ] Os redirecionamentos exercitados preservam a identificação e não criam atribuição indevida ao próprio site.
- [ ] Há evidência dos três locais de CTA, com acesso ao destino interrompido antes de contratação ou pagamento.
- [ ] O evento que comprova contratação no destino é identificado, ou sua ausência fica registrada com responsável e ticket de implementação próprio. O clique do quiz permanece descrito como intenção.
- [ ] As evidências registram continuidade como resultado da comparação, sem persistir cookies, parâmetros `_gl` ou identificadores pessoais brutos.

## Bloqueadores

- Dependências: [QUIZ-015](015-cta-principal-com-link.md), [QUIZ-017](017-configuracao-e-validacao-ga4.md) e [QUIZ-018](018-alinhamento-publicado-ga4.md), para validar o comportamento final no domínio confirmado.
- Externo atual: o destino de sócios retornou 403 na auditoria. **Responsável:** plataforma de sócios e administrador de analytics. **Desbloqueio:** permitir uma navegação de validação e a conferência da medição no destino, sem compra.

## Verificação

Executar o mesmo roteiro para resultado, lista e comparativo, anotando origem, destino, preservação de parâmetros e resultado da comparação dos identificadores. Conferir no GA4 a continuidade observada. A ausência de acesso ao destino mantém o aceite pendente, mesmo com testes locais passando.

## Registro de conclusão

Pendente: versão/ambiente, responsáveis, matriz por origem de CTA e evidências da continuidade ou dos impedimentos.
