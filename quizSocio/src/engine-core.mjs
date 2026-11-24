/** Núcleo único e puro. Recebe configuração validada; não conhece DOM, analytics ou IO. */
function freezeTree(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.values(value).forEach(freezeTree);
        Object.freeze(value);
    }
    return value;
}

export function createEngine(configuration) {
    if (!configuration?.catalogo?.length || !configuration?.questoes?.length || !configuration?.pesosRanking || !configuration?.pesosPerfil) {
        throw new Error('Configuração completa de catálogo, questões e pesos é obrigatória.');
    }
    const settings = freezeTree(structuredClone(configuration));


    const CATALOG_VERSION = settings.metadata?.catalogVersion || '2026-09-11';
    const CATALOG_CONSULTED_AT = '2026-10-26';
    // Versão das regras de perfil, custo e ranking; mude ao alterar o cálculo.
    const RULES_VERSION = settings.metadata?.rulesVersion || '2026-10-26.2';

    const CATALOG_SOURCE = {
        nome: 'Regulamento e Termo de Uso do Programa Sócio 5 Estrelas',
        url: 'https://socio.cruzeiro.com.br/pt-BR/paginas/termo-de-uso',
        publicacao: '2026-09-11',
        consulta: CATALOG_CONSULTED_AT,
        complemento: 'https://socio.cruzeiro.com.br/duvidas'
    };

    /*
     * Premissa dos exemplos de desconto por ingresso. Os valores de assinatura,
     * adesão e opcionais vêm do catálogo, separados conforme a ADR-0001.
     */
    const ASSUMPTIONS = {
        precoIngressoCheio: 150,
        labels: {
            precoIngressoCheio: 'R$ 150 por ingresso de referência',
            kidsIngressos: 'Kids depende de aprovação: ingresso da criança sem custo adicional no setor do titular, mediante disponibilidade e aquisição do ingresso do titular'
        }
    };

    const SECTOR_GROUPS = {
        'yellow-orange': {
            label: 'Amarelo ou Laranja',
            sectors: ['amarelo-inferior', 'amarelo-superior', 'laranja-inferior', 'laranja-superior']
        },
        blue: {
            label: 'Sicoob (Leste, antigo Azul)',
            sectors: ['sicoob-inferior', 'sicoob-superior']
        },
        purple: {
            label: 'Roxo',
            sectors: ['roxo-inferior', 'roxo-superior']
        }
    };

    const SECTOR_LABELS = {
        'amarelo-inferior': 'Amarelo Inferior',
        'amarelo-superior': 'Amarelo Superior',
        'laranja-inferior': 'Laranja Inferior',
        'laranja-superior': 'Laranja Superior',
        'sicoob-inferior': 'Sicoob Leste Inferior',
        'sicoob-superior': 'Sicoob Leste Superior',
        'roxo-inferior': 'Roxo Inferior',
        'roxo-superior': 'Roxo Superior'
    };

    const POPULAR_SECTORS = [
        'amarelo-inferior', 'amarelo-superior',
        'laranja-inferior', 'laranja-superior'
    ];

    const plans = settings.catalogo;
    const aliases = { 'meu-cruzeiro': 'meuCruzeiro', 'time-do-povo': 'timeDoPovo', cabuloso: 'cabuloso', 'cabuloso-max': 'cabulosoMax' };
    const assinaturasSocios = Object.fromEntries(plans.map((plan) => [aliases[plan.slug] || plan.slug, plan]));
    const ATTRIBUTE_LABELS = {
        frecuencia: 'Frequência no estádio',
        prioridad: 'Prioridade na compra',
        experiencias: 'Experiências e conteúdo',
        descuentos: 'Descontos e loja',
        familia: 'Acompanhantes e Kids',
        precio: 'Custo para o seu perfil'
    };

    const questions = settings.questoes;
    const ranking = settings.pesosRanking;
    const perfil = settings.pesosPerfil;

    const QUESTION_BY_KEY = questions.reduce((acc, question) => {
        acc[question.key] = question;
        return acc;
    }, {});

    function createInitialAnswers() {
        const answers = {};
        questions.forEach((question) => {
            if (question.type === 'range') {
                answers[question.key] = 0;
            } else {
                answers[question.key] = null;
            }
        });
        return answers;
    }

    function isAnswerValid(question, value) {
        if (!question) return false;

        if (question.type === 'range') {
            if (question.allowUnknown && value === 'unknown') return true;
            return typeof value === 'number'
                && Number.isFinite(value)
                && Number.isInteger(value)
                && value >= question.min
                && value <= question.max;
        }

        return (question.options || []).some((option) => Object.is(option.value, value));
    }

    function getAnswerError(question) {
        if (question.type === 'range') {
            return question.allowUnknown
                ? `Escolha uma quantidade de jogos ou marque “${question.unknownLabel}”.`
                : 'Escolha uma quantidade de jogos. Zero é uma resposta válida.';
        }
        return 'Selecione uma das opções para continuar.';
    }

    function validateAnswers(answers) {
        const invalid = [];
        questions.forEach((question, index) => {
            if (!isAnswerValid(question, answers[question.key])) {
                invalid.push({
                    index,
                    key: question.key,
                    question,
                    message: getAnswerError(question)
                });
            }
        });
        return invalid;
    }

    /*
     * Contradições não são corrigidas em silêncio. A interface mostra esta lista
     * e exige confirmação explícita ou revisão antes do resultado.
     */
    function detectConflicts(answers) {
        const conflicts = [];
        const games = answers.gamesPerYear;
        const presence = answers.wantsGuaranteedTicket;
        const frequency = answers.gameFrequency;

        if (games === 0 && presence === true) {
            conflicts.push({
                keys: ['gamesPerYear', 'wantsGuaranteedTicket'],
                firstKey: 'gamesPerYear',
                message: '0 jogos no ano, mas “Faço questão de ir a todos os jogos”.'
            });
        }

        if (games === 0 && frequency === 'always') {
            conflicts.push({
                keys: ['gamesPerYear', 'gameFrequency'],
                firstKey: 'gamesPerYear',
                message: '0 jogos no ano, mas “Sempre na arquibancada”.'
            });
        }

        if (games === 0 && frequency === 'frequent') {
            conflicts.push({
                keys: ['gamesPerYear', 'gameFrequency'],
                firstKey: 'gamesPerYear',
                message: '0 jogos no ano, mas “Fico dividido entre estádio e TV”.'
            });
        }

        if (games > 0 && presence === 'never') {
            conflicts.push({
                keys: ['gamesPerYear', 'wantsGuaranteedTicket'],
                firstKey: 'gamesPerYear',
                message: `${games} jogos no ano, mas “Não frequento o estádio”.`
            });
        }

        return conflicts;
    }

    const FREQUENCY_BY_PRESENCE = perfil.frecuencia.presencas;
    const FREQUENCY_BY_DECLARATION = perfil.frecuencia.declaracoes;
    // Respostas de três níveis: sempre/com frequência, às vezes, nunca.
    const DISCOUNT_BY_PURCHASE = { true: perfil.descuentos.true, sometimes: perfil.descuentos.sometimes, false: perfil.descuentos.false };
    const DIGITAL_BONUS = { true: perfil.experiencias.bonusDigital, sometimes: perfil.experiencias.bonusDigitalParcial, false: 0 };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function buildUserProfile(answers) {
        const games = Number.isFinite(answers.gamesPerYear) ? answers.gamesPerYear : 0;
        const presence = answers.wantsGuaranteedTicket;
        const declaration = answers.gameFrequency;

        const volumeScore = (games / perfil.frecuencia.maxJogos) * 10;
        const presenceScore = FREQUENCY_BY_PRESENCE[presence];
        const declarationScore = FREQUENCY_BY_DECLARATION[declaration];

        const parts = [];
        if (Number.isFinite(volumeScore)) parts.push({ value: volumeScore, weight: perfil.frecuencia.volume });
        if (Number.isFinite(presenceScore)) parts.push({ value: presenceScore, weight: perfil.frecuencia.presenca });
        if (Number.isFinite(declarationScore)) parts.push({ value: declarationScore, weight: perfil.frecuencia.declaracao });

        let frecuencia = perfil.frecuencia.padrao;
        if (parts.length) {
            const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
            frecuencia = parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
        }
        // Regra explícita: quem não vai ao estádio (ou pretende ir a zero jogos)
        // não tem necessidade presencial, independentemente das demais respostas.
        if (presence === 'never' || games === 0) frecuencia = 0;

        const prioridad = answers.needsPriority === true ? perfil.prioridad.true : answers.needsPriority === false ? perfil.prioridad.false : perfil.prioridad.padrao;

        let experiencias = answers.wantsParticipation === true ? perfil.experiencias.true : answers.wantsParticipation === false ? perfil.experiencias.false : perfil.experiencias.padrao;
        // Conteúdo digital sustenta interesse em conteúdo/experiências; não
        // acrescenta frequência presencial nem consumo de produtos.
        experiencias += DIGITAL_BONUS[answers.digitalExperience] ?? 0;

        const descuentos = DISCOUNT_BY_PURCHASE[answers.wantsStoreDiscount] ?? perfil.descuentos.padrao;

        // Só o que o ranking lê. Setor preferido é lido direto das respostas.
        return {
            frecuencia: clamp(frecuencia, 0, 10),
            prioridad: clamp(prioridad, 0, 10),
            experiencias: clamp(experiencias, 0, 10),
            descuentos: clamp(descuentos, 0, 10),
            adultos: answers.buysTwoTickets === true ? perfil.adultos.true : perfil.adultos.false,
            // `true` é aceito só por compatibilidade do perfil; a pergunta valida 0 ou 1.
            kids: answers.kidsCount === true ? 1 : (Number.isInteger(answers.kidsCount) ? clamp(answers.kidsCount, 0, perfil.kids.max) : 0)
        };
    }

    function getSectorFit(plan, answers) {
        // A pergunta de setor é obrigatória; o ranking não tem caminho "sem preferência".
        const group = SECTOR_GROUPS[answers.preferredSector];
        if (!group) throw new Error(`Setor preferido inválido: ${String(answers.preferredSector)}. Valide as respostas antes de recomendar.`);

        const covered = plan.ingresso.setores;
        const matched = group.sectors.filter((sector) => covered.includes(sector));
        const missing = group.sectors.filter((sector) => !covered.includes(sector));
        const level = matched.length === group.sectors.length
            ? 'full'
            : matched.length > 0
                ? 'partial'
                : 'none';

        let text;
        if (level === 'full') {
            text = `Cobre o setor que você prefere (${group.label}).`;
        } else if (level === 'partial') {
            text = `Cobre apenas ${matched.map((s) => SECTOR_LABELS[s]).join(', ')} dentro de ${group.label}.`;
        } else {
            text = `Não cobre ${group.label}. O benefício de ingresso é em ${plan.ingresso.setorTexto}.`;
        }

        return { level, label: group.label, matched, missing, text };
    }

    function resolveLevel(plan, answers) {
        if (!plan.ingresso.niveis) return null;
        const history = answers.gamesHistory;
        if (history === 'unknown' || history === null || history === undefined) {
            const first = plan.ingresso.niveis[0];
            return {
                nivel: first.nivel,
                jogos: null,
                origem: 'inicial',
                descricao: 'Nível 1 — condição inicial para histórico não confirmado'
            };
        }
        const level = plan.ingresso.niveis.find((item) => {
            const max = item.jogosMaximos === null ? Infinity : item.jogosMaximos;
            return history >= item.jogosMinimos && history <= max;
        }) || plan.ingresso.niveis[0];
        return {
            nivel: level.nivel,
            jogos: history,
            origem: 'historico',
            descricao: `Nível ${level.nivel} — ${history} jogos nos últimos 15 meses`
        };
    }

    function getDiscount(plan, answers) {
        if (plan.ingresso.tipo !== 'desconto') return null;
        if (plan.ingresso.descontoFixo !== null) return plan.ingresso.descontoFixo;
        const level = resolveLevel(plan, answers);
        if (!level) return null;
        const config = plan.ingresso.niveis.find((item) => item.nivel === level.nivel);
        return config ? config.desconto : null;
    }

    function getPriority(plan, answers) {
        if (plan.garantiaIngresso) {
            return { value: 1, garantido: true, label: 'Ingresso garantido' };
        }
        if (plan.ingresso.niveis) {
            const level = resolveLevel(plan, answers);
            const config = plan.ingresso.niveis.find((item) => item.nivel === level.nivel);
            return {
                value: config ? config.prioridade : 4,
                garantido: false,
                nivel: level.nivel,
                label: `Prioridade ${config ? config.prioridade : 4} (nível ${level.nivel})`
            };
        }
        return {
            value: plan.prioridade,
            garantido: false,
            label: `Prioridade ${plan.prioridade}`
        };
    }

    const TICKET_TEXTS = {
        gratuito: '1 ingresso gratuito por temporada, mediante disponibilidade',
        popular: '1 ingresso popular por jogo: menor preço online da arquibancada, mediante disponibilidade',
        garantido: '1 ingresso garantido por jogo no Sicoob — Leste Inferior, temporada 2026',
        semBeneficio: 'Não inclui benefício de ingresso'
    };

    function describeDiscountTicket(plan, discount) {
        const percent = Math.round((discount || 0) * 100);
        const example = (ASSUMPTIONS.precoIngressoCheio * (1 - (discount || 0))).toFixed(2).replace('.', ',');
        const quantity = plan.ingresso.quantidade > 1 ? `Até ${plan.ingresso.quantidade} ingressos por jogo` : '1 ingresso por jogo';
        return `Economize ${percent}% em ${lowerFirst(quantity)}. Ex.: de R$ 150 por R$ ${example} cada. Mediante disponibilidade.`;
    }

    /*
     * Utilidade do ingresso entre 0 e 1. Cada tipo tem a sua utilidade de
     * referência; no tipo "desconto" ela cresce com o percentual do catálogo,
     * a partir de `descontoReferencia`. No benefício "por temporada" ela
     * cresce com a parcela dos jogos declarados que os ingressos da temporada
     * cobrem (1 ingresso para 1 jogo cobre tudo; para 30 jogos, quase nada),
     * até `bonusCoberturaTemporada` acima da utilidade base. Nenhum custo
     * mensal é calculado (ADR-0001): a medida é o tamanho do benefício.
     */
    function getTicketUtility(plan, discount, answers) {
        const { utilidades, descontoReferencia, bonusCoberturaTemporada } = ranking.ticket;
        const tipo = plan.ingresso.tipo;
        if (tipo === 'desconto') {
            const scaled = Math.round(utilidades.desconto * ((discount || 0) / descontoReferencia) * 1e6) / 1e6;
            return clamp(scaled, 0, 1);
        }
        const base = utilidades[tipo] ?? utilidades.semBeneficio;
        if (plan.ingresso.periodicidade === 'temporada') {
            const games = Number.isFinite(answers?.gamesPerYear) ? answers.gamesPerYear : 0;
            const share = games > 0 ? Math.min(1, plan.ingresso.quantidade / games) : 0;
            return clamp(Math.round((base + bonusCoberturaTemporada * share) * 1e6) / 1e6, 0, 1);
        }
        return clamp(base, 0, 1);
    }

    function getTicketBenefit(plan, answers) {
        const tipo = plan.ingresso.tipo;
        const discount = getDiscount(plan, answers);
        return {
            tipo,
            quantidade: plan.ingresso.quantidade,
            setores: plan.ingresso.setores.slice(),
            setorTexto: plan.ingresso.setorTexto,
            desconto: discount,
            nivel: resolveLevel(plan, answers),
            text: tipo === 'desconto' ? describeDiscountTicket(plan, discount) : (TICKET_TEXTS[tipo] ?? TICKET_TEXTS.semBeneficio),
            score: getTicketUtility(plan, discount, answers)
        };
    }

    // Valores independentes do catálogo; ADR-0001 exclui totais de uso e primeiro mês.
    function getPlanPricing(plan) {
        return {
            subscription: plan.contratacao.precoMensalEquivalente,
            adhesion: plan.contratacao.taxaAdesao,
            kidsUnitPrice: plan.opcionais.kids.disponivel ? plan.opcionais.kids.precoMensal : null
        };
    }

    function getPlanContract(plan) {
        const c = plan.contratacao;
        // Sempre exibe apenas o valor mensal de referência; nunca exibe
        // valor anual nem parcelamento, independentemente da modalidade.
        return {
            modalidade: c.modalidadePrincipal,
            priceText: `${formatBRL(c.precoMensalEquivalente)} / mês`,
            totalText: 'Valor mensal de referência',
            detail: 'Valor mensal de referência para comparação e orçamento'
        };
    }

    function formatBRL(value) {
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function getPlanBenefits(plan, answers) {
        const ticket = getTicketBenefit(plan, answers);
        const priority = getPriority(plan, answers);
        const benefits = [ticket.text];

        if (priority.garantido) {
            benefits.push('Ingresso direto na sua conta, com o plano ativo e em dia');
        } else {
            benefits.push(describePriority(priority));
        }

        benefits.push(describeStoreDiscount(plan));

        if (plan.conteudoExclusivo && plan.votacao) {
            benefits.push('Acesse conteúdo exclusivo, quiz e votações online');
        } else if (plan.conteudoExclusivo) {
            benefits.push('Acesse conteúdo exclusivo');
        }

        if (plan.opcionais.kids.disponivel) {
            benefits.push(`Kids opcional: ${formatBRL(plan.opcionais.kids.precoMensal)}/mês por criança · até ${plan.opcionais.kids.maxCriancas} menores de ${plan.opcionais.kids.idadeMaxima} anos`);
        }

        // Carteirinha não entra nos benefícios: quase todos os planos a incluem,
        // então o texto não diferencia a escolha (ADR de catálogo 2026-10-28).
        if (ticket.nivel && ticket.nivel.origem === 'inicial') {
            benefits.push('Já é sócio? Confira na sua conta se seu nível e desconto são maiores.');
        }

        return benefits;
    }

    /*
     * Texto da prioridade de compra para o card: a prioridade 1 é a mais alta.
     * Nos planos com níveis, o nível vem do histórico informado (ou é o
     * inicial, quando o histórico não foi confirmado).
     */
    function describePriority(priority) {
        const where = priority.nivel ? ` · nível ${priority.nivel}` : '';
        return priority.value === 1
            ? `Compre ingressos com prioridade 1, a mais alta${where}`
            : `Prioridade ${priority.value} para comprar ingressos (1 é a mais alta)${where}`;
    }

    // Apresenta o desconto da loja como economia, preservando o limite "até".
    function describeStoreDiscount(plan) {
        const text = plan.loja.texto || '';
        return /^até\s/i.test(text) ? `Economize ${lowerFirst(text)}` : text;
    }

    /*
     * O CTA de cada plano nomeia o benefício principal. No Cabuloso o desconto
     * depende do nível, então o percentual vem do benefício calculado para as
     * respostas (ou do nível inicial, sem respostas).
     */
    function getCTAText(plan, answers) {
        if (answers && buildUserProfile(answers).frecuencia === 0) {
            return answers.wantsStoreDiscount !== false
                ? `Quero até ${Math.round(plan.loja.percentual * 100)}% na loja` : 'Quero ser sócio';
        }
        if (plan.slug === 'cabuloso') {
            const discount = answers ? getDiscount(plan, answers) : plan.ingresso.niveis?.[0]?.desconto;
            const percent = Math.round((discount || 0) * 100);
            return percent > 0 ? `Quero ${percent}% de desconto` : 'Quero ser Cabuloso';
        }
        const ctas = {
            'meu-cruzeiro': 'Quero ser sócio',
            'time-do-povo': 'Quero ingresso popular',
            'cabuloso-max': 'Quero 65% de desconto'
        };
        return ctas[plan.slug] || 'Assinar agora';
    }

    const COMPONENT_KEYS = ['ticket', 'priority', 'sector', 'discount', 'experiences', 'family'];

    /*
     * Pesos: o quanto cada componente importa para esta pessoa. Dependem só do
     * perfil. Sem uso presencial declarado, ingresso, prioridade e setor têm
     * peso zero e não decidem a ordem.
     */
    function getComponentWeights(profile, answers) {
        const hasFamily = profile.adultos > 0 || profile.kids > 0;
        const attendance = profile.frecuencia === 0 ? 0
            : ranking.presenca.base + ranking.presenca.escala * (profile.frecuencia / 10);
        const priorityShare = profile.prioridad / 10;
        return {
            ticket: attendance * (ranking.ticket.base + ranking.ticket.bonusPrioridade * priorityShare),
            priority: attendance * (ranking.priority.base + ranking.priority.escala * priorityShare),
            sector: attendance * ranking.sector.comPreferencia,
            discount: answers.wantsStoreDiscount === false ? 0 : ranking.discount.base + ranking.discount.escala * (profile.descuentos / 10),
            experiences: ranking.experiences.base + ranking.experiences.escala * (profile.experiencias / 10),
            family: hasFamily ? ranking.family.comFamilia : ranking.family.semFamilia
        };
    }

    /*
     * Valores: o quanto o plano entrega em cada componente, entre 0 e 1.
     * Dependem do catálogo, do setor preferido, do volume de jogos declarado
     * (ingresso por temporada) e da capacidade para a família.
     */
    function getComponentValues(plan, profile, sectorFit, ticket, priority) {
        const coverageKey = sectorFit.level;
        const hasFamily = profile.adultos > 0 || profile.kids > 0;

        // Ingresso perde valor quando o benefício não cobre o setor de preferência.
        let ticketValue = ticket.score * ranking.ticket.cobertura[coverageKey];
        if (profile.adultos > 0 && plan.ingresso.quantidade >= 2) {
            ticketValue = Math.min(1, ticketValue + ranking.ticket.bonusAcompanhante);
        }

        // A capacidade de ingressos só vale com uso presencial; sem ele, os
        // planos não se distinguem pela quantidade de ingressos que ninguém usa.
        let familyValue = ranking.family.base;
        if (hasFamily) {
            const ticketCapacity = profile.frecuencia > 0 ? Math.min(1, plan.ingresso.quantidade / (1 + profile.adultos)) : 1;
            const kidsSupport = plan.opcionais.kids.disponivel ? 1 : 0;
            familyValue = ranking.family.capacidade * ticketCapacity + ranking.family.kids * kidsSupport;
        }

        return {
            ticket: ticketValue,
            priority: priority.garantido ? 1 : clamp((ranking.priority.pior - priority.value) / ranking.priority.intervalo, 0, 1),
            sector: ranking.sector.cobertura[coverageKey],
            discount: clamp(plan.loja.percentual / ranking.discount.referencia, 0, 1),
            experiences: plan.conteudoExclusivo && plan.votacao ? ranking.experiences.ambos
                : (plan.conteudoExclusivo || plan.votacao ? ranking.experiences.um : ranking.experiences.nenhum),
            family: familyValue
        };
    }

    /** Índice de afinidade: média dos valores ponderada pelos pesos, × 100, uma casa decimal. */
    function scorePlan(plan, profile, answers, sectorFit) {
        const ticket = getTicketBenefit(plan, answers);
        const priority = getPriority(plan, answers);
        const weights = getComponentWeights(profile, answers);
        const values = getComponentValues(plan, profile, sectorFit, ticket, priority);
        const components = COMPONENT_KEYS.map((key) => ({ key, weight: weights[key], value: values[key] }));

        const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
        if (!Number.isFinite(totalWeight) || totalWeight <= 0) throw new Error('Os pesos precisam produzir soma positiva.');
        const score = components.reduce((sum, item) => sum + item.weight * item.value, 0) / totalWeight * 100;

        return { score: Math.round(score * 10) / 10, components, ticket, priority };
    }

    function lowerFirst(text) {
        if (!text) return '';
        return text.charAt(0).toLowerCase() + text.slice(1);
    }

    function buildReasons(result, answers, profile) {
        const reasons = [];
        const ticket = result.ticket;
        const plan = result.plan;

        if (profile.frecuencia > 0 && result.sectorFit.level === 'none') {
            reasons.push({
                tone: 'warning',
                text: `Seu setor preferido é ${result.sectorFit.label}. O benefício de ingresso vale para ${plan.ingresso.setorTexto}.`
            });
        } else if (profile.frecuencia > 0 && result.sectorFit.level === 'partial') {
            reasons.push({
                tone: 'warning',
                text: `Cobertura parcial do seu setor: ${result.sectorFit.text}`
            });
        }

        if (profile.frecuencia > 0) {
            reasons.push({
                tone: 'positive',
                text: `Para ${answers.gamesPerYear} ${answers.gamesPerYear === 1 ? 'jogo' : 'jogos'} por ano: ${lowerFirst(ticket.text)}${ticket.text.endsWith('.') ? '' : '.'}`
            });
        } else {
            reasons.push({
                tone: 'neutral',
                text: 'Como você não pretende ir ao estádio, os benefícios de ingresso não influenciaram a escolha.'
            });
        }

        if (profile.frecuencia > 0 && result.priority.garantido) {
            reasons.push({
                tone: 'positive',
                text: `Ingresso garantido em ${plan.ingresso.setorTexto}, sem disputar a abertura das vendas.`
            });
        } else if (profile.frecuencia > 0 && profile.prioridad >= 6) {
            reasons.push({
                tone: 'positive',
                text: `Para comprar ingressos: prioridade ${result.priority.value} (1 é a mais alta).`
            });
        }

        if (profile.descuentos >= 6 && plan.loja.percentual > 0) {
            reasons.push({
                tone: 'positive',
                text: `${describeStoreDiscount(plan)}.`
            });
        }

        if (profile.experiencias >= 6 && plan.conteudoExclusivo && plan.votacao) {
            reasons.push({
                tone: 'positive',
                text: 'Participe de quiz e votações online e acesse conteúdo exclusivo do clube.'
            });
        }

        if (profile.frecuencia > 0 && profile.adultos > 0) {
            const coverage = plan.ingresso.quantidade >= 2
                ? 'benefício em até 2 ingressos, para você e seu acompanhante'
                : 'benefício em 1 ingresso; acompanhante paga à parte';
            reasons.push({
                tone: 'neutral',
                text: `Para ir com companhia: ${coverage}.${profile.kids > 0 ? ` Kids opcional: ${formatBRL(plan.opcionais.kids.precoMensal)}/mês por criança.` : ''}`
            });
        }

        const priceReason = {
            tone: 'neutral',
            text: `Assinatura: ${formatBRL(result.pricing.subscription)}/mês (referência). ${result.pricing.adhesion ? 'Taxa de adesão e opcionais à parte.' : 'Sem taxa de adesão; opcionais à parte.'}`
        };

        const warnings = reasons.filter((reason) => reason.tone === 'warning');
        const positives = reasons.filter((reason) => reason.tone === 'positive');
        const familyReason = reasons.find((reason) => reason.tone === 'neutral');

        return [...warnings, ...positives.slice(0, 2), familyReason, priceReason]
            .filter(Boolean)
            .slice(0, 5)
            .map((reason) => reason.text);
    }

    /*
     * Ordem: maior afinidade com os benefícios; em empate, slug. Preço só
     * filtra elegibilidade e não interfere na pontuação nem no desempate.
     */
    function compareRanked(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.profileFit || 0) !== (a.profileFit || 0)) return (b.profileFit || 0) - (a.profileFit || 0);
        return a.plan.slug < b.plan.slug ? -1 : a.plan.slug > b.plan.slug ? 1 : 0;
    }

    function recommendPlans(answers, catalog = plans) {
        const profile = buildUserProfile(answers);
        const budget = Number.isFinite(answers.budget) ? answers.budget : null;

        if (!Array.isArray(catalog) || !catalog.length) throw new Error('O catálogo precisa conter planos.');
        const scored = catalog.map((plan, index) => {
            const pricing = getPlanPricing(plan);
            const sectorFit = getSectorFit(plan, answers);
            return {
                plan,
                index,
                pricing,
                sectorFit,
                eligibility: {
                    withinBudget: budget === null || plan.contratacao.precoMensalEquivalente <= budget,
                    budget
                }
            };
        });

        const evaluated = scored.map((item) => {
            const scoredPlan = scorePlan(item.plan, profile, answers, item.sectorFit);
            return {
                ...item,
                ...scoredPlan,
                // Sem uso presencial, escolhe o produto voltado ao interesse declarado.
                // O preço continua restrito à elegibilidade, inclusive no desempate.
                profileFit: profile.frecuencia === 0 ? Number(answers.wantsStoreDiscount === false
                    ? item.plan.ingresso.periodicidade === 'temporada'
                    : item.plan.ingresso.tipo === 'desconto' && item.plan.ingresso.quantidade === 1) : 0
            };
        });

        const eligible = evaluated
            .filter((item) => item.eligibility.withinBudget)
            .sort(compareRanked);

        const allSorted = evaluated.slice().sort(compareRanked);

        const recommendations = eligible.slice(0, 3).map((item, rank) => ({
            ...item,
            rank,
            reasons: buildReasons(item, answers, profile)
        }));

        const winner = eligible.length ? recommendations[0] : null;
        const runnerUp = eligible.length > 1 ? recommendations[1] : null;
        const closeCall = false;
        const recommendationReason = !winner ? '' : profile.frecuencia === 0
            ? answers.wantsStoreDiscount === false
                ? 'Seu foco é apoiar o clube, sem uso de ingressos ou descontos na loja. O plano de apoio atende a esse perfil.'
                : 'Seu interesse está nos produtos oficiais. A recomendação considera o desconto na loja dentro do seu orçamento.'
            : profile.adultos > 0 && winner.plan.ingresso.quantidade >= 2
                ? 'Você costuma ir acompanhado. Este plano oferece benefício para o seu ingresso e o do acompanhante.'
                : `Para sua frequência de ${answers.gamesPerYear} jogos por ano, este plano reúne a melhor combinação de ingresso, setor e prioridade dentro do seu orçamento.`;
        const allPlansFit = evaluated.every((item) => item.eligibility.withinBudget);

        const sectorAlternative = profile.frecuencia > 0 && winner && winner.sectorFit.level !== 'full'
            ? eligible.find((item) => item.sectorFit.level === 'full' && item.plan.slug !== winner.plan.slug) || null
            : null;

        const closest = allSorted[0];

        return {
            profile,
            catalogVersion: CATALOG_VERSION,
            rulesVersion: RULES_VERSION,
            assumptions: ASSUMPTIONS,
            budget,
            eligible,
            all: allSorted,
            recommendations,
            winner,
            runnerUp,
            closeCall,
            recommendationReason,
            allPlansFit,
            noEligible: !winner,
            closest,
            cheapest: evaluated.slice().sort((a, b) => a.pricing.subscription - b.pricing.subscription || compareRanked(a, b))[0],
            sectorAlternative,
            sectorAlternativeRecommendation: sectorAlternative
                ? {
                    ...sectorAlternative,
                    reasons: buildReasons(sectorAlternative, answers, profile)
                }
                : null
        };
    }

    return {
        CATALOG_VERSION,
        CATALOG_CONSULTED_AT,
        RULES_VERSION,
        CATALOG_SOURCE,
        ASSUMPTIONS,
        SECTOR_GROUPS,
        SECTOR_LABELS,
        assinaturasSocios,
        plans,
        questions,
        QUESTION_BY_KEY,
        ATTRIBUTE_LABELS,
        createInitialAnswers,
        isAnswerValid,
        getAnswerError,
        validateAnswers,
        detectConflicts,
        buildUserProfile,
        getSectorFit,
        resolveLevel,
        getDiscount,
        getPriority,
        getTicketBenefit,
        getPlanPricing,
        getPlanContract,
        getPlanBenefits,
        getCTAText,
        formatBRL,
        recommendPlans
    };
}
