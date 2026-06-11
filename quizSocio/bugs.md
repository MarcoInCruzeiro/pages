### Análise de Conflitos - index.html

#### 1. Conflito de Layout (CSS Grid)
O `hero-card` e o `quiz-card` são elementos irmãos dentro da seção `.hero`, que utiliza CSS Grid com duas colunas.
* **Problema:** Durante a transição, o `quiz-card` torna-se visível enquanto o `hero-card` ainda está em fade-out.
* **Resultado:** O `quiz-card` aparece inicialmente na segunda coluna e "pula" para a primeira assim que o `hero-card` recebe a classe `.hidden` (que aplica `position: absolute`), causando um salto visual brusco.

#### 2. Conflito de Fluxo e Validação (UX)
Na função `renderQuestion`, o botão "Continuar" (`nextButton`) é habilitado automaticamente (`disabled = false`).
* **Problema:** Não há validação para verificar se o usuário selecionou uma opção antes de avançar.
* **Resultado:** O usuário pode completar o quiz sem responder às perguntas. Como o sistema de cálculo ignora valores nulos, a recomendação final será baseada em dados incompletos ou zerados.

#### 3. Redundância de Inicialização
A função `renderQuestion()` é executada na linha 1780, imediatamente ao carregar a página.
* **Problema:** O `quiz-card` inicia com a classe `.hidden` (`display: none`).
* **Resultado:** O script processa a renderização da primeira pergunta e manipula o DOM antes mesmo de o usuário clicar em "Iniciar Quiz", gerando processamento desnecessário no carregamento inicial.
