# Simulação de 19 perfis de torcedor

Execução em 12/11/2026. Diagnóstico do motor atual com expectativas congeladas antes da execução, no commit `37d01ee` ([fixture](../tests/fixtures/simulacao-19-perfis.json), SHA-256 `dff628c1da4686de22c75a27b8f734283eb04a08170dacb72da26c1b0e2170f0`). Nenhum peso, regra, catálogo, avaliador ou expectativa foi alterado. Os perfis são sintéticos: acertos e divergências não medem precisão com usuários reais.

Dados completos: [resultado.json](evidencias/simulacao-19-perfis-2026-11-12/resultado.json). As avaliações das 40 referências estão na mesma pasta.

## Resumo

- **Acertos com orçamento sem limite (valor 400):** 7 de 19.
- **Divergências:** MC-3 (esperado Meu Cruzeiro, indicado Cabuloso Max), MC-4 (esperado Time do Povo, indicado Cabuloso Max), TP-1 (esperado Time do Povo, indicado Cabuloso Max), TP-2 (esperado Time do Povo, indicado Cabuloso Max), TP-3 (esperado Time do Povo, indicado Cabuloso Max), TP-4 (esperado Meu Cruzeiro, indicado Cabuloso Max), TP-5 (esperado Cabuloso, indicado Cabuloso Max), CA-1 (esperado Cabuloso, indicado Cabuloso Max), CA-2 (esperado Cabuloso, indicado Cabuloso Max), CA-3 (esperado Cabuloso, indicado Cabuloso Max), CA-4 (esperado Time do Povo, indicado Cabuloso Max), MX-4 (esperado Cabuloso, indicado Cabuloso Max).
- **Vencedor decidido por desempate:** MC-1 (finalidade do produto), MC-2 (finalidade do produto), MX-5 (finalidade do produto).
- **Margem abaixo de 1 ponto:** CA-2 (0,97 exata; 1,0 arredondada), MX-4 (0,91 exata; 1,0 arredondada).
- **Dominância:** em 19 de 19 perfis, o Cabuloso Max tem valor maior ou igual ao dos outros planos nos seis componentes; nesses perfis nenhum plano pode superá-lo no índice, só empatar.
- **Orçamento:** R$ 200: 0 troca(s) por exclusão; R$ 100: 16 troca(s) por exclusão; R$ 40: 16 troca(s) por exclusão. Nenhum invariante falhou.
- **Referência historical:** 24 de 24 com primeiro lugar aceitável; 0 divergência(s); 0 regressão(ões).
- **Referência profiles:** 16 de 16 com primeiro lugar aceitável; 0 divergência(s); 0 regressão(ões).

## Resultado por perfil (orçamento sem limite)

Índices na ordem Meu Cruzeiro · Time do Povo · Cabuloso · Cabuloso Max. Margem é a diferença entre os dois primeiros; abaixo de 1 ponto é estreita. "Decidido por" indica se o índice separou os dois primeiros ou se houve desempate.

| ID | Grupo · intensidade | Esperado | Indicado | Resultado | Posição do esperado | Índices | Margem | Decidido por | Alternativas |
|---|---|---|---|---|---|---|---|---|---|
| MC-1 | Meu Cruzeiro · puro | Meu Cruzeiro | Meu Cruzeiro | acerto | 1º | 93,9 · 93,9 · 93,9 · 93,9 | 0,0 | finalidade do produto | Cabuloso, Cabuloso Max |
| MC-2 | Meu Cruzeiro · forte | Meu Cruzeiro | Meu Cruzeiro | acerto | 1º | 98,1 · 98,1 · 98,1 · 98,1 | 0,0 | finalidade do produto | Cabuloso, Cabuloso Max |
| MC-3 | Meu Cruzeiro · moderado | Meu Cruzeiro | Cabuloso Max | **divergência** | 3º | 85,5 · 82,5 · 86,6 · 97,8 | 11,2 (exata 11,19) | índice | Cabuloso, Meu Cruzeiro |
| MC-4 | Meu Cruzeiro · migração | Time do Povo | Cabuloso Max | **divergência** | 3º | 74,1 · 81,6 · 86,0 · 98,1 | 12,1 (exata 12,05) | índice | Cabuloso, Time do Povo |
| TP-1 | Time do Povo · puro | Time do Povo | Cabuloso Max | **divergência** | 3º | 71,7 · 80,8 · 85,5 · 98,3 | 12,8 (exata 12,82) | índice | Cabuloso, Time do Povo |
| TP-2 | Time do Povo · forte | Time do Povo | Cabuloso Max | **divergência** | 3º | 68,6 · 79,3 · 90,9 · 98,9 | 8,0 (exata 7,91) | índice | Cabuloso, Time do Povo |
| TP-3 | Time do Povo · moderado | Time do Povo | Cabuloso Max | **divergência** | 3º | 77,0 · 82,1 · 86,4 · 97,9 | 11,5 (exata 11,56) | índice | Cabuloso, Time do Povo |
| TP-4 | Time do Povo · migração | Meu Cruzeiro | Cabuloso Max | **divergência** | 3º | 86,7 · 83,9 · 87,7 · 98,0 | 10,3 (exata 10,28) | índice | Cabuloso, Meu Cruzeiro |
| TP-5 | Time do Povo · migração | Cabuloso | Cabuloso Max | **divergência** | 2º | 39,5 · 40,1 · 92,1 · 99,0 | 6,9 (exata 6,92) | índice | Cabuloso, Time do Povo |
| CA-1 | Cabuloso · puro | Cabuloso | Cabuloso Max | **divergência** | 2º | 23,7 · 24,6 · 88,6 · 99,0 | 10,4 (exata 10,39) | índice | Cabuloso, Time do Povo |
| CA-2 | Cabuloso · forte | Cabuloso | Cabuloso Max | **divergência** | 2º | 36,3 · 37,0 · 98,4 · 99,4 | 1,0 (exata 0,97) | índice | Cabuloso, Time do Povo |
| CA-3 | Cabuloso · moderado | Cabuloso | Cabuloso Max | **divergência** | 2º | 44,2 · 44,7 · 90,6 · 98,8 | 8,2 (exata 8,17) | índice | Cabuloso, Time do Povo |
| CA-4 | Cabuloso · migração | Time do Povo | Cabuloso Max | **divergência** | 3º | 73,1 · 81,3 · 85,8 · 98,2 | 12,4 (exata 12,33) | índice | Cabuloso, Time do Povo |
| CA-5 | Cabuloso · migração | Cabuloso Max | Cabuloso Max | acerto | 1º | 35,3 · 36,0 · 71,3 · 100,0 | 28,7 (exata 28,67) | índice | Cabuloso, Time do Povo |
| MX-1 | Cabuloso Max · puro | Cabuloso Max | Cabuloso Max | acerto | 1º | 44,1 · 44,7 · 84,2 · 100,0 | 15,8 (exata 15,81) | índice | Cabuloso, Time do Povo |
| MX-2 | Cabuloso Max · forte | Cabuloso Max | Cabuloso Max | acerto | 1º | 39,5 · 40,1 · 87,0 · 100,0 | 13,0 (exata 13,02) | índice | Cabuloso, Time do Povo |
| MX-3 | Cabuloso Max · moderado | Cabuloso Max | Cabuloso Max | acerto | 1º | 48,2 · 48,7 · 70,1 · 100,0 | 29,9 (exata 29,94) | índice | Cabuloso, Time do Povo |
| MX-4 | Cabuloso Max · migração | Cabuloso | Cabuloso Max | **divergência** | 2º | 37,9 · 38,6 · 98,3 · 99,3 | 1,0 (exata 0,91) | índice | Cabuloso, Time do Povo |
| MX-5 | Cabuloso Max · migração | Meu Cruzeiro | Meu Cruzeiro | acerto | 1º | 100,0 · 100,0 · 100,0 · 100,0 | 0,0 | finalidade do produto | Cabuloso, Cabuloso Max |

## Esperado × indicado

| Esperado ↓ / indicado → | Meu Cruzeiro | Time do Povo | Cabuloso | Cabuloso Max |
|---|---|---|---|---|
| Meu Cruzeiro | 3 | 0 | 0 | 2 |
| Time do Povo | 0 | 0 | 0 | 5 |
| Cabuloso | 0 | 0 | 0 | 5 |
| Cabuloso Max | 0 | 0 | 0 | 4 |

Grupos com 4 ou 5 perfis: as contagens abaixo descrevem estes casos e não são taxas.

| Grupo de origem | Perfis | Acertos |
|---|---|---|
| Meu Cruzeiro | 4 | 2 |
| Time do Povo | 5 | 0 |
| Cabuloso | 5 | 1 |
| Cabuloso Max | 5 | 4 |

| Intensidade | Perfis | Acertos |
|---|---|---|
| puro | 4 | 2 |
| forte | 4 | 2 |
| moderado | 4 | 1 |
| migração | 7 | 2 |

## Migrações

O quiz não pergunta o plano atual; cada migração é comparada com um perfil próprio do mesmo grupo.

| ID | Origem (indicado na origem) | Respostas alteradas | Esperado | Indicado | Resultado |
|---|---|---|---|---|---|
| MC-4 | MC-3 (Cabuloso Max) | `gamesPerYear` | Time do Povo | Cabuloso Max | **divergência** |
| TP-4 | TP-3 (Cabuloso Max) | `gamesPerYear`, `digitalExperience` | Meu Cruzeiro | Cabuloso Max | **divergência** |
| TP-5 | TP-1 (Cabuloso Max) | `gamesHistory`, `needsPriority`, `wantsStoreDiscount`, `preferredSector` | Cabuloso | Cabuloso Max | **divergência** |
| CA-4 | CA-3 (Cabuloso Max) | `gamesHistory`, `wantsStoreDiscount`, `preferredSector` | Time do Povo | Cabuloso Max | **divergência** |
| CA-5 | CA-1 (Cabuloso Max) | `buysTwoTickets`, `preferredSector` | Cabuloso Max | Cabuloso Max | acerto |
| MX-4 | MX-2 (Cabuloso Max) | `gamesPerYear`, `gamesHistory`, `buysTwoTickets`, `wantsStoreDiscount` | Cabuloso | Cabuloso Max | **divergência** |
| MX-5 | MX-1 (Cabuloso Max) | `gamesPerYear`, `wantsGuaranteedTicket`, `buysTwoTickets`, `needsPriority`, `wantsParticipation`, `wantsStoreDiscount`, `gameFrequency`, `preferredSector` | Meu Cruzeiro | Meu Cruzeiro | acerto |

## Decomposição das divergências e das margens estreitas

Os pesos dependem só do perfil, então a diferença de índice entre dois planos é a soma das contribuições de cada componente: peso × (valor do primeiro − valor do segundo) ÷ soma dos pesos × 100. Contribuição positiva favorece o primeiro plano da comparação.

### MC-1: margem zero entre Meu Cruzeiro e Cabuloso

| Componente | Peso | Valor Meu Cruzeiro | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,000 | 0,450 | 0,800 | 0,00 |
| Prioridade | 0,000 | 0,250 | 0,500 | 0,00 |
| Setor | 0,000 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 0,667 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: 0,00 pontos; diferença dos índices arredondados: 0,0. Decidido por: finalidade do produto.

### MC-2: margem zero entre Meu Cruzeiro e Cabuloso

| Componente | Peso | Valor Meu Cruzeiro | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,000 | 0,450 | 0,800 | 0,00 |
| Prioridade | 0,000 | 0,250 | 0,500 | 0,00 |
| Setor | 0,000 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 0,667 | 1,000 | 0,00 |
| Experiências e conteúdo | 1,000 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: 0,00 pontos; diferença dos índices arredondados: 0,0. Decidido por: finalidade do produto.

### MC-3: esperado Meu Cruzeiro, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Meu Cruzeiro | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,270 | 1,000 | 0,850 | +4,48 |
| Prioridade | 0,094 | 1,000 | 0,250 | +7,83 |
| Setor | 0,210 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +12,31 pontos; diferença dos índices arredondados: 12,3. Decidido por: índice.

### MC-4: esperado Time do Povo, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Time do Povo | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,335 | 1,000 | 0,750 | +8,04 |
| Prioridade | 0,117 | 1,000 | 0,250 | +8,43 |
| Setor | 0,260 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +16,46 pontos; diferença dos índices arredondados: 16,5. Decidido por: índice.

### TP-1: esperado Time do Povo, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Time do Povo | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,414 | 1,000 | 0,750 | +8,55 |
| Prioridade | 0,145 | 1,000 | 0,250 | +8,96 |
| Setor | 0,321 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +17,51 pontos; diferença dos índices arredondados: 17,5. Decidido por: índice.

### TP-2: esperado Time do Povo, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Time do Povo | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,665 | 1,000 | 0,750 | +9,53 |
| Prioridade | 0,232 | 1,000 | 0,250 | +9,99 |
| Setor | 0,516 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +19,53 pontos; diferença dos índices arredondados: 19,6. Decidido por: índice.

### TP-3: esperado Time do Povo, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Time do Povo | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,296 | 1,000 | 0,750 | +7,71 |
| Prioridade | 0,104 | 1,000 | 0,250 | +8,09 |
| Setor | 0,230 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +15,80 pontos; diferença dos índices arredondados: 15,8. Decidido por: índice.

### TP-4: esperado Meu Cruzeiro, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Meu Cruzeiro | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,270 | 1,000 | 0,850 | +4,12 |
| Prioridade | 0,094 | 1,000 | 0,250 | +7,19 |
| Setor | 0,210 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,360 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +11,31 pontos; diferença dos índices arredondados: 11,3. Decidido por: índice.

### TP-5: esperado Cabuloso, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,450 | 1,000 | 0,880 | +2,70 |
| Prioridade | 0,337 | 1,000 | 0,750 | +4,22 |
| Setor | 0,321 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,560 | 1,000 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +6,92 pontos; diferença dos índices arredondados: 6,9. Decidido por: índice.

### CA-1: esperado Cabuloso, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,666 | 1,000 | 0,880 | +4,05 |
| Prioridade | 0,500 | 1,000 | 0,750 | +6,33 |
| Setor | 0,476 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +10,39 pontos; diferença dos índices arredondados: 10,4. Decidido por: índice.

### CA-2: esperado Cabuloso, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,751 | 1,000 | 0,960 | +0,97 |
| Prioridade | 0,563 | 1,000 | 1,000 | 0,00 |
| Setor | 0,537 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,840 | 1,000 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,360 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +0,97 pontos; diferença dos índices arredondados: 1,0. Decidido por: índice.

### CA-3: esperado Cabuloso, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,361 | 1,000 | 0,800 | +4,36 |
| Prioridade | 0,126 | 1,000 | 0,500 | +3,81 |
| Setor | 0,281 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,560 | 1,000 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +8,17 pontos; diferença dos índices arredondados: 8,2. Decidido por: índice.

### CA-4: esperado Time do Povo, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Time do Povo | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,361 | 1,000 | 0,750 | +8,23 |
| Prioridade | 0,126 | 1,000 | 0,250 | +8,62 |
| Setor | 0,281 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 1,000 | 0,667 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +16,85 pontos; diferença dos índices arredondados: 16,9. Decidido por: índice.

### MX-4: esperado Cabuloso, indicado Cabuloso Max

| Componente | Peso | Valor Cabuloso Max | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,609 | 1,000 | 0,960 | +0,91 |
| Prioridade | 0,457 | 1,000 | 1,000 | 0,00 |
| Setor | 0,435 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,840 | 1,000 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,280 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,050 | 0,600 | 0,600 | 0,00 |

Soma das contribuições: +0,91 pontos; diferença dos índices arredondados: 1,0. Decidido por: índice.

### MX-5: margem zero entre Meu Cruzeiro e Cabuloso

| Componente | Peso | Valor Meu Cruzeiro | Valor Cabuloso | Contribuição (pontos) |
|---|---|---|---|---|
| Ingresso | 0,000 | 0,450 | 0,960 | 0,00 |
| Prioridade | 0,000 | 0,250 | 1,000 | 0,00 |
| Setor | 0,000 | 1,000 | 1,000 | 0,00 |
| Desconto na loja | 0,000 | 0,667 | 1,000 | 0,00 |
| Experiências e conteúdo | 0,440 | 1,000 | 1,000 | 0,00 |
| Acompanhantes e Kids | 0,700 | 1,000 | 1,000 | 0,00 |

Soma das contribuições: 0,00 pontos; diferença dos índices arredondados: 0,0. Decidido por: finalidade do produto.

## Regras que merecem revisão (evidência)

Componentes que favoreceram o plano indicado contra o esperado nas divergências. A seção aponta onde olhar; não propõe valores.

| Componente | Divergências em que foi a maior contribuição | Pontos a favor do indicado (soma) | Onde está a regra |
|---|---|---|---|
| Prioridade | 9 | +73,48 | `ranking.priority` e `getPriority` |
| Ingresso | 3 | +63,65 | `ranking.ticket` e `getTicketUtility` |

Divergências decididas por desempate (`compareRanked` e `profileFit`): nenhum.

**Causa estrutural.** Em 19 de 19 perfis, o Cabuloso Max tem valor maior ou igual ao dos outros três planos em todos os componentes. O índice é a média ponderada desses valores, com os mesmos pesos para todos os planos, então nenhum outro plano consegue superá-lo: no máximo empata, quando os componentes em que ele é maior têm peso zero, como nos perfis sem uso presencial. Com todos os planos no orçamento, só o desempate ou o filtro de preço afastam o Cabuloso Max; pela ADR-0003, preço não pontua.

**Consequência.** Ajustar só os pesos de `config/pesos/ranking.json` não coloca outro plano acima do Cabuloso Max; no máximo produz empate. Para quem vai ao estádio, a finalidade do produto vale 0 em todos os planos, e o empate segue a ordem alfabética do slug, que põe Cabuloso antes do Cabuloso Max e Meu Cruzeiro e Time do Povo depois. Assim, com o Cabuloso Max no orçamento, Meu Cruzeiro e Time do Povo não podem ser indicados a quem vai ao estádio, e Cabuloso só por empate. As alavancas estão nos valores atribuídos aos benefícios (por exemplo, a prioridade que pesa para quem compra com calma e a utilidade do desconto de 65% para quem vai sozinho) ou na própria ADR-0003.

## Teste de orçamento

Preços mensais: Meu Cruzeiro R$ 12, Time do Povo R$ 40, Cabuloso R$ 100 e Cabuloso Max R$ 200. A comparação aceita o valor igual ao teto. Com R$ 40 cabem Meu Cruzeiro e Time do Povo; com R$ 100, também o Cabuloso; com R$ 200 e sem limite, os quatro.
Como índice e ordem não dependem do orçamento, o indicado em cada teto é o primeiro da ordem sem limite que cabe nele. Esta tabela é consequência dessa ordem, não evidência independente. As 19 execuções com R$ 200 são controle da borda inclusiva do Max e saíram idênticas às sem limite.

| ID | Sem limite (400) | R$ 200 | R$ 100 | R$ 40 |
|---|---|---|---|---|
| MC-1 | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro |
| MC-2 | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro |
| MC-3 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Meu Cruzeiro (troca por exclusão) |
| MC-4 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| TP-1 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| TP-2 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| TP-3 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| TP-4 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Meu Cruzeiro (troca por exclusão) |
| TP-5 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| CA-1 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| CA-2 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| CA-3 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| CA-4 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| CA-5 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| MX-1 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| MX-2 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| MX-3 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| MX-4 | Cabuloso Max | Cabuloso Max | Cabuloso (troca por exclusão) | Time do Povo (troca por exclusão) |
| MX-5 | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro | Meu Cruzeiro |

- R$ 200: 0 troca(s) por exclusão; 19 mantido(s).
- R$ 100: 16 troca(s) por exclusão (Cabuloso Max → Cabuloso: 16); 3 mantido(s).
- R$ 40: 16 troca(s) por exclusão (Cabuloso Max → Meu Cruzeiro: 2; Cabuloso Max → Time do Povo: 14); 3 mantido(s).

"Mudança entre planos que continuam elegíveis" e "recomendação acima do teto" foram verificadas como invariantes nas 76 execuções e não ocorreram.

## Justificativa do motor

**MC-1** (indicado Meu Cruzeiro): Seu foco é apoiar o clube, sem uso de ingressos ou descontos na loja. O plano de apoio atende a esse perfil.

- Como você não pretende ir ao estádio, os benefícios de ingresso não influenciaram a escolha.
- Assinatura: R$ 12,00/mês (referência). Sem taxa de adesão; opcionais à parte.

**MC-2** (indicado Meu Cruzeiro): Seu foco é apoiar o clube, sem uso de ingressos ou descontos na loja. O plano de apoio atende a esse perfil.

- Participe de quiz e votações online e acesse conteúdo exclusivo do clube.
- Como você não pretende ir ao estádio, os benefícios de ingresso não influenciaram a escolha.
- Assinatura: R$ 12,00/mês (referência). Sem taxa de adesão; opcionais à parte.

**MC-3** (indicado Cabuloso Max): Para sua frequência de 1 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 1 jogo por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MC-4** (indicado Cabuloso Max): Para sua frequência de 6 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 6 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**TP-1** (indicado Cabuloso Max): Para sua frequência de 12 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 12 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**TP-2** (indicado Cabuloso Max): Para sua frequência de 20 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 20 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**TP-3** (indicado Cabuloso Max): Para sua frequência de 3 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 3 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**TP-4** (indicado Cabuloso Max): Para sua frequência de 1 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 1 jogo por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**TP-5** (indicado Cabuloso Max): Para sua frequência de 12 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 12 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**CA-1** (indicado Cabuloso Max): Para sua frequência de 16 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 16 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**CA-2** (indicado Cabuloso Max): Para sua frequência de 22 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 22 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**CA-3** (indicado Cabuloso Max): Para sua frequência de 8 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 8 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**CA-4** (indicado Cabuloso Max): Para sua frequência de 8 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 8 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**CA-5** (indicado Cabuloso Max): Você costuma ir acompanhado. Este plano oferece benefício para o seu ingresso e o do acompanhante.

- Para 16 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Para ir com companhia: benefício em até 2 ingressos, para você e seu acompanhante.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MX-1** (indicado Cabuloso Max): Você costuma ir acompanhado. Este plano oferece benefício para o seu ingresso e o do acompanhante.

- Para 30 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Para ir com companhia: benefício em até 2 ingressos, para você e seu acompanhante. Kids opcional: R$ 30,00/mês por criança.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MX-2** (indicado Cabuloso Max): Você costuma ir acompanhado. Este plano oferece benefício para o seu ingresso e o do acompanhante.

- Para 20 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Para ir com companhia: benefício em até 2 ingressos, para você e seu acompanhante.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MX-3** (indicado Cabuloso Max): Você costuma ir acompanhado. Este plano oferece benefício para o seu ingresso e o do acompanhante.

- Para 6 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para ir com companhia: benefício em até 2 ingressos, para você e seu acompanhante.
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MX-4** (indicado Cabuloso Max): Para sua frequência de 12 jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.

- Para 12 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

**MX-5** (indicado Meu Cruzeiro): Seu foco é apoiar o clube, sem uso de ingressos ou descontos na loja. O plano de apoio atende a esse perfil.

- Como você não pretende ir ao estádio, os benefícios de ingresso não influenciaram a escolha.
- Assinatura: R$ 12,00/mês (referência). Sem taxa de adesão; opcionais à parte.

## Tensões registradas antes da execução

Observações gravadas na fixture congelada; nenhuma mudou depois do resultado.

- **MC-1:** "Deseja apenas apoiar o clube" não corresponde a uma resposta; o perfil é o padrão com zero jogos. A opção 400 ("quero o plano mais completo") não descreve esta persona; aqui significa só ausência de restrição de preço. Com orçamento de R$ 40, as 12 respostas coincidem com RES-01 e PER-01-C.
- **MC-2:** Os sinais que tornam o perfil "forte" (experiências e conteúdo) são benefícios comuns aos quatro planos no catálogo. A opção 400 ("quero o plano mais completo") não descreve esta persona; aqui significa só ausência de restrição de preço.
- **MC-3:** Difere de TP-3, MC-4, CA-4 e TP-1 só no número de jogos e de TP-4 só no conteúdo digital.
- **MC-4:** "Benefício recorrente no setor popular" não corresponde a uma resposta; a migração se expressa só pelo número de jogos.
- **TP-1:** Doze jogos com "Acompanho mais de casa mesmo" (resposta padrão) é uma combinação limítrofe.
- **TP-2:** "Foco nos jogos mais decisivos" (resposta padrão) convive com 20 jogos por ano.
- **TP-4:** Difere de MC-3 só no conteúdo digital.
- **CA-1:** "Foco nos jogos mais decisivos" (resposta padrão) convive com 16 jogos por ano.
- **CA-2:** "Foco nos jogos mais decisivos" (resposta padrão) convive com 22 jogos por ano.
- **CA-3:** Histórico de nove jogos é o limite superior do nível 1 do Cabuloso.
- **CA-4:** As respostas não guardam traço do Cabuloso: o perfil difere de MC-3, TP-3, MC-4 e TP-1 só no número de jogos.
- **CA-5:** "Foco nos jogos mais decisivos" (resposta padrão) convive com 16 jogos por ano.
- **MX-1:** Kids, experiências e conteúdo digital são benefícios comuns aos quatro planos no catálogo.
- **MX-2:** "Foco nos jogos mais decisivos" (resposta padrão) convive com 20 jogos por ano.
- **MX-5:** "Não frequento o estádio" convive com 20 jogos no histórico. Kids e conteúdo digital são benefícios comuns aos quatro planos no catálogo. A opção 400 ("quero o plano mais completo") não descreve esta persona; aqui significa só ausência de restrição de preço.

## Referências existentes (40)

"Trocas em relação ao motor legado" comparam com o motor antigo de cinco planos: são histórico, não erro. Divergência é primeiro lugar fora dos planos aceitáveis.

| Referência | Casos | Primeiro lugar aceitável | Divergências | Regressões | Trocas em relação ao legado | Empates no topo | Margens abaixo de 1 ponto |
|---|---|---|---|---|---|---|---|
| historical | 24 | 24 | nenhum | nenhum | CAL-04, CAL-12, RES-06, RES-11 | CAL-01, RES-01 | RES-06 (0,9), RES-11 (0,9) |
| profiles | 16 | 16 | nenhum | nenhum | PER-05-C, PER-05-V, PER-06-C | PER-01-C, PER-01-V | nenhum |

Nas 40 referências, 13 casos têm uso presencial e o Cabuloso Max dentro do orçamento (CAL-04, CAL-05, CAL-06, CAL-09, CAL-10, RES-05, RES-06, RES-08, RES-12, PER-04-C, PER-04-V, PER-05-C, PER-05-V); 13 deles aceitam o Cabuloso Max. Nenhum espera outro plano com o Max disponível, então a referência existente não consegue detectar a dominância descrita acima.

## Verificações executadas

- Pré-condição: fixture idêntica ao congelamento (SHA-256).
- Pré-condição: 19 perfis distintos em 4 + 5 + 5 + 5.
- Pré-condição: três perfis próprios por grupo e migrações em 1 + 2 + 2 + 2.
- Pré-condição: 12 respostas válidas e sem contradição nas 76 combinações.
- Pré-condição: migrações coerentes com o perfil de origem.
- Pré-condição: configuração sem alterações pendentes.
- Pré-condição: avaliações das 40 referências com a mesma identidade.
- Invariante: um único indicado por execução e nenhum acima do teto.
- Invariante: mesmas entradas, mesma saída nas duas passadas.
- Invariante: mudar só o orçamento preserva índices e ordem dos elegíveis.
- Invariante: indicado só muda por exclusão de orçamento.
- Invariante: R$ 200 idêntico ao orçamento sem limite.
- Invariante: avaliador existente e motor com a mesma ordem.
- Invariante: identidade igual no início e no fim.
- Meta-teste do avaliador: `node --test tests/simulacao-perfis.test.mjs` (expectativa trocada vira divergência; expectativa igual ao indicado vira acerto; fixture inalterada).

## Identidade da execução

- Catálogo `2026-10-28.2`, regras `2026-11-12.5`, GA4 `2026-11-03.1`.
- Hash das regras (catálogo, perguntas, pesos e motor): `3cd958569384463f6c51db318b3f2ad2bf4ae1ae6a156e4f4ba1ebb2fd9ff64f`.
- Hash agregado da configuração: `87043ceba43ecf7cfe987feb23069ab0d3f8636b5c603ff5d1ac9200a0e2af6a`.
- Motor (`src/engine-core.mjs`): `d6deea2a38b1bb5cc8c4c4d01797b547564774f30603f9c42e90f2fc9c2a76b0`.
- Git: `quiz/port-vue` em `37d01ee01dda0cb040cae8cf7101ec0dd74b9f8f`, com 83 entradas alteradas no quiz. Em `src/` e `config/`, 16 sem commit: o commit não identifica o motor avaliado, os hashes acima sim.
- Node v22.22.1. Fixture `dff628c1da4686de22c75a27b8f734283eb04a08170dacb72da26c1b0e2170f0`; avaliador `393694d0aac4442fb0dc4896faa7d3378c2ed1281a620f211097721c346d4e50`; script `e7cbb04d1e393bf6de274616bb3c577cad580256b9327bea534b957504ae5fe4`.
- A identidade foi conferida no início e no fim da execução. Hash dos resultados: `0a66962f93f09c30c2b5577c5617081f57e78402afb56778067113b92589fe7e`.

## Limites

- Perfis e expectativas são sintéticos, escritos antes da execução; o resultado não mede precisão com usuários reais.
- O valor 400 é a opção "Sem limite definido": mede a afinidade sem restrição de preço, não a resposta realista de cada persona.
- Esta etapa não alterou o recomendador. As regras apontadas acima são candidatas a revisão posterior.
- Histórico do relatório: em 12/11/2026, depois da primeira execução, foram acrescentadas só três leituras dos mesmos dados: a margem pela diferença exata (o empate continua sendo o do índice arredondado), a verificação de dominância e a contagem dos casos das referências com uso presencial e o Max no orçamento. Respostas, expectativas, motor e invariantes não mudaram; o `resultado.json` da primeira execução foi sobrescrito.

## Reprodução

A partir de `quizSocio/`, com os mesmos hashes de motor e configuração:

```sh
node scripts/evaluate-reference.mjs --output docs/evidencias/simulacao-19-perfis-2026-11-12/referencia-historical.json
node scripts/evaluate-reference.mjs --reference profiles --output docs/evidencias/simulacao-19-perfis-2026-11-12/referencia-profiles.json
node scripts/simular-perfis.mjs --data 2026-11-12
node --test tests/simulacao-perfis.test.mjs
```
