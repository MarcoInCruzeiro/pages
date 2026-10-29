# Spec — Quiz público em Vue e configuração em JSON

Status: implementação técnica corrigida e verificada; entrega retida para revisão dos efeitos no ranking.
Data: 27/10/2026.
Branch criada: `quiz/port-vue`, a partir de `quiz-socio/tickets-correcoes`, HEAD `8250641b854ab489d60a283eb17106114f0790bd`.

## Problem Statement

O mantenedor precisa mudar perguntas, condições comerciais, coeficientes do recomendador e medição sem editar a lógica do quiz. Hoje esses dados estão misturados ao motor e à página. Isso dificulta revisar alterações, detectar resultados inesperados e identificar qual configuração originou uma recomendação.

O torcedor também continua vendo o Cabuloso Cativo, cuja oferta tem pendências. A decisão desta entrega é removê-lo do catálogo ativo e migrar a experiência pública para Vue, preservando as regras de orçamento, a apresentação separada dos valores e a confirmação de respostas incompatíveis.

### Estado atual verificado

- Aplicação estática em HTML/JavaScript, sem framework, dependências npm ou build de aplicação. O motor é puro e exposto em Node e navegador por um adaptador UMD.
- O motor contém cinco planos, 12 perguntas, configuração do perfil e coeficientes de cálculo. As perguntas são duas faixas numéricas e dez listas de opções; estas não têm tipo explícito atualmente. Valores incluem números, strings e booleanos.
- O ranking possui sete componentes: ingresso, prioridade, setor, desconto, experiências, família e preço. Presença é um fator que modula ingresso, prioridade e setor, não um oitavo componente somado.
- O perfil expõe `frecuencia`, `prioridad`, `experiencias`, `descuentos`, `productos`, `importanciaPreco`, `adultos`, `kids` e `setorPreferido`. Os nomes `familia` e `precio` do pedido inicial não são campos desse contrato.
- A medição GA4 decide a coleta antes de injetar a tag. Configuração atual: `G-EF75QCTCTV`, host permitido `quiz-socio.vercel.app`, quatro eventos de negócio. A conferência administrativa da propriedade permanece pendente.
- Versões atuais: catálogo `2026-09-11`, regras `2026-10-26.2`. Os dados comerciais aceitos têm proveniência documental; o Markdown é a referência explicativa, não uma entrada executável.
- A última execução antes do deploy aprovou 82 testes, incluindo 32 de navegador via CDP. Essa evidência representa o workspace, que contém alterações não commitadas, além do HEAD informado. A implementação deverá registrar novamente seu ponto de partida; não presumir que um checkout do HEAD reproduz os 82 testes.

## Solution

O quiz público será uma aplicação Vue 3 com Vite. Perguntas, catálogo, parâmetros de perfil, coeficientes do ranking e configuração GA4 terão entradas JSON validadas e incorporadas ao artefato de aplicação. O mantenedor editará esses arquivos localmente, avaliará os efeitos e preparará uma revisão identificável, com backup antes da substituição de um candidato anterior.

Os quatro planos ativos serão Meu Cruzeiro, Time do Povo, Cabuloso e Cabuloso Max. O cálculo de preço considerará exclusivamente esse catálogo ativo. A mudança será avaliada separadamente da migração mecânica e ficará impedida de ser liberada enquanto seus efeitos não forem revisados.

**Decisões confirmadas pelo usuário:** migrar também o quiz público para Vue + Vite; adiar completamente a implementação do painel administrativo; usar JSON como fonte operacional; remover o Cativo, sem mantê-lo como plano invisível; avaliar os efeitos da normalização com quatro planos antes da entrega.

## User Stories

1. Como torcedor, quero responder às mesmas 12 perguntas, para receber uma recomendação sem reaprender a navegação.
2. Como torcedor, quero voltar e revisar respostas, para corrigir escolhas preservadas pelo quiz.
3. Como torcedor, quero confirmar respostas incompatíveis, para decidir conscientemente qual declaração prevalece.
4. Como torcedor, quero que zero, falso e histórico desconhecido sejam aceitos quando previstos, para não precisar inventar respostas.
5. Como torcedor, quero recomendações dentro do orçamento informado, para comparar assinaturas que posso contratar.
6. Como torcedor, quero um estado claro quando nenhum plano for elegível, para não confundir uma alternativa informativa com recomendação.
7. Como torcedor, quero comparar os quatro planos ativos, para entender as diferenças sem encontrar o plano removido.
8. Como torcedor, quero ver assinatura, adesão, Kids e exemplos de ingresso separadamente, para compreender as condições comerciais.
9. Como torcedor, quero conhecer cobertura de setor, nível e prioridade, para avaliar o benefício disponível para meu perfil.
10. Como torcedor, quero acionar o checkout do plano escolhido por link acessível, para continuar a contratação com teclado ou toque.
11. Como torcedor, quero refazer o quiz, para obter um novo resultado sem dados ou comparativos da tentativa anterior.
12. Como torcedor, quero navegação responsiva, foco visível e redução de movimento, para usar o quiz no meu dispositivo.
13. Como mantenedor, quero editar textos e ordem das perguntas em JSON, para revisar conteúdo sem alterar o algoritmo.
14. Como mantenedor, quero preservar os tipos das respostas, para que o mesmo valor continue tendo o mesmo significado.
15. Como mantenedor, quero editar coeficientes documentados, para simular ajustes sem executar código armazenado em configuração.
16. Como mantenedor, quero validar preços, modalidades, níveis e links, para impedir a geração de uma oferta incoerente.
17. Como mantenedor, quero rejeitar configuração estruturalmente válida mas incompatível com o motor, para evitar resultados silenciosamente errados.
18. Como responsável pela medição, quero configurar o ID, hosts e contrato de eventos em JSON, para revisar a coleta sem editar a página.
19. Como responsável pela medição, quero excluir preview e desenvolvimento mesmo que a allowlist seja alterada, para preservar o isolamento.
20. Como responsável pela qualidade, quero avaliar cenários históricos e perfis sintéticos com a mesma instância configurada usada na aplicação, para identificar mudanças de ranking.
21. Como responsável pela qualidade, quero preservar as referências históricas e sua proveniência, para distinguir mudança comercial de ajuste de expectativa.
22. Como mantenedor, quero identificar o conteúdo por versões e SHA-256, para reproduzir uma recomendação e comparar revisões.
23. Como mantenedor, quero preparar e restaurar candidatos localmente, para corrigir uma edição sem alterar produção automaticamente.
24. Como responsável pela entrega, quero validar o artefato estático compilado, para publicar somente arquivos necessários ao quiz.
25. Como futuro responsável pelo admin, quero reutilizar os contratos de configuração e avaliação, para construir o painel sem duplicar o motor.

## Implementation Decisions

### Aplicação pública e separação do motor

- Usar Vue 3, componentes de arquivo único e Vite, com JavaScript. Vite é a escolha confirmada e recomendada pela documentação Vue; Vue CLI está em manutenção. Não introduzir TypeScript, Vue Router, Pinia ou SSR sem necessidade demonstrada pelo fluxo existente.
- A aplicação terá componentes para abertura, progresso, perguntas, confirmação de conflitos, resultado e comparativo. O estado da tentativa será explícito; transições e efeitos de medição não dependerão de remontagens acidentais.
- Preservar textos vigentes, identidade visual, responsividade, navegação por teclado, foco, estados de botão, links reais e preferência por movimento reduzido. Esta migração não inclui uma nova redação ou redesign.
- Adotar uma fábrica de motor configurado que receba dados já validados. A instância continuará síncrona, determinística e sem DOM, rede, analytics ou sistema de arquivos. O ponto principal de teste continuará sendo `recommendPlans`, junto às entradas públicas de validação de respostas e conflitos.
- Reutilizar um único adaptador de configuração entre os testes e a aplicação. Compatibilidade temporária com consumidores existentes poderá permanecer durante a migração, com remoção na integração final; não manter dois recomendadores ou duas cópias editáveis dos dados.
- Separar o ciclo de leitura/validação dos JSONs do cálculo. Instâncias com configurações diferentes devem coexistir sem mutação compartilhada.

### Configuração e validação

- JSON será a fonte operacional única. O catálogo documental continuará registrando fonte, condições comerciais aceitas, datas e justificativas. Uma edição operacional não equivale a confirmação de uma nova condição oficial.
- A aplicação importará um snapshot da configuração no build Vite. Alterar JSON exige validar e gerar outro artefato; a produção não buscará arquivos mutáveis de configuração a cada visita. Isso evita combinar revisões diferentes e mantém a decisão de analytics anterior à inicialização da coleta.
- Validar JSON Schema e invariantes semânticas antes de testes de candidato e build. Erro identifica domínio, campo e motivo, sem completar dados silenciosamente. Build e preparo de release falham antes de substituir qualquer candidato.
- Usar JSON Schema 2020-12, schemas identificados/versionados e propriedades desconhecidas rejeitadas nos objetos de contrato. O schema compartilhado de pesos terá definições distintas para ranking e perfil, escolhidas explicitamente pelo validador.
- Manter exatamente as 12 chaves semânticas conhecidas pelo motor. Permitir texto, ajuda e ordem; restringir tipos, opções, limites e valores às combinações suportadas. Mudanças em chaves, significado de opções ou tipo de pergunta exigem migração explícita de contrato e testes, não apenas uma edição de formulário futura.
- Explicitar o tipo das dez perguntas de opções sem converter seus valores. Zero, `false` e `unknown` mantêm significado. Limites abertos de níveis usam `null`, interpretado pelo motor; JSON não conterá funções, expressões, `Infinity`, `NaN` ou código executável.
- Conservar, nesta migração, o valor numérico 400 da opção atualmente rotulada como orçamento sem limite definido. Corrigir essa semântica é uma alteração de produto separada.
- Extrair os coeficientes realmente usados: pesos dinâmicos, valores-base e escalas, fatores por cobertura de setor, utilidades de ingresso, bônus de acompanhante, mistura de capacidade/Kids e mapas de respostas do perfil. Presença configura o modulador existente; não será acrescentado outro termo à média ponderada.
- Manter regras como comparação de orçamento, desempate e interpretação de conflitos no código. Parâmetros configuráveis precisam de domínio numérico e significado documentados; rejeitar totais de peso nulos e combinações que produzam resultados não finitos.
- Validar catálogo não vazio, quatro slugs ativos únicos no contrato final, valores comerciais não negativos, modalidades consistentes, níveis ordenados sem lacunas/sobreposição, setores conhecidos e destinos de checkout HTTPS permitidos. Campos de texto serão renderizados como texto, sem HTML executável.

### Remoção do Cativo e qualidade do recomendador

- Remover o Cativo do catálogo operacional, das recomendações, listas, comparativo, links próprios e textos ativos. Não criar sinalizador para preservá-lo invisível. Os quatro planos remanescentes mantêm as condições comerciais já aceitas.
- Atualizar a documentação ativa do catálogo e da estrutura. Evidências, referências e relatórios históricos continuam identificados pela revisão de cinco planos, sem reescrita retroativa.
- A normalização de preço continuará usando mínimo e máximo do catálogo ativo inteiro, inclusive planos fora do orçamento; agora serão quatro planos. Não congelar artificialmente a assinatura de R$ 400 como âncora de um plano removido. A filtragem de orçamento permanece independente.
- Primeiro comprovar paridade da extração com a revisão de cinco planos. Depois produzir uma revisão de referência com quatro planos: retirar apenas o slug excluído dos aceitáveis, registrar a justificativa e um novo hash, mantendo respostas e histórico originais. Se um conjunto aceitável ficar vazio, bloquear a avaliação até revisão explícita desse caso.
- Congelar a revisão derivada antes de eventual calibração. Alterar pesos exige outra revisão de regras e comparação; não ajustar expectativas a partir dos vencedores observados para melhorar métricas.
- Aplicar os pisos atuais de avaliação sintética: top-1 de pelo menos 80%, top-3 de pelo menos 95%, zero violações de orçamento e zero scores inválidos, por partição. Além dos pisos, toda perda de acerto em cenário anteriormente aprovado precisa de resolução ou aceite explícito, identificado pela configuração e relatório; um resultado agregado acima do piso não encerra essa revisão.
- Retornar em recomendações apenas planos elegíveis. Sem elegíveis, vencedor nulo e recomendações vazias; a lista de todos os planos e eventual alternativa mais próxima permanecem informativas e claramente indisponíveis para recomendação. Essa é uma alteração explícita do fallback atual, que ainda preenche recomendações com planos acima do teto.
- Manter desempate por índice decrescente, assinatura crescente e slug. Alterações de ordem do catálogo não podem alterar o resultado.

### Medição GA4

- Extrair o ID, hosts permitidos, nomes dos quatro eventos e definições/tipos dos parâmetros. O snapshot inicial preservará os valores atuais e os eventos `quiz_start`, `quiz_answer`, `quiz_complete` e `quiz_subscribe_click`.
- Usar identidades semânticas estáveis para os quatro pontos de emissão. Renomear um evento ou parâmetro enviado exige registro de migração e revisão de consumidores; editar o JSON não deverá desconectar uma ação da interface de sua emissão.
- O bootstrap declarado no head decidirá `coletaHabilitada` usando a configuração incorporada, antes de inserir a tag ou chamar a inicialização. A tag real continua sendo anexada ao head somente após essa decisão. Nenhum componente Vue inicializará GA4 por conta própria.
- Preview é reconhecido pelo nome do parâmetro ou fragmento já suportado. Localhost, loopbacks IPv4/IPv6 e protocolo local permanecem excluídos mesmo se adicionados por engano à allowlist. Hosts são exatos, normalizados, sem curingas, caminhos ou correspondência por sufixo.
- Configuração de analytics ausente/inválida mantém a coleta desligada. Um erro de medição em execução não pode impedir o uso do quiz. O validador de candidato, porém, rejeita configurações inválidas antes da entrega.
- O teto interno será de 20 parâmetros personalizados por evento, contando o payload final e os 12 campos de resposta na conclusão; o limite técnico publicado pelo Google é 25. Não enviar novos parâmetros de rastreabilidade sem conferir esse orçamento.
- Preservar `rules_version`, `catalog_version`, afinidade, semântica e o campo legado `compatibility`, além dos parâmetros atuais de respostas, tempos e origem de CTA. Remover `rules_version` não é uma edição comum: exige justificativa e aprovação de migração do contrato.
- O hash completo da configuração ficará no manifesto de entrega; não será acrescentado automaticamente ao evento de conclusão, que já possui 20 parâmetros personalizados na configuração vigente.
- Medição administrativa, definições no Admin, DebugView, recebimento e identidade entre domínios continuam sendo aceites externos. Nenhum destes será declarado resolvido pelo build ou pelos testes locais.

### Versionamento, edição e entrega

- O fluxo implementado nesta etapa será local: carregar JSONs → editar arquivos → validar schemas e invariantes → avaliar referências → preparar versão/candidato → revisar → entregar por ação específica. Não haverá tela, API de escrita ou credencial administrativa no site público.
- Preparar versões por comando explícito; builds de verificação não alteram fontes, incrementam versões ou publicam. A preparação é idempotente para o mesmo conteúdo e parte da última revisão registrada, nunca de um contador em memória.
- Usar versões de revisão no formato data mais sequência, preservando as versões anteriores como origem. Separar a revisão operacional do catálogo da data de publicação/consulta da fonte oficial.
- Mudanças de catálogo avançam a revisão de catálogo; mudanças de perguntas/regras/perfil/pesos/motor e do catálogo que participa da normalização avançam a revisão de regras. Analytics tem revisão própria. O manifesto relaciona versões, schemas, hashes por domínio, hash agregado e revisão de código, incluindo a indicação de workspace modificado.
- SHA-256 é identificação de conteúdo, não incremento nem prova de aprovação. Calcular sobre representação canônica: chaves de objetos ordenadas, arrays preservados e tipos mantidos. O hash agregado exclui timestamps e seus próprios campos de hash. A identidade das regras inclui a lógica do motor e os dados que influenciam o cálculo.
- Antes de substituir um candidato local, preservar snapshot completo e manifesto da revisão anterior fora da saída pública. Gravar em área temporária, validar e só então substituir o candidato; erro deixa o anterior intacto. Restauração local usa o mesmo validador e preserva o histórico.
- O artefato público será a saída estática do Vite. O preparo atual, baseado numa lista fixa de HTML/motor/imagens, precisa ser substituído por empacotamento validado dessa saída; não enviar o workspace como diretório público.
- A configuração de entrega manterá o projeto Vercel existente e seu diretório raiz. Testes devem exercitar o artefato compilado, com assets locais resolvidos e contratos de preview/hosts preservados. Ajustar o build e a saída do projeto será parte do corte de entrega, sem alterar produção durante a elaboração desta spec.
- Branch de trabalho e preview são os destinos de desenvolvimento. Geração de artefato não faz push, deploy ou alteração no GA4. A entrega em produção e eventual rollback são ações específicas, posteriores à revisão do candidato.

## Testing Decisions

- A fronteira principal é o motor configurado: os mesmos JSONs devem produzir a mesma recomendação na aplicação e no avaliador. Testar comportamento observável, não coeficientes copiados em asserts que reproduzam a fórmula.
- Usar a suíte Node e as referências existentes como ponto de partida. Registrar o baseline do workspace e preservar evidências de cinco planos antes da remoção. Quantidade de testes não é meta: manter a cobertura aplicável dos 82 testes, justificar substituições dos casos exclusivos do plano removido e acrescentar cobertura dos novos contratos.
- Antes de mudar o catálogo, exigir igualdade de respostas válidas, conflitos, elegibilidade, ranking, índices, motivos e valores separados entre implementação anterior e configuração extraída. Exercitar também duas instâncias com pesos diferentes sem interferência.
- Validar uma configuração correta e mutações inválidas significativas: tipo de opção trocado, chave semântica desconhecida, ordem duplicada, peso negativo/nulo inválido, nível sobreposto, modalidade incoerente, URL não permitida e evento acima do teto interno.
- Rodar a avaliação sintética nas duas partições de perfis e nas duas partições históricas. Contradições ficam separadas das métricas de precisão; registrar detecção e confirmação. Relatório compara cada vencedor e score antes/depois, versões, hashes, top-1/top-3, violações e casos sem elegíveis.
- Preservar os testes de navegador via CDP, adaptados para servir a saída Vite. Testar início, 12 perguntas, retorno, revisão, confirmação, resultado, quatro planos no comparativo, três origens de CTA e refazer. Esperar a aplicação estar pronta antes de instalar/interagir com os controles de teste.
- Cobrir clique duplo, alternância rápida, limpeza de listeners e duplicação de eventos por montagem/remontagem Vue. Conferir teclado, foco de modal, leitura móvel, ausência de overflow e preferência por redução de movimento.
- Interceptar rede e analytics antes do bootstrap. Comprovar ausência de inicialização/tag nos hosts excluídos e preview; no host habilitado simulado, confirmar inicialização única e payloads corretos. Testes não enviam eventos a GA4 nem concluem checkout.
- Testar a fronteira de release com configuração inválida, revisão desatualizada, preparo repetido idempotente, falha antes da substituição e restauração. Conferir que backup, ambiente, credenciais, testes, documentos e futuro admin não integram o artefato público.
- Proposta para revisão: manter motor configurado e aplicação compilada como as duas fronteiras funcionais; schema e empacotamento serão verificações de contrato nessas entradas, sem criar uma nova pilha de E2E ou testes de componentes apenas por adotar Vue.

## Out of Scope

- Implementar o painel administrativo, seus editores, autenticação, autorização, backend, API de escrita ou exposição de uma pasta administrativa. Não instalar um scaffold de admin vazio nesta entrega.
- Alterar preços aceitos, aderir/contratar planos, concluir pagamentos ou acessar dados pessoais reais.
- Ajustar pesos para recuperar métricas sem avaliação e revisão; transformar as referências sintéticas em alegação de precisão real.
- Apagar registros históricos do Cativo ou manter o plano como pendente invisível no runtime.
- Corrigir o significado da opção de orçamento sem limite definido, além de preservar sua semântica atual documentada.
- Redesign, nova redação geral, mudança do fluxo comercial ou troca de ferramenta de E2E sem necessidade.
- Desbloquear, encerrar ou alterar os aceites dos QUIZ-017, QUIZ-018 e QUIZ-019. Produção já publicada continua servindo sua revisão até uma entrega específica futura.

## Further Notes

### Organização solicitada

Os nomes abaixo são o mapa solicitado para a implementação; os contratos e comportamentos acima prevalecem sobre detalhes de organização interna.

```text
config/
├── questoes/
│   ├── questoes.json
│   └── questoes.schema.json
├── pesos/
│   ├── ranking.json
│   ├── perfil.json
│   └── pesos.schema.json
├── planos/
│   ├── catalogo.json
│   └── catalogo.schema.json
└── ga4/
    ├── ga4.json
    └── ga4.schema.json
```

O motor continua separado da aplicação Vue. O manifesto e os snapshots anteriores terão armazenamento local fora da saída pública. A pasta `admin/` e os componentes `PlansEditor`, `QuestionsEditor`, `WeightsEditor`, `Ga4Editor` e `ValidationResults` ficam reservados a uma spec futura; a avaliação CLI desta entrega será reutilizável por esse painel.

### Impacto preliminar da retirada do plano

Uma simulação somente leitura manteve a fórmula e filtrou o Cativo do catálogo. Para calcular acerto, desconsiderou apenas seu slug nas listas de aceitáveis, sem alterar os arquivos de referência. Nenhum conjunto ficou vazio. É um diagnóstico, não aceite de uma nova revisão congelada.

| Conjunto | Top-1 atual | Top-1 com quatro planos | Top-3 com quatro planos |
| --- | --- | --- | --- |
| Histórico — calibração | 12/12 | 10/12 | 12/12 |
| Histórico — reserva | 11/12 | 10/12 | 12/12 |
| Perfis — calibração | 8/8 | 7/8 | 8/8 |
| Perfis — validação | 8/8 | 8/8 | 8/8 |

Mudaram sete dos 24 vencedores históricos e quatro dos 16 vencedores de perfis. Os índices dos casos avaliados também mudaram. O diagnóstico não encontrou violação de orçamento. Isso explica por que extrair configuração e remover o plano terão avaliações distintas.

### Proveniência e orientação consultada

- [Glossário do projeto](../GLOSSARY.md) e [ADR-0001 — valores e taxas separados](adr/0001-valores-e-taxas-separados.md).
- [Backlog local](../tickets/README.md), [registro da publicação atual](../tickets/evidencias/deploy-2026-10-27/deploy.json) e [tickets locais desta feature](../tickets/port-vue/README.md).
- [Vue: tooling](https://vuejs.org/guide/scaling-up/tooling.html): Vite recomendado para projetos novos; Vue CLI em manutenção. Consulta em 27/10/2026.
- [Vite: requisitos e build](https://vite.dev/guide/): verificar Node compatível; a documentação atual exige 20.19+ ou 22.12+. Manter Node 24 da Vercel e declarar um mínimo local compatível, em vez do atual limite genérico de Node 22.
- [Google: limites de coleta](https://support.google.com/analytics/answer/9267744?hl=en-ES): 25 parâmetros por evento. O teto de 20 nesta spec é uma política interna explícita.

### Situação da elaboração

A implementação foi revisada e corrigida em 28/10/2026. O build e 120 testes passaram, usando configuração compartilhada e quatro planos. [Relatório e evidências](revisao-port-vue-2026-10-28.md). A entrega permanece retida pela revisão das perdas do ranking, sem presumir aceite. O painel permanece fora do escopo; os QUIZ-017, 018 e 019 continuam bloqueados.
