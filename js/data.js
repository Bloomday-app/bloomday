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
  {c:'nc',l:'🇳🇨 Nouvelle-Calédonie'},{c:'pm',l:'🇵🇲 St-Pierre-et-Miquelon'},{c:'cf',l:'🇨🇫 Centrafrique'},{c:'sc',l:'🇸🇨 Seychelles'},{c:'yt',l:'🇾🇹 Mayotte'},
  {c:'nz',l:'🇳🇿 Nouvelle-Zélande'},{c:'ie',l:'🇮🇪 Irlande'},{c:'ke',l:'🇰🇪 Kenya'},{c:'tz',l:'🇹🇿 Tanzanie'},{c:'ug',l:'🇺🇬 Ouganda'},{c:'za',l:'🇿🇦 Afrique du Sud'},{c:'zw',l:'🇿🇼 Zimbabwe'},{c:'zm',l:'🇿🇲 Zambie'},{c:'mw',l:'🇲🇼 Malawi'},{c:'bw',l:'🇧🇼 Botswana'},{c:'na',l:'🇳🇦 Namibie'},{c:'sl',l:'🇸🇱 Sierra Leone'},{c:'lr',l:'🇱🇷 Liberia'},{c:'gm',l:'🇬🇲 Gambie'},{c:'ph',l:'🇵🇭 Philippines'},{c:'sg',l:'🇸🇬 Singapour'},{c:'pk',l:'🇵🇰 Pakistan'},{c:'bd',l:'🇧🇩 Bangladesh'},{c:'lk',l:'🇱🇰 Sri Lanka'},{c:'jm',l:'🇯🇲 Jamaïque'},{c:'tt',l:'🇹🇹 Trinidad-et-Tobago'},{c:'bb',l:'🇧🇧 Barbade'},{c:'gy',l:'🇬🇾 Guyana'},{c:'mt',l:'🇲🇹 Malte'},{c:'et',l:'🇪🇹 Éthiopie'},{c:'ss',l:'🇸🇸 Soudan du Sud'},{c:'er',l:'🇪🇷 Érythrée'},
  {c:'ar',l:'🇦🇷 Argentine'},{c:'pe',l:'🇵🇪 Pérou'},{c:'ve',l:'🇻🇪 Venezuela'},{c:'cl',l:'🇨🇱 Chili'},{c:'ec',l:'🇪🇨 Équateur'},{c:'gt',l:'🇬🇹 Guatemala'},{c:'cu',l:'🇨🇺 Cuba'},{c:'bo',l:'🇧🇴 Bolivie'},{c:'do',l:'🇩🇴 Rép. Dominicaine'},{c:'hn',l:'🇭🇳 Honduras'},{c:'py',l:'🇵🇾 Paraguay'},{c:'sv',l:'🇸🇻 El Salvador'},{c:'ni',l:'🇳🇮 Nicaragua'},{c:'cr',l:'🇨🇷 Costa Rica'},{c:'pa',l:'🇵🇦 Panama'},{c:'uy',l:'🇺🇾 Uruguay'},{c:'pr',l:'🇵🇷 Porto Rico'},
  {c:'ae',l:'🇦🇪 Émirats Arabes Unis'},{c:'iq',l:'🇮🇶 Irak'},{c:'sy',l:'🇸🇾 Syrie'},{c:'jo',l:'🇯🇴 Jordanie'},{c:'ye',l:'🇾🇪 Yémen'},{c:'ps',l:'🇵🇸 Palestine'},{c:'qa',l:'🇶🇦 Qatar'},{c:'bh',l:'🇧🇭 Bahreïn'},{c:'kw',l:'🇰🇼 Koweït'},{c:'om',l:'🇴🇲 Oman'},{c:'ly',l:'🇱🇾 Libye'},{c:'sd',l:'🇸🇩 Soudan'},{c:'so',l:'🇸🇴 Somalie'},
  {c:'np',l:'🇳🇵 Népal'},{c:'fj',l:'🇫🇯 Fidji'},{c:'tw',l:'🇹🇼 Taïwan'},{c:'hk',l:'🇭🇰 Hong Kong'},{c:'mo',l:'🇲🇴 Macao'},{c:'my',l:'🇲🇾 Malaisie'},{c:'ao',l:'🇦🇴 Angola'},{c:'mz',l:'🇲🇿 Mozambique'},{c:'gw',l:'🇬🇼 Guinée-Bissau'},{c:'tl',l:'🇹🇱 Timor-Leste'},
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
  {n:'Indépendance Nigeria',i:'🇳🇬',m:10,d:1,c:['ng']},
  {n:'Jamhuri Day Kenya',i:'🇰🇪',m:12,d:12,c:['ke']},
  {n:'Freedom Day Afrique du Sud',i:'🇿🇦',m:4,d:27,c:['za']},
  {n:'Indépendance Colombie',i:'🇨🇴',m:7,d:20,c:['co']},
  {n:'Indépendance Argentine',i:'🇦🇷',m:7,d:9,c:['ar']},
  {n:'Indépendance Pérou',i:'🇵🇪',m:7,d:28,c:['pe']},
  {n:'Indépendance Venezuela',i:'🇻🇪',m:7,d:5,c:['ve']},
  {n:'Fête Nationale Chili',i:'🇨🇱',m:9,d:18,c:['cl']},
  {n:'Fête Nationale Mexique',i:'🇲🇽',m:9,d:16,c:['mx']},
  {n:'Indépendance Philippines',i:'🇵🇭',m:6,d:12,c:['ph']},
  {n:'Fête Nationale Vietnam',i:'🇻🇳',m:9,d:2,c:['vn']},
  {n:'Gwangbokjeol Corée',i:'🇰🇷',m:8,d:15,c:['kr']},
  {n:'Indépendance Burkina Faso',i:'🇧🇫',m:12,d:11,c:['bf']},
  {n:'Indépendance Niger',i:'🇳🇪',m:8,d:3,c:['ne']},
  {n:'Indépendance Tchad',i:'🇹🇩',m:8,d:11,c:['td']},
  {n:'Fête Nationale EAU',i:'🇦🇪',m:12,d:2,c:['ae']},
  {n:'Fête Nationale Arabie Saoudite',i:'🇸🇦',m:9,d:23,c:['sa']},
  {n:'Indépendance Pakistan',i:'🇵🇰',m:8,d:14,c:['pk']},
  {n:'Indépendance Bangladesh',i:'🇧🇩',m:3,d:26,c:['bd']},
];
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