/** Compilação Ajv para Node/tests/scripts. O navegador consome os compilados via alias no Vite. */
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import catalogoSchema from './planos/catalogo.schema.json' with { type: 'json' };
import questoesSchema from './questoes/questoes.schema.json' with { type: 'json' };
import pesosSchema from './pesos/pesos.schema.json' with { type: 'json' };
import ga4Schema from './ga4/ga4.schema.json' with { type: 'json' };

export const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
ajv.addSchema(pesosSchema);
/** Mesmas chaves e ordem de config/validadores-compilados.mjs. */
export const validadores = {
    catalogo: ajv.compile(catalogoSchema),
    questoes: ajv.compile(questoesSchema),
    pesosRanking: ajv.compile({ $ref: `${pesosSchema.$id}#/$defs/ranking` }),
    pesosPerfil: ajv.compile({ $ref: `${pesosSchema.$id}#/$defs/perfil` }),
    ga4: ajv.compile(ga4Schema)
};
/** Assinatura alinhada a config/validadores-compilados.mjs; o texto é igual. */
export const errosTexto = (erros, dataVar) => ajv.errorsText(erros, { dataVar });

export function carregarConfiguracao(dados, schema) {
    const validacao = ajv.getSchema(schema.$id) || ajv.compile(schema);
    if (!validacao(dados)) throw new Error(`Configuração inválida [${schema.title || 'schema'}] : ${ajv.errorsText(validacao.errors, { dataVar: 'configuração' })}`);
    return dados;
}
