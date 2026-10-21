import {C,O,chance,clamp,esc,fmt} from "./data.js";
import {CAR,FL,PHASE,POT,Q,S,cur,log,ovr,salAtual,set} from "./state.js";
import {next} from "./engine.js";

/* ===================== Ações com probabilidade ===================== */
const pc=v=>clamp(v,.02,.98);
const ACTS=[
  {id:"treino",grp:"Carreira",ic:"🏋🏽",n:"Treino extra",d:"Ficar depois do treino com o preparador.",en:2,lim:2,scene:"campo",fx:{fad:12},
    outs:()=>[{p:pc(.8-(S.bola>=POT+5?.6:0)),t:"Evoluiu tecnicamente",fx:{bola:1.5}},{p:.3,t:"Ganhou condicionamento",fx:{corpo:1}},
      {p:pc(.04+S.fad/400),t:"Lesão leve no treino",bad:1,fx:{},run:()=>{FL.lesao=Math.max(FL.lesao||0,1);log("Lesão leve em treino extra");}}]},
  {id:"video",grp:"Carreira",ic:"📺",n:"Estudar os adversários",d:"Vídeos com o analista de desempenho.",en:1,lim:1,scene:"imprensa",fx:{},
    outs:()=>[{p:.9,t:"Leitura de jogo melhor",fx:{cabeca:1.5}},{p:.5,t:"Confiança pro próximo mês",fx:{moral:4},run:()=>{FL.mod=(FL.mod||0)+1;FL.modM=Math.max(FL.modM||0,1);}}]},
  {id:"tecnico",grp:"Carreira",ic:"🗣️",n:"Conversar com o técnico",d:"Pedir mais minutos ou liberdade em campo.",en:1,lim:1,scene:"vestiario",fx:{},
    outs:()=>[{p:pc(.35+(S.cabeca-50)/150),t:"Ele te deu mais espaço",fx:{moral:6},run:()=>{FL.mod=(FL.mod||0)+3;FL.modM=Math.max(FL.modM||0,2);}},
      {p:pc(.2-(S.cabeca-50)/250),t:"Ele não gostou da cobrança",bad:1,fx:{moral:-6,cabeca:-2}}]},
  {id:"festa",grp:"Vida social",ic:"🎉",n:"Ir a uma festa",d:"Camarote, DJ e muitas fotos.",en:2,lim:3,scene:"festa",fx:{moral:6},
    outs:()=>[{p:.7,t:"Cansaço no dia seguinte",bad:1,fx:{fad:18}},{p:pc(.45+CAR.fama/250),t:"Ganhou fama nas redes",fx:{fama:3}},
      {p:pc(.16-(S.cabeca-50)/300),t:"Polêmica: foto vazou",bad:1,fx:{fama:-3,cabeca:-4,familia:-3}},
      {p:FL.namoro?0:.06,t:"Conheceu alguém especial",fx:{familia:3},run:()=>{FL.namoro=true;log("Começou a namorar alguém que conheceu numa festa");}}]},
  {id:"amigos",grp:"Vida social",ic:"🍕",n:"Jantar com os amigos",d:"A turma do bairro, de sempre.",en:1,lim:2,scene:"casa",fx:{},
    outs:()=>[{p:.9,t:"Cabeça leve",fx:{moral:4,cabeca:1}},{p:.1,t:"Foto com fã viralizou",fx:{fama:2}}]},
  {id:"post",grp:"Vida social",ic:"📱",n:"Postar nas redes",d:"Foto, vídeo ou desabafo.",en:0,lim:2,scene:"celular",fx:{},
    outs:()=>[{p:.5,t:"Engajamento alto",fx:{fama:2}},{p:pc(.2-(S.cabeca-50)/300),t:"Treta nos comentários",bad:1,fx:{cabeca:-2,moral:-3,fama:1}},{p:.05,t:"Viralizou no mundo todo",fx:{fama:7}}]},
  {id:"entrevista",grp:"Vida social",ic:"🎙️",n:"Dar entrevista exclusiva",d:"Programa de TV no domingo.",en:1,lim:1,scene:"imprensa",fx:{},
    outs:()=>[{p:.6,t:"Boa repercussão",fx:{fama:3}},{p:pc(.25-(S.cabeca-50)/250),t:"Frase polêmica",bad:1,fx:{cabeca:-3,moral:-3,fama:2}}]},
  {id:"descanso",grp:"Bem-estar",ic:"🛋️",n:"Descansar em casa",d:"Sofá, série e sono.",en:1,lim:3,scene:"casa",fx:{fad:-15},outs:()=>[{p:.7,t:"Recarregou",fx:{moral:2}}]},
  {id:"fisio",grp:"Bem-estar",ic:"💆🏽",n:"Fisioterapia particular",d:"Crioterapia e massagem.",en:1,lim:2,scene:"hospital",cost:()=>Math.max(800,salAtual()*.01),fx:{fad:-20},
    outs:()=>[{p:.3,t:"Corpo mais forte",fx:{corpo:1}},{p:FL.lesao?.4:0,t:"Recuperação acelerada",fx:{},run:()=>{FL.lesao=Math.max(0,FL.lesao-1);}}]},
  {id:"psico",grp:"Bem-estar",ic:"🧠",n:"Sessão com psicólogo",d:"Cuidar da cabeça.",en:1,lim:1,scene:"vestiario",cost:()=>Math.max(400,salAtual()*.004),fx:{},outs:()=>[{p:.85,t:"Mais equilíbrio",fx:{cabeca:2,moral:4}}]},
  {id:"familia",grp:"Bem-estar",ic:"👪",n:"Visitar a família",d:"Almoço de domingo na casa da mãe.",en:2,lim:1,scene:"casa",fx:{},
    outs:()=>[{p:.9,t:"Família feliz",fx:{familia:5,moral:4}},{p:salAtual()>2e5?.15:.05,t:"Pediram dinheiro emprestado",bad:1,fx:{familia:2},run:()=>{FL.g-=Math.max(500,salAtual()*.03);}}]},
  {id:"carro",grp:"Dinheiro",ic:"🏎️",n:"Comprar um carro de luxo",d:"Importado na garagem e gasto fixo todo mês.",en:0,lim:1,scene:"carro",cond:()=>salAtual()>3e5&&!FL.temCarro,cost:()=>salAtual()*.3,fx:{fama:4,moral:5},
    outs:()=>[{p:1,t:"Gastos fixos aumentam",bad:1,fx:{},run:()=>{FL.gastos+=salAtual()*.04;FL.temCarro=true;log("Comprou um carro de luxo");}},{p:.2,t:"Ostentação irritou a torcida",bad:1,fx:{fama:-2,cabeca:-2}}]},
  {id:"investir",grp:"Dinheiro",ic:"📈",n:"Investir num negócio",d:"Hamburgueria, academia ou loja.",en:1,lim:1,scene:"dinheiro",cond:()=>FL.g>salAtual()*.4&&salAtual()>2e5,cost:()=>FL.g*.3,fx:{},
    outs:()=>{const v=FL.g*.3;return [{p:pc(.35+(S.cabeca-50)/200),t:`Deu lucro: ${fmt(v*1.6)}`,fx:{},run:()=>{FL.g+=v*1.6;log("Lucrou com um negócio próprio");}},{p:.3,t:"Sócio sumiu com o dinheiro",bad:1,fx:{cabeca:-3}}];}},
  {id:"doar",grp:"Dinheiro",ic:"🤝🏽",n:"Doar para projeto social",d:"Escolinha, enchente, hospital.",en:1,lim:1,scene:"campo",cond:()=>FL.g>0,cost:()=>Math.max(1000,FL.g*.05),fx:{familia:3},
    outs:()=>[{p:.75,t:"Torcida aplaudiu",fx:{fama:3,moral:4}},{p:.15,t:"Acusado de marketing",bad:1,fx:{fama:-1}}]}
];
const FXI={bola:"⚽",corpo:"💪",cabeca:"🧠",familia:"🏠",fad:"😮‍💨",moral:"😊",fama:"⭐",g:"💰",sal:"💰"};
function canDo(a){return PHASE==="pro"&&!cur&&FL.en>=a.en&&(FL.acts[a.id]||0)<a.lim&&(!a.cond||a.cond())&&(!a.cost||FL.g>=a.cost());}
function applyFx(fx,ch){for(const k in fx||{}){const v=fx[k];if(!v) continue;
  if(k==="g") FL.g+=v; else if(k==="sal") FL.g+=salAtual()*v;
  else if(k==="fama"){const b=CAR.fama;CAR.fama=clamp(CAR.fama+v);ch.fama=(ch.fama||0)+CAR.fama-b;}
  else {const b=S[k];S[k]=clamp(S[k]+v);if(k==="bola") S.bola=Math.min(S.bola,POT+8);ch[k]=(ch[k]||0)+S[k]-b;}}}
function doAction(id){
  const a=ACTS.find(x=>x.id===id);if(!a||!canDo(a)) return;
  const outs=a.outs(),cost=a.cost?a.cost():0,ch={},g0=FL.g;set({LASTO:ovr()});
  FL.en-=a.en;FL.g-=cost;FL.acts[id]=(FL.acts[id]||0)+1;
  applyFx(a.fx,ch);
  const res=outs.filter(o=>o.p>0).map(o=>{const hit=chance(o.p);if(hit){applyFx(o.fx,ch);if(o.run)o.run();}return {...o,hit};});
  if(FL.g!==g0) ch.g=FL.g-g0;set({LASTCH:ch});
  const fxTxt=Object.entries(ch).filter(([k,v])=>k!=="g"&&Math.round(v)).map(([k,v])=>`${FXI[k]} ${v>0?"+":""}${Math.round(v)}`).join("  ");
  Q.unshift(C(a.n,a.ic,a.scene,`<ul class="rolls">${res.map(r=>`<li class="${r.hit?"hit":"miss"}"><span>${r.hit?"✔":"✖"} ${esc(r.t)}</span><b>${Math.round(r.p*100)}%</b></li>`).join("")}</ul><p class="small">${fxTxt||"Nada mudou."}${cost?` · custou ${fmt(cost)}`:""}</p>`,[O("👍","Ok",{})],{result:true}));
  next();
}

export {canDo,applyFx,doAction,pc,ACTS,FXI};
