import { inspectConfiguration, inspectBuildInputs } from './config-release.mjs';
export default function releaseManifestPlugin() {
    return {
        name: 'quiz-release-manifest',
        generateBundle() {
            const inspection = inspectConfiguration();
            if (inspection.pendingChanges) throw new Error('Revisão desatualizada: preparar configuração antes do build.');
            this.emitFile({ type: 'asset', fileName: 'build-manifest.json', source: JSON.stringify({
                format: 1, versions: inspection.versions, hashes: inspection.hashes, buildInputsHash: inspectBuildInputs()
            }, null, 2) + '\n' });
        }
    };
}
