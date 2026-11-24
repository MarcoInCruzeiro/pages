# QUIZ-010-A — Avaliar o ranking na referência de perfis

Status: Concluído
Prioridade: P2
Ticket pai: [QUIZ-010](010-recalibracao-do-ranking.md)

## Descrição

O usuário autorizou a criação de perfis no QUIZ-009. A nova referência contém oito perfis e 16 casos completos, divididos em calibração e validação, com expectativas registradas antes desta avaliação. Este subticket executa a pendência de avaliação do pai e registra refinamentos necessários sem alterar preços já validados.

## Entradas

- [Perfis e cenários](../../tests/fixtures/reference-profiles.js).
- [Hash e proveniência](../../tests/fixtures/reference-profiles-provenance.json).
- [Motor vigente](../../quiz-engine.js) e políticas do [QUIZ-009](009-referencia-de-qualidade.md).
- [Regressão histórica](../../tests/fixtures/reference-scenarios.js), preservada para detectar efeitos colaterais.

## Escopo

1. Conferir a identidade da referência e executar o motor vigente nos casos de calibração. Conclusão: relatório inicial por perfil, com falhas e justificativas, sem alterar aceitáveis para acompanhar a saída.
2. Se houver falhas de modelagem, refinar transformações ou pesos com base na calibração e registrar o motivo. Conclusão: comparação antes/depois e nova `RULES_VERSION` quando o cálculo mudar.
3. Executar a validação sintética após escolher a versão e consolidar a regressão histórica. Conclusão: relatório completo das metas e diferenças; qualquer uso da validação para ajuste deve ser declarado.

## Critérios de aceite

- [x] O relatório identifica versões do motor, catálogo e hash da referência usada.
- [x] Calibração e validação têm resultados separados por perfil, com ranking, planos aceitáveis, top-1, top-3 e violações.
- [x] Validação sintética atinge top-1 ≥ 80%, top-3 ≥ 95% e zero violação do orçamento da assinatura: 8/8 no top-1 e no top-3, zero violações.
- [x] As expectativas congeladas foram preservadas; nenhuma falha foi removida para aprovar a métrica.
- [x] O cálculo permaneceu igual; `RULES_VERSION = 2026-10-26.2` foi preservada e assinatura, adesão e opcionais continuam separados.
- [x] A regressão histórica foi executada: nenhum vencedor mudou e RES-11 continua registrado como divergência conhecida.
- [x] Os relatórios mantêm `independentValidation: false`: referência criada pelo agente não é descrita como avaliação externa, cega ou desempenho real.
- [x] A suíte completa passou, 82/82; o ticket pai recebeu o resultado.

## Dependências e bloqueadores

Dependência: QUIZ-009, concluído com os perfis autorizados. Não há bloqueador externo para iniciar. O aceite comercial do QUIZ-003 é definitivo para esta rodada e não será reaberto por verificações automatizadas de acesso.

## Verificação

Integrar a nova referência ao comando de avaliação ou a um comando próprio, preservando o relatório histórico. Executar os casos de calibração, registrar eventuais ajustes e avaliar a partição de validação. Salvar resultados em `tickets/evidencias/010-A/` e executar os testes de motor, referência, perfis e navegador.

## Registro de conclusão

Concluído em 27/10/2026. O hash da referência foi conferido antes da avaliação. A calibração inicial atingiu 8/8 no top-1 e top-3; a decisão de manter o cálculo foi registrada antes de executar a validação. A validação atingiu 8/8 nos dois indicadores, sem violações de orçamento ou pontuação. Não houve refinamento de pesos nem alteração de preços, regras ou expectativas.

O avaliador permanente agora aceita `--reference profiles`, seleção por `--split` e `--enforce` para sinalizar metas não atingidas. Os testes cobrem relatórios positivos, falha de expectativa, conjuntos vazios/inválidos, hash, separação das partições e preservação da divergência histórica.

| Referência | Top-1 | Top-3 | Violações de orçamento/pontuação |
| --- | --- | --- | --- |
| Perfis — calibração | 8/8 | 8/8 | 0/0 |
| Perfis — validação | 8/8 | 8/8 | 0/0 |
| Histórica — calibração | 12/12 | 12/12 | 0/0 |
| Histórica — reserva já consultada | 11/12 | 12/12 | 0/0 |

RES-11 continua com Meu Cruzeiro em primeiro e expectativa histórica de Time do Povo. Não houve mudança causada por esta execução; a divergência anterior foi preservada. Esses resultados são sintéticos.

Evidências:

- [Calibração inicial](../evidencias/010-A/calibracao-inicial.json) e [decisão anterior à validação](../evidencias/010-A/decisao-calibracao.json).
- [Resultado dos perfis](../evidencias/010-A/perfis-final.json), [regressão histórica](../evidencias/010-A/historico-final.json) e [comparação](../evidencias/010-A/comparacao.json).
- [Log da suíte completa](../evidencias/010-A/npm-test.tap).

Comandos: `npm run reference:evaluate -- --reference profiles --output tickets/evidencias/010-A/perfis-final.json --enforce`, avaliação histórica equivalente sem `--reference profiles`, e `npm test` (82/82). Arquivos de implementação: `scripts/evaluate-reference.mjs`, `tests/evaluation.test.mjs` e integração em `package.json`. O motor não precisou de alteração.
