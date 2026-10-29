import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectConfiguration, inspectQuality } from './config-release.mjs';

const directory = path.resolve(process.argv[2] || 'tickets/evidencias/qualidade-e-entrega-2026-10-29');
const inspection = inspectConfiguration();
const quality = await inspectQuality(inspection);
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, 'quality.json'), JSON.stringify({
    evaluatedAt: new Date().toISOString(), versions: inspection.versions,
    configurationHashes: inspection.hashes, ...quality
}, null, 2) + '\n');
const rows = Object.values(quality.reports).flatMap((report) => report.rows)
    .filter((row) => quality.regressionIds.includes(row.id));
const table = rows.map((row) => {
    const margin = row.scores[0].score - row.scores[1].score;
    return `| ${row.id} | ${row.acceptable.join(', ')} | ${row.ranking[0]} | ${row.scores.map((s) => `${s.plan}: ${s.score.toFixed(2)}`).join('; ')} | ${margin.toFixed(2)} | ${row.top1} / ${row.top3} | ${row.budgetViolation} |`;
}).join('\n');
const metrics = Object.entries(quality.reports).flatMap(([name, report]) =>
    Object.entries(report.groups).map(([split, group]) =>
        `| ${name} / ${split} | ${group.top1}/${group.total} | ${group.top3}/${group.total} | ${group.budgetViolations} |`)).join('\n');
await writeFile(path.join(directory, 'decisao-ranking.md'), `# Dossiê para decisão do responsável

Gerado em ${quality.reports.historical.evaluatedAt}. Reprodução: \`node scripts/quality-dossier.mjs\`.
Versões: \`${JSON.stringify(inspection.versions)}\`.
Configuração: \`${quality.configurationHash}\`.
Referência histórica: \`${quality.referenceHashes.historical}\`.
Referência de perfis: \`${quality.referenceHashes.profiles}\`.
Hashes por domínio, lógica, schemas e referências de origem: [quality.json](quality.json).

| Referência / partição | Top-1 | Top-3 | Violações de orçamento |
| --- | --- | --- | --- |
${metrics}

| Caso | Vencedor(es) esperado(s) | Atual | Placar dos elegíveis | Margem 1º–2º | Top-1 / Top-3 | Violação de orçamento |
| --- | --- | --- | --- | --- | --- | --- |
${table}

A referência anterior preservada inclui cinco planos. A retirada do Cativo e a normalização pelos quatro planos ativos mudaram a escala e a posição relativa dos demais; os relatórios registram também os placares e vencedores anteriores. Nenhuma expectativa, peso ou resposta foi ajustada para acompanhar a saída. As referências são sintéticas, sem validação externa ou cega.

O responsável pode **aceitar as quatro novas escolhas** para esta configuração e estas referências, ou **pedir revisão do ranking**, apontando os casos a corrigir. Atender os pisos agregados não constitui aceite das perdas. Não foi criado aceite: \`reviewAccepted: ${quality.reviewAccepted}\`, \`releaseApproved: ${quality.releaseApproved}\`.

Para um aceite futuro, registrar identidade do responsável, data explícita, o hash de configuração e os dois hashes de referência acima, e exatamente os IDs \`${quality.regressionIds.join(', ')}\`. Qualquer mudança nessas identidades exige nova decisão.

Evidência anterior preservada em [port-vue-2026-10-28](../port-vue-2026-10-28/quality.json). Este dossiê atende à evidência técnica dos tickets [06](../../port-vue/issues/06-quatro-planos-e-avaliacao.md), [07](../../port-vue/issues/07-versionamento-backup-e-restauracao.md) e [08](../../port-vue/issues/08-integracao-e-artefato-de-entrega.md); o aceite continua pendente.
`);
console.log(JSON.stringify({ directory, regressions: quality.regressionIds, releaseApproved: quality.releaseApproved }));
