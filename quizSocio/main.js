
const assinaturasDetalhes = {
    meuCruzeiro: {
        nome: "Meu Cruzeiro",
        Assinar: "https://socio.cruzeiro.com.br/complementos?plano_id=21&tipo=contrato&intervalo_cobrancas=anual",
        valorMensal: 12,
        ingressoGratisPopular: "1 por temporada",
        taxaAdesao: 0,
        descontoIngresso: null,
        prioridadeCompra: 4,
        descontoLoja: 10,
        carteirinhaFisica: false
    },

    timeDoPovo: {
        nome: "Time do Povo",
        Assinar:"https://socio.cruzeiro.com.br/assinar/checkout?plano_id=34&intervalo_cobrancas=mensal&assinatura_id=&tipo=contrato",
        valorMensal: 40,
        ingressoGratisPopular: false,
        taxaAdesao: 30,
        descontoIngresso: "1 ingresso popular",
        prioridadeCompra: 4,
        descontoLoja: 10,
        carteirinhaFisica: true
    },

    cabuloso: {
        nome: "Cabuloso",
        Assinar:"https://socio.cruzeiro.com.br/assinar/checkout?plano_id=10&intervalo_cobrancas=mensal&assinatura_id=&tipo=contrato",
        valorMensal: 100,
        ingressoGratisPopular: false,
        taxaAdesao: 30,
        descontoIngresso: {
            cabuloso1: {
                percentual: 50,
                jogos: 9
            },
            cabuloso2: {
                percentual: 55,
                jogos: 15
            },
            cabuloso3: {
                percentual: 60,
                jogos: 20
            }
        },
        prioridadeCompra: {
            cabuloso1: 3,
            cabuloso2: 2,
            cabuloso3: 1
        },
        descontoLoja: 15,
        carteirinhaFisica: true
    },

    cabulosoMax: {
        nome: "Cabuloso Max",
        Assinar:"https://socio.cruzeiro.com.br/assinar/checkout?plano_id=11&intervalo_cobrancas=mensal&assinatura_id=&tipo=contrato",
        valorMensal: 200,
        ingressoGratisPopular: false,
        taxaAdesao: 30,
        descontoIngresso: "2 ingressos com 65%",
        prioridadeCompra: 1,
        descontoLoja: 15,
        carteirinhaFisica: true
    },

    cabulosoCativo: {
        nome: "Cabuloso Cativo",
        Assinar:"https://socio.cruzeiro.com.br/assinar/checkout?plano_id=115&intervalo_cobrancas=anual&assinatura_id=&tipo=contrato",
        valorMensal: 400,
        ingressoGratisPopular: false,
        taxaAdesao: 0,
        descontoIngresso: "1 ingresso garantido no azul inferior",
        prioridadeCompra: null,
        descontoLoja: 10,
        carteirinhaFisica: false
    }
};

const ASSINATURAS_VETOR = {
    meuCruzeiro: {
        precoMensal: 12,
        beneficios: {
            ingressoGarantido: 2,   // 1 por temporada
            descontoIngresso: 0,    // Nenhum
            prioridadeCompra: 4,    // Prioridade 4
            descontoLoja: 5,        // Até 10%
            carteirinhaFisica: 0    // Opcional (não incluso)
        }
    },
    timeDoPovo: {
        precoMensal: 40,
        beneficios: {
            ingressoGarantido: 0,
            descontoIngresso: 5,    // 1 ingresso popular
            prioridadeCompra: 4,    // Prioridade 4
            descontoLoja: 5,        // Até 10%
            carteirinhaFisica: 10   // Incluso
        }
    },
    cabuloso: {
        precoMensal: 100,
        beneficios: {
            ingressoGarantido: 0,
            descontoIngresso: 7,    // Progressivo (50% a 60%)
            prioridadeCompra: 7,    // Progressivo (Prioridade 3 a 1)
            descontoLoja: 8,        // Até 15%
            carteirinhaFisica: 10   // Incluso
        }
    },
    cabulosoMax: {
        precoMensal: 200,
        beneficios: {
            ingressoGarantido: 0,
            descontoIngresso: 9,    // 2 ingressos com 65%
            prioridadeCompra: 10,   // Prioridade 1
            descontoLoja: 8,        // Até 15%
            carteirinhaFisica: 10   // Incluso
        }
    },
    cabulosoCativo: {
        precoMensal: 400,
        beneficios: {
            ingressoGarantido: 10,  // 1 garantido no Azul Inferior
            descontoIngresso: 0,    // O ingresso já é dele
            prioridadeCompra: 0,    // Não precisa de prioridade, já é cativo
            descontoLoja: 5,        // Até 10%
            carteirinhaFisica: 0    // Não incluso na tabela (X)
        }
    }
};

const perfilUsuario = {
    ingressoGarantido: undefined,
    descontoIngresso: undefined,
    prioridadeCompra: undefined,
    descontoLoja: undefined,
    carteirinhaFisica: undefined,
};

let orcamentoUsuario = 0;