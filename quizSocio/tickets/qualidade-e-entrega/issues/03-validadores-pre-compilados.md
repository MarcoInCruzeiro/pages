# 03: Pré-compilar os validadores de configuração

**O que construir:** a validação da configuração deixa de carregar e compilar o Ajv no navegador; o build usa validadores pré-compilados, mantendo a mesma rejeição de configuração inválida e o mesmo gate de build.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P2

## Critérios de aceite

- [x] O bundle do navegador não inicializa nem compila o Ajv em tempo de execução.
- [x] Configuração estruturalmente inválida e configuração semanticamente incompatível continuam impedindo o build, com mensagens equivalentes.
- [x] Os testes de configuração, release e navegador continuam passando.
- [x] A abertura sob CPU 6× é medida com pelo menos três amostras antes/depois; a mediana da maior tarefa é registrada.
- [x] O resultado é documentado sem declarar resolvida a travada persistente não reproduzida.
- [x] Nenhuma regra de negócio, schema ou expectativa é alterada.

## Verificação

Build, suíte completa, perfil de abertura e inspeção do bundle do navegador.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.

Fechamento técnico: build e 147 testes aprovados, zero falhas. Avaliação, medição de abertura e inspeção visual vinculadas às evidências; não foi alterado o ranking nem registrado aceite. Contagens de 132 no planejamento são históricas; a fotografia vigente é a do tracker.
