# Revisão e correção da migração Vue — 28/10/2026

## Escopo e evidência

Branch `quiz/port-vue`. Base registrada: `8250641b854ab489d60a283eb17106114f0790bd`. O HEAD ainda é essa base: `git diff 8250641...HEAD` e a lista de commits novos estavam vazios. A implementação existia exclusivamente no workspace; a revisão usou `git diff 8250641 -- .` e os arquivos novos de aplicação, configuração e ferramentas. Nenhum commit ou push foi realizado.

Foram executados os dois eixos independentes da skill `code-review`. As observações abaixo descrevem a implementação encontrada; os nomes/trechos apontam a situação anterior às correções. Padrões consultados: glossário, ADR-0001, estrutura do quiz e contratos documentados nos testes. Não foram encontrados arquivos adicionais de padrões de código ou contribuição no projeto.

O build inicial e os 50 testes de unidade passaram, mas exercitavam o motor legado de cinco planos. O teste de navegador reproduziu três falhas: retorno/seleção e resultado travavam na terceira pergunta; preview não abria resultado. [Reprodução antes da correção](../tickets/evidencias/port-vue-2026-10-28/repro-before.tap).

## Standards

1. **P1 — Despacho contornava o isolamento.** O `trackEvent` da aplicação chamava `gtag` e preenchia a fila sem conferir `coletaHabilitada`, contrariando a estrutura do quiz, seção Analytics. **Corrigido:** bootstrap/despachante compartilhados, decisão anterior à tag, supressão de preview/local e inicialização única. Testes observam rede e fila.
2. **P1 — Conclusão e tempos quebravam o contrato.** A aplicação enviava `total_time_sec: 0`, respostas sem prefixo `answer_` e `Date.now()` em duração de resposta, contrariando o contrato de eventos. **Corrigido:** duração em segundos, resposta emitida somente no avanço aceito e os 12 campos com prefixo correto; conclusão permanece no teto de 20 parâmetros personalizados.
3. **P2 — Foco do comparativo não era garantido.** O foco era procurado antes da atualização DOM e não retornava ao botão de origem, contrariando o fluxo acessível documentado. **Corrigido:** foco após atualização, contenção de Tab, fechamento por Escape/fundo, retorno ao acionador e remoção do listener na desmontagem.
4. **Heurística: possível Duplicated Code.** Uma cópia ESM integral do motor podia divergir da versão testada em Node. **Corrigido:** núcleo puro único, adaptadores Node/Vue e configuração compartilhada; o gerador/cópia duplicados foram removidos.

Um apontamento inicial sobre motivos exibidos como objetos foi descartado após inspeção: a API já devolvia strings. A interface preserva essas strings e os avisos de setor; esse apontamento não entra na contagem confirmada.

**Eixo Standards:** quatro achados confirmados, corrigidos; maior impacto encontrado neste eixo: eventos escapavam da proteção de coleta.

## Spec

1. **P1 — Configuração não controlava motor/jornada.** A spec exige “um único adaptador de configuração entre os testes e a aplicação”. O componente importava a cópia antiga; substituir propriedades de um objeto não alterava as closures do cálculo. **Corrigido:** fábrica síncrona configurada, sem IO/DOM no núcleo; catálogo, perguntas e coeficientes são realmente consumidos. Duas instâncias são isoladas e a paridade é testada contra o motor histórico.
2. **P1 — Opções não apareciam na terceira pergunta.** A spec exige “explicitar o tipo das dez perguntas de opções”. O Vue recebia as perguntas antigas sem esse tipo. **Corrigido:** perguntas validadas do mesmo snapshot usado pelo motor; jornada completa coberta no navegador.
3. **P1 — Contrato GA4 regrediu.** A spec exige configuração incorporada e isolamento. ID/hosts ainda estavam fixos no head, resposta era emitida na seleção e faltavam origens de CTA. **Corrigido:** JSON controla medição, identidades semânticas e tipos; três origens preservadas, despachante condicionado e duração/serialização corretas.
4. **P1 — Validação não protegia o build.** A spec manda validar schemas e invariantes antes da compilação. O schema de pesos aceitava propriedades arbitrárias e apenas exigia descrição. **Corrigido:** schemas 2020-12 estritos, coeficientes numéricos aplicados, validação semântica de perguntas, níveis, modalidades, destinos e medição; configuração/revisão inválida impede o build.
5. **P1 — Artefato de entrega incompatível e ferramentas ausentes.** A spec determina empacotar a saída estática do Vite. A ferramenta anterior copiava o HTML-fonte sem os assets. **Corrigido:** pacote compilado com identidade de configuração e insumos; build desatualizado é rejeitado. Implementados revisão determinística, snapshot, backup/restauração local e avaliação de referência derivada. **Aceite restante:** a retirada do plano produziu perdas que exigem revisão explícita antes de liberar a entrega.
6. **P2 — Preservação da experiência parcial.** A spec manda preservar textos, identidade e foco. Cabeçalho, rodapé, alternativas e comportamento de preview/refazer haviam desaparecido. **Corrigido:** componentes Vue recuperam esses elementos e o comparativo; mantidas as verificações de teclado, contraste, responsividade e valores separados.

**Eixo Spec:** seis achados; problemas técnicos corrigidos, com liberação de negócio ainda retida no quinto achado. Maior impacto encontrado neste eixo: aplicação e testes não usavam a mesma configuração real.

## Resultado verificado

- `npm test`: executou validação, build Vite e suíte completa — **120 aprovações, zero falhas**, incluindo os 32 testes de navegador. [Log completo](../tickets/evidencias/port-vue-2026-10-28/npm-test.log).
- Foram mantidos os comportamentos aplicáveis da regressão anterior; casos exclusivos do plano retirado foram substituídos por verificações dos quatro planos e da ausência do plano excluído. A submissão dupla é exercitada no clique final real, sem consultar um controle já desmontado pelo Vue.
- `git diff --check -- .`: sem erros de whitespace.
- Versões verificadas: catálogo `2026-10-28.1`, regras `2026-10-28.2`, medição `2026-10-28.2`. Hash agregado: `d1bf02c59bdd94f5d38a588418289b738d6662301daa288c128da62fa35b65a6`.
- O servidor de testes respeita a pasta recebida, permitindo verificar um pacote isolado em vez de servir acidentalmente outra cópia do projeto.
- Dados e evidências históricos de cinco planos foram preservados. A fonte operacional ativa tem quatro planos e não contém o plano retirado como oferta invisível.

## Liberação e limites

A [avaliação de qualidade](../tickets/evidencias/port-vue-2026-10-28/quality.json) preserva as expectativas e registra as perdas `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`. Os pisos estatísticos são atendidos: histórico 10/12 no top-1 em cada partição, perfis 7/8 na calibração e 8/8 na validação, top-3 completo e zero violações de orçamento. Isso não equivale a aceite das perdas nem a precisão validada com usuários reais.

`releaseApproved` permanece `false`. O preparo normal recusa a entrega; `--diagnostic` permite somente um candidato local identificado como não aprovado. Não foram alterados pesos para recuperar artificialmente as métricas, nem criados aceites em nome do usuário.

A configuração local da Vercel aponta para Vite e saída `dist`, mantendo os insumos de validação disponíveis no build e os documentos/backups fora da saída pública. O comando `vercel-build` aplica o mesmo bloqueio quando `VERCEL_ENV=production`; a execução local dessa guarda recusou a liberação dos quatro cenários pendentes. Um build de preview continua sendo diagnóstico. O registro de aceite, quando fornecido pelo responsável, precisa identificar a configuração, as referências e exatamente as perdas aceitas; nenhum registro de aceite foi criado nesta correção.

Backup/restauração foram testados em cópia isolada, incluindo JSON sintaticamente válido com conteúdo semanticamente inválido. Recuperação automática de JSON com sintaxe quebrada não está comprovada: a importação estática pode impedir a abertura da ferramenta. Nesse caso, recuperar o arquivo a partir do snapshot antes de executar a validação; não alegar restauração irrestrita de qualquer corrupção.

Não houve deploy, alteração no GA4, implementação do admin ou desbloqueio dos QUIZ-017, 018 e 019. A produção continua na publicação anterior. Integração com a entrega de produção permanece dependente da revisão de qualidade e de uma ação específica posterior.

Standards: quatro achados confirmados (maior impacto: isolamento da coleta); Spec: seis achados (maior impacto: divergência entre motor testado e configuração da aplicação).
