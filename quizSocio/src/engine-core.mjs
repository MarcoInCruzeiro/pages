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
                ? 'Escolha uma quantidade de jogos ou marque “Não sei / novo sócio”.'
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
    const PRICE_IMPORTANCE_BY_BUDGET = perfil.importanciaPreco;

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
        if (answers.digitalExperience === true) experiencias += perfil.experiencias.bonusDigital;

        const descuentos = answers.wantsStoreDiscount === true ? perfil.descuentos.true : answers.wantsStoreDiscount === false ? perfil.descuentos.false : perfil.descuentos.padrao;
        const productos = descuentos;

        return {
            frecuencia: clamp(frecuencia, 0, 10),
            prioridad: clamp(prioridad, 0, 10),
            experiencias: clamp(experiencias, 0, 10),
            descuentos: clamp(descuentos, 0, 10),
            productos: clamp(productos, 0, 10),
            importanciaPreco: PRICE_IMPORTANCE_BY_BUDGET[answers.budget] ?? perfil.frecuencia.padrao,
            adultos: answers.buysTwoTickets === true ? perfil.adultos.true : perfil.adultos.false,
            kids: answers.kidsCount === true ? 1 : (Number.isInteger(answers.kidsCount) ? clamp(answers.kidsCount, 0, perfil.kids.max) : 0),
            setorPreferido: answers.preferredSector || null
        };
    }

    function getSectorFit(plan, answers) {
        const pref = answers.preferredSector;
        if (!pref || !SECTOR_GROUPS[pref]) {
            return {
                level: 'not-preferred',
                label: 'Sem preferência de setor',
                matched: [],
                missing: [],
                text: 'Você não informou uma preferência de setor.'
            };
        }

        const group = SECTOR_GROUPS[pref];
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
                label: `Prioridade ${config ? config.prioridade : 4} (nível ${level.nivel})`
            };
        }
        return {
            value: plan.prioridade,
            garantido: false,
            label: `Prioridade ${plan.prioridade}`
        };
    }

    function getTicketBenefit(plan, answers) {
        const level = resolveLevel(plan, answers);
        const discount = getDiscount(plan, answers);
        const price = ASSUMPTIONS.precoIngressoCheio;
        let text;
        let score;

        if (plan.ingresso.tipo === 'gratuito') {
            text = '1 ingresso gratuito por temporada, mediante disponibilidade';
            // Um ingresso por temporada não equivale a desconto em todos os jogos.
            score = ranking.ticket.utilidades.gratuito;
        } else if (plan.ingresso.tipo === 'popular') {
            text = '1 ingresso popular, pelo menor valor online da arquibancada, mediante disponibilidade';
            score = ranking.ticket.utilidades.popular;
        } else if (plan.ingresso.tipo === 'garantido') {
            text = '1 ingresso garantido por jogo no Sicoob — Leste Inferior, temporada 2026';
            score = ranking.ticket.utilidades.garantido;
        } else if (plan.ingresso.tipo === 'desconto') {
            const discountText = Math.round((discount || 0) * 100);
            const example = (price * (1 - (discount || 0))).toFixed(2).replace('.', ',');
            const quantityText = plan.ingresso.quantidade > 1 ? `Até ${plan.ingresso.quantidade} ingressos` : '1 ingresso';
            text = `${quantityText} com ${discountText}% de desconto (ex.: R$ 150 por R$ ${example}), mediante disponibilidade`;
            // A utilidade representa o tipo de benefício; o percentual é exibido
            // no ingresso, separado do valor de assinatura (ADR-0001).
            score = ranking.ticket.utilidades.desconto;
        } else {
            text = 'Não inclui benefício de ingresso';
            score = ranking.ticket.utilidades.semBeneficio;
        }

        return {
            tipo: plan.ingresso.tipo,
            quantidade: plan.ingresso.quantidade,
            setores: plan.ingresso.setores.slice(),
            setorTexto: plan.ingresso.setorTexto,
            desconto: discount,
            nivel: level,
            text,
            score: clamp(score, 0, 1)
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
            benefits.push('Ingresso carregado automaticamente na conta do titular, com plano ativo e adimplente');
        } else {
            benefits.push(priority.label + ' na compra de ingressos');
        }

        benefits.push(plan.loja.texto);

        if (plan.conteudoExclusivo && plan.votacao) {
            benefits.push('Conteúdo exclusivo, quiz e votações online');
        } else if (plan.conteudoExclusivo) {
            benefits.push('Conteúdo exclusivo');
        }

        if (plan.opcionais.kids.disponivel) {
            benefits.push(`Opcional Kids: ${formatBRL(plan.opcionais.kids.precoMensal)}/mês por criança, até ${plan.opcionais.kids.maxCriancas} menores de ${plan.opcionais.kids.idadeMaxima} anos`);
        }

        // Carteirinha não entra nos benefícios: quase todos os planos a incluem,
        // então o texto não diferencia a escolha (ADR de catálogo 2026-10-28).
        if (ticket.nivel && ticket.nivel.origem === 'inicial') {
            benefits.push('Já é sócio? Confira seu desconto atual na sua conta.');
        }

        return benefits;
    }

    function getCTAText(plan) {
        const ctas = {
            'meu-cruzeiro': 'FAZER PARTE DOS CABULOSOS',
            'time-do-povo': 'QUERO O INGRESSO POPULAR',
            cabuloso: 'GARANTIR MEU DESCONTO DE 50%',
            'cabuloso-max': 'ATÉ 2 INGRESSOS COM 65%OFF'
        };
        return ctas[plan.slug] || 'ASSINAR AGORA';
    }

    function scorePlan(plan, profile, answers, pricing, sectorFit, priceRange) {
        const ticket = getTicketBenefit(plan, answers);
        const priority = getPriority(plan, answers);

        // Ingresso: perde valor quando a pessoa não pretende ir ao estádio e
        // quando o benefício não cobre o setor de preferência.
        const coverageKey = sectorFit.level === 'not-preferred' ? 'notPreferred' : sectorFit.level;
        const sectorMultiplier = ranking.ticket.cobertura[coverageKey];
        let ticketComponent = ticket.score * sectorMultiplier;
        if (profile.adultos > 0 && plan.ingresso.quantidade >= 2) {
            ticketComponent = Math.min(1, ticketComponent + ranking.ticket.bonusAcompanhante);
        }
        const priorityComponent = priority.garantido ? 1 : clamp((ranking.priority.pior - priority.value) / ranking.priority.intervalo, 0, 1);
        const sectorComponent = ranking.sector.cobertura[coverageKey];
        const discountComponent = clamp(plan.loja.percentual / ranking.discount.referencia, 0, 1);
        const experienceComponent = plan.conteudoExclusivo && plan.votacao
            ? ranking.experiences.ambos
            : (plan.conteudoExclusivo || plan.votacao ? ranking.experiences.um : ranking.experiences.nenhum);
        let familyComponent = ranking.family.base;
        if (profile.adultos > 0 || profile.kids > 0) {
            const needed = 1 + profile.adultos;
            const ticketCapacity = Math.min(1, plan.ingresso.quantidade / needed);
            const kidsSupport = plan.opcionais.kids.disponivel ? 1 : 0;
            familyComponent = ranking.family.capacidade * ticketCapacity + ranking.family.kids * kidsSupport;
        }
        const priceComponent = priceRange.max === priceRange.min
            ? 1
            : clamp(1 - (pricing.subscription - priceRange.min) / (priceRange.max - priceRange.min), 0, 1);
        const attendanceWeight = ranking.presenca.base + ranking.presenca.escala * (profile.frecuencia / 10);
        const ticketWeight = attendanceWeight * (ranking.ticket.base + ranking.ticket.bonusPrioridade * (profile.prioridad / 10));
        const priorityWeight = attendanceWeight * (ranking.priority.base + ranking.priority.escala * (profile.prioridad / 10));
        const sectorWeight = (answers.preferredSector ? ranking.sector.comPreferencia : ranking.sector.semPreferencia) * attendanceWeight;
        const discountWeight = ranking.discount.base + ranking.discount.escala * (profile.descuentos / 10);
        const experienceWeight = ranking.experiences.base + ranking.experiences.escala * (profile.experiencias / 10);
        const familyWeight = (profile.adultos > 0 || profile.kids > 0) ? ranking.family.comFamilia : ranking.family.semFamilia;
        // ADR-0001: somente a assinatura participa do componente financeiro.
        const priceWeight = ranking.price.base + ranking.price.escala * (profile.importanciaPreco / 10);

        const components = [
            { key: 'ticket', weight: ticketWeight, value: ticketComponent },
            { key: 'priority', weight: priorityWeight, value: priorityComponent },
            { key: 'sector', weight: sectorWeight, value: sectorComponent },
            { key: 'discount', weight: discountWeight, value: discountComponent },
            { key: 'experiences', weight: experienceWeight, value: experienceComponent },
            { key: 'family', weight: familyWeight, value: familyComponent },
            { key: 'price', weight: priceWeight, value: priceComponent }
        ];

        const totalWeight = components.reduce((sum, item) => sum + item.weight, 0);
        if (!Number.isFinite(totalWeight) || totalWeight <= 0) throw new Error('Os pesos precisam produzir soma positiva.');
        const score = components.reduce((sum, item) => sum + item.weight * item.value, 0) / totalWeight * 100;

        return {
            score: Math.round(score * 10) / 10,
            components,
            ticket,
            priority
        };
    }

    function lowerFirst(text) {
        if (!text) return '';
        return text.charAt(0).toLowerCase() + text.slice(1);
    }

    function buildReasons(result, answers, profile) {
        const reasons = [];
        const ticket = result.ticket;
        const plan = result.plan;

        if (result.sectorFit.level === 'none') {
            reasons.push({
                tone: 'warning',
                text: `Seu setor preferido é ${result.sectorFit.label}, mas ${plan.nome} oferece ingresso em ${plan.ingresso.setorTexto}.`
            });
        } else if (result.sectorFit.level === 'partial') {
            reasons.push({
                tone: 'warning',
                text: `${plan.nome} cobre apenas parte do setor ${result.sectorFit.label}: ${result.sectorFit.text}`
            });
        }

        if (profile.frecuencia > 0) {
            reasons.push({
                tone: 'positive',
                text: `Você pretende ir a ${answers.gamesPerYear} jogos por ano. ${plan.nome} oferece ${lowerFirst(ticket.text)}.`
            });
        } else {
            reasons.push({
                tone: 'neutral',
                text: 'Você indicou que não pretende ir ao estádio. Por isso, o benefício de ingresso pesa pouco na sua recomendação.'
            });
        }

        if (result.priority.garantido) {
            reasons.push({
                tone: 'positive',
                text: `${plan.nome} oferece ingresso garantido em ${plan.ingresso.setorTexto}, sem depender da janela de prioridade.`
            });
        } else if (profile.prioridad >= 6) {
            reasons.push({
                tone: 'positive',
                text: `Você prefere comprar no primeiro minuto; ${plan.nome} tem ${result.priority.label.toLowerCase()}.`
            });
        }

        if (profile.descuentos >= 6 && plan.loja.percentual > 0) {
            reasons.push({
                tone: 'positive',
                text: `Você valoriza produtos oficiais; ${plan.nome} oferece ${lowerFirst(plan.loja.texto)}.`
            });
        }

        if (profile.experiencias >= 6 && plan.conteudoExclusivo && plan.votacao) {
            reasons.push({
                tone: 'positive',
                text: 'Você se interessa por experiências; o plano inclui conteúdo exclusivo, quiz e votações online.'
            });
        }

        if (profile.adultos > 0) {
            const coverage = plan.ingresso.quantidade >= 2
                ? 'cobre até 2 ingressos'
                : 'cobre 1 ingresso; o acompanhante paga o valor de referência';
            reasons.push({
                tone: 'neutral',
                text: `Você costuma ir acompanhado. ${plan.nome} ${coverage}${profile.kids > 0 ? `, e o Kids custa ${formatBRL(plan.opcionais.kids.precoMensal)}/mês por criança` : ''}.`
            });
        }

        const priceReason = {
            tone: 'neutral',
            text: `Assinatura: ${formatBRL(result.pricing.subscription)}/mês de referência. Taxas e opcionais são informados separadamente.`
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
     * Ordem: maior índice; em empate, menor assinatura; depois slug. A ordem do
     * catálogo recebido não influencia o resultado.
     */
    function compareRanked(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (a.pricing.subscription !== b.pricing.subscription) return a.pricing.subscription - b.pricing.subscription;
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

        const priceRange = {
            min: Math.min(...scored.map((item) => item.pricing.subscription)),
            max: Math.max(...scored.map((item) => item.pricing.subscription))
        };

        const evaluated = scored.map((item) => {
            const scoredPlan = scorePlan(item.plan, profile, answers, item.pricing, item.sectorFit, priceRange);
            return {
                ...item,
                ...scoredPlan
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
        const closeCall = Boolean(winner && runnerUp && (winner.score - runnerUp.score) < 1);
        const allPlansFit = evaluated.every((item) => item.eligibility.withinBudget);

        const sectorAlternative = winner && winner.sectorFit.level !== 'full'
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
