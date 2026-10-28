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
        async buildStart() {
            const visit = async (directory) => {
                for (const entry of await readdir(path.join(root, directory), { withFileTypes: true })) {
                    const relative = path.posix.join(directory, entry.name);
                    if (entry.isSymbolicLink()) throw new Error(`Asset simbólico não permitido: ${relative}`);
                    if (entry.isDirectory()) await visit(relative);
                    else if (entry.isFile()) this.emitFile({ type: 'asset', fileName: relative, source: await readFile(path.join(root, relative)) });
                }
            };
            await visit('img');
        }
    };
}

export default defineConfig({
    plugins: [vue(), publicImages(), releaseManifest()],
    root,
    publicDir: false,
    build: { outDir: 'dist', emptyOutDir: true },
    server: { port: 5173, open: false, host: '127.0.0.1' },
    resolve: { alias: { '@': path.join(root, 'src'), '@config': path.join(root, 'config') } }
});
