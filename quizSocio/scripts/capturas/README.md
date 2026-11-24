# Capturas do recomendador

Geram as exportações em `entregas/conteudo-recomendacoes-<data>/`: capturas, textos extraídos da tela e `inventario.json`.

- `perfis.cjs`: os cinco perfis de resposta e as capturas de cada um.
- `capturar.cjs`: responde o quiz pela interface compilada (`dist/`) no Chrome e grava as imagens e `_rodada.json`.
- `montar.py`: otimiza os PNGs (paleta de 256 cores só acima de 1 MB), copia os logotipos e escreve textos, README e inventário.
- `cdp-export.cjs`: cópia de `tests/cdp.js` que deixa carregar fontes e imagens públicas; analytics e checkout seguem bloqueados.

```bash
npm run build
node scripts/capturas/capturar.cjs . /tmp/rodada
python3 -I scripts/capturas/montar.py /tmp/rodada . 2026-11-24
```
