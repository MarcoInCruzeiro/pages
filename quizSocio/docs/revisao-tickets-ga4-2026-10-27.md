# Revisão da execução dos tickets de GA4

Data: 27/10/2026. Escopo principal: QUIZ-012 a QUIZ-019, confrontados com o código e os critérios propostos. A suíte completa também foi executada para detectar regressões nos tickets anteriores.

Registro histórico anterior à reabertura. Após esta revisão, QUIZ-012, QUIZ-013 e QUIZ-014 foram reabertos em 27/10/2026; o estado vigente está no [backlog](../tickets/README.md).

**Parecer: solicitar correções.** As funcionalidades centrais de QUIZ-012 e QUIZ-014 estão presentes e foram observadas em navegador. QUIZ-013 foi encerrado com um defeito de isolamento e uma alteração que quebra todos os testes de navegador. Os cinco tickets restantes de GA4 continuam abertos, conforme registrado.

## P1 — A preparação dos testes está quebrada

Local: [tests/browser.test.js](../tests/browser.test.js), `setup()`, linha 103.

A chamada nova passa uma função a `page.evaluate()`, mas o cliente deste projeto recebe uma expressão JavaScript em texto e a encaminha diretamente a `Runtime.evaluate`. A função desaparece na serialização da mensagem CDP e o Chrome rejeita o comando:

```text
Failed to deserialize params.expression - BINDINGS: mandatory field missing
```

**Resultado reproduzido:** `npm test` terminou com **38 testes aprovados e 17 falhas**. Todos os testes de navegador falham no preparo, antes de verificar o comportamento pretendido. Esse defeito foi introduzido na adaptação documentada pelo QUIZ-013.

**Correção necessária:** usar a interface de avaliação existente, por exemplo `page.evaluate('window.coletaHabilitada = true')`, e executar novamente a suíte. A habilitação artificial deve ficar restrita aos testes de contrato; os testes de isolamento precisam observar a decisão original da página.

## P1 — O isolamento falha em loopback IPv6 e em outros endereços IPv4 de loopback

Local: [index.html](../index.html), detecção de `isLocalhost`, linhas 35–39.

O código compara `location.hostname` com `::1`, enquanto o navegador retorna `[::1]`. Na execução isolada de `http://[::1]/`, foram observados `coletaHabilitada = true`, o comando `config` da propriedade real e a inserção de `gtag.js`. O mesmo ocorreu com `http://127.0.0.2/`, pois o código cobre somente `127.0.0.1`.

**Impacto:** desenvolvimento nesses endereços pode entrar na medição de produção. O critério de isolamento IPv4/IPv6 do QUIZ-013 está marcado como atendido, mas falha na prática. Todas as requisições da revisão foram interceptadas antes da transmissão.

**Correção necessária:** reconhecer os endereços locais exigidos pelo ticket, com normalização adequada do hostname, e cobrir esses casos antes da inicialização da tag. A configuração de ambientes remotos também precisa ficar explícita: atualmente qualquer hostname remoto fora do preview habilita a propriedade real.

## P2 — O encerramento não comprova todos os critérios de aceite

Locais: registros de QUIZ-012, QUIZ-013 e QUIZ-014 em [tickets/concluidos/](../tickets/concluidos/), e asserções de analytics em [tests/browser.test.js](../tests/browser.test.js), linhas 482–490.

Os três registros citam somente a execução dos 38 testes de motor e referência. Esses arquivos não exercitam `location`, carregamento da tag ou o payload enviado pela interface. Não há teste permanente para as URLs novas, para o isolamento ou para `rules_version`; a busca nos testes encontrou apenas a alteração de `coletaHabilitada` em `setup()`.

O QUIZ-014 original exigia comparar o campo com o motor vigente em um teste. Esse critério deixou de aparecer na lista ao encerrar o ticket. O payload atual tem **20 parâmetros personalizados**, embora o registro de conclusão ainda cite os 19 da auditoria anterior.

**Correção necessária:** preservar os critérios originais, acrescentar as verificações de navegador exigidas, registrar resultados pertinentes e corrigir a contagem. A implementação do campo foi confirmada nesta revisão, mas isso não substitui sua cobertura permanente.

## P2 — A movimentação dos tickets deixou referências quebradas

Foram encontrados estes destinos inexistentes:

- No [QUIZ-016](../tickets/016-regressao-da-integracao-ga4.md), os links para QUIZ-012, QUIZ-013 e QUIZ-014 continuam apontando para a raiz de `tickets/`, em vez de `concluidos/`.
- No [QUIZ-017](../tickets/017-configuracao-e-validacao-ga4.md), o link para QUIZ-014 tem o mesmo problema.
- No [QUIZ-012](../tickets/012-preview-explicito.md), o link de evidência usava `evidencias/...` a partir de `concluidos/`, sem subir um diretório. O retorno à raiz na reabertura restaura esse destino.

**Correção necessária:** atualizar os caminhos após mover os arquivos e conferir a existência dos destinos. O log apontado pelo QUIZ-012 também deve corresponder à verificação dos critérios desse ticket.

## Situação por ticket

| Ticket | Status registrado | Avaliação desta revisão |
| --- | --- | --- |
| QUIZ-012 | Concluído | Detecção explícita funciona nos casos examinados; evidência original e cobertura permanente são insuficientes. |
| QUIZ-013 | Concluído | Encerramento incorreto: falha de isolamento e regressão na preparação dos testes. Deve ser reaberto. |
| QUIZ-014 | Concluído | Campo correto no fluxo examinado; falta o teste exigido contra o motor e o registro precisa ser corrigido. |
| QUIZ-015 | Planejado | Continua sem implementação: CTA principal ainda chama `window.open()`. Status coerente. |
| QUIZ-016 | Planejado | Cobertura nova ainda ausente; a suíte atual está quebrada. Status aberto coerente. |
| QUIZ-017 | Bloqueado | Não há evidência nova de Admin/relatórios que permita encerrar. |
| QUIZ-018 | Bloqueado | Não há evidência nova de alinhamento da versão publicada e recebimento no GA4. |
| QUIZ-019 | Bloqueado | Não há comprovação nova de continuidade da medição até o checkout. |

O inventário geral tem 19 tickets: dez marcados como concluídos, dois planejados e sete bloqueados. Essa contagem descreve os registros, não dez aprovações independentes desta revisão. QUIZ-003, QUIZ-009, QUIZ-010 e QUIZ-011 continuam abertos; esta rodada não revalidou ofertas comerciais nem a precisão do recomendador em uma referência independente.

## O que funcionou e como foi verificado

- A decisão de preview é compartilhada e usa o nome do parâmetro. `?preview`, `?preview=1`, `?preview=false` e `#preview` abriram o resultado fictício, sem configurar a tag.
- `?utm_campaign=preview_newsletter`, `?utm_content=preview` e `?notpreview=1` mantiveram o início normal e não foram confundidos com preview.
- `localhost` e `127.0.0.1` ficaram fora da coleta no carregamento original. A detecção por protocolo também exclui arquivos locais no código.
- Um percurso completo isolado gerou um início, 12 respostas e uma conclusão. `rules_version` correspondeu ao resultado do motor, e afinidade, catálogo e tempos preservaram seus campos e tipos.
- Os 38 testes de motor/referência passaram. As falhas dos 17 testes de navegador são de preparação e não demonstram, por si só, 17 defeitos distintos na aplicação.

O roteiro isolado executa o HTML original no Chrome e entrega somente HTML e motor por interceptação local, bloqueando as demais requisições antes da transmissão. Ele permite conferir a lógica nos hostnames examinados sem acessar a propriedade GA4. Não valida recebimento, configuração do Admin ou checkout.

## Evidências e próximos passos

- [Saída de `npm test`](../tickets/evidencias/ga4/revisao-2026-10-27/npm-test.tap).
- [Matriz de URLs e payload observado](../tickets/evidencias/ga4/revisao-2026-10-27/verificacao-isolada.json).
- [Roteiro isolado reproduzível](../tickets/evidencias/ga4/revisao-2026-10-27/verificar.cjs), executável com Node e o Chrome já utilizados pelo projeto.

Ordem recomendada: corrigir a preparação dos testes e o isolamento no QUIZ-013; acrescentar as verificações de QUIZ-012/014 e executar a regressão; corrigir as referências e os registros de conclusão; seguir com QUIZ-015/016. Os bloqueios externos de QUIZ-017/018/019 permanecem separados.

Nenhuma alteração de aplicação ou status de ticket foi feita nesta revisão.
