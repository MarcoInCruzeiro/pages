"""Monta a pasta de entrega a partir de _rodada.json (gerado por capturar.cjs).
Uso: python3 -I montar.py <pasta da rodada> <pasta do projeto quizSocio> <data AAAA-MM-DD>
"""
import hashlib, io, json, os, re, shutil, sys
from PIL import Image, ImageCms

RUN, PROJECT, DATA = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(os.path.join(RUN, '_rodada.json'), encoding='utf-8'))
REV = D['revision']
LIMITE = 1024 * 1024
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
DATA_BR = '/'.join(reversed(DATA.split('-')))
NOMES = {p['slug']: p['nome'] for p in D['catalogo']}

def w(rel, text):
    path = os.path.join(RUN, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(text)

def nbsp(s):
    return s.replace(' ', ' ') if isinstance(s, str) else s

# 1. PNGs: sem perda primeiro; paleta de 256 cores (libimagequant) só acima de 1 MB.
for c in D['capturas']:
    path = os.path.join(RUN, c['arquivo'])
    im = Image.open(path).convert('RGB')
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True, compress_level=9, icc_profile=SRGB)
    metodo = 'PNG sem perda'
    if len(buf.getvalue()) > LIMITE:
        q = im.quantize(colors=256, method=Image.Quantize.LIBIMAGEQUANT, dither=Image.Dither.FLOYDSTEINBERG)
        buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True, icc_profile=SRGB)
        metodo = 'PNG com paleta de 256 cores (libimagequant, pontilhado), porque a versão sem perda passava de 1 MB'
    open(path, 'wb').write(buf.getvalue())
    c['compressao'] = metodo
    c['pixels'] = {'largura': im.size[0], 'altura': im.size[1]}

# 2. Logotipos originais, sem alteração.
for p in D['catalogo']:
    src = os.path.join(PROJECT, 'img', {'meu-cruzeiro': 'meuCruzeiro.png', 'time-do-povo': 'timeDoPovo.png', 'cabuloso': 'cabuloso.png', 'cabuloso-max': 'cabulosoMax.png'}[p['slug']])
    dst = os.path.join(RUN, 'imagens/logotipos', p['slug'] + '.png')
    os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copyfile(src, dst)

shutil.copyfile(os.path.join(PROJECT, 'config/revision.json'), os.path.join(RUN, 'revision.json'))
P = D['textosPorPerfil']; T = D['tabela']
PERFIS = {c['perfil']: c['respostas'] for c in D['capturas']}
CAPT = {}
for c in D['capturas']:
    CAPT.setdefault(c['perfil'], []).append(c)

# 3. Textos.
selos_lista = sorted({cd['selo'] for v in P.values() for cd in v['cards']})
notas_lista = sorted({cd['nota'] for v in P.values() for cd in v['cards']})
cards = [f"# Cards de recomendação\n\nConteúdo atual da aplicação, exportado em {DATA_BR} (catálogo {REV['catalogVersion']}, regras {REV['rulesVersion']}). Os benefícios e CTAs abaixo são os que o motor da página gera com as respostas do perfil 1; os cards de cada perfil estão em `03-resultado-e-textos-dinamicos.md`.\n",
         "## Textos comuns\n",
         f"- Título da lista: {P['1']['tituloLista']}", f"- Subtítulo: {P['1']['subtituloLista']}",
         f"- Selos que apareceram nesta exportação: {'; '.join(selos_lista)}. O selo \"Acima do orçamento\" só aparece no comparativo, porque a lista mostra os 3 primeiros planos dentro do orçamento.",
         f"- Notas no lugar da afinidade: {'; '.join(notas_lista)}.", ""]
for p in D['catalogo']:
    cards += [f"## {p['nome']}\n", f"- Preço: {nbsp(p['preco'])}", f"- Referência: {p['referencia']}", f"- Adesão: {nbsp(p['adesao'])}",
              f"- CTA: {p['cta']}", f"- Logotipo: imagens/logotipos/{p['slug']}.png", f"- Texto alternativo: Logo do plano {p['nome']}", "",
              "### Benefícios\n", *[f"- {nbsp(b)}" for b in p['beneficios']], "", "### Link de contratação\n", p['link'], ""]
w('textos/01-cards-recomendacao.md', '\n'.join(cards))

head = '| Informação | ' + ' | '.join(pl['nome'] for pl in T['planos']) + ' |'
rows = [head, '| --- ' * (len(T['planos']) + 1) + '|',
        '| Selo | ' + ' | '.join(pl['selo'] or '—' for pl in T['planos']) + ' |']
for l in T['linhas']:
    rows.append(f"| {l['rotulo']} | " + ' | '.join(nbsp(c['texto']).replace('|', '/').replace(' · ', '<br>') for c in l['celulas']) + ' |')
rows.append('| CTA | ' + ' | '.join(c['texto'] for c in T['ctas']) + ' |')
tips = '\n'.join(f"### {t['plano']}\n\n{nbsp(t['texto'])}\n" for t in D['tooltips'])
w('textos/02-tabela-comparacao.md', f"# {T['titulo']}\n\n{T['orientacao']}\n\n## Conteúdo da tabela (perfil 1)\n\nA coluna destacada é a do plano recomendado ({', '.join(pl['nome'] for pl in T['planos'] if pl['destacado'])}). A tabela tem {len(T['linhas'])} linhas de informação, mais a linha dos botões.\n\n" + '\n'.join(rows) + f"\n\n## Textos completos dos tooltips\n\n{tips}")

res = [f"# Card principal e textos dinâmicos\n\nTextos que a aplicação mostrou para cada perfil desta exportação, extraídos da tela na mesma rodada das imagens ({DATA_BR}).\n"]
for pid, v in P.items():
    nomes = {'1': 'Cabuloso presencial', '2': 'Cabuloso nível 3', '3': 'Time do Povo', '4a': 'Sem estádio, sem compras', '4b': 'Sem estádio, com compras'}
    res += [f"## Perfil {pid} · {nomes.get(pid, '')}\n", f"Capturas: {', '.join(c['arquivo'] for c in CAPT.get(pid, []))}\n",
            f"- Selo: {v['selo']}", f"- Plano: {v['plano']}", f"- Preço: {nbsp(v['preco'])} · {v['referencia']} · {nbsp(v['adesao'])}",
            f"- Resumo: {nbsp(v['resumo'])}"]
    if v['avisoSetor']: res.append(f"- Aviso de setor: {nbsp(v['avisoSetor'])}")
    res += ["- Motivos:", *[f"    - {nbsp(m)}" for m in v['motivos']], f"- Botões: {' · '.join(v['acoes'])}", "",
            f"### Lista: {v['tituloLista']} ({v['subtituloLista']})\n"]
    for i, cd in enumerate(v['cards'], 1):
        res += [f"{i}. **{NOMES[cd['slug']]}** · {cd['selo']} · {cd['nota']} · CTA \"{cd['cta']}\"", *[f"    - {nbsp(b)}" for b in cd['beneficios']]]
        if cd['avisoSetor']: res.append(f"    - {nbsp(cd['avisoSetor'])}")
    res.append('')
res += ["## Sobre a recomendação\n", *[nbsp(s) + '\n' for s in P['1']['sobre']]]
w('textos/03-resultado-e-textos-dinamicos.md', '\n'.join(res))

estruturado = {'data': DATA, 'catalogo': REV['catalogVersion'], 'regras': REV['rulesVersion'],
               'origem': 'Aplicação compilada da pasta principal (quiz/port-vue); respostas sintéticas dadas pela interface',
               'planos': D['catalogo'], 'perfis': {pid: {'respostas': PERFIS.get(pid), **v} for pid, v in P.items()},
               'comparacao': T, 'tooltips': D['tooltips'], 'verificacao': D['verificacao']}
w('textos/conteudo-estruturado.json', json.dumps(json.loads(json.dumps(estruturado).replace('\\u00a0', ' ')), ensure_ascii=False, indent=2))
completo = '\n\n'.join(open(os.path.join(RUN, 'textos', f), encoding='utf-8').read() for f in ['01-cards-recomendacao.md', '02-tabela-comparacao.md', '03-resultado-e-textos-dinamicos.md'])
w('textos/conteudo-completo.txt', re.sub(r'^#+ ', '', completo, flags=re.M))

# 4. README.
imgs = sorted(c['arquivo'] for c in D['capturas'])
readme = f"""# Capturas do Recomendador 5 Estrelas

Exportação da interface compilada em {DATA_BR}, feita depois da remoção de conteúdo exclusivo, quiz e votação. Versões: catálogo {REV['catalogVersion']}, regras {REV['rulesVersion']}, GA4 {REV['ga4Version']}.

## Capturas

| # | Arquivo | Perfil | Plano recomendado |
| --- | --- | --- | --- |
""" + '\n'.join(f"| {c['captura']} | [{c['arquivo']}]({c['arquivo']}) | {c['perfil']} | {NOMES.get(c['planoRecomendado'], c['planoRecomendado'])} |" for c in D['capturas']) + f"""

Desktop em 1280 × 900 px com densidade 2; celular em 390 × 844 px com densidade 3. Os recortes de desktop pegam só o componente, com 24 px de margem. A captura de resultado no celular vai do topo da tela até o fim do card principal, por isso a janela foi aumentada só na altura. As posições do selo, preço, resumo, motivos, "Sobre a recomendação" e botões da captura A estão no `inventario.json`.

A fonte Outfit e as imagens do cabeçalho carregaram normalmente. Os PNGs levam perfil sRGB. Os que passavam de 1 MB sem perda foram salvos com paleta de 256 cores; o `inventario.json` diz quais.

## Textos

- [Cards](textos/01-cards-recomendacao.md)
- [Comparativo e tooltips](textos/02-tabela-comparacao.md)
- [Card principal e cards de cada perfil](textos/03-resultado-e-textos-dinamicos.md)
- [Tudo em um TXT](textos/conteudo-completo.txt)
- [Dados estruturados](textos/conteudo-estruturado.json)

Os textos foram extraídos da tela na mesma rodada das imagens.

## Conferência

- Erros de execução: {len(D['verificacao']['errosDeExecucao'])}
- Requisições de analytics: {len(D['verificacao']['enviosDeAnalytics'])} (GA4 bloqueado antes do envio)
- Navegações para o checkout: {len(D['verificacao']['navegacoesParaCheckout'])}
- Capturas com foco, tooltip aberto, "Sobre a recomendação" aberto ou animação em curso: {sum(1 for c in D['capturas'] if any(c['estadoNaCaptura'].values()))}
- Capturas com "conteúdo exclusivo", "quiz e votações", "ficou perto" ou "Também recomendado": {sum(1 for c in D['capturas'] if c['textoProibido'])}
"""
w('README.md', readme)

# 5. Inventário com SHA-256 de cada arquivo.
arquivos = []
for root, _, files in os.walk(RUN):
    for f in sorted(files):
        full = os.path.join(root, f); rel = os.path.relpath(full, RUN)
        if rel.startswith('_') or rel == 'inventario.json':
            continue
        data = open(full, 'rb').read()
        arquivos.append({'caminho': rel, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
arquivos.sort(key=lambda a: a['caminho'])
sha = {a['caminho']: a['sha256'] for a in arquivos}
for c in D['capturas']:
    c['sha256'] = sha[c['arquivo']]; c['bytes'] = next(a['bytes'] for a in arquivos if a['caminho'] == c['arquivo'])
    c['versoes'] = {'catalogo': REV['catalogVersion'], 'regras': REV['rulesVersion']}
    c.pop('textoProibido', None)
inv = {'data': DATA, 'versoes': {'catalogo': REV['catalogVersion'], 'regras': REV['rulesVersion'], 'ga4': REV['ga4Version']},
       'capturas': D['capturas'], 'verificacao': D['verificacao'], 'arquivos': arquivos}
w('inventario.json', json.dumps(inv, ensure_ascii=False, indent=2))
os.remove(os.path.join(RUN, '_rodada.json'))
print('ok', len(arquivos), 'arquivos;', 'acima de 1 MB:', [a['caminho'] for a in arquivos if a['bytes'] > LIMITE])
