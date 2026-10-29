# 09: Fundir a branch e publicar a versão Vue

**O que construir:** a versão Vue aprovada chega à `main` e ao domínio de produção, com versões verificáveis e rollback registrado.

**Bloqueado por:** 06 (CI verde) e 08 (candidato aprovado).

**Status:** ready-for-agent
**Situação da execução:** Bloqueado
**Prioridade:** P1

## Critérios de aceite

- [ ] A branch `quiz/port-vue` é integrada à `main` sem reescrever histórico; o CI passa no commit integrado.
- [ ] A publicação usa o candidato aprovado e o deploy fica `READY` no alias de produção.
- [ ] O HTML publicado referencia os assets Vite; o `build-manifest.json` está disponível e catálogo, regras e GA4 correspondem à revisão aprovada.
- [ ] A jornada pública é exercitada em produção com a coleta GA4 bloqueada ou interceptada; nenhuma compra é concluída.
- [ ] O deployment anterior e o comando de rollback ficam registrados.
- [ ] O ticket não declara recebimento no GA4 nem continuidade no checkout; isso permanece nos QUIZ-017, 018 e 019.
- [ ] Se a branch avançar depois do candidato, um novo candidato aprovado é preparado e verificado.

## Verificação

Histórico do Git, execução do CI, inspeção do deployment, leitura do HTML e do manifesto publicados, jornada de produção.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.
