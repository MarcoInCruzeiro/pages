# Dossiê para decisão do responsável

Gerado em 2026-10-29T17:35:59.986Z. Reprodução: `node scripts/quality-dossier.mjs`.
Versões: `{"catalogVersion":"2026-10-28.2","rulesVersion":"2026-10-29.2","ga4Version":"2026-10-28.3"}`.
Configuração: `523de1ae47be4b1e15acb1897567a44fc5346592140bc3e41ba9e468fee5d59c`.
Referência histórica: `14d5440c6377222552c745c77800709163ec9db7a6f99a3aaedcab66e74a6f23`.
Referência de perfis: `e7128debfadfbf3948b3cdfbff12e9238043e969674c13481867f0c4393b0e9e`.
Hashes por domínio, lógica, schemas e referências de origem: [quality.json](quality.json).

| Referência / partição | Top-1 | Top-3 | Violações de orçamento |
| --- | --- | --- | --- |
| historical / calibracao | 10/12 | 12/12 | 0 |
| historical / reserva | 10/12 | 12/12 | 0 |
| profiles / calibracao | 7/8 | 8/8 | 0 |
| profiles / validacao | 8/8 | 8/8 | 0 |

| Caso | Vencedor(es) esperado(s) | Atual | Placar dos elegíveis | Margem 1º–2º | Top-1 / Top-3 | Violação de orçamento |
| --- | --- | --- | --- | --- | --- | --- |
| CAL-02 | time-do-povo | meu-cruzeiro | meu-cruzeiro: 85.10; time-do-povo: 81.70 | 3.40 | false / true | false |
| CAL-10 | cabuloso-max | cabuloso | cabuloso: 76.60; cabuloso-max: 71.90; meu-cruzeiro: 64.40; time-do-povo: 61.20 | 4.70 | false / true | false |
| RES-05 | cabuloso-max | cabuloso | cabuloso: 75.10; cabuloso-max: 71.30; meu-cruzeiro: 60.70; time-do-povo: 57.60 | 3.80 | false / true | false |
| PER-02-C | time-do-povo | meu-cruzeiro | meu-cruzeiro: 81.10; time-do-povo: 80.70 | 0.40 | false / true | false |

A referência anterior preservada inclui cinco planos. A retirada do Cativo e a normalização pelos quatro planos ativos mudaram a escala e a posição relativa dos demais; os relatórios registram também os placares e vencedores anteriores. Nenhuma expectativa, peso ou resposta foi ajustada para acompanhar a saída. As referências são sintéticas, sem validação externa ou cega.

O responsável pode **aceitar as quatro novas escolhas** para esta configuração e estas referências, ou **pedir revisão do ranking**, apontando os casos a corrigir. Atender os pisos agregados não constitui aceite das perdas. Não foi criado aceite: `reviewAccepted: false`, `releaseApproved: false`.

Para um aceite futuro, registrar identidade do responsável, data explícita, o hash de configuração e os dois hashes de referência acima, e exatamente os IDs `CAL-02, CAL-10, PER-02-C, RES-05`. Qualquer mudança nessas identidades exige nova decisão.

Evidência anterior preservada em [port-vue-2026-10-28](../port-vue-2026-10-28/quality.json). Este dossiê atende à evidência técnica dos tickets [06](../../port-vue/issues/06-quatro-planos-e-avaliacao.md), [07](../../port-vue/issues/07-versionamento-backup-e-restauracao.md) e [08](../../port-vue/issues/08-integracao-e-artefato-de-entrega.md); o aceite continua pendente.
