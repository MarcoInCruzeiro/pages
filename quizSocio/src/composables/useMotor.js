import { carregarTodaConfiguracao, validateConfiguration } from '../../config/adapter.js';
import { createEngine } from '../engine-core.mjs';

/** A aplicação e os testes usam o mesmo núcleo e o mesmo snapshot validado. */
export function createMotorConfigurado(configuration = carregarTodaConfiguracao()) {
    const config = validateConfiguration(structuredClone(configuration));
    return { motor: createEngine(config), config };
}
