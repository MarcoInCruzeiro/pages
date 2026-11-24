# 05: Reduzir o peso do artefato público

**O que construir:** o pacote público perde duplicações e peso de mídia sem quebrar imagens, vídeo, pôster ou a experiência visual do herói.

**Bloqueado por:** Nenhum (pode começar imediatamente).

**Status:** ready-for-agent
**Situação da execução:** Concluído
**Prioridade:** P2

## Critérios de aceite

- [x] Nenhuma imagem do `dist` é emitida em duas cópias — hash e caminho estático — sem uso.
- [x] Vídeo e pôster do herói são reduzidos com comparação antes/depois; duração, proporção e reprodução automática, muda e em loop são preservadas.
- [x] A meta de redução é registrada: mínimo de 50% no vídeo e 40% no `dist` total, ou justificativa técnica se inviável.
- [x] Imagens dos planos, fundo e logo continuam resolvendo na página e no comparativo.
- [x] A jornada visual em 390 e 1280 px é conferida e a suíte completa passa.
- [x] Nenhuma alteração em regras, catálogo ou medição.

## Verificação

Manifesto do pacote, tamanhos antes/depois, capturas de tela e suíte completa.

## Registro de execução

Execução em 29/10/2026: [evidências, comandos e limitações](../../evidencias/qualidade-e-entrega-2026-10-29/README.md). A verificação final e os critérios individuais são registrados no fechamento desta execução.

Fechamento técnico: build e 147 testes aprovados, zero falhas. Avaliação, medição de abertura e inspeção visual vinculadas às evidências; não foi alterado o ranking nem registrado aceite. Contagens de 132 no planejamento são históricas; a fotografia vigente é a do tracker.
