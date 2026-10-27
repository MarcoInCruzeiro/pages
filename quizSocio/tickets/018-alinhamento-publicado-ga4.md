# QUIZ-018 — Alinhar o contrato de analytics da versão publicada

Status: Bloqueado
Prioridade: P1

## Descrição

O endereço indicado no `og:url` contém uma versão anterior ao código local. Seu `quiz_complete` não inclui os campos atuais de afinidade, semântica e versão. Essa divergência impede tratar os testes locais como prova da integração publicada. Evidência: [verificação pública de 26/10/2026](evidencias/ga4/verificacao-publica.json).

## Escopo

- Confirmar com o responsável qual domínio é o ambiente oficial, qual versão está publicada e como a entrega é feita.
- Preparar a revisão e a entrega das correções de GA4, com identificação da versão, configuração de ambientes do QUIZ-013 e roteiro de validação/retorno à versão anterior.
- Após a entrega pelo responsável, verificar o HTML, os recursos carregados, os payloads e o recebimento da versão publicada.
- Documentar a data da migração de semântica do score para distinguir os dados antigos dos atuais.

Criar este ticket não executa deploy. A publicação continua sendo uma ação separada, conforme o backlog existente.

## Critérios de aceite

- [ ] Domínio oficial, versão de origem e processo de entrega estão registrados; um endereço de metadados é apenas evidência inicial.
- [ ] O artefato preparado contém as correções locais verificadas no QUIZ-016 e a política de ambientes aplicável ao domínio confirmado.
- [ ] O escopo da entrega e seus bloqueadores estão explícitos. Publicar o conjunto atual depende do encerramento do QUIZ-011; uma entrega de escopo diferente precisa de definição própria e verificação correspondente.
- [ ] Após publicação, o domínio oficial carrega a versão identificada e emite o contrato vigente, incluindo `rules_version`.
- [ ] Uma execução controlada confirma recebimento e parâmetros no DebugView da propriedade correta, distinguindo intenção de contratar de contratação efetiva.
- [ ] O registro informa data, versão publicada, resultados e como separar a série antiga de `compatibility` da afinidade atual.
- [ ] O roteiro de retorno identifica a versão anterior e a configuração de analytics correspondente.

## Bloqueadores

- Externo atual: domínio oficial e processo de publicação não confirmados. **Responsável:** mantenedor do site. **Desbloqueio:** confirmar o destino e fornecer acesso/processo de entrega, ou executar a entrega preparada.
- Dependências de validação: [QUIZ-016](016-regressao-da-integracao-ga4.md) e [QUIZ-017](017-configuracao-e-validacao-ga4.md).
- Dependência da publicação do conjunto atual: [QUIZ-011](011-regressao-e-entrega.md), com suas pendências comerciais e de avaliação ainda abertas.

## Verificação

Comparar versão e contrato no artefato preparado antes da entrega. Após a publicação, repetir a leitura do domínio oficial e uma execução de medição controlada seguindo o roteiro do QUIZ-017. Registrar o que foi comprovado por código, rede e painel; a presença da tag sozinha não comprova recebimento.

## Registro de conclusão

Pendente: confirmação do ambiente, artefato/versão, entrega realizada e evidências de recebimento.
