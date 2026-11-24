import { inspectConfiguration } from './config-release.mjs';
try {
    const inspection = inspectConfiguration();
    if (inspection.pendingChanges) throw new Error('Configuração ou motor mudaram: prepare uma revisão explicitamente com config:prepare antes do build.');
    console.log(`Configuração válida: ${inspection.hashes.aggregate}; regras ${inspection.versions.rulesVersion}. A aprovação de entrega é verificada separadamente.`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
