import {DEFAULT_CLUBS,POS,clamp,rand} from "./data.js";
import {tierOf} from "./engine.js";

let CLUBS = DEFAULT_CLUBS;
try{ const c=JSON.parse(localStorage.getItem("vb-clubes")||"null"); if(Array.isArray(c)&&c.length) CLUBS=c; }catch(e){}

/* ===================== Estado ===================== */
let P=null,FL=null,S,Q=[],cur=null,LOG,CAR,AGE=7,PHASE="pre",USED=new Set(),POT=75,busy=false;
let Y=2026,M=0,BY=2019,BM=0,FEED=[],LASTCH=null,LASTO=null,REP=null,TAB="home",CTAB="liga";
const year=()=>PHASE==="pro"?Y:BY+AGE;
const posName=()=>POS.find(x=>x.id===P.pos).n;
// Defensores aparecem pelos números de defesa: g gols, a assistências, l jogos sem sofrer gol, df defesas (goleiro) ou desarmes
const DEFP=["GOL","ZAG","LAT","VOL"];
const keyStats=()=>({GOL:["l","df"],ZAG:["g","df"],LAT:["a","df"],VOL:["df","a"]}[P.pos]||["g","a"]);
const statName=(k,short)=>short?{g:"G",a:"A",l:"SG",df:P.pos==="GOL"?"DEF":"DES"}[k]:{g:"gols",a:"assist.",l:"sem sofrer gol",df:P.pos==="GOL"?"defesas":"desarmes"}[k];
// Goleiro envelhece mais devagar: a queda pela idade começa aos 36
const ageAdj=()=>{const v=P&&P.pos==="GOL"?2:0;return AGE<=16?-6:AGE===17?-4:AGE===18?-3:AGE===19?-2:AGE===20?-1:AGE>=34+v?-(AGE-33-v)*1.5:0;};
// Peso de cada atributo no overall por posição (soma sempre .7): defensor depende mais de corpo e cabeça
const OW={GOL:[.25,.2,.25],ZAG:[.25,.25,.2],LAT:[.3,.25,.15],VOL:[.3,.2,.2],MEI:[.35,.15,.2],PON:[.4,.2,.1],ATA:[.35,.2,.15]};
const ovr=()=>{const [b,c,k]=OW[P&&P.pos]||OW.ATA;return Math.round(clamp(Math.min(30+S.bola*b+S.corpo*c+S.cabeca*k,POT+(S.cabeca>=70?2:0))+ageAdj(),35,99));};
const mv=(o=ovr())=>3e5*Math.pow(1.2,o-55)*(AGE<22?1.4:AGE<=27?1.2:AGE<=30?1:AGE<=32?.6:.3);
const log=t=>{LOG.push({age:AGE,y:year(),t});};
function clubSalary(c,o=ovr()){
  const T={BR:{1:4e4,2:2.5e5,3:1.2e6,4:4e6,5:6e6},ARG:{1:2e4,2:1e5,3:6e5,4:1.8e6,5:3e6},SAU:{1:5e6,2:2e7,3:6e7,4:8e7,5:1e8},USA:{1:1e6,2:8e6,3:1.2e7,4:1.5e7,5:2e7},JPN:{1:5e5,2:4e6,3:6e6,4:8e6,5:1e7}};
  const E={1:4e5,2:1.5e6,3:5e6,4:1.4e7,5:4e7};
  return (T[c.l]||E)[tierOf(c)]*clamp(Math.pow(o/78,2.5),.4,1.9);
}
const salAtual=()=>FL&&FL.contrato?FL.contrato.salario:0;
function potStars(){const v=clamp(Math.round((POT-58+rand(-4,4))/8),1,5);return "★".repeat(v)+"☆".repeat(5-v);}
let WORLD=null,COMP=null,SEA=null;
// Outros módulos não podem reatribuir estas variáveis importadas: usam set({nome:valor}).
function set(o){
  if("CLUBS" in o) CLUBS=o.CLUBS;
  if("P" in o) P=o.P;
  if("FL" in o) FL=o.FL;
  if("S" in o) S=o.S;
  if("Q" in o) Q=o.Q;
  if("cur" in o) cur=o.cur;
  if("LOG" in o) LOG=o.LOG;
  if("CAR" in o) CAR=o.CAR;
  if("AGE" in o) AGE=o.AGE;
  if("PHASE" in o) PHASE=o.PHASE;
  if("USED" in o) USED=o.USED;
  if("POT" in o) POT=o.POT;
  if("busy" in o) busy=o.busy;
  if("Y" in o) Y=o.Y;
  if("M" in o) M=o.M;
  if("BY" in o) BY=o.BY;
  if("BM" in o) BM=o.BM;
  if("FEED" in o) FEED=o.FEED;
  if("LASTCH" in o) LASTCH=o.LASTCH;
  if("LASTO" in o) LASTO=o.LASTO;
  if("REP" in o) REP=o.REP;
  if("TAB" in o) TAB=o.TAB;
  if("CTAB" in o) CTAB=o.CTAB;
  if("WORLD" in o) WORLD=o.WORLD;
  if("COMP" in o) COMP=o.COMP;
  if("SEA" in o) SEA=o.SEA;
}

export {DEFP,keyStats,statName,OW,clubSalary,potStars,set,CLUBS,P,FL,S,Q,cur,LOG,CAR,AGE,PHASE,USED,POT,busy,Y,M,BY,BM,FEED,LASTCH,LASTO,REP,TAB,CTAB,year,posName,ageAdj,ovr,mv,log,salAtual,WORLD,COMP,SEA};
