const FALLBACK={
  birthday:[
    'Joyeux anniversaire ! Je pense fort à toi en ce jour si particulier. J\'espère que tu passes une journée aussi belle et lumineuse que tu l\'es. Que cette nouvelle année t\'apporte exactement ce dont tu as besoin. 🎂🌸',
    'Aujourd\'hui c\'est ton jour, et je voulais juste te dire à quel point je suis heureux·se de t\'avoir dans ma vie. Tu mérites tout le bonheur du monde. Passe une journée inoubliable entouré·e de ceux que tu aimes. 🌺✨',
    'Un an de plus, et tu n\'as jamais été aussi toi-même — c\'est ce que j\'admire le plus chez toi. Joyeux anniversaire ! Que cette année soit riche en belles surprises, en rires et en moments qui comptent vraiment. 💫🎉',
  ],
  wedding:[
    'Joyeux anniversaire de mariage ! Vous formez un couple qui inspire — votre complicité, votre façon d\'être là l\'un pour l\'autre, c\'est quelque chose de rare et de beau. Nous sommes si heureux de célébrer cette nouvelle année avec vous. Que votre amour continue de s\'épanouir encore longtemps. 💍🌸',
    'Quel bonheur de penser à vous aujourd\'hui ! Chaque année qui passe semble avoir renforcé ce lien magnifique que vous partagez. Merci d\'être un exemple de ce que l\'amour peut construire avec du temps, de la confiance et de la tendresse. Joyeux anniversaire à vous deux ! 💕✨',
  ],
  fete:[
    'En ce jour de fête, toutes mes pensées sont pour toi. J\'espère que cette journée sera à la hauteur de ce que tu mérites — lumineuse, joyeuse et pleine de belles personnes. Profite de chaque instant ! 🎊🌸',
    'Quelle belle occasion de célébrer et de partager un moment de joie ! Je te souhaite une fête mémorable, entouré·e de ceux qui comptent vraiment pour toi. 🥳✨',
  ],
};
function getFallback(type){
  if(typeof t==='function'){
    var keys=type==='fete'?['fallbackFete1','fallbackFete2']:type==='wedding'?['fallbackWedding1','fallbackWedding2']:['fallbackBirthday1','fallbackBirthday2','fallbackBirthday3'];
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
  {n:"Fête Nationale France",i:"🇫🇷",m:7,d:14,c:['fr','gp','mq','re','yt','pm','nc','gf','pf']},
  {n:"Armistice",i:"🕊️",m:11,d:11,c:['fr','be']},
  {n:"Victoire 1945",i:"✌️",m:5,d:8,c:['fr','be']},
  // ── DOM-TOM / Outre-mer ──
  {n:"Abolition de l'Esclavage",i:"⛓️",m:5,d:22,c:['mq']},
  {n:"Abolition de l'Esclavage",i:"⛓️",m:5,d:27,c:['gp']},
  {n:"Abolition de l'Esclavage",i:"⛓️",m:12,d:20,c:['re']},
  {n:"Abolition de l'Esclavage",i:"⛓️",m:4,d:27,c:['yt']},
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
  {n:"Fête Nationale Chine",i:"🇨🇳",m:10,d:1,c:['cn','hk','mo','sg','my']},
  {n:"Fête Nationale Macao",i:"🇲🇴",m:12,d:20,c:['mo']},
  {n:"Indépendance Timor-Leste",i:"🇹🇱",m:5,d:20,c:['tl']},
  {n:"Indépendance Fidji",i:"🇫🇯",m:10,d:10,c:['fj']},
  // ── Europe (nouveaux pays) ──
  {n:"Saint-Georges (Angleterre)",i:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",m:4,d:23,c:['gb']},
  {n:"Fête Nationale Monaco",i:"🇲🇨",m:11,d:19,c:['mc']},
  {n:"Fête Nationale Autriche",i:"🇦🇹",m:10,d:26,c:['at']},
  {n:"Indépendance Grèce",i:"🇬🇷",m:3,d:25,c:['gr']},
  {n:"Ochi Day (Grèce)",i:"🇬🇷",m:10,d:28,c:['gr']},
  {n:"Constitution Pologne",i:"🇵🇱",m:5,d:3,c:['pl']},
  {n:"Fête Nationale Pologne",i:"🇵🇱",m:11,d:11,c:['pl']},
  {n:"Fête Nationale Roumanie",i:"🇷🇴",m:12,d:1,c:['ro']},
  {n:"Fête Nationale Hongrie",i:"🇭🇺",m:8,d:20,c:['hu']},
  {n:"Révolution Hongrie 1956",i:"🇭🇺",m:10,d:23,c:['hu']},
  {n:"Indépendance Tchéquie",i:"🇨🇿",m:10,d:28,c:['cz']},
  {n:"Révolution de Velours",i:"🇨🇿",m:11,d:17,c:['cz','sk']},
  {n:"Fête Nationale Slovaquie",i:"🇸🇰",m:9,d:1,c:['sk']},
  {n:"Fête Nationale Suède",i:"🇸🇪",m:6,d:6,c:['se']},
  {n:"Fête Nationale Norvège",i:"🇳🇴",m:5,d:17,c:['no']},
  {n:"Fête Nationale Danemark",i:"🇩🇰",m:6,d:5,c:['dk']},
  {n:"Indépendance Finlande",i:"🇫🇮",m:12,d:6,c:['fi']},
  {n:"Fête Nationale Russie",i:"🇷🇺",m:6,d:12,c:['ru']},
  {n:"Fête de la Victoire (9 mai)",i:"🎖️",m:5,d:9,c:['ru']},
  {n:"Indépendance Ukraine",i:"🇺🇦",m:8,d:24,c:['ua']},
  // ── Afrique (nouveaux pays) ──
  {n:"Révolution Égypte",i:"🇪🇬",m:7,d:23,c:['eg']},
  {n:"Libération du Sinaï",i:"🇪🇬",m:4,d:25,c:['eg']},
  {n:"Fête Forces Armées Égypte",i:"🇪🇬",m:10,d:6,c:['eg']},
  {n:"Indépendance Guinée Équatoriale",i:"🇬🇶",m:10,d:12,c:['gq']},
  // ── Moyen-Orient / Caucase ──
  {n:"Fête Nationale Turquie",i:"🇹🇷",m:10,d:29,c:['tr']},
  {n:"Victoire Turquie",i:"🇹🇷",m:8,d:30,c:['tr']},
  {n:"Fête de l'Enfance Turquie",i:"🇹🇷",m:4,d:23,c:['tr']},
  {n:"Révolution Islamique Iran",i:"🇮🇷",m:2,d:11,c:['ir']},
  {n:"Nowruz (Nouvel An Persan)",i:"🌸",m:3,d:21,c:['ir','af','kz','uz','kg','tj','tm','az']},
  {n:"Yom HaShoah",i:"🕯️",m:4,d:24,c:['il']},
  {n:"Indépendance Arménie",i:"🇦🇲",m:9,d:21,c:['am']},
  {n:"Mémorial Génocide Arménien",i:"🕯️",m:4,d:24,c:['am']},
  {n:"Indépendance Géorgie",i:"🇬🇪",m:5,d:26,c:['ge']},
  {n:"Fête Nationale Azerbaïdjan",i:"🇦🇿",m:5,d:28,c:['az']},
  {n:"Indépendance Azerbaïdjan",i:"🇦🇿",m:10,d:18,c:['az']},
  {n:"Indépendance Kazakhstan",i:"🇰🇿",m:12,d:16,c:['kz']},
  {n:"Indépendance Ouzbékistan",i:"🇺🇿",m:9,d:1,c:['uz']},
  {n:"Indépendance Kirghizistan",i:"🇰🇬",m:8,d:31,c:['kg']},
  {n:"Indépendance Tadjikistan",i:"🇹🇯",m:9,d:9,c:['tj']},
  {n:"Indépendance Turkménistan",i:"🇹🇲",m:10,d:27,c:['tm']},
  {n:"Indépendance Afghanistan",i:"🇦🇫",m:8,d:19,c:['af']},
  // ── Asie (nouveaux pays) ──
  {n:"Indépendance Indonésie",i:"🇮🇩",m:8,d:17,c:['id']},
  {n:"Chakri Day (Thaïlande)",i:"🇹🇭",m:4,d:6,c:['th']},
  {n:"Fête Nationale Thaïlande",i:"🇹🇭",m:12,d:5,c:['th']},
  {n:"Indépendance Cambodge",i:"🇰🇭",m:11,d:9,c:['kh']},
  {n:"Fête du Roi Cambodge",i:"🇰🇭",m:5,d:14,c:['kh']},
  {n:"Fête Nationale Laos",i:"🇱🇦",m:12,d:2,c:['la']},
  {n:"Pi Mai / Boun Pi Mai (Laos)",i:"💧",m:4,d:14,c:['la']},
  {n:"Indépendance Myanmar",i:"🇲🇲",m:1,d:4,c:['mm']},
  {n:"Thingyan (Nouvel An Myanmar)",i:"💧",m:4,d:13,c:['mm']},
  {n:"Naadam (Mongolie)",i:"🇲🇳",m:7,d:11,c:['mn']},
  {n:"Fête Nationale Bhoutan",i:"🇧🇹",m:12,d:17,c:['bt']},
  {n:"Indépendance Maldives",i:"🇲🇻",m:7,d:26,c:['mv']},
  {n:"Fête Nationale Brunei",i:"🇧🇳",m:2,d:23,c:['bn']},
  {n:"Libération du Sud Vietnam",i:"🇻🇳",m:4,d:30,c:['vn']},
  // ── Pacifique ──
  {n:"Indépendance PNG",i:"🇵🇬",m:9,d:16,c:['pg']},
  {n:"Indépendance Îles Salomon",i:"🇸🇧",m:7,d:7,c:['sb']},
  {n:"Indépendance Vanuatu",i:"🇻🇺",m:7,d:30,c:['vu']},
  {n:"Indépendance Samoa",i:"🇼🇸",m:6,d:1,c:['ws']},
  {n:"Fête Nationale Tonga",i:"🇹🇴",m:11,d:4,c:['to']},
  // ── Caraïbes anglophones ──
  {n:"Emancipation Day",i:"✊",m:8,d:1,c:['jm','tt','bb','gy','bz','bs','lc','gd','ag','kn','dm','vc']},
  {n:"Indépendance Belize",i:"🇧🇿",m:9,d:21,c:['bz']},
  {n:"Indépendance Bahamas",i:"🇧🇸",m:7,d:10,c:['bs']},
  {n:"Indépendance Sainte-Lucie",i:"🇱🇨",m:2,d:22,c:['lc']},
  {n:"Fête de Sainte-Lucie",i:"🇱🇨",m:12,d:13,c:['lc']},
  {n:"Indépendance Grenade",i:"🇬🇩",m:2,d:7,c:['gd']},
  {n:"Indépendance Antigua",i:"🇦🇬",m:11,d:1,c:['ag']},
  {n:"Indépendance Saint-Kitts",i:"🇰🇳",m:9,d:19,c:['kn']},
  {n:"Indépendance Dominique",i:"🇩🇲",m:11,d:3,c:['dm']},
  {n:"Indépendance Saint-Vincent",i:"🇻🇨",m:10,d:27,c:['vc']},
  // ── Amériques (compléments) ──
  {n:"Juneteenth USA",i:"✊",m:6,d:19,c:['us']},
  {n:"Fête Nationale Brésil (Rép.)",i:"🇧🇷",m:11,d:15,c:['br']},
  {n:"Tiradentes Brésil",i:"🇧🇷",m:4,d:21,c:['br']},
  {n:"Bataille de Boyacá (Colombie)",i:"🇨🇴",m:8,d:7,c:['co']},
  {n:"Día de los Muertos (Mexique)",i:"💀",m:11,d:1,c:['mx']},
  // ── Sikh (fêtes fixes) ──
  {n:"Vaisakhi",i:"🌾",m:4,d:14,c:['sikh','in','pk']},
  {n:"Baisakhi",i:"🌾",m:4,d:14,c:['sikh','in']},
  // ── Hindou (fêtes fixes) ──
  {n:"Pongal",i:"🍚",m:1,d:14,c:['hindu','in']},
  {n:"Makar Sankranti",i:"🪁",m:1,d:14,c:['hindu','in']},
  {n:"Ugadi",i:"🌿",m:3,d:30,c:['hindu','in']},
  {n:"Onam",i:"🌸",m:9,d:5,c:['hindu','in']},
  // ── Compléments Europe ──
  {n:"Remembrance Day",i:"🌹",m:11,d:11,c:['gb','ca','au','nz','us']},
  {n:"St David's Day",i:"🏴󠁧󠁢󠁷󠁬󠁳󠁿",m:3,d:1,c:['gb']},
  {n:"St Andrew's Day",i:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",m:11,d:30,c:['gb']},
  {n:"Anzac Day",i:"🌺",m:4,d:25,c:['au','nz']},
  {n:"Waitangi Day",i:"🇳🇿",m:2,d:6,c:['nz']},
  {n:"Sainte-Lucie (Suède)",i:"🕯️",m:12,d:13,c:['se']},
  {n:"Jour du Souvenir (Pays-Bas)",i:"🌹",m:5,d:4,c:['nl']},
  {n:"Jour de la Libération (Pays-Bas)",i:"🇳🇱",m:5,d:5,c:['nl']},
  {n:"Fête de la République (Portugal)",i:"🇵🇹",m:10,d:5,c:['pt']},
  {n:"Restauration Indépendance (Portugal)",i:"🇵🇹",m:12,d:1,c:['pt']},
  {n:"Día de la Constitución (Espagne)",i:"🇪🇸",m:12,d:6,c:['es']},
  {n:"Inmaculada Concepción",i:"✨",m:12,d:8,c:['es','it','pt']},
  {n:"Unité Nationale (Russie)",i:"🇷🇺",m:11,d:4,c:['ru']},
  // ── Compléments Asie / Pacifique ──
  {n:"Showa Day (Japon)",i:"🇯🇵",m:4,d:29,c:['jp']},
  {n:"Constitution Day (Japon)",i:"🇯🇵",m:5,d:3,c:['jp']},
  {n:"Greenery Day (Japon)",i:"🌿",m:5,d:4,c:['jp']},
  {n:"Fête des Enfants",i:"🎏",m:5,d:5,c:['jp','kr']},
  {n:"Jour de la Montagne (Japon)",i:"🗻",m:8,d:11,c:['jp']},
  {n:"Culture Day (Japon)",i:"🎌",m:11,d:3,c:['jp']},
  {n:"Labour Thanksgiving Day (Japon)",i:"🙏",m:11,d:23,c:['jp']},
  {n:"Birthday de l'Empereur (Japon)",i:"👑",m:2,d:23,c:['jp']},
  {n:"Samil Movement Day (Corée)",i:"🇰🇷",m:3,d:1,c:['kr']},
  {n:"Jour du Souvenir (Corée)",i:"🇰🇷",m:6,d:6,c:['kr']},
  {n:"Hangul Day (Corée)",i:"🇰🇷",m:10,d:9,c:['kr']},
  {n:"Qingming (Chine)",i:"🌿",m:4,d:5,c:['cn','tw','hk','mo']},
  {n:"Gandhi Jayanti (Inde)",i:"🕊️",m:10,d:2,c:['in']},
  {n:"Bonifacio Day (Philippines)",i:"🇵🇭",m:11,d:30,c:['ph']},
  {n:"Rizal Day (Philippines)",i:"🇵🇭",m:12,d:30,c:['ph']},
  {n:"Racial Harmony Day (Singapour)",i:"🇸🇬",m:7,d:21,c:['sg']},
  // ── Europe manquante ──
  {n:"Fête Nationale Luxembourg",i:"🇱🇺",m:6,d:23,c:['lu']},
  {n:"Fête Nationale Islande",i:"🇮🇸",m:6,d:17,c:['is']},
  {n:"Fête Nationale Albanie",i:"🇦🇱",m:11,d:28,c:['al']},
  {n:"Fête Nationale Bulgarie",i:"🇧🇬",m:3,d:3,c:['bg']},
  {n:"Fête Nationale Lituanie",i:"🇱🇹",m:2,d:16,c:['lt']},
  {n:"Fête Nationale Lettonie",i:"🇱🇻",m:11,d:18,c:['lv']},
  {n:"Fête Nationale Estonie",i:"🇪🇪",m:2,d:24,c:['ee']},
  {n:"Fête Nationale Croatie",i:"🇭🇷",m:6,d:25,c:['hr']},
  {n:"Fête Nationale Slovénie",i:"🇸🇮",m:6,d:25,c:['si']},
  {n:"Fête Nationale Macédoine",i:"🇲🇰",m:9,d:8,c:['mk']},
  {n:"Fête Nationale Monténégro",i:"🇲🇪",m:7,d:13,c:['me']},
  {n:"Fête Nationale Serbie",i:"🇷🇸",m:2,d:15,c:['rs']},
  {n:"Fête Nationale Bosnie",i:"🇧🇦",m:11,d:25,c:['ba']},
  {n:"Fête Nationale Kosovo",i:"🇽🇰",m:2,d:17,c:['xk']},
  {n:"Fête Nationale Andorre",i:"🇦🇩",m:9,d:8,c:['ad']},
  {n:"Fête Nationale San Marin",i:"🇸🇲",m:9,d:3,c:['sm']},
  {n:"Fête de l'Europe",i:"🇪🇺",m:5,d:9,c:['fr','be','de','it','pt','nl','es','at','ch','lu','gr','pl','ro','hu','cz','sk','se','dk','fi','ie']},
  {n:"Noël Orthodoxe",i:"⛪",m:1,d:7,c:['ru','ua','rs','bg','ro','gr','ge','am','me','mk','et']},
  {n:"Kwanzaa",i:"🕯️",m:12,d:26,c:['us']},
  // ── Afrique manquante ──
  {n:"Libération Rwanda",i:"🇷🇼",m:7,d:4,c:['rw']},
  {n:"Mémorial Génocide Rwanda",i:"🕯️",m:4,d:7,c:['rw']},
  {n:"Indépendance Burundi",i:"🇧🇮",m:7,d:1,c:['bi']},
  {n:"Indépendance Mauritanie",i:"🇲🇷",m:11,d:28,c:['mr']},
  {n:"Indépendance Cap-Vert",i:"🇨🇻",m:7,d:5,c:['cv']},
  {n:"Indépendance São Tomé",i:"🇸🇹",m:7,d:12,c:['st']},
  {n:"Indépendance Libéria",i:"🇱🇷",m:7,d:26,c:['lr']},
  {n:"Indépendance Soudan",i:"🇸🇩",m:1,d:1,c:['sd']},
  {n:"Indépendance Eswatini",i:"🇸🇿",m:9,d:6,c:['sz']},
  {n:"Indépendance Lesotho",i:"🇱🇸",m:10,d:4,c:['ls']},
  // ── Asie manquante ──
  {n:"Indépendance Sri Lanka",i:"🇱🇰",m:2,d:4,c:['lk']},
  // ── Amériques / Caraïbes manquant ──
  {n:"Indépendance Suriname",i:"🇸🇷",m:11,d:25,c:['sr']},
  {n:"Fête Nationale Polynésie Française",i:"🌺",m:6,d:29,c:['pf']},
  // ── Fêtes culturelles globales ──
  {n:"Journée Mondiale de la Paix",i:"☮️",m:9,d:21,c:['universal']},
  {n:"Journée Mondiale des Droits de l'Enfant",i:"🧒",m:11,d:20,c:['universal']},
  {n:"Journée de la Terre",i:"🌍",m:4,d:22,c:['universal']},
  {n:"Journée Internationale des Droits de l'Homme",i:"🕊️",m:12,d:10,c:['universal']},
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
  ramadan:  {2024:[3,11], 2025:[3,1],  2026:[2,18], 2027:[2,7],  2028:[1,26]},
  eidFitr:  {2024:[4,10], 2025:[3,30], 2026:[3,20], 2027:[3,9],  2028:[2,27]},
  eidAdha:  {2024:[6,17], 2025:[6,7],  2026:[5,27], 2027:[5,17], 2028:[5,5]},
  mawlid:   {2024:[9,16], 2025:[9,5],  2026:[8,25], 2027:[8,14], 2028:[8,2]},
  achoura:  {2024:[7,16], 2025:[7,5],  2026:[6,25], 2027:[6,14], 2028:[6,2]},
  muharram: {2024:[7,7],  2025:[6,26], 2026:[6,16], 2027:[6,5],  2028:[5,25]},
  israMiraj:{2024:[2,8],  2025:[1,27], 2026:[1,17], 2027:[1,6],  2028:[12,14]},
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
var MID_AUTUMN={2024:[9,17],2025:[10,6],2026:[9,25],2027:[9,14],2028:[10,2]};
var DRAGON_BOAT={2024:[6,10],2025:[5,31],2026:[6,19],2027:[6,9],2028:[5,28]};
var HUNG_KINGS={2024:[4,18],2025:[4,7],2026:[4,27],2027:[4,16],2028:[4,5]};
var BUDDHA_KR={2024:[5,15],2025:[5,5],2026:[5,24],2027:[5,13],2028:[5,1]};
var CHINESE_NY={2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,7],2028:[1,26]};

// Retourne le Nème jour de semaine (0=dim…6=sam) du mois m (1-12), année y
function nthWeekday(y,m,wd,n){
  var d=new Date(y,m-1,1);
  while(d.getDay()!==wd)d.setDate(d.getDate()+1);
  d.setDate(d.getDate()+(n-1)*7);
  return{m:m,d:d.getDate()};
}
// Retourne le dernier jour de semaine wd du mois m
function lastWeekday(y,m,wd){
  var d=new Date(y,m,0);
  while(d.getDay()!==wd)d.setDate(d.getDate()-1);
  return{m:m,d:d.getDate()};
}

function getMoveableFetes(y){
  var fetes=[];
  // Pâques & dérivés chrétiens
  var easter=easterDate(y);
  function addOff(off,n,i,cats){
    var dt=new Date(easter.getTime()+off*864e5);
    fetes.push({n:n,i:i,m:dt.getMonth()+1,d:dt.getDate(),c:cats,moveable:true});
  }
  addOff(-47,"Mardi Gras / Carnaval","🎭",['christian','fr','be','br','ht','mq','gp','re','gf','pf']);
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
  addIsm('muharram','Nouvel An Islamique (1er Muharram)','☪️');
  addIsm('israMiraj',"Isra Mi'raj",'🌙');
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
  fetes.push({n:'Songkran',i:'💧',m:4,d:13,c:['buddhist','th','la','mm'],moveable:false});
  // Sikhisme
  var gn=SIKH_FETES.guruNanak[y]||SIKH_FETES.guruNanak[2026];
  fetes.push({n:'Guru Nanak Jayanti','i':'🙏',m:gn[0],d:gn[1],c:['sikh','in'],moveable:true});
  // Nouvel An Chinois
  var cn=CHINESE_NY[y]||CHINESE_NY[2026];
  fetes.push({n:'Nouvel An Chinois',i:'🧧',m:cn[0],d:cn[1],c:['cn','hk','mo','sg','tw','my'],moveable:true});
  fetes.push({n:'Seollal (Nouvel An Coréen)',i:'🎊',m:cn[0],d:cn[1],c:['kr'],moveable:true});
  fetes.push({n:'Tết Nguyên Đán',i:'🌸',m:cn[0],d:cn[1],c:['vn'],moveable:true});
  // Fête des Lanternes (15e jour du 1er mois lunaire = CNY + 14 jours)
  var ltDate=new Date(y,cn[0]-1,cn[1]+14);
  fetes.push({n:'Fête des Lanternes',i:'🏮',m:ltDate.getMonth()+1,d:ltDate.getDate(),c:['cn','hk','mo','tw','sg','my'],moveable:true});
  // Fête des Mères Fr/Be/CH/Lu — dernier dimanche de mai (sauf si = Pentecôte → 1er dim juin)
  var fm=lastWeekday(y,5,0);
  var pentD=new Date(easter.getTime()+49*864e5);
  if(fm.m===pentD.getMonth()+1&&fm.d===pentD.getDate()){fm=nthWeekday(y,6,0,1);}
  fetes.push({n:'Fête des Mères',i:'💐',m:fm.m,d:fm.d,c:['fr','be','ch','lu','ca','ht','ci','sn','cm','ga','cd','mg','ml','tg','bj','gn','bf','ne','td','cg','cf','mr','bi','rw','cv','st','gf','pf'],moveable:true});
  // Fête des Grands-Mères (France) — 1er dimanche de mars
  var fgm=nthWeekday(y,3,0,1);
  fetes.push({n:"Fête des Grand-Mères",i:'👵',m:fgm.m,d:fgm.d,c:['fr'],moveable:true});
  // Fête des Pères — 3e dimanche de juin (international)
  var fp=nthWeekday(y,6,0,3);
  fetes.push({n:'Fête des Pères',i:'👔',m:fp.m,d:fp.d,c:['fr','be','ch','lu','ca','us','gb','au','nz','ht','ci','sn','cm','ga','cd','mg','ml','tg','bj','gn','bf','ne','td','cg','cf','za','ph','sg','my','in','ng','gh','ke'],moveable:true});
  // Thanksgiving USA — 4e jeudi de novembre
  var tg=nthWeekday(y,11,4,4);
  fetes.push({n:'Thanksgiving USA',i:'🦃',m:tg.m,d:tg.d,c:['us'],moveable:true});
  // Thanksgiving Canada — 2e lundi d'octobre
  var tgCA=nthWeekday(y,10,1,2);
  fetes.push({n:'Thanksgiving Canada',i:'🍁',m:tgCA.m,d:tgCA.d,c:['ca'],moveable:true});
  // Mothering Sunday UK/IE — Easter - 21 jours (4e dimanche de Carême)
  var msUK=new Date(easter.getTime()-21*864e5);
  fetes.push({n:'Mothering Sunday',i:'💐',m:msUK.getMonth()+1,d:msUK.getDate(),c:['gb','ie'],moveable:true});
  // Mother's Day USA/CA/AU/NZ/ZA/PH/IN… — 2e dimanche de mai
  var ms2=nthWeekday(y,5,0,2);
  fetes.push({n:"Mother's Day",i:'💐',m:ms2.m,d:ms2.d,c:['us','ca','au','nz','za','ph','in','pk','bd','lk','ng','gh','ke','sg','my'],moveable:true});
  // Father's Day AU/NZ — 1er dimanche de septembre
  var fdAU=nthWeekday(y,9,0,1);
  fetes.push({n:"Father's Day",i:'👔',m:fdAU.m,d:fdAU.d,c:['au','nz'],moveable:true});
  // MLK Day USA — 3e lundi de janvier
  var mlk=nthWeekday(y,1,1,3);
  fetes.push({n:'Martin Luther King Day',i:'✊',m:mlk.m,d:mlk.d,c:['us'],moveable:true});
  // Presidents Day USA — 3e lundi de février
  var pres=nthWeekday(y,2,1,3);
  fetes.push({n:"Presidents' Day",i:'🇺🇸',m:pres.m,d:pres.d,c:['us'],moveable:true});
  // Memorial Day USA — dernier lundi de mai
  var memD=lastWeekday(y,5,1);
  fetes.push({n:'Memorial Day',i:'🇺🇸',m:memD.m,d:memD.d,c:['us'],moveable:true});
  // Labor Day USA/CA — 1er lundi de septembre
  var labD=nthWeekday(y,9,1,1);
  fetes.push({n:'Labor Day',i:'💼',m:labD.m,d:labD.d,c:['us','ca'],moveable:true});
  // Columbus Day USA — 2e lundi d'octobre
  var colD=nthWeekday(y,10,1,2);
  fetes.push({n:'Columbus Day',i:'🇺🇸',m:colD.m,d:colD.d,c:['us'],moveable:true});
  // Midsommar Suède — vendredi entre le 19 et 25 juin
  var midsD=new Date(y,5,19);while(midsD.getDay()!==5)midsD.setDate(midsD.getDate()+1);
  fetes.push({n:'Midsommar',i:'🌞',m:6,d:midsD.getDate(),c:['se'],moveable:true});
  // UK Spring & Summer Bank Holidays
  var ukSBH=lastWeekday(y,5,1);
  fetes.push({n:'Spring Bank Holiday (UK)',i:'🌸',m:ukSBH.m,d:ukSBH.d,c:['gb'],moveable:true});
  var ukBH=lastWeekday(y,8,1);
  fetes.push({n:'Summer Bank Holiday (UK)',i:'🎉',m:ukBH.m,d:ukBH.d,c:['gb'],moveable:true});
  // Fêtes mobiles Japon
  var marJ=nthWeekday(y,7,1,3);
  fetes.push({n:'Marine Day (Japon)',i:'🌊',m:marJ.m,d:marJ.d,c:['jp'],moveable:true});
  var respJ=nthWeekday(y,9,1,3);
  fetes.push({n:'Respect for the Aged Day (Japon)',i:'🙏',m:respJ.m,d:respJ.d,c:['jp'],moveable:true});
  var sporJ=nthWeekday(y,10,1,2);
  fetes.push({n:'Sports Day (Japon)',i:'🏅',m:sporJ.m,d:sporJ.d,c:['jp'],moveable:true});
  // Mi-Automne & Chuseok — même date lunaire
  var ma=MID_AUTUMN[y]||MID_AUTUMN[2026];
  fetes.push({n:'Fête de la Mi-Automne',i:'🥮',m:ma[0],d:ma[1],c:['cn','hk','mo','tw','sg','my'],moveable:true});
  fetes.push({n:'Chuseok (Corée)',i:'🌕',m:ma[0],d:ma[1],c:['kr'],moveable:true});
  // Dragon Boat Festival / Duanwu (Chine)
  var db=DRAGON_BOAT[y]||DRAGON_BOAT[2026];
  fetes.push({n:'Dragon Boat Festival (Duanwu)',i:'🐉',m:db[0],d:db[1],c:['cn','hk','mo','tw','sg'],moveable:true});
  // Hùng Vương Vietnam
  var hkV=HUNG_KINGS[y]||HUNG_KINGS[2026];
  fetes.push({n:'Hùng Vương (Vietnam)',i:'🇻🇳',m:hkV[0],d:hkV[1],c:['vn'],moveable:true});
  // Anniversaire de Bouddha (Corée)
  var bkKR=BUDDHA_KR[y]||BUDDHA_KR[2026];
  fetes.push({n:"Anniversaire de Bouddha (Corée)",i:'🪷',m:bkKR[0],d:bkKR[1],c:['kr'],moveable:true});
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