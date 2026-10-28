# Exibir os valores do plano e as taxas separadamente

Status: accepted. Decisão do responsável pelo projeto em 26/10/2026.

O quiz somava assinatura, ingressos e Kids em um custo mensal estimado e acrescentava adesão para apresentar um primeiro mês. Por orientação explícita do usuário, cada valor passa a ser apresentado na sua própria condição comercial: assinatura, taxa de adesão, opcional por criança e benefício de ingresso. Isso preserva o preço anunciado do plano e evita misturar cobranças com períodos e condições diferentes.

- A assinatura mantém o valor e a modalidade do catálogo. Parcelas e total anual são apresentados quando pertencem ao próprio contrato.
- A taxa de adesão aparece em campo separado, com valor e periodicidade, inclusive no resultado principal. Planos isentos mostram essa condição.
- Kids aparece pelo preço por criança, como opcional separado. Quantidade de crianças ou acompanhantes não aumenta o preço exibido da assinatura.
- Ingressos aparecem como benefício e, quando aplicável, exemplo de valor unitário com sua premissa identificada. Exemplos não constituem preço universal nem despesa mensal prevista.
- O motor devolve valores separados; totais combinados, projeções de gastos por mês e total do primeiro mês deixam de existir.
- Elegibilidade e componente de preço do ranking usam apenas a assinatura mensal equivalente. Benefícios, capacidade de acompanhantes e condições de setor continuam avaliados em seus próprios componentes.

Esta decisão substitui a soma de custos, o horizonte de gasto e o uso desse total no ranking registrados anteriormente nos QUIZ-008, QUIZ-009 e QUIZ-010. Os relatórios das regras anteriores permanecem como histórico, identificados pela versão. A alteração pode mudar índices e vencedores; a avaliação independente do recomendador continua pendente.

Exemplo: Cabuloso Max mostra assinatura de R$ 200/mês de referência, contratação conforme catálogo, adesão única de R$ 30, Kids opcional de R$ 30/mês por criança e até dois ingressos com 65% de desconto. O exemplo de ingresso de R$ 150 por R$ 52,50 é unitário; esses valores não formam um novo preço do plano.
