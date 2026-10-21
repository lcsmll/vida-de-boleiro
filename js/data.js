const $ = id => document.getElementById(id);
const rand = (a,b) => a + Math.random()*(b-a);
const chance = p => Math.random() < p;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const clamp = (v,a=0,b=100) => Math.max(a, Math.min(b, v));
const poisson = l => { let L=Math.exp(-l),k=0,p=1; do{k++;p*=Math.random();}while(p>L); return k-1; };
const esc = s => String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const UFS = [["AC","Acre"],["AL","Alagoas"],["AP","Amapá"],["AM","Amazonas"],["BA","Bahia"],["CE","Ceará"],["DF","Distrito Federal"],["ES","Espírito Santo"],["GO","Goiás"],["MA","Maranhão"],["MT","Mato Grosso"],["MS","Mato Grosso do Sul"],["MG","Minas Gerais"],["PA","Pará"],["PB","Paraíba"],["PR","Paraná"],["PE","Pernambuco"],["PI","Piauí"],["RJ","Rio de Janeiro"],["RN","Rio Grande do Norte"],["RS","Rio Grande do Sul"],["RO","Rondônia"],["RR","Roraima"],["SC","Santa Catarina"],["SP","São Paulo"],["SE","Sergipe"],["TO","Tocantins"]];
const POS = [{id:"GOL",n:"Goleiro"},{id:"ZAG",n:"Zagueiro"},{id:"LAT",n:"Lateral"},{id:"VOL",n:"Volante"},{id:"MEI",n:"Meia"},{id:"PON",n:"Ponta"},{id:"ATA",n:"Centroavante"}];
const PES = ["Destro","Canhoto","Ambidestro"];
const STATS = [{k:"bola",n:"Bola",ic:"⚽"},{k:"corpo",n:"Corpo",ic:"💪"},{k:"cabeca",n:"Cabeça",ic:"🧠"},{k:"familia",n:"Família",ic:"🏠"}];

/* ===================== Mundo ===================== */
const LIGAS = {
  BR:{n:"Brasileirão",copa:"Copa do Brasil",cont:"Libertadores",pais:"Brasil"},
  ARG:{n:"Liga Argentina",copa:"Copa Argentina",cont:"Libertadores",pais:"Argentina"},
  POR:{n:"Liga Portuguesa",copa:"Taça de Portugal",cont:"Champions",pais:"Portugal"},
  HOL:{n:"Liga Holandesa",copa:"Copa da Holanda",cont:"Champions",pais:"Holanda"},
  ENG:{n:"Liga Inglesa",copa:"Copa da Inglaterra",cont:"Champions",pais:"Inglaterra"},
  ESP:{n:"Liga Espanhola",copa:"Copa do Rei",cont:"Champions",pais:"Espanha"},
  ITA:{n:"Liga Italiana",copa:"Copa da Itália",cont:"Champions",pais:"Itália"},
  ALE:{n:"Liga Alemã",copa:"Copa da Alemanha",cont:"Champions",pais:"Alemanha"},
  FRA:{n:"Liga Francesa",copa:"Copa da França",cont:"Champions",pais:"França"},
  SAU:{n:"Liga Saudita",copa:"Copa do Rei Saudita",cont:null,pais:"Arábia Saudita"},
  USA:{n:"Liga Americana",copa:null,cont:null,pais:"Estados Unidos"},
  JPN:{n:"Liga Japonesa",copa:"Copa do Imperador",cont:null,pais:"Japão"}
};
const DEFAULT_CLUBS = [
  {n:"Paulistânia FC",l:"BR",t:4,c:["#111111","#ffffff"],uf:"SP"},{n:"Bandeirantes AC",l:"BR",t:4,c:["#C8102E","#ffffff"],uf:"SP"},
  {n:"Guanabara FC",l:"BR",t:4,c:["#C8102E","#111111"],uf:"RJ"},{n:"Tricolor Carioca",l:"BR",t:3,c:["#7A0E2C","#0B6E3A"],uf:"RJ"},
  {n:"Real Mineiro",l:"BR",t:4,c:["#1F3FA0","#ffffff"],uf:"MG"},{n:"Grêmio Pampeano",l:"BR",t:4,c:["#2E6FD8","#111111"],uf:"RS"},
  {n:"Atlético Araucária",l:"BR",t:3,c:["#B3121C","#111111"],uf:"PR"},{n:"EC Recôncavo",l:"BR",t:3,c:["#1F4FC9","#D3283E"],uf:"BA"},
  {n:"Sport Capibaribe",l:"BR",t:3,c:["#C8102E","#F2B705"],uf:"PE"},{n:"Ferroviário Alencarino",l:"BR",t:3,c:["#111111","#ffffff"],uf:"CE"},
  {n:"Cerrado FC",l:"BR",t:2,c:["#0B6E3A","#F2B705"],uf:"GO"},{n:"Amazônia EC",l:"BR",t:2,c:["#1F4FC9","#ffffff"],uf:"PA"},
  {n:"Club Riachuelo",l:"ARG",t:4,c:["#0A3A8C","#F2B705"]},{n:"Atlético Río de la Plata",l:"ARG",t:4,c:["#ffffff","#C8102E"]},
  {n:"Dragões do Norte",l:"POR",t:4,c:["#1F4FC9","#ffffff"]},{n:"Águias de Lisboa",l:"POR",t:4,c:["#C8102E","#ffffff"]},{n:"Sporting Tejo",l:"POR",t:3,c:["#0B6E3A","#ffffff"]},
  {n:"Ajax Polder",l:"HOL",t:3,c:["#ffffff","#C8102E"]},{n:"PSV Brabante",l:"HOL",t:3,c:["#C8102E","#ffffff"]},
  {n:"London Royals",l:"ENG",t:5,c:["#1F3FA0","#ffffff"]},{n:"Manchester Rovers",l:"ENG",t:5,c:["#6CABDD","#ffffff"]},
  {n:"Merseyside FC",l:"ENG",t:4,c:["#C8102E","#ffffff"]},{n:"North London Guns",l:"ENG",t:4,c:["#C8102E","#ffffff"]},{n:"Tyneside United",l:"ENG",t:3,c:["#111111","#ffffff"]},
  {n:"Real Castilla",l:"ESP",t:5,c:["#ffffff","#C9A227"]},{n:"Club Barcino",l:"ESP",t:5,c:["#A50044","#004D98"]},
  {n:"Atlético Guadalquivir",l:"ESP",t:4,c:["#C8102E","#ffffff"]},{n:"Valencia Azahar",l:"ESP",t:3,c:["#ffffff","#F28C28"]},
  {n:"Inter Lombarda",l:"ITA",t:4,c:["#0A3A8C","#111111"]},{n:"Torino Bianconeri",l:"ITA",t:4,c:["#111111","#ffffff"]},
  {n:"Milano Diavoli",l:"ITA",t:4,c:["#C8102E","#111111"]},{n:"Napoli Vesuvio",l:"ITA",t:3,c:["#3FA9F5","#ffffff"]},{n:"Roma Imperiale",l:"ITA",t:3,c:["#8E1F2F","#F2B705"]},
  {n:"FC Bavaria",l:"ALE",t:5,c:["#C8102E","#ffffff"]},{n:"Borussia Ruhr",l:"ALE",t:4,c:["#F2D100","#111111"]},{n:"Leipzig Bullen",l:"ALE",t:3,c:["#ffffff","#C8102E"]},
  {n:"Paris Lumière",l:"FRA",t:5,c:["#0A2463","#C8102E"]},{n:"Olympique Provence",l:"FRA",t:3,c:["#ffffff","#2EA3F2"]},
  {n:"Al-Riyadh FC",l:"SAU",t:3,c:["#F2B705","#1F4FC9"]},{n:"Al-Jeddah Club",l:"SAU",t:3,c:["#ffffff","#0B6E3A"]},
  {n:"Miami Palms",l:"USA",t:2,c:["#F7B5CD","#111111"]},{n:"LA Stars",l:"USA",t:2,c:["#111111","#F2B705"]},
  {n:"Tóquio Samurai",l:"JPN",t:2,c:["#0A3A8C","#C8102E"]}
];

const SEL = [
  {n:"Brasil",f:"🇧🇷",r:87},{n:"Argentina",f:"🇦🇷",r:87},{n:"França",f:"🇫🇷",r:88},{n:"Inglaterra",f:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",r:86},
  {n:"Espanha",f:"🇪🇸",r:87},{n:"Alemanha",f:"🇩🇪",r:85},{n:"Portugal",f:"🇵🇹",r:85},{n:"Holanda",f:"🇳🇱",r:83},
  {n:"Itália",f:"🇮🇹",r:82},{n:"Uruguai",f:"🇺🇾",r:80},{n:"Bélgica",f:"🇧🇪",r:80},{n:"Croácia",f:"🇭🇷",r:79},
  {n:"Colômbia",f:"🇨🇴",r:79},{n:"Marrocos",f:"🇲🇦",r:80},{n:"Estados Unidos",f:"🇺🇸",r:77},{n:"México",f:"🇲🇽",r:76},
  {n:"Japão",f:"🇯🇵",r:78},{n:"Senegal",f:"🇸🇳",r:77},{n:"Suíça",f:"🇨🇭",r:77},{n:"Equador",f:"🇪🇨",r:75},
  {n:"Coreia do Sul",f:"🇰🇷",r:75},{n:"Dinamarca",f:"🇩🇰",r:78},{n:"Nigéria",f:"🇳🇬",r:74},{n:"Austrália",f:"🇦🇺",r:72},
  {n:"Arábia Saudita",f:"🇸🇦",r:70},{n:"Canadá",f:"🇨🇦",r:73}
];
const LEVEL = {1:56,2:63,3:70,4:76,5:82};
const REG = {SP:"Paulistânia FC",RJ:"Guanabara FC",ES:"Guanabara FC",MG:"Real Mineiro",RS:"Grêmio Pampeano",PR:"Atlético Araucária",SC:"Atlético Araucária",
  BA:"EC Recôncavo",SE:"EC Recôncavo",PE:"Sport Capibaribe",PB:"Sport Capibaribe",AL:"Sport Capibaribe",RN:"Sport Capibaribe",
  CE:"Ferroviário Alencarino",PI:"Ferroviário Alencarino",MA:"Ferroviário Alencarino",GO:"Cerrado FC",DF:"Cerrado FC",MT:"Cerrado FC",MS:"Cerrado FC"};
const MES=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const MESC=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt=v=>{const a=Math.abs(v),s=v<0?"−":"";if(a>=1e9)return s+"R$ "+(a/1e9).toLocaleString("pt-BR",{maximumFractionDigits:1})+" bi";
  if(a>=1e6)return s+"R$ "+(a/1e6).toLocaleString("pt-BR",{maximumFractionDigits:1})+" mi";if(a>=1e3)return s+"R$ "+Math.round(a/1e3)+" mil";return s+"R$ "+Math.round(a);};
function C(who,em,scene,text,opts,extra){return Object.assign({who,em,scene,text,opts},extra||{});}
const O=(ic,label,fx,more)=>Object.assign({ic,label,fx:fx||{}},more||{});
const FILLP={
  BR:[["Serrano","Litoral","Sertão","Planalto","Vale do Aço","Pantanal","Agreste","Cariri","Pampa","Fronteira","Chapada","Ribeira","Mata Atlântica","Capixaba","Oeste","Seridó","Caatinga","Araguaia"],[" FC"," EC"," AC"," SC"],0],
  ARG:[["Pampero","Andino","Patagonia","Cordillera","Austral","Mendocino","Chaqueño","Fueguino","Salteño","Puntano","Ribereño","Gaucho","Quebracho","Riojano","Pampeano","Cuyano"],["Club ","Deportivo ","Atlético ","Unión "],1],
  POR:[["Ribeira","Douro Alto","Serra da Estrela","Algarve Sul","Minho Verde","Tejo Norte","Alentejo","Beira Mar","Ribatejo","Oliveiral","Barlavento","Planície","Montemor","Atlântico"],["SC ","Académico ","Desportivo ","União "],1],
  HOL:[["Polderdam","Windmolen","Tulpenveld","Kanaalstad","Duinwijk","Dijkhaven","Zeeweide","Heidestad","Veenland","Grachtwijk","Kustdorp","Waterburg","Noordmeer","Ijsselweide"],["FC ","SC ","VV ","Go "],1],
  ENG:[["Ashbury","Kingsfield","Northbridge","Westmoor","Harrowgate","Stonehill","Redcliffe","Brookhaven","Oakvale","Thornbury","Elmstead","Greywater","Hollowmere","Lakeside","Fenwick","Marlow Vale"],[" Town"," United"," City"," Athletic"],0],
  ESP:[["Sierra","Olivar","Marina","Meseta","Ribera","Albero","Pinar","Vega","Almendro","Cantábrico","Llanura","Arenal","Montaña","Peñascal"],["CD ","Real ","Atlético ","UD "],1],
  ITA:[["Collina","Laguna","Pianura","Appennino","Riviera","Dolomiti","Adriatico","Vigneto","Olivo","Marea","Brezza","Tirreno","Etrusca","Lucana"],["AC ","US ","Sporting ","Calcio "],1],
  ALE:[["Waldstadt","Bergheim","Flusstal","Eisenhafen","Nordheide","Rheinwiese","Kohlenberg","Sonnenfeld","Lindenau","Grünwald","Mühlbach","Sturmhafen","Hochland","Seeburg"],["FC ","SV ","VfB ","TSV "],1],
  FRA:[["Montclair","Bordemer","Valfleur","Rochebrune","Lavande","Vignoble","Belle-Rive","Hautmont","Clairvaux","Sablons","Mistral","Ardoise","Pontneuf","Garrigue"],["AS ","FC ","Stade ","Racing "],1],
  SAU:[["Al-Nakheel","Al-Sahra","Al-Waha","Al-Qamar","Al-Badr","Al-Rimal","Al-Majd","Al-Nour","Al-Fajr","Al-Najm","Al-Khaleej","Al-Wadi","Al-Dana","Al-Sarab"],[" FC"," Club"],0],
  USA:[["Desert","Bay","Harbor","Prairie","Mountain","Lake","River","Canyon","Coast","Valley","Liberty","Pioneer","Summit","Frontier"],[" SC"," FC"," United"," City"],0],
  JPN:[["Sakura","Fuji","Kaze","Umi","Yama","Hoshi","Kawa","Tsuki","Hikari","Mori","Nami","Sora","Kumo","Tora"],[" FC"," United"," SC"],0]
};
const NAMES={br:[["Gabriel","Pedro","Matheus","Vitor","Rafael","Kauã","Luan","Igor","Wesley","Breno","Caio","Davi","Ruan","Thiago"],["Silva","Santos","Rocha","Lima","Costa","Moura","Teixeira","Barbosa","Araújo","Pires","Nunes","Freitas"]],
  es:[["Mateo","Thiago","Santiago","Joaquín","Nicolás","Facundo","Álvaro","Iker","Pablo","Hugo"],["Fernández","Gómez","Romero","Ruiz","Navarro","Ortega","Sosa","Medina","Torres","Vega"]],
  en:[["Jack","Harry","Oliver","Callum","Mason","Liam","Noah","Ethan","Kai","Reece"],["Walker","Turner","Hughes","Bennett","Fletcher","Ward","Cooper","Reid","Shaw","Price"]],
  it:[["Luca","Marco","Lorenzo","Matteo","Federico","Riccardo","Davide","Nicolò"],["Moretti","Ricci","Conti","Galli","Ferraro","Bianchi","Mancini","Greco"]],
  de:[["Lukas","Jonas","Leon","Felix","Niklas","Tim","Jan","Florian"],["Becker","Wagner","Hoffmann","Schulz","Krüger","Braun","Vogel","Keller"]],
  fr:[["Hugo","Théo","Lucas","Enzo","Adrien","Maxime","Yanis","Nathan"],["Dubois","Moreau","Laurent","Girard","Lefèvre","Fontaine","Bonnet","Mercier"]],
  nl:[["Daan","Sem","Milan","Lars","Bram","Thijs"],["de Vries","Jansen","Bakker","Visser","Smit","Mulder"]],
  ar:[["Faisal","Salem","Nasser","Majed","Yasser","Hamad"],["Al-Harbi","Al-Qahtani","Al-Dossari","Al-Shehri","Al-Mutairi","Al-Zahrani"]],
  jp:[["Haruto","Sota","Yuto","Ren","Kaito","Riku"],["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito"]]};
const LANG={BR:"br",BR2:"br",POR:"br",ARG:"es",ESP:"es",ENG:"en",USA:"en",ITA:"it",ALE:"de",FRA:"fr",HOL:"nl",SAU:"ar",JPN:"jp"};
const COLS=[["#334155","#ffffff"],["#7c2d12","#fde68a"],["#065f46","#ffffff"],["#1e3a8a","#facc15"],["#831843","#ffffff"],["#111827","#ef4444"],["#0e7490","#ffffff"],["#4d7c0f","#111111"]];
const STG=["1ª fase","Oitavas","Quartas","Semifinal","Final"];
const fase=f=>({"1ª fase":"na 1ª fase","Oitavas":"nas oitavas","Quartas":"nas quartas","Semifinal":"na semifinal","Final":"na final","Grupos":"na fase de grupos"})[f]||f;
const CAL={
  BR:{start:0,end:11,rounds:[0,0,0,3,4,4,4,4,4,5,5,5],est:{0:3,1:2,2:"ko"},copa:{1:0,4:1,6:2,8:3,10:4},contG:{3:2,4:2,5:2},contK:{7:["Oitavas"],8:["Quartas"],9:["Semifinal"],10:["Final"]}},
  EU:{start:7,end:9,rounds:[3,4,4,4,5,3,4,4,4,3,0,0],est:{},copa:{3:0,5:1,6:2,8:3,9:4},contG:{1:2,2:1,3:2,4:1},contK:{6:["Oitavas"],8:["Quartas"],9:["Semifinal","Final"]}}
};
const KSEQ=["Oitavas","Quartas","Semifinal","Final"];
const calOf=c=>["BR","ARG","USA","JPN"].includes(c.l)?"BR":"EU";

export {C,$,rand,chance,pick,clamp,poisson,esc,UFS,POS,PES,STATS,LIGAS,DEFAULT_CLUBS,SEL,LEVEL,REG,MES,MESC,fmt,O,FILLP,NAMES,LANG,COLS,STG,fase,CAL,KSEQ,calOf};
