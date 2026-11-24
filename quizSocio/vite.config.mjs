import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import releaseManifest from './scripts/release-vite-plugin.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));

// Emit only the existing image/video allowlist, not the workspace or documents.
function publicImages() {
    return {
        name: 'quiz-public-images',
        apply: 'build',
        async generateBundle(_options, bundle) {
            const visit = async (directory) => {
                for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
                    const relative = path.posix.join(directory, entry.name);
                    if (entry.isSymbolicLink()) throw new Error(`Asset simbólico não permitido: ${relative}`);
                    if (entry.isDirectory()) await visit(relative);
                    else if (entry.isFile() && !bundle[relative]) this.emitFile({ type: 'asset', fileName: relative, source: await readFile(path.join(root, relative)) });
                }
            };
            await visit('img');
        }
    };
}

export default defineConfig({
    plugins: [
        vue(),
        // Browser: valida configuração com o módulo pré-compilado (sem Ajv em runtime).
        {
            name: 'quiz-validadores-compilados',
            enforce: 'pre',
            resolveId(source) {
                if (/validadores-ajv\.js$/.test(source)) return path.join(root, 'config/validadores-compilados.mjs');
            }
        },
        publicImages(),
        releaseManifest()
    ],
    root,
    publicDir: false,
    build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { output: {
        // CSS e referências do catálogo compartilham o mesmo arquivo público.
        assetFileNames: (asset) => /\.(png|jpe?g|mp4)$/i.test(asset.names?.[0] || asset.name || '')
            ? 'img/[name][extname]' : 'assets/[name]-[hash][extname]'
    } } },
    server: { port: 5173, open: false, host: '127.0.0.1' },
    resolve: { alias: { '@': path.join(root, 'src'), '@config': path.join(root, 'config') } }
});
