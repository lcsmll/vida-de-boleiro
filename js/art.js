import {esc} from "./data.js";
import {FL,P,PHASE,S,salAtual} from "./state.js";

/* ===================== Desenhos ===================== */
function hash(s){let h=0;for(const ch of s) h=(h*31+ch.charCodeAt(0))|0;return Math.abs(h);}
function crest(club,size=34){
  const [a,b]=club.c||["#1F4FC9","#ffffff"], h=hash(club.n)%4, id="cr"+hash(club.n);
  const ini=club.n.split(/\s+/).filter(w=>w.length>2&&!/^(FC|AC|EC|de|la|do|da|del|Club)$/i.test(w)).map(w=>w[0]).join("").slice(0,3).toUpperCase()||club.n.slice(0,2).toUpperCase();
  const pat=[`<rect x="0" y="0" width="40" height="48" fill="${a}"/>`,
    `<rect width="40" height="48" fill="${a}"/><rect x="10" width="7" height="48" fill="${b}"/><rect x="24" width="7" height="48" fill="${b}"/>`,
    `<rect width="40" height="48" fill="${a}"/><rect y="16" width="40" height="12" fill="${b}"/>`,
    `<rect width="40" height="48" fill="${a}"/><path d="M-4 40 L40 -4 L48 4 L4 48Z" fill="${b}"/>`][h];
  const light = /^#(f|e|d)/i.test(a) && h!==3;
  return `<svg width="${size}" height="${size*1.2}" viewBox="0 0 40 48" aria-hidden="true"><defs><clipPath id="${id}"><path d="M4 2 H36 V24 Q36 40 20 46 Q4 40 4 24Z"/></clipPath></defs>
    <g clip-path="url(#${id})">${pat}</g><path d="M4 2 H36 V24 Q36 40 20 46 Q4 40 4 24Z" fill="none" stroke="#13271D" stroke-width="2.5"/>
    <text x="20" y="${h===2?26:28}" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="${ini.length>2?12:15}" fill="${light?"#13271D":"#fff"}" stroke="${light?"none":"#13271D"}" stroke-width=".6">${esc(ini)}</text></svg>`;
}
function shirt(colors,num,size=52){
  const [a,b]=colors||["#F2B705","#1F4FC9"]; const light=/^#(f|e|d)/i.test(a);
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true"><path d="M24 8 L10 18 L4 34 L16 38 L18 30 L18 74 L62 74 L62 30 L64 38 L76 34 L70 18 L56 8 Q40 18 24 8Z" fill="${a}" stroke="#13271D" stroke-width="2.5" stroke-linejoin="round"/>
   <path d="M24 8 Q40 18 56 8" fill="none" stroke="${b}" stroke-width="4"/><text x="40" y="60" text-anchor="middle" font-family="Big Shoulders Display,Impact,sans-serif" font-weight="900" font-size="28" fill="${light?b:"#fff"}" stroke="#13271D" stroke-width="${light?0:.8}">${num}</text></svg>`;
}
// Camisa de costas, com nome e número (o protagonista nunca mostra o rosto)
function shirtBack(colors,name,num){
  const [a,b]=colors||["#F2B705","#1F4FC9"],light=/^#(f|e|d)/i.test(a),ink=light?b:"#fff",nm=String(name).toUpperCase();
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M24 8 L10 18 L4 34 L16 38 L18 30 L18 74 L62 74 L62 30 L64 38 L76 34 L70 18 L56 8 Q40 13 24 8Z" fill="${a}" stroke="#13271D" stroke-width="2" stroke-linejoin="round"/>
   <path d="M24 8 Q40 13 56 8" fill="none" stroke="${b}" stroke-width="3"/><path d="M18 30 V74 M62 30 V74" stroke="${b}" stroke-width="2" opacity=".5"/>
   <text x="40" y="29" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="7.5" letter-spacing=".4" fill="${ink}" ${nm.length>9?`textLength="36" lengthAdjust="spacingAndGlyphs"`:""}>${nm}</text>
   <text x="40" y="63" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="32" fill="${ink}" stroke="#13271D" stroke-width="${light?0:.7}">${num}</text></svg>`;
}
const SKY=(t,b)=>`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="160" fill="url(#sk)"/>`;
const CROWD=(y,c1,c2)=>{let s="";for(let i=0;i<40;i++){s+=`<circle cx="${i*10+5}" cy="${y+(i%3)*4}" r="4" fill="${i%2?c1:c2}"/>`;}return s;};
const FIELD=`<rect y="100" width="400" height="60" fill="#2f8f4e"/>${[0,1,2,3,4].map(i=>`<rect x="${i*80}" y="100" width="40" height="60" fill="#348f50" opacity=".6"/>`).join("")}<path d="M0 100 H400" stroke="#fff" stroke-width="2" opacity=".7"/>`;
function scene(k){
  const N=P?P.numero:10, cc=(FL&&FL.club&&FL.club.c)||["#F2B705","#1F4FC9"];
  const S={
  rua:`${SKY("#FBD38D","#F6E7C1")}<rect x="20" y="40" width="70" height="80" fill="#C9B79C"/><rect x="100" y="60" width="60" height="60" fill="#E2A16F"/><rect x="250" y="30" width="80" height="90" fill="#B6C2C9"/>
    ${[30,50,70].map(x=>`<rect x="${x}" y="55" width="12" height="14" fill="#6b5a45"/>`).join("")}<rect y="118" width="400" height="42" fill="#8a8f93"/><rect x="0" y="136" width="400" height="4" fill="#fff" stroke-dasharray="20 14" />
    <circle cx="200" cy="128" r="12" fill="#fff" stroke="#13271D" stroke-width="2"/><path d="M193 122 L207 134 M207 122 L193 134" stroke="#13271D" stroke-width="2"/>`,
  sinal:`${SKY("#F59E5B","#FBD38D")}<rect y="112" width="400" height="48" fill="#5f6469"/>${[0,1,2,3,4,5].map(i=>`<rect x="${i*70+10}" y="134" width="36" height="5" fill="#fff"/>`).join("")}
    <rect x="296" y="20" width="8" height="96" fill="#2d3236"/><rect x="282" y="14" width="36" height="70" rx="6" fill="#2d3236"/><circle cx="300" cy="28" r="9" fill="#ef4444"/><circle cx="300" cy="49" r="9" fill="#6b5a1a"/><circle cx="300" cy="70" r="9" fill="#14532d"/>
    <rect x="60" y="92" width="120" height="34" rx="12" fill="#1F4FC9"/><rect x="80" y="76" width="70" height="24" rx="8" fill="#1F4FC9"/><rect x="88" y="80" width="54" height="14" rx="4" fill="#bfdbfe"/><circle cx="90" cy="128" r="10" fill="#111"/><circle cx="150" cy="128" r="10" fill="#111"/>
    <circle cx="230" cy="78" r="9" fill="#8d5524"/><rect x="222" y="88" width="16" height="26" rx="5" fill="#F2B705"/><rect x="238" y="92" width="18" height="12" rx="2" fill="#ef4444"/>`,
  campo:`${SKY("#7cc4f0","#c7e8fb")}<rect x="0" y="60" width="400" height="50" fill="#6aa86f"/>${FIELD}<rect x="150" y="56" width="100" height="46" fill="none" stroke="#fff" stroke-width="4"/>
    <path d="M150 56 L160 66 H240 L250 56" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/><circle cx="290" cy="136" r="10" fill="#fff" stroke="#13271D" stroke-width="2"/><path d="M60 40 h30 M70 34 h30" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`,
  estadio:`${SKY("#0f2b4d","#2b5d8a")}${CROWD(48,"#F2B705","#ffffff")}${CROWD(66,cc[0],cc[1])}${CROWD(84,"#ef4444","#F2B705")}<rect y="92" width="400" height="10" fill="#1d3b2c"/>${FIELD}
    <rect x="30" y="6" width="6" height="40" fill="#cbd5e1"/><rect x="18" y="2" width="30" height="10" fill="#fef9c3"/><rect x="364" y="6" width="6" height="40" fill="#cbd5e1"/><rect x="352" y="2" width="30" height="10" fill="#fef9c3"/>
    <circle cx="200" cy="130" r="20" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>`,
  vestiario:`<rect width="400" height="160" fill="#d6dde3"/>${[0,1,2,3,4,5,6].map(i=>`<rect x="${i*56+6}" y="12" width="50" height="104" fill="#5b7a99" stroke="#3e5670" stroke-width="2"/><rect x="${i*56+16}" y="24" width="30" height="4" fill="#3e5670"/>`).join("")}
    <g transform="translate(176 26) scale(.6)">${shirt(cc,N,80).replace(/<\/?svg[^>]*>/g,"")}</g><rect x="0" y="118" width="400" height="16" fill="#8b5e3c"/><rect y="134" width="400" height="26" fill="#a8b3bc"/>`,
  festa:`<rect width="400" height="160" fill="#1b1033"/>${[[60,"#ec4899"],[160,"#22d3ee"],[260,"#facc15"],[340,"#a78bfa"]].map(([x,c])=>`<path d="M200 10 L${x-40} 160 L${x+40} 160Z" fill="${c}" opacity=".22"/>`).join("")}
    <circle cx="200" cy="26" r="18" fill="#cbd5e1"/>${[0,1,2,3,4,5].map(i=>`<rect x="${188+(i%3)*8}" y="${14+Math.floor(i/3)*10}" width="6" height="6" fill="#fff" opacity=".8"/>`).join("")}
    ${Array.from({length:26},(_,i)=>`<rect x="${(i*53)%400}" y="${40+(i*37)%110}" width="6" height="3" fill="${["#ec4899","#22d3ee","#facc15","#fff"][i%4]}" transform="rotate(${i*30} ${(i*53)%400} ${40+(i*37)%110})"/>`).join("")}
    <rect x="300" y="96" width="14" height="40" rx="4" fill="#065f46"/><rect x="304" y="86" width="6" height="12" fill="#065f46"/>`,
  dinheiro:`${SKY("#d1fae5","#ecfdf5")}${[0,1,2,3].map(i=>`<rect x="${70+i*8}" y="${110-i*14}" width="120" height="40" rx="4" fill="#16a34a" stroke="#14532d" stroke-width="2"/><circle cx="${130+i*8}" cy="${130-i*14}" r="9" fill="#bbf7d0"/>`).join("")}
    ${[0,1,2,3,4].map(i=>`<ellipse cx="280" cy="${140-i*10}" rx="34" ry="9" fill="#F2B705" stroke="#a16207" stroke-width="2"/>`).join("")}<text x="280" y="96" text-anchor="middle" font-family="Big Shoulders Display,Impact" font-weight="900" font-size="30" fill="#a16207">R$</text>`,
  hospital:`<rect width="400" height="160" fill="#e0f2fe"/><rect x="40" y="96" width="220" height="24" rx="6" fill="#fff" stroke="#94a3b8" stroke-width="2"/><rect x="40" y="86" width="60" height="16" rx="6" fill="#f1f5f9"/><rect x="50" y="120" width="8" height="30" fill="#94a3b8"/><rect x="242" y="120" width="8" height="30" fill="#94a3b8"/>
    <rect x="290" y="30" width="80" height="56" rx="6" fill="#0f172a"/><path d="M296 60 h16 l6 -18 l8 34 l6 -16 h32" stroke="#22c55e" stroke-width="3" fill="none"/><rect x="150" y="20" width="44" height="44" rx="6" fill="#ef4444"/><rect x="166" y="28" width="12" height="28" fill="#fff"/><rect x="158" y="36" width="28" height="12" fill="#fff"/>`,
  imprensa:`<rect width="400" height="160" fill="#1e293b"/>${Array.from({length:12},(_,i)=>`<rect x="${(i%6)*68+6}" y="${Math.floor(i/6)*44+8}" width="58" height="36" fill="${i%2?"#334155":"#3b4a63"}"/><text x="${(i%6)*68+35}" y="${Math.floor(i/6)*44+31}" text-anchor="middle" font-size="12" font-weight="700" fill="#94a3b8">LIVE</text>`).join("")}
    <rect x="80" y="110" width="240" height="50" fill="#0f172a"/>${[120,170,220,270].map((x,i)=>`<rect x="${x-3}" y="${92-i%2*8}" width="6" height="30" fill="#111"/><ellipse cx="${x}" cy="${88-i%2*8}" rx="9" ry="12" fill="${["#ef4444","#1F4FC9","#F2B705","#22c55e"][i]}"/>`).join("")}
    <circle cx="40" cy="30" r="16" fill="#fff" opacity=".85"/><circle cx="360" cy="40" r="12" fill="#fff" opacity=".7"/>`,
  aviao:`${SKY("#38bdf8","#bae6fd")}<ellipse cx="80" cy="120" rx="60" ry="18" fill="#fff"/><ellipse cx="320" cy="50" rx="50" ry="14" fill="#fff"/><g transform="rotate(-8 200 80)"><rect x="110" y="70" width="190" height="28" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <path d="M190 84 L150 130 L180 130 L230 84Z" fill="#cbd5e1" stroke="#475569" stroke-width="2"/><path d="M130 72 L112 44 L130 44 L150 72Z" fill="${cc[0]}" stroke="#475569" stroke-width="2"/>${[0,1,2,3,4,5].map(i=>`<circle cx="${180+i*18}" cy="80" r="4" fill="#38bdf8"/>`).join("")}</g>`,
  casa:`${SKY("#fde68a","#fef3c7")}<circle cx="340" cy="34" r="18" fill="#f59e0b"/><rect x="120" y="70" width="140" height="70" fill="#f4a261"/><path d="M110 74 L190 24 L270 74Z" fill="#b5523b"/><rect x="176" y="100" width="30" height="40" fill="#7c3f1d"/>
    <rect x="136" y="88" width="26" height="22" fill="#bae6fd"/><rect x="222" y="88" width="26" height="22" fill="#bae6fd"/><rect y="138" width="400" height="22" fill="#65a30d"/><circle cx="60" cy="106" r="28" fill="#4d7c0f"/><rect x="56" y="110" width="8" height="30" fill="#7c3f1d"/>`,
  trofeu:`<rect width="400" height="160" fill="#13271D"/>${Array.from({length:16},(_,i)=>`<path d="M200 80 L${200+220*Math.cos(i*Math.PI/8)} ${80+220*Math.sin(i*Math.PI/8)} L${200+220*Math.cos(i*Math.PI/8+.18)} ${80+220*Math.sin(i*Math.PI/8+.18)}Z" fill="#F2B705" opacity=".18"/>`).join("")}
    <path d="M170 34 H230 V64 Q230 96 200 100 Q170 96 170 64Z" fill="#F2B705" stroke="#a16207" stroke-width="3"/><path d="M170 44 Q146 44 150 64 Q154 78 172 78" fill="none" stroke="#a16207" stroke-width="5"/><path d="M230 44 Q254 44 250 64 Q246 78 228 78" fill="none" stroke="#a16207" stroke-width="5"/>
    <rect x="193" y="100" width="14" height="18" fill="#F2B705"/><rect x="176" y="118" width="48" height="14" rx="3" fill="#a16207"/>`,
  selecao:`<rect width="400" height="160" fill="#0B6E3A"/><path d="M200 18 L370 80 L200 142 L30 80Z" fill="#F2B705"/><circle cx="200" cy="80" r="40" fill="#1F3FA0"/><path d="M162 72 Q200 60 238 86" stroke="#fff" stroke-width="6" fill="none"/>
    ${Array.from({length:9},(_,i)=>`<circle cx="${182+(i*13)%40}" cy="${84+(i*7)%18}" r="2" fill="#fff"/>`).join("")}`,
  escola:`<rect width="400" height="160" fill="#fde7c4"/><rect x="60" y="16" width="280" height="100" fill="#1e3a2f" stroke="#8b5e3c" stroke-width="8"/>
    <text x="90" y="56" font-family="Barlow,sans-serif" font-size="22" fill="#e5e7eb">7 × 8 = ?</text><text x="90" y="92" font-family="Barlow,sans-serif" font-size="18" fill="#e5e7eb">√144 + 3² =</text>
    <circle cx="290" cy="76" r="14" fill="none" stroke="#e5e7eb" stroke-width="2"/><rect x="40" y="128" width="320" height="10" fill="#8b5e3c"/>`,
  contrato:`<rect width="400" height="160" fill="#e2e8f0"/><rect x="110" y="12" width="180" height="140" fill="#fff" stroke="#94a3b8" stroke-width="2" transform="rotate(-4 200 80)"/>
    ${[0,1,2,3,4,5].map(i=>`<rect x="128" y="${32+i*14}" width="${140-(i%3)*24}" height="5" fill="#cbd5e1" transform="rotate(-4 200 80)"/>`).join("")}
    <path d="M140 128 q14 -20 26 0 t26 -4 t24 2" stroke="#1F4FC9" stroke-width="3" fill="none" transform="rotate(-4 200 80)"/><rect x="250" y="70" width="10" height="80" rx="3" fill="#13271D" transform="rotate(35 255 110)"/>`,
  celular:`<rect width="400" height="160" fill="#fce7f3"/><rect x="150" y="8" width="100" height="150" rx="16" fill="#13271D"/><rect x="158" y="22" width="84" height="120" rx="6" fill="#f8fafc"/>
    <rect x="164" y="32" width="56" height="18" rx="8" fill="#e2e8f0"/><rect x="180" y="58" width="56" height="18" rx="8" fill="#22c55e"/><rect x="164" y="84" width="64" height="18" rx="8" fill="#e2e8f0"/>
    ${[[60,40],[90,110],[320,50],[340,120]].map(([x,y])=>`<path d="M${x} ${y} c-8 -10 -22 -2 -14 8 l14 14 l14 -14 c8 -10 -6 -18 -14 -8Z" fill="#ec4899"/>`).join("")}`,
  policia:`<rect width="400" height="160" fill="#0f172a"/><circle cx="130" cy="60" r="70" fill="#ef4444" opacity=".35"/><circle cx="270" cy="60" r="70" fill="#3b82f6" opacity=".35"/>
    <rect x="110" y="80" width="180" height="46" rx="14" fill="#f8fafc"/><rect x="150" y="60" width="100" height="30" rx="8" fill="#f8fafc"/><rect x="170" y="52" width="26" height="12" fill="#ef4444"/><rect x="204" y="52" width="26" height="12" fill="#3b82f6"/>
    <rect x="110" y="98" width="180" height="8" fill="#1F3FA0"/><circle cx="150" cy="128" r="12" fill="#111"/><circle cx="250" cy="128" r="12" fill="#111"/>`,
  praia:`${SKY("#7dd3fc","#e0f2fe")}<circle cx="320" cy="40" r="22" fill="#fbbf24"/><rect y="96" width="400" height="30" fill="#0ea5e9"/><path d="M0 100 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#fff" stroke-width="3" fill="none"/>
    <rect y="124" width="400" height="36" fill="#fde68a"/><rect x="96" y="70" width="4" height="70" fill="#7c3f1d"/><path d="M50 74 Q98 40 146 74Z" fill="#ef4444"/>`,
  carro:`${SKY("#cbd5e1","#f1f5f9")}<rect y="120" width="400" height="40" fill="#475569"/><path d="M80 112 L120 80 H250 L300 108 L330 112 V130 H80Z" fill="#dc2626" stroke="#7f1d1d" stroke-width="3"/><path d="M130 86 H180 V106 H112Z M190 86 H246 L276 106 H190Z" fill="#bfdbfe"/>
    <circle cx="130" cy="132" r="16" fill="#111"/><circle cx="130" cy="132" r="7" fill="#9ca3af"/><circle cx="280" cy="132" r="16" fill="#111"/><circle cx="280" cy="132" r="7" fill="#9ca3af"/>`
  };
  const a=ART[artKey(k)]||ART[artKey(RESERVA[k]||"")];
  if(!a&&RESERVA[k]) k=RESERVA[k];
  return a?`<img class="ill" src="${a}" alt="">`:`<svg class="ill" viewBox="0 0 400 160" role="img" aria-hidden="true">${S[k]||S.campo}</svg>`;
}

// Pacote de arte (Higgsfield): assets/cenas/<chave>.webp, 1200×480
const ART=Object.fromEntries(["rua","sinal","escola","estadio","hospital","imprensa","praia","aviao","dinheiro","carro","policia","trofeu","selecao","celular",
  "campo_terra","campo_ct","vestiario_base","vestiario_pro","festa_base","festa_pro","casa_simples","casa_rica","contrato_simples","contrato_flash",
  "tecnico","empresario","torcida","bebe","peneira","penalti","aposentadoria","academia","defesa"]
  .map(k=>[k,`assets/cenas/${k}.webp`]));
// Cenas com duas artes: [prólogo, profissional, só profissional acima de RICO por ano]
const RICO=3e5;
const VARS={campo:["campo_terra","campo_ct"],vestiario:["vestiario_base","vestiario_pro"],festa:["festa_base","festa_pro"],
  casa:["casa_simples","casa_rica",1],contrato:["contrato_simples","contrato_flash",1]};
// Cenas novas ainda sem arte usam a cena mais parecida até a imagem existir em ART
const RESERVA={};
const artKey=k=>{const v=VARS[k];if(!v) return k;return v[PHASE!=="pre"&&(!v[2]||salAtual()>RICO)?1:0];};

export {RESERVA,hash,crest,shirt,shirtBack,scene,SKY,CROWD,FIELD,ART,RICO,VARS,artKey};
