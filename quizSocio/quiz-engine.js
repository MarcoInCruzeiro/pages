/* Adaptador Node. IO/configuração ficam fora do núcleo puro compartilhado com Vue. */
const { createEngine: createPureEngine } = require('./src/engine-core.mjs');
const { carregarTodaConfiguracao, validateConfiguration } = require('./config/adapter.js');
function createEngine(configuration) {
    return createPureEngine(validateConfiguration(configuration));
}
module.exports = {
    ...createEngine(carregarTodaConfiguracao()),
    createEngine,
    getDefaultConfiguration: carregarTodaConfiguracao
};
