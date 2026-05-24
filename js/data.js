const FALLBACK={
  birthday:[
    'Joyeux anniversaire ! Que cette journée soit pleine de joie, de rires et de bons moments partagés. 🎂🌸',
    'En ce jour spécial, toutes mes pensées se tournent vers toi pour te souhaiter un anniversaire inoubliable ! ✨🎉',
    'Que cette nouvelle année de vie t\'apporte santé, bonheur et tout ce dont tu rêves. Joyeux anniversaire ! 🌺💫',
  ],
  fete:[
    'À l\'occasion de cette belle fête, je te souhaite une journée lumineuse et pleine de bonheur. 🎊',
    'Que cette célébration t\'apporte joie et sérénité. Profite pleinement de chaque instant ! 🌸✨',
  ],
};
function getFallback(type){
  if(typeof t==='function'){
    var keys=type==='fete'?['fallbackFete1','fallbackFete2']:['fallbackBirthday1','fallbackBirthday2','fallbackBirthday3'];
    var msgs=keys.map(function(k){var v=t(k);return v!==k?v:null;}).filter(Boolean);
    if(msgs.length)return msgs[Math.floor(Math.random()*msgs.length)];
  }
  var m=FALLBACK[type]||FALLBACK.birthday;return m[Math.floor(Math.random()*m.length)];
}

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
  {c:'nc',l:'🇳🇨 Nouvelle-Calédonie'},{c:'pm',l:'🇵🇲 St-Pierre-et-Miquelon'},{c:'cf',l:'🇨🇫 Centrafrique'},{c:'sc',l:'🇸🇨 Seychelles'},{c:'yt',l:'🇾🇹 Mayotte'},
  {c:'nz',l:'🇳🇿 Nouvelle-Zélande'},{c:'ie',l:'🇮🇪 Irlande'},{c:'ke',l:'🇰🇪 Kenya'},{c:'tz',l:'🇹🇿 Tanzanie'},{c:'ug',l:'🇺🇬 Ouganda'},{c:'za',l:'🇿🇦 Afrique du Sud'},{c:'zw',l:'🇿🇼 Zimbabwe'},{c:'zm',l:'🇿🇲 Zambie'},{c:'mw',l:'🇲🇼 Malawi'},{c:'bw',l:'🇧🇼 Botswana'},{c:'na',l:'🇳🇦 Namibie'},{c:'sl',l:'🇸🇱 Sierra Leone'},{c:'lr',l:'🇱🇷 Liberia'},{c:'gm',l:'🇬🇲 Gambie'},{c:'ph',l:'🇵🇭 Philippines'},{c:'sg',l:'🇸🇬 Singapour'},{c:'pk',l:'🇵🇰 Pakistan'},{c:'bd',l:'🇧🇩 Bangladesh'},{c:'lk',l:'🇱🇰 Sri Lanka'},{c:'jm',l:'🇯🇲 Jamaïque'},{c:'tt',l:'🇹🇹 Trinidad-et-Tobago'},{c:'bb',l:'🇧🇧 Barbade'},{c:'gy',l:'🇬🇾 Guyana'},{c:'mt',l:'🇲🇹 Malte'},{c:'et',l:'🇪🇹 Éthiopie'},{c:'ss',l:'🇸🇸 Soudan du Sud'},{c:'er',l:'🇪🇷 Érythrée'},
  {c:'ar',l:'🇦🇷 Argentine'},{c:'pe',l:'🇵🇪 Pérou'},{c:'ve',l:'🇻🇪 Venezuela'},{c:'cl',l:'🇨🇱 Chili'},{c:'ec',l:'🇪🇨 Équateur'},{c:'gt',l:'🇬🇹 Guatemala'},{c:'cu',l:'🇨🇺 Cuba'},{c:'bo',l:'🇧🇴 Bolivie'},{c:'do',l:'🇩🇴 Rép. Dominicaine'},{c:'hn',l:'🇭🇳 Honduras'},{c:'py',l:'🇵🇾 Paraguay'},{c:'sv',l:'🇸🇻 El Salvador'},{c:'ni',l:'🇳🇮 Nicaragua'},{c:'cr',l:'🇨🇷 Costa Rica'},{c:'pa',l:'🇵🇦 Panama'},{c:'uy',l:'🇺🇾 Uruguay'},{c:'pr',l:'🇵🇷 Porto Rico'},
  {c:'ae',l:'🇦🇪 Émirats Arabes Unis'},{c:'iq',l:'🇮🇶 Irak'},{c:'sy',l:'🇸🇾 Syrie'},{c:'jo',l:'🇯🇴 Jordanie'},{c:'ye',l:'🇾🇪 Yémen'},{c:'ps',l:'🇵🇸 Palestine'},{c:'qa',l:'🇶🇦 Qatar'},{c:'bh',l:'🇧🇭 Bahreïn'},{c:'kw',l:'🇰🇼 Koweït'},{c:'om',l:'🇴🇲 Oman'},{c:'ly',l:'🇱🇾 Libye'},{c:'sd',l:'🇸🇩 Soudan'},{c:'so',l:'🇸🇴 Somalie'},
  {c:'np',l:'🇳🇵 Népal'},{c:'fj',l:'🇫🇯 Fidji'},{c:'tw',l:'🇹🇼 Taïwan'},{c:'hk',l:'🇭🇰 Hong Kong'},{c:'mo',l:'🇲🇴 Macao'},{c:'my',l:'🇲🇾 Malaisie'},{c:'ao',l:'🇦🇴 Angola'},{c:'mz',l:'🇲🇿 Mozambique'},{c:'gw',l:'🇬🇼 Guinée-Bissau'},{c:'tl',l:'🇹🇱 Timor-Leste'},
];
const FETES=[
  // ── Universel ──
  {n:"Jour de l'An",i:"🎆",m:1,d:1,c:['universal']},
  {n:"Saint-Valentin",i:"💝",m:2,d:14,c:['universal']},
  {n:"Journée des Femmes",i:"🌸",m:3,d:8,c:['universal']},
  {n:"Fête du Travail",i:"✊",m:5,d:1,c:['universal']},
  {n:"Journée de l'Amitié",i:"🤝",m:7,d:30,c:['universal']},
  {n:"Halloween",i:"🎃",m:10,d:31,c:['universal']},
  {n:"Saint-Sylvestre",i:"🥂",m:12,d:31,c:['universal']},
  // ── Chrétien (dates fixes) ──
  {n:"Épiphanie",i:"👑",m:1,d:6,c:['christian']},
  {n:"Chandeleur",i:"🕯️",m:2,d:2,c:['christian']},
  {n:"Assomption",i:"🌟",m:8,d:15,c:['christian']},
  {n:"Toussaint",i:"🕯️",m:11,d:1,c:['christian']},
  {n:"Fête des Morts",i:"💐",m:11,d:2,c:['christian']},
  {n:"Noël",i:"🎄",m:12,d:25,c:['christian']},
  {n:"Saint-Étienne",i:"⭐",m:12,d:26,c:['christian']},
  // ── France / Europe francophone ──
  {n:"Fête des Mères",i:"💐",m:5,d:26,c:['fr','be','ch','ca','ht','ci','sn','cm','ga','cd','mg','ml','tg','bj','gn','bf','ne','td','cg','cf']},
  {n:"Fête des Pères",i:"👔",m:6,d:15,c:['fr','be','ch','ca']},
  {n:"Fête Nationale France",i:"🇫🇷",m:7,d:14,c:['fr','gp','mq','re','yt','pm','nc']},
  {n:"Armistice",i:"🕊️",m:11,d:11,c:['fr','be']},
  {n:"Victoire 1945",i:"✌️",m:5,d:8,c:['fr','be']},
  // ── Europe ──
  {n:"Fête Nationale Belgique",i:"🇧🇪",m:7,d:21,c:['be']},
  {n:"Fête Nationale Suisse",i:"🇨🇭",m:8,d:1,c:['ch']},
  {n:"Fête Nationale Pays-Bas",i:"🇳🇱",m:4,d:27,c:['nl']},
  {n:"Fête Nationale Portugal",i:"🇵🇹",m:6,d:10,c:['pt']},
  {n:"Fête Nationale Italie",i:"🇮🇹",m:6,d:2,c:['it']},
  {n:"Fête Nationale Espagne",i:"🇪🇸",m:10,d:12,c:['es']},
  {n:"Fête Nationale Allemagne",i:"🇩🇪",m:10,d:3,c:['de']},
  {n:"Saint Patrick",i:"🍀",m:3,d:17,c:['ie']},
  {n:"Boxing Day",i:"🎁",m:12,d:26,c:['gb','ca','au','nz']},
  {n:"Fête Nationale Malta",i:"🇲🇹",m:3,d:31,c:['mt']},
  // ── Amériques ──
  {n:"Indépendance USA",i:"🇺🇸",m:7,d:4,c:['us']},
  {n:"Thanksgiving USA",i:"🦃",m:11,d:28,c:['us']},
  {n:"Fête Nationale Canada",i:"🇨🇦",m:7,d:1,c:['ca']},
  {n:"Fête Nationale Australie",i:"🇦🇺",m:1,d:26,c:['au']},
  {n:"Indépendance Haïti",i:"🇭🇹",m:1,d:1,c:['ht']},
  {n:"Flag Day Haïti",i:"🇭🇹",m:5,d:18,c:['ht']},
  {n:"Indépendance Brésil",i:"🇧🇷",m:9,d:7,c:['br']},
  {n:"Indépendance Colombie",i:"🇨🇴",m:7,d:20,c:['co']},
  {n:"Indépendance Argentine",i:"🇦🇷",m:7,d:9,c:['ar']},
  {n:"Indépendance Pérou",i:"🇵🇪",m:7,d:28,c:['pe']},
  {n:"Indépendance Venezuela",i:"🇻🇪",m:7,d:5,c:['ve']},
  {n:"Fête Nationale Chili",i:"🇨🇱",m:9,d:18,c:['cl']},
  {n:"Fête Nationale Mexique",i:"🇲🇽",m:9,d:16,c:['mx']},
  {n:"Indépendance Bolivie",i:"🇧🇴",m:8,d:6,c:['bo']},
  {n:"Indépendance Équateur",i:"🇪🇨",m:8,d:10,c:['ec']},
  {n:"Indépendance Paraguay",i:"🇵🇾",m:5,d:14,c:['py']},
  {n:"Indépendance Uruguay",i:"🇺🇾",m:8,d:25,c:['uy']},
  {n:"Indépendance Panama",i:"🇵🇦",m:11,d:3,c:['pa']},
  {n:"Indépendance Honduras",i:"🇭🇳",m:9,d:15,c:['hn']},
  {n:"Indépendance Guatemala",i:"🇬🇹",m:9,d:15,c:['gt']},
  {n:"Indépendance Nicaragua",i:"🇳🇮",m:9,d:15,c:['ni']},
  {n:"Indépendance El Salvador",i:"🇸🇻",m:9,d:15,c:['sv']},
  {n:"Indépendance Costa Rica",i:"🇨🇷",m:9,d:15,c:['cr']},
  {n:"Révolution Cuba",i:"🇨🇺",m:1,d:1,c:['cu']},
  {n:"Indépendance Rép. Dominicaine",i:"🇩🇴",m:2,d:27,c:['do']},
  {n:"Indépendance Jamaïque",i:"🇯🇲",m:8,d:6,c:['jm']},
  {n:"Indépendance Trinidad",i:"🇹🇹",m:8,d:31,c:['tt']},
  {n:"Indépendance Barbade",i:"🇧🇧",m:11,d:30,c:['bb']},
  {n:"Indépendance Guyana",i:"🇬🇾",m:5,d:26,c:['gy']},
  // ── Afrique ──
  {n:"Indépendance Maroc",i:"🇲🇦",m:11,d:18,c:['ma']},
  {n:"Fête du Trône Maroc",i:"🇲🇦",m:7,d:30,c:['ma']},
  {n:"Indépendance Algérie",i:"🇩🇿",m:11,d:1,c:['dz']},
  {n:"Indépendance Tunisie",i:"🇹🇳",m:3,d:20,c:['tn']},
  {n:"Indépendance Sénégal",i:"🇸🇳",m:4,d:4,c:['sn']},
  {n:"Indépendance Côte d'Ivoire",i:"🇨🇮",m:8,d:7,c:['ci']},
  {n:"Indépendance Cameroun",i:"🇨🇲",m:1,d:1,c:['cm']},
  {n:"Indépendance Gabon",i:"🇬🇦",m:8,d:17,c:['ga']},
  {n:"Indépendance RDC",i:"🇨🇩",m:6,d:30,c:['cd']},
  {n:"Indépendance Madagascar",i:"🇲🇬",m:6,d:26,c:['mg']},
  {n:"Indépendance Ghana",i:"🇬🇭",m:3,d:6,c:['gh']},
  {n:"Indépendance Mali",i:"🇲🇱",m:9,d:22,c:['ml']},
  {n:"Indépendance Togo",i:"🇹🇬",m:4,d:27,c:['tg']},
  {n:"Indépendance Bénin",i:"🇧🇯",m:8,d:1,c:['bj']},
  {n:"Indépendance Guinée",i:"🇬🇳",m:10,d:2,c:['gn']},
  {n:"Indépendance Nigeria",i:"🇳🇬",m:10,d:1,c:['ng']},
  {n:"Jamhuri Day Kenya",i:"🇰🇪",m:12,d:12,c:['ke']},
  {n:"Freedom Day Afrique du Sud",i:"🇿🇦",m:4,d:27,c:['za']},
  {n:"Indépendance Burkina Faso",i:"🇧🇫",m:12,d:11,c:['bf']},
  {n:"Indépendance Niger",i:"🇳🇪",m:8,d:3,c:['ne']},
  {n:"Indépendance Tchad",i:"🇹🇩",m:8,d:11,c:['td']},
  {n:"Indépendance Angola",i:"🇦🇴",m:11,d:11,c:['ao']},
  {n:"Indépendance Namibie",i:"🇳🇦",m:3,d:21,c:['na']},
  {n:"Indépendance Botswana",i:"🇧🇼",m:9,d:30,c:['bw']},
  {n:"Indépendance Zimbabwe",i:"🇿🇼",m:4,d:18,c:['zw']},
  {n:"Indépendance Zambie",i:"🇿🇲",m:10,d:24,c:['zm']},
  {n:"Indépendance Mozambique",i:"🇲🇿",m:6,d:25,c:['mz']},
  {n:"Indépendance Sierra Leone",i:"🇸🇱",m:4,d:27,c:['sl']},
  {n:"Indépendance Gambie",i:"🇬🇲",m:2,d:18,c:['gm']},
  {n:"Indépendance Malawi",i:"🇲🇼",m:7,d:6,c:['mw']},
  {n:"Indépendance Ouganda",i:"🇺🇬",m:10,d:9,c:['ug']},
  {n:"Indépendance Tanzanie",i:"🇹🇿",m:12,d:9,c:['tz']},
  {n:"Indépendance Congo",i:"🇨🇬",m:8,d:15,c:['cg']},
  {n:"Indépendance Centrafrique",i:"🇨🇫",m:8,d:13,c:['cf']},
  {n:"Indépendance Soudan du Sud",i:"🇸🇸",m:7,d:9,c:['ss']},
  {n:"Indépendance Djibouti",i:"🇩🇯",m:6,d:27,c:['dj']},
  {n:"Indépendance Érythrée",i:"🇪🇷",m:5,d:24,c:['er']},
  {n:"Révolution Libye",i:"🇱🇾",m:9,d:1,c:['ly']},
  {n:"Enkutatash (Nouvel An Éthiopien)",i:"🇪🇹",m:9,d:11,c:['et']},
  {n:"Noël Copte",i:"⛪",m:1,d:7,c:['et']},
  {n:"Indépendance Somalie",i:"🇸🇴",m:7,d:1,c:['so']},
  {n:"Indépendance Guinée-Bissau",i:"🇬🇼",m:9,d:24,c:['gw']},
  {n:"Indépendance Seychelles",i:"🇸🇨",m:6,d:29,c:['sc']},
  {n:"Indépendance Comores",i:"🇰🇲",m:7,d:6,c:['km']},
  {n:"Indépendance Maurice",i:"🇲🇺",m:3,d:12,c:['mu']},
  {n:"Fête Nationale Mayotte",i:"🇾🇹",m:7,d:14,c:['yt']},
  // ── Moyen-Orient / Asie occidentale ──
  {n:"Fête Nationale EAU",i:"🇦🇪",m:12,d:2,c:['ae']},
  {n:"Fête Nationale Arabie Saoudite",i:"🇸🇦",m:9,d:23,c:['sa']},
  {n:"Indépendance Liban",i:"🇱🇧",m:11,d:22,c:['lb']},
  {n:"Indépendance Jordanie",i:"🇯🇴",m:5,d:25,c:['jo']},
  {n:"Fête Nationale Koweït",i:"🇰🇼",m:2,d:25,c:['kw']},
  {n:"Fête Nationale Bahreïn",i:"🇧🇭",m:12,d:16,c:['bh']},
  {n:"Fête Nationale Qatar",i:"🇶🇦",m:12,d:18,c:['qa']},
  {n:"Fête Nationale Oman",i:"🇴🇲",m:11,d:18,c:['om']},
  {n:"Fête Nationale Yémen",i:"🇾🇪",m:5,d:22,c:['ye']},
  {n:"Indépendance Syrie",i:"🇸🇾",m:4,d:17,c:['sy']},
  {n:"Fête Nationale Irak",i:"🇮🇶",m:10,d:3,c:['iq']},
  {n:"Fête Nationale Palestine",i:"🇵🇸",m:11,d:15,c:['ps']},
  // ── Asie ──
  {n:"Indépendance Inde",i:"🇮🇳",m:8,d:15,c:['in']},
  {n:"Fête Nationale Inde (Rép.)",i:"🇮🇳",m:1,d:26,c:['in']},
  {n:"Indépendance Pakistan",i:"🇵🇰",m:8,d:14,c:['pk']},
  {n:"Indépendance Bangladesh",i:"🇧🇩",m:3,d:26,c:['bd']},
  {n:"Journée Nationale Népal",i:"🇳🇵",m:9,d:20,c:['np']},
  {n:"Fête Nationale Japon",i:"🇯🇵",m:2,d:11,c:['jp']},
  {n:"Hanami",i:"🌸",m:4,d:1,c:['jp']},
  {n:"Fête Nationale Corée",i:"🇰🇷",m:8,d:15,c:['kr']},
  {n:"Fête Nationale Vietnam",i:"🇻🇳",m:9,d:2,c:['vn']},
  {n:"Fête Nationale Philippines",i:"🇵🇭",m:6,d:12,c:['ph']},
  {n:"Fête Nationale Malaisie",i:"🇲🇾",m:8,d:31,c:['my']},
  {n:"Fête Nationale Singapour",i:"🇸🇬",m:8,d:9,c:['sg']},
  {n:"Fête Nationale Taiwan",i:"🇹🇼",m:10,d:10,c:['tw']},
  {n:"Fête Nationale HK (Rétrocession)",i:"🇭🇰",m:7,d:1,c:['hk']},
  {n:"Fête Nationale Chine",i:"🇨🇳",m:10,d:1,c:['hk','mo','sg','my']},
  {n:"Fête Nationale Macao",i:"🇲🇴",m:12,d:20,c:['mo']},
  {n:"Indépendance Timor-Leste",i:"🇹🇱",m:5,d:20,c:['tl']},
  {n:"Indépendance Fidji",i:"🇫🇯",m:10,d:10,c:['fj']},
  // ── Sikh (fêtes fixes) ──
  {n:"Vaisakhi",i:"🌾",m:4,d:14,c:['sikh','in','pk']},
  {n:"Baisakhi",i:"🌾",m:4,d:14,c:['sikh','in']},
  // ── Hindou (fêtes fixes) ──
  {n:"Pongal",i:"🍚",m:1,d:14,c:['hindu','in']},
  {n:"Makar Sankranti",i:"🪁",m:1,d:14,c:['hindu','in']},
  {n:"Ugadi",i:"🌿",m:3,d:30,c:['hindu','in']},
  {n:"Onam",i:"🌸",m:9,d:5,c:['hindu','in']},
];

// ── FÊTES MOBILES ──
function easterDate(y){
  var a=y%19,b=Math.floor(y/100),c=y%100;
  var d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25);
  var g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30;
  var i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7;
  var m2=Math.floor((a+11*h+22*l)/451);
  var mo=Math.floor((h+l-7*m2+114)/31);
  var da=((h+l-7*m2+114)%31)+1;
  return new Date(y,mo-1,da);
}
// Tables de dates approximatives pour fêtes lunaires/luni-solaires (±1j)
var ISLAMIC_FETES={
  ramadan: {2024:[3,11],2025:[3,1],2026:[2,18],2027:[2,7],2028:[1,26]},
  eidFitr: {2024:[4,10],2025:[3,30],2026:[3,20],2027:[3,9],2028:[2,27]},
  eidAdha: {2024:[6,17],2025:[6,7],2026:[5,27],2027:[5,17],2028:[5,5]},
  mawlid:  {2024:[9,16],2025:[9,5],2026:[8,25],2027:[8,14],2028:[8,2]},
  achoura: {2024:[7,16],2025:[7,5],2026:[6,25],2027:[6,14],2028:[6,2]},
};
var JEWISH_FETES={
  roshHashana:  {2024:[9,2], 2025:[9,22],2026:[9,11],2027:[9,1], 2028:[9,20]},
  yomKippur:    {2024:[9,11],2025:[10,1],2026:[9,20],2027:[9,10],2028:[9,29]},
  sukkot:       {2024:[10,16],2025:[10,6],2026:[9,25],2027:[9,15],2028:[10,4]},
  hanoukka:     {2024:[12,25],2025:[12,14],2026:[12,4],2027:[11,23],2028:[12,12]},
  pourim:       {2024:[3,23],2025:[3,13],2026:[3,2],2027:[3,22],2028:[3,11]},
  pessah:       {2024:[4,22],2025:[4,12],2026:[4,1], 2027:[3,21],2028:[4,9]},
  shavouot:     {2024:[6,11],2025:[6,1], 2026:[5,21],2027:[5,11],2028:[5,30]},
  tishaBeav:    {2024:[8,12],2025:[8,4], 2026:[7,24],2027:[8,10],2028:[8,1]},
};
var HINDU_FETES={
  mahaShivaratri:{2024:[3,8], 2025:[2,26],2026:[2,15],2027:[3,6], 2028:[2,23]},
  holi:          {2024:[3,25],2025:[3,14],2026:[3,3], 2027:[3,22],2028:[3,10]},
  ramNavami:     {2024:[4,17],2025:[4,6], 2026:[3,26],2027:[4,14],2028:[4,2]},
  rakshabandhan: {2024:[8,19],2025:[8,9], 2026:[8,29],2027:[8,18],2028:[8,6]},
  janmashtami:   {2024:[8,26],2025:[8,16],2026:[9,4], 2027:[8,24],2028:[8,13]},
  ganeshCh:      {2024:[9,7], 2025:[8,27],2026:[9,15],2027:[9,5], 2028:[8,23]},
  navratri:      {2024:[10,3],2025:[9,22],2026:[10,12],2027:[10,2],2028:[9,21]},
  dussehra:      {2024:[10,12],2025:[10,2],2026:[10,21],2027:[10,11],2028:[9,30]},
  diwali:        {2024:[11,1],2025:[10,20],2026:[11,8],2027:[10,28],2028:[10,17]},
};
var BUDDHIST_FETES={
  vesak:        {2024:[5,23],2025:[5,12],2026:[5,31],2027:[5,20],2028:[5,9]},
  magha:        {2024:[2,24],2025:[2,12],2026:[3,4], 2027:[2,21],2028:[2,10]},
};
var SIKH_FETES={
  guruNanak:    {2024:[11,15],2025:[11,5],2026:[11,24],2027:[11,13],2028:[11,2]},
};
var CHINESE_NY={2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,7],2028:[1,26]};

function getMoveableFetes(y){
  var fetes=[];
  // Pâques & dérivés chrétiens
  var easter=easterDate(y);
  function addOff(off,n,i,cats){
    var dt=new Date(easter.getTime()+off*864e5);
    fetes.push({n:n,i:i,m:dt.getMonth()+1,d:dt.getDate(),c:cats,moveable:true});
  }
  addOff(-46,"Mercredi des Cendres","🙏",['christian']);
  addOff(-7,"Dimanche des Rameaux","🌿",['christian']);
  addOff(-2,"Vendredi Saint","✝️",['christian']);
  addOff(0,"Pâques","🐣",['christian']);
  addOff(1,"Lundi de Pâques","🐣",['christian']);
  addOff(39,"Ascension","✨",['christian']);
  addOff(49,"Pentecôte","🕊️",['christian']);
  addOff(50,"Lundi de Pentecôte","🕊️",['christian']);
  // Islam
  function addIsm(tbl,n,i){
    var d=ISLAMIC_FETES[tbl][y]||ISLAMIC_FETES[tbl][2026];
    fetes.push({n:n,i:i,m:d[0],d:d[1],c:['muslim'],moveable:true});
  }
  addIsm('ramadan','Ramadan (début)','🌙');
  addIsm('eidFitr','Eid al-Fitr','🌙');
  addIsm('eidAdha','Eid al-Adha','🐑');
  addIsm('mawlid','Mawlid (Naissance du Prophète)','🌟');
  addIsm('achoura','Achoura','🕌');
  // Judaïsme
  function addJew(tbl,n,i){
    var d=JEWISH_FETES[tbl][y]||JEWISH_FETES[tbl][2026];
    fetes.push({n:n,i:i,m:d[0],d:d[1],c:['jewish'],moveable:true});
  }
  addJew('roshHashana','Rosh Hashana (Nouvel An juif)','🍎');
  addJew('yomKippur','Yom Kippour','🕍');
  addJew('sukkot','Souccot','🌿');
  addJew('hanoukka','Hanoukka','🕎');
  addJew('pourim','Pourim','🎭');
  addJew('pessah','Pessah (Pâque juive)','🍷');
  addJew('shavouot','Chavouot','📜');
  addJew('tishaBeav','Tisha Beav','🕯️');
  // Hindouisme
  function addHin(tbl,n,i){
    var d=HINDU_FETES[tbl][y]||HINDU_FETES[tbl][2026];
    fetes.push({n:n,i:i,m:d[0],d:d[1],c:['hindu','in'],moveable:true});
  }
  addHin('mahaShivaratri','Maha Shivaratri','🔱');
  addHin('holi','Holi','🎨');
  addHin('ramNavami','Ram Navami','🙏');
  addHin('rakshabandhan','Raksha Bandhan','🪢');
  addHin('janmashtami','Janmashtami','🦚');
  addHin('ganeshCh','Ganesh Chaturthi','🐘');
  addHin('navratri','Navratri','💃');
  addHin('dussehra','Dussehra','🎆');
  addHin('diwali','Diwali','🪔');
  // Bouddhisme
  function addBud(tbl,n,i){
    var d=BUDDHIST_FETES[tbl][y]||BUDDHIST_FETES[tbl][2026];
    fetes.push({n:n,i:i,m:d[0],d:d[1],c:['buddhist'],moveable:true});
  }
  addBud('vesak','Vesak (Bouddha)','☸️');
  addBud('magha','Magha Puja','🪷');
  // Songkran (Nouvel An bouddhiste, date fixe)
  fetes.push({n:'Songkran',i:'💧',m:4,d:13,c:['buddhist'],moveable:false});
  // Sikhisme
  var gn=SIKH_FETES.guruNanak[y]||SIKH_FETES.guruNanak[2026];
  fetes.push({n:'Guru Nanak Jayanti','i':'🙏',m:gn[0],d:gn[1],c:['sikh','in'],moveable:true});
  // Nouvel An Chinois
  var cn=CHINESE_NY[y]||CHINESE_NY[2026];
  fetes.push({n:'Nouvel An Chinois',i:'🧧',m:cn[0],d:cn[1],c:['hk','mo','sg','tw','my'],moveable:true});
  return fetes;
}

const DTPL=[
  {id:'t1',n:'Chaleureux & festif',dk:'dtpl1Desc',t:"chaleureux, festif et plein d'amour",e:'🌸'},
  {id:'t2',n:'Poetique',dk:'dtpl2Desc',t:'poetique et lyrique, avec des metaphores florales',e:'🌺'},
  {id:'t3',n:'Humoristique',dk:'dtpl3Desc',t:"humoristique, leger, avec une touche d'humour bienveillant",e:'😄'},
  {id:'t4',n:'Religieux',dk:'dtpl4Desc',t:'spirituel et bienveillant, avec une dimension de foi',e:'🙏'},
  {id:'t5',n:'Professionnel',dk:'dtpl5Desc',t:'professionnel, cordial et respectueux',e:'💼'},
  {id:'t6',n:'Enfantin',dk:'dtpl6Desc',t:'joyeux et simple, adapte aux enfants',e:'🎈'},
];


// ── CONSTANTES GLOBALES D'AFFICHAGE ──
var JRS=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
var MN=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
var MNS=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
var AV=['av1','av2','av3','av4'];
var MS={1:'1 an 🎊',10:'10 ans 🎉',18:'Majeur·e 🥂',20:'20 ans ✨',30:'30 ans 🌸',40:'40 ans 💫',50:'50 ans 🌟',60:'60 ans 🏆',70:'70 ans 👑',80:'80 ans 💎',90:'90 ans 🌺',100:'100 ans 🎊'};
var AMB=[{m:3,label:'Bronze',badge:'🥉',reward:1},{m:10,label:'Silver',badge:'🥈',reward:2},{m:30,label:'Gold',badge:'🥇',reward:5}];

function ambTier(refs){
  if(refs>=25)return 'or';
  if(refs>=10)return 'argent';
  if(refs>=3)return 'bronze';
  return null;
}

function refPlanUpgrade(refs){
  if(refs>=25)return 'premium';
  if(refs>=10)return 'bloom';
  if(refs>=3)return 'solo';
  return null;
}

const EPL=function(){
  var base=PLANS[plan]||PLANS.free;
  var refs=(stats&&stats.refsCount)||0;
  var upgrade=refPlanUpgrade(refs);
  if(!upgrade)return base;
  var up=PLANS[upgrade];
  return {
    name:base.p>=(up.p||0)?base.name:up.name+'*',
    mm:Math.max(base.mm,up.mm),
    mg:Math.max(base.mg,up.mg),
    msgs:Math.max(base.msgs,up.msgs),
    gifts:base.gifts||up.gifts,
    cards:base.cards||up.cards,
    adm:Math.max(base.adm,up.adm),
    amb:base.amb||up.amb,
    p:base.p
  };
};

// ═══════════════════════════════════════════════════════
// i18n Bloomday — 7 langues — TOUTES VALEURS LITTÉRALES
// ═══════════════════════════════════════════════════════