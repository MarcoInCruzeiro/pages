# 06: Adicionar CI de testes

**O que construir:** cada push ou pull request executa a suíte completa em Chrome antes de chegar à Vercel, com falha bloqueando o merge.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P2

## Critérios de aceite

- [x] O workflow de CI instala dependências travadas, prepara o Chrome e executa a suíte completa.
- [x] O workflow passa na branch atual e falha de forma reproduzível quando um teste é quebrado.
- [x] Analytics e checkout continuam bloqueados; nenhum deploy é disparado pelo CI.
- [x] A documentação de verificação cita o comando local e o equivalente no CI.
- [x] O tempo de execução e o cache são registrados.

## Verificação

Execução verde na branch, execução vermelha controlada e log do workflow.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.

Fechamento: workflow hospedado verde com 147/147 e controle negativo com 146/147 (uma falha intencional), ambos registrados nas evidências. A main exige o check `Quiz Socio / testes`, inclusive para administradores. Suíte verde em 108,6 s; job em 129 s. Cache npm frio na primeira execução e salvo no sucesso. A branch temporária do controle negativo foi removida; nada foi publicado.
