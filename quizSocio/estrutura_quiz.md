# Estrutura do Quiz Sócio 5 Estrelas

Decisão vigente sobre valores: [ADR-0001](docs/adr/0001-valores-e-taxas-separados.md).

Documento de apoio do quiz publicado em [`index.html`](index.html). O catálogo comercial tem uma fonte própria, [`catalogo-comercial.md`](catalogo-comercial.md); este documento descreve como perguntas, perfil, ranking e interface usam esses dados.

## 0. Visão geral

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Catálogo, perguntas, validação e ranking | [`quiz-engine.js`](quiz-engine.js) | Funções puras, sem DOM, analytics ou estado global |
| Interface | [`index.html`](index.html) | Renderização, navegação, confirmação de conflitos, analytics e CTAs |
| Fonte comercial | [`catalogo-comercial.md`](catalogo-comercial.md) | Condições oficiais, divergências, pendências e data de consulta |
| Testes | [`tests/`](tests/) | Motor, referência de qualidade e fluxo real de navegador |

Fonte oficial consultada em 26/10/2026: https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso (publicação de 11/09/2026). O motor expõe `CATALOG_VERSION = 2026-09-11` e `RULES_VERSION = 2026-10-26.2` (regras de perfil, custo e ranking).

## 1. Planos — condições confirmadas

A matriz completa, com taxa de adesão, setores, níveis, opcionais e divergências, está em [`catalogo-comercial.md`](catalogo-comercial.md). Resumo usado pelo quiz:

| Plano | Contratação exibida | Ingresso | Prioridade/garantia | Loja | Conteúdo e votação |
|---|---|---|---|---|---|
| Meu Cruzeiro | R$ 12/mês de referência; cobrança semestral ou anual; sem adesão | 1 gratuito por temporada, Amarelo/Laranja, mediante disponibilidade | Prioridade 4 | Até 10% | Sim |
| Time do Povo | R$ 40/mês de referência; cobrança semestral ou anual; adesão R$ 30 | 1 popular pelo menor valor online da arquibancada, Amarelo/Laranja | Prioridade 4 | Até 10% | Sim |
| Cabuloso | R$ 100/mês de referência; cobrança semestral ou anual; adesão R$ 30 | 1 com desconto progressivo de 50% a 60% | Nível 1: prioridade 3; nível 2: 2; nível 3: 1 | Até 15% | Sim |
| Cabuloso Max | R$ 200/mês de referência; cobrança semestral ou anual; adesão R$ 30 | Até 2 com 65% de desconto | Prioridade 1 | Até 15% | Sim |

Regras que a interface deve preservar:

- Prioridade de compra depende de disponibilidade; os quatro planos ativos não prometem ingresso garantido por jogo.
- O Time do Povo não promete ingresso fixo de R$ 40; promete o menor valor online da arquibancada.
- Os quatro demais planos usam R$ X/mês como referência, mas a cobrança vigente na tabela oficial é semestral ou anual; os CTAs usam `intervalo_cobrancas=anual`.
- Campos não confirmados, como desconto em parceiros, não aparecem como benefício.

## 2. Perguntas — 12 respostas

| # | Chave | Tipo | Valores | Uso no perfil |
|---|---|---|---|---|
| 1 | `gamesPerYear` | Range 0–30 | 0 a 30 | Intenção anual de jogos; volume de uso e custo |
| 2 | `gamesHistory` | Range 0–30 ou “não sei” | 0 a 30, `unknown` | Histórico de 15 meses; define nível do Cabuloso |
| 3 | `wantsGuaranteedTicket` | Opção | `never`, `true`, `false` | Presença declarada; detecta conflito com jogos |
| 4 | `buysTwoTickets` | Opção | `true`, `false` | Necessidade de acompanhante adulto |
| 5 | `kidsCount` | Opção | 0 (Não), 1 (Sim) | Interesse em incluir uma criança no plano |
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
| `kids` | 0 ou 1 conforme o interesse declarado; não estima a quantidade total de crianças da família |
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

## 5. Valores comerciais separados

A [ADR-0001](docs/adr/0001-valores-e-taxas-separados.md) substitui a estimativa de gasto combinado. `getPlanPricing(plano)` retorna apenas `subscription` (assinatura mensal equivalente), `adhesion` (adesão única) e `kidsUnitPrice` (opcional por criança). Quantidade de jogos, acompanhantes e Kids não são somadas ao valor da assinatura.

- **Assinatura:** valor de referência, modalidade, parcelas e total do próprio contrato conforme catálogo.
- **Adesão:** campo separado no resultado principal, cards e comparação; planos isentos informam a ausência da taxa.
- **Kids:** valor por criança, em benefício/opcional separado, com elegibilidade e condições.
- **Ingresso:** benefício e eventual exemplo unitário. Exemplo do Max: ingresso de R$ 150 com 65% de desconto custa R$ 52,50; a quantidade de ingressos não forma um novo preço de assinatura.

O motor e a interface não produzem custo de uso mensal, subtotal de ingressos ou total do primeiro mês. Não há premissa de ingresso popular fixo a R$ 40. R$ 150 serve apenas como base identificada do exemplo de desconto, sem previsão mensal. Kids depende de aprovação e segue o item 12.2 do Termo de Uso.

Valores apresentados são formatados em reais com centavos. O índice de afinidade é arredondado a uma casa decimal. Para o Max, a interface mantém R$ 200/mês de referência, adesão única de R$ 30 e Kids opcional de R$ 30/mês por criança em campos distintos.

## 6. Ranking — média ponderada transparente

Cada plano recebe sete componentes normalizados entre 0 e 1:

| Componente | Valor |
|---|---|
| `ticket` | Tipo de ingresso: gratuito 0,45; popular 0,75; garantido 1; desconto 0,80 (utilidade do tipo de benefício; percentual exibido no ingresso); sem benefício 0,10. Multiplicado por 1 (setor completo), 0,75 (parcial), 0,10 (fora do setor) ou 1 (sem preferência). +0,08 se leva acompanhante e o plano oferece 2 ingressos |
| `priority` | Garantido → 1; caso contrário (`5 − prioridade`) / 4, limitado a 0–1 |
| `sector` | Preferência completa → 1; parcial → 0,6; fora → 0; sem preferência → 0,7 |
| `discount` | Percentual da loja / 0,15, limitado a 1 |
| `experiences` | Conteúdo e votação → 1; apenas um → 0,7; nenhum → 0,1 |
| `family` | Sem acompanhantes nem Kids → 0,6. Com família: 0,6 × cobertura de ingressos + 0,4 × suporte a Kids |
| `price` | Normalização do valor mensal equivalente da assinatura entre o menor e o maior dos quatro planos ativos |

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

### Papéis do preço e revisão histórica de duplicações (QUIZ-010)

Os índices e métricas citados nesta subseção descrevem a revisão anterior de cinco planos. A avaliação vigente de quatro planos preserva expectativas e registra as mudanças separadamente; consulte a [spec](docs/spec-port-vue.md) e o [avaliador](scripts/evaluate-reference.mjs).

- **Elegibilidade:** a assinatura mensal equivalente precisa caber no teto. É restrição, com tolerância zero.
- **Preço:** o componente `price` compara apenas a assinatura mensal equivalente. Taxa de adesão, Kids e ingressos são campos separados e não compõem um total para o ranking, conforme a ADR-0001.
- **Desconto de ingresso:** percentual e exemplo unitário permanecem no benefício. A escala de utilidade do tipo de ingresso continua em 0,80 para desconto; nenhum custo mensal de ingressos é calculado.
- **Setor:** tem dois papéis distintos e mantidos. O multiplicador do `ticket` mede onde o benefício vale; o componente `sector` mede a preferência atendida. Sem o componente `sector`, a calibração cai para 11/12 (CAL-10). O peso do setor passou a escalar com a presença: antes, com zero jogos, a cobertura de um ingresso que não seria usado decidia o ranking (CAL-01: Cabuloso 93,1, Max 86,9, Meu Cruzeiro 66,6). Agora: Cabuloso 91,2, Meu Cruzeiro 85,2, Max 83,2; calibração mantida em 12/12.
- **Consumo:** `descuentos` pesa apenas a loja. `productos` existe no perfil, mas não entra no ranking.
- **Frequência:** pesa ingresso e prioridade, que são benefícios diferentes; não pesa loja nem conteúdo.
- **Bônus de setor:** o bônus manual de 6 pontos do commit `2cecf81` foi substituído pela cobertura explícita de setores do catálogo.

### Exemplo verificado com quatro planos (`tests/engine.test.js`)

Entrada: 10 jogos por ano, histórico 10 (Cabuloso nível 2, 55%), foco nos jogos decisivos, sozinho, sem Kids, compra com calma, interesse em experiências, raramente compra produtos, acompanha mais de casa, sem conteúdo digital, teto R$ 100, Sicoob.

| Plano | Assinatura/mês de referência | Adesão única separada | Setor | Índice | Elegível |
|---|---|---|---|---|---|
| Cabuloso | R$ 100 | R$ 30 | Completo | 78,3 | Sim — vencedor |
| Cabuloso Max | R$ 200 | R$ 30 | Completo | 59,4 | Não (R$ 200 > R$ 100) |
| Meu Cruzeiro | R$ 12 | Sem taxa | Fora | 72,3 | Sim |
| Time do Povo | R$ 40 | R$ 30 | Fora | 67,0 | Sim |

## 7. Filtro, setor e desempate

- **Orçamento:** planos com assinatura acima do teto ficam fora da recomendação. Se nenhum couber, não há vencedor; os planos aparecem para comparação e o CTA é desativado.
- **Setor:** a preferência é flexível. O vencedor pode não cobrir todo o setor, mas o resultado destaca a diferença e, se houver, oferece uma alternativa que cobre o setor dentro do orçamento.
- **Empate:** diferença menor que 1 ponto no índice marca os dois primeiros como recomendados.
- **Ordem determinística:** maior índice; em empate, menor assinatura; depois, slug do plano. A ordem do catálogo não influencia (`recommendPlans(respostas, catalogo)` recebe o catálogo explicitamente).
- **Motivos:** o resultado lista avisos de setor, motivos positivos ligados às respostas e o valor da assinatura. Nenhum motivo é inventado para justificar o vencedor.

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
[LOGO]  R$ XX / mês
Valor mensal de referência para comparação e orçamento
Adesão e opcionais em campos separados
Aviso de setor e alternativa, quando aplicável
Motivos da recomendação
[Sobre a recomendação]
[Refazer quiz]  [Comparar planos]  [Assinar agora]
```

Os cards laterais mostram até três opções ordenadas pela afinidade, com indicação de “Acima do orçamento” quando aplicável. O comparativo abre em modal, lista os quatro planos ativos, mostra contratação, preço da assinatura, adesão separada, ingresso e setores, prioridade/garantia, loja, conteúdo/votação, Kids e afinidade. Fecha pelo botão, pelo fundo ou por `Escape`.

Resultado, cards e comparativo exibem apenas a referência mensal, sem total anual ou parcelamento. Os dados comerciais completos e a modalidade real de checkout continuam no catálogo. A pergunta binária não altera o limite comercial do opcional Kids nem soma seu preço à assinatura.

### Consistência visual e textual

A revisão de 26/10/2026 cobre abertura, perguntas, confirmação de respostas, resultado e comparação. Superfícies claras usam texto escuro; o resultado e o comparativo usam cores de texto próprias para o fundo escuro. O carregamento de Outfit é feito por stylesheet, compartilhado pelo cabeçalho e pelo quiz.

As ações do quiz usam botões de mesma altura e sem a margem do botão de abertura. No celular ficam empilhadas, com espaçamento consistente. A confirmação mostra “Confira suas respostas”, descreve as escolhas em linguagem direta e oferece “Revisar respostas” ou “Manter e ver resultado”, sem expor regras internas do perfil.

O menu móvel é um botão acessível por teclado, informa se está aberto e fecha com Escape. A tabela comparativa preserva textos completos e colunas legíveis por rolagem horizontal; rótulos e CTAs não são comprimidos para caber todos na tela. Afinidades e diferenças são formatadas em pt-BR na apresentação; analytics preserva números. Os valores da ADR-0001 permanecem separados.

A abertura e os CTAs de campanha recuperam a linguagem original do quiz. Perguntas novas mantêm sua finalidade, com apoio voltado a como responder: o histórico orienta a usar a opção desconhecida, sem explicar padrões internos de nível. A confirmação corrigida permanece. A explicação secundária do resultado chama-se “Sobre a recomendação”, apresenta o resultado como sugestão e preserva as condições comerciais sem mostrar versão de catálogo.

Capturas e verificação: [evidências da interface](tickets/evidencias/interface/README.md).

## 9. Analytics

Eventos enviados ao GA4 somente fora do modo preview:

| Evento | Campos principais |
|---|---|
| `quiz_start` | — |
| `quiz_answer` | `quiz_step`, `quiz_question`, `quiz_answer`, `quiz_answer_label`, `answer_time_sec` |
| `quiz_complete` | `recommended_plan`, `affinity_index`, `compatibility` (legado), `score_semantics`, `no_eligible_plan`, `catalog_version`, `rules_version`, `total_time_sec` e `answer_*` |
| `quiz_subscribe_click` | `plan`, `recommended_plan`, `clicked_recommended`, `cta_location` |

`compatibility` é mantido como alias do índice para não quebrar consumidores existentes; `score_semantics = indice_afinidade_estimado` documenta a mudança de leitura. `rules_version` identifica a versão das regras do recomendador usadas na execução (`RULES_VERSION` do motor). O modo preview (`?preview`, `?preview=1`, `?preview=false` e `#preview`) renderiza um cenário fixo e não envia eventos. Outros parâmetros cujo valor contenha "preview" (como `?utm_campaign=preview_newsletter`) abrem o quiz normalmente.

Isolamento da coleta (duas camadas distintas):

1. **Supressão de eventos personalizados**: `trackEvent()` só despacha quando `window.coletaHabilitada` é verdadeira — cobre preview e desenvolvimento local. Isso sozinho não impede `page_view`, cookies e beacons da tag.
2. **Isolamento completo da tag**: a tag `gtag.js` e o comando `config` só são injetados quando `window.coletaHabilitada` é verdadeira; fora disso não há `<script>`, fila de comandos, `page_view` nem cookies novos da coleta.

`window.coletaHabilitada` é decidida no `<head>`, antes de qualquer inicialização de analytics: verdadeira somente para hosts da lista explícita `AMBIENTES_HABILITADOS` (hoje, `quiz-socio.vercel.app` — a confirmação do domínio publicado permanece no QUIZ-018) e quando não há sinal de preview. Qualquer outro host — inclusive `localhost`, loopback IPv4/IPv6 (`127.0.0.0/8`, `::1`) e `file://` — fica fora da coleta; a lista é inclusiva por construção: um host novo só coleta quando acrescido explicitamente. O script de visitas da Vercel (`/_vercel/insights/`) não é coleta GA4 e está fora do escopo do isolamento; os testes o filtram explicitamente.

O evento `quiz_subscribe_click` é emitido no clique do link de contratação, que usa o comportamento nativo do `<a>` (nova aba, `rel="noopener noreferrer"`), em qualquer um dos três locais (`resultado`, `lista`, `comparativo`); sem plano elegível, o link não tem `href`, não navega e não emite evento. A verificação permanente desses comportamentos está em `tests/browser.test.js` (`npm run test:browser`), com interceptação de requisições antes da transmissão (CDP): nenhuma coleta de teste sai do navegador.

## 10. Verificação

| Comando | Cobertura |
|---|---|
| `npm test` | Motor, referência e navegador |
| `npm run test:unit` | Catálogo, validação, níveis, custos, setores, ranking e metas |
| `npm run test:browser` | Navegação, conflitos, resultado único, modal, analytics, mobile e desktop |
| `npm run baseline` | Regenera `tests/fixtures/baseline-reference.json` executando o ranking do commit `2cecf81` sobre a referência. Depende do histórico git; fora de `npm test` |

Metas do QUIZ-009: zero violação de orçamento de assinatura, pelo menos 80% de acerto no primeiro plano e 95% de opção aceitável entre as três primeiras. A referência contém 12 cenários de calibração, 12 na partição histórica chamada reserva e 5 de contradição. Com a ADR-0001, calibração: 12/12 no top-1; reserva histórica: 11/12 no top-1 e 12/12 no top-3. A mudança foi registrada sem alterar os planos aceitáveis em `tests/fixtures/separate-prices-results.json`.

Esses resultados são regressão sintética; a base histórica já foi consultada e não comprova avaliação externa ou desempenho real. Sua proveniência continua registrada. Em 27/10/2026, o usuário autorizou criar a referência do QUIZ-009: `tests/fixtures/reference-profiles.js` contém oito perfis e 16 cenários, com hash e limites em `reference-profiles-provenance.json`. O [QUIZ-010-A](tickets/concluidos/010-A-referencia.md) avaliou calibração e validação, ambas com top-1/top-3 8/8 e zero violações, sem modificar motor ou expectativas. `tests/evaluation.test.mjs` mantém essas verificações e a divergência histórica RES-11. QUIZ-003, 009, 010-A/010 e 011 estão concluídos; o aceite de GA4 continua no QUIZ-017. Relatórios anteriores à ADR permanecem históricos.

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
