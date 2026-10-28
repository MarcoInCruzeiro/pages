import { inspectConfiguration, inspectQuality } from './config-release.mjs';

// Preview builds are diagnostic. A production build must pass the same review
// gate as a local release package; pushing a branch cannot bypass that gate.
if (process.env.VERCEL_ENV === 'production') {
    try {
        const inspection = inspectConfiguration();
        if (inspection.pendingChanges) throw new Error('Revisão de configuração desatualizada.');
        const quality = await inspectQuality(inspection);
        if (!quality.releaseApproved) throw new Error(`Entrega bloqueada: revisão pendente dos cenários ${quality.regressionIds.join(', ')}.`);
        console.log('Configuração aprovada para a entrega em produção.');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
} else {
    console.log('Build de desenvolvimento/preview; não representa aprovação de produção.');
}
