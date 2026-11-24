// Somente diagnóstico: artefatos externos, com mídia/configuração idênticas.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { build } from 'vite';
import config from '../vite.config.mjs';

const output = path.resolve(process.argv[2] || '/tmp/quiz-quality-profiles');
if (output.startsWith(process.cwd() + path.sep)) throw new Error('Use um destino fora do projeto.');
const previous = execFileSync('git', ['show', '4b569bd:quizSocio/src/composables/useQuestionSpace.js'], { encoding: 'utf8' });
for (const [name, compiled, optimized] of [['01-ajv', false, false], ['02-compilados', true, false], ['03-medicao', true, true]]) {
    const plugins = config.plugins.filter(plugin => compiled || plugin.name !== 'quiz-validadores-compilados');
    if (!optimized) plugins.unshift({ name: 'diagnostic-old-measurement', enforce: 'pre',
        transform(_code, id) { if (id.endsWith('/src/composables/useQuestionSpace.js')) return previous; } });
    await build({ ...config, configFile: false, plugins,
        build: { ...config.build, outDir: path.join(output, name), emptyOutDir: true } });
}
