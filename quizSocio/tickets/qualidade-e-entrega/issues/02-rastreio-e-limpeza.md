# 02: Rastrear tickets locais e limpar o workspace

**O que construir:** um local canônico e rastreável para os tickets locais e um workspace sem arquivos órfãos, para que um clone limpo reproduza os links e o preparo de entrega não marque a árvore como suja.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Em andamento
**Prioridade:** P2

## Critérios de aceite

- [ ] Os tickets locais referenciados por documentos versionados estão em local versionado ou o link foi removido; um clone limpo resolve todos os links.
- [ ] `.scratch/perf` e os candidatos gerados têm política explícita — versionar ou ignorar — e nenhum snapshot ou backup entra na saída pública.
- [ ] `percentual-chamativo.html` é removido, arquivado fora do projeto ou vinculado a um ticket; não fica órfão.
- [ ] `git status --porcelain` fica limpo ao final, considerando apenas arquivos intencionais.
- [ ] `release:prepare -- --diagnostic` registra `workingTreeHasChanges: false`.
- [ ] Nenhum comportamento do quiz, configuração ou build é alterado.

## Verificação

Conferir `git status`, executar o preparo diagnóstico e validar os links a partir de um clone ou checkout limpo.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.
