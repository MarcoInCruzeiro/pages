# Estrutura Completa — Quiz Sócio 5 Estrelas

> Documento de apoio para reunião — mapeamento de todos os textos, campos, perguntas, dados e lógicas do quiz.

---

## 0. Escala de Pontuação

Todas as perguntas e planos usam **escala 0-20** para os atributos de perfil.

---

## 1. PLANOS — Dados completos dos 5 planos

### 1.1. Meu Cruzeiro — R$ 12/mês

| Campo | Valor |
|---|---|
| **Preço anual** | R$ 144 |
| **Ingresso grátis** | Sim (1 por temporada) |
| **Carteirinha digital** | Sim |
| **Taxa de adesão** | Não |
| **Desconto loja** | Até 10% |
| **Conteúdo exclusivo** | Sim |
| **Participação em quizzes** | Sim |
| **Votação em decisões** | Sim |
| **Complementos disponíveis** | Kids, Carteirinha Física |
| **Benefícios** | Ingresso grátis por temporada · Carteirinha digital · Até 10% na Loja · Participação em quizzes |

### 1.2. Time do Povo — R$ 40/mês

| Campo | Valor |
|---|---|
| **Preço anual** | R$ 480 |
| **Ingresso grátis** | Não |
| **Carteirinha digital** | Sim |
| **Taxa de adesão** | R$ 30 única |
| **Desconto ingresso** | Todo jogo nos setores Amarelo e Laranja custa R$ 40,00 |
| **Desconto loja** | Até 15% |
| **Conteúdo exclusivo** | Não |
| **Participação em quizzes** | Sim |
| **Votação em decisões** | Não |
| **Complementos disponíveis** | Kids, Carteirinha Física |
| **Benefícios** | Carteirinha digital · Ingresso a R$ 40 nos setores Amarelo e Laranja · Até 15% na Loja · Participação em quizzes |

### 1.3. Cabuloso — R$ 100/mês

| Campo | Valor |
|---|---|
| **Preço anual** | R$ 1.200 |
| **Ingresso grátis** | Não |
| **Carteirinha digital** | Sim |
| **Taxa de adesão** | R$ 30 única |
| **Desconto ingresso** | Desconto progressivo conforme frequência nos últimos 15 meses |
| **Níveis de desconto** | Nível 1 (0-9 jogos): 50% · Nível 2 (10-19 jogos): 55% · Nível 3 (20+ jogos): 60% |
| **Prioridade na compra** | Sim (varia por nível) |
| **Desconto loja** | Até 15% |
| **Conteúdo exclusivo** | Sim |
| **Participação em quizzes** | Sim |
| **Votação em decisões** | Sim |
| **Complementos disponíveis** | Kids, Carteirinha Física |
| **Benefícios** | Carteirinha digital · Desconto progressivo (50% a 60%) · Até 15% na Loja · Participação em quizzes |

### 1.4. Cabuloso Max — R$ 200/mês

| Campo | Valor |
|---|---|
| **Preço anual** | R$ 2.400 |
| **Ingresso grátis** | Não |
| **Carteirinha digital** | Sim |
| **Taxa de adesão** | R$ 30 única |
| **Desconto ingresso** | Até 2 ingressos por jogo com 65% de desconto |
| **Prioridade na compra** | Prioridade máxima (nível 1) |
| **Desconto loja** | Até 15% |
| **Conteúdo exclusivo** | Sim |
| **Participação em quizzes** | Sim |
| **Votação em decisões** | Sim |
| **Complementos disponíveis** | Kids, Carteirinha Física |
| **Benefícios** | Carteirinha digital · 2 ingressos com 65% off · Até 15% na Loja · Participação em quizzes |

### 1.5. Cabuloso Cativo — R$ 400/mês

| Campo | Valor |
|---|---|
| **Preço anual** | R$ 4.800 |
| **Ingresso grátis** | Não |
| **Carteirinha digital** | Sim |
| **Taxa de adesão** | Não |
| **Desconto ingresso** | 1 ingresso garantido no Azul Inferior |
| **Prioridade na compra** | Prioridade máxima (assento cativo) |
| **Desconto loja** | Até 10% |
| **Conteúdo exclusivo** | Sim |
| **Participação em quizzes** | Sim |
| **Votação em decisões** | Sim |
| **Complementos disponíveis** | Kids |
| **Benefícios** | Carteirinha digital · 1 ingresso garantido no Azul Inferior · Até 10% na Loja · Participação em quizzes |

---

## 2. QUIZ — 11 Perguntas com opções e lógica de pontuação

> Cada pergunta mapeia uma resposta a **efeitos numéricos** em atributos do perfil do usuário. Escala 0-20.

### Q1 — `gamesPerYear` (Range)

**Pergunta:** Em média, a quantos jogos do Cruzeiro você pretende ir por ano?

| Tipo | Min | Max | Rótulo |
|---|---|---|---|
| Range | 0 | 30 | Frequência estimada |

**Efeitos base (sempre aplicados):**
- `frequenciaEstadio = Math.round(val/30 * 8)` → Normaliza 0-30 para escala 0-8
- `prioridadeIngressos` = 0 se 0 jogos; 2 se 1-4 jogos; 5 se 5-14 jogos; 8 se 15+ jogos

**Efeito condicional (val > 10):**
- `interesseExperiencias: +3`
- `consumoProdutosOficiais: +2`
- `prioridadeIngressos: +2` (adicional)

Isso direciona torcedores frequentes (>10 jogos/ano) para planos como Time do Povo ou superiores.

### Q2 — `wantsGuaranteedTicket`

**Pergunta:** O que melhor te define como torcedor?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Não frequento o estádio** | Não costumo frequentar os jogos presencialmente. | `importanciaPreco: +5`, `prioridadeIngressos: 0`, `frequenciaEstadio: 0` |
| **Faço questão de ir a todos os jogos** | Quero garantir meu lugar na arquibancada em todas as partidas possíveis. | `prioridadeIngressos: +5`, `frequenciaEstadio: +4`, `importanciaPreco: +2` |
| **Foco nos jogos mais decisivos** | Prefiro guardar energia e orçamento para clássicos e fases finais. | `importanciaPreco: +5`, `prioridadeIngressos: +3` |

### Q3 — `buysTwoTickets`

**Pergunta:** Quando vai ao estádio, você costuma levar acompanhantes?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Sim, quase sempre vou acompanhado** | Preciso de facilidade para comprar dois ou mais ingressos juntos. | `levaAcompanhantes: +8`, `interesseDescontos: +5` |
| **Não, geralmente vou sozinho** | Compro apenas o meu ingresso. | `levaAcompanhantes: 0` |

### Q4 — `needsPriority`

**Pergunta:** Quando vai comprar ingressos para o jogo, como costuma agir?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Compro no primeiro minuto** | Não gosto de correr riscos. Assim que abre, eu garanto o meu. | `prioridadeIngressos: +5` |
| **Compro com calma** | Deixo para comprar depois, se ainda houver disponibilidade. | `prioridadeIngressos: 0` |

### Q5 — `wantsParticipation`

**Pergunta:** Além dos jogos, o quanto você se interessa por experiências exclusivas?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Tenho muito interesse** | Quero participar de sorteios, eventos do clube e receber ofertas especiais. | `interesseExperiencias: +6` |
| **Não faço questão** | Meu foco é apenas assistir aos jogos, sem extras. | `interesseExperiencias: 0` |

### Q6 — `wantsStoreDiscount`

**Pergunta:** Sempre que sai um novo manto ou produto oficial, o que você faz?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Sempre tento comprar** | Gosto de colecionar ou renovar minhas camisas e busco descontos para isso. | `interesseDescontos: +7`, `consumoProdutosOficiais: +6` |
| **Raramente compro** | Não costumo consumir muitos produtos na loja oficial. | `interesseDescontos: 0`, `consumoProdutosOficiais: 0` |

### Q7 — `gameFrequency`

**Pergunta:** Como você costuma viver a paixão nos dias de jogo?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Sempre na arquibancada** | O Mineirão é minha segunda casa. | `frequenciaEstadio: +4`, `interesseExperiencias: +3` |
| **Fico dividido entre estádio e TV** | Vou em boa parte, mas assisto outros de casa ou do bar. | `frequenciaEstadio: +2`, `interesseExperiencias: +2` |
| **Acompanho mais de casa mesmo** | Vou pouco ao estádio, prefiro transmissões. | `frequenciaEstadio: +1`, `interesseExperiencias: +1` |

### Q8 — `familyPlan`

**Pergunta:** Você planeja incluir dependentes (filhos ou cônjuge) no seu plano?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Sim, quero um plano familiar** | Preciso de benefícios estendidos para a minha família. | `levaAcompanhantes: +7`, `importanciaPreco: +3` |
| **Não, o plano será individual** | Os benefícios serão utilizados apenas por mim. | `levaAcompanhantes: 0` |

### Q9 — `digitalExperience`

**Pergunta:** O quanto você consome os conteúdos digitais e de bastidores do clube?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Acompanho tudo diariamente** | Valorizo o app oficial e quero informações em primeira mão. | `interesseExperiencias: +4`, `consumoProdutosOficiais: +3` |
| **Foco apenas no campo** | Meu interesse principal são os 90 minutos de bola rolando. | `interesseExperiencias: +2`, `frequenciaEstadio: +4` |

### Q10 — `budget`

**Pergunta:** Qual é o seu orçamento mensal confortável para investir no Sócio?

| Opção | Descrição | Efeitos |
|---|---|---|
| **Até R$ 40/mês** | Busco a opção com o melhor custo-benefício inicial. | `importanciaPreco: +4` |
| **Até R$ 100/mês** | Quero os beneficios dos planos intermediários com mais vantagens. | `importanciaPreco: +2` |
| **Até R$ 200/mês** | Tenho flexibilidade para investir em planos melhores com mais vantagens. | `importanciaPreco: +1` |
| **Sem limite definido** | Quero o plano mais completo, independente do valor. | `importanciaPreco: 0` |

### Q11 (NOVA) — `preferredSector`

**Pergunta:** Em qual setor você se sente mais à vontade?

| Opção | Descrição | Plano mais adequado | Efeitos |
|---|---|---|---|
| **Setor Amarelo ou Laranja** | Torcida organizada, muito canto e festa. Melhor custo-benefício. | Time do Povo | `importanciaPreco: +6` |
| **Setor Azul** | Visão central do campo, equilíbrio entre custo e conforto. | Cabuloso | `importanciaPreco: +2`, `interesseExperiencias: +2`, `consumoProdutosOficiais: +2` |
| **Setor Roxo** | Cadeira premium, conforto máximo e experiência exclusiva. | Cabuloso Max / Cativo | `interesseExperiencias: +4`, `consumoProdutosOficiais: +4` |

---

## 3. ATRIBUTOS DE PERFIL — Chaves e rótulos

| Chave | Rótulo exibido ao usuário | Max contribuição |
|---|---|---|
| `importanciaPreco` | Maior economia e custo-benefício | 20 |
| `frequenciaEstadio` | Facilidade em frequentar o estádio | 20 |
| `interesseDescontos` | Mais promoções e descontos | 14 |
| `interesseExperiencias` | Mais experiências | 20 |
| `levaAcompanhantes` | Levar companhia (família e amigos) | 18 |
| `prioridadeIngressos` | Maior prioridade em ingressos | 20 |
| `consumoProdutosOficiais` | Facilidade em consumir produtos oficiais | 16 |

---

## 4. PERFIS DOS PLANOS (escala 0-20)

| Atributo | Meu Cruzeiro | Time do Povo | Cabuloso | Cabuloso Max | Cabuloso Cativo |
|---|---|---|---|---|---|
| `importanciaPreco` | 20 | 19 | 15 | 10 | 0 |
| `frequenciaEstadio` | 2 | 6 | 10 | 16 | 20 |
| `interesseDescontos` | 4 | 14 | 18 | 19 | 12 |
| `interesseExperiencias` | 18 | 5 | 18 | 20 | 20 |
| `levaAcompanhantes` | 1 | 3 | 5 | 16 | 8 |
| `prioridadeIngressos` | 2 | 6 | 10 | 16 | 20 |
| `consumoProdutosOficiais` | 12 | 18 | 18 | 18 | 12 |

Hierarquia: Meu Cruzeiro < Time do Povo < Cabuloso < Cabuloso Max < Cabuloso Cativo

---

## 5. LÓGICA DE RECOMENDAÇÃO — Algoritmo

O quiz usa **Similaridade do Cosseno** entre dois vetores de 7 dimensões:

1. **Perfil do usuário** → construído somando os efeitos de cada resposta (normalizado 0-20 por atributo)
2. **Perfil de cada plano** → gerado dinamicamente a partir das características reais do plano

### Penalidade de preço

Após o cálculo do cosseno, aplica-se um ajuste:
- `penalty = 1 - (userSensitivity * priceRatio * 0.25)`
- `userSensitivity = importanciaPreco / 20`
- `priceRatio = planPrice / maxPrice`
- Score final = `cosineScore * Math.max(0.75, penalty)`
- Máxima penalidade: 25%

### Filtro por orçamento

Planos com preço mensal acima do `budget` informado são excluídos. Se nenhum couber, o mais barato é usado como fallback.

### Resultado final

Top 3 planos mais compatíveis são exibidos, ordenados do maior para o menor percentual de compatibilidade.

---

## 6. SEÇÕES DINÂMICAS — Templates HTML

### Quiz Section

```
[████████████████]  (progress bar)
Pergunta X de 11
  Título da pergunta
  [Opção 1]
  [Opção 2]
  [Voltar]  [Continuar / Ver resultado]
```

### Results Section

```
┌────────────────────────────────┐
│  Plano recomendado             │
│                                │
│  [LOGO]                        │
│  R$ XX / mês                   │
│                                │
│  "Este plano tem XX% de        │
│   compatibilidade com seu      │
│   perfil e oferece os          │
│   benefícios mais adequados."  │
│                                │
│  • Benefício 1                 │
│  • Benefício 2                 │
│  • Benefício 3                 │
│                                │
│  [Refazer quiz]  [Assinar agora]│
└────────────────────────────────┘
┌────────────────────────────────┐
│  Melhores opções               │
│  Recomendações personalizadas  │
│                                │
│  ┌─────────────────────────┐   │
│  │ Recomendado / Alternativo│   │
│  │ [LOGO]                   │   │
│  │ R$ XX / mês              │   │
│  │ R$ XXX / ano             │   │
│  │ Taxa única: R$ XX        │   │
│  │ Vantagens:               │   │
│  │ • Item                    │   │
│  │ XX%                      │   │
│  │ [Assinar agora]           │   │
│  └─────────────────────────┘   │
└────────────────────────────────┘
```

---

## 7. FOOTER — Rodapé

| Seção | Conteúdo |
|---|---|
| **Logo** | Link para `https://socio.cruzeiro.com.br/` |
| **Redes sociais** | Facebook, Instagram, X (Twitter), TikTok, YouTube |
| **Telefone / WhatsApp** | 31 4000-2161 |
| **E-mail** | socio5estrelas@cruzeiro.com.br |
| **Horário de atendimento** | 08h00 às 18h00 — Segunda a Sexta |
| **Copyright** | © 2026 — CRUZEIRO ESPORTE CLUBE SAF |
| **Links legais** | Política de privacidade \| Termos de uso \| Termo de compra de ingressos |
