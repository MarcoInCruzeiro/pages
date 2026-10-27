/*
 * Motor do Quiz Sócio 5 Estrelas.
 *
 * Este arquivo concentra catálogo, perguntas, validação e ranking. Não acessa
 * DOM, analytics ou estado global: recebe respostas e devolve resultados, para
 * que a interface e os testes usem exatamente as mesmas regras.
 *
 * Fonte comercial única: catalogo-comercial.md (regulamento publicado em
 * 11/09/2026, consultado em 26/10/2026). Campos sem confirmação ficam em
 * `camposPendentes` e não são usados para recomendar.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.QuizEngine = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const CATALOG_VERSION = '2026-09-11';
    const CATALOG_CONSULTED_AT = '2026-10-26';
    // Versão das regras de perfil, custo e ranking; mude ao alterar o cálculo.
    const RULES_VERSION = '2026-10-26.2';

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

    const assinaturasSocios = {
        meuCruzeiro: {
            id: 21,
            nome: 'Meu Cruzeiro',
            slug: 'meu-cruzeiro',
            logo: './img/meuCruzeiro.png',
            contratacao: {
                modalidadePrincipal: 'mensal',
                modalidades: ['semestral', 'anual'],
                precoMensal: 12,
                precoMensalEquivalente: 12,
                valorTotal: null,
                parcelas: 1,
                valorParcela: 12,
                taxaAdesao: 0,
                vigenciaMeses: 12,
                link: 'https://socio.cruzeiro.com.br/complementos?plano_id=21&tipo=contrato&intervalo_cobrancas=anual&utm_source=quiz_socio&utm_medium=site&utm_campaign=quiz_socio_5_estrelas&utm_content=plano-meu-cruzeiro'
            },
            ingresso: {
                tipo: 'gratuito',
                quantidade: 1,
                setores: POPULAR_SECTORS.slice(),
                setorTexto: 'Amarelo (inferior ou superior) ou Laranja (inferior ou superior)',
                niveis: null,
                descontoFixo: null,
                periodicidade: 'temporada',
                detalhes: '1 ingresso gratuito por temporada, mediante disponibilidade'
            },
            prioridade: 4,
            garantiaIngresso: false,
            loja: { percentual: 0.10, texto: 'Até 10% em produtos e serviços oficiais' },
            conteudoExclusivo: true,
            votacao: true,
            opcionais: {
                kids: { disponivel: true, precoMensal: 30, maxCriancas: 3, idadeMaxima: 12, ingressoIncluido: true },
                carteirinhaFisica: { situacao: 'opcional', preco: 30 },
                pcd: false
            },
            camposPendentes: ['descontoEmParceiros']
        },
        timeDoPovo: {
            id: 34,
            nome: 'Time do Povo',
            slug: 'time-do-povo',
            logo: './img/timeDoPovo.png',
            contratacao: {
                modalidadePrincipal: 'mensal',
                modalidades: ['semestral', 'anual'],
                precoMensal: 40,
                precoMensalEquivalente: 40,
                valorTotal: null,
                parcelas: 1,
                valorParcela: 40,
                taxaAdesao: 30,
                vigenciaMeses: 12,
                link: 'https://socio.cruzeiro.com.br/assinar/checkout?plano_id=34&intervalo_cobrancas=anual&assinatura_id=&tipo=contrato&utm_source=quiz_socio&utm_medium=site&utm_campaign=quiz_socio_5_estrelas&utm_content=plano-time-do-povo'
            },
            ingresso: {
                tipo: 'popular',
                quantidade: 1,
                setores: POPULAR_SECTORS.slice(),
                setorTexto: 'Amarelo (inferior ou superior) ou Laranja (inferior ou superior)',
                niveis: null,
                descontoFixo: null,
                periodicidade: 'por-jogo',
                detalhes: '1 ingresso popular — menor valor de venda online da arquibancada — mediante disponibilidade'
            },
            prioridade: 4,
            garantiaIngresso: false,
            loja: { percentual: 0.10, texto: 'Até 10% em produtos e serviços oficiais' },
            conteudoExclusivo: true,
            votacao: true,
            opcionais: {
                kids: { disponivel: true, precoMensal: 30, maxCriancas: 3, idadeMaxima: 12, ingressoIncluido: true },
                carteirinhaFisica: { situacao: 'incluida', preco: 0 },
                pcd: false
            },
            camposPendentes: ['descontoEmParceiros']
        },
        cabuloso: {
            id: 10,
            nome: 'Cabuloso',
            slug: 'cabuloso',
            logo: './img/cabuloso.png',
            contratacao: {
                modalidadePrincipal: 'mensal',
                modalidades: ['semestral', 'anual'],
                precoMensal: 100,
                precoMensalEquivalente: 100,
                valorTotal: null,
                parcelas: 1,
                valorParcela: 100,
                taxaAdesao: 30,
                vigenciaMeses: 12,
                link: 'https://socio.cruzeiro.com.br/assinar/checkout?plano_id=10&intervalo_cobrancas=anual&assinatura_id=&tipo=contrato&utm_source=quiz_socio&utm_medium=site&utm_campaign=quiz_socio_5_estrelas&utm_content=plano-cabuloso'
            },
            ingresso: {
                tipo: 'desconto',
                quantidade: 1,
                setores: [
                    'amarelo-inferior', 'amarelo-superior',
                    'laranja-inferior', 'laranja-superior',
                    'sicoob-inferior', 'sicoob-superior',
                    'roxo-superior'
                ],
                setorTexto: 'Amarelo, Laranja, Sicoob (Leste) e Roxo Superior',
                niveis: [
                    { nivel: 1, jogosMinimos: 0, jogosMaximos: 9, prioridade: 3, desconto: 0.50 },
                    { nivel: 2, jogosMinimos: 10, jogosMaximos: 19, prioridade: 2, desconto: 0.55 },
                    { nivel: 3, jogosMinimos: 20, jogosMaximos: null, prioridade: 1, desconto: 0.60 }
                ],
                descontoFixo: null,
                periodicidade: 'por-jogo',
                detalhes: '1 ingresso com desconto progressivo de 50% a 60%, conforme histórico de 15 meses'
            },
            prioridade: null,
            garantiaIngresso: false,
            loja: { percentual: 0.15, texto: 'Até 15% em produtos e serviços oficiais' },
            conteudoExclusivo: true,
            votacao: true,
            opcionais: {
                kids: { disponivel: true, precoMensal: 30, maxCriancas: 3, idadeMaxima: 12, ingressoIncluido: true },
                carteirinhaFisica: { situacao: 'incluida', preco: 0 },
                pcd: true
            },
            camposPendentes: ['descontoEmParceiros']
        },
        cabulosoMax: {
            id: 11,
            nome: 'Cabuloso Max',
            slug: 'cabuloso-max',
            logo: './img/cabulosoMax.png',
            contratacao: {
                modalidadePrincipal: 'mensal',
                modalidades: ['semestral', 'anual'],
                precoMensal: 200,
                precoMensalEquivalente: 200,
                valorTotal: null,
                parcelas: 1,
                valorParcela: 200,
                taxaAdesao: 30,
                vigenciaMeses: 12,
                link: 'https://socio.cruzeiro.com.br/assinar/checkout?plano_id=11&intervalo_cobrancas=anual&assinatura_id=&tipo=contrato&utm_source=quiz_socio&utm_medium=site&utm_campaign=quiz_socio_5_estrelas&utm_content=plano-cabuloso-max'
            },
            ingresso: {
                tipo: 'desconto',
                quantidade: 2,
                setores: [
                    'amarelo-inferior', 'amarelo-superior',
                    'laranja-inferior', 'laranja-superior',
                    'sicoob-inferior', 'sicoob-superior',
                    'roxo-inferior', 'roxo-superior'
                ],
                setorTexto: 'Amarelo, Laranja, Sicoob (Leste) e Roxo (inferior e superior)',
                niveis: null,
                descontoFixo: 0.65,
                periodicidade: 'por-jogo',
                detalhes: 'Até 2 ingressos com 65% de desconto, mediante disponibilidade'
            },
            prioridade: 1,
            garantiaIngresso: false,
            loja: { percentual: 0.15, texto: 'Até 15% em produtos e serviços oficiais' },
            conteudoExclusivo: true,
            votacao: true,
            opcionais: {
                kids: { disponivel: true, precoMensal: 30, maxCriancas: 3, idadeMaxima: 12, ingressoIncluido: true },
                carteirinhaFisica: { situacao: 'incluida', preco: 0 },
                pcd: false
            },
            camposPendentes: ['descontoEmParceiros']
        },
        cabulosoCativo: {
            id: 115,
            nome: 'Cabuloso Cativo',
            slug: 'cabuloso-cativo',
            logo: 'https://baladapp.s3.sa-east-1.amazonaws.com/assinaturas/plano/115/foto/45e830abb42fdfb77e210002d5d7c311.png',
            contratacao: {
                modalidadePrincipal: 'anual',
                modalidades: ['anual'],
                precoMensal: null,
                precoMensalEquivalente: 400,
                valorTotal: 4800,
                parcelas: 12,
                valorParcela: 400,
                taxaAdesao: 0,
                vigenciaMeses: 12,
                link: 'https://socio.cruzeiro.com.br/assinar/checkout?plano_id=115&intervalo_cobrancas=anual&assinatura_id=&tipo=contrato&utm_source=quiz_socio&utm_medium=site&utm_campaign=quiz_socio_5_estrelas&utm_content=plano-cabuloso-cativo'
            },
            ingresso: {
                tipo: 'garantido',
                quantidade: 1,
                setores: ['sicoob-inferior'],
                setorTexto: 'Sicoob — Leste Inferior',
                niveis: null,
                descontoFixo: null,
                periodicidade: 'por-jogo',
                detalhes: '1 ingresso garantido por jogo no Sicoob — Leste Inferior, temporada 2026'
            },
            prioridade: null,
            garantiaIngresso: true,
            loja: { percentual: 0.10, texto: 'Até 10% em produtos e serviços oficiais' },
            conteudoExclusivo: true,
            votacao: true,
            opcionais: {
                kids: { disponivel: true, precoMensal: 30, maxCriancas: 3, idadeMaxima: 12, ingressoIncluido: true },
                carteirinhaFisica: { situacao: 'virtual', preco: 0 },
                pcd: false
            },
            camposPendentes: ['descontoEmParceiros', 'disponibilidadeCativo']
        }
    };

    const plans = Object.keys(assinaturasSocios).map((key) => assinaturasSocios[key]);

    const ATTRIBUTE_LABELS = {
        frecuencia: 'Frequência no estádio',
        prioridad: 'Prioridade na compra',
        experiencias: 'Experiências e conteúdo',
        descuentos: 'Descontos e loja',
        familia: 'Acompanhantes e Kids',
        precio: 'Custo para o seu perfil'
    };

    const questions = [
        {
            key: 'gamesPerYear',
            title: 'Em média, a quantos jogos do Cruzeiro você pretende ir por ano?',
            type: 'range',
            min: 0,
            max: 30,
            suffix: 'jogos',
            help: 'Frequência estimada'
        },
        {
            key: 'gamesHistory',
            title: 'Nos últimos 15 meses, a quantos jogos do Cruzeiro você foi no Mineirão?',
            type: 'range',
            min: 0,
            max: 30,
            suffix: 'jogos',
            allowUnknown: true,
            unknownLabel: 'Não sei ou sou novo sócio',
            help: 'Não lembra ou ainda não é sócio? Marque a opção abaixo para continuar.'
        },
        {
            key: 'wantsGuaranteedTicket',
            title: 'O que melhor te define como torcedor?',
            options: [
                {
                    label: 'Não frequento o estádio',
                    description: 'Não costumo frequentar os jogos presencialmente.',
                    value: 'never'
                },
                {
                    label: 'Faço questão de ir a todos os jogos',
                    description: 'Quero garantir meu lugar na arquibancada em todas as partidas possíveis.',
                    value: true
                },
                {
                    label: 'Foco nos jogos mais decisivos',
                    description: 'Prefiro guardar energia e orçamento para clássicos e fases finais.',
                    value: false
                }
            ]
        },
        {
            key: 'buysTwoTickets',
            title: 'Quando vai ao estádio, você costuma levar um acompanhante adulto?',
            options: [
                {
                    label: 'Sim, quase sempre vou acompanhado',
                    description: 'Preciso de facilidade para comprar dois ingressos juntos.',
                    value: true
                },
                {
                    label: 'Não, geralmente vou sozinho',
                    description: 'Compro apenas o meu ingresso.',
                    value: false
                }
            ]
        },
        {
            key: 'kidsCount',
            title: 'Quantas crianças menores de 12 anos você pretende incluir no plano?',
            options: [
                {
                    label: 'Nenhuma',
                    description: 'O plano será usado só por adultos.',
                    value: 0
                },
                {
                    label: '1 criança',
                    description: 'Quero incluir uma criança no Kids.',
                    value: 1
                },
                {
                    label: '2 crianças',
                    description: 'Quero incluir duas crianças no Kids.',
                    value: 2
                },
                {
                    label: '3 crianças',
                    description: 'Quero incluir três crianças no Kids.',
                    value: 3
                }
            ]
        },
        {
            key: 'needsPriority',
            title: 'Quando vai comprar ingressos para o jogo, como costuma agir?',
            options: [
                {
                    label: 'Compro no primeiro minuto',
                    description: 'Não gosto de correr riscos. Assim que abre, eu garanto o meu.',
                    value: true
                },
                {
                    label: 'Compro com calma',
                    description: 'Deixo para comprar depois, se ainda houver disponibilidade.',
                    value: false
                }
            ]
        },
        {
            key: 'wantsParticipation',
            title: 'Além dos jogos, o quanto você se interessa por experiências exclusivas?',
            options: [
                {
                    label: 'Tenho muito interesse',
                    description: 'Quero participar de sorteios, eventos do clube e receber ofertas especiais.',
                    value: true
                },
                {
                    label: 'Não faço questão',
                    description: 'Meu foco é apenas assistir aos jogos, sem extras.',
                    value: false
                }
            ]
        },
        {
            key: 'wantsStoreDiscount',
            title: 'Sempre que sai um novo manto ou produto oficial, o que você faz?',
            options: [
                {
                    label: 'Sempre tento comprar',
                    description: 'Gosto de colecionar ou renovar minhas camisas e busco descontos para isso.',
                    value: true
                },
                {
                    label: 'Raramente compro',
                    description: 'Não costumo consumir muitos produtos na loja oficial.',
                    value: false
                }
            ]
        },
        {
            key: 'gameFrequency',
            title: 'Como você costuma viver a paixão nos dias de jogo?',
            options: [
                {
                    label: 'Sempre na arquibancada',
                    description: 'O Mineirão é minha segunda casa.',
                    value: 'always'
                },
                {
                    label: 'Fico dividido entre estádio e TV',
                    description: 'Vou em boa parte dos jogos, mas assisto a outros de casa ou do bar.',
                    value: 'frequent'
                },
                {
                    label: 'Acompanho mais de casa mesmo',
                    description: 'Vou pouco ao estádio, prefiro acompanhar pelas transmissões.',
                    value: 'occasional'
                }
            ]
        },
        {
            key: 'digitalExperience',
            title: 'O quanto você consome os conteúdos digitais e de bastidores do clube?',
            options: [
                {
                    label: 'Acompanho tudo diariamente',
                    description: 'Valorizo o aplicativo oficial e quero acesso a informações em primeira mão.',
                    value: true
                },
                {
                    label: 'Foco apenas no campo',
                    description: 'Meu interesse principal são os 90 minutos de bola rolando.',
                    value: false
                }
            ]
        },
        {
            key: 'budget',
            title: 'Qual é o seu orçamento mensal confortável para investir no Sócio?',
            options: [
                {
                    label: 'Até R$ 40/mês',
                    description: 'Busco a opção com o menor custo e quero apoiar o Time.',
                    value: 40
                },
                {
                    label: 'Até R$ 100/mês',
                    description: 'Quero os benefícios dos planos intermediários com mais vantagens.',
                    value: 100
                },
                {
                    label: 'Até R$ 200/mês',
                    description: 'Tenho flexibilidade para investir em planos melhores com mais vantagens.',
                    value: 200
                },
                {
                    label: 'Sem limite definido',
                    description: 'Quero o plano mais completo e com a melhor experiência, independente do valor.',
                    value: 400
                }
            ]
        },
        {
            key: 'preferredSector',
            title: 'Em qual setor você se sente mais à vontade?',
            options: [
                {
                    label: 'Setor Amarelo ou Laranja',
                    description: 'Torcida organizada, muito canto e festa. Melhor custo-benefício.',
                    value: 'yellow-orange'
                },
                {
                    label: 'Setor Sicoob (Leste, antigo Azul)',
                    description: 'Visão central do campo, equilíbrio entre custo e conforto.',
                    value: 'blue'
                },
                {
                    label: 'Setor Roxo',
                    description: 'Cadeira premium, conforto máximo e experiência exclusiva.',
                    value: 'purple'
                }
            ]
        }
    ];

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

    const FREQUENCY_BY_PRESENCE = { never: 0, true: 9, false: 5 };
    const FREQUENCY_BY_DECLARATION = { always: 10, frequent: 7, occasional: 2 };
    const PRICE_IMPORTANCE_BY_BUDGET = { 40: 8, 100: 5, 200: 3, 400: 1 };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function buildUserProfile(answers) {
        const games = Number.isFinite(answers.gamesPerYear) ? answers.gamesPerYear : 0;
        const presence = answers.wantsGuaranteedTicket;
        const declaration = answers.gameFrequency;

        const volumeScore = (games / 30) * 10;
        const presenceScore = FREQUENCY_BY_PRESENCE[presence];
        const declarationScore = FREQUENCY_BY_DECLARATION[declaration];

        const parts = [];
        if (Number.isFinite(volumeScore)) parts.push({ value: volumeScore, weight: 0.4 });
        if (Number.isFinite(presenceScore)) parts.push({ value: presenceScore, weight: 0.3 });
        if (Number.isFinite(declarationScore)) parts.push({ value: declarationScore, weight: 0.3 });

        let frecuencia = 5;
        if (parts.length) {
            const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0);
            frecuencia = parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
        }
        // Regra explícita: quem não vai ao estádio (ou pretende ir a zero jogos)
        // não tem necessidade presencial, independentemente das demais respostas.
        if (presence === 'never' || games === 0) frecuencia = 0;

        const prioridad = answers.needsPriority === true ? 8 : answers.needsPriority === false ? 2 : 5;

        let experiencias = answers.wantsParticipation === true ? 8 : answers.wantsParticipation === false ? 1 : 5;
        // Conteúdo digital sustenta interesse em conteúdo/experiências; não
        // acrescenta frequência presencial nem consumo de produtos.
        if (answers.digitalExperience === true) experiencias += 2;

        const descuentos = answers.wantsStoreDiscount === true ? 8 : answers.wantsStoreDiscount === false ? 1 : 5;
        const productos = descuentos;

        return {
            frecuencia: clamp(frecuencia, 0, 10),
            prioridad: clamp(prioridad, 0, 10),
            experiencias: clamp(experiencias, 0, 10),
            descuentos: clamp(descuentos, 0, 10),
            productos: clamp(productos, 0, 10),
            importanciaPreco: PRICE_IMPORTANCE_BY_BUDGET[answers.budget] ?? 5,
            adultos: answers.buysTwoTickets === true ? 1 : 0,
            kids: Number.isInteger(answers.kidsCount) ? clamp(answers.kidsCount, 0, 3) : 0,
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
            score = 0.45;
        } else if (plan.ingresso.tipo === 'popular') {
            text = '1 ingresso popular, pelo menor valor online da arquibancada, mediante disponibilidade';
            score = 0.75;
        } else if (plan.ingresso.tipo === 'garantido') {
            text = '1 ingresso garantido por jogo no Sicoob — Leste Inferior, temporada 2026';
            score = 1.00;
        } else if (plan.ingresso.tipo === 'desconto') {
            const discountText = Math.round((discount || 0) * 100);
            const example = (price * (1 - (discount || 0))).toFixed(2).replace('.', ',');
            const quantityText = plan.ingresso.quantidade > 1 ? `Até ${plan.ingresso.quantidade} ingressos` : '1 ingresso';
            text = `${quantityText} com ${discountText}% de desconto (ex.: R$ 150 por R$ ${example}), mediante disponibilidade`;
            // A utilidade representa o tipo de benefício; o percentual é exibido
            // no ingresso, separado do valor de assinatura (ADR-0001).
            score = 0.80;
        } else {
            text = 'Não inclui benefício de ingresso';
            score = 0.10;
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
        if (c.modalidadePrincipal === 'anual') {
            return {
                modalidade: 'anual',
                priceText: `${c.parcelas}x ${formatBRL(c.valorParcela)}`,
                totalText: `Total ${formatBRL(c.valorTotal)}`,
                detail: `Contratação anual em ${c.parcelas}x ${formatBRL(c.valorParcela)} sem juros`
            };
        }
        return {
            modalidade: 'anual',
            priceText: `${formatBRL(c.precoMensal)} / mês (referência)`,
            totalText: `Total anual: ${formatBRL(c.precoMensal * 12)}`,
            detail: 'Cobrança semestral ou anual; valor mensal de referência'
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

        const card = plan.opcionais.carteirinhaFisica;
        if (card.situacao === 'incluida') benefits.push('Carteirinha física incluída');
        if (card.situacao === 'virtual') benefits.push('Carteirinha virtual');
        if (card.situacao === 'opcional') benefits.push(`Carteirinha física opcional: ${formatBRL(card.preco)}`);

        if (ticket.nivel && ticket.nivel.origem === 'inicial') {
            benefits.push('Já é sócio? Confira seu desconto atual na sua conta.');
        }

        if (plan.camposPendentes.includes('disponibilidadeCativo')) {
            benefits.push('Oferta sujeita à disponibilidade no checkout');
        }

        return benefits;
    }

    function getCTAText(plan) {
        const ctas = {
            'meu-cruzeiro': 'FAZER PARTE DOS CABULOSOS',
            'time-do-povo': 'QUERO O INGRESSO POPULAR',
            cabuloso: 'GARANTIR MEU DESCONTO DE 50%',
            'cabuloso-max': 'ATÉ 2 INGRESSOS COM 65%OFF',
            'cabuloso-cativo': '"DE SANGUE AZUL EU SOU"'
        };
        return ctas[plan.slug] || 'ASSINAR AGORA';
    }

    function scorePlan(plan, profile, answers, pricing, sectorFit, priceRange) {
        const ticket = getTicketBenefit(plan, answers);
        const priority = getPriority(plan, answers);

        // Ingresso: perde valor quando a pessoa não pretende ir ao estádio e
        // quando o benefício não cobre o setor de preferência.
        const sectorMultiplier = sectorFit.level === 'full'
            ? 1
            : sectorFit.level === 'partial'
                ? 0.75
                : sectorFit.level === 'none'
                    ? 0.10
                    : 1;
        let ticketComponent = ticket.score * sectorMultiplier;
        if (profile.adultos > 0 && plan.ingresso.quantidade >= 2) {
            ticketComponent = Math.min(1, ticketComponent + 0.08);
        }

        const priorityComponent = priority.garantido ? 1 : clamp((5 - priority.value) / 4, 0, 1);

        const sectorComponent = sectorFit.level === 'full'
            ? 1
            : sectorFit.level === 'partial'
                ? 0.6
                : sectorFit.level === 'none'
                    ? 0.0
                    : 0.7;

        const discountComponent = clamp(plan.loja.percentual / 0.15, 0, 1);

        const experienceComponent = plan.conteudoExclusivo && plan.votacao
            ? 1
            : (plan.conteudoExclusivo || plan.votacao ? 0.7 : 0.1);

        let familyComponent = 0.6;
        if (profile.adultos > 0 || profile.kids > 0) {
            const needed = 1 + profile.adultos;
            const ticketCapacity = plan.ingresso.quantidade >= needed
                ? 1
                : plan.ingresso.quantidade / needed;
            const kidsSupport = plan.opcionais.kids.disponivel ? 1 : 0;
            familyComponent = 0.6 * ticketCapacity + 0.4 * kidsSupport;
        }

        const priceComponent = priceRange.max === priceRange.min
            ? 1
            : clamp(1 - (pricing.subscription - priceRange.min) / (priceRange.max - priceRange.min), 0, 1);

        const attendanceWeight = 0.05 + 0.95 * (profile.frecuencia / 10);
        const ticketWeight = attendanceWeight * (1 + 0.15 * (profile.prioridad / 10));
        // Prioridade e garantia de ingresso só têm valor para quem pretende ir
        // ao estádio. Sem frequência, o peso é residual.
        const priorityWeight = attendanceWeight * (0.2 + 0.8 * (profile.prioridad / 10));
        // Setor só importa para quem vai ao estádio: sem presença, a cobertura
        // de um ingresso que não será usado não pode decidir o ranking.
        const sectorWeight = (answers.preferredSector ? 0.8 : 0.1) * attendanceWeight;
        const discountWeight = 0.2 + 0.8 * (profile.descuentos / 10);
        const experienceWeight = 0.2 + 0.8 * (profile.experiencias / 10);
        const familyWeight = (profile.adultos > 0 || profile.kids > 0) ? 0.7 : 0.05;
        // O componente de preço usa somente a assinatura; taxa e opcionais
        // permanecem separados, conforme a ADR-0001.
        const priceWeight = 0.8 + 0.8 * (profile.importanciaPreco / 10);

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
                text: 'O ingresso do Cabuloso Cativo é garantido no Sicoob — Leste Inferior, sem depender da janela de prioridade.'
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

        const recommendations = (eligible.length ? eligible : allSorted).slice(0, 3).map((item, rank) => ({
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
});
