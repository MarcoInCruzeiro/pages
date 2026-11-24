# Verificação visual da interface

Revisão local em 26/10/2026, com respostas fictícias e analytics bloqueado. As imagens foram capturadas no Chrome headless e inspecionadas em desktop e celular.

## Confirmação de respostas

| Estado | Desktop | Celular |
| --- | --- | --- |
| Antes | [Captura](antes-confirmacao-desktop.png) | [Captura](antes-confirmacao-mobile.png) |
| Depois | [Captura](depois-confirmacao-desktop.png) | [Captura](depois-confirmacao-mobile.png) |

A reprodução inicial tinha texto quase branco sobre amarelo claro e botões de 96 px e 56 px desalinhados no desktop. Depois, texto escuro no painel claro, botões de 52 px alinhados e espaçamento de 12 px no celular. A orientação foi reduzida a escolhas reconhecíveis e ações diretas.

## Outros estados conferidos

- Abertura: [390 px](depois-inicio-390.png) e [1280 px](depois-inicio-1280.png).
- Pergunta de histórico e opção desconhecida: [celular](depois-historico-mobile.png).
- Erro de resposta: [celular](depois-erro-mobile.png).
- Resultado: [390 px](depois-resultado-390.png) e [1280 px](depois-resultado-1280.png).
- Comparativo: [celular](depois-comparativo-mobile.png), com detalhes de 14 px e tabela de 1120 px rolável, sem truncamento dos benefícios.

A abertura foi conferida também em 320 e 768 px: sem rolagem horizontal da página, botão dentro do card e logo separado do acesso à conta. O tamanho do título é de 32 px em 320/390 px. A confirmação e o comparativo mantêm as ações acessíveis; menu, foco e Escape têm cobertura de navegador.

A revisão visual não altera critérios de ranking nem as pendências comerciais e de avaliação independente do backlog.

## Linguagem voltada a quem responde

As capturas atuais de abertura e histórico incluem a restauração do título original e do botão “Iniciar”. O apoio do histórico orienta a usar a opção abaixo quando a pessoa não lembra ou ainda não é sócia, sem explicação do cálculo de nível. A confirmação corrigida permanece como registrada acima. [Verificação desta revisão: 55/55 testes](../testes-linguagem-ux-2026-10-26.tap).
