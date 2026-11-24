# Card principal e textos dinâmicos

Os textos abaixo cobrem o card de resultado, seus avisos e as condições que alteram a copy. As chaves indicam valores inseridos pela aplicação.

## Selos

- Plano recomendado
- Nenhum plano no orçamento

## Preço, referência e adesão

Usam os mesmos preços e taxas dos cards de cada plano, listados em `01-cards-recomendacao.md`.

## Resumos da recomendação

### Maior afinidade, com todos os planos no orçamento

Afinidade estimada de {pontuação} de 100: a maior entre todos os planos.

### Maior afinidade, com parte dos planos no orçamento

Afinidade estimada de {pontuação} de 100: a maior entre os planos que cabem no seu orçamento.

### Resultados próximos

Afinidade estimada de {pontuação} de 100. O {segundo plano} ficou perto ({pontuação do segundo plano} de 100). Compare os benefícios antes de escolher.

### Nenhum plano no orçamento

Nenhuma assinatura cabe nos seus {orçamento}/mês. A mais em conta é {plano mais barato}, por {preço}/mês. Compare abaixo ou refaça o quiz para ajustar o orçamento.

## Avisos de setor

Atenção ao setor: {texto da cobertura do setor}

Alternativa disponível:

Ver o plano que cobre esse setor: {plano alternativo} (afinidade {pontuação} de 100)

Quando não há alternativa no orçamento:

Nenhum plano dentro do seu orçamento inclui esse setor. Se ele for decisivo, vale revisar o orçamento.

Os textos exatos de cobertura ausente ou parcial, por plano, estão em `01-cards-recomendacao.md`.

## Motivos da recomendação

A aplicação seleciona até cinco motivos conforme o perfil. Estes são os modelos ativos:

### Setor sem cobertura

Seu setor preferido é {setor preferido}. O benefício de ingresso vale para {setores cobertos}.

### Setor com cobertura parcial

Cobertura parcial do seu setor: {texto da cobertura parcial}

### Frequência de jogos

Para {quantidade} jogo por ano: {benefício de ingresso}.

Para {quantidade} jogos por ano: {benefício de ingresso}.

O benefício usa o mesmo texto dos cards: ingresso gratuito por temporada, ingresso popular por jogo ou desconto calculado por nível. A aplicação adapta a inicial e a pontuação final.

### Sem intenção de ir ao estádio

Como você não pretende ir ao estádio, o ingresso teve pouco peso na escolha.

### Prioridade de compra

Para comprar ingressos: prioridade {prioridade} (1 é a mais alta).

### Desconto em produtos oficiais

Economize até 10% em produtos e serviços oficiais.

Economize até 15% em produtos e serviços oficiais.

### Conteúdo e participação

Participe de quiz e votações online e acesse conteúdo exclusivo do clube.

### Acompanhante — dois ingressos

Para ir com companhia: benefício em até 2 ingressos, para você e seu acompanhante.

### Acompanhante — um ingresso

Para ir com companhia: benefício em 1 ingresso; acompanhante paga à parte.

Se houver interesse em Kids, o motivo de companhia recebe este complemento:

Kids opcional: R$ 30,00/mês por criança.

### Assinatura com adesão

Assinatura: {preço}/mês (referência). Taxa de adesão e opcionais à parte.

### Assinatura sem adesão

Assinatura: {preço}/mês (referência). Sem taxa de adesão; opcionais à parte.

## Sobre a recomendação

Sobre a recomendação

Cruzamos suas respostas com os benefícios de cada plano para chegar a esta sugestão. Ela é um ponto de partida: vale comparar as opções antes de assinar.

O orçamento limita quais assinaturas podemos recomendar. Entre elas, a ordem considera os benefícios e suas respostas; o menor preço não aumenta a afinidade. Taxa de adesão, opcionais e ingressos ficam separados.

Os exemplos de desconto consideram R$ 150 por ingresso de referência; o preço real muda conforme o jogo e o setor. Kids depende de aprovação: ingresso da criança sem custo adicional no setor do titular, mediante disponibilidade e aquisição do ingresso do titular.

Disponibilidade e condições de cada benefício estão no site do Sócio 5 Estrelas.

## Botões e acessibilidade

- Refazer quiz
- Comparar planos
- Botão principal: o CTA do plano recomendado (ver `01-cards-recomendacao.md`).
- Sem plano elegível: Sem plano no orçamento.
- Nome acessível do botão de contratação: Assinar agora o plano {plano}.
- Nome acessível quando indisponível: Sem plano no orçamento para assinar.

## Exemplos completos capturados

Cada exemplo abaixo corresponde às imagens de `imagens/resultados/` e, no Cabuloso por nível, às imagens adicionais de `imagens/cards/`. Valores de afinidade são específicos das respostas sintéticas registradas no JSON.

### meu-cruzeiro

Selo: Plano recomendado

Afinidade estimada de 81,4 de 100. O Time do Povo ficou perto (81,4 de 100). Compare os benefícios antes de escolher.

- Como você não pretende ir ao estádio, o ingresso teve pouco peso na escolha.
- Assinatura: R$ 12,00/mês (referência). Sem taxa de adesão; opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero ser sócio.

### time-do-povo

Selo: Plano recomendado

Afinidade estimada de 78,3 de 100: a maior entre os planos que cabem no seu orçamento.

- Para 10 jogos por ano: 1 ingresso popular por jogo: menor preço online da arquibancada, mediante disponibilidade.
- Assinatura: R$ 40,00/mês (referência). Taxa de adesão e opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero ingresso popular.

### cabuloso

Selo: Plano recomendado

Afinidade estimada de 98,8 de 100. O Cabuloso Max ficou perto (98,8 de 100). Compare os benefícios antes de escolher.

- Economize até 15% em produtos e serviços oficiais.
- Participe de quiz e votações online e acesse conteúdo exclusivo do clube.
- Como você não pretende ir ao estádio, o ingresso teve pouco peso na escolha.
- Assinatura: R$ 100,00/mês (referência). Taxa de adesão e opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero 50% de desconto.

### cabuloso-max

Selo: Plano recomendado

Afinidade estimada de 99,6 de 100: a maior entre todos os planos.

- Para 30 jogos por ano: economize 65% em até 2 ingressos por jogo. Ex.: de R$ 150 por R$ 52,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 200,00/mês (referência). Taxa de adesão e opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero 65% de desconto.

### cabuloso-nivel-2

Selo: Plano recomendado

Afinidade estimada de 92,9 de 100: a maior entre os planos que cabem no seu orçamento.

- Para 15 jogos por ano: economize 55% em 1 ingresso por jogo. Ex.: de R$ 150 por R$ 67,50 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 2 (1 é a mais alta).
- Assinatura: R$ 100,00/mês (referência). Taxa de adesão e opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero 55% de desconto.

### cabuloso-nivel-3

Selo: Plano recomendado

Afinidade estimada de 98,6 de 100: a maior entre os planos que cabem no seu orçamento.

- Para 15 jogos por ano: economize 60% em 1 ingresso por jogo. Ex.: de R$ 150 por R$ 60,00 cada. Mediante disponibilidade.
- Para comprar ingressos: prioridade 1 (1 é a mais alta).
- Assinatura: R$ 100,00/mês (referência). Taxa de adesão e opcionais à parte.

Ações: Refazer quiz; Comparar planos; Quero 60% de desconto.
