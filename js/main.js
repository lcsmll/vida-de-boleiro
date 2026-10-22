import {$,C,DEFAULT_CLUBS,LIGAS,MES,O,PES,POS,STATS,UFS,chance,clamp,esc,fmt,rand,ufNome} from "./data.js";
import {AGE,BM,BY,CAR,keyStats,statName,CLUBS,COMP,FEED,FL,LOG,M,P,PHASE,POT,S,SEA,USED,WORLD,Y,cur,log,ovr,posName,potStars,set} from "./state.js";
import {ART,crest,shirtBack} from "./art.js";
import {prologue} from "./prologue.js";
import {choose,closeSeason,myPos,next,selObj} from "./engine.js";
import {chips,histCard,readForm,renderAll,show,updateShirt} from "./ui.js";

chips($("c-pos"),"pos",POS,p=>p.n,"MEI");chips($("c-pe"),"pe",PES,p=>p,"Destro");
$("f-uf").innerHTML=UFS.map(([s,n])=>`<option value="${s}" ${s==="MG"?"selected":""}>${n}</option>`).join("");
document.querySelectorAll("#s-create input, #s-create select").forEach(el=>el.addEventListener("input",updateShirt));
try{const s=JSON.parse(localStorage.getItem("vb-jogador")||"null");if(s){$("f-nome").value=s.nome;$("f-apelido").value=s.apelido;$("f-num").value=s.numero;$("f-uf").value=s.uf;if(s.nasc)$("f-nasc").value=s.nasc;
  document.querySelector(`input[name="pos"][value="${s.pos}"]`).checked=true;document.querySelector(`input[name="pe"][value="${s.pe}"]`).checked=true;}}catch(e){}
updateShirt();
document.querySelectorAll("#bnav button").forEach(b=>b.onclick=()=>{set({TAB:b.dataset.tab});renderAll();window.scrollTo(0,0);});

/* ===================== Salvar e continuar ===================== */
function saveGame(){
  if(PHASE!=="pro") return;
  try{localStorage.setItem("vb-save",JSON.stringify({v:5,P,S,FL,CAR,COMP,SEA,WORLD,LOG,POT,Y,M,BY,BM,AGE,USED:[...USED],FEED}));}catch(e){}
}
function loadGame(){
  try{const d=JSON.parse(localStorage.getItem("vb-save")||"null");if(!d||d.v!==5) return false;
    set({P:d.P,S:d.S,FL:d.FL,CAR:d.CAR,COMP:d.COMP,SEA:d.SEA,WORLD:d.WORLD,LOG:d.LOG,POT:d.POT,Y:d.Y,M:d.M,BY:d.BY,BM:d.BM,AGE:d.AGE,FEED:d.FEED,USED:new Set(d.USED),PHASE:"pro",Q:[],cur:null,LASTCH:null,LASTO:null,TAB:"home"});
    show("s-game");next();return true;}catch(e){return false;}
}
function refreshContinue(){
  try{const d=JSON.parse(localStorage.getItem("vb-save")||"null");const b=$("b-continue");
    if(d&&d.v===5){b.hidden=false;b.textContent=`Continuar: ${d.P.apelido} · ${MES[d.M]} de ${d.Y}`;}else b.hidden=true;}catch(e){}
}

/* ===================== Início do jogo ===================== */
function startGame(){
  const d=new Date(P.nasc+"T12:00:00");set({BY:d.getFullYear(),BM:d.getMonth()});
  set({S:{bola:40,corpo:48,cabeca:45,familia:60,fad:20,moral:60}});
  const mod={GOL:{corpo:5,cabeca:5},ZAG:{corpo:10,bola:-5},LAT:{corpo:5},VOL:{cabeca:5,corpo:5,bola:-5},MEI:{bola:5,cabeca:5,corpo:-5},PON:{bola:10,cabeca:-5},ATA:{bola:5,corpo:5,cabeca:-5}}[P.pos];
  for(const k in mod) S[k]=clamp(S[k]+mod[k]);
  set({POT:Math.round(clamp((rand(58,96)+rand(58,96))/2+(chance(.06)?8:0),58,98))});
  set({FL:{g:0,en:4,acts:{}},AGE:7,PHASE:"pre",USED:new Set(),WORLD:null,COMP:null,SEA:null,LASTCH:null,LASTO:null,FEED:[],TAB:"home"});
  set({CAR:{jogos:0,gols:0,assist:0,limpas:0,titulos:[],premios:[],clubes:[],selJogos:0,selGols:0,peak:0,fama:0,mvMax:0,salMax:0,ganhos:0,maiorTransf:0,hist:[],mvHist:[]}});
  set({LOG:[{age:0,y:BY,t:`Nasceu em ${d.toLocaleDateString("pt-BR")}, em ${ufNome(P.uf)}`}]});
  FL.potTxt=potStars();
  try{localStorage.removeItem("vb-save");}catch(e){}
  set({Q:prologue()});show("s-game");next();
}
const WARN={
  corpo:()=>C("Alerta do corpo","⚠️","hospital",`Seu corpo está no limite. O médico avisa: mais uma pancada e pode ser o fim.`,
    [O("🛌🏽","Parar e tratar",{corpo:18,bola:-4,fama:-3},{sub:"Perde ritmo, salva a carreira"}),O("🏃🏽","Seguir jogando",{},{sub:"Arriscar"})],{bad:true}),
  cabeca:()=>C("Psicólogo do clube","⚠️","vestiario",`O psicólogo do clube te chama na sala. “Você não está bem, e todo mundo está vendo.”`,
    [O("🛋️","Fazer terapia",{cabeca:18,bola:-2},{sub:"Cuidar da cabeça"}),O("🙄","Tô bem",{},{sub:"Arriscar"})],{bad:true}),
  familia:()=>C("Sua mãe","⚠️","casa",`Sua mãe liga chorando. Faz meses que ninguém da família te vê.`,
    [O("🏠","Voltar pra casa uns dias",{familia:18,bola:-3},{sub:"Família em primeiro"}),O("📵","Agora não dá",{},{sub:"Arriscar"})],{bad:true}),
  bola:()=>C("Técnico","⚠️","campo",`“Do jeito que está, não dá pra te colocar nem no banco.”`,
    [O("🏋🏽","Treino extra todo dia",{bola:12,familia:-5},{sub:"Recuperar o nível"}),O("😤","Reclamar com a diretoria",{cabeca:-5},{sub:"Arriscar"})],{bad:true})
};
function legacy(){
  const W=t=>t.startsWith("Copa do Mundo")?50:t.startsWith("Champions")?25:t.startsWith("Libertadores")?18:/^(Copa América|Eurocopa)/.test(t)?14:
    t.startsWith("Estadual")?2:t.includes("Sub-17")?1:t.startsWith("Série B")?3:/^(Liga|Brasileirão)/.test(t)?(t.startsWith("Brasileirão")?10:/Saudita|Americana|Japonesa/.test(t)?4:12):5;
  let pts=CAR.titulos.reduce((a,t)=>a+W(t),0);
  CAR.premios.forEach(p=>pts+=p.startsWith("Bola de Ouro")?45:/^(Craque|Artilheiro|Luva|Melhor)/.test(p)?6:/^Rei/.test(p)?5:/^Revela/.test(p)?3:2);
  pts+=CAR.selJogos*.3+CAR.gols*.05+CAR.limpas*({GOL:.1,ZAG:.04}[P.pos]||.02)+(CAR.def||0)*.004+Math.max(0,CAR.peak-76)*1.8;
  return pts;
}
function verdict(reason){
  const pts=legacy(),bolas=CAR.premios.filter(p=>p.startsWith("Bola de Ouro")).length,copa=CAR.titulos.some(t=>t.startsWith("Copa do Mundo"));
  if(reason==="banido") return ["Banido","flop","O nome dele virou exemplo do que não fazer."];
  if(pts>=380||bolas>=2||(copa&&bolas)) return ["Lenda","lenda","Daqui a 50 anos ainda vão discutir se ele foi o maior de todos."];
  if(pts>=190) return ["Ídolo","lenda","Estátua na porta do estádio e camisa aposentada."];
  if(POT>=84&&CAR.peak<=POT-8&&pts<130) return ["Flopado","flop",`Tinha potencial pra ser o melhor do mundo. Virou meme de “promessa que não vingou”.`];
  if(pts>=95) return ["Craque","","Ganhou o que tinha pra ganhar e deixou saudade."];
  if(FL.promessa&&CAR.peak<POT-2&&(CAR.peak<74||pts<35)) return ["Flopado","flop","Era pra ser o novo fenômeno. Ficou no “quase”."];
  if(pts>=32) return ["Boleiro","","Carreira honesta. Pagou as contas e encheu o bairro de orgulho."];
  return ["Esquecido","flop",`Pouca gente lembra. Mas no bairro onde cresceu, todo mundo conhece.`];
}

const group=a=>{const m={};a.forEach(t=>{const k=t.replace(/ \d{4}(\/\d{2})?$/,"");m[k]=(m[k]||0)+1;});return Object.entries(m).sort((x,y)=>y[1]-x[1]);};
let END={};
function finish(reason){
  if(PHASE==="pro"&&SEA&&!SEA.closed&&SEA.j) closeSeason(COMP&&COMP.tab.some(t=>t.n===FL.club.n)?myPos():0);
  set({PHASE:"end",cur:null,Q:[]});$("sheet").hidden=true;
  try{localStorage.removeItem("vb-save");}catch(e){}
  if(reason==="corpo"&&AGE>=32) reason="corpoVet";
  const R={aposentou:`Aposentou-se aos ${AGE} anos, em ${Y}`,banido:`Banido do futebol aos ${AGE} anos`,bola:`Sem clube aos ${AGE}: ninguém mais quis contratar`,
    corpo:`O corpo não aguentou: carreira encerrada aos ${AGE}`,corpoVet:`Aposentou-se aos ${AGE}: o corpo pediu pra parar`,cabeca:`Indisciplina demais: carreira encerrada aos ${AGE}`,familia:`Largou o futebol aos ${AGE} pra cuidar da vida fora de campo`};
  if(!CAR.peak) CAR.peak=ovr();
  const [v,cls,why]=verdict(reason),r=R[reason]||R.aposentou;log(r);
  END={v,cls,why,r};
  $("e-reason").textContent=r;$("e-verdict").textContent=v;$("e-verdict").className="verdict "+cls;$("e-why").textContent=why;
  $("e-pot").textContent=`Potencial real: ${POT} · Auge: ${CAR.peak}`;
  const [K1,K2]=keyStats(),cs=k=>({g:CAR.gols,a:CAR.assist,l:CAR.limpas,df:CAR.def||0}[k]),best=group(CAR.clubes)[0];
  const mainClub=(best&&CLUBS.find(c=>c.n===best[0]))||FL.club||{c:["#2448E8","#fff"]};
  END.club=mainClub;
  renderFig();
  $("e-nums").innerHTML=[[fmt(CAR.mvMax),"maior valor de mercado"],[fmt(CAR.salMax),"maior salário anual"],[CAR.maiorTransf?fmt(CAR.maiorTransf):"—","maior transferência"],[fmt(CAR.ganhos),"ganhou na carreira"],
    [`${CAR.selJogos} / ${CAR.selGols}`,`jogos / gols pela seleção${FL.selPais?" ("+FL.selPais+")":""}`],[`${CAR[K2]||0}`,K2==="l"?"jogos sem sofrer gol":statName(K2).replace("assist.","assistências")]]
    .map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
  const chipsHtml=(a,empty)=>a.length?a.map(([k,n])=>`<li class="${/Copa do Mundo|Bola de Ouro|Champions|Libertadores/.test(k)?"gold":""}"><b>${n}×</b>${esc(k)}</li>`).join(""):`<li class="empty" style="border:0;background:none;padding:0">${empty}</li>`;
  $("e-tit").innerHTML=chipsHtml(group(CAR.titulos),"Nenhum título.");
  $("e-pre").innerHTML=chipsHtml(group(CAR.premios),"Nenhum prêmio individual.");
  $("e-clu").innerHTML=CAR.clubes.length?CAR.clubes.map(n=>{const c=CLUBS.find(x=>x.n===n)||{n,c:["#334155","#F2B705"]};return `<li>${crest(c,16)}${esc(n)}</li>`;}).join(""):`<li class="empty" style="border:0;background:none;padding:0">Não chegou ao profissional.</li>`;
  $("e-hist").innerHTML=histCard().replace(/^<div class="card"><h3>Temporada a temporada<\/h3>/,"").replace(/<\/div>$/,"");
  $("e-time").innerHTML=LOG.map(l=>`<li><b>${l.y}</b><span>${esc(l.t)}</span></li>`).join("");
  END.txt=`${P.apelido} (${posName()}, camisa ${P.numero}) — ${v.toUpperCase()}\n${r}\nPotencial ${POT} · auge ${CAR.peak}\n`+
    `${CAR.jogos} jogos, ${cs(K1)} ${statName(K1)}, ${cs(K2)} ${statName(K2)}, ${CAR.titulos.length} títulos, ${CAR.selJogos} jogos pela seleção\nMaior valor de mercado: ${fmt(CAR.mvMax)}\n`+
    `Clubes: ${CAR.clubes.join(" → ")||"—"}\n`+group(CAR.titulos.concat(CAR.premios)).slice(0,8).map(([k,n])=>`${n}× ${k}`).join(" | ")+`\n#VidaDeBoleiro`;
  $("e-msg").textContent="";
  show("s-end");
}
/* Carta de fim de carreira: "carta" (estilo Ultimate Team, nível pelo veredito) ou "figurinha" (estilo álbum) */
const TIER={Lenda:"lenda",Ídolo:"idolo",Craque:"craque",Boleiro:"boleiro",Esquecido:"esquecido",Flopado:"flop",Banido:"banido"};
// Mesma escala de cor das notas de partida, adaptada ao overall
const ovrColor=o=>o>=88?"#1C5DFF":o>=82?"#12A150":o>=76?"#7AB800":o>=70?"#D9A400":o>=64?"#E07B00":"#DA2E3A";
let FIGMODE="carta";
try{FIGMODE=localStorage.getItem("vb-fig")||"carta";}catch(e){}
function renderFig(){
  const mc=END.club,[K1]=keyStats(),k1=({g:CAR.gols,a:CAR.assist,l:CAR.limpas,df:CAR.def||0})[K1],l1=K1==="l"?"sem gol":statName(K1),flag=FL.selPais?selObj().f:"🇧🇷",pro=CAR.clubes.length>0;
  const light=/^#(f|e|d)/i.test(mc.c[0]),band=light?mc.c[1]:mc.c[0];
  const jersey=shirtBack(mc.c,P.apelido,P.numero);
  document.querySelectorAll("#e-figmode button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===FIGMODE));
  if(FIGMODE==="figurinha"){
    const nasc=P.nasc?new Date(P.nasc+"T12:00:00").toLocaleDateString("pt-BR"):"";
    $("e-fig").innerHTML=`<div class="stk ${END.cls==="lenda"?"foil":""} ${END.v==="Banido"?"gray":""}" style="--band:${band}">
      <div class="stk-ph" style="background-image:url(${ART[pro?"estadio":"campo_terra"]});background-position:${pro?"100%":"50%"} 50%">
        <span class="stk-n">${P.numero}</span><span class="stk-flag" aria-hidden="true">${flag}</span>
        ${pro?`<span class="stk-crest">${crest(mc,30)}</span>`:""}<div class="stk-j">${jersey}</div></div>
      <div class="stk-band"><div class="stk-nick">${esc(P.apelido)}</div><div class="stk-full">${esc(P.nome)}</div></div>
      <div class="stk-info"><span>${posName()}</span><span>${nasc}</span><span>${ufNome(P.uf)}</span></div>
      <div class="stk-foot"><span>Auge <b>${CAR.peak}</b></span><span><b>${CAR.jogos}</b> jogos</span><span><b>${k1}</b> ${l1}</span><span><b>${CAR.titulos.length}</b> títulos</span></div>
    </div>`;
    return;}
  const anos=pro&&Y>BY+17?`${BY+17}–${Y}`:pro?String(Y):"Só na base";
  const nums=[[CAR.jogos,"jogos"],[k1,l1],[CAR.titulos.length,"títulos"],[CAR.selJogos,"seleção"]];
  $("e-fig").innerHTML=`<div class="vb t-${TIER[END.v]||"boleiro"}">
    <div class="vb-top"><span class="vb-brand">⚽ Vida de Boleiro</span><span class="vb-yr">${anos}</span></div>
    <div class="vb-hero">
      <div class="vb-rate" style="background:${ovrColor(CAR.peak)}"><b>${CAR.peak}</b><small>auge</small></div>
      <div class="vb-side"><span class="vb-flag" aria-hidden="true">${flag}</span>${pro?crest(mc,30):""}</div>
      <div class="vb-j">${jersey}</div>
    </div>
    <div class="vb-id"><div class="vb-nick">${esc(P.apelido)}</div>
      <div class="vb-meta"><span class="vb-pos">${P.pos}</span>${esc(P.nome)} · ${ufNome(P.uf)}</div></div>
    <div class="vb-attrs">${STATS.map(t=>{const v=Math.round(S[t.k]);return `<div><span>${t.ic} ${t.n}</span><i><em style="width:${v}%"></em></i><b>${v}</b></div>`;}).join("")}</div>
    <div class="vb-nums">${nums.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>
    <div class="vb-verd"><span>${END.v}</span></div>
  </div>`;
}
$("e-figmode").onclick=e=>{const b=e.target.closest("button");if(!b) return;FIGMODE=b.dataset.m;try{localStorage.setItem("vb-fig",FIGMODE);}catch(err){}renderFig();};
// Fontes Barlow embutidas no PNG (só o subconjunto latino); sem internet, sai com a fonte reserva
let FONTCSS=null;
async function fontCSS(){
  if(FONTCSS!==null) return FONTCSS;
  try{const href=document.querySelector('link[href*="fonts.googleapis.com/css2"]').href;
    const css=await (await fetch(href)).text(),out=[];
    for(const blk of css.split("@font-face").slice(1)){
      if(!/unicode-range:[^;]*U\+0000-00FF/.test(blk)) continue;
      const url=(blk.match(/url\(([^)]+)\)/)||[])[1];if(!url) continue;
      const b=await (await fetch(url)).blob(),data=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b);});
      out.push("@font-face"+blk.replace(url,data));}
    FONTCSS=out.join("\n");
  }catch(e){FONTCSS="";}
  return FONTCSS;
}
// Gera o PNG da carta que está na tela (carta ou figurinha); a biblioteca só carrega no clique
async function drawPNG(){
  const {toBlob}=await import("https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm");
  try{await document.fonts.ready;}catch(e){}
  const el=$("e-fig").firstElementChild,fontEmbedCSS=await fontCSS();
  $("e-fig").classList.add("snap");
  try{return await toBlob(el,{pixelRatio:4,cacheBust:false,fontEmbedCSS});}
  finally{$("e-fig").classList.remove("snap");}
}

/* ===================== Botões ===================== */
$("b-start").onclick=()=>show("s-create");
$("b-back1").onclick=()=>{refreshContinue();show("s-intro");};
$("b-continue").onclick=()=>{if(!loadGame()) $("b-continue").hidden=true;};
$("b-go").onclick=()=>{const f=readForm();
  const err=!f.nome?"Coloca seu nome.":(isNaN(f.numero)||f.numero<1||f.numero>99)?"A camisa vai de 1 a 99.":!f.nasc?"Escolha a data de nascimento.":"";
  $("f-err").textContent=err;if(err) return;set({P:f});try{localStorage.setItem("vb-jogador",JSON.stringify(P));}catch(e){}startGame();};
$("b-again").onclick=startGame;$("b-new").onclick=()=>show("s-create");
$("b-copy").onclick=async()=>{try{await navigator.clipboard.writeText(END.txt);$("e-msg").textContent="Resumo copiado.";}catch(e){$("e-msg").textContent="Este navegador bloqueou a cópia.";}};
let DL=null;
(async()=>{try{if(window.claude&&window.claude.use) DL=await window.claude.use("downloads");}catch(e){}})();
$("b-png").onclick=async()=>{
  const name=`vida-de-boleiro-${P.apelido.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")}-${FIGMODE}.png`;
  $("b-png").disabled=true;$("e-msg").textContent=FIGMODE==="carta"?"Gerando a carta…":"Gerando a figurinha…";
  try{const blob=await drawPNG();
    if(DL) await DL.save({filename:name,data:blob});
    else{const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
    $("e-msg").textContent="Imagem salva.";}
  catch(e){const c=e&&e.code;$("e-msg").textContent=c==="declined"?"Download cancelado.":c==="rate_limited"?"Espere um pouco e tente de novo.":"Não deu pra gerar a imagem. Confira a internet e tente de novo.";}
  finally{$("b-png").disabled=false;}
};
$("t-ligas").textContent=Object.keys(LIGAS).join(", ");
$("b-edit").onclick=()=>{$("t-json").value=JSON.stringify(CLUBS,null,1);$("t-err").textContent="";show("s-teams");};
$("t-back").onclick=()=>show("s-intro");
$("t-reset").onclick=()=>{set({CLUBS:DEFAULT_CLUBS});try{localStorage.removeItem("vb-clubes");}catch(e){}$("t-json").value=JSON.stringify(CLUBS,null,1);$("t-err").textContent="Times originais restaurados.";};
$("t-save").onclick=()=>{
  try{const arr=JSON.parse($("t-json").value);
    if(!Array.isArray(arr)||!arr.length) throw new Error("A lista está vazia.");
    arr.forEach((c,i)=>{if(!c.n||typeof c.n!=="string") throw new Error(`Clube ${i+1} sem nome (n).`);
      if(!LIGAS[c.l]) throw new Error(`${c.n}: liga “${c.l}” não existe.`);
      if(!(c.t>=1&&c.t<=5)) throw new Error(`${c.n}: força (t) precisa ser de 1 a 5.`);
      if(!Array.isArray(c.c)||c.c.length<2) c.c=["#2448E8","#ffffff"];});
    set({CLUBS:arr});try{localStorage.setItem("vb-clubes",JSON.stringify(arr));}catch(e){}
    $("t-err").textContent="Times salvos.";
  }catch(e){$("t-err").textContent="Não salvou: "+e.message;}
};
document.addEventListener("keydown",e=>{if(!cur||PHASE==="end") return;const n=parseInt(e.key,10);if(n>=1&&n<=cur.opts.length) choose(n-1);});
refreshContinue();

export {saveGame,loadGame,refreshContinue,startGame,legacy,verdict,finish,drawPNG,WARN,group,END,DL};
