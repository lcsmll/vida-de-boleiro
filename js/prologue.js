import {C,O,REG,chance,esc,fmt,rand} from "./data.js";
import {CAR,CLUBS,FL,P,POT,S,clubSalary,set} from "./state.js";
import {startPro} from "./engine.js";

const bigClub = uf => { const n=REG[uf]||"Amazônia EC";
  return CLUBS.find(c=>c.uf===uf&&c.l==="BR"&&c.t>=3) || CLUBS.find(c=>c.n===n) || CLUBS.filter(c=>c.l==="BR"&&c.t>=3)[0] || {n,l:"BR",t:4,c:["#1F4FC9","#fff"]}; };
const midClub = uf => ({n:"Operário-"+uf,l:"BR",t:2,c:["#111111","#F2B705"],uf});
const localClub = () => ({n:"EC "+P.cidade,l:"BR",t:1,c:["#0B6E3A","#ffffff"],uf:P.uf});
/* ---------- Prólogo ---------- */
function prologue(){
  const c=P.cidade,uf=P.uf,big=bigClub(uf),fraco=P.pe==="Destro"?"esquerdo":"direito",loc=localClub();
  const coach={
    GOL:["Goleiro bom não pula bonito, pula certo. Fica depois do treino pra pegar chute?",O("🧤","Fico até escurecer",{corpo:8,bola:5,familia:-5}),O("🍲","Vou pra casa jantar",{familia:10,bola:-4})],
    ZAG:["Zagueiro que sai jogando vale ouro. Mas primeiro tem que ganhar a dividida. Qual você treina?",O("🎯","A saída de bola",{bola:8,corpo:-4}),O("💥","A dividida",{corpo:10,cabeca:-5})],
    LAT:["Lateral hoje é ponta e zagueiro ao mesmo tempo. Aguenta ir e voltar o jogo inteiro?",O("🏃🏽","Aguento, professor",{corpo:10,familia:-5}),O("🧱","Prefiro guardar posição",{cabeca:8,bola:-4})],
    VOL:["Volante é cérebro e pulmão. Quer aprender a ler o jogo ou a correr mais que todo mundo?",O("🧠","Ler o jogo",{cabeca:12,corpo:-4}),O("🫁","Correr mais",{corpo:12,cabeca:-4})],
    MEI:["Meia que não arrisca o passe não é meia. Mas quem perde bola toda hora vai pro banco.",O("➡️","Jogo simples",{cabeca:10,bola:-4}),O("🪄","Arrisco o passe",{bola:12,cabeca:-8})],
    PON:["Ponta tem que encarar. No um contra um, você vai pra cima ou toca de lado?",O("↔️","Toco de lado",{cabeca:8}),O("⚡","Vou pra cima",{bola:12,corpo:-5})],
    ATA:["Centroavante vive de gol. Fica depois do treino finalizando ou vai pro futsal com a turma?",O("🥅","Finalizar",{bola:8,familia:-5}),O("👟","Futsal com a turma",{familia:5,cabeca:5})]
  }[P.pos];
  const A=(age,chap,card)=>Object.assign(card,{age,chap});
  return [
    A(7,"Infância",C("Narrador","📍","rua",`${esc(c)}, ${uf}. Você tem 7 anos e uma bola de capotão que um dia foi branca. Na rua, todo mundo sabe: quando ela cai no seu pé, demora pra voltar.`,[O("⚽","Bora jogar")])),
    A(7,"Infância",C("Sua mãe","👩🏽","casa",`“Filho, a geladeira tá vazia de novo. Não dá pra pagar escolinha. Se quiser chuteira, vai ter que ser do seu jeito.”`,
      [O("🧹","Ajudar em casa",{familia:10,cabeca:5}),O("🐷","Juntar pra chuteira",{bola:4,familia:-5})])),
    A(8,"Infância",C("Kaio, vizinho","🚦","sinal",`“Vendo bala no sinal da avenida. Dá uns 60 reais na semana boa. Vem comigo depois da escola?”`,
      [O("🙅🏽","Minha mãe não deixa",{familia:5}),O("🍬","Vou pro sinal",{g:70,cabeca:5,familia:-5,corpo:-3},{set:{sinal:true},log:"Vendeu bala no sinal pra juntar dinheiro"})])),
    A(9,"Infância",C("Roupeiro do "+loc.n,"🧺","estadio",`“Precisamos de gandula pros jogos de domingo. Trinta reais por jogo, e você vê os profissionais de pertinho.”`,
      [O("⚽","Prefiro a pelada",{bola:4}),O("🏟️","Quero ser gandula",{g:90,bola:4,cabeca:5},{set:{gandula:true},log:`Foi gandula no estádio do ${loc.n}`})])),
    A(9,"Infância",C("Professora Célia","👩🏻‍🏫","escola",`“Prova de matemática amanhã. E não adianta fazer essa cara, eu sei que a pelada do campinho é hoje às quatro.”`,
      [O("📚","Estudar",{cabeca:12,bola:-4}),O("⚽","Pelada",{bola:8,cabeca:-10})])),
    ()=>{set({AGE:10});const preco=150,falta=Math.max(0,preco-FL.g);
      if(!falta) return A(10,"Infância",C("Loja de esportes","👟","dinheiro",`Você conta as moedas no balcão: ${fmt(FL.g)}. A chuteira da vitrine é sua. Nunca mais pisou numa poça com ela.`,
        [O("👟","Calçar e sair correndo",{bola:8,g:-preco},{log:"Comprou a primeira chuteira com o próprio dinheiro"})]));
      return A(10,"Infância",C("Seu avô","👴🏾","casa",`Faltam ${fmt(falta)} pra chuteira da vitrine. Seu avô tira um envelope amassado do bolso: “Completa com isso aqui.”`,
        [O("🤲🏾","Aceitar a ajuda",{familia:10,bola:4,g:-FL.g},{log:"Ganhou a chuteira com a ajuda do avô"}),O("🦶🏽","Jogar descalço até juntar",{corpo:8,cabeca:5},{log:"Jogou descalço até os 10 anos"})]));},
    A(10,"Escolinha",C("Seu Zé, técnico da escolinha","🧢","campo",coach[0],[coach[1],coach[2]])),
    A(10,"Escolinha",C("Seu Zé, técnico da escolinha","🧢","campo",`“Esse teu pé ${fraco} só serve pra subir no ônibus. Vai treinar ele ou caprichar no bom?”`,
      [O("🦶","Treinar o pé fraco",{bola:8,corpo:-5}),O("🎯","Caprichar no pé bom",{bola:4,cabeca:5})],{cond:()=>P.pe!=="Ambidestro"})),
    A(11,"Escolinha",C("Dudu, seu melhor amigo","🧒🏽","escola",`“O futsal da escola vai disputar o estadual. Treino toda noite depois da aula. Tá dentro?”`,
      [O("🛋️","Tô fora",{familia:10,corpo:4}),O("🏅","Tô dentro",{bola:8,corpo:4,familia:-10},{log:"Jogou o estadual de futsal pela escola"})])),
    A(12,"A peneira",C("Olheiro","🕶️","campo",`“Te vi na várzea domingo. Sábado tem peneira no ${big.n}, na capital. São horas de ônibus e eu não pago a passagem.”`,
      [O("🏠","Não tenho como ir",{familia:10},{set:{peneira:false},club:loc,log:`Entrou na base do ${loc.n}`}),O("🚌","Eu vou",{familia:-10,corpo:-5,g:-40},{then:resultadoPeneira})])),
    ()=>{set({AGE:13});return FL.club.t>1
      ?A(13,"Base",C("Sua mãe","👩🏽","casa",`“O CT do ${FL.club.n} fica longe demais. Vai morar no alojamento ou pegar dois ônibus todo dia?”`,
        [O("🚌","Vou e volto",{familia:10,corpo:-10}),O("🛏️","Morar no alojamento",{bola:8,cabeca:4,familia:-15},{log:"Foi morar no alojamento, longe de casa"})]))
      :A(13,"Base",C("Seu pai","👨🏽","casa",`“Arrumei um bico pra você no mercado, sábado e domingo. Ajuda a pagar as contas.”`,
        [O("🛒","Trabalhar",{familia:15,bola:-5,corpo:-5,g:200}),O("⚽","Fim de semana é jogo",{bola:8,familia:-15})]));},
    A(14,"Base",C("Marquinhos, empresário","💼","contrato",`“Assina comigo hoje e eu te dou um celular e 500 reais por mês. Com dezoito você tá na Europa. Minha comissão? Só 30%, coisa pouca.”`,
      [O("✋🏽","Recusar",{cabeca:10,familia:-5}),O("✍🏽","Assinar",{familia:10,cabeca:-10,g:1500},{set:{agente:{n:"Marquinhos",com:.3,mult:1.1}},log:"Assinou com o empresário Marquinhos (30% de comissão)"})])),
    A(14,"Base",C("Colega de alojamento","🧑🏾","festa",`“Tem festa sábado na casa de um dos caras do sub-20. Ninguém vai saber.”`,
      [O("😴","Fico e descanso",{corpo:8,cabeca:5}),
       O("🎉","Bora",{cabeca:-10,corpo:-10,familia:5},{then:()=>chance(.5)?A(14,"Base",C("Treinador do sub-15","📋","vestiario",`“Chegou com cara de travesseiro e o preparador sentiu cheiro de cerveja. Banco no domingo.”`,[O("😔","Abaixar a cabeça",{bola:-5,cabeca:5})],{bad:true})):null})])),
    A(15,"Base",C("Fisioterapeuta","🩺","hospital",`“Entorse no tornozelo. Ou você para três semanas, ou faz infiltração e joga a semifinal.”`,
      [O("🧊","Parar e tratar",{corpo:8,bola:-4}),O("💉","Jogar no sacrifício",{corpo:-20,bola:8},{log:"Jogou a semifinal com o tornozelo infiltrado"})])),
    A(15,"Base",C("Capitão do time","©️","vestiario",`“Aqui no vestiário ninguém te chama de ${esc(P.nome.split(/\s+/)[0])}. É ${esc(P.apelido)} pra cá, ${esc(P.apelido)} pra lá. O roupeiro quer saber o que vai nas costas.”`,
      [O("🪪","Meu nome",{cabeca:5}),O("👕",`“${esc(P.apelido)}”`,{bola:4,familia:-5},{log:`Virou “${P.apelido}” de vez`})],
      {cond:()=>P.apelido.toLowerCase()!==P.nome.split(/\s+/)[0].toLowerCase()})),
    A(15,"Base",C("Treinador do sub-17","📋","vestiario",`“A ${P.numero} é do titular. Quer ela? Ganha a vaga dele no treino.”`,
      [O("⏳","Esperar minha vez",{cabeca:10,bola:-4}),O("🔥","Ir pra cima no treino",{bola:8,corpo:-5,cabeca:-5})])),
    P.pos==="GOL"
      ?A(16,"Final",C("Final do sub-17","🏆","estadio",`Pênaltis. Último batedor deles. Se você pegar, o título é de vocês. Ele ajeita a bola e te encara.`,
        [O("🧍🏽","Esperar até o fim",{},{then:()=>penaltiBase(.28)}),O("↙️","Escolher um canto",{},{then:()=>penaltiBase(.22)})],{big:true}))
      :A(16,"Final",C("Final do sub-17","🏆","estadio",`Um a um, acréscimos, pênalti pra vocês. O capitão te entrega a bola: “É tua.”`,
        [O("↘️","Bater no canto",{},{then:()=>penaltiBase(.45)}),O("🥄","Cavadinha",{fama:5},{then:()=>penaltiBase(.32)})],{big:true})),
    ()=>{set({AGE:16});const sal=clubSalary(FL.club,62)*.5;
      let t=`“Contrato profissional com o ${FL.club.n}: ${fmt(sal)} por ano, três temporadas. Você estreia no time de cima.”`;
      if(FL.agente&&FL.agente.com) t+=` Marquinhos já faz a conta: “Trinta por cento é meu.”`;
      return A(16,"O contrato",C("Diretor da base","🖊️","contrato",t,
        [O("👪","Ler com a família",{familia:10,cabeca:5},{then:()=>startPro(sal)}),O("✍🏽","Assinar agora",{bola:3},{then:()=>startPro(sal)})],{big:true}));}
  ];
}
function resultadoPeneira(){
  const big=bigClub(P.uf),mid=midClub(P.uf),score=S.bola*.5+S.corpo*.3+S.cabeca*.2+rand(-10,10)+(POT-75)*.3;
  const A=card=>Object.assign(card,{age:12,chap:"A peneira"});
  if(score>=52){FL.club=big;FL.promessa=true;
    return A(C("Portão do CT","📜","estadio",`Duzentos meninos, uma lista colada no portão. Você procura três vezes até acreditar: seu nome está lá. Aprovado no ${big.n}.`,
      [O("📞","Ligar pra casa chorando",{familia:10},{log:`Aprovado na peneira do ${big.n}`}),O("🧠","Pensar no próximo passo",{cabeca:8},{log:`Aprovado na peneira do ${big.n}`})],{big:true}));}
  if(score>=40){FL.club=mid;
    return A(C("Técnico do "+mid.n,"📞","campo",`Seu nome não está na lista do ${big.n}. Mas um senhor de agasalho te chama no canto: “Sou do ${mid.n}. Gostei de você. Topa?”`,
      [O("🤝🏽","Topo",{cabeca:5},{log:`Reprovado no ${big.n}, aceito pelo ${mid.n}`}),O("😤",`Topo, e um dia volto pro ${big.n}`,{bola:4,cabeca:-5},{set:{vinganca:big.n},log:`Reprovado no ${big.n}, aceito pelo ${mid.n}`})]));}
  FL.club=localClub();
  return A(C("Rodoviária","🚌","rua",`Seu nome não está na lista. A volta pra ${esc(P.cidade)} é a viagem mais longa da sua vida. Semana seguinte, o ${FL.club.n} te chama pra base.`,
    [O("😞","Dar um tempo da bola",{familia:10,bola:-8},{log:`Reprovado na peneira, foi pra base do ${FL.club.n}`}),O("😤","Treinar com raiva",{bola:8,corpo:4,cabeca:-5},{log:`Reprovado na peneira, foi pra base do ${FL.club.n}`})],{bad:true}));
}
function penaltiBase(base){
  const ok=chance(base+(S.bola*.6+S.cabeca*.4)/100*.45),gk=P.pos==="GOL",A=card=>Object.assign(card,{age:16,chap:"Final"});
  if(ok){FL.promessa=true;CAR.titulos.push("Campeonato Sub-17");
    return A(C("Final do sub-17","🏆","trofeu",gk?`Ele bate, você voa. A bola explode na sua luva e a torcida invade o campo. Campeão!`:`A rede estufa. Você corre pra torcida sem saber pra onde está indo. Campeão!`,
      [O("🏆","Levantar a taça",{bola:6,cabeca:8,fama:5},{log:gk?"Pegou o pênalti do título sub-17":"Fez o gol do título sub-17"})],{big:true}));}
  return A(C("Final do sub-17","💔","estadio",gk?`Você cai pro lado certo, mas a bola entra rasteira, colada na trave. Vice.`:`A bola sobe, sobe, e some atrás do gol. Vice. Você não dorme naquela noite.`,
    [O("😢","Engolir o choro",{cabeca:-15,familia:5},{log:gk?"Não pegou o pênalti da final sub-17":"Perdeu o pênalti da final sub-17"})],{bad:true}));
}

export {prologue,resultadoPeneira,penaltiBase,bigClub,midClub,localClub};
