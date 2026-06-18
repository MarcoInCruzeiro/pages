// Cole isso no console do navegador (F12 > Console)

function getAnswerDetails() {
  const details = questions.map(q => {
    const answerValue = state.answers[q.key];
    if (answerValue === null || answerValue === undefined || answerValue === 0) {
      return {
        pergunta: q.title,
        chave: q.key,
        resposta: "Não respondida / Valor padrão"
      };
    }

    if (q.type === "range") {
      return {
        pergunta: q.title,
        chave: q.key,
        resposta: `${answerValue} ${q.suffix}`
      };
    }

    const selectedOption = q.options.find(opt => opt.value === answerValue);
    if (selectedOption) {
      return {
        pergunta: q.title,
        chave: q.key,
        label: selectedOption.label,
        descricao: selectedOption.description,
        valorBruto: answerValue
      };
    }

    return {
      pergunta: q.title,
      chave: q.key,
      resposta: `Valor não mapeado: ${answerValue}`
    };
  });

  console.table(details);
  return details;
}

getAnswerDetails();