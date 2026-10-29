# 01: Dossiê de decisão das perdas de ranking

**O que construir:** uma evidência de qualidade reproduzível, vinculada à configuração ativa, e um dossiê que permita ao responsável decidir sobre as quatro perdas de ranking sem recalcular nada.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P1

## Critérios de aceite

- [x] A avaliação histórica e a de perfis são executadas com a configuração ativa e registram versões, hashes de configuração, hashes das referências e data.
- [x] O dossiê lista os quatro cenários `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05` com vencedor esperado, vencedor atual, placar, margem, top-1/top-3 e violações de orçamento.
- [x] O dossiê explica a origem da mudança — retirada do Cativo e nova normalização com quatro planos — e separa "aceitar a nova escolha" de "revisar o ranking".
- [x] As métricas agregadas são registradas: histórico 10/12 no top-1 em cada partição, top-3 12/12, perfis 7/8 na calibração e 8/8 na validação, zero violações de orçamento.
- [x] Nenhum aceite é criado; `releaseApproved` continua falso.
- [x] A evidência anterior é preservada como histórica e a nova é vinculada aos tickets 06–08 da feature `port-vue`.
- [x] O comando de reprodução e os hashes necessários para o futuro aceite ficam registrados no dossiê.

## Verificação

Comparar o relatório gerado com a saída de `inspectQuality`, conferir versões e hashes, revisar os links e executar a suíte completa.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.

Fechamento técnico: build e 147 testes aprovados, zero falhas. Avaliação, medição de abertura e inspeção visual vinculadas às evidências; não foi alterado o ranking nem registrado aceite. Contagens de 132 no planejamento são históricas; a fotografia vigente é a do tracker.
