# Textos principais em azul-navy

Status: accepted. Decisão do responsável pelo projeto em 26/10/2026.

O texto principal da página usava `--grafite` (`#0a1e3d`), um tom escuro quase preto, que contrastava pouco com o fundo escuro do site e não seguia a identidade visual do Cruzeiro. Por orientação explícita do usuário, todos os textos principais passam a usar a nova variável `--azul-navy` (`#000080`).

- `body`, `.quiz-card`, `.question` e `.option` usam agora `color: var(--azul-navy)`.
- A variável `--azul-navy` foi adicionada ao `:root` ao lado de `--azul-profundo` e `--azul-cruzeiro`.
- Tons escuros secundários (`#44566b`, `#33465e`, `#465a73`) e os tons marrons do `.conflict-panel` (`#493716`, `#635132`) permanecem inalterados para preservar hierarquia visual e estados de alerta.

Esta decisão afeta apenas cores de texto; nenhum layout, espaçamento ou componente foi alterado.
