import {$,C,CAL,LEVEL,LIGAS,MES,MESC,O,POS,STATS,STG,calOf,chance,esc,fmt,ufNome} from "./data.js";
import {AGE,CAR,keyStats,statName,COMP,CTAB,FEED,FL,LASTCH,LASTO,LOG,M,P,PHASE,Q,S,SEA,TAB,Y,cur,log,mv,ovr,posName,salAtual,set,year} from "./state.js";
import {crest,scene,shirt} from "./art.js";
import {advance,choose,ligaNome,myPos,next,offNow,pctN,role,selObj,selPais,sorted,tierOf} from "./engine.js";
import {ACTS,FXI,applyFx,canDo,doAction,pc} from "./actions.js";
import {group} from "./main.js";

function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));$(id).classList.add("on");window.scrollTo(0,0);}
const rc=n=>n>=8.5?"#1C5DFF":n>=7.5?"#12A150":n>=7?"#7AB800":n>=6.5?"#D9A400":n>=6?"#E07B00":"#DA2E3A";
const rtag=n=>n?`<span class="rt" style="background:${rc(n)}">${n.toFixed(1)}</span>`:`<span class="rt x">–</span>`;
/* ===================== Criação ===================== */
function chips(el,name,items,labelFn,def){el.innerHTML=items.map((it,i)=>{const v=typeof it==="string"?it:it.id;
  return `<input type="radio" name="${name}" id="${name}-${i}" value="${v}" ${v===def?"checked":""}><label for="${name}-${i}">${labelFn(it)}</label>`;}).join("");}
function readForm(){const nome=$("f-nome").value.trim();
  return {nome,apelido:$("f-apelido").value.trim()||nome.split(/\s+/)[0]||"",numero:parseInt($("f-num").value,10),nasc:$("f-nasc").value,
    pos:document.querySelector('input[name="pos"]:checked').value,pe:document.querySelector('input[name="pe"]:checked').value,uf:$("f-uf").value};}
function updateShirt(){const f=readForm();
  $("c-shirt").innerHTML=shirt(null,isNaN(f.numero)?"?":f.numero,56);
  $("shirt-nick").textContent=f.apelido||"Seu apelido";
  const d=f.nasc?new Date(f.nasc+"T12:00:00"):null;
  $("shirt-meta").textContent=`${POS.find(p=>p.id===f.pos).n}, ${f.pe.toLowerCase()}${" · "+ufNome(f.uf)}${d?` · nascido em ${d.getFullYear()}`:""}`;}
/* ===================== Interface ===================== */
const dchip=d=>d&&Math.round(d)?`<em class="dl ${d>0?"up":"dn"}">${d>0?"+":""}${Math.round(d)}</em>`:"";
function renderAll(){
  const pro=PHASE==="pro";
  $("bnav").hidden=!pro;
  renderBar();
  if(!pro){set({TAB:"home"});}
  document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("on",t.id==="t-"+TAB));
  document.querySelectorAll("#bnav button").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===TAB?"page":"false"));
  if(TAB==="home") renderHome(); else if(TAB==="acts") renderActs(); else if(TAB==="comp") renderComp(); else if(TAB==="merc") renderMerc(); else renderPerf();
  renderSheet();
}
function renderBar(){
  const cl=FL.club;
  $("h-ava").innerHTML=shirt(cl?cl.c:null,P.numero,44);
  $("h-nick").textContent=P.apelido;
  $("h-club").innerHTML=cl?`${crest(cl,14)}${esc(cl.n)} · ${PHASE==="pro"?role():"base"}`:ufNome(P.uf);
  $("h-date").textContent=PHASE==="pro"?`${MESC[M]} ${Y} · ${AGE} anos`:`${year()} · ${AGE} anos`;
}
function attrsHtml(){
  const ch=LASTCH||{},o=ovr();
  return `<div class="ovrbox"><span class="o">${o}</span><div class="t"><b>Overall ${LASTO!==null?dchip(o-LASTO):""}</b><br>${PHASE==="pro"?`Valor de mercado ${fmt(mv())}`:"Categorias de base"} · potencial ${FL.potTxt}</div></div>
    <div class="attrs">${STATS.map(s=>{const v=Math.round(S[s.k]);return `<div class="attr"><div class="lb"><span>${s.ic} ${s.n}</span><b>${v}${dchip(ch[s.k])}</b></div><div class="bar ${v<=20?"low":""}"><i style="width:${v}%"></i></div></div>`;}).join("")}</div>`;
}
function agenda(){
  if(!COMP||COMP.ended){const c=FL.club,cal=CAL[calOf(c)],off=offNow(c);return [`🌴 Pré-temporada: ${esc(c.n)} volta a jogar em ${MES[cal.start]}`];}
  const cal=CAL[COMP.cal],off=offNow(),L=[];
  if(cal.rounds[off]) L.push(`🏟️ ${esc(COMP.liga)}: ${cal.rounds[off]} rodadas`);
  if(COMP.est&&COMP.est.alive&&cal.est[off]!==undefined) L.push(`🗺️ Estadual: ${cal.est[off]==="ko"?"mata-mata":"1ª fase"}`);
  if(COMP.copa&&COMP.copa.alive&&cal.copa[off]!==undefined) L.push(`🥇 ${esc(COMP.nome.copa)}: ${STG[cal.copa[off]]}`);
  if(COMP.cont&&COMP.cont.alive&&(cal.contG[off]||cal.contK[off])) L.push(`🌎 ${esc(COMP.nome.cont)}: ${cal.contG[off]?"fase de grupos":cal.contK[off].join(" e ")}`);
  if([2,8,10].includes(M)&&FL.selecao) L.push(`${selObj().f} Data FIFA com a seleção`);
  if(M===0||M===6) L.push("🪟 Janela de transferências aberta");
  if(M===5&&FL.selecao&&(Y%4===2||Y%4===0)) L.push(`🌍 ${Y%4===2?"Copa do Mundo":"Torneio continental de seleções"}`);
  return L.length?L:["😴 Sem jogos neste mês"];
}
function renderHome(){
  const h=$("t-home");
  if(PHASE!=="pro"){
    h.innerHTML=`<div class="card"><div class="month"><b>${cur&&cur.chap?esc(cur.chap):"Base"}</b><span class="pill live">${AGE} anos · ${year()}</span></div>
      <p class="note">A infância e a base passam carta a carta. A vida mês a mês começa no profissional.</p></div><div class="card">${attrsHtml()}</div>`;
    return;}
  const nxt=M===11?MES[0]:MES[M+1],pend=!!cur,en=FL.en;
  const alerts=[];
  if(FL.lesao) alerts.push(`<div class="alert">🚑 Lesionado: ${FL.lesao} ${FL.lesao>1?"meses":"mês"} fora</div>`);
  if(S.fad>=70&&!FL.lesao) alerts.push(`<div class="alert w">😮‍💨 Cansaço alto: risco de lesão maior e rendimento menor</div>`);
  if(S.moral<=30) alerts.push(`<div class="alert w">😔 Moral baixa: seu rendimento está caindo</div>`);
  const t=COMP&&!COMP.ended?sorted():null,pos=t?myPos():0,me=t?t[pos-1]:null,n=pctN();
  h.innerHTML=`<div class="card"><div class="month"><b>${MES[M]} de ${Y}</b><span class="energy" aria-label="Energia ${en} de 4">${[0,1,2,3].map(i=>`<i class="${i<en?"on":""}"></i>`).join("")}</span></div>
      <ul class="agenda">${agenda().map(x=>`<li>${x}</li>`).join("")}</ul>
      ${alerts.join("")}
      <div class="meters"><div class="meter"><div class="lb"><span>😮‍💨 Cansaço</span><b>${Math.round(S.fad)}${dchip((LASTCH||{}).fad)}</b></div><div class="bar fad"><i style="width:${S.fad}%"></i></div></div>
      <div class="meter"><div class="lb"><span>😊 Moral</span><b>${Math.round(S.moral)}${dchip((LASTCH||{}).moral)}</b></div><div class="bar mor"><i style="width:${S.moral}%"></i></div></div></div>
      <p class="note" style="margin:10px 0 0">⚡ ${en} de energia para ações neste mês. Energia não usada vira descanso.</p></div>
    <div class="cta"><button class="btn" id="b-adv" ${pend?"disabled":""}>${pend?"Resolva a decisão pendente":`Avançar para ${nxt} ▶`}</button></div>
    ${me?`<div class="card"><h3>Temporada ${esc(COMP.label)}<small>${esc(COMP.liga)} · rodada ${me.J}/38</small></h3>
      <div class="minirow"><div><b>${me.J?pos+"º":"–"}</b><span>posição</span></div>${keyStats().map(k=>`<div><b>${SEA[k]||0}</b><span>${statName(k)}</span></div>`).join("")}<div><b>${n?n.toFixed(1):"–"}</b><span>nota</span></div></div></div>`:""}
    <div class="card">${attrsHtml()}</div>
    <div class="card"><h3>Últimos meses</h3>${FEED.length?`<ul class="feed">${FEED.slice(0,8).map(feedItem).join("")}</ul>`:`<p class="empty">Avance o mês para começar a temporada.</p>`}</div>`;
  const b=$("b-adv");if(b) b.onclick=advance;
}
function feedItem(r){
  const pl=r.matches,res=m=>m.a>m.b?"V":m.a===m.b?"E":"D";
  const sum=k=>pl.reduce((a,m)=>a+(m[k]||0),0),tot={g:sum("g"),a:sum("as"),l:pl.filter(m=>m.pl&&m.cs).length,df:sum("df")};
  const CP={LIG:"Liga",EST:"Est.",COPA:"Copa",CONT:"Cont.",FINAL:"Final"};
  return `<li><div class="fh"><b>${MES[r.m]} ${r.y}</b><span class="form">${pl.slice(0,8).map(m=>`<i class="${res(m)}">${res(m)}</i>`).join("")}</span></div>
    <div class="note">${pl.length?`${pl.length} jogos · ${r.w}V ${pl.length-r.w-r.l}E ${r.l}D · ${keyStats().map(k=>`${tot[k]} ${statName(k)}`).join(" · ")} · nota ${r.avg?r.avg.toFixed(1):"–"}`:"Sem jogos"}</div>
    ${r.notes.length?`<ul class="notes">${r.notes.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
    ${pl.length?`<details><summary>Ver jogos</summary><ul class="mt">${pl.map(m=>`<li><span class="cp">${CP[m.c]||m.c}</span><span>${esc(m.o)}</span><span class="sc">${m.a}–${m.b}</span>${m.pl?rtag(m.nota):'<span class="rt x">–</span>'}</li>`).join("")}</ul></details>`:""}</li>`;
}
function renderActs(){
  const h=$("t-acts"),grps=[...new Set(ACTS.map(a=>a.grp))];
  h.innerHTML=`<div class="card"><div class="month"><b>Ações do mês</b><span class="energy" aria-label="Energia ${FL.en} de 4">${[0,1,2,3].map(i=>`<i class="${i<FL.en?"on":""}"></i>`).join("")}</span></div>
    <p class="note" style="margin:6px 0 0">As chances mudam com os seus atributos. Cabeça alta reduz polêmicas, cansaço alto aumenta o risco de lesão.</p></div>
    ${grps.map(g=>`<div class="act-g"><h4>${g}</h4>${ACTS.filter(a=>a.grp===g&&(!a.cond||a.cond()||true)).map(a=>{
      const ok=canDo(a),cost=a.cost?a.cost():0,used=FL.acts[a.id]||0,hide=a.cond&&!a.cond();
      if(hide) return "";
      const odds=a.outs().filter(o=>o.p>0).map(o=>`<span class="${o.bad?"r":"g"}"><b>${Math.round(o.p*100)}%</b>${esc(o.t)}</span>`).join("");
      const fixed=Object.entries(a.fx).filter(([,v])=>v).map(([k,v])=>`<span><b>${v>0?"+":""}${v}</b>${FXI[k]}</span>`).join("");
      return `<button class="act" data-a="${a.id}" ${ok?"":"disabled"}><span class="ic" aria-hidden="true">${a.ic}</span><span><span class="n">${a.n}</span><span class="d" style="display:block">${a.d}</span><span class="odds">${fixed}${odds}</span></span>
        <span class="cost"><span class="e">${a.en?"⚡".repeat(a.en):"grátis"}</span>${cost?`<br>${fmt(cost)}`:""}<br>${used}/${a.lim}</span></button>`;}).join("")}</div>`).join("")}`;
  h.querySelectorAll(".act").forEach(b=>b.onclick=()=>doAction(b.dataset.a));
}
function renderComp(){
  const h=$("t-comp");
  if(!COMP){h.innerHTML=`<div class="card"><h3>Pré-temporada</h3><p class="note">${esc(FL.club.n)} começa a temporada em ${MES[CAL[calOf(FL.club)].start]}.</p></div>`+histCard();return;}
  const segs=[["liga","Liga"],["copas","Copas"],["art","Artilharia"],["cal","Calendário"]];
  let body="";
  if(CTAB==="liga"){const t=sorted(),z=COMP.lk==="BR"?6:4,rel=COMP.lk==="BR";
    body=`<div class="card"><h3>${esc(COMP.liga)} ${esc(COMP.label)}<small>${COMP.ended?"encerrado":`rodada ${t[0].J}/38`}</small></h3><div class="tw"><table><thead><tr><th>#</th><th>Clube</th><th class="n">J</th><th class="n">V</th><th class="n">E</th><th class="n">D</th><th class="n">SG</th><th class="n">P</th></tr></thead><tbody>${
      t.map((x,i)=>`<tr class="${x.n===FL.club.n?"me":""}"><td><span class="zone ${i===0?"t":i<z&&LIGAS[FL.club.l].cont&&COMP.lk!=="BR2"?"c":(rel&&i>=16)||(COMP.lk==="BR2"&&i<4)?"r":""}"></span>${i+1}</td><td><span class="cl">${crest(x,14)}${esc(x.n)}</span></td><td class="n">${x.J}</td><td class="n">${x.V}</td><td class="n">${x.E}</td><td class="n">${x.D}</td><td class="n">${x.GP-x.GC}</td><td class="n"><b>${x.P}</b></td></tr>`).join("")}</tbody></table></div>
      <p class="note" style="margin:8px 0 0">${COMP.lk==="BR2"?"Amarelo: título · vermelho: acesso à Série A":`Amarelo: título · azul: vaga continental${rel?" · vermelho: rebaixamento":""}`}</p></div>`;}
  else if(CTAB==="copas"){const box=(nm,o)=>o?`<div class="card"><h3>${esc(nm)}<span class="pill ${/Campeão/.test(o.st)?"win":/Caiu|Vice/.test(o.st)?"out":"live"}">${esc(o.st)}</span></h3>${o.lines.length?`<ul class="res">${o.lines.join("")}</ul>`:`<p class="empty">Ainda não começou.</p>`}</div>`:"";
    body=box("Estadual",COMP.est)+box(COMP.nome.copa,COMP.copa)+box(COMP.nome.cont,COMP.cont)+(COMP.trans?`<div class="card"><p class="note">Você chegou no meio da temporada e não foi inscrito nas copas.</p></div>`:"")+(!COMP.est&&!COMP.copa&&!COMP.cont&&!COMP.trans?`<div class="card"><p class="empty">Seu clube não disputa copas nesta temporada.</p></div>`:"");}
  else if(CTAB==="art"){const sl=k=>COMP.sc.slice().sort((a,b)=>b[k]-a[k]).map((x,i)=>`<tr class="${x.me?"me":""}"><td>${i+1}</td><td>${esc(x.n)}</td><td>${esc(x.club)}</td><td class="n"><b>${x[k]}</b></td></tr>`).join("");
    body=`<div class="card"><h3>Artilharia<small>${esc(COMP.liga)}</small></h3><div class="tw"><table><tbody>${sl("g")}</tbody></table></div></div><div class="card"><h3>Assistências<small>${esc(COMP.liga)}</small></h3><div class="tw"><table><tbody>${sl("a")}</tbody></table></div></div>`;}
  else {const cal=CAL[COMP.cal];body=`<div class="card"><h3>Calendário<small>temporada ${esc(COMP.label)}</small></h3><ul class="stages">${Array.from({length:12},(_,i)=>{const mi=(cal.start+i)%12,L=[];
      if(cal.rounds[i]) L.push(`${cal.rounds[i]} rodadas`);if(COMP.est&&cal.est[i]!==undefined) L.push("Estadual");if(cal.copa[i]!==undefined&&COMP.copa) L.push(`Copa: ${STG[cal.copa[i]]}`);
      if(COMP.cont&&(cal.contG[i]||cal.contK[i])) L.push(cal.contG[i]?"Grupos cont.":cal.contK[i].join("/"));if(mi===0||mi===6) L.push("🪟 Janela");
      return `<li style="${mi===M?"font-weight:700;color:var(--pri)":""}"><span style="text-transform:capitalize">${MES[mi]}</span><span>${L.join(" · ")||"—"}</span></li>`;}).join("")}</ul></div>`;}
  h.innerHTML=`<div class="seg" role="group">${segs.map(([k,l])=>`<button data-c="${k}" aria-pressed="${CTAB===k}">${l}</button>`).join("")}</div>${body}`;
  h.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>{set({CTAB:b.dataset.c});renderComp();});
}
function spark(){
  const d=CAR.mvHist.slice(-16);if(d.length<2) return `<p class="empty">O gráfico aparece depois de alguns meses.</p>`;
  const mx=Math.max(...d.map(x=>x.v)),pts=d.map((x,i)=>`${(i/(d.length-1)*300).toFixed(1)},${(64-x.v/mx*58).toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 300 70" preserveAspectRatio="none" role="img" aria-label="Evolução do valor de mercado"><polyline points="${pts}" fill="none" stroke="var(--pri)" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg><div class="kv"><span>${d[0].t}</span><b>${fmt(d[d.length-1].v)} hoje</b></div>`;
}
function renderMerc(){
  const h=$("t-merc"),c=FL.club,s=salAtual(),janelaAberta=M===0||M===6;
  const canAum=FL.aumento!==(COMP?COMP.label:Y)&&FL.en>=1,canNeg=!FL.forcar&&FL.en>=1;
  h.innerHTML=`<div class="card"><h3>Contrato<small>${FL.emprestimo?`emprestado pelo ${esc(FL.emprestimo.from.n)}`:""}</small></h3>
      <div class="kv"><span>Clube</span><b class="cl" style="justify-content:flex-end">${crest(c,16)}${esc(c.n)}</b></div>
      <div class="kv"><span>Liga</span><b>${ligaNome(c)} · ${LIGAS[c.l].pais}</b></div>
      <div class="kv"><span>Salário</span><b>${fmt(s)}/ano · ${fmt(s/12)}/mês</b></div>
      <div class="kv"><span>Duração</span><b>mais ${Math.max(0,FL.contrato.temp)} temporada${FL.contrato.temp===1?"":"s"}</b></div>
      <div class="kv"><span>Empresário</span><b>${esc(FL.agente.n)} · ${Math.round(FL.agente.com*100)}%</b></div>
      <div class="kv"><span>Situação no elenco</span><b>${role()}</b></div></div>
    <div class="card"><h3>Valor de mercado<small>pico ${fmt(CAR.mvMax)}</small></h3>${spark()}</div>
    <div class="card"><h3>Finanças</h3>
      <div class="kv"><span>Saldo</span><b>${fmt(FL.g)}</b></div>
      <div class="kv"><span>Salário líquido por mês</span><b>${fmt(s*(1-FL.agente.com)/12)}</b></div>
      <div class="kv"><span>Gastos fixos por mês</span><b>${fmt(FL.gastos/12)}</b></div>
      <div class="kv"><span>Ganhou na carreira</span><b>${fmt(CAR.ganhos)}</b></div></div>
    <div class="card"><h3>Mercado<span class="pill ${janelaAberta?"live":""}">${janelaAberta?"Janela aberta":`Próxima janela: ${M<6?"julho":"janeiro"}`}</span></h3>
      <div class="stack" style="margin-top:4px">
        <button class="btn ghost wide" id="m-aum" ${canAum?"":"disabled"}>📈 Pedir aumento à diretoria · ⚡</button>
        <button class="btn ghost wide" id="m-neg" ${canNeg?"":"disabled"}>🧳 Pedir pra ser negociado na janela · ⚡</button>
        <button class="btn ghost wide" id="m-ag" ${FL.en>=1&&FL.agTroca!==Y?"":"disabled"}>💼 Conversar sobre empresário · ⚡</button>
      </div><p class="note" style="margin:8px 0 0">Aumento: uma vez por temporada. Pedir pra sair garante proposta na próxima janela, mas a torcida não gosta.</p></div>`;
  $("m-aum").onclick=()=>{FL.en--;FL.aumento=COMP?COMP.label:Y;const p=pc(.25+(pctN()-6.8)*.25+(ovr()-LEVEL[tierOf(c)])/40);
    const ok=chance(p);set({LASTO:ovr()});const ch={};if(ok){FL.contrato.salario*=1.15;applyFx({moral:6},ch);log(`Conseguiu aumento de 15% no ${c.n}`);}else applyFx({moral:-5,cabeca:-1},ch);set({LASTCH:ch});
    Q.unshift(C("Diretoria","📈","contrato",`<ul class="rolls"><li class="${ok?"hit":"miss"}"><span>${ok?"✔ Aumento de 15% aprovado":"✖ A diretoria negou"}</span><b>${Math.round(p*100)}%</b></li></ul>`,[O("👍","Ok",{})],{result:true}));next();};
  $("m-neg").onclick=()=>{FL.en--;FL.forcar=true;const ch={};applyFx({fama:-3,moral:-2},ch);set({LASTCH:ch});log(`Pediu pra ser negociado pelo ${c.n}`);
    Q.unshift(C("Diretoria","🧳","contrato",`A diretoria vai te colocar no mercado na próxima janela (${M<6?"julho":"janeiro"}). A torcida já sabe.`,[O("👍","Ok",{})],{result:true}));next();};
  $("m-ag").onclick=()=>{FL.en--;FL.agTroca=Y;const multa=FL.agente.n==="Marquinhos"?salAtual()*.3:0;
    Q.unshift(C("Empresários","🏢","empresario",`Três caminhos pra sua carreira.${multa?` Romper com o Marquinhos custa ${fmt(multa)} de multa.`:""}`,
      [O("🏢","Elite Sports",{g:-multa},{sub:"12% de comissão · mais propostas e clubes maiores",set:{agente:{n:"Elite Sports",com:.12,mult:1.4}},log:"Assinou com a Elite Sports"}),
       O("🧍🏽","Me representar sozinho",{g:-multa},{sub:"0% · menos propostas",set:{agente:{n:"Sem empresário",com:0,mult:.6}}}),
       O("🤝🏽",`Manter ${FL.agente.n==="Sem empresário"?"como está":FL.agente.n}`,{},{sub:`${Math.round(FL.agente.com*100)}% de comissão`})]));next();};
}
const careerStat=k=>({g:CAR.gols,a:CAR.assist,l:CAR.limpas,df:CAR.def||0}[k])+(SEA&&!SEA.closed?SEA[k]||0:0);
function histCard(){
  const [k1,k2]=keyStats();
  return `<div class="card"><h3>Temporada a temporada</h3>${CAR.hist.length?`<div class="tw"><table><thead><tr><th>Temp.</th><th>Clube</th><th class="n">J</th><th class="n">${statName(k1,1)}</th><th class="n">${statName(k2,1)}</th><th class="n">Nota</th><th class="n">Pos</th><th class="n">🏆</th></tr></thead><tbody>${
    CAR.hist.slice().reverse().map(x=>`<tr><td>${esc(x.y)}</td><td>${esc(x.club)}</td><td class="n">${x.j}</td><td class="n">${x[k1]??"–"}</td><td class="n">${x[k2]??"–"}</td><td class="n">${x.nota?rtag(x.nota):"–"}</td><td class="n">${x.pos?x.pos+"º":"–"}</td><td class="n">${x.tit||""}</td></tr>`).join("")}</tbody></table></div>`:`<p class="empty">A primeira temporada ainda está em andamento.</p>`}</div>`;
}
function renderPerf(){
  const h=$("t-perf"),chipsH=(a,em)=>a.length?a.map(([k,n])=>`<li class="${/Copa do Mundo|Bola de Ouro|Champions|Libertadores/.test(k)?"gold":""}"><b>${n}×</b>${esc(k)}</li>`).join(""):`<li class="empty" style="border:0;background:none;padding:0">${em}</li>`;
  h.innerHTML=`<div class="card">${attrsHtml()}<div class="meters"><div class="meter"><div class="lb"><span>⭐ Fama</span><b>${Math.round(CAR.fama)}</b></div><div class="bar"><i style="width:${CAR.fama}%"></i></div></div>
      <div class="meter"><div class="lb"><span>😊 Moral</span><b>${Math.round(S.moral)}</b></div><div class="bar mor"><i style="width:${S.moral}%"></i></div></div></div></div>
    <div class="card"><h3>Ficha</h3>
      <div class="kv"><span>Nome</span><b>${esc(P.nome)}</b></div><div class="kv"><span>Nascimento</span><b>${new Date(P.nasc+"T12:00:00").toLocaleDateString("pt-BR")} · ${ufNome(P.uf)}</b></div>
      <div class="kv"><span>Posição</span><b>${posName()} · ${P.pe.toLowerCase()} · camisa ${P.numero}</b></div>
      <div class="kv"><span>Seleção</span><b>${FL.selecao?`${selObj().f} ${selPais()} · ${CAR.selJogos} jogos, ${CAR.selGols} gols`:"Nunca convocado"}</b></div>
      <div class="kv"><span>Carreira</span><b>${CAR.jogos+(SEA&&!SEA.closed?SEA.j:0)} jogos · ${keyStats().map(k=>`${careerStat(k)} ${statName(k)}`).join(" · ")}</b></div></div>
    <div class="card"><h3>Sala de troféus<small>${CAR.titulos.length} títulos</small></h3><ul class="trophies">${chipsH(group(CAR.titulos),"Nenhum título ainda.")}</ul>
      <h3 style="margin-top:14px">Prêmios</h3><ul class="trophies">${chipsH(group(CAR.premios),"Nenhum prêmio ainda.")}</ul></div>
    ${histCard()}
    <div class="card"><h3>Diário</h3><ol class="timeline">${LOG.slice().reverse().slice(0,40).map(l=>`<li><b>${l.y}</b><span>${esc(l.t)}</span></li>`).join("")}</ol></div>
    <div class="stack"><button class="btn ghost wide" id="p-ret" ${AGE>=30&&!cur?"":"disabled"}>👟 Encerrar a carreira</button></div>`;
  $("p-ret").onclick=()=>{if(AGE>=30) {Q.unshift(C("Aposentadoria","👟","aposentadoria",`Tem certeza? Não dá pra voltar atrás.`,[O("👟","Pendurar as chuteiras",{},{end:"aposentou"}),O("⚽","Ainda não",{})]));next();}};
}
function renderSheet(){
  const w=$("sheet"),inn=$("sheet-in");
  $("s-game").classList.toggle("duo",!!cur);
  if(!cur){w.hidden=true;return;}
  w.hidden=false;
  const text=typeof cur.text==="function"?cur.text():cur.text,n=cur.opts.length;
  inn.className="sheet "+(cur.big?"big ":"")+(cur.bad?"bad":"");
  inn.innerHTML=`<div class="grab" aria-hidden="true"></div>${scene(cur.scene)}
    <div class="who" id="sh-who"><span aria-hidden="true">${cur.em}</span>${esc(cur.who)}${PHASE!=="pro"&&cur.chap?` <span style="color:var(--muted);font-weight:600">· ${esc(cur.chap)}</span>`:""}</div>
    <div class="txt">${text.startsWith("<")?text:`<p>${text}</p>`}</div>
    <div class="opts n${n}">${cur.opts.map((o,i)=>{const keys=Object.keys(o.fx||{}).filter(k=>o.fx[k]);if(o.g) keys.push("g");
      const icons=[...new Set(keys.map(k=>FXI[k]||""))].join(" ");
      return `<button class="opt" data-i="${i}"><span class="oi" aria-hidden="true">${o.ic||""}</span><span class="ol">${o.label}</span>${o.sub?`<span class="os">${o.sub}</span>`:""}<span class="ofx">${icons}</span></button>`;}).join("")}</div>`;
  inn.querySelectorAll(".opt").forEach(b=>b.onclick=()=>choose(+b.dataset.i));
  inn.scrollTop=0;
  // No celular o card fica no topo da página: se ele saiu da tela, volta até ele
  if(inn.getBoundingClientRect().top<0) w.scrollIntoView({block:"start"});
}

export {careerStat,show,chips,readForm,updateShirt,renderAll,renderBar,attrsHtml,agenda,renderHome,feedItem,renderActs,renderComp,spark,renderMerc,histCard,renderPerf,renderSheet,rc,rtag,dchip};
