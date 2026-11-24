# Proposta de aceite fundamentado das divergências do recomendador

Data de preparação: 03/11/2026. **Situação: rejeitada pelo usuário em 03/11/2026. Documento histórico, sem efeito de aprovação.**

Após examinar a proposta, o usuário declarou: “O recomendador jamis deve priorizar a assinatura mais barata, não aceito manter resultados atuais”. O caminho de aceite foi abandonado e substituído pela [correção do ranking](correcao-ranking-sem-preco-2026-11-03.md). Nenhum `config/quality-approval.json` foi criado. O restante deste documento preserva a proposta rejeitada e sua evidência histórica.

## Objeto da decisão

Aceitar como limitações conhecidas as escolhas atuais de `CAL-02`, `CAL-10`, `PER-02-C` e `RES-05`, para a configuração e as referências identificadas neste documento. A decisão mantém os pesos e o motor atuais e reconhece que a preferência por menor assinatura pode superar vantagens de ingresso ou cobertura completa de setor.

Não se afirma que os resultados atuais passaram a atender à expectativa original. Trata-se de decidir se o compromisso observado é aceitável para esta entrega.

## Evidência por caso

Reavaliação executada diretamente no motor configurado. [Respostas completas, planos, contribuições da pontuação e salvaguardas](evidencias/auditoria-producao-2026-11-03/base-aceite-ranking.json).

| Caso | Resultado atual versus referência | Fundamento possível para aceitar | Limitação assumida |
| --- | --- | --- | --- |
| CAL-02 | Meu Cruzeiro: 85,1; Time do Povo: 81,7. Referência espera Time do Povo | Priorizar assinatura de R$ 12 em vez de R$ 40, preservando Time do Povo como segunda opção visível | O usuário declara dez jogos/ano, mas o benefício do vencedor é um ingresso gratuito por temporada. Não há demonstração de que o menor preço da assinatura compense a diferença nos ingressos |
| PER-02-C | Meu Cruzeiro: 81,1; Time do Povo: 80,7. Referência espera Time do Povo | Priorizar assinatura de R$ 12 em vez de R$ 40; margem inferior a um ponto aciona a indicação de resultados próximos e mantém ambas as opções | O perfil declara vinte jogos/ano. Aceitar a ordem significa aceitar que o preço da assinatura prevaleça por pequena margem sobre o benefício popular por jogo |
| CAL-10 | Cabuloso: 76,6; Cabuloso Max: 71,9. Referência espera Max | Aceitar assinatura de R$ 100 em vez de R$ 200 para quem vai sozinho, com benefício no Roxo Superior; Max fica em segundo e como alternativa de cobertura completa | A pergunta agrupa Roxo Inferior e Superior; o vencedor só cobre o Superior. A preferência de setor é tratada como preferência ponderada, sem exigir cobertura completa |
| RES-05 | Cabuloso: 75,1; Cabuloso Max: 71,3. Referência espera Max | Aceitar a opção de R$ 100 para quem vai sozinho e já alcança prioridade 1 e desconto de 60% pelo histórico; Max oferece 65%, dois ingressos e cobertura completa por R$ 200 | O usuário escolhe “sem limite definido”, mas o preço ainda pesa no modelo. É o fundamento mais frágil para aceitar por economia. A escolha não satisfaz cobertura completa do Roxo nem entrega garantia de ingresso |

As referências de preço acima vêm do catálogo vigente do projeto. Não constituem nova confirmação da oferta no checkout.

## O que explica a escolha

O componente de preço normaliza a assinatura entre o menor e o maior valor do catálogo. Com a retirada do Cativo, o plano de R$ 200 passou a ser o mais caro e recebe zero nesse componente. Isso não significa zero afinidade total; significa que o Max perde a contribuição financeira positiva que tinha na escala anterior.

Nos cenários populares, a vantagem do Meu Cruzeiro no componente financeiro supera a vantagem do Time do Povo no componente de ingresso. Por exemplo, em CAL-02 a contribuição de preço favorece Meu Cruzeiro por cerca de 7,47 pontos, enquanto ingresso favorece Time do Povo por cerca de 4,04 pontos. Em PER-02-C essas vantagens ficam próximas, produzindo a margem final de 0,4 ponto.

Nos cenários Roxo, Cabuloso recebe aproximadamente 13 pontos pelo componente financeiro, contra zero do Max. Essa diferença supera as vantagens de cobertura e ingresso do Max. A manutenção dessa normalização é parte do compromisso a aceitar; uma mudança futura no catálogo pode exigir nova avaliação.

## Salvaguardas verificadas e limites

- Os quatro planos esperados pelas referências aparecem em segundo lugar nas recomendações dos respectivos casos, portanto estão nos três primeiros.
- Nos casos Roxo, o resultado do motor sinaliza cobertura parcial e aponta Cabuloso Max como alternativa com cobertura completa. A aplicação apresenta o aviso e o link de alternativa.
- PER-02-C aciona `closeCall: true`, reconhecendo a proximidade entre os dois planos.
- Nenhum dos quatro casos viola o teto de assinatura. Taxa de adesão, opcionais e custo efetivo de ingressos continuam fora desse teto, conforme a política vigente.
- A pontuação é apresentada como afinidade estimada, sem alegação de probabilidade de acerto ou economia total comprovada.
- Nas 40 referências sintéticas, 35 primeiros lugares são aceitáveis pela expectativa congelada e 40 têm um aceitável nos três primeiros. Os pisos agregados passam; isso não substitui a decisão sobre cada perda.
- RES-11 é uma divergência histórica adicional. Não é regressão nova e não está incluída neste aceite de quatro casos; permanece registrada como limitação conhecida.

Não há validação com usuários reais que prove equivalência de satisfação, contratação ou retenção. Recomenda-se revisar esses compromissos quando houver evidência de uso, reclamações ou alteração do catálogo. A aceitação não transforma as perdas em acertos e não justifica alterar as expectativas para melhorar as métricas.

## Texto proposto para a decisão

> Aceito manter os resultados atuais de CAL-02, CAL-10, PER-02-C e RES-05 para a configuração e as referências abaixo. Reconheço que o modelo pode priorizar menor assinatura sobre benefícios de ingresso e cobertura completa do setor, inclusive no cenário RES-05 com orçamento sem limite definido. Considero esse compromisso aceitável para a entrega porque as alternativas esperadas continuam visíveis e os avisos de setor são preservados. Reconheço que as métricas são sintéticas, que o aceite não comprova economia total ou superioridade comercial e que RES-11 permanece uma limitação histórica separada.

**Decisão do responsável:** rejeição dos quatro resultados; corrigir o motor sem preferência por menor preço.

**Identificação da manifestação:** usuário responsável pelo projeto, nesta conversa; não foi solicitado nem inventado nome de aprovador.

**Data e evidência da manifestação:** 03/11/2026, declaração transcrita no início deste documento.

O responsável pode aceitar todos os quatro casos ou indicar quais rejeita. Aceite parcial não libera o gate atual, que exige decisão cobrindo exatamente as regressões vigentes; os casos rejeitados precisarão de revisão.

## Identidade técnica do aceite

- Catálogo: `2026-10-28.2`.
- Regras: `2026-10-29.2`.
- GA4: `2026-10-28.3`.
- `configurationHash`: `523de1ae47be4b1e15acb1897567a44fc5346592140bc3e41ba9e468fee5d59c`.
- `referenceHashes.historical`: `14d5440c6377222552c745c77800709163ec9db7a6f99a3aaedcab66e74a6f23`.
- `referenceHashes.profiles`: `e7128debfadfbf3948b3cdfbff12e9238043e969674c13481867f0c4393b0e9e`.
- IDs: `CAL-02`, `CAL-10`, `PER-02-C`, `RES-05`.

O procedimento de registrar `config/quality-approval.json` descrito na proposta foi cancelado pela rejeição. Não executar aprovação com base neste documento. O contrato do gate permanece em [config-release.mjs](../scripts/config-release.mjs).

Mudanças nos hashes da configuração ou das referências invalidam a aplicação deste aceite à nova revisão. Um resultado `releaseApproved: true` desse mecanismo resolve o gate de qualidade do ranking; os demais critérios de acessibilidade, checkout, analytics e entrega continuam sujeitos à [auditoria de produção](auditoria-producao-2026-11-03.md). Não há autorização de deploy neste documento.
