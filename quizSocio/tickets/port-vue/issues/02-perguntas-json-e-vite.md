# 02: Perguntas JSON do build ao quiz

**O que construir:** permitir editar texto e ordem das 12 perguntas em JSON e ver o resultado no quiz público servido pelo Vite, ainda com o renderizador vigente durante a transição.

**Bloqueado por:** [01 — Motor configurável com paridade](01-motor-configuravel-com-paridade.md)

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P2
**Spec:** [Quiz público em Vue e configuração em JSON](../../../docs/spec-port-vue.md)

## Critérios de aceite

- [x] Introduzir Vite com versão de Node compatível, dependências travadas e comandos de desenvolvimento, build e preview documentados.
- [x] Extrair as 12 perguntas e validar estrutura e significado antes do build; explicitar opções e faixas sem converter valores.
- [x] Texto, ajuda e ordem válidos aparecem na interface; IDs semânticos, tipos ou valores incompatíveis são rejeitados com motivo e campo.
- [x] A opção de histórico desconhecido, zero e falso continuam válidos; retorno preserva a seleção correta e o número de perguntas permanece 12.
- [x] O adaptador compartilha a configuração entre interface, motor e testes; não existe outra cópia editável das perguntas no motor.
- [x] O fluxo completo e os cenários de navegador executam contra a saída compilada, mantendo o contrato atual de analytics durante a transição.
- [x] Uma falha de configuração impede gerar o candidato, sem substituir o anterior.

## Verificação

build seguido de jornada real no navegador e mutações inválidas de configuração; testes não dependem da presença de um literal de pergunta no código-fonte.

## Registro de execução

Verificado em 28/10/2026 após a revisão/correção: `npm test` executou validação, build Vite e 120 testes, todos aprovados. [Relatório dos dois eixos](../../../docs/revisao-port-vue-2026-10-28.md) e [log](../../../tickets/evidencias/port-vue-2026-10-28/npm-test.log). Não houve deploy nem alteração no GA4.
