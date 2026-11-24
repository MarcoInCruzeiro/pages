import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectConfiguration, inspectQuality } from './config-release.mjs';

const directory = path.resolve(process.argv[2] || '.scratch/quality-dossier');
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
const decision = quality.reviewRequired
    ? `As perdas \`${quality.regressionIds.join(', ')}\` exigem revisão do responsável. Atender aos pisos agregados não constitui aceite. Uma eventual decisão deve registrar identidade, data, hash da configuração, hashes das referências e exatamente esses IDs.`
    : 'Não há regressões de acerto nesta revisão; não há perdas a aceitar. A aprovação local de qualidade não constitui autorização de publicação ou aceite externo.';
await writeFile(path.join(directory, 'decisao-ranking.md'), `# Dossiê de qualidade do ranking

Gerado em ${quality.reports.historical.evaluatedAt}. Reprodução: \`node scripts/quality-dossier.mjs DIRETORIO_DE_SAIDA\`. Sem argumento, a saída fica em \`.scratch/quality-dossier\`, preservando evidências históricas.
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
${table || '| — | — | — | Sem regressões | — | — | — |'}

A comparação anterior preservada usa o motor histórico de cinco planos; os relatórios registram seus placares e vencedores. A avaliação atual usa as regras identificadas acima, preservando respostas e expectativas das referências congeladas. As referências são sintéticas, sem validação externa ou cega.

${decision}

Estado: \`reviewAccepted: ${quality.reviewAccepted}\`, \`releaseApproved: ${quality.releaseApproved}\`. Este comando não cria arquivo de aceite.

Mudanças na configuração ou nas referências exigem nova avaliação. As evidências históricas não devem ser sobrescritas para acompanhar um resultado novo.
`);
console.log(JSON.stringify({ directory, regressions: quality.regressionIds, releaseApproved: quality.releaseApproved }));
