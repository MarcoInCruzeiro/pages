# Análise da integração com GA4

Data: 26/10/2026. Escopo: código local, execução em Chrome e leitura HTTP do endereço público indicado no `og:url` do projeto.

## Parecer

**A integração está instalada e os eventos do quiz são gerados localmente, mas a medição de produção ainda precisa de correções e validação dentro do GA4.** Foram confirmados dois defeitos no preview e uma diferença entre a versão pública e a local. A continuidade da identificação até o checkout permanece sem comprovação.

O projeto separa regras e catálogo em [quiz-engine.js](../quiz-engine.js), enquanto a interface e a instrumentação ficam em [index.html](../index.html). Essa separação facilita testar o recomendador sem depender do serviço de analytics.

Esta análise adiciona documentação e evidências; o código da aplicação foi preservado.

## O que foi verificado

| Item | Resultado |
| --- | --- |
| Tag local | Um carregamento explícito de `gtag.js`, configurado com `G-EF75QCTCTV` no início do HTML. |
| Tag no endereço público | O HTML de `https://quiz-socio.vercel.app/` respondeu HTTP 200 e contém o mesmo identificador. |
| Site de sócios | A leitura HTTP de `https://socio.cruzeiro.com.br/` retornou 403. O comentário no código sobre compartilhar a propriedade não foi confirmado no destino. |
| Fluxo local com a biblioteca real | Uma inicialização, 12 respostas aceitas, uma conclusão e dois eventos de clique, correspondentes aos dois CTAs acionados na auditoria. |
| Limites dos parâmetros | O maior evento observado tem 19 parâmetros personalizados; os nomes e valores examinados ficaram dentro dos limites documentados. [Limites do GA4](https://support.google.com/analytics/answer/9267744?hl=en). |
| Suíte de navegador existente | **17 testes passaram**, sem falhas ou testes ignorados. |
| Recebimento na propriedade | Não verificado: os coletores foram bloqueados antes da transmissão e não houve acesso ao painel GA4. |

A biblioteca pública do Google foi baixada por HTTP e executada no navegador local. As tentativas de coleta foram observadas com bloqueio de rede; não houve resposta de analytics nem exceção JavaScript. Esse procedimento confirma a geração de payloads, sem comprovar ingestão, processamento ou atribuição no GA4.

Os testes existentes substituem `gtag` por uma captura local após a navegação e bloqueiam a biblioteca remota. Eles verificam o contrato dos eventos e as proteções contra cliques repetidos; a auditoria complementar examinou também a inicialização original e a biblioteca real.

## Achados em ordem de prioridade

### 1. P1 — O preview inicializa a coleta de produção

**Evidência:** o bloco inicial de [index.html](../index.html) carrega a tag e chama `gtag('config', 'G-EF75QCTCTV')` incondicionalmente. O bloqueio de `trackEvent()` só protege os eventos personalizados. Na auditoria de `?preview`, a biblioteca gerou um `page_view` para esse identificador e criou os cookies `_ga` e `_ga_EF75QCTCTV`; a requisição foi bloqueada antes do envio.

**Impacto:** acessos de demonstração podem entrar nas visitas, sessões e métricas de engajamento da propriedade, mesmo sem `quiz_start` ou `quiz_complete`. A documentação atual de analytics afirma que o preview não envia eventos, mas a proteção é parcial. O GA4 gera pageviews automaticamente na configuração padrão. [Medição de pageviews](https://developers.google.com/analytics/devguides/collection/ga4/views).

**Correção proposta:** decidir o modo de execução antes de carregar/configurar a tag e habilitar a coleta apenas nos ambientes de medição definidos para o produto. Preservar a proteção dos eventos personalizados. Definir apenas `send_page_view: false` suprime o pageview, mas não estabelece, sozinho, isolamento completo do preview.

**Aceite:** `?preview`, `#preview` e os ambientes excluídos não inicializam a coleta da propriedade de produção; o fluxo normal continua gerando os eventos previstos.

### 2. P1 — Qualquer ocorrência de “preview” na query ativa o cenário fictício

**Evidência:** `location.search.includes('preview')` trata `?utm_campaign=preview_newsletter` como preview. O navegador reproduziu a abertura automática do resultado com respostas fictícias e a supressão dos eventos personalizados.

**Impacto:** uma campanha pode entregar o resultado de demonstração em vez do questionário e perder sua medição de funil.

**Correção proposta:** interpretar o parâmetro pelo nome e compartilhar a mesma decisão entre o carregamento da tag e a interface. Exemplo para manter o contrato de `?preview` e `#preview`:

```js
const isPreview = new URLSearchParams(location.search).has('preview')
    || location.hash === '#preview';
```

**Aceite:** os dois modos explícitos continuam abrindo o preview; uma UTM ou outro parâmetro cujo valor contenha “preview” abre o quiz normal e preserva sua instrumentação.

### 3. P1 — A versão pública usa um contrato de analytics anterior

**Evidência:** no endereço público indicado no projeto, `quiz_complete` contém `recommended_plan`, `compatibility`, `total_time_sec` e respostas. O HTML consultado não contém `affinity_index`, `score_semantics`, `catalog_version` ou a importação de `quiz-engine.js`, presentes na versão local. O trecho observado está na [verificação pública](../tickets/evidencias/ga4/verificacao-publica.json).

**Impacto:** os testes locais não descrevem integralmente os dados coletados nesse endereço. Comparar o antigo `compatibility` com a afinidade atual sem distinguir versões mistura significados diferentes.

**Correção proposta:** confirmar qual domínio é o ambiente oficial do quiz e alinhar a versão a publicar com seu contrato de eventos. Registrar a data da mudança de semântica e preservar o alias legado conforme a documentação atual.

**Aceite:** no domínio oficial, conferir o payload da versão publicada e seu recebimento no DebugView. Distinguir os resultados anteriores e posteriores à mudança nos relatórios.

### 4. P2 — A continuidade até o checkout está em risco

**Evidência:** `onSubscribeClick()` abre a contratação por `window.open()` com a URL do catálogo, sem incluir um parâmetro de vinculação. Os CTAs da lista e do comparativo usam links HTML. Não foi possível confirmar a configuração de domínios no Admin nem a preservação da identificação pelo checkout.

**Impacto potencial:** a pessoa que conclui o quiz pode aparecer como outra pessoa ou sessão no site de contratação. UTMs identificam a campanha, mas não substituem a transferência dos identificadores entre domínios. O Google documenta limitações quando a navegação é disparada por JavaScript. [Configuração e diagnóstico entre domínios](https://support.google.com/analytics/answer/10071811?hl=en).

**Correção proposta:** usar um link real também no CTA principal, mantendo a captura de clique; conferir os domínios no Admin e a mesma configuração de medição nas duas pontas.

**Aceite:** clicar em cada origem de CTA, verificar a decoração `_gl` quando aplicável e confirmar a continuidade dos identificadores no destino, inclusive após redirecionamentos. O cenário local exploratório de linker não comprovou essa continuidade.

### 5. P2 — A versão das regras do recomendador não acompanha o resultado

**Evidência:** o motor exporta `RULES_VERSION = '2026-10-26.2'`; `quiz_complete` envia somente `catalog_version = '2026-09-11'` como informação de versão.

**Impacto:** mudanças de cálculo com o mesmo catálogo não podem ser separadas de forma confiável pelo payload atual do evento.

**Correção proposta:** importar `RULES_VERSION` e acrescentar `rules_version` à conclusão. Se a análise precisar relacionar diretamente início, respostas e cliques a uma execução, definir também um identificador de tentativa com escopo explícito.

**Aceite:** o evento contém a versão retornada pelo motor e os relatórios conseguem segmentar conclusões por versão das regras.

## Eventos e significado atual

| Evento | Quando ocorre | Como interpretar |
| --- | --- | --- |
| `quiz_start` | Ao iniciar, inclusive depois de refazer. | Inícios de tentativa; uma pessoa pode gerar vários. |
| `quiz_answer` | Ao aceitar uma resposta e avançar. | Respostas aceitas, incluindo reenvios após voltar; contar eventos não equivale a contar perguntas únicas. |
| `quiz_complete` | Ao renderizar o resultado após a validação. | Conclusões do quiz; afinidade representa o índice do modelo. |
| `quiz_subscribe_click` | Ao clicar no CTA do resultado, lista ou comparativo. | Intenção de contratar; não comprova compra ou assinatura concluída. |

A instrumentação preserva valores numéricos para afinidade e tempos, identifica a origem do CTA e mantém `compatibility` como alias. As respostas examinadas são opções e valores estruturados; os eventos personalizados não incluem campos de nome, e-mail ou telefone.

Para medir contratação efetiva, é necessário validar a instrumentação do checkout e o evento que comprova a conclusão no destino. O quiz sozinho não fornece essa confirmação.

## Pendências de configuração e política

Estas pendências não foram classificadas como defeitos confirmados da propriedade, pois seu painel não foi acessado.

- **Dimensões e métricas:** conferir o registro dos parâmetros necessários aos relatórios, como plano recomendado, pergunta, origem do CTA, afinidade, tempos e versões. O envio do parâmetro não basta para disponibilizá-lo nas explorações e relatórios. [Parâmetros personalizados](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters).
- **Eventos principais:** conferir quais ações foram marcadas no Admin. Separar conclusão do quiz, clique para contratar e contratação efetiva conforme o objetivo de negócio.
- **Depuração e filtros:** validar no DebugView usando Tag Assistant ou configuração de depuração controlada; conferir filtros de tráfego interno e de desenvolvedor antes de interpretar resultados. O preview do quiz é um cenário fictício, distinto do modo de depuração do GA4. [DebugView](https://support.google.com/analytics/answer/7201382?hl=en).
- **Preferências de coleta:** o código desativa Google Signals, mas não implementa comandos de consentimento ou uma escolha de coleta. Esse parâmetro controla recursos publicitários; não desativa o analytics nem a criação dos cookies observados. Se o produto exigir uma escolha prévia, conectar essa decisão ao carregamento e aos comandos da tag. [Controles de privacidade](https://developers.google.com/tag-platform/security/guides/privacy), [Consent Mode](https://developers.google.com/tag-platform/security/guides/consent).

## Evidências e limites

- [Suíte de navegador: 17/17](../tickets/evidencias/ga4/testes-navegador.tap), executada com `npm run test:browser`.
- [Auditoria local](../tickets/evidencias/ga4/auditoria-local.json): comandos, parâmetros, tentativas de coleta bloqueadas, hashes dos arquivos examinados e limitações do experimento.
- [Verificação pública](../tickets/evidencias/ga4/verificacao-publica.json): status HTTP, identificador e trecho do contrato publicado, sem executar os scripts da página pública.

A biblioteca foi injetada após o carregamento do documento local; o experimento não comprova o tempo de carregamento da tag em produção. Uma chamada pode gerar tentativas em mais de um coletor devido ao bloqueio e fallback, portanto contagens de requisições não foram tratadas como duplicidades de eventos recebidos. Não houve alteração no GA4, no checkout ou no deploy.
