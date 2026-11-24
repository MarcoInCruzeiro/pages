const base={kidsCount:0,wantsParticipation:false,digitalExperience:false};
const p=(o)=>({...base,...o});
module.exports=[
 {id:'1',nome:'Cabuloso presencial',capturas:['A','B','C','F','H'],esperado:'cabuloso',answers:p({gamesPerYear:15,gamesHistory:5,wantsGuaranteedTicket:true,buysTwoTickets:false,needsPriority:true,wantsStoreDiscount:'sometimes',gameFrequency:'frequent',budget:100,preferredSector:'blue'})},
 {id:'2',nome:'Cabuloso nível 3',capturas:['D'],esperado:'cabuloso',answers:p({gamesPerYear:15,gamesHistory:25,wantsGuaranteedTicket:true,buysTwoTickets:false,needsPriority:true,wantsStoreDiscount:'sometimes',gameFrequency:'frequent',budget:100,preferredSector:'blue'})},
 {id:'3',nome:'Time do Povo',capturas:['E'],esperado:'time-do-povo',answers:p({gamesPerYear:10,gamesHistory:5,wantsGuaranteedTicket:false,buysTwoTickets:false,needsPriority:false,wantsStoreDiscount:'sometimes',gameFrequency:'occasional',budget:40,preferredSector:'yellow-orange'})},
 {id:'4a',nome:'Sem estádio, sem compras',capturas:['G-apoio'],esperado:'meu-cruzeiro',answers:p({gamesPerYear:0,gamesHistory:'unknown',wantsGuaranteedTicket:'never',buysTwoTickets:false,needsPriority:false,wantsStoreDiscount:false,gameFrequency:'occasional',budget:400,preferredSector:'yellow-orange'})},
 {id:'4b',nome:'Sem estádio, com compras',capturas:['G-loja'],esperado:'cabuloso',answers:p({gamesPerYear:0,gamesHistory:'unknown',wantsGuaranteedTicket:'never',buysTwoTickets:false,needsPriority:false,wantsStoreDiscount:true,gameFrequency:'occasional',budget:100,preferredSector:'yellow-orange'})},
];
