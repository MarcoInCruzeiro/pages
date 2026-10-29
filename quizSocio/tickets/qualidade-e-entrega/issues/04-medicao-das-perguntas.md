# 04: Reaproveitar a medição do espaço das perguntas

**O que construir:** a montagem do quiz deixa de renderizar e medir os 12 estados escondidos das perguntas; a altura do rodapé, a estabilidade do cartão e o layout responsivo continuam iguais.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P2

## Critérios de aceite

- [x] A medição do espaço das perguntas não percorre os 12 estados na montagem.
- [x] Rodapé estável, altura do cartão e ausência de recortes são preservados em 320, 390, 768 e 1280 px.
- [x] A navegação, o retorno e a troca de perguntas continuam funcionando com movimento reduzido.
- [x] A abertura sob CPU 6× é medida antes/depois com três amostras; o ganho é registrado.
- [x] A suíte completa continua passando.
- [x] O resultado não é apresentado como prova de resolução da travada persistente.

## Verificação

Testes de navegador, medição de abertura e inspeção visual nas larguras de aceite.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.

Fechamento técnico: build e 147 testes aprovados, zero falhas. Avaliação, medição de abertura e inspeção visual vinculadas às evidências; não foi alterado o ranking nem registrado aceite. Contagens de 132 no planejamento são históricas; a fotografia vigente é a do tracker.
