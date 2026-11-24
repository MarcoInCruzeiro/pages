/**
 * Gera `config/validadores-compilados.mjs`: os mesmos validadores que o Node
 * compila com o Ajv, compilados no build e emitidos como módulo ESM
 * independente — o bundle do navegador não inicializa nem compila o Ajv.
 *
 * Regra de identidade: mesma ordem de compilação, mesmas opções
 * (allErrors, strict) e mesmo transporte de formatos do Ajv usado pelo Node.
 * O módulo continua importando os auxiliares de runtime reduzidos do Ajv
 * (equal, ucs2length) e a tabela de formatos — sem o compilador.
 *
 * Rode `node scripts/gerar-validadores.mjs` após alterar qualquer schema e
 * faça o commit do arquivo gerado junto com o schema.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';
import catalogoSchema from '../config/planos/catalogo.schema.json' with { type: 'json' };
import questoesSchema from '../config/questoes/questoes.schema.json' with { type: 'json' };
import pesosSchema from '../config/pesos/pesos.schema.json' with { type: 'json' };
import ga4Schema from '../config/ga4/ga4.schema.json' with { type: 'json' };
import catalogo from '../config/planos/catalogo.json' with { type: 'json' };
import questoes from '../config/questoes/questoes.json' with { type: 'json' };
import pesosRanking from '../config/pesos/ranking.json' with { type: 'json' };
import pesosPerfil from '../config/pesos/perfil.json' with { type: 'json' };
import ga4 from '../config/ga4/ga4.json' with { type: 'json' };

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(raiz, 'config/validadores-compilados.mjs');

/** Mesma ordem e mesmas chaves do mapa publicado por `config/adapter.js`. */
const referencias = {
    catalogo: catalogoSchema.$id,
    questoes: questoesSchema.$id,
    pesosRanking: `${pesosSchema.$id}#/$defs/ranking`,
    pesosPerfil: `${pesosSchema.$id}#/$defs/perfil`,
    ga4: ga4Schema.$id
};

const ajv = new Ajv2020({ allErrors: true, strict: true, code: { source: true, esm: true } });
addFormats(ajv);
ajv.addSchema(pesosSchema);
ajv.compile(catalogoSchema);
ajv.compile(questoesSchema);
ajv.compile({ $ref: referencias.pesosRanking });
ajv.compile({ $ref: referencias.pesosPerfil });
ajv.compile(ga4Schema);

let codigo = standaloneCode(ajv, referencias);
// O standalone emite `const X = require("y").prop.cadeia;` no topo do módulo.
// O Node expõe module.exports em namespace.default; o Vite expõe seus campos
// diretamente no namespace quando o CommonJS declara __esModule. Resolve a
// primeira propriedade nos dois formatos antes de navegar o resto da cadeia.
let resolvidos = 0;
codigo = codigo.replace(/const (\w+) = require\("([^"]+)"\)\.((?:[$\w]+(?:\.[$\w]+)*));/g, (match, nome, especificacao, cadeia) => {
    resolvidos += 1;
    const modulo = `${nome}__expressed_${resolvidos}`;
    const caminhoJs = /\.\w+$/.test(especificacao) ? especificacao : `${especificacao}.js`;
    const [primeira, ...restante] = cadeia.split('.');
    const acesso = `(${modulo}.default?.${primeira} ?? ${modulo}.${primeira})`;
    return `import * as ${modulo} from "${caminhoJs}";\nconst ${nome} = ${acesso}${restante.length ? `.${restante.join('.')}` : ''};`;
});
const restantes = [...codigo.matchAll(/require\(/g)];
if (restantes.length) throw new Error(`require restante no módulo gerado: ${restantes.map((m) => codigo.slice(m.index, m.index + 60)).join(' | ')}`);

const final = `/** GERADO por scripts/gerar-validadores.mjs — não editar. Commit junto com os schemas. */
const idCatalogo = ${JSON.stringify(catalogoSchema.$id)};
const idQuestoes = ${JSON.stringify(questoesSchema.$id)};
const idGa4 = ${JSON.stringify(ga4Schema.$id)};
${codigo}

/** Mesmas chaves e ordem de config/adapter.js. */
export const validadores = { catalogo, questoes, pesosRanking, pesosPerfil, ga4 };

/**
 * Réplica exata de Ajv.errorsText ({ separator: ', ', dataVar }) para o
 * bundle do navegador; o teste de validadores compara as duas implementações.
 */
export function errosTexto(erros = null, variavel = 'data') {
    if (!erros || erros.length === 0) return 'No errors';
    return erros.map((e) => \`\${variavel}\${e.instancePath} \${e.message}\`).reduce((ac, msg) => \`\${ac}, \${msg}\`);
}

/**
 * Validador direto por schema já registrado. Sem compilador no navegador:
 * schemas não pré-compilados (ou a raiz completa de pesos, cuja escolha entre
 * ranking e perfil depende dos dados) falham com mensagem explícita.
 */
export function carregarConfiguracao(dados, schema) {
    const id = schema?.$id;
    const diretos = { [idCatalogo]: 'catalogo', [idQuestoes]: 'questoes', [idGa4]: 'ga4' };
    const chave = diretos[id];
    if (!chave) throw new Error(\`Configuração inválida [schema] : validador pré-compilado indisponível (id: \${id})\`);
    const validar = validadores[chave];
    if (!validar(dados)) throw new Error(\`Configuração inválida [\${schema.title || 'schema'}] : \${errosTexto(validar.errors, 'configuração')}\`);
    return dados;
}
`;

if (process.argv.includes('--check')) {
    if (fs.readFileSync(destino, 'utf8') !== final) throw new Error('Validadores desatualizados: rode npm run config:validators e versione o resultado.');
} else fs.writeFileSync(destino, final);

// Sanidade imediata: o módulo gerado valida a configuração ativa inteira.
const modulo = await import(pathToFileURL(destino).href);
const ativos = { catalogo, questoes, pesosRanking, pesosPerfil, ga4 };
for (const [chave, dados] of Object.entries(ativos)) {
    if (modulo.validadores[chave](structuredClone(dados)) !== true) {
        throw new Error(`Validador gerado ${chave} rejeitou a configuração ativa.`);
    }
}
console.log(`OK: config/validadores-compilados.mjs (${codigo.length} bytes; ${resolvidos} imports de runtime resolvidos)`);
