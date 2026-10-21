import {C,LIGAS,O,SEL,chance,esc,fmt,pick} from "./data.js";
import {AGE,CAR,CLUBS,FL,P,S,USED,clubSalary,mv,ovr,posName,salAtual} from "./state.js";
import {sorted,tierOf} from "./engine.js";

function lesaoCard(){return C("Departamento médico","🦵","hospital",`Ruptura do ligamento do joelho. O médico do clube quer operar já. Um especialista indica tratamento conservador.`,
  [O("🔪","Operar",{corpo:-12,bola:-5},{log:"Rompeu o ligamento do joelho e operou"}),
   O("🩹","Tratamento conservador",{corpo:-5},{then:()=>chance(.5)?C("Departamento médico","🦵","hospital",`O joelho falhou de novo no primeiro treino. Agora é cirurgia, e o tempo perdido dobrou.`,[O("😣","Operar",{corpo:-14,bola:-6,cabeca:-5},{log:"Joelho falhou duas vezes"})],{bad:true}):null})],{bad:true});}

/* Eventos */
const EV=[
  {id:"balada",rep:1,w:1.2,mk:()=>C("Convite no celular","🍾","festa",`Clássico no domingo. Na sexta, um MC famoso te chama pra festa na cobertura dele.`,
    [O("🏠","Ficar em casa",{cabeca:4}),O("🎉","Ir pra festa",{fama:4,cabeca:-10,corpo:-6},{then:()=>chance(.45)?C("Redes sociais","📱","celular",`Vazou um vídeo seu às 4 da manhã com um copo na mão. A torcida não perdoou o empate no clássico.`,[O("🎥","Gravar pedido de desculpas",{fama:-6,cabeca:-5},{log:"Vídeo na balada vazou antes do clássico"})],{bad:true}):null})])},
  {id:"carro",w:1,cond:()=>salAtual()>3e5,mk:()=>{const p=salAtual()*.35;return C("Concessionária","🏎️","carro",`O importado dos sonhos na vitrine. ${fmt(p)} à vista e mais seguro, manutenção, motorista…`,
    [O("🚶🏽","Não preciso disso",{familia:4,cabeca:4}),O("🔑","Comprar",{g:-p,fama:5,cabeca:-3},{sub:"+ gastos fixos todo ano",run:()=>FL.gastos+=p*.12,log:"Comprou o primeiro carro importado"})]);}},
  {id:"casaMae",w:1.4,cond:()=>FL.g>salAtual()*.6&&salAtual()>2e5,mk:()=>{const p=salAtual()*.5;return C("Sua mãe","👩🏽","casa",`Ela nunca pediu nada. Mas você lembra do aluguel atrasado e da geladeira vazia.`,
    [O("🏡","Dar uma casa pra mãe",{g:-p,familia:15},{log:"Comprou a casa da mãe"}),O("🏰","Mansão com piscina pra mim",{g:-p*2,fama:6,familia:-8},{sub:"+ gastos fixos altos",run:()=>FL.gastos+=p*.25,log:"Comprou uma mansão com piscina"}),O("🏦","Guardar o dinheiro",{cabeca:5,familia:-4})]);}},
  {id:"tecnico",w:1,mk:()=>C("Sala do técnico","📋","vestiario",`Ele te tirou no intervalo e você chutou a garrafinha na frente da câmera. Agora quer conversar.`,
    [O("🙏🏽","Pedir desculpa",{cabeca:5,fama:-2}),O("😠","Bater de frente",{cabeca:-12,fama:5,bola:-4},{log:"Brigou feio com o técnico",set:{brigaTec:true}})])},
  {id:"vestiario",w:.9,mk:()=>C("Vestiário","🥊","vestiario",`O zagueiro veterano te chamou de “marrento” na frente de todo mundo, depois de você perder um gol feito.`,
    [O("🤐","Deixar pra lá",{cabeca:5}),O("👊🏽","Partir pra cima",{cabeca:-15,fama:4},{then:()=>chance(.5)?C("Diretoria","📄","contrato",`A briga foi gravada. Multa de 40% do salário mensal e afastamento por uma semana.`,[O("💸","Pagar e calar",{sal:-.04,bola:-3},{log:"Multado por briga no vestiário"})],{bad:true}):null})])},
  {id:"rede",rep:1,w:.8,mk:()=>C("Redes sociais","📱","celular",`Um torcedor xingou sua mãe no seu último post. Você tá com o celular na mão.`,
    [O("📵","Ignorar",{cabeca:5}),O("💬","Responder à altura",{fama:7,cabeca:-8,familia:3})])},
  {id:"organizada",rep:1,w:.7,cond:()=>FL.club.l==="BR",mk:()=>C("Portão do CT","📢","rua",`Três derrotas seguidas. A organizada está na porta do CT, com faixa e rojão.`,
    [O("🗣️","Descer e conversar",{cabeca:4,fama:3}),O("🚪","Sair pelos fundos",{cabeca:-5,familia:-5})])},
  {id:"celebridade",w:1,cond:()=>CAR.fama>=40&&!FL.namoro,mk:()=>C("Mensagem direta","💌","celular",`Uma atriz de novela curtiu suas fotos antigas. Ela quer jantar num restaurante cheio de fotógrafos.`,
    [O("🙅🏽","Recusar",{familia:5}),O("🍷","Ir ao jantar",{fama:12,cabeca:-5},{set:{namoro:true},log:"Namoro com atriz de novela virou capa de revista"})])},
  {id:"traicao",w:1,cond:()=>FL.namoro&&CAR.fama>=35,mk:()=>C("Site de fofoca","📸","imprensa",`Fotos suas numa festa em iate, abraçado com outra pessoa. Sua namorada ficou sabendo pela internet.`,
    [O("🙇🏽","Pedir perdão em público",{fama:-5,familia:-10}),O("🙅🏽","Negar tudo",{cabeca:-10,familia:-20,fama:6},{set:{namoro:false},log:"Escândalo de traição estampou os sites"})],{bad:true})},
  {id:"primo",w:1,cond:()=>salAtual()>2e5,mk:()=>C("Seu primo","🧔🏽","casa",`“Quero abrir um lava-jato. Juro que devolvo em seis meses.” Ninguém nunca viu ele devolver nada.`,
    [O("💵","Emprestar",{sal:-.12,familia:10}),O("✋🏽","Negar",{familia:-10,cabeca:3})])},
  {id:"dudu",w:1,cond:()=>AGE>=20,mk:()=>C("Dudu, amigo de infância","🧒🏽","rua",`Seu parceiro do futsal da escola está desempregado. Pede pra trabalhar com você, qualquer coisa.`,
    [O("🚗","Contratar de motorista",{familia:6,cabeca:5,sal:-.03},{log:"Levou o amigo de infância Dudu pra trabalhar com ele"}),O("😶","Não dá pra misturar",{familia:-6})])},
  {id:"aposta",w:.9,cond:()=>AGE>=19,mk:()=>C("Desconhecido no bar","🎲","festa",`“Toma um amarelo no primeiro tempo domingo. Duzentos mil no seu nome, ninguém fica sabendo.”`,
    [O("🚔","Recusar e denunciar",{cabeca:8,fama:5},{log:"Denunciou um esquema de apostas"}),
     O("🟨","Topar",{g:2e5,cabeca:-15},{then:()=>chance(.4)?C("Polícia Federal","🚨","policia",`Operação contra manipulação de apostas. Seu nome está nas mensagens. O tribunal desportivo te bane do futebol.`,[O("⛔","Fim",{},{end:"banido",log:"Banido do futebol por manipulação de apostas"})],{bad:true}):null})])},
  {id:"suplemento",w:.7,mk:()=>C("Preparador particular","💊","hospital",`Ele oferece um suplemento “que nenhum exame pega”. Diz que três jogadores da Europa usam.`,
    [O("🙅🏽","Recusar",{cabeca:5}),O("💊","Usar",{corpo:8,bola:4},{then:()=>chance(.4)?C("Exame antidoping","🧪","imprensa",`Positivo. Suspensão de um ano e seu nome em todos os jornais do país.`,[O("😶","Cumprir a suspensão",{bola:-12,fama:-15,cabeca:-10,sal:-.3},{log:"Suspenso por doping"})],{bad:true}):null})])},
  {id:"lesao",rep:1,w:()=>(100-S.corpo)/65+(AGE>29?.35:0),mk:lesaoCard},
  {id:"imposto",w:.8,cond:()=>FL.g>salAtual()&&salAtual()>1e6,mk:()=>C("Receita Federal","🧾","contrato",`Seu contador “esqueceu” de declarar três anos de imposto. A multa chegou com juros.`,
    [O("💸","Pagar tudo",{sal:-.4,cabeca:5}),O("⚖️","Brigar na justiça",{cabeca:-10,fama:-5,sal:-.15},{log:"Processo com a Receita virou manchete"})],{bad:true})},
  {id:"escolinha",w:1.2,cond:()=>(FL.sinal||FL.gandula)&&FL.g>salAtual()*.5&&salAtual()>1e6,mk:()=>C("Seu bairro","🏫","campo",`Você pode abrir uma escolinha de graça ao lado do sinal onde ${FL.sinal?"vendia bala":"passava todo dia"}.`,
    [O("🏫","Abrir a escolinha",{sal:-.15,familia:10,fama:8,cabeca:5},{log:"Abriu uma escolinha gratuita no bairro onde cresceu"}),O("⏳","Agora não",{})])},
  {id:"tatuagem",w:.6,mk:()=>C("Tatuador famoso","🖋️","celular",`Ele quer fechar seu braço inteiro, de graça, numa live com dois milhões de pessoas.`,
    [O("🙅🏽","Recusar",{}),O("🖋️","Tatuar ao vivo",{fama:6,corpo:-3})])},
  {id:"marquinhos",w:1,cond:()=>FL.agente.n==="Marquinhos"&&tierOf(FL.club)<5,mk:()=>C("Marquinhos, empresário","💼","contrato",`“Para de treinar direito que eles te vendem. Tenho um clube grande na linha.”`,
    [O("🙉","Ignorar",{cabeca:5}),O("🪧","Forçar a saída",{cabeca:-10,fama:-5},{set:{forcar:true},log:"Forçou a saída do clube a pedido do empresário"})])},
  {id:"agencia",w:1.3,cond:()=>AGE>=19&&FL.agente.n!=="Elite Sports"&&ovr()>=68,mk:()=>{const multa=FL.agente.n==="Marquinhos"?salAtual()*.3:0;
    return C("Elite Sports","🏢","contrato",`A maior agência do país quer te representar. Comissão de 12%, mas eles abrem portas na Europa.${multa?` Romper com o Marquinhos custa ${fmt(multa)} de multa.`:""}`,
      [O("🏢","Assinar com a Elite",{g:-multa,cabeca:3},{sub:"12% · propostas melhores",set:{agente:{n:"Elite Sports",com:.12,mult:1.4}},log:"Trocou de empresário: Elite Sports"}),
       O("🧍🏽","Me representar sozinho",{g:-multa,cabeca:-3},{sub:"0% · menos propostas",set:{agente:{n:"Sem empresário",com:0,mult:.6}}}),
       O("🤝🏽",`Manter ${FL.agente.n==="Sem empresário"?"sem empresário":FL.agente.n}`,{},{sub:`${Math.round(FL.agente.com*100)}% de comissão`})]);}},
  {id:"patrocinio",w:1.1,cond:()=>CAR.fama>=30,mk:()=>{const v=mv()*.04;return C("Marcas de chuteira","👟","dinheiro",`Duas marcas querem seu pé. A gigante paga ${fmt(v)} por ano, mas exige vinte posts por mês. A brasileira paga bem menos, e foi a que te deu chuteira na base.`,
    [O("🌐","Marca gigante",{g:v,fama:8,cabeca:-4},{log:"Fechou patrocínio com marca gigante de chuteira"}),O("🇧🇷","Marca brasileira",{g:v*.25,familia:6,fama:3}),O("🚫","Nenhuma",{cabeca:3})]);}},
  {id:"funcao",w:.6,mk:()=>C("Técnico novo","🧠","vestiario",`Ele quer te testar numa função diferente: mais tática, menos holofote.`,
    [O("✅","Aceitar o desafio",{cabeca:8,bola:-3}),O("❌","Recusar",{cabeca:-5,bola:2})])},
  {id:"capitao",w:1,cond:()=>AGE>=25&&S.cabeca>=55&&!FL.capitao,mk:()=>C("Elenco","©️","vestiario",`Votação no vestiário. O grupo quer você com a braçadeira.`,
    [O("©️","Aceitar a braçadeira",{cabeca:5,fama:5},{set:{capitao:true},log:`Virou capitão do ${FL.club.n}`}),O("⚽","Prefiro só jogar",{})])},
  {id:"rival",rep:1,w:.7,mk:()=>C("Coletiva de imprensa","🎙️","imprensa",`O craque rival disse que você “só joga no videogame”. Os microfones estão esperando.`,
    [O("👏🏽","Elogiar ele",{cabeca:5}),O("😏","Provocar de volta",{fama:7,cabeca:-5})])},
  {id:"cripto",w:.8,cond:()=>FL.g>salAtual()*.5&&salAtual()>5e5,mk:()=>{const v=FL.g*.4;return C("Influencer de finanças","🪙","celular",`“Moeda digital nova, rendimento garantido. Só entra quem eu convido.” Ele sugere ${fmt(v)}.`,
    [O("🙅🏽","Recusar",{cabeca:3}),O("🪙","Investir",{g:-v},{then:()=>chance(.25)
      ?C("Notícias","📈","dinheiro",`A moeda disparou. Você vendeu no topo, sem saber como.`,[O("🤑","Sorte grande",{g:v*3,fama:3},{log:"Ficou rico com criptomoeda"})],{big:true})
      :C("Notícias","📉","imprensa",`O influencer sumiu com o dinheiro de todo mundo. Você é capa do caderno de economia.`,[O("😩","Engolir o prejuízo",{cabeca:-8,fama:-4},{log:"Caiu num golpe de criptomoeda"})],{bad:true})})]);}},
  {id:"aniversario",w:.8,mk:()=>C("Seu aniversário","🎂","festa",`Festa com três MCs e camarote, ou churrasco com a família no quintal da sua mãe?`,
    [O("🍖","Churrasco em casa",{familia:10}),O("🎤","Festão",{fama:7,sal:-.06,cabeca:-5})])},
  {id:"filho",w:1,cond:()=>AGE>=23,mk:()=>C("Teste de gravidez","👶","casa",`Você vai ser pai.`,
    [O("🍼","Diminuir as festas",{familia:15,cabeca:8},{log:"Nasceu o primeiro filho"}),O("🕶️","Nada vai mudar",{familia:-10,fama:3},{log:"Nasceu o primeiro filho"})])},
  {id:"natural",w:1,cond:()=>AGE>=23&&AGE<=28&&!FL.selecao&&!FL.selPais&&FL.club.l!=="BR"&&SEL.some(s=>s.n===LIGAS[FL.club.l].pais)&&ovr()>=73,mk:()=>{const pais=LIGAS[FL.club.l].pais;
    return C("Federação de "+pais,"🛂","selecao",`A seleção de ${pais} quer te naturalizar. O Brasil nunca te chamou.`,
      [O("🇧🇷","Esperar o Brasil",{cabeca:3}),O("🛂",`Defender ${pais}`,{fama:5,familia:-6},{set:{selecao:true,selPais:pais},log:`Naturalizou-se e passou a defender ${pais}`})]);}},
  {id:"volta",w:2,cond:()=>AGE>=32&&FL.club.n!==FL.formador.n,mk:()=>{const s=clubSalary(FL.formador)*.8;return C(FL.formador.n,"🏠","estadio",`O clube que te formou quer você de volta pra fechar a história onde ela começou. ${fmt(s)} por ano.`,
    [O("✈️","Seguir onde estou",{}),O("🏠","Voltar pra casa",{familia:15,fama:6},{sub:`${fmt(s)}/ano`,club:FL.formador,run:()=>{FL.contrato={salario:s,temp:2};},log:`Voltou pro ${FL.formador.n}, o clube que o formou`})]);}},
  {id:"vinganca",w:2,cond:()=>FL.vinganca&&ovr()>=74&&FL.club.n!==FL.vinganca&&CLUBS.some(c=>c.n===FL.vinganca),mk:()=>{const cl=CLUBS.find(c=>c.n===FL.vinganca),s=clubSalary(cl);
    return C("Diretor do "+cl.n,"🔁","contrato",`O clube que te reprovou na peneira agora quer te contratar. ${fmt(s)} por ano.`,
      [O("😌","Dizer não com prazer",{cabeca:5,fama:5},{set:{vinganca:null}}),O("😤","Aceitar e mostrar quem é",{fama:8},{set:{vinganca:null},club:cl,run:()=>{FL.contrato={salario:s,temp:3};FL.lock=1;},log:`Contratado pelo ${cl.n}, o clube que o reprovou na peneira`})]);}},
  {id:"folga",rep:1,w:.7,mk:()=>C("Três dias de folga","🏖️","praia",`Praia com os amigos ou treino com preparador particular?`,
    [O("🏖️","Praia",{familia:5,cabeca:4}),O("🏋🏽","Treinar",{corpo:5,bola:2,familia:-5})])},
  {id:"relogio",w:.7,cond:()=>salAtual()>2e6,mk:()=>{const p=salAtual()*.15;return C("Joalheria","⌚","dinheiro",`Um relógio cravejado de ${fmt(p)}, ou a mesma quantia pra vítimas da enchente no seu estado.`,
    [O("🤝🏽","Doar",{g:-p,fama:9,familia:5},{log:"Doou para vítimas de enchente"}),O("⌚","Relógio",{g:-p,fama:3,cabeca:-3})]);}},
  {id:"saudade",w:1.2,cond:()=>FL.club.l!=="BR"&&!FL.saudade,mk:()=>C("Inverno longe de casa","❄️","aviao",`Seis graus negativos, ninguém fala sua língua, e sua mãe chora no telefone toda semana.`,
    [O("👪","Trazer a família",{familia:10,sal:-.08},{set:{saudade:true}}),O("🧊","Aguentar sozinho",{cabeca:-8,bola:2},{set:{saudade:true}})])}
];
function drawEvents(n){
  const out=[],tmp=new Set();
  for(let i=0;i<n;i++){
    const pool=EV.filter(e=>!["aniversario","folga"].includes(e.id)&&!tmp.has(e.id)&&(e.rep||!USED.has(e.id))&&(!e.cond||e.cond()));if(!pool.length)break;
    const ws=pool.map(e=>typeof e.w==="function"?e.w():e.w),tot=ws.reduce((a,b)=>a+b,0);
    let r=Math.random()*tot,ch=pool[0];for(let j=0;j<pool.length;j++){r-=ws[j];if(r<=0){ch=pool[j];break;}}
    tmp.add(ch.id);USED.add(ch.id);out.push(()=>(!ch.cond||ch.cond())?ch.mk():null);
  }
  return out;
}

const KM=[
  {id:"classico",mk:()=>{const r=sorted().filter(t=>t.n!==FL.club.n)[0];return C("Semana de clássico","🔥","estadio",`Clássico contra o ${esc(r.n)}. A semana inteira, a imprensa só fala de você.`,
    [O("🦸🏽","Chamar a responsabilidade",{fama:4},{sub:"Brilha ou afunda",run:()=>FL.mod+=S.bola>=62?3:-2}),
     O("🤝🏽","Jogar pelo coletivo",{cabeca:3},{sub:"Seguro",run:()=>FL.mod+=1}),
     O("📱","Provocar o rival",{fama:6,cabeca:-5},{sub:"Tudo ou nada",run:()=>FL.mod+=pick([-4,-2,3,5])})]);}},
  {id:"concorrente",mk:()=>C("Diretoria","🆕","vestiario",`O clube contratou um ${posName().toLowerCase()} badalado pra sua posição.`,
    [O("🏋🏽","Treinar dobrado",{corpo:-5,bola:2},{sub:"Brigar pela vaga",run:()=>FL.mod+=2}),O("🧘🏽","Disputar com calma",{cabeca:5},{sub:"Sem pressa"}),
     O("🚪","Pedir pra sair na janela",{cabeca:-3},{sub:"Força uma proposta",set:{forcar:true},run:()=>FL.mod-=2})])},
  {id:"tecnico",mk:()=>C("Técnico novo","📋","vestiario",`Chegou um técnico com um esquema que te prende na marcação.`,
    [O("🧩","Se adaptar",{cabeca:4,bola:-1},{run:()=>FL.mod+=1}),O("🎨","Insistir no seu jogo",{fama:2},{sub:"Pode virar banco",run:()=>FL.mod+=chance(.5)?2:-3}),
     O("🏛️","Reclamar com o presidente",{cabeca:-5},{run:()=>FL.mod-=2})])},
  {id:"maratona",mk:()=>C("Calendário apertado","🗓️","campo",`Três jogos por semana durante dois meses.`,
    [O("🔋","Jogar tudo",{corpo:-6},{sub:"Mais jogos, mais desgaste",run:()=>FL.mod+=2}),O("🔄","Pedir rodízio",{corpo:4},{run:()=>FL.mod-=1}),
     O("💆🏽","Fisioterapia particular",{corpo:2,sal:-.03},{run:()=>FL.mod+=1})])},
  {id:"atraso",cond:()=>tierOf(FL.club)<=2,mk:()=>C("Vestiário","💸","vestiario",`Três meses de salário atrasado. O elenco fala em greve.`,
    [O("✊🏽","Liderar a greve",{fama:3,cabeca:-3},{run:()=>FL.mod-=2}),O("⚽","Jogar mesmo assim",{familia:-5},{run:()=>FL.mod+=1}),
     O("🤲🏽","Ajudar os mais novos",{cabeca:5,familia:3,sal:-.05},{run:()=>FL.mod+=1})])},
  {id:"dor",mk:()=>C("Departamento médico","🦵","hospital",`Dor na coxa na véspera de uma sequência decisiva.`,
    [O("💉","Jogar infiltrado",{},{sub:"Risco de lesão",run:()=>FL.mod+=1,then:()=>chance(.3)?lesaoCard():null}),O("🧊","Poupar uma semana",{corpo:5},{run:()=>FL.mod-=1})])},
  {id:"jejum",mk:()=>C("Imprensa","🎙️","imprensa",P.pos==="GOL"?`Três falhas seguidas. A imprensa pede o reserva no seu lugar.`:`Cinco jogos sem ${["ATA","PON","MEI"].includes(P.pos)?"marcar":"uma boa atuação"}. A imprensa pede você no banco.`,
    [O("🤐","Silêncio e trabalho",{cabeca:3},{run:()=>FL.mod+=1}),O("💣","Entrevista explosiva",{fama:5,cabeca:-6},{run:()=>FL.mod+=pick([-3,2])}),
     O("🎓","Treinar com um ex-craque",{sal:-.02},{run:()=>FL.mod+=2})])},
  {id:"racha",mk:()=>C("Vestiário","🪓","vestiario",`O elenco está rachado entre o grupo dos veteranos e o dos jovens.`,
    [O("🗣️",FL.capitao?"Reunião fechada como capitão":"Puxar uma conversa",{cabeca:3},{run:()=>FL.mod+=S.cabeca>=60?2:0}),O("🙈","Ficar fora disso",{},{run:()=>FL.mod-=1}),
     O("👑","Fechar com os veteranos",{fama:2,cabeca:-3},{run:()=>FL.mod+=pick([-2,1])})])},
  {id:"noite",mk:()=>C("Grupo do elenco","🥳","festa",`Aniversário de um companheiro em plena sequência decisiva. Open bar até o sol nascer.`,
    [O("👋🏽","Só dar um abraço",{}),O("🍾","Varar a noite",{fama:3,corpo:-5,familia:2},{run:()=>FL.mod-=2}),O("🏠","Nem ir",{familia:3},{run:()=>FL.mod+=1})])}
];

export {lesaoCard,drawEvents,EV,KM};
