# 06: Adicionar CI de testes

**O que construir:** cada push ou pull request executa a suíte completa em Chrome antes de chegar à Vercel, com falha bloqueando o merge.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Em andamento
**Prioridade:** P2

## Critérios de aceite

- [ ] O workflow de CI instala dependências travadas, prepara o Chrome e executa a suíte completa.
- [ ] O workflow passa na branch atual e falha de forma reproduzível quando um teste é quebrado.
- [ ] Analytics e checkout continuam bloqueados; nenhum deploy é disparado pelo CI.
- [ ] A documentação de verificação cita o comando local e o equivalente no CI.
- [ ] O tempo de execução e o cache são registrados.

## Verificação

Execução verde na branch, execução vermelha controlada e log do workflow.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.
