import {C,CAL,COLS,FILLP,KSEQ,LANG,LEVEL,LIGAS,MESC,NAMES,O,SEL,STATS,STG,UFS,calOf,chance,clamp,esc,fase,fmt,pick,poisson,rand} from "./data.js";
import {AGE,BM,BY,CAR,DEFP,keyStats,statName,CLUBS,COMP,FEED,FL,M,P,PHASE,POT,Q,REP,S,SEA,WORLD,Y,busy,cur,log,mv,ovr,posName,potStars,salAtual,set,year} from "./state.js";
import {crest} from "./art.js";
import {midClub} from "./prologue.js";
import {KM,drawEvents,lesaoCard} from "./events.js";
import {fimEmprestimo,janela,renewal,setClub} from "./market.js";
import {applyFx} from "./actions.js";
import {renderAll} from "./ui.js";
import {WARN,finish,saveGame} from "./main.js";

const ligaNome = c => c.l==="BR"&&tierOf(c)<=2 ? "Série B" : LIGAS[c.l].n;
/* Seleção e Copa */
const selPais=()=>FL.selPais||"Brasil", selObj=()=>SEL.find(s=>s.n===selPais())||SEL[0];
function selecaoCheck(){
  const o=ovr();
  if(!FL.selecao&&!FL.selPais&&o>=80&&CAR.fama>=35){FL.selecao=true;
    return C("Seleção Brasileira","🇧🇷","selecao",`A lista saiu ao vivo na TV. O técnico fala seu nome: “${esc(P.apelido)}, do ${FL.club.n}.” Sua mãe grita na cozinha.`,
      [O("😭","Chorar no vestiário",{familia:10,fama:10},{log:"Primeira convocação para a Seleção Brasileira"}),O("🗣️","Prometer o hexa",{fama:15,cabeca:-5},{log:"Primeira convocação para a Seleção Brasileira"})],{big:true});}
  if(FL.selecao&&!FL.selPais&&o<75){FL.selecao=false;
    return C("Seleção Brasileira","📋","imprensa",`Seu nome não está na nova lista. O técnico disse que “a porta está aberta”. Ninguém acredita nisso.`,[O("💪🏽","Seguir trabalhando",{cabeca:4,fama:-5})],{bad:true});}
  return null;
}
function match(a,b){const d=a-b;return [poisson(clamp(1.3+d*.06,.25,3.2)),poisson(clamp(1.1-d*.06,.2,3))];}
function golRate(){return {ATA:.45,PON:.3,MEI:.2,VOL:.06,LAT:.05,ZAG:.05,GOL:0}[P.pos]*(ovr()/80);}

function fillerName(l,used){const f=FILLP[l==="BR2"?"BR":l]||FILLP.USA;
  for(let k=0;k<60;k++){const r=pick(f[0]),a=pick(f[1]),n=f[2]?a+r:r+a;if(!used.has(n)){used.add(n);return n;}}return "Clube "+(used.size+1);}
function leagueTeams(lk){
  if(WORLD.teams[lk]) return WORLD.teams[lk];
  const used=new Set(Object.values(WORLD.teams).flat().map(t=>t.n)),real=CLUBS.filter(c=>LK(c)===lk);
  real.forEach(c=>used.add(c.n));
  const arr=real.slice(0,20).map(c=>({n:c.n,c:c.c,r:LEVEL[tierOf(c)]+rand(-2,2)}));
  const [lo,hi]=lk==="BR2"?[55,64]:["SAU","USA","JPN"].includes(lk)?[57,67]:["ARG","POR","HOL"].includes(lk)?[61,70]:[64,73];
  let tops=arr.filter(t=>t.r>=73).length;
  while(tops<3&&arr.length<20&&lk!=="BR2"){arr.push({n:fillerName(lk,used),c:pick(COLS),r:rand(73,79)});tops++;}
  while(arr.length<20) arr.push({n:fillerName(lk,used),c:pick(COLS),r:rand(lo,hi)});
  return WORLD.teams[lk]=arr;
}
function contPool(){
  const me=FL.club.n, ls=["BR","ARG"].includes(FL.club.l)?["BR","ARG"]:["ENG","ESP","ITA","ALE","FRA","POR","HOL"];
  return ls.flatMap(l=>leagueTeams(l)).filter(t=>t.n!==me).sort((a,b)=>b.r-a.r).slice(0,28);
}
const oppNear=(pool,target)=>{const s=pool.slice().sort((a,b)=>Math.abs(a.r-target)-Math.abs(b.r-target));return pick(s.slice(0,5));};
function maxTier(){const o=ovr(),bonus=FL.agente.n==="Elite Sports"?2:0;let m=1;for(let t=1;t<=5;t++) if(LEVEL[t]<=o+1+bonus) m=t;return m;}
function pickClub(t,abroad,exclude=[]){
  let pool=CLUBS.filter(x=>tierOf(x)===t&&x.n!==FL.club.n&&!exclude.includes(x.n)&&x.l!=="SAU"&&(!abroad||x.l!=="BR")&&(t<5||x.l!=="BR"));
  if(t<=2) pool=pool.concat([midClub(pick(UFS)[0])]);
  if(t===1) pool=[{n:"EC "+pick(["Itabirito","Mossoró","Caxias","Juazeiro","Criciúma","Anápolis","Marabá","Ituiutaba"]),l:"BR",t:1,c:["#334155","#F2B705"]}];
  return pool.length?pick(pool):null;
}
function selTournament(){
  const y=year();if(!FL.selecao) return null;
  const me=selObj(),sa=["Brasil","Argentina","Uruguai","Colômbia","Equador","México","Estados Unidos","Canadá"],eu=["França","Inglaterra","Espanha","Alemanha","Portugal","Holanda","Itália","Bélgica","Croácia","Suíça","Dinamarca"];
  let name,field;
  if((y-2026)%4===0){name="Copa do Mundo";field=SEL;}
  else if((y-2028)%4===0&&sa.includes(me.n)){name="Copa América";field=SEL.filter(s=>sa.includes(s.n));}
  else if((y-2028)%4===0&&eu.includes(me.n)){name="Eurocopa";field=SEL.filter(s=>eu.includes(s.n));}
  else return null;
  return C(`${name} ${y}`,"🌍","selecao",`Concentração da seleção de ${selPais()} ${me.f}. Véspera da estreia. Uns companheiros vão pular o muro pra uma festa.`,
    [O("🧘🏽","Concentração total",{cabeca:5},{then:()=>copaRun(1.5,name,field)}),O("🧗🏽","Pular o muro",{fama:4,cabeca:-8},{then:()=>copaRun(-3,name,field)})],{big:true});
}
function copaRun(mod,name,field){
  const y=year(),me=selObj(),str=me.r+(ovr()-80)*.2+mod,opp=field.filter(s=>s.n!==me.n),nm=`${name} ${y}`,big=name==="Copa do Mundo";
  const lines=[],sh=s=>`${s.f} ${s.n}`;let pts=0,g=0;
  const strong=opp.slice().sort((a,b)=>b.r-a.r).slice(0,Math.max(3,Math.ceil(opp.length/2))),weak=opp.filter(s=>!strong.includes(s));
  const grp=[pick(weak.length?weak:opp),pick(opp),pick(weak.length?weak:opp)].filter((v,i,a)=>a.indexOf(v)===i);
  for(const t of grp){const [a,b]=match(str,t.r);pts+=a>b?3:a===b?1:0;g+=poisson(golRate()*.9);lines.push(`<li><span>Grupos · ${sh(t)}</span><b>${a} × ${b}</b></li>`);}
  const fin=(cls,txt,fx,lg)=>{CAR.selJogos+=lines.length;CAR.selGols+=g;if(lg)log(lg);return C(nm,cls==="big"?"🏆":"💔",cls==="big"?"trofeu":"selecao",
    `<ul class="res">${lines.join("")}</ul>${txt}`,[O(cls==="big"?"🏆":"✈️",cls==="big"?"Desfilar em carro aberto":"Voltar pra casa",fx)],{[cls]:true});};
  if(pts<4&&!(pts===3&&chance(.4))) return fin("bad",`<p>Eliminado na fase de grupos. Seu nome nos memes do dia seguinte.</p>`,{fama:-6,cabeca:-6},`Eliminado na fase de grupos da ${nm}`);
  const fases=big?["Oitavas","Quartas","Semifinal"]:["Quartas","Semifinal"];
  for(const f of fases){const t=pick(f===fases[0]?opp:strong);let [a,b]=match(str,t.r),pen="";g+=poisson(golRate()*.8);
    if(a===b){pen=" (pên.)";chance(.5+(P.pos==="GOL"?.08:0))?a++:b++;}
    lines.push(`<li><span>${f} · ${sh(t)}</span><b>${a} × ${b}${pen}</b></li>`);
    if(b>a) return fin("bad",`<p>Eliminado ${fase(f)}. O avião volta em silêncio.</p>`,{fama:f==="Semifinal"?4:-3,cabeca:-5},`Eliminado ${fase(f)} da ${nm}`);}
  const t=pick(strong);
  const ops=P.pos==="GOL"?[["🧤","Sair do gol no lance",.04],["🧍🏽","Ficar na linha",0]]:["ATA","PON","MEI"].includes(P.pos)?[["💥","Chutar de primeira",.05],["🤝🏽","Tocar pro companheiro",.02]]:[["⬆️","Subir pro escanteio",.04],["🧱","Segurar a defesa",.02]];
  return C(`Final · ${nm}`,"🌍","estadio",`<ul class="res">${lines.join("")}</ul><p><b>Final contra ${sh(t)}.</b> Empate, minuto 88. A bola sobra pra você.</p>`,
    ops.map(([ic,l,b])=>O(ic,l,{},{then:()=>{
      let [a,bb]=match(str+b*50,t.r),pen="";if(a===bb){chance(.5+b)?a++:bb++;pen=" (pên.)";}
      const decisivo=a>bb&&chance(.5+b*4)&&P.pos!=="GOL";if(decisivo) g++;
      lines.push(`<li><span>Final · ${sh(t)}</span><b>${a} × ${bb}${pen}</b></li>`);
      if(a>bb){addTitle(nm);if(big) FL.copaAno=y;
        return fin("big",`<p><b>Campeão: ${nm}.</b> ${decisivo?"O gol do título foi seu. ":""}Você levanta a taça e pensa no sinal, no campinho, na chuteira da vitrine.</p>`,{fama:big?30:15,familia:10,cabeca:10},decisivo?`Fez o gol do título da ${nm}`:null);}
      return fin("bad",`<p>Vice-campeão. A medalha de prata pesa mais que a de ouro.</p>`,{fama:big?8:4,cabeca:-8},`Vice-campeão da ${nm}`);
    }})),{big:true});
}

/* ===================== Mundo e calendário ===================== */
function tierOf(c){return (WORLD&&WORLD.tier[c.n])||c.t;}
const LK=c=>c.l==="BR"&&tierOf(c)<=2?"BR2":c.l;
const offNow=(c=FL.club)=>(M-CAL[calOf(c)].start+12)%12;
const seasonLabel=c=>calOf(c)==="BR"?String(Y):(M>=7?`${Y}/${String(Y+1).slice(2)}`:`${Y-1}/${String(Y).slice(2)}`);
function initSeason(){
  const c=FL.club,lk=LK(c),teams=leagueTeams(lk),cal=CAL[calOf(c)],off=offNow(c);
  if(!teams.find(t=>t.n===c.n)){const fil=teams.filter(t=>!CLUBS.some(x=>x.n===t.n)).sort((a,b)=>a.r-b.r);
    const i=teams.indexOf(fil[0]||teams[teams.length-1]);teams[i]={n:c.n,c:c.c,r:LEVEL[tierOf(c)]+rand(-1,1)};}
  const tab=teams.map(t=>({n:t.n,c:t.c,r:t.r+rand(-1.5,1.5),P:0,J:0,V:0,E:0,D:0,GP:0,GC:0}));
  const L0=LANG[lk]||"en",mkName=()=>{const L=chance(.6)?L0:pick(["br","es","fr","en"]);const [f,s]=NAMES[L];return pick(f)+" "+pick(s);};
  const top=tab.filter(t=>t.n!==c.n).sort((a,b)=>b.r-a.r);
  const sc=Array.from({length:6},(_,i)=>({n:mkName(),club:top[Math.min(i*2,top.length-1)].n,g:0,a:0,rate:rand(.3,.58)+(i===0?.12:0),arate:rand(.12,.3)}));
  const meS={n:P.apelido,club:c.n,g:0,a:0,me:true},fresh=off===0;
  set({COMP:{lk,cal:calOf(c),label:seasonLabel(c),liga:lk==="BR2"?"Série B":LIGAS[c.l].n,tab,sc:sc.concat(meS),meS,ended:false,
    est:fresh&&c.l==="BR"?{pts:0,g:0,st:"1ª fase",alive:true,lines:[]}:null,
    copa:fresh&&LIGAS[c.l].copa?{st:"1ª fase",alive:true,lines:[]}:null,
    cont:fresh&&LIGAS[c.l].cont&&FL.contQual&&lk!=="BR2"?{pts:0,g:0,st:"Grupos",alive:true,lines:[],grp:null}:null,
    nome:{copa:LIGAS[c.l].copa,cont:LIGAS[c.l].cont},trans:!fresh}});
  if(!fresh){let n=0;for(let i=0;i<off;i++) n+=cal.rounds[i];simRounds(n,false);}
  set({SEA:{j:0,g:0,a:0,l:0,df:0,ns:0,nn:0,tit:[],pre:[],label:COMP.label,club:c.n}});
}
function share(){if(FL.lesao) return 0;const d=ovr()+(FL.mod||0)-LEVEL[tierOf(FL.club)];return (d>=0?.93:d>=-6?.55:.18)*(S.fad>80?.8:1);}
function role(){if(FL.lesao) return "Lesionado";const d=ovr()-LEVEL[tierOf(FL.club)];return d>=0?"Titular":d>=-6?"Rotação":"Reserva";}
function dfRate(){return {GOL:3,ZAG:2.2,VOL:2.4,LAT:1.6,MEI:.9,PON:.5,ATA:.3}[P.pos]*(ovr()/80);}
const CSB={GOL:.3,ZAG:.3,LAT:.2,VOL:.15};
function arRate(){return {ATA:.12,PON:.22,MEI:.27,VOL:.1,LAT:.13,ZAG:.03,GOL:.01}[P.pos]*(ovr()/80);}
function form(){return (FL.mod||0)-Math.max(0,S.fad-55)/9+(S.moral-50)/22;}
function myStr(){const c=FL.club,t=COMP.tab.find(x=>x.n===c.n),base=t?t.r:LEVEL[tierOf(c)];return base+(ovr()+form()-LEVEL[tierOf(c)])*.35*Math.max(share(),.15);}
function playMe(opp,comp,liga){
  const [a,b]=match(myStr()+1,opp.r);let rec={c:comp,o:opp.n,a,b,pl:false};
  if(chance(share())){SEA.j++;const f=1+form()*.04;
    const g=Math.min(a,poisson(golRate()*f*1.05)),as=Math.min(a-g,poisson(arRate()*f));
    // Defesas (goleiro) e desarmes contam na nota como os gols contam pro atacante
    const df=poisson(dfRate()*f*clamp(1+(opp.r-myStr())/40,.7,1.4)),dp=DEFP.includes(P.pos),cs=dp&&b===0;
    SEA.g+=g;SEA.a+=as;SEA.df=(SEA.df||0)+df;if(cs) SEA.l++;if(liga){COMP.meS.g+=g;COMP.meS.a+=as;}
    const nota=clamp(6.4+(ovr()-opp.r)/14+g*.7+as*.35+df*.04+(cs?CSB[P.pos]:0)+(a>b?.3:a<b?-.35:0)-(dp?b*.15:0)-Math.max(0,S.fad-65)/40+rand(-.5,.5),4.5,10);
    SEA.ns+=nota;SEA.nn++;Object.assign(rec,{pl:true,g,as,df,cs,nota});}
  if(REP) REP.matches.push(rec);
  return [a,b];
}
const upd=(t,f,a)=>{t.J++;t.GP+=f;t.GC+=a;if(f>a){t.V++;t.P+=3;}else if(f===a){t.E++;t.P++;}else t.D++;};
function simRounds(n,withMe=true){
  for(let r=0;r<n;r++){
    const idx=COMP.tab.map((_,i)=>i).sort(()=>Math.random()-.5);
    for(let k=0;k+1<idx.length;k+=2){const A=COMP.tab[idx[k]],B=COMP.tab[idx[k+1]];let a,b;
      if(withMe&&A.n===FL.club.n) [a,b]=playMe(B,"LIG",true); else if(withMe&&B.n===FL.club.n) [b,a]=playMe(A,"LIG",true); else [a,b]=match(A.r+1,B.r);
      upd(A,a,b);upd(B,b,a);}
    COMP.sc.forEach(s=>{if(!s.me&&chance(.88)){s.g+=poisson(s.rate);s.a+=poisson(s.arate);}});
  }
}
const sorted=()=>COMP.tab.slice().sort((x,y)=>y.P-x.P||(y.GP-y.GC)-(x.GP-x.GC)||y.GP-x.GP);
const myPos=()=>sorted().findIndex(t=>t.n===FL.club.n)+1;
const rankOf=k=>COMP.sc.slice().sort((a,b)=>b[k]-a[k]).findIndex(s=>s.me)+1;
function ko(opp,comp){let [a,b]=playMe(opp,comp,false),pen="";if(a===b){pen=" (pên.)";chance(.5+(P.pos==="GOL"?.08:0))?a++:b++;}return {win:a>b,s:`${a} × ${b}${pen}`};}
function addTitle(t){CAR.titulos.push(t);if(SEA) SEA.tit.push(t);log(`Campeão: ${t}`);}
const resLine=(f,opp,r)=>`<li><span>${f} · ${esc(opp.n)}</span><b>${r.s}</b></li>`;
function trophyCard(t,extra=""){return C("Título","🏆","trofeu",`<p style="font-size:1.25rem"><b>Campeão: ${esc(t)}</b></p>${extra}`,[O("🏆","Levantar a taça",{fama:6,cabeca:3,familia:3,moral:10})],{big:true});}
const pctN=()=>SEA&&SEA.nn?SEA.ns/SEA.nn:0;

/* ===================== Mês a mês ===================== */
function playMonth(){
  if(!COMP||COMP.ended) return;
  const c=FL.club,cal=CAL[COMP.cal],off=offNow(c);if(off>cal.end) return;
  const out=[];
  simRounds(cal.rounds[off]);
  const e=COMP.est,v=cal.est[off];
  if(e&&e.alive&&v!==undefined){const pool=leagueTeams("BR2").concat(leagueTeams("BR")).filter(t=>t.n!==c.n);
    if(typeof v==="number"){for(let i=0;i<v;i++){const op=oppNear(pool,rand(56,66)),[a,b]=playMe(op,"EST");e.pts+=a>b?3:a===b?1:0;e.g++;}e.st=`1ª fase · ${e.pts} pts`;}
    else{e.lines.push(`<li><span>1ª fase</span><b>${e.pts} pts</b></li>`);
      if(e.pts>=9||(e.pts>=7&&chance(.5))){
        for(const f of ["Quartas","Semifinal","Final"]){const op=oppNear(pool,f==="Final"?rand(66,74):rand(60,70)),r=ko(op,"EST");e.lines.push(resLine(f,op,r));
          if(!r.win){e.alive=false;e.st=f==="Final"?"Vice-campeão":`Caiu ${fase(f)}`;break;}}
        if(e.alive){e.alive=false;e.st="Campeão";addTitle(`Estadual ${Y}`);out.push(trophyCard(`Estadual ${Y}`));}
      } else {e.alive=false;e.st="Caiu na 1ª fase";}}}
  const cp=COMP.copa,st=cal.copa[off];
  if(cp&&cp.alive&&st!==undefined){const pool=leagueTeams(c.l==="BR"?"BR2":c.l).concat(leagueTeams(c.l==="BR"?"BR":c.l)).filter(t=>t.n!==c.n);
    if(st===4){cp.st="Final";const op=oppNear(pool,rand(70,78));out.push(()=>finalCard(COMP.nome.copa,op,cp));}
    else{const op=oppNear(pool,58+st*5+rand(-3,3)),r=ko(op,"COPA");cp.lines.push(resLine(STG[st],op,r));
      if(!r.win){cp.alive=false;cp.st=`Caiu ${fase(STG[st])}`;}else cp.st=STG[st+1];}}
  const ct=COMP.cont;
  if(ct&&ct.alive){const g=cal.contG[off];
    if(g){if(!ct.grp){const pool=contPool();ct.grp=[oppNear(pool,rand(70,80)),oppNear(pool,rand(66,74)),oppNear(pool,rand(62,70))];}
      for(let i=0;i<g;i++){const op=ct.grp[ct.g%3],[a,b]=playMe(op,"CONT");ct.pts+=a>b?3:a===b?1:0;ct.g++;}
      ct.st=`Grupos · ${ct.pts} pts`;
      if(ct.g>=6){ct.lines.push(`<li><span>Grupos · ${ct.grp.map(x=>esc(x.n)).join(", ")}</span><b>${ct.pts} pts</b></li>`);
        if(ct.pts>=11||(ct.pts>=8&&chance(.55))||(ct.pts>=7&&chance(.2))) ct.st="Oitavas"; else {ct.alive=false;ct.st="Caiu na fase de grupos";}}}
    const ks=cal.contK[off];
    if(ks&&ct.alive&&ct.g>=6){for(const f of ks){if(!ct.alive) break;
      if(f==="Final"){ct.st="Final";const op=oppNear(contPool(),rand(80,86));out.push(()=>finalCard(COMP.nome.cont,op,ct));break;}
      const op=oppNear(contPool(),{Oitavas:76,Quartas:79,Semifinal:81}[f]+rand(-2,2)),r=ko(op,"CONT");ct.lines.push(resLine(f,op,r));
      if(!r.win){ct.alive=false;ct.st=`Caiu ${fase(f)}`;}else ct.st=KSEQ[KSEQ.indexOf(f)+1];}}}
  if(off===cal.end) out.push(seasonEnd);
  Q.push(...out);
}
function agingDrift(){
  const capB=POT+8;
  const v=P.pos==="GOL"?2:0;
  if(AGE<=25) S.bola=Math.min(capB,clamp(S.bola+rand(0,2.5))); else if(AGE>=31+v) S.bola=clamp(S.bola-rand(1,3));
  if(AGE<=23) S.corpo=clamp(S.corpo+rand(1,3)); else if(AGE<=28+v) S.corpo=clamp(S.corpo+rand(0,2)); else S.corpo=clamp(S.corpo-rand(1.5,3.5));
  if(FL.club&&["SAU","USA"].includes(FL.club.l)) S.bola=clamp(S.bola-1.5);
  if(AGE>=24) S.cabeca=clamp(S.cabeca+.5);
  S.familia=clamp(S.familia+1.5);
}
function birthdayCard(){
  const s=salAtual();
  return C(`Seu aniversário: ${AGE} anos`,"🎂","festa",`${esc(P.apelido)} faz ${AGE} anos hoje. Como comemorar?`,
    [O("🎤","Festão com MC e camarote",{fama:4,fad:15,moral:6,g:-Math.max(2000,s*.04)},{sub:"Fama e cansaço"}),
     O("🍖","Churrasco com a família",{familia:8,moral:5},{sub:"Recarregar"}),
     O("🏋🏽","Treinar como num dia normal",{cabeca:3,bola:1},{sub:"Foco total"})]);
}
function preseason(){
  const lux=salAtual()>3e6;
  return C(`Pré-temporada ${FL.club?seasonLabelNext():""}`,"🗓️","academia",`Últimas semanas antes da nova temporada no ${esc(FL.club.n)}. Como você se prepara?`,
    [O("🏋🏽","Treino pesado particular",{bola:3,corpo:3,familia:-5,fad:12},{sub:"Mais evolução, risco de lesão",then:()=>chance(.12)?lesaoCard():null}),
     O("🧠","Psicólogo e estudo tático",{cabeca:6,bola:1},{sub:"Cabeça no lugar"}),
     O(lux?"🛥️":"🏖️",lux?"Férias de iate em Ibiza":"Férias com a família",lux?{familia:4,fama:4,corpo:-3,cabeca:-3,moral:8,sal:-.05,fad:-20}:{familia:8,corpo:2,moral:6,fad:-25},{sub:lux?"Fotos em todo lugar":"Recarregar"})]);
}
function seasonLabelNext(){const c=FL.club;return calOf(c)==="BR"?String(Y):(M>=7?`${Y}/${String(Y+1).slice(2)}`:`${Y}/${String(Y+1).slice(2)}`);}
function monthStart(){
  FL.en=FL.lesao?3:4;FL.acts={};
  if(M===BM&&FL.bday!==Y){FL.bday=Y;set({AGE:Y-BY});agingDrift();if([18,21,25,30,35].includes(AGE)||chance(.25)) Q.push(birthdayCard);}
  const c=FL.club,off=offNow(c);
  if((!COMP||COMP.ended)&&off===0) initSeason();
  if(off===(calOf(c)==="BR"?0:11)) Q.push(preseason);
  if(M===0||M===6) Q.push(()=>janela(M===0?"janeiro":"julho"));
  if(M===5) Q.push(selTournamentW);
  if(M===2||M===8) Q.push(selecaoCheck);
  if(chance(.4)) Q.push(...drawEvents(1));
  if(COMP&&!COMP.ended&&!FL.modM&&chance(.18)) Q.push(keyMoment);
}
function advance(){
  if(cur||busy) return;
  set({LASTCH:null,LASTO:ovr()});
  set({REP:{y:Y,m:M,matches:[],notes:[]}});
  const s0={...S},f0=CAR.fama;
  playMonth();
  if([2,8,10].includes(M)&&FL.selecao&&!FL.lesao){const g=poisson(golRate()*1.4);CAR.selJogos+=2;CAR.selGols+=g;REP.notes.push(`${selObj().f} Data FIFA pela seleção: 2 jogos${g?`, ${g} gol${g>1?"s":""}`:""}`);}
  const pl=REP.matches.filter(m=>m.pl),w=REP.matches.filter(m=>m.a>m.b).length,l=REP.matches.filter(m=>m.a<m.b).length;
  const avg=pl.length?pl.reduce((a,m)=>a+m.nota,0)/pl.length:0;
  S.fad=clamp(S.fad+pl.length*6-14-FL.en*4);
  if(AGE<29&&S.fad<60) S.corpo=clamp(S.corpo+.3);
  if(S.moral>50) S.cabeca=clamp(S.cabeca+.3);
  S.moral=clamp(S.moral+w*1.5-l*2+(avg?(avg-6.6)*3:0)+(S.familia<30?-3:0)+(50-S.moral)*.08);
  if(FL.lesao){FL.lesao--;if(!FL.lesao){REP.notes.push("✅ Liberado pelo departamento médico");log("Voltou de lesão");}}
  else if(pl.length){const p=.018+Math.max(0,S.fad-60)/300+Math.max(0,45-S.corpo)/300+(AGE>30?.01:0);
    if(chance(p)){const sev=pick([1,1,1,2,2,3,6]);FL.lesao=sev;S.corpo=clamp(S.corpo-sev*1.5);REP.notes.push(`🚑 Lesão: ${sev} ${sev>1?"meses":"mês"} fora`);log(`Lesionado por ${sev} ${sev>1?"meses":"mês"}`);
      if(sev>=3) Q.unshift(lesaoCard);}}
  const s=salAtual(),liq=(s*(1-FL.agente.com)-FL.gastos)/12;FL.g+=liq;CAR.ganhos+=s/12;CAR.salMax=Math.max(CAR.salMax,s);
  if(FL.modM){FL.modM--;if(!FL.modM) FL.mod=0;}
  CAR.peak=Math.max(CAR.peak,ovr());CAR.mvMax=Math.max(CAR.mvMax,mv());
  if(M===5||M===11) CAR.mvHist.push({t:`${MESC[M]}/${String(Y).slice(2)}`,v:mv()});
  REP.avg=avg;REP.w=w;REP.l=l;
  REP.ch={};["bola","corpo","cabeca","familia","fad","moral"].forEach(k=>{const d=S[k]-s0[k];if(Math.abs(d)>=.5) REP.ch[k]=d;});
  if(CAR.fama!==f0) REP.ch.fama=CAR.fama-f0;
  FEED.unshift(REP);if(FEED.length>30) FEED.pop();
  set({LASTCH:REP.ch});
  Q.push(()=>{set(M<11?{M:M+1}:{M:0,Y:Y+1});monthStart();return null;});
  if(FL.g<0&&!FL.faliu){FL.faliu=true;Q.unshift(C("Banco","🏦","dinheiro",`A conta zerou. Carros, mansão, festas: tudo tem parcela. Seu gerente liga três vezes por dia.`,
    [O("🏷️","Vender tudo e recomeçar",{fama:-10,cabeca:5,familia:5},{run:()=>{FL.g=0;FL.gastos=0;},log:"Faliu e vendeu tudo pra pagar as dívidas"}),
     O("🏦","Pegar empréstimo",{cabeca:-10,familia:-10},{run:()=>{FL.g=FL.g*.5;}})],{bad:true}));}
  const dead=STATS.find(x=>S[x.k]<=0);if(dead) return finish(dead.k);
  next();
}
function finalCard(comp,opp,obj){
  const gk=P.pos==="GOL",def=["ZAG","LAT","VOL"].includes(P.pos),lab=COMP.label;
  if(FL.lesao) {const r=ko(opp,"FINAL"),nm=`${comp} ${lab}`;obj.lines.push(resLine("Final",opp,r));
    if(r.win){obj.st="Campeão";addTitle(nm);return trophyCard(nm,`<p>Você viu a final da arquibancada, lesionado. ${esc(FL.club.n)} ${r.s} ${esc(opp.n)}.</p>`);}
    obj.st="Vice-campeão";return C(`Final · ${comp}`,"💔","estadio",`<p>Lesionado, você viu do camarote. ${esc(FL.club.n)} ${r.s} ${esc(opp.n)}. Vice.</p>`,[O("😞","Seguir",{moral:-6})],{bad:true});}
  const ops=gk?[["🧤","Sair do gol no lance",{corpo:-3}],["🧍🏽","Ficar na linha",{}]]:def?[["⬆️","Subir pro escanteio",{corpo:-2}],["🧱","Segurar a defesa",{}]]:[["💥","Chutar de primeira",{}],["🤝🏽","Tocar pro companheiro",{}]];
  return C(`Final · ${comp} ${lab}`,"🏆","estadio",`<p style="display:flex;gap:10px;align-items:center;justify-content:center">${crest(FL.club,30)}<b>${esc(FL.club.n)} × ${esc(opp.n)}</b>${crest(opp,30)}</p><p>Estádio lotado, empate no segundo tempo. A bola sobra pra você na hora H.</p>`,
    ops.map(([ic,l,fx],i)=>O(ic,l,fx,{sub:i===0?`Ousado · ${Math.round(clamp(45+(S.bola-60),10,90))}% de dar certo`:"Seguro",then:()=>{
      const ok=i===0&&chance(.45+(S.bola-60)/100),bonus=i===0?(ok?6:-4):1.5,r=ko({n:opp.n,r:opp.r-bonus},"FINAL"),nm=`${comp} ${lab}`;
      obj.lines.push(resLine("Final",opp,r));
      if(r.win){obj.st="Campeão";addTitle(nm);if(ok) log(`Decidiu a final da ${nm}`);
        return C(`Final · ${comp}`,"🏆","trofeu",`<p style="font-size:1.25rem"><b>${esc(FL.club.n)} ${r.s} ${esc(opp.n)}</b></p><p><b>Campeão da ${esc(comp)}!</b> ${ok?"O lance decisivo foi seu.":"Título do time inteiro."}</p>`,
          [O("🏆","Levantar a taça",{fama:ok?12:6,cabeca:4,familia:3,moral:12})],{big:true});}
      obj.st="Vice-campeão";log(`Vice da ${nm}`);
      return C(`Final · ${comp}`,"💔","estadio",`<p><b>${esc(FL.club.n)} ${r.s} ${esc(opp.n)}</b></p><p>Vice-campeão.${i===0&&!ok?" A jogada ousada não saiu, e a torcida não vai esquecer tão cedo.":""}</p>`,
        [O("😞","Engolir o vice",{cabeca:-6,moral:-10,fama:i===0&&!ok?-5:0})],{bad:true});
    }})),{big:true});
}
function moveDiv(from,to,t){const n=FL.club.n,A=leagueTeams(from),B=leagueTeams(to);
  const i=A.findIndex(x=>x.n===n);if(i<0) return;const me=A[i];
  const fil=B.filter(x=>!CLUBS.some(c=>c.n===x.n)).sort((a,b)=>to==="BR2"?b.r-a.r:a.r-b.r)[0];
  const j=B.indexOf(fil);if(j<0) return;
  me.r=LEVEL[t]+rand(-1,1);fil.r=to==="BR2"?rand(64,70):rand(56,62);A[i]=fil;B[j]=me;WORLD.tier[n]=t;}
const de=lg=>/^Brasileirão/.test(lg)?"do "+lg:"da "+lg;
function seasonEnd(){
  const c=FL.club,lg=COMP.liga,lab=COMP.label,pos=myPos(),nota=pctN(),o=ovr(),cards=[],pre=[];
  if(pos===1){addTitle(`${lg} ${lab}`);cards.push(trophyCard(`${lg} ${lab}`,`<p>${esc(c.n)} terminou em primeiro com ${sorted()[0].P} pontos.</p>`));}
  if(COMP.lk==="BR"&&pos>=17){moveDiv("BR","BR2",2);log(`Rebaixado com o ${c.n}`);
    cards.push(C("Rebaixamento","⬇️","estadio",`${esc(c.n)} terminou em ${pos}º e caiu pra Série B. A torcida apedrejou o ônibus.`,[O("😔","Encarar a Série B",{fama:-6,cabeca:-6,moral:-12})],{bad:true}));}
  if(COMP.lk==="BR2"&&pos<=4){moveDiv("BR2","BR",3);log(`Acesso à Série A com o ${c.n}`);
    cards.push(C("Acesso!","⬆️","trofeu",`${esc(c.n)} terminou em ${pos}º e subiu pra Série A. Carreata na cidade.`,[O("🎉","Comemorar o acesso",{fama:6,cabeca:4,moral:10})],{big:true}));}
  FL.contQual=!!LIGAS[c.l].cont&&COMP.lk!=="BR2"&&pos<=(COMP.lk==="BR"?6:4);
  const rv=COMP.sc.filter(s=>!s.me),rivG=Math.max(0,...rv.map(s=>s.g)),rivA=Math.max(0,...rv.map(s=>s.a));
  if(COMP.meS.g>0&&COMP.meS.g>=rivG) pre.push(`Artilheiro ${de(lg)} ${lab}`);
  if(COMP.meS.a>=5&&COMP.meS.a>=rivA) pre.push(`Rei das assistências ${de(lg)} ${lab}`);
  if(P.pos==="GOL"&&SEA.l>=15&&pos<=2) pre.push(`Luva de Ouro ${de(lg)} ${lab}`);
  const xer={ZAG:"Melhor zagueiro",LAT:"Melhor lateral",VOL:"Melhor volante"}[P.pos];
  if(xer&&SEA.j>=24&&nota>=7.2&&pos<=4&&(SEA.df||0)>=SEA.j*1.6&&chance(.6)) pre.push(`${xer} ${de(lg)} ${lab}`);
  if(nota>=7.5&&pos<=4&&SEA.j>=25&&chance(.55)) pre.push(`Craque ${de(lg)} ${lab}`);
  else if(nota>=7.1&&SEA.j>=20) pre.push(`Seleção ${de(lg)} ${lab}`);
  if(AGE<=21&&nota>=7&&SEA.j>=18) pre.push(`Revelação ${de(lg)} ${lab}`);
  const wonCont=SEA.tit.some(t=>/^(Champions|Libertadores)/.test(t));
  if(o>=89&&nota>=7.4&&tierOf(c)>=4&&chance(.08+(o-89)*.04+(wonCont?.18:0)+(FL.copaAno&&Y-FL.copaAno<=1?.3:0)+(pre.some(p=>p.startsWith("Artilheiro"))?.08:0))) pre.push(`Bola de Ouro ${Y}`);
  CAR.premios.push(...pre);SEA.pre=pre;pre.forEach(p=>log(`Prêmio: ${p}`));
  if(pre.some(p=>p.startsWith("Bola de Ouro"))) log("Eleito o melhor jogador do mundo");
  closeSeason(pos);
  CAR.fama=clamp(CAR.fama+(nota-6.6)*4+SEA.tit.length*3+pre.length*5+(tierOf(c)-3));
  if(AGE<=20&&o>=74) FL.promessa=true;
  COMP.ended=true;
  FL.contrato.temp--;
  if(FL.emprestimo) cards.push(fimEmprestimo); else if(FL.contrato.temp<=0) cards.push(renewal);
  if(AGE>=33) cards.push(retireCheck);
  Q.unshift(...cards);
  const bola=pre.some(p=>p.startsWith("Bola de Ouro"));
  const tabMini=()=>{const t=sorted(),rows=t.slice(0,4);if(pos>4) rows.push(t[pos-1]);
    return `<ul class="res">${rows.map(x=>`<li class="${x.n===c.n?"me":""}"><span>${t.indexOf(x)+1}º ${esc(x.n)}</span><b>${x.P} pts</b></li>`).join("")}</ul>`;};
  return C(`Fim da temporada ${lab}`,bola?"🥇":SEA.tit.length?"🏆":"📒",bola||SEA.tit.length?"trofeu":"estadio",
    `${seasonBox()}<p><b>${esc(lg)}:</b> ${pos}º lugar</p>${tabMini()}
     ${SEA.tit.length?`<p><b>Títulos</b></p><ul class="tl">${SEA.tit.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:"<p>Nenhum título nesta temporada.</p>"}
     ${pre.length?`<p><b>Prêmios</b></p><ul class="tl">${pre.map(t=>`<li>${esc(t)}</li>`).join("")}</ul>`:""}
     <p class="small">Valor de mercado: ${fmt(mv())}</p>`,
    [O("➡️","Seguir",{})],{big:bola||SEA.tit.length>0});
}
function seasonBox(){const n=pctN(),[k1,k2]=keyStats();
  return `<div class="sea"><div><b>${SEA.j}</b>jogos</div><div><b>${SEA[k1]||0}</b>${statName(k1)}</div><div><b>${SEA[k2]||0}</b>${statName(k2)}</div><div><b>${n?n.toFixed(1):"–"}</b>nota média</div><div><b>${ovr()}</b>overall</div><div><b>${role()}</b>&nbsp;</div></div>`;}
function closeSeason(pos,club){
  if(!SEA||SEA.closed) return;SEA.closed=true;
  CAR.jogos+=SEA.j;CAR.gols+=SEA.g;CAR.assist+=SEA.a;CAR.limpas+=SEA.l;CAR.def=(CAR.def||0)+(SEA.df||0);
  if(SEA.j||SEA.tit.length) CAR.hist.push({y:SEA.label,club:club||SEA.club,j:SEA.j,g:SEA.g,a:SEA.a,l:SEA.l,df:SEA.df||0,nota:pctN(),pos:pos||0,tit:SEA.tit.length});
}

function retireCheck(){
  const o=ovr();
  if(AGE>=(P.pos==="GOL"?41:39)||(AGE>=33&&o<60)) return C("Fim da linha","👟","aposentadoria",`Aos ${AGE}, nenhum clube liga mais. O corpo avisa antes da cabeça aceitar.`,[O("👟","Pendurar as chuteiras",{},{end:"aposentou"})],{big:true});
  return C("Fim de temporada","👟","aposentadoria",`Aos ${AGE}, você sente o joelho de manhã. A família pergunta se não está na hora.`,
    [O("💪🏽","Mais uma temporada",{}),O("👟","Pendurar as chuteiras",{},{end:"aposentou"})]);
}
function selTournamentW(){
  if(!FL.selecao) return null;const t=selTournament();if(!t) return null;
  if(FL.lesao) {log(`Cortado da convocação por lesão`);return C(t.who,"💔","hospital",`A lesão te tirou da lista final. Você vai assistir ao torneio de casa.`,[O("📺","Assistir de casa",{moral:-15,cabeca:-4})],{bad:true});}
  return t;
}
// Cada momento-chave sai no máximo 3 vezes por carreira, nunca dois iguais em seguida
function keyMoment(){if(!COMP||COMP.ended) return null;FL.kmN=FL.kmN||{};const pool=KM.filter(k=>k.id!==FL.lastKM&&(FL.kmN[k.id]||0)<3&&(!k.cond||k.cond()));if(!pool.length) return null;
  FL.mod=0;const k=pick(pool);FL.lastKM=k.id;FL.kmN[k.id]=(FL.kmN[k.id]||0)+1;return Object.assign(k.mk(),{km:true});}

function startPro(sal){
  set({PHASE:"pro",WORLD:{tier:{},teams:{}}});FL.formador=FL.club;CAR.clubes.push(FL.club.n);FL.contrato={salario:sal,temp:3};FL.gastos=0;FL.mod=0;
  if(!FL.agente) FL.agente={n:"Sem empresário",com:0,mult:.7};
  FL.contQual=tierOf(FL.club)>=4||(tierOf(FL.club)===3&&chance(.35));
  set({Y:BY+17+(BM>0?1:0),M:0});FL.proY=Y;set({AGE:Y-BY-(BM>0?1:0)});FL.bday=BM===0?Y:null;
  Q.push(()=>{monthStart();return null;});
  return C("Capítulo 1","🎬","estadio",`<p><b>O profissional.</b></p><p>${esc(P.apelido)}, ${posName().toLowerCase()}, camisa ${P.numero}. Janeiro de ${Y}. Os olheiros dizem que você pode chegar a ${potStars()}. Mas potencial não ganha jogo.</p><p class="small">Agora a vida anda mês a mês. Use a aba Ações pra treinar, curtir, cuidar da cabeça e do bolso, e avance o mês quando estiver pronto.</p>`,
    [O("⚽","Entrar em campo")],{big:true,age:17,chap:"Fim do prólogo"});
}
/* ===================== Motor de cartas ===================== */
function next(){
  set({cur:null});
  while(Q.length){let it=Q.shift();if(typeof it==="function") it=it();if(!it) continue;if(it.cond&&!it.cond()) continue;
    if(it.age&&PHASE!=="pro") set({AGE:it.age});set({cur:it});break;}
  if(PHASE==="end") return;
  if(!cur&&PHASE==="pro") saveGame();
  renderAll();
}
function choose(i){
  if(busy||!cur) return;const o=cur.opts[i];if(!o) return;set({busy:true});
  const ch={},g0=FL.g;if(!cur.result) set({LASTO:ovr()});
  applyFx(o.fx,ch);if(o.g) FL.g+=o.g;if(o.set) Object.assign(FL,o.set);if(o.club) setClub(o.club);if(o.run) o.run();if(o.log) log(o.log);
  if(cur.km) FL.modM=2;
  if(FL.g!==g0) ch.g=FL.g-g0;if(!cur.result) set({LASTCH:ch});
  set({busy:false,cur:null});
  if(o.end) return finish(o.end);
  const dead=STATS.find(s=>S[s.k]<=0);if(dead) return finish(dead.k);
  FL.warn=FL.warn||{};STATS.forEach(s=>{if(S[s.k]>35) FL.warn[s.k]=false;});
  const low=STATS.find(s=>S[s.k]<=15&&!FL.warn[s.k]);if(low){FL.warn[low.k]=true;Q.unshift(WARN[low.k]());}
  if(o.then){const n=o.then();if(n) Q.unshift(n);}
  next();
}

export {selecaoCheck,match,golRate,fillerName,leagueTeams,contPool,maxTier,pickClub,selTournament,copaRun,tierOf,initSeason,share,role,arRate,form,myStr,playMe,simRounds,ko,addTitle,trophyCard,playMonth,agingDrift,birthdayCard,preseason,seasonLabelNext,monthStart,advance,finalCard,moveDiv,seasonEnd,seasonBox,closeSeason,retireCheck,selTournamentW,keyMoment,startPro,next,choose,ligaNome,selPais,selObj,oppNear,LK,offNow,seasonLabel,upd,sorted,myPos,rankOf,resLine,pctN,de};
