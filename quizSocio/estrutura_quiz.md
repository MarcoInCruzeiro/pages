# Estrutura do Quiz Sócio 5 Estrelas

Documento de apoio do quiz publicado em [`index.html`](index.html). O catálogo comercial tem uma fonte própria, [`catalogo-comercial.md`](catalogo-comercial.md); este documento descreve como perguntas, perfil, ranking e interface usam esses dados.

## 0. Visão geral

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Catálogo, perguntas, validação e ranking | [`quiz-engine.js`](quiz-engine.js) | Funções puras, sem DOM, analytics ou estado global |
| Interface | [`index.html`](index.html) | Renderização, navegação, confirmação de conflitos, analytics e CTAs |
| Fonte comercial | [`catalogo-comercial.md`](catalogo-comercial.md) | Condições oficiais, divergências, pendências e data de consulta |
| Testes | [`tests/`](tests/) | Motor, referência de qualidade e fluxo real de navegador |

Fonte oficial consultada em 26/10/2026: https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso (publicação de 11/09/2026). O motor expõe `CATALOG_VERSION = 2026-09-11` e `RULES_VERSION = 2026-10-26` (regras de perfil e ranking).

## 1. Planos — condições confirmadas

A matriz completa, com taxa de adesão, setores, níveis, opcionais e divergências, está em [`catalogo-comercial.md`](catalogo-comercial.md). Resumo usado pelo quiz:

| Plano | Contratação exibida | Ingresso | Prioridade/garantia | Loja | Conteúdo e votação |
|---|---|---|---|---|---|
| Meu Cruzeiro | R$ 12/mês de referência; cobrança semestral ou anual; sem adesão | 1 gratuito por temporada, Amarelo/Laranja, mediante disponibilidade | Prioridade 4 | Até 10% | Sim |
| Time do Povo | R$ 40/mês de referência; cobrança semestral ou anual; adesão R$ 30 | 1 popular pelo menor valor online da arquibancada, Amarelo/Laranja | Prioridade 4 | Até 10% | Sim |
| Cabuloso | R$ 100/mês de referência; cobrança semestral ou anual; adesão R$ 30 | 1 com desconto progressivo de 50% a 60% | Nível 1: prioridade 3; nível 2: 2; nível 3: 1 | Até 15% | Sim |
| Cabuloso Max | R$ 200/mês de referência; cobrança semestral ou anual; adesão R$ 30 | Até 2 com 65% de desconto | Prioridade 1 | Até 15% | Sim |
| Cabuloso Cativo | Anual: R$ 4.800 em 12x de R$ 400; sem adesão | 1 garantido por jogo no Sicoob — Leste Inferior, temporada 2026 | Ingresso garantido | Até 10% | Sim |

Regras que a interface deve preservar:

- Garantia de ingresso não é o mesmo que prioridade. Só o Cativo tem garantia.
- O Time do Povo não promete ingresso fixo de R$ 40; promete o menor valor online da arquibancada.
- O Cativo é exclusivamente anual; card e checkout mostram 12x R$ 400 e `intervalo_cobrancas=anual`.
- Os quatro demais planos usam R$ X/mês como referência, mas a cobrança vigente na tabela oficial é semestral ou anual; os CTAs usam `intervalo_cobrancas=anual`.
- Campos não confirmados, como desconto em parceiros, não aparecem como benefício.

## 2. Perguntas — 12 respostas

| # | Chave | Tipo | Valores | Uso no perfil |
|---|---|---|---|---|
| 1 | `gamesPerYear` | Range 0–30 | 0 a 30 | Intenção anual de jogos; volume de uso e custo |
| 2 | `gamesHistory` | Range 0–30 ou “não sei” | 0 a 30, `unknown` | Histórico de 15 meses; define nível do Cabuloso |
| 3 | `wantsGuaranteedTicket` | Opção | `never`, `true`, `false` | Presença declarada; detecta conflito com jogos |
| 4 | `buysTwoTickets` | Opção | `true`, `false` | Necessidade de acompanhante adulto |
| 5 | `kidsCount` | Opção | 0, 1, 2, 3 | Quantidade de opcionais Kids |
| 6 | `needsPriority` | Opção | `true`, `false` | Importância de prioridade na compra |
| 7 | `wantsParticipation` | Opção | `true`, `false` | Interesse em experiências e conteúdo |
| 8 | `wantsStoreDiscount` | Opção | `true`, `false` | Interesse em produtos oficiais |
| 9 | `gameFrequency` | Opção | `always`, `frequent`, `occasional` | Frequência declarada; detecta conflito com jogos |
| 10 | `digitalExperience` | Opção | `true`, `false` | Interesse em conteúdo digital |
| 11 | `budget` | Opção | 40, 100, 200, 400 | Teto mensal da assinatura, não do uso |
| 12 | `preferredSector` | Opção | `yellow-orange`, `blue`, `purple` | Preferência flexível de setor |

Validação aceita `0` e `false` como respostas. `null`, `undefined`, valores fora do intervalo e opções inexistentes mantêm o usuário na pergunta. Ao finalizar, todas as respostas são verificadas e a primeira inválida é reaberta com mensagem visível.

### Conflitos e confirmação

Combinações incompatíveis não são corrigidas em silêncio. A interface mostra os conflitos e exige confirmação ou revisão:

- 0 jogo por ano + “faço questão de ir a todos os jogos”.
- 0 jogo por ano + “sempre na arquibancada”.
- 0 jogo por ano + “fico dividido entre estádio e TV”.
- Mais de 0 jogo por ano + “não frequento o estádio”.

Ao confirmar, as duas respostas permanecem registradas. A intenção anual define o volume de jogos; a declaração de não frequentar o estádio zera a necessidade presencial. Revisar volta à primeira pergunta envolvida.

## 3. Perfil do usuário — escala 0 a 10

O perfil é reconstruído a cada resposta; voltar e editar não acumula efeitos.

| Atributo | Cálculo |
|---|---|
| `frecuencia` | 0,4 × (`gamesPerYear` / 30 × 10) + 0,3 × presença (`never` 0, `true` 9, `false` 5) + 0,3 × declaração (`always` 10, `frequent` 7, `occasional` 2). É zero se `gamesPerYear = 0` ou presença `never` |
| `prioridad` | `needsPriority = true` → 8; `false` → 2; ausente → 5 |
| `experiencias` | `wantsParticipation = true` → 8; `false` → 1; ausente → 5; +2 se `digitalExperience = true` |
| `descuentos` e `productos` | `wantsStoreDiscount = true` → 8; `false` → 1; ausente → 5 |
| `importanciaPreco` | Orçamento 40 → 8; 100 → 5; 200 → 3; 400 → 1 |
| `adultos` | 1 se `buysTwoTickets = true`; caso contrário 0 |
| `kids` | `kidsCount`, limitado a 0–3 |
| `setorPreferido` | `preferredSector` |

Não há inferência de frequência presencial a partir de conteúdo digital, nem de consumo de produtos a partir de frequência. Cada efeito acima tem correspondência direta no texto da pergunta.

## 4. Nível do Cabuloso

Um único cálculo (`resolveLevel`) alimenta ranking, custo, prioridade e textos:

| Histórico de 15 meses | Nível | Prioridade | Desconto |
|---|---|---|---|
| 0 a 9 jogos | 1 | 3 | 50% |
| 10 a 19 jogos | 2 | 2 | 55% |
| 20 ou mais | 3 | 1 | 60% |
| `unknown`, nulo ou ausente | 1 (condição inicial) | 3 | 50% |

A intenção anual (`gamesPerYear`) não concede nível. Histórico desconhecido usa a condição inicial e o resultado identifica que se trata de projeção.

## 5. Custo de uso estimado

O orçamento limita apenas a assinatura (`precoMensalEquivalente`). Ingressos, adesão e opcionais são apresentados separadamente como custo de uso estimado, em horizonte mensal. O horizonte mensal e o significado do orçamento são decisões registradas no QUIZ-009 (26/10/2026): a adesão não entra no custo comparado pelo ranking e aparece como custo do primeiro mês.

```
assinatura = preço mensal equivalente do plano
kids = quantidade de crianças × R$ 30
ingressos/mês = jogos por ano / 12 × valor do ingresso do titular
acompanhante = jogos por ano / 12 × R$ 150, quando o plano não cobre o adulto extra
custo estimado mensal = assinatura + kids + ingressos + acompanhante
primeiro mês = custo estimado mensal + adesão
```

Regras por tipo de ingresso:

- **Gratuito:** 1 ingresso por temporada; os demais jogos usam R$ 150 de referência.
- **Popular:** usa R$ 40 de referência por jogo.
- **Garantido:** ingresso do titular sem custo adicional; o benefício cobre 1 pessoa.
- **Desconto:** R$ 150 × (1 − desconto do nível).
- **Acompanhante:** um plano com 2 ingressos cobre o titular e no máximo 1 adulto; além disso, usa R$ 150 por jogo.

Arredondamento: os cálculos usam valores sem arredondamento (ex.: Cabuloso nível 2 com 10 jogos = 100 + 10/12 × 150 × 0,45 = R$ 156,25). Só a exibição arredonda para centavos, com `toLocaleString('pt-BR')` (meio para cima). O índice de afinidade é arredondado a uma casa decimal.

Premissas de simulação, exibidas no resultado: ingresso cheio R$ 150, ingresso popular R$ 40 e Kids R$ 30/mês por criança. Ingressos das crianças não entram no custo: o catálogo não confirma se o opcional Kids os cobre, e o resultado informa essa exclusão. Não são preços oficiais universais.

## 6. Ranking — média ponderada transparente

Cada plano recebe sete componentes normalizados entre 0 e 1:

| Componente | Valor |
|---|---|
| `ticket` | Tipo de ingresso: gratuito 0,45; popular 0,75; garantido 1; desconto 0,80 (o percentual entra só pelo custo); sem benefício 0,10. Multiplicado por 1 (setor completo), 0,75 (parcial), 0,10 (fora do setor) ou 1 (sem preferência). +0,08 se leva acompanhante e o plano oferece 2 ingressos |
| `priority` | Garantido → 1; caso contrário (`5 − prioridade`) / 4, limitado a 0–1 |
| `sector` | Preferência completa → 1; parcial → 0,6; fora → 0; sem preferência → 0,7 |
| `discount` | Percentual da loja / 0,15, limitado a 1 |
| `experiences` | Conteúdo e votação → 1; apenas um → 0,7; nenhum → 0,1 |
| `family` | Sem acompanhantes nem Kids → 0,6. Com família: 0,6 × cobertura de ingressos + 0,4 × suporte a Kids |
| `price` | Normalização do custo estimado entre o menor e o maior dos cinco planos |

Pesos:

```
presenca = 0,05 + 0,95 × (frecuencia / 10)
pesoIngresso = presenca × (1 + 0,15 × prioridad / 10)
pesoPrioridade = presenca × (0,2 + 0,8 × prioridad / 10)
pesoSector = (0,8 com preferência; 0,1 sem) × presenca
pesoDesconto = 0,2 + 0,8 × descuentos / 10
pesoExperiencia = 0,2 + 0,8 × experiencias / 10
pesoFamilia = 0,7 com acompanhantes ou Kids; 0,05 sem
pesoPreco = 0,8 + 0,8 × importanciaPreco / 10
```

O índice de afinidade é a média ponderada dos componentes × 100, arredondada a uma casa. Não é probabilidade de acerto. A interface chama o número de “afinidade estimada”, explica os componentes e informa as premissas.

### Papéis do preço e revisão de duplicações (QUIZ-010)

- **Elegibilidade:** a assinatura mensal equivalente precisa caber no teto. É restrição, com tolerância zero.
- **Utilidade:** o componente `price` compara o custo de uso estimado (assinatura + Kids + ingressos previstos). Não há outra penalização de preço.
- **Desconto de ingresso:** entra só pelo custo. Até a calibração de 26/10/2026 ele também somava `0,5 × desconto` à utilidade do ingresso; o mesmo desconto era contado duas vezes. Removido sem mudança de acerto na calibração (12/12 → 12/12).
- **Setor:** tem dois papéis distintos e mantidos. O multiplicador do `ticket` mede onde o benefício vale; o componente `sector` mede a preferência atendida. Sem o componente `sector`, a calibração cai para 11/12 (CAL-10). O peso do setor passou a escalar com a presença: antes, com zero jogos, a cobertura de um ingresso que não seria usado decidia o ranking (CAL-01: Cabuloso 93,1, Max 86,9, Meu Cruzeiro 66,6). Agora: Cabuloso 91,2, Meu Cruzeiro 85,2, Max 83,2; calibração mantida em 12/12.
- **Consumo:** `descuentos` pesa apenas a loja. `productos` existe no perfil, mas não entra no ranking.
- **Frequência:** pesa ingresso e prioridade, que são benefícios diferentes; não pesa loja nem conteúdo.
- **Bônus de setor:** o bônus manual de 6 pontos do commit `2cecf81` foi substituído pela cobertura explícita de setores do catálogo.

### Exemplo verificado (`tests/engine.test.js`)

Entrada: 10 jogos por ano, histórico 10 (Cabuloso nível 2, 55%), foco nos jogos decisivos, sozinho, sem Kids, compra com calma, interesse em experiências, raramente compra produtos, acompanha mais de casa, sem conteúdo digital, teto R$ 100, Sicoob.

| Plano | Custo estimado/mês | Setor | Índice | Elegível |
|---|---|---|---|---|
| Cabuloso | R$ 156,25 (100 + 10/12 × 150 × 0,45) | Completo | 86,4 | Sim — vencedor |
| Cabuloso Max | R$ 243,75 | Completo | 77,3 | Não (R$ 200 > R$ 100) |
| Time do Povo | R$ 73,33 | Fora | 72,6 | Sim |
| Meu Cruzeiro | R$ 124,50 | Fora | 66,4 | Sim |
| Cabuloso Cativo | R$ 400,00 | Parcial | 52,1 | Não |

## 7. Filtro, setor e desempate

- **Orçamento:** planos com assinatura acima do teto ficam fora da recomendação. Se nenhum couber, não há vencedor; os planos aparecem para comparação e o CTA é desativado.
- **Setor:** a preferência é flexível. O vencedor pode não cobrir todo o setor, mas o resultado destaca a diferença e, se houver, oferece uma alternativa que cobre o setor dentro do orçamento.
- **Empate:** diferença menor que 1 ponto no índice marca os dois primeiros como recomendados.
- **Ordem determinística:** maior índice; em empate, menor assinatura; depois, slug do plano. A ordem do catálogo não influencia (`recommendPlans(respostas, catalogo)` recebe o catálogo explicitamente).
- **Motivos:** o resultado lista avisos de setor, motivos positivos ligados às respostas e o custo estimado. Nenhum motivo é inventado para justificar o vencedor.

## 8. Interface e fluxo

### Quiz

```
[████████████████]  progresso
Pergunta X de 12
  Título da pergunta
  [opções ou slider]
  [Voltar]  [Continuar / Ver resultado]
```

- Um clique inicia a transição para o quiz.
- Durante a troca de pergunta ou seção, a navegação fica bloqueada de forma síncrona. Cliques repetidos não pulam perguntas nem duplicam eventos.
- Voltar preserva as respostas e o estado visual.
- Conflitos exibem uma tela de revisão antes do resultado.
- A finalização valida todas as respostas e garante uma única seção de resultado.

### Resultado

```
Plano recomendado
[LOGO]  R$ XX / mês (referência)   ·   Total anual: R$ XXX
Contratação, adesão e custo de uso estimado
Aviso de setor e alternativa, quando aplicável
Motivos da recomendação
[Como calculamos a afinidade estimada]
[Refazer quiz]  [Comparar planos]  [Assinar agora]
```

Os cards laterais mostram até três opções ordenadas pela afinidade, com indicação de “Acima do orçamento” quando aplicável. O comparativo abre em modal, lista os cinco planos, mostra contratação, preço, adesão, ingresso e setores, prioridade/garantia, loja, conteúdo/votação, Kids e afinidade. Fecha pelo botão, pelo fundo ou por `Escape`.

## 9. Analytics

Eventos enviados ao GA4 somente fora do modo preview:

| Evento | Campos principais |
|---|---|
| `quiz_start` | — |
| `quiz_answer` | `quiz_step`, `quiz_question`, `quiz_answer`, `quiz_answer_label`, `answer_time_sec` |
| `quiz_complete` | `recommended_plan`, `affinity_index`, `compatibility` (legado), `score_semantics`, `no_eligible_plan`, `catalog_version`, `total_time_sec` e `answer_*` |
| `quiz_subscribe_click` | `plan`, `recommended_plan`, `clicked_recommended`, `cta_location` |

`compatibility` é mantido como alias do índice para não quebrar consumidores existentes; `score_semantics = indice_afinidade_estimado` documenta a mudança de leitura. O modo preview (`?preview` ou `#preview`) renderiza um cenário fixo e não envia eventos.

## 10. Verificação

| Comando | Cobertura |
|---|---|
| `npm test` | Motor, referência e navegador |
| `npm run test:unit` | Catálogo, validação, níveis, custos, setores, ranking e metas |
| `npm run test:browser` | Navegação, conflitos, resultado único, modal, analytics, mobile e desktop |
| `npm run baseline` | Regenera `tests/fixtures/baseline-reference.json` executando o ranking do commit `2cecf81` sobre a referência. Depende do histórico git; fora de `npm test` |

Metas do QUIZ-009, definidas pelo responsável pelo quiz em 26/10/2026: zero violação de restrição comercial; pelo menos 80% de acerto no primeiro plano e 95% de opção aceitável entre as três primeiras na base reservada. A base tem 12 cenários de calibração, 12 reservados e 5 de contradição; os contraditórios precisam ser detectados e ficam fora das métricas. Linha de base `2cecf81`: 7/12 no top-1 da reserva; versão atual: 12/12. A referência é sintética; ela não mede satisfação, contratação ou retenção de usuários reais.

## 11. Rodapé

| Seção | Conteúdo |
|---|---|
| Logo | Link para https://socio.cruzeiro.com.br/ |
| Redes sociais | Facebook, Instagram, X (Twitter), TikTok, YouTube |
| Telefone / WhatsApp | 31 4000-2161 |
| E-mail | socio5estrelas@cruzeiro.com.br |
| Atendimento | 08h00 às 18h00 — segunda a sexta |
| Copyright | © 2026 — CRUZEIRO ESPORTE CLUBE SAF |
| Links legais | Política de privacidade, Termos de uso e Termo de compra de ingressos |
