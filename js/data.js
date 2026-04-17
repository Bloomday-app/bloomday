function getFallback(type){const m=FALLBACK[type]||FALLBACK.birthday;return m[Math.floor(Math.random()*m.length)];}

const PLANS={
  free:{name:'Starter',mm:10,mg:1,msgs:5,gifts:false,cards:false,adm:0,amb:false,p:0},
  solo:{name:'Solo',mm:30,mg:2,msgs:30,gifts:false,cards:false,adm:1,amb:false,p:1.99},
  bloom:{name:'Bloom',mm:999,mg:5,msgs:999,gifts:true,cards:true,adm:2,amb:false,p:4.99},
  premium:{name:'Bloom Premium',mm:999,mg:999,msgs:999,gifts:true,cards:true,adm:3,amb:true,p:7.99},
  pro:{name:'Business',mm:50,mg:999,msgs:999,gifts:true,cards:true,adm:5,amb:true,p:19.99},
  enterprise:{name:'Enterprise',mm:999,mg:999,msgs:999,gifts:true,cards:true,adm:999,amb:true,p:0},
};
const PLAN_DETAILS={
  free:{price:'0€',period:'pour toujours',badge:'Gratuit',badgeCls:'fre',pop:false,feats:['10 membres','1 groupe','5 messages/mois'],nope:['Cadeaux IA ✗','Cartes ✗'],cta:'Commencer gratuitement',ctaCls:'F',mode:'perso'},
  solo:{price:'1,99€',period:'/mois',badge:'',pop:false,feats:['30 membres','2 groupes','30 messages/mois','1 admin'],nope:['Cadeaux IA ✗'],cta:'Choisir Solo',ctaCls:'S',mode:'perso'},
  bloom:{badge:'Le plus choisi 🔥',badgeCls:'pop',pop:true,price:'4,99€',period:'/mois',badge:'Le plus choisi 🔥',badgeCls:'pop',pop:true,feats:['Membres illimités','5 groupes','Messages illimités','Cadeaux IA ✓','Cartes ✓','2 admins'],nope:[],cta:'7 jours gratuits →',ctaCls:'P',mode:'perso'},
  premium:{price:'7,99€',period:'/mois',badge:'',pop:false,feats:['Tout illimité','3 admins','Ambassador ✓','Marketplace ✓'],nope:[],cta:'Choisir Premium',ctaCls:'S',mode:'perso'},
  pro:{price:'19,99€',period:'/mois',badge:'🏢 Business',badgeCls:'biz',pop:false,feats:['50 collaborateurs','Groupes illimités','Import CSV','5 admins','Ancienneté auto'],nope:[],cta:'Essai 14 jours gratuits →',ctaCls:'P',mode:'biz'},
  enterprise:{price:'Sur devis',period:'',badge:'',pop:false,feats:['Tout illimité','SIRH & Slack','Marque blanche'],nope:[],cta:'Nous contacter',ctaCls:'S',mode:'biz'},
};
function getMKT(){return[
  {id:'m1',n:'Pack Spirituel',a:'Pastor Jean K.',p:0.99,mk:'mktPackSpiritual',dk:'mktDescSpiritual',e:'🙏',s:142},
  {id:'m2',n:'Pack Humour',a:'ComedyBirthday',p:0.99,mk:'mktPackHumor',dk:'mktDescHumor',e:'😄',s:89},
  {id:'m3',n:'Pack Poétique Floral',a:'BloomPoetry',p:1.49,mk:'mktPackPoetic',dk:'mktDescPoetic',e:'🌺',s:67},
  {id:'m4',n:'Pack Pro Élite',a:'RH Pro',p:1.99,mk:'mktPackPro',dk:'mktDescPro',e:'💼',s:234},
  {id:'m5',n:'Pack Africa Ubuntu',a:'Ubuntu Tim',p:0.99,mk:'mktPackAfrica',dk:'mktDescAfrica',e:'🌍',s:188},
];};
const PAYS=[
  {c:'fr',l:'🇫🇷 France'},{c:'be',l:'🇧🇪 Belgique'},{c:'ch',l:'🇨🇭 Suisse'},{c:'ca',l:'🇨🇦 Canada'},{c:'us',l:'🇺🇸 États-Unis'},{c:'gb',l:'🇬🇧 Royaume-Uni'},
  {c:'de',l:'🇩🇪 Allemagne'},{c:'es',l:'🇪🇸 Espagne'},{c:'it',l:'🇮🇹 Italie'},{c:'pt',l:'🇵🇹 Portugal'},{c:'nl',l:'🇳🇱 Pays-Bas'},{c:'lu',l:'🇱🇺 Luxembourg'},
  {c:'ht',l:'🇭🇹 Haïti'},{c:'gp',l:'🇬🇵 Guadeloupe'},{c:'mq',l:'🇲🇶 Martinique'},{c:'re',l:'🇷🇪 La Réunion'},
  {c:'ma',l:'🇲🇦 Maroc'},{c:'dz',l:'🇩🇿 Algérie'},{c:'tn',l:'🇹🇳 Tunisie'},{c:'eg',l:'🇪🇬 Égypte'},
  {c:'sn',l:'🇸🇳 Sénégal'},{c:'ci',l:"🇨🇮 Côte d'Ivoire"},{c:'cm',l:'🇨🇲 Cameroun'},{c:'cd',l:'🇨🇩 Congo RDC'},{c:'cg',l:'🇨🇬 Congo Brazza'},
  {c:'ga',l:'🇬🇦 Gabon'},{c:'gn',l:'🇬🇳 Guinée'},{c:'ml',l:'🇲🇱 Mali'},{c:'bf',l:'🇧🇫 Burkina'},{c:'ne',l:'🇳🇪 Niger'},{c:'td',l:'🇹🇩 Tchad'},
  {c:'bj',l:'🇧🇯 Bénin'},{c:'tg',l:'🇹🇬 Togo'},{c:'gh',l:'🇬🇭 Ghana'},{c:'ng',l:'🇳🇬 Nigéria'},{c:'mg',l:'🇲🇬 Madagascar'},
  {c:'mu',l:'🇲🇺 Maurice'},{c:'km',l:'🇰🇲 Comores'},{c:'dj',l:'🇩🇯 Djibouti'},{c:'lb',l:'🇱🇧 Liban'},
  {c:'br',l:'🇧🇷 Brésil'},{c:'mx',l:'🇲🇽 Mexique'},{c:'co',l:'🇨🇴 Colombie'},
  {c:'in',l:'🇮🇳 Inde'},{c:'cn',l:'🇨🇳 Chine'},{c:'jp',l:'🇯🇵 Japon'},{c:'au',l:'🇦🇺 Australie'},{c:'sa',l:'🇸🇦 Arabie Saoudite'},
];
const FETES=[
  {n:"Jour de l'An",i:"🎆",m:1,d:1,c:['universal']},{n:"Saint-Valentin",i:"💝",m:2,d:14,c:['universal']},
  {n:"Journée des Femmes",i:"🌸",m:3,d:8,c:['universal']},{n:"Journée de l'Amitié",i:"🤝",m:7,d:30,c:['universal']},
  {n:"Halloween",i:"🎃",m:10,d:31,c:['universal']},{n:"Noël",i:"🎄",m:12,d:25,c:['christian']},
  {n:"Saint-Sylvestre",i:"🥂",m:12,d:31,c:['universal']},
  {n:"Fête des Mères",i:"💐",m:5,d:26,c:['fr','be','ch','ca','ht','ci','sn','cm','ga','cd']},
  {n:"Fête des Pères",i:"👔",m:6,d:15,c:['fr','be','ch','ca']},
  {n:"Fête Nationale France",i:"🇫🇷",m:7,d:14,c:['fr','gp','mq','re']},
  {n:"Armistice",i:"🕊️",m:11,d:11,c:['fr','be']},{n:"Victoire 1945",i:"✌️",m:5,d:8,c:['fr','be']},
  {n:"Indépendance Haïti",i:"🇭🇹",m:1,d:1,c:['ht']},{n:"Flag Day Haïti",i:"🇭🇹",m:5,d:18,c:['ht']},
  {n:"Indépendance USA",i:"🇺🇸",m:7,d:4,c:['us']},{n:"Thanksgiving",i:"🦃",m:11,d:28,c:['us']},
  {n:"Fête Nationale Belgique",i:"🇧🇪",m:7,d:21,c:['be']},
  {n:"Indépendance Maroc",i:"🇲🇦",m:11,d:18,c:['ma']},{n:"Fête du Trône Maroc",i:"🇲🇦",m:7,d:30,c:['ma']},
  {n:"Indépendance Algérie",i:"🇩🇿",m:11,d:1,c:['dz']},{n:"Indépendance Tunisie",i:"🇹🇳",m:3,d:20,c:['tn']},
  {n:"Indépendance Sénégal",i:"🇸🇳",m:4,d:4,c:['sn']},{n:"Indépendance Côte d'Ivoire",i:"🇨🇮",m:8,d:7,c:['ci']},
  {n:"Indépendance Cameroun",i:"🇨🇲",m:1,d:1,c:['cm']},{n:"Indépendance Gabon",i:"🇬🇦",m:8,d:17,c:['ga']},
  {n:"Indépendance RDC",i:"🇨🇩",m:6,d:30,c:['cd']},{n:"Indépendance Madagascar",i:"🇲🇬",m:6,d:26,c:['mg']},
  {n:"Indépendance Ghana",i:"🇬🇭",m:3,d:6,c:['gh']},{n:"Indépendance Mali",i:"🇲🇱",m:9,d:22,c:['ml']},
  {n:"Indépendance Togo",i:"🇹🇬",m:4,d:27,c:['tg']},{n:"Indépendance Bénin",i:"🇧🇯",m:8,d:1,c:['bj']},
  {n:"Indépendance Guinée",i:"🇬🇳",m:10,d:2,c:['gn']},{n:"Indépendance Brésil",i:"🇧🇷",m:9,d:7,c:['br']},
  {n:"Indépendance Inde",i:"🇮🇳",m:8,d:15,c:['in']},{n:"Fête Nationale Japon",i:"🇯🇵",m:2,d:11,c:['jp']},
  {n:"Hanami",i:"🌸",m:4,d:1,c:['jp']},{n:"Fête Nationale Italie",i:"🇮🇹",m:6,d:2,c:['it']},
  {n:"Fête Nationale Espagne",i:"🇪🇸",m:10,d:12,c:['es']},{n:"Fête Nationale Allemagne",i:"🇩🇪",m:10,d:3,c:['de']},
  {n:"Indépendance Liban",i:"🇱🇧",m:11,d:22,c:['lb']},
  {n:"Épiphanie",i:"👑",m:1,d:6,c:['christian']},{n:"Toussaint",i:"🕯️",m:11,d:1,c:['christian']},
  {n:"Rosh Hashana",i:"🍎",m:10,d:3,c:['jewish']},{n:"Yom Kippour",i:"🕍",m:10,d:12,c:['jewish']},
  {n:"Hanoukka",i:"🕎",m:12,d:26,c:['jewish']},{n:"Diwali",i:"🪔",m:10,d:20,c:['hindu','in']},
  {n:"Holi",i:"🎨",m:3,d:14,c:['hindu','in']},
];
const DTPL=[
  {id:'t1',n:'Chaleureux & festif',dk:'dtpl1Desc',t:"chaleureux, festif et plein d'amour",e:'🌸'},
  {id:'t2',n:'Poetique',dk:'dtpl2Desc',t:'poetique et lyrique, avec des metaphores florales',e:'🌺'},
  {id:'t3',n:'Humoristique',dk:'dtpl3Desc',t:"humoristique, leger, avec une touche d'humour bienveillant",e:'😄'},
  {id:'t4',n:'Religieux',dk:'dtpl4Desc',t:'spirituel et bienveillant, avec une dimension de foi',e:'🙏'},
  {id:'t5',n:'Professionnel',dk:'dtpl5Desc',t:'professionnel, cordial et respectueux',e:'💼'},
  {id:'t6',n:'Enfantin',dk:'dtpl6Desc',t:'joyeux et simple, adapte aux enfants',e:'🎈'},
];


// ═══════════════════════════════════════════════════════
// i18n Bloomday — 7 langues — TOUTES VALEURS LITTÉRALES
// ═══════════════════════════════════════════════════════