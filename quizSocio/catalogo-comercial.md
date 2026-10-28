# Catálogo comercial — Sócio 5 Estrelas

Referência documental das condições comerciais aceitas. A fonte operacional é o [catálogo JSON](config/planos/catalogo.json), validado e incorporado ao build do quiz. Alterações comerciais exigem justificativa documental e revisão da configuração; assinatura, adesão e opcionais permanecem separados.

## Fonte e vigência

| Campo | Valor |
|---|---|
| Documento | Regulamento e Termo de Uso do Programa Sócio 5 Estrelas |
| URL | https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso |
| Publicação | 11/09/2026 |
| Consulta | 26/10/2026 |
| Complemento | https://socio.cruzeiro.com.br/duvidas |
| Tabela operacional de planos | https://socio.cruzeiro.com.br/planos (consultada em 26/10/2026) |
| Revisão operacional | [Manifesto da configuração](config/revision.json), independente da data da fonte oficial |

Condições comerciais podem mudar sem aviso. Antes de publicar uma alteração, repetir a conferência na fonte oficial e atualizar a data de consulta neste documento e no motor.

## Regras de uso dos dados

1. Só campos confirmados na fonte vigente entram em recomendação, cards, comparativo e CTA.
2. Campos sem confirmação ficam registrados em **Campos pendentes** e não são promovidos a benefício.
3. Garantia de ingresso é diferente de prioridade de compra. Os quatro planos ativos oferecem prioridade sujeita à disponibilidade; nenhum deles promete ingresso garantido por jogo.
4. O ingresso do Time do Povo é **popular** (menor valor de venda online da arquibancada), não um ingresso fixo de R$ 40.
5. O recomendador exibe o valor mensal de referência, sem total anual ou parcelamento. Em 26/10/2026, os quatro planos só permitiam cobrança semestral ou anual; a referência mensal não representa uma modalidade de cobrança mensal. A modalidade real e os valores contratuais permanecem registrados no catálogo e no checkout.
6. A [ADR-0001](docs/adr/0001-valores-e-taxas-separados.md) mantém assinatura, adesão, opcionais e ingressos separados. R$ 150 é apenas base do exemplo unitário de desconto; não existe projeção de gasto mensal nem ingresso popular fixado em R$ 40.
7. O item 12.2 do Termo de Uso confirma ingresso de Kids aprovado sem custo adicional, no setor do titular, mediante disponibilidade e aquisição do ingresso do titular. O opcional é apresentado separadamente por R$ 30/mês por criança, com essas condições; elegibilidade é para menores de 12 anos.

## Matriz comercial confirmada

A revisão de quatro planos foi solicitada pelo usuário na spec de migração. A [revisão histórica de cinco planos](docs/history/catalogo-comercial-cinco-planos-2026-10-27.md) foi preservada; o plano retirado não permanece como oferta pendente ou invisível.

### Meu Cruzeiro

| Campo | Condição |
|---|---|
| Preço | R$ 12/mês |
| Modalidade | Cobrança semestral ou anual; valor mensal de referência |
| Taxa de adesão | Sem taxa |
| Ingresso | 1 ingresso gratuito por temporada, mediante disponibilidade |
| Setores | Amarelo (inferior ou superior) ou Laranja (inferior ou superior) |
| Prioridade | 4 |
| Loja | Até 10% em produtos e serviços oficiais |
| Conteúdo, quiz e votação | Sim |
| Carteirinha | Digital; física opcional por R$ 30 |
| Kids | Opcional: R$ 30/mês por criança, até 3 menores de 12 anos |
| PcD | Não |

### Time do Povo

| Campo | Condição |
|---|---|
| Preço | R$ 40/mês |
| Modalidade | Cobrança semestral ou anual; valor mensal de referência |
| Taxa de adesão | R$ 30, única |
| Ingresso | 1 ingresso popular, pelo menor valor de venda online da arquibancada, mediante disponibilidade |
| Setores | Amarelo (inferior ou superior) ou Laranja (inferior ou superior) |
| Prioridade | 4 |
| Loja | Até 10% em produtos e serviços oficiais |
| Conteúdo, quiz e votação | Sim |
| Carteirinha | Física incluída |
| Kids | Opcional: R$ 30/mês por criança, até 3 menores de 12 anos |
| PcD | Não |

### Cabuloso

| Campo | Condição |
|---|---|
| Preço | R$ 100/mês |
| Modalidade | Cobrança semestral ou anual; valor mensal de referência |
| Taxa de adesão | R$ 30, única |
| Ingresso | 1 ingresso com desconto progressivo, mediante disponibilidade |
| Setores | Amarelo (inferior e superior), Laranja (inferior e superior), Sicoob/Leste (inferior e superior) e Roxo Superior |
| Níveis | 0–9 jogos em 15 meses: nível 1, prioridade 3, 50%; 10–19: nível 2, prioridade 2, 55%; 20 ou mais: nível 3, prioridade 1, 60% |
| Histórico não confirmado | Nível 1 (condição inicial), identificado como projeção |
| Loja | Até 15% em produtos e serviços oficiais |
| Conteúdo, quiz e votação | Sim |
| Carteirinha | Física incluída |
| Kids | Opcional: R$ 30/mês por criança, até 3 menores de 12 anos |
| PcD | Opcional gratuito no Sicoob — Leste Inferior, mediante análise e disponibilidade |

### Cabuloso Max

| Campo | Condição |
|---|---|
| Preço | R$ 200/mês |
| Modalidade | Cobrança semestral ou anual; valor mensal de referência |
| Taxa de adesão | R$ 30, única |
| Ingresso | Até 2 ingressos com 65% de desconto, mediante disponibilidade |
| Setores | Amarelo, Laranja, Sicoob/Leste e Roxo (inferior e superior) |
| Prioridade | 1 |
| Loja | Até 15% em produtos e serviços oficiais |
| Conteúdo, quiz e votação | Sim |
| Carteirinha | Física incluída |
| Kids | Opcional: R$ 30/mês por criança, até 3 menores de 12 anos |
| PcD | Não |

## Conferência operacional da oferta

A tabela pública de planos (`/planos`, consultada em 26/10/2026) expõe os seguintes dados:

| Plano | `plano_id` | Valor mensal de referência | Valor anual | Cobrança mensal | Cobrança semestral | Cobrança anual | Padrão |
|---|---|---|---|---|---|---|---|
| Meu Cruzeiro | 21 | R$ 12 | R$ 144 | Não permitida | Permitida | Permitida | Anual |
| Time do Povo | 34 | R$ 40 | R$ 480 | Não permitida | Permitida | Permitida | Anual |
| Cabuloso | 10 | R$ 100 | R$ 1.200 | Não permitida | Permitida | Permitida | Anual |
| Cabuloso Max | 11 | R$ 200 | R$ 2.400 | Não permitida | Permitida | Permitida | Anual |

A mesma tabela confirma Time do Povo com prioridade 4, loja de até 10% e “1 ingresso popular”.

O Termo de Uso descreve as modalidades mensal, semestral e anual, mas o item 1.2.2 atribui ao usuário a conferência das modalidades disponíveis no momento da adesão e o item 1.2.3 admite indisponibilidade temporária. Por isso, a interface apresenta a cobrança vigente (semestral ou anual) e mantém o valor mensal apenas como referência de comparação e de orçamento.

Os destinos de contratação usam o plano e o intervalo vigentes. A abertura dos checkouts não pôde ser observada em 26/10/2026 porque a proteção Cloudflare exibiu desafio de segurança; nenhuma compra foi iniciada. A conferência possível é estrutural: `plano_id`, intervalo, valor e UTMs coincidem com a tabela operacional e o Termo.

## Divergências encontradas e decisão

| Plano/campo | Valor anterior (commit `2cecf81`) | Condição confirmada | Impacto |
|---|---|---|---|
| Time do Povo — loja | Até 15% | Até 10% | Reduz o componente de desconto; deixa de empatar com Cabuloso e Max nesse atributo |
| Time do Povo — prioridade | 3 | 4 | Piora relativa na compra; deixa de ser apresentado como vantagem sobre o Meu Cruzeiro |
| Time do Povo — conteúdo e votação | Não | Sim | Passa a pontuar em experiências e conteúdo como os demais planos |
| Time do Povo — ingresso | “Todo jogo por R$ 40” | 1 ingresso popular pelo menor valor online, mediante disponibilidade | Remove a promessa de preço fixo; informa benefício popular com valor variável por jogo |
| Meu Cruzeiro — link | Checkout com `intervalo_cobrancas=anual` e preço mensal | Cobrança anual, com valor mensal apenas como referência | Alinha o destino à modalidade vigente e evita anunciar mensalidade como cobrança disponível |
| Modalidade dos quatro planos | “Mensal, semestral ou anual” | Cobrança semestral ou anual; valor mensal de referência | Corrige a disponibilidade operacional sem perder a comparação mensal usada no orçamento |
| Cabuloso — prioridade | Lista de níveis sem uso no ranking | Prioridade derivada do nível 1/2/3 | Torna prioridade e desconto coerentes com o histórico informado |
| Cabuloso Max — exemplo de preço | “R$ 150 por R$ 52” | 65% sobre R$ 150 = R$ 52,50 | Corrige arredondamento; o card usa o percentual e o valor calculado |
| Todos — desconto em parceiros | `true` sem confirmação | Não confirmado na fonte | Removido dos benefícios e mantido como campo pendente |

## Campos pendentes

| Campo | Situação | Tratamento |
|---|---|---|
| Desconto em parceiros | Não confirmado no Termo de Uso consultado | Registrado em `camposPendentes`; não é exibido nem pontuado |
| Disponibilidade de setores por jogo | Definida pelo clube e variável | Textos usam “mediante disponibilidade”; o quiz não promete setor esgotado |
| Preço efetivo do ingresso popular | Varia por jogo e venda | Valor variável por jogo; o quiz apresenta a condição popular sem fixar preço |
| Preço efetivo do ingresso inteiro | Varia por jogo e setor | R$ 150 aparece somente na base identificada do exemplo unitário de desconto |

## Reconferência do opcional Kids em 26/10/2026

O item 12.2 do [Termo de Uso](https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso) confirma o ingresso sem custo adicional após aprovação do opcional, sujeito à disponibilidade e ao ingresso do titular no mesmo setor. A pendência anterior sobre cobertura foi resolvida pela fonte. O quiz informa o preço por criança e o benefício de ingresso separadamente, sem somá-los à assinatura; aprovação e disponibilidade real continuam a cargo do programa.

## Conferência rápida

### Fonte indicada pelo usuário — 27/10/2026

O usuário indicou a [página oficial de planos](https://socio.cruzeiro.com.br/planos) como referência comercial. Sua leitura acessível exibiu a estrutura da página; os detalhes foram complementados pelas páginas oficiais de entrada, Termo de Uso, dúvidas e Kids. A [referência documental versionada](tests/fixtures/official-commercial-reference.json) registra os fatos conferidos e é comparada com o catálogo em `tests/verification.test.mjs`.

O regulamento admite mensal, semestral e anual para os quatro planos de assinatura. As tentativas automatizadas anteriores terminaram em fila, mas o usuário confirmou posteriormente a validação do QUIZ-003 e os preços corretos. O [aceite vigente](tickets/concluidos/003-modalidade-e-checkout.md#aceite-vigente--27102026) encerra essa pendência; valores e URLs foram preservados.

### Comandos

- `node --test tests/engine.test.js` valida catálogo, níveis, setores, custos e vínculos de checkout.
- `node --test tests/reference.test.js` valida as metas de qualidade definidas no QUIZ-009.
- `node --test tests/verification.test.mjs` verifica a referência documental e os comandos de diagnóstico/preparo.
- A tabela comparativa e os cards devem ser conferidos contra esta matriz em qualquer alteração comercial.
