import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', '*.md'], { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
const broken = [];
for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const [, raw] of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = raw.replace(/^<|>$/g, '').split('#')[0];
        if (!target || /^(?:[a-z]+:|\/\/)/i.test(target)) continue;
        const destination = path.resolve(path.dirname(file), decodeURIComponent(target));
        try { await access(destination); }
        catch { broken.push(`${file}: ${raw}`); }
    }
}
if (broken.length) { console.error(broken.join('\n')); process.exitCode = 1; }
else console.log(`OK: links locais em ${files.length} documentos resolvidos.`);
