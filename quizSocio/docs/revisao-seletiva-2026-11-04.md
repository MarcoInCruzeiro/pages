# Revisão seletiva de respostas — 04/11/2026

Solicitação: ao escolher “Revisar respostas”, percorrer apenas as respostas incongruentes em relação à maioria, preservando o restante do quiz.

## Comportamento

A maioria considera somente as perguntas relacionadas à presença no estádio: intenção anual de jogos, declaração de presença e frequência. Dois sinais concordantes definem a maioria. “Acompanho mais de casa” é neutro, pois permite ida ocasional ao estádio. Histórico, orçamento e preferências de benefícios não votam sobre presença.

Exemplos:

- Zero jogos, ingresso para todos os jogos e frequência alta: revisar apenas a quantidade de jogos.
- Quinze jogos, declaração de não frequentar e frequência alta: revisar apenas a declaração de presença.
- Zero jogos, declaração de não frequentar e frequência alta: revisar apenas a frequência.
- Zero jogos, ingresso para todos e acompanhamento mais de casa: sem maioria clara; revisar quantidade de jogos e declaração de presença.

A seleção contém apenas perguntas envolvidas nos conflitos detectados pelo motor e segue a ordem original do quiz. Não há alteração automática de resposta. O contador identifica a posição na revisão e a pergunta original; “Voltar” percorre somente a revisão. Se o conflito for resolvido antes do fim, a aplicação apresenta o resultado imediatamente. Se persistir, retorna à confirmação, permitindo revisar novamente ou manter as respostas.

A finalização preserva respostas não editadas e calcula a recomendação com as respostas atuais. Analytics mantém o número original da pergunta, registra a resposta revisada e emite uma única conclusão. Refazer limpa a fila de revisão. As regras do motor, preços e ordenação de planos permanecem com a identidade operacional existente.

## Entrega

Esta alteração é local. O pacote isolado preparado anteriormente em 04/11 não contém a revisão seletiva. Gerar novo build e candidato e repetir a conferência isolada antes da entrega do [QUIZ-018](../tickets/018-alinhamento-publicado-ga4.md). Não houve publicação nem alteração no GA4.

## Validação

- `npm test`: build e 172 testes aprovados, zero falhas ou testes ignorados. Inclui oito casos unitários da seleção e quatro fluxos de revisão no navegador. [Log completo](evidencias/revisao-seletiva-2026-11-04/suite-completa.log).
- Um quinto fluxo foi acrescentado durante a execução da suíte e executado separadamente: revisão da frequência divergente no celular, sem overflow e com confirmação por teclado. Um teste aprovado, zero falhas. Ele também integra `npm test` nas próximas execuções. [Log móvel](evidencias/revisao-seletiva-2026-11-04/revisao-mobile.log).
- `node scripts/check-local-links.mjs`: links locais de 74 documentos resolvidos. `git diff --check`: sem erros.

Os testes cobrem preservação das respostas, número original da pergunta em analytics, conclusão única, navegação restrita, confirmação de conflito persistente, resolução antecipada e reinício. Eventos são capturados localmente; isso não comprova recebimento no GA4.
