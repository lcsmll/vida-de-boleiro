import {C,CAL,LEVEL,LIGAS,O,calOf,chance,esc,fmt,pick,rand} from "./data.js";
import {AGE,CAR,CLUBS,COMP,FL,PHASE,SEA,Y,clubSalary,log,mv,ovr,set} from "./state.js";
import {crest} from "./art.js";
import {closeSeason,initSeason,ligaNome,maxTier,myPos,offNow,pctN,pickClub,role,tierOf} from "./engine.js";

/* ===================== Mercado ===================== */
function setClub(cl){
  const oldPos=COMP&&!COMP.ended&&COMP.tab.some(t=>t.n===FL.club.n)?myPos():0,oldN=FL.club?FL.club.n:"";
  if(PHASE==="pro"&&SEA&&!SEA.closed) closeSeason(oldPos,oldN);
  FL.club=cl;if(PHASE!=="pro") return;
  if(CAR.clubes[CAR.clubes.length-1]!==cl.n) CAR.clubes.push(cl.n);
  const cal=CAL[calOf(cl)],off=offNow(cl);
  if(off>=cal.end&&off!==0){set({COMP:null,SEA:null});} else initSeason();
}
function mkOffer(cl,kind="transf"){const s=clubSalary(cl)*rand(.9,1.15);
  return {c:cl,kind,s,temp:kind==="emp"?1:kind==="arabia"?2:Math.round(rand(3,5)),fee:kind==="emp"?0:mv()*rand(.8,1.3),luv:kind==="emp"?0:s*(kind==="arabia"?.6:.35)};}
function transferTo(of,s){
  const old=FL.club,oldC=FL.contrato;
  FL.emprestimo=of.kind==="emp"?{from:old,contrato:oldC}:null;
  FL.contrato={salario:s,temp:of.temp};if(of.fee) CAR.maiorTransf=Math.max(CAR.maiorTransf,of.fee);
  FL.lock=1;log(`${of.kind==="emp"?"Emprestado ao":"Transferido para o"} ${of.c.n}${of.c.l!=="BR"?` (${LIGAS[of.c.l].pais})`:""}${of.fee?` por ${fmt(of.fee)}`:""}`);
  setClub(of.c);
}
function offerOpt(of,mult=1){
  const cl=of.c,s=of.s*mult,luv=of.luv*mult,ida=cl.l!==FL.club.l&&cl.l!=="BR";
  return O(of.kind==="arabia"?"🛢️":of.kind==="emp"?"🔁":cl.l==="BR"?"🇧🇷":"✈️",`${of.kind==="emp"?"Empréstimo: ":""}${esc(cl.n)}`,
    {familia:ida?-6:0,fama:of.kind==="arabia"?-8:tierOf(cl)>tierOf(FL.club)?5:0,moral:4},
    {sub:`${ligaNome(cl)} · ${fmt(s)}/ano · ${of.temp} temp.${luv?` · luvas ${fmt(luv)}`:""}${of.fee?` · paga ${fmt(of.fee)}`:""}`,
     g:luv*(1-FL.agente.com),run:()=>transferTo(of,s)});
}
function stayOpt(){
  const c=FL.club,valoriza=ovr()>=LEVEL[tierOf(c)]&&FL.contrato.temp<=2&&!FL.emprestimo;
  return valoriza?O("🏠",`Renovar com o ${esc(c.n)}`,{cabeca:2},{sub:`${fmt(FL.contrato.salario*1.2)}/ano · +2 temporadas`,run:()=>{FL.contrato.salario*=1.2;FL.contrato.temp+=2;},log:`Recusou propostas e renovou com aumento no ${c.n}`})
    :O("🏠",`Ficar no ${esc(c.n)}`,{cabeca:2},{sub:`Contrato por mais ${Math.max(0,FL.contrato.temp)} temp.`});
}
function janela(nome){
  const c=FL.club;
  if(FL.lock){FL.lock--;return null;}
  const o=ovr(),mt=maxTier(),nota=pctN()||(CAR.hist.length?CAR.hist[CAR.hist.length-1].nota:6.5),rv=COMP?COMP.sc.filter(s=>!s.me):[];
  let p=.26*FL.agente.mult+(nota>=7.3?.25:0)+(COMP&&COMP.meS.g>0&&COMP.meS.g>=Math.max(0,...rv.map(s=>s.g))?.15:0);
  if(FL.forcar) p=1;FL.forcar=false;
  const offers=[];
  if(role()==="Reserva"&&AGE<=23&&tierOf(c)>1){const lo=pickClub(Math.max(1,Math.min(mt,tierOf(c)-1)));if(lo) offers.push(mkOffer(lo,"emp"));}
  if(AGE>=28&&o>=74&&chance(.12)){const ar=pick(CLUBS.filter(x=>x.l==="SAU"&&x.n!==c.n));if(ar) offers.push(mkOffer(ar,"arabia"));}
  if(chance(p)){const t1=mt>tierOf(c)?mt:(mt===tierOf(c)&&chance(.45)?mt:null);
    if(t1){const a=pickClub(t1,t1>=4&&chance(.55),offers.map(x=>x.c.n));if(a) offers.push(mkOffer(a));
      if(a&&chance(.45*FL.agente.mult)){const b=pickClub(Math.max(tierOf(c),t1-(chance(.5)?1:0)),chance(.5),offers.map(x=>x.c.n));if(b) offers.push(mkOffer(b));}}}
  if(!offers.length) return null;
  const list=offers.slice(0,2),ops=list.map(of=>offerOpt(of));
  if(list.length>=2) ops.push(O("🔨","Leilão entre eles",{cabeca:-2},{sub:"Salários +25%, 28% de chance de cada um desistir",then:()=>leilao(list)}));
  else if(list[0].kind!=="emp") ops.push(O("📈","Pedir mais",{},{sub:`${fmt(list[0].s*1.3)}/ano · 42% de chance de desistirem`,then:()=>chance(.42)
    ?C("Mercado da bola","🚪","contrato",`O ${esc(list[0].c.n)} achou caro demais e desistiu. Você segue no ${esc(FL.club.n)}.`,[O("😬","Seguir em frente",{cabeca:-4,moral:-4})],{bad:true})
    :C("Mercado da bola","🤝","contrato",`O ${esc(list[0].c.n)} topou pagar mais.`,[offerOpt(list[0],1.3),stayOpt()],{big:true})}));
  ops.push(stayOpt());
  const head=list.map(of=>`<p style="display:flex;gap:10px;align-items:center;margin:.3em 0">${crest(of.c,30)}<span><b>${esc(of.c.n)}</b><br><span class="small">${ligaNome(of.c)} · ${LIGAS[of.c.l].pais}</span></span></p>`).join("");
  const corta=COMP&&!COMP.ended&&!COMP.trans&&(COMP.copa||COMP.cont);
  return C(`Janela de ${nome} · ${Y}`,"🪟",list.some(x=>x.c.l!=="BR")?"aviao":"contrato",
    `<p>${FL.agente.n==="Sem empresário"?"Você recebeu":`Seu empresário (${esc(FL.agente.n)}) recebeu`} ${list.length>1?"duas propostas":"uma proposta"}.${FL.agente.com?` Comissão: ${Math.round(FL.agente.com*100)}% de salário e luvas.`:""}${corta?" Trocar agora tira você das copas desta temporada.":""}</p>${head}`,ops);
}
function leilao(list){
  const keep=list.filter(()=>chance(.72));if(!keep.length) keep.push(list[0]);
  const saiu=list.filter(x=>!keep.includes(x));
  return C("Leilão","🔨","dinheiro",`<p>O telefone do seu empresário não parou. ${saiu.length?`O ${esc(saiu[0].c.n)} saiu da disputa.`:"Os dois clubes subiram a proposta."}</p>`,
    keep.map(of=>offerOpt(of,1.25)).concat([stayOpt()]),{big:true});
}
function fimEmprestimo(){
  const e=FL.emprestimo,c=FL.club,nota=pctN()||(CAR.hist.length?CAR.hist[CAR.hist.length-1].nota:6);
  const ops=[O("↩️",`Voltar pro ${esc(e.from.n)}`,{},{run:()=>{FL.contrato=e.contrato;FL.contrato.temp=Math.max(1,FL.contrato.temp-1);FL.emprestimo=null;setClub(e.from);},log:`Voltou do empréstimo ao ${e.from.n}`})];
  if(nota>=7) ops.push(O("✍🏽",`Ficar em definitivo no ${esc(c.n)}`,{familia:2},{sub:`${fmt(clubSalary(c))}/ano · 3 temp.`,run:()=>{FL.contrato={salario:clubSalary(c),temp:3};FL.emprestimo=null;},log:`Comprado em definitivo pelo ${c.n}`}));
  return C("Fim do empréstimo","🔁","contrato",`O empréstimo ao ${esc(c.n)} acabou.${nota>=7?` Eles gostaram e querem comprar seu passe.`:""}`,ops);
}
function renewal(){
  const o=ovr(),c=FL.club,s=clubSalary(c),temp=AGE>=32?1:3;
  if(o<LEVEL[tierOf(c)]-7) return C(`Fim de contrato · ${c.n}`,"📄","contrato",`O ${esc(c.n)} não vai renovar. “Agradecemos os serviços prestados.” Você está livre no mercado.`,[O("📞","Ligar pro empresário",{cabeca:-3,moral:-6},{then:freeAgency})],{bad:true});
  return C(`Fim de contrato · ${c.n}`,"📄","contrato",`Seu contrato acabou. O ${esc(c.n)} quer renovar.`,
    [O("✍🏽","Renovar",{cabeca:2},{sub:`${fmt(s)}/ano · ${temp} temp.`,run:()=>{FL.contrato={salario:s,temp};},log:`Renovou com o ${c.n}`}),
     O("📈","Pedir aumento",{},{sub:`${fmt(s*1.35)}/ano · 40% de risco de sair`,then:()=>chance(.4)
       ?C("Diretoria","🚪","contrato",`“Não temos como pagar isso.” A diretoria encerrou a conversa. Você está livre no mercado.`,[O("📞","Procurar clube",{cabeca:-4},{then:freeAgency})],{bad:true})
       :C("Diretoria","🤝","contrato",`A diretoria aceitou: ${fmt(s*1.35)} por ano.`,[O("✍🏽","Assinar",{fama:2,moral:5},{run:()=>{FL.contrato={salario:s*1.35,temp};},log:`Renovou com aumento no ${c.n}`})],{big:true})}),
     O("🧳","Sair de graça",{},{sub:"Testar o mercado",then:freeAgency})]);
}
function freeAgency(){
  const mt=maxTier(),a=pickClub(mt,false),b=pickClub(Math.max(1,mt-1),chance(.5),a?[a.n]:[]);
  const ops=[a,b].filter(Boolean).map(cl=>{const s=clubSalary(cl)*rand(.85,1.1),t=AGE>=32?1:3;
    return O(cl.l==="BR"?"🇧🇷":"✈️",esc(cl.n),{familia:cl.l!==FL.club.l&&cl.l!=="BR"?-5:0},{sub:`${ligaNome(cl)} · ${fmt(s)}/ano · luvas ${fmt(s*.7)}`,
      g:s*.7*(1-FL.agente.com),run:()=>{FL.contrato={salario:s,temp:t};FL.lock=1;FL.emprestimo=null;setClub(cl);},log:`Chegou de graça ao ${cl.n}`});});
  if(AGE>=31||!ops.length) ops.push(O("👟","Pendurar as chuteiras",{},{end:"aposentou"}));
  return C("Jogador livre","📞","celular",`Sem contrato, o telefone toca. ${ops.length>1?"Propostas na mesa:":"Ninguém ligou."}`,ops);
}

export {setClub,mkOffer,transferTo,offerOpt,stayOpt,janela,leilao,fimEmprestimo,renewal,freeAgency};
