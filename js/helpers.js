const FETES_NAMES={
  'Jour de l\'An':{fr:'Jour de l\'An',en:'New Year\'s Day',es:'Año Nuevo',ar:'رأس السنة',hi:'नव वर्ष',zh:'新年',pt:'Ano Novo'},
  'Saint-Valentin':{fr:'Saint-Valentin',en:'Valentine\'s Day',es:'San Valentín',ar:'عيد الحب',hi:'वेलेंटाइन डे',zh:'情人节',pt:'Dia dos Namorados'},
  'Journée des Femmes':{fr:'Journée des Femmes',en:'Women\'s Day',es:'Día de la Mujer',ar:'يوم المرأة',hi:'महिला दिवस',zh:'妇女节',pt:'Dia da Mulher'},
  'Journée de l\'Amitié':{fr:'Journée de l\'Amitié',en:'Friendship Day',es:'Día de la Amistad',ar:'يوم الصداقة',hi:'मित्रता दिवस',zh:'友谊日',pt:'Dia da Amizade'},
  'Pâques':{fr:'Pâques',en:'Easter',es:'Pascua',ar:'عيد الفصح',hi:'ईस्टर',zh:'复活节',pt:'Páscoa'},
  'Lundi de Pâques':{fr:'Lundi de Pâques',en:'Easter Monday',es:'Lunes de Pascua',ar:'الإثنين الفصحي',hi:'ईस्टर सोमवार',zh:'复活节星期一',pt:'Segunda de Páscoa'},
  'Fête du Travail':{fr:'Fête du Travail',en:'Labour Day',es:'Día del Trabajo',ar:'عيد العمال',hi:'श्रमिक दिवस',zh:'劳动节',pt:'Dia do Trabalho'},
  'Fête des Mères':{fr:'Fête des Mères',en:'Mother\'s Day',es:'Día de la Madre',ar:'يوم الأم',hi:'मातृ दिवस',zh:'母亲节',pt:'Dia das Mães'},
  'Fête des Pères':{fr:'Fête des Pères',en:'Father\'s Day',es:'Día del Padre',ar:'يوم الأب',hi:'पितृ दिवस',zh:'父亲节',pt:'Dia dos Pais'},
  'Ascension':{fr:'Ascension',en:'Ascension Day',es:'Ascensión',ar:'الصعود',hi:'ऊर्ध्वारोहण',zh:'耶稣升天节',pt:'Ascensão'},
  'Pentecôte':{fr:'Pentecôte',en:'Pentecost',es:'Pentecostés',ar:'عيد العنصرة',hi:'पेन्तेकोस्त',zh:'圣灵降临节',pt:'Pentecostes'},
  'Assomption':{fr:'Assomption',en:'Assumption',es:'Asunción',ar:'صعود مريم',hi:'मैरी का स्वर्गारोहण',zh:'圣母升天节',pt:'Assunção'},
  'Toussaint':{fr:'Toussaint',en:'All Saints\' Day',es:'Día de Todos los Santos',ar:'عيد القديسين',hi:'सभी संतों का दिन',zh:'万圣节',pt:'Dia de Todos os Santos'},
  'Noël':{fr:'Noël',en:'Christmas',es:'Navidad',ar:'عيد الميلاد',hi:'क्रिसमस',zh:'圣诞节',pt:'Natal'},
  'Aïd el-Fitr':{fr:'Aïd el-Fitr',en:'Eid al-Fitr',es:'Eid al-Fitr',ar:'عيد الفطر',hi:'ईद अल-फित्र',zh:'开斋节',pt:'Eid al-Fitr'},
  'Aïd el-Adha':{fr:'Aïd el-Adha',en:'Eid al-Adha',es:'Eid al-Adha',ar:'عيد الأضحى',hi:'ईद अल-अधा',zh:'宰牲节',pt:'Eid al-Adha'},
  'Ramadan (début)':{fr:'Ramadan (début)',en:'Ramadan (start)',es:'Ramadán (inicio)',ar:'بداية رمضان',hi:'रमजान (शुरू)',zh:'斋月（开始）',pt:'Ramadã (início)'},
  'Diwali':{fr:'Diwali',en:'Diwali',es:'Diwali',ar:'ديوالي',hi:'दिवाली',zh:'排灯节',pt:'Diwali'},
  'Hanouka':{fr:'Hanouka',en:'Hanukkah',es:'Janucá',ar:'حانوكا',hi:'हनुक्का',zh:'光明节',pt:'Hanukkah'},
  'Roch Hachana':{fr:'Roch Hachana',en:'Rosh Hashanah',es:'Rosh Hashaná',ar:'رأس السنة اليهودية',hi:'रोश हशाना',zh:'犹太新年',pt:'Rosh Hashaná'},
  'Yom Kippour':{fr:'Yom Kippour',en:'Yom Kippur',es:'Yom Kipur',ar:'يوم الغفران',hi:'योम किप्पुर',zh:'赎罪日',pt:'Yom Kipur'},
  'Vesak (Bouddha)':{fr:'Vesak (Bouddha)',en:'Vesak (Buddha Day)',es:'Vesak',ar:'عيد فيساك',hi:'वेसाक (बुद्ध दिवस)',zh:'卫塞节',pt:'Vesak'},
  'Nouvel An Chinois':{fr:'Nouvel An Chinois',en:'Chinese New Year',es:'Año Nuevo Chino',ar:'رأس السنة الصينية',hi:'चीनी नव वर्ष',zh:'春节',pt:'Ano Novo Chinês'},
  'Noël Orthodoxe':{fr:'Noël Orthodoxe',en:'Orthodox Christmas',es:'Navidad Ortodoxa',ar:'عيد الميلاد الأرثوذكسي',hi:'ऑर्थोडॉक्स क्रिसमस',zh:'东正教圣诞节',pt:'Natal Ortodoxo'},
  'Journée Internationale de l\'Enfant':{fr:'Journée Internationale de l\'Enfant',en:'Children\'s Day',es:'Día del Niño',ar:'يوم الطفل',hi:'बाल दिवस',zh:'儿童节',pt:'Dia da Criança'},
  'Journée des Droits de l\'Homme':{fr:'Journée des Droits de l\'Homme',en:'Human Rights Day',es:'Día de los Derechos Humanos',ar:'يوم حقوق الإنسان',hi:'मानवाधिकार दिवस',zh:'人权日',pt:'Dia dos Direitos Humanos'},
  'Fête Nationale':{fr:'Fête Nationale',en:'National Day',es:'Día Nacional',ar:'اليوم الوطني',hi:'राष्ट्रीय दिवस',zh:'国庆节',pt:'Dia Nacional'},
  'Fête des Grands-Parents':{fr:'Fête des Grands-Parents',en:'Grandparents\' Day',es:'Día de los Abuelos',ar:'يوم الأجداد',hi:'दादा-दादी दिवस',zh:'祖父母节',pt:'Dia dos Avós'},
  'Jour de l\'An':{fr:'Jour de l\'An',en:'New Year\'s Day',es:'Año Nuevo',ar:'رأس السنة الجديدة',hi:'नव वर्ष',zh:'元旦',pt:'Ano Novo'},
  'Journée de l\'Amitié':{fr:'Journée de l\'Amitié',en:'Friendship Day',es:'Día de la Amistad',ar:'يوم الصداقة',hi:'मित्रता दिवस',zh:'国际友谊日',pt:'Dia da Amizade'},
  'Halloween':{fr:'Halloween',en:'Halloween',es:'Halloween',ar:'هالوين',hi:'हैलोवीन',zh:'万圣节',pt:'Halloween'},
  'Saint-Sylvestre':{fr:'Saint-Sylvestre',en:'New Year\'s Eve',es:'Nochevieja',ar:'ليلة رأس السنة',hi:'नए साल की पूर्व संध्या',zh:'除夕',pt:'Véspera de Ano Novo'},
  'Fête Nationale France':{fr:'Fête Nationale France',en:'Bastille Day',es:'Día de la Bastilla',ar:'اليوم الوطني الفرنسي',hi:'बास्तील दिवस',zh:'法国国庆节',pt:'Dia da Bastilha'},
  'Armistice':{fr:'Armistice',en:'Armistice Day',es:'Día del Armisticio',ar:'يوم الهدنة',hi:'युद्धविराम दिवस',zh:'停战纪念日',pt:'Dia do Armistício'},
  'Victoire 1945':{fr:'Victoire 1945',en:'Victory in Europe Day',es:'Día de la Victoria en Europa',ar:'يوم النصر في أوروبا',hi:'यूरोप में विजय दिवस',zh:'欧洲胜利日',pt:'Dia da Vitória na Europa'},
  'Indépendance Haïti':{fr:'Indépendance Haïti',en:'Haiti Independence',es:'Independencia de Haití',ar:'استقلال هايتي',hi:'हैती स्वतंत्रता दिवस',zh:'海地独立日',pt:'Independência do Haiti'},
  'Flag Day Haïti':{fr:'Flag Day Haïti',en:'Haitian Flag Day',es:'Día de la Bandera de Haití',ar:'يوم علم هايتي',hi:'हैती ध्वज दिवस',zh:'海地国旗日',pt:'Dia da Bandeira do Haiti'},
  'Indépendance USA':{fr:'Indépendance USA',en:'Independence Day (USA)',es:'Día de la Independencia (EEUU)',ar:'يوم الاستقلال الأمريكي',hi:'अमेरिका स्वतंत्रता दिवस',zh:'美国独立日',pt:'Dia da Independência (EUA)'},
  'Thanksgiving':{fr:'Thanksgiving',en:'Thanksgiving',es:'Día de Acción de Gracias',ar:'عيد الشكر',hi:'थैंक्सगिविंग',zh:'感恩节',pt:'Ação de Graças'},
  'Fête Nationale Belgique':{fr:'Fête Nationale Belgique',en:'Belgian National Day',es:'Día Nacional de Bélgica',ar:'اليوم الوطني البلجيكي',hi:'बेल्जियम राष्ट्रीय दिवस',zh:'比利时国庆节',pt:'Dia Nacional da Bélgica'},
  'Indépendance Maroc':{fr:'Indépendance Maroc',en:'Moroccan Independence',es:'Independencia de Marruecos',ar:'عيد الاستقلال المغربي',hi:'मोरक्को स्वतंत्रता दिवस',zh:'摩洛哥独立日',pt:'Independência de Marrocos'},
  'Fête du Trône Maroc':{fr:'Fête du Trône Maroc',en:'Moroccan Throne Day',es:'Día del Trono de Marruecos',ar:'عيد العرش المغربي',hi:'मोरक्को सिंहासन दिवस',zh:'摩洛哥王位日',pt:'Dia do Trono de Marrocos'},
  'Indépendance Algérie':{fr:'Indépendance Algérie',en:'Algerian Independence',es:'Independencia de Argelia',ar:'عيد استقلال الجزائر',hi:'अल्जीरिया स्वतंत्रता दिवस',zh:'阿尔及利亚独立日',pt:'Independência da Argélia'},
  'Indépendance Tunisie':{fr:'Indépendance Tunisie',en:'Tunisian Independence',es:'Independencia de Túnez',ar:'عيد استقلال تونس',hi:'ट्यूनीशिया स्वतंत्रता दिवस',zh:'突尼斯独立日',pt:'Independência da Tunísia'},
  'Indépendance Sénégal':{fr:'Indépendance Sénégal',en:'Senegalese Independence',es:'Independencia de Senegal',ar:'عيد استقلال السنغال',hi:'सेनेगल स्वतंत्रता दिवस',zh:'塞内加尔独立日',pt:'Independência do Senegal'},
  'Indépendance Côte d\'Ivoire':{fr:'Indépendance Côte d\'Ivoire',en:'Ivorian Independence',es:'Independencia de Costa de Marfil',ar:'عيد استقلال ساحل العاج',hi:'आइवरी कोस्ट स्वतंत्रता दिवस',zh:'科特迪瓦独立日',pt:'Independência da Costa do Marfim'},
  'Indépendance Cameroun':{fr:'Indépendance Cameroun',en:'Cameroonian Independence',es:'Independencia de Camerún',ar:'عيد استقلال الكاميرون',hi:'कैमरून स्वतंत्रता दिवस',zh:'喀麦隆独立日',pt:'Independência dos Camarões'},
  'Indépendance Gabon':{fr:'Indépendance Gabon',en:'Gabonese Independence',es:'Independencia de Gabón',ar:'عيد استقلال الغابون',hi:'गैबॉन स्वतंत्रता दिवस',zh:'加蓬独立日',pt:'Independência do Gabão'},
  'Indépendance RDC':{fr:'Indépendance RDC',en:'DRC Independence',es:'Independencia de RDC',ar:'عيد استقلال الكونغو الديمقراطية',hi:'डीआरसी स्वतंत्रता दिवस',zh:'刚果民主共和国独立日',pt:'Independência da RDC'},
  'Indépendance Madagascar':{fr:'Indépendance Madagascar',en:'Malagasy Independence',es:'Independencia de Madagascar',ar:'عيد استقلال مدغشقر',hi:'मेडागास्कर स्वतंत्रता दिवस',zh:'马达加斯加独立日',pt:'Independência de Madagascar'},
  'Indépendance Ghana':{fr:'Indépendance Ghana',en:'Ghanaian Independence',es:'Independencia de Ghana',ar:'عيد استقلال غانا',hi:'घाना स्वतंत्रता दिवस',zh:'加纳独立日',pt:'Independência do Ghana'},
  'Indépendance Mali':{fr:'Indépendance Mali',en:'Malian Independence',es:'Independencia de Malí',ar:'عيد استقلال مالي',hi:'माली स्वतंत्रता दिवस',zh:'马里独立日',pt:'Independência do Mali'},
  'Indépendance Togo':{fr:'Indépendance Togo',en:'Togolese Independence',es:'Independencia de Togo',ar:'عيد استقلال توغو',hi:'टोगो स्वतंत्रता दिवस',zh:'多哥独立日',pt:'Independência do Togo'},
  'Indépendance Bénin':{fr:'Indépendance Bénin',en:'Beninese Independence',es:'Independencia de Benín',ar:'عيد استقلال بنين',hi:'बेनिन स्वतंत्रता दिवस',zh:'贝宁独立日',pt:'Independência do Benim'},
  'Indépendance Guinée':{fr:'Indépendance Guinée',en:'Guinean Independence',es:'Independencia de Guinea',ar:'عيد استقلال غينيا',hi:'गिनी स्वतंत्रता दिवस',zh:'几内亚独立日',pt:'Independência da Guiné'},
  'Indépendance Brésil':{fr:'Indépendance Brésil',en:'Brazilian Independence',es:'Independencia de Brasil',ar:'عيد استقلال البرازيل',hi:'ब्राजील स्वतंत्रता दिवस',zh:'巴西独立日',pt:'Independência do Brasil'},
  'Indépendance Inde':{fr:'Indépendance Inde',en:'Indian Independence',es:'Independencia de India',ar:'عيد استقلال الهند',hi:'भारत स्वतंत्रता दिवस',zh:'印度独立日',pt:'Independência da Índia'},
  'Fête Nationale Japon':{fr:'Fête Nationale Japon',en:'Japan National Day',es:'Día Nacional de Japón',ar:'اليوم الوطني الياباني',hi:'जापान राष्ट्रीय दिवस',zh:'日本国庆节',pt:'Dia Nacional do Japão'},
  'Hanami':{fr:'Hanami',en:'Hanami (Cherry Blossom)',es:'Hanami (Flor de cerezo)',ar:'هاناما (زهر الكرز)',hi:'हनामी (चेरी ब्लॉसम)',zh:'赏花节',pt:'Hanami (Cerejeiras)'},
  'Fête Nationale Italie':{fr:'Fête Nationale Italie',en:'Italian National Day',es:'Día Nacional de Italia',ar:'اليوم الوطني الإيطالي',hi:'इटली राष्ट्रीय दिवस',zh:'意大利国庆节',pt:'Dia Nacional da Itália'},
  'Fête Nationale Espagne':{fr:'Fête Nationale Espagne',en:'Spain National Day',es:'Día de la Hispanidad',ar:'اليوم الوطني الإسباني',hi:'स्पेन राष्ट्रीय दिवस',zh:'西班牙国庆节',pt:'Dia Nacional da Espanha'},
  'Fête Nationale Allemagne':{fr:'Fête Nationale Allemagne',en:'German Unity Day',es:'Día de la Unidad Alemana',ar:'يوم الوحدة الألمانية',hi:'जर्मन एकता दिवस',zh:'德国统一日',pt:'Dia da Unidade Alemã'},
  'Indépendance Liban':{fr:'Indépendance Liban',en:'Lebanese Independence',es:'Independencia del Líbano',ar:'عيد استقلال لبنان',hi:'लेबनान स्वतंत्रता दिवस',zh:'黎巴嫩独立日',pt:'Independência do Líbano'},
  'Épiphanie':{fr:'Épiphanie',en:'Epiphany',es:'Epifanía',ar:'عيد الظهور الإلهي',hi:'एपिफनी',zh:'主显节',pt:'Epifania'},
  'Rosh Hashana':{fr:'Rosh Hashana',en:'Rosh Hashanah',es:'Rosh Hashaná',ar:'رأس السنة العبرية',hi:'रोश हशाना',zh:'犹太新年',pt:'Rosh Hashaná'},
  'Hanoukka':{fr:'Hanoukka',en:'Hanukkah',es:'Janucá',ar:'حانوكا',hi:'हनुक्का',zh:'光明节',pt:'Hanukkah'},
  'Holi':{fr:'Holi',en:'Holi',es:'Holi',ar:'هولي',hi:'होली',zh:'洒红节',pt:'Holi'},
  'Indépendance Nigeria':{fr:'Indépendance Nigeria',en:'Nigeria Independence Day',es:'Independencia de Nigeria',ar:'عيد استقلال نيجيريا',hi:'नाइजीरिया स्वतंत्रता दिवस',zh:'尼日利亚独立日',pt:'Independência da Nigéria'},
  'Jamhuri Day Kenya':{fr:'Journée Nationale Kenya',en:'Kenya Jamhuri Day',es:'Día Nacional de Kenia',ar:'يوم استقلال كينيا',hi:'केन्या स्वतंत्रता दिवस',zh:'肯尼亚独立日',pt:'Dia da Independência do Quênia'},
  'Freedom Day Afrique du Sud':{fr:'Freedom Day Afrique du Sud',en:'Freedom Day South Africa',es:'Día de la Libertad Sudáfrica',ar:'يوم الحرية جنوب أفريقيا',hi:'स्वतंत्रता दिवस दक्षिण अफ्रीका',zh:'南非自由日',pt:'Dia da Liberdade África do Sul'},
  'Indépendance Colombie':{fr:'Indépendance Colombie',en:'Colombian Independence',es:'Independencia de Colombia',ar:'عيد استقلال كولومبيا',hi:'कोलंबिया स्वतंत्रता दिवस',zh:'哥伦比亚独立日',pt:'Independência da Colômbia'},
  'Indépendance Argentine':{fr:'Indépendance Argentine',en:'Argentine Independence',es:'Independencia de Argentina',ar:'عيد استقلال الأرجنتين',hi:'अर्जेंटीना स्वतंत्रता दिवस',zh:'阿根廷独立日',pt:'Independência da Argentina'},
  'Indépendance Pérou':{fr:'Indépendance Pérou',en:'Peruvian Independence',es:'Independencia del Perú',ar:'عيد استقلال بيرو',hi:'पेरू स्वतंत्रता दिवस',zh:'秘鲁独立日',pt:'Independência do Peru'},
  'Indépendance Venezuela':{fr:'Indépendance Venezuela',en:'Venezuelan Independence',es:'Independencia de Venezuela',ar:'عيد استقلال فنزويلا',hi:'वेनेजुएला स्वतंत्रता दिवस',zh:'委内瑞拉独立日',pt:'Independência da Venezuela'},
  'Fête Nationale Chili':{fr:'Fête Nationale Chili',en:'Chilean National Day',es:'Día de la Independencia de Chile',ar:'اليوم الوطني التشيلي',hi:'चिली राष्ट्रीय दिवस',zh:'智利国庆节',pt:'Dia Nacional do Chile'},
  'Fête Nationale Mexique':{fr:'Fête Nationale Mexique',en:'Mexican Independence Day',es:'Día de la Independencia de México',ar:'عيد استقلال المكسيك',hi:'मेक्सिको स्वतंत्रता दिवस',zh:'墨西哥独立日',pt:'Independência do México'},
  'Indépendance Philippines':{fr:'Indépendance Philippines',en:'Philippine Independence Day',es:'Independencia de Filipinas',ar:'عيد استقلال الفلبين',hi:'फिलीपींस स्वतंत्रता दिवस',zh:'菲律宾独立日',pt:'Independência das Filipinas'},
  'Fête Nationale Vietnam':{fr:'Fête Nationale Vietnam',en:'Vietnam National Day',es:'Día Nacional de Vietnam',ar:'اليوم الوطني الفيتنامي',hi:'वियतनाम राष्ट्रीय दिवस',zh:'越南国庆节',pt:'Dia Nacional do Vietname'},
  'Gwangbokjeol Corée':{fr:'Fête Nationale Corée du Sud',en:'Korea Liberation Day',es:'Día de la Liberación de Corea',ar:'يوم تحرير كوريا',hi:'कोरिया स्वतंत्रता दिवस',zh:'韩国光复节',pt:'Dia da Libertação da Coreia'},
  'Indépendance Burkina Faso':{fr:'Indépendance Burkina Faso',en:'Burkina Faso Independence',es:'Independencia de Burkina Faso',ar:'عيد استقلال بوركينا فاسو',hi:'बुर्किना फासो स्वतंत्रता दिवस',zh:'布基纳法索独立日',pt:'Independência do Burkina Faso'},
  'Indépendance Niger':{fr:'Indépendance Niger',en:'Niger Independence Day',es:'Independencia de Níger',ar:'عيد استقلال النيجر',hi:'नाइजर स्वतंत्रता दिवस',zh:'尼日尔独立日',pt:'Independência do Níger'},
  'Indépendance Tchad':{fr:'Indépendance Tchad',en:'Chad Independence Day',es:'Independencia del Chad',ar:'عيد استقلال تشاد',hi:'चाड स्वतंत्रता दिवस',zh:'乍得独立日',pt:'Independência do Chade'},
  'Fête Nationale EAU':{fr:'Fête Nationale Émirats',en:'UAE National Day',es:'Día Nacional de los EAU',ar:'اليوم الوطني الإماراتي',hi:'यूएई राष्ट्रीय दिवस',zh:'阿联酋国庆节',pt:'Dia Nacional dos EAU'},
  'Fête Nationale Arabie Saoudite':{fr:'Fête Nationale Arabie Saoudite',en:'Saudi National Day',es:'Día Nacional de Arabia Saudita',ar:'اليوم الوطني السعودي',hi:'सौदी राष्ट्रीय दिवस',zh:'沙特国庆节',pt:'Dia Nacional da Arábia Saudita'},
  'Indépendance Pakistan':{fr:'Indépendance Pakistan',en:'Pakistan Independence Day',es:'Independencia de Pakistán',ar:'عيد استقلال باكستان',hi:'पाकिस्तान स्वतंत्रता दिवस',zh:'巴基斯坦独立日',pt:'Independência do Paquistão'},
  'Indépendance Bangladesh':{fr:'Indépendance Bangladesh',en:'Bangladesh Independence Day',es:'Independencia de Bangladés',ar:'عيد استقلال بنغلاديش',hi:'बांग्लादेश स्वतंत्रता दिवस',zh:'孟加拉国独立日',pt:'Independência do Bangladesh'},

};
function tFete(nomFr){
  var entry=FETES_NAMES[nomFr];
  if(!entry) return nomFr;
  return entry[appLang]||entry.fr||nomFr;
}



function formatDateLocal(date){
  var days=JRS; var months=MN;
  if(!days||!months) return date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
  return days[date.getDay()]+' '+date.getDate()+' '+months[date.getMonth()];
}


var COUNTRIES={
  fr:['Non précisé','🇫🇷 France','🇧🇪 Belgique','🇨🇭 Suisse','🇨🇦 Canada','🇲🇦 Maroc','🇩🇿 Algérie','🇹🇳 Tunisie','🇸🇳 Sénégal','🇨🇮 Côte d\'Ivoire','🇨🇲 Cameroun','🇨🇬 Congo','🇧🇯 Bénin','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guinée','🇲🇬 Madagascar','🇷🇼 Rwanda','🇧🇮 Burundi','🇬🇦 Gabon','🇳🇪 Niger','🇹🇩 Tchad','🇲🇷 Mauritanie','🇩🇯 Djibouti','🇰🇲 Comores','🇨🇻 Cap-Vert','🇸🇹 São Tomé','🇭🇹 Haïti','🇬🇵 Guadeloupe','🇲🇶 Martinique','🇷🇪 Réunion','🇬🇫 Guyane','🇵🇫 Polynésie','🇱🇺 Luxembourg','🇳🇨 Nouvelle-Calédonie','🇵🇲 St-Pierre-et-Miquelon','🇨🇫 Centrafrique','🇸🇨 Seychelles','🇾🇹 Mayotte','🇦🇺 Australie','🇳🇿 Nouvelle-Zélande','🇮🇪 Irlande','🇰🇪 Kenya','🇹🇿 Tanzanie','🇺🇬 Ouganda','🇿🇦 Afrique du Sud','🇿🇼 Zimbabwe','🇿🇲 Zambie','🇲🇼 Malawi','🇧🇼 Botswana','🇳🇦 Namibie','🇸🇱 Sierra Leone','🇱🇷 Liberia','🇬🇲 Gambie','🇵🇭 Philippines','🇸🇬 Singapour','🇵🇰 Pakistan','🇧🇩 Bangladesh','🇱🇰 Sri Lanka','🇯🇲 Jamaïque','🇹🇹 Trinidad-et-Tobago','🇧🇧 Barbade','🇬🇾 Guyana','🇲🇹 Malte','🇪🇹 Éthiopie','🇸🇸 Soudan du Sud','🇪🇷 Érythrée','🇦🇷 Argentine','🇵🇪 Pérou','🇻🇪 Venezuela','🇨🇱 Chili','🇪🇨 Équateur','🇬🇹 Guatemala','🇨🇺 Cuba','🇧🇴 Bolivie','🇩🇴 Rép. Dominicaine','🇭🇳 Honduras','🇵🇾 Paraguay','🇸🇻 El Salvador','🇳🇮 Nicaragua','🇨🇷 Costa Rica','🇵🇦 Panama','🇺🇾 Uruguay','🇵🇷 Porto Rico','🇸🇦 Arabie Saoudite','🇦🇪 Émirats Arabes Unis','🇮🇶 Irak','🇸🇾 Syrie','🇯🇴 Jordanie','🇾🇪 Yémen','🇵🇸 Palestine','🇶🇦 Qatar','🇧🇭 Bahreïn','🇰🇼 Koweït','🇴🇲 Oman','🇱🇾 Libye','🇸🇩 Soudan','🇸🇴 Somalie','🇳🇵 Népal','🇫🇯 Fidji','🇹🇼 Taïwan','🇭🇰 Hong Kong','🇲🇴 Macao','🇲🇾 Malaisie','🇦🇴 Angola','🇲🇿 Mozambique','🇬🇼 Guinée-Bissau','🇹🇱 Timor-Leste','🇬🇧 Royaume-Uni','🇺🇸 États-Unis','🇩🇪 Allemagne','🇪🇸 Espagne','🇮🇹 Italie','🇵🇹 Portugal','🇳🇱 Pays-Bas','🇧🇷 Brésil','🇲🇽 Mexique','🇨🇴 Colombie','🇪🇬 Égypte','🇨🇩 Congo RDC','🇬🇭 Ghana','🇳🇬 Nigéria','🇲🇺 Maurice','🇱🇧 Liban','🇲🇨 Monaco','🇦🇹 Autriche','🇬🇷 Grèce','🇵🇱 Pologne','🇷🇴 Roumanie','🇭🇺 Hongrie','🇨🇿 Tchéquie','🇸🇰 Slovaquie','🇸🇪 Suède','🇳🇴 Norvège','🇩🇰 Danemark','🇫🇮 Finlande','🇷🇺 Russie','🇺🇦 Ukraine','🇹🇷 Turquie','🇮🇷 Iran','🇮🇱 Israël','🇮🇳 Inde','🇨🇳 Chine','🇯🇵 Japon','🇰🇷 Corée du Sud','🇻🇳 Vietnam','🇮🇩 Indonésie','🇹🇭 Thaïlande','🇰🇭 Cambodge','🇱🇦 Laos','🇲🇲 Myanmar','🇲🇳 Mongolie','🇧🇹 Bhoutan','🇲🇻 Maldives','🇧🇳 Brunei','🇦🇲 Arménie','🇬🇪 Géorgie','🇦🇿 Azerbaïdjan','🇰🇿 Kazakhstan','🇺🇿 Ouzbékistan','🇦🇫 Afghanistan','🇰🇬 Kirghizistan','🇹🇯 Tadjikistan','🇹🇲 Turkménistan','🇵🇬 Papouasie','🇸🇧 Îles Salomon','🇻🇺 Vanuatu','🇼🇸 Samoa','🇹🇴 Tonga','🇱🇨 Sainte-Lucie','🇻🇨 Saint-Vincent','🇬🇩 Grenade','🇦🇬 Antigua','🇰🇳 Saint-Kitts','🇩🇲 Dominique','🇧🇿 Belize','🇧🇸 Bahamas','🇬🇶 Guinée Équatoriale','Autre'],
  en:['Not specified','🇫🇷 France','🇧🇪 Belgium','🇨🇭 Switzerland','🇨🇦 Canada','🇲🇦 Morocco','🇩🇿 Algeria','🇹🇳 Tunisia','🇸🇳 Senegal','🇨🇮 Ivory Coast','🇨🇲 Cameroon','🇨🇬 Congo','🇧🇯 Benin','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guinea','🇲🇬 Madagascar','🇷🇼 Rwanda','🇧🇮 Burundi','🇬🇦 Gabon','🇳🇪 Niger','🇹🇩 Chad','🇲🇷 Mauritania','🇩🇯 Djibouti','🇰🇲 Comoros','🇨🇻 Cape Verde','🇸🇹 São Tomé','🇭🇹 Haiti','🇬🇵 Guadeloupe','🇲🇶 Martinique','🇷🇪 Réunion','🇬🇫 French Guiana','🇵🇫 Polynesia','🇱🇺 Luxembourg','🇳🇨 New Caledonia','🇵🇲 St. Pierre and Miquelon','🇨🇫 Central African Republic','🇸🇨 Seychelles','🇾🇹 Mayotte','🇦🇺 Australia','🇳🇿 New Zealand','🇮🇪 Ireland','🇰🇪 Kenya','🇹🇿 Tanzania','🇺🇬 Uganda','🇿🇦 South Africa','🇿🇼 Zimbabwe','🇿🇲 Zambia','🇲🇼 Malawi','🇧🇼 Botswana','🇳🇦 Namibia','🇸🇱 Sierra Leone','🇱🇷 Liberia','🇬🇲 Gambia','🇵🇭 Philippines','🇸🇬 Singapore','🇵🇰 Pakistan','🇧🇩 Bangladesh','🇱🇰 Sri Lanka','🇯🇲 Jamaica','🇹🇹 Trinidad and Tobago','🇧🇧 Barbados','🇬🇾 Guyana','🇲🇹 Malta','🇪🇹 Ethiopia','🇸🇸 South Sudan','🇪🇷 Eritrea','🇦🇷 Argentina','🇵🇪 Peru','🇻🇪 Venezuela','🇨🇱 Chile','🇪🇨 Ecuador','🇬🇹 Guatemala','🇨🇺 Cuba','🇧🇴 Bolivia','🇩🇴 Dominican Republic','🇭🇳 Honduras','🇵🇾 Paraguay','🇸🇻 El Salvador','🇳🇮 Nicaragua','🇨🇷 Costa Rica','🇵🇦 Panama','🇺🇾 Uruguay','🇵🇷 Puerto Rico','🇸🇦 Saudi Arabia','🇦🇪 United Arab Emirates','🇮🇶 Iraq','🇸🇾 Syria','🇯🇴 Jordan','🇾🇪 Yemen','🇵🇸 Palestine','🇶🇦 Qatar','🇧🇭 Bahrain','🇰🇼 Kuwait','🇴🇲 Oman','🇱🇾 Libya','🇸🇩 Sudan','🇸🇴 Somalia','🇳🇵 Nepal','🇫🇯 Fiji','🇹🇼 Taiwan','🇭🇰 Hong Kong','🇲🇴 Macao','🇲🇾 Malaysia','🇦🇴 Angola','🇲🇿 Mozambique','🇬🇼 Guinea-Bissau','🇹🇱 Timor-Leste','🇬🇧 United Kingdom','🇺🇸 United States','🇩🇪 Germany','🇪🇸 Spain','🇮🇹 Italy','🇵🇹 Portugal','🇳🇱 Netherlands','🇧🇷 Brazil','🇲🇽 Mexico','🇨🇴 Colombia','🇪🇬 Egypt','🇨🇩 DR Congo','🇬🇭 Ghana','🇳🇬 Nigeria','🇲🇺 Mauritius','🇱🇧 Lebanon','🇲🇨 Monaco','🇦🇹 Austria','🇬🇷 Greece','🇵🇱 Poland','🇷🇴 Romania','🇭🇺 Hungary','🇨🇿 Czech Republic','🇸🇰 Slovakia','🇸🇪 Sweden','🇳🇴 Norway','🇩🇰 Denmark','🇫🇮 Finland','🇷🇺 Russia','🇺🇦 Ukraine','🇹🇷 Turkey','🇮🇷 Iran','🇮🇱 Israel','🇮🇳 India','🇨🇳 China','🇯🇵 Japan','🇰🇷 South Korea','🇻🇳 Vietnam','🇮🇩 Indonesia','🇹🇭 Thailand','🇰🇭 Cambodia','🇱🇦 Laos','🇲🇲 Myanmar','🇲🇳 Mongolia','🇧🇹 Bhutan','🇲🇻 Maldives','🇧🇳 Brunei','🇦🇲 Armenia','🇬🇪 Georgia','🇦🇿 Azerbaijan','🇰🇿 Kazakhstan','🇺🇿 Uzbekistan','🇦🇫 Afghanistan','🇰🇬 Kyrgyzstan','🇹🇯 Tajikistan','🇹🇲 Turkmenistan','🇵🇬 Papua New Guinea','🇸🇧 Solomon Islands','🇻🇺 Vanuatu','🇼🇸 Samoa','🇹🇴 Tonga','🇱🇨 Saint Lucia','🇻🇨 Saint Vincent','🇬🇩 Grenada','🇦🇬 Antigua','🇰🇳 Saint Kitts','🇩🇲 Dominica','🇧🇿 Belize','🇧🇸 Bahamas','🇬🇶 Equatorial Guinea','Other'],
  es:['No especificado','🇫🇷 Francia','🇧🇪 Bélgica','🇨🇭 Suiza','🇨🇦 Canadá','🇲🇦 Marruecos','🇩🇿 Argelia','🇹🇳 Túnez','🇸🇳 Senegal','🇨🇮 Costa de Marfil','🇨🇲 Camerún','🇨🇬 Congo','🇧🇯 Benín','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Malí','🇬🇳 Guinea','🇲🇬 Madagascar','🇷🇼 Ruanda','🇧🇮 Burundi','🇬🇦 Gabón','🇳🇪 Níger','🇹🇩 Chad','🇲🇷 Mauritania','🇩🇯 Yibuti','🇰🇲 Comoras','🇨🇻 Cabo Verde','🇸🇹 Santo Tomé','🇭🇹 Haití','🇬🇵 Guadalupe','🇲🇶 Martinica','🇷🇪 Reunión','🇬🇫 Guayana Francesa','🇵🇫 Polinesia','🇱🇺 Luxemburgo','🇳🇨 Nueva Caledonia','🇵🇲 San Pedro y Miquelón','🇨🇫 República Centroafricana','🇸🇨 Seychelles','🇾🇹 Mayotte','🇦🇺 Australia','🇳🇿 Nueva Zelanda','🇮🇪 Irlanda','🇰🇪 Kenia','🇹🇿 Tanzania','🇺🇬 Uganda','🇿🇦 Sudáfrica','🇿🇼 Zimbabue','🇿🇲 Zambia','🇲🇼 Malaui','🇧🇼 Botsuana','🇳🇦 Namibia','🇸🇱 Sierra Leona','🇱🇷 Liberia','🇬🇲 Gambia','🇵🇭 Filipinas','🇸🇬 Singapur','🇵🇰 Pakistán','🇧🇩 Bangladés','🇱🇰 Sri Lanka','🇯🇲 Jamaica','🇹🇹 Trinidad y Tobago','🇧🇧 Barbados','🇬🇾 Guyana','🇲🇹 Malta','🇪🇹 Etiopía','🇸🇸 Sudán del Sur','🇪🇷 Eritrea','🇦🇷 Argentina','🇵🇪 Perú','🇻🇪 Venezuela','🇨🇱 Chile','🇪🇨 Ecuador','🇬🇹 Guatemala','🇨🇺 Cuba','🇧🇴 Bolivia','🇩🇴 República Dominicana','🇭🇳 Honduras','🇵🇾 Paraguay','🇸🇻 El Salvador','🇳🇮 Nicaragua','🇨🇷 Costa Rica','🇵🇦 Panamá','🇺🇾 Uruguay','🇵🇷 Puerto Rico','🇸🇦 Arabia Saudita','🇦🇪 Emiratos Árabes Unidos','🇮🇶 Iraq','🇸🇾 Siria','🇯🇴 Jordania','🇾🇪 Yemen','🇵🇸 Palestina','🇶🇦 Catar','🇧🇭 Baréin','🇰🇼 Kuwait','🇴🇲 Omán','🇱🇾 Libia','🇸🇩 Sudán','🇸🇴 Somalia','🇳🇵 Nepal','🇫🇯 Fiyi','🇹🇼 Taiwán','🇭🇰 Hong Kong','🇲🇴 Macao','🇲🇾 Malasia','🇦🇴 Angola','🇲🇿 Mozambique','🇬🇼 Guinea-Bisáu','🇹🇱 Timor-Leste','🇬🇧 Reino Unido','🇺🇸 Estados Unidos','🇩🇪 Alemania','🇪🇸 España','🇮🇹 Italia','🇵🇹 Portugal','🇳🇱 Países Bajos','🇧🇷 Brasil','🇲🇽 México','🇨🇴 Colombia','🇪🇬 Egipto','🇨🇩 Congo RDC','🇬🇭 Ghana','🇳🇬 Nigeria','🇲🇺 Mauricio','🇱🇧 Líbano','🇲🇨 Mónaco','🇦🇹 Austria','🇬🇷 Grecia','🇵🇱 Polonia','🇷🇴 Rumanía','🇭🇺 Hungría','🇨🇿 República Checa','🇸🇰 Eslovaquia','🇸🇪 Suecia','🇳🇴 Noruega','🇩🇰 Dinamarca','🇫🇮 Finlandia','🇷🇺 Rusia','🇺🇦 Ucrania','🇹🇷 Turquía','🇮🇷 Irán','🇮🇱 Israel','🇮🇳 India','🇨🇳 China','🇯🇵 Japón','🇰🇷 Corea del Sur','🇻🇳 Vietnam','🇮🇩 Indonesia','🇹🇭 Tailandia','🇰🇭 Camboya','🇱🇦 Laos','🇲🇲 Myanmar','🇲🇳 Mongolia','🇧🇹 Bután','🇲🇻 Maldivas','🇧🇳 Brunéi','🇦🇲 Armenia','🇬🇪 Georgia','🇦🇿 Azerbaiyán','🇰🇿 Kazajistán','🇺🇿 Uzbekistán','🇦🇫 Afganistán','🇰🇬 Kirguistán','🇹🇯 Tayikistán','🇹🇲 Turkmenistán','🇵🇬 Papúa Nueva Guinea','🇸🇧 Islas Salomón','🇻🇺 Vanuatu','🇼🇸 Samoa','🇹🇴 Tonga','🇱🇨 Santa Lucía','🇻🇨 San Vicente','🇬🇩 Granada','🇦🇬 Antigua','🇰🇳 San Cristóbal','🇩🇲 Dominica','🇧🇿 Belice','🇧🇸 Bahamas','🇬🇶 Guinea Ecuatorial','Otro'],
  ar:['غير محدد','🇫🇷 فرنسا','🇧🇪 بلجيكا','🇨🇭 سويسرا','🇨🇦 كندا','🇲🇦 المغرب','🇩🇿 الجزائر','🇹🇳 تونس','🇸🇳 السنغال','🇨🇮 ساحل العاج','🇨🇲 الكاميرون','🇨🇬 الكونغو','🇧🇯 بنين','🇹🇬 توغو','🇧🇫 بوركينا فاسو','🇲🇱 مالي','🇬🇳 غينيا','🇲🇬 مدغشقر','🇷🇼 رواندا','🇧🇮 بوروندي','🇬🇦 الغابون','🇳🇪 النيجر','🇹🇩 تشاد','🇲🇷 موريتانيا','🇩🇯 جيبوتي','🇰🇲 جزر القمر','🇨🇻 الرأس الأخضر','🇸🇹 ساو تومي','🇭🇹 هايتي','🇬🇵 غوادلوب','🇲🇶 مارتينيك','🇷🇪 ريونيون','🇬🇫 غيانا الفرنسية','🇵🇫 بولينيزيا','🇱🇺 لوكسمبورغ','🇳🇨 كاليدونيا الجديدة','🇵🇲 سان بيير وميكلون','🇨🇫 جمهورية أفريقيا الوسطى','🇸🇨 سيشل','🇾🇹 مايوت','🇦🇺 أستراليا','🇳🇿 نيوزيلندا','🇮🇪 أيرلندا','🇰🇪 كينيا','🇹🇿 تنزانيا','🇺🇬 أوغندا','🇿🇦 جنوب أفريقيا','🇿🇼 زيمبابوي','🇿🇲 زامبيا','🇲🇼 مالاوي','🇧🇼 بوتسوانا','🇳🇦 ناميبيا','🇸🇱 سيراليون','🇱🇷 ليبيريا','🇬🇲 غامبيا','🇵🇭 الفلبين','🇸🇬 سنغافورة','🇵🇰 باكستان','🇧🇩 بنغلاديش','🇱🇰 سريلانكا','🇯🇲 جامايكا','🇹🇹 ترينيداد وتوباغو','🇧🇧 بربادوس','🇬🇾 غيانا','🇲🇹 مالطا','🇪🇹 إثيوبيا','🇸🇸 جنوب السودان','🇪🇷 إريتريا','🇦🇷 الأرجنتين','🇵🇪 بيرو','🇻🇪 فنزويلا','🇨🇱 تشيلي','🇪🇨 الإكوادور','🇬🇹 غواتيمالا','🇨🇺 كوبا','🇧🇴 بوليفيا','🇩🇴 جمهورية الدومينيكان','🇭🇳 هندوراس','🇵🇾 باراغواي','🇸🇻 السلفادور','🇳🇮 نيكاراغوا','🇨🇷 كوستاريكا','🇵🇦 بنما','🇺🇾 أوروغواي','🇵🇷 بورتوريكو','🇸🇦 المملكة العربية السعودية','🇦🇪 الإمارات العربية المتحدة','🇮🇶 العراق','🇸🇾 سوريا','🇯🇴 الأردن','🇾🇪 اليمن','🇵🇸 فلسطين','🇶🇦 قطر','🇧🇭 البحرين','🇰🇼 الكويت','🇴🇲 عُمان','🇱🇾 ليبيا','🇸🇩 السودان','🇸🇴 الصومال','🇳🇵 نيبال','🇫🇯 فيجي','🇹🇼 تايوان','🇭🇰 هونغ كونغ','🇲🇴 ماكاو','🇲🇾 ماليزيا','🇦🇴 أنغولا','🇲🇿 موزمبيق','🇬🇼 غينيا بيساو','🇹🇱 تيمور الشرقية','🇬🇧 المملكة المتحدة','🇺🇸 الولايات المتحدة','🇩🇪 ألمانيا','🇪🇸 إسبانيا','🇮🇹 إيطاليا','🇵🇹 البرتغال','🇳🇱 هولندا','🇧🇷 البرازيل','🇲🇽 المكسيك','🇨🇴 كولومبيا','🇪🇬 مصر','🇨🇩 الكونغو الديمقراطية','🇬🇭 غانا','🇳🇬 نيجيريا','🇲🇺 موريشيوس','🇱🇧 لبنان','🇲🇨 موناكو','🇦🇹 النمسا','🇬🇷 اليونان','🇵🇱 بولندا','🇷🇴 رومانيا','🇭🇺 هنغاريا','🇨🇿 جمهورية التشيك','🇸🇰 سلوفاكيا','🇸🇪 السويد','🇳🇴 النرويج','🇩🇰 الدنمارك','🇫🇮 فنلندا','🇷🇺 روسيا','🇺🇦 أوكرانيا','🇹🇷 تركيا','🇮🇷 إيران','🇮🇱 إسرائيل','🇮🇳 الهند','🇨🇳 الصين','🇯🇵 اليابان','🇰🇷 كوريا الجنوبية','🇻🇳 فيتنام','🇮🇩 إندونيسيا','🇹🇭 تايلاند','🇰🇭 كمبوديا','🇱🇦 لاوس','🇲🇲 ميانمار','🇲🇳 منغوليا','🇧🇹 بوتان','🇲🇻 المالديف','🇧🇳 بروناي','🇦🇲 أرمينيا','🇬🇪 جورجيا','🇦🇿 أذربيجان','🇰🇿 كازاخستان','🇺🇿 أوزبكستان','🇦🇫 أفغانستان','🇰🇬 قيرغيزستان','🇹🇯 طاجيكستان','🇹🇲 تركمانستان','🇵🇬 بابوا غينيا الجديدة','🇸🇧 جزر سليمان','🇻🇺 فانواتو','🇼🇸 ساموا','🇹🇴 تونغا','🇱🇨 سانت لوسيا','🇻🇨 سانت فينسنت','🇬🇩 غرينادا','🇦🇬 أنتيغوا','🇰🇳 سانت كيتس','🇩🇲 دومينيكا','🇧🇿 بليز','🇧🇸 البهاما','🇬🇶 غينيا الاستوائية','أخرى'],
  hi:['निर्दिष्ट नहीं','🇫🇷 फ्रांस','🇧🇪 बेल्जिम','🇨🇭 स्विट्जरलैंड','🇨🇦 कनाडा','🇲🇦 मोरक्को','🇩🇿 अल्जीरिया','🇹🇳 ट्यूनीशिया','🇸🇳 सेनेगल','🇨🇮 आइवरी कोस्ट','🇨🇲 कैमरून','🇨🇬 कांगो','🇧🇯 बेनिन','🇹🇬 टोगो','🇧🇫 बुर्किना फासो','🇲🇱 माली','🇬🇳 गिनी','🇲🇬 मेडागास्कर','🇷🇼 रवांडा','🇧🇮 बुरुंडी','🇬🇦 गैबॉन','🇳🇪 नाइजर','🇹🇩 चाड','🇲🇷 मॉरिटानिया','🇩🇯 जिबूती','🇰🇲 कोमोरोस','🇨🇻 केप वर्दे','🇸🇹 साओ टोमे','🇭🇹 हैती','🇬🇵 ग्वाडेलूप','🇲🇶 मार्टिनिक','🇷🇪 रीयूनियन','🇬🇫 फ्रेंच गुयाना','🇵🇫 पोलिनेशिया','🇱🇺 लक्ज़मबर्ग','🇳🇨 नई कैलेडोनिया','🇵🇲 सेंट पियरे','🇨🇫 मध्य अफ्रीका','🇸🇨 सेशेल्स','🇾🇹 मायोते','🇦🇺 ऑस्ट्रेलिया','🇳🇿 न्यूज़ीलैंड','🇮🇪 आयरलैंड','🇰🇪 केन्या','🇹🇿 तंजानिया','🇺🇬 युगांडा','🇿🇦 दक्षिण अफ्रीका','🇿🇼 ज़िम्बाब्वे','🇿🇲 ज़ाम्बिया','🇲🇼 मलावी','🇧🇼 बोत्सवाना','🇳🇦 नामीबिया','🇸🇱 सियरा लियोन','🇱🇷 लाइबेरिया','🇬🇲 गांबिया','🇵🇭 फ़िलीपींस','🇸🇬 सिंगापुर','🇵🇰 पाकिस्तान','🇧🇩 बांग्लादेश','🇱🇰 श्रीलंका','🇯🇲 जमैका','🇹🇹 त्रिनिदाद','🇧🇧 बारबाडोस','🇬🇾 गुयाना','🇲🇹 माल्टा','🇪🇹 इथियोपिया','🇸🇸 दक्षिण सूडान','🇪🇷 इरिट्रिया','🇦🇷 अर्जेंटीना','🇵🇪 पेरू','🇻🇪 वेनेजुएला','🇨🇱 चिली','🇪🇨 इक्वाडोर','🇬🇹 ग्वाटेमाला','🇨🇺 क्यूबा','🇧🇴 बोलीविया','🇩🇴 डोमिनिकन गणराज्य','🇭🇳 होंडुरास','🇵🇾 पराग्वे','🇸🇻 अल सल्वाडोर','🇳🇮 निकारागुआ','🇨🇷 कोस्टा रिका','🇵🇦 पनामा','🇺🇾 उरुग्वे','🇵🇷 प्यूर्टो रिको','🇸🇦 सौदी अरब','🇦🇪 संयुक्त अरब अमीरात','🇮🇶 इराक','🇸🇾 सीरिया','🇯🇴 ज़ॉर्डन','🇾🇪 यमन','🇵🇸 फ़िलिस्तीन','🇶🇦 कतर','🇧🇭 बहरीन','🇰🇼 कुवैत','🇴🇲 ओमान','🇱🇾 लीबिया','🇸🇩 सूडान','🇸🇴 सोमालिया','🇳🇵 नेपाल','🇫🇯 फ़िजी','🇹🇼 ताइवान','🇭🇰 हांगकांग','🇲🇴 मकाउ','🇲🇾 मलेशिया','🇦🇴 अंगोला','🇲🇿 मोज़ाम्बिक','🇬🇼 गिनी-बिसाउ','🇹🇱 तिमोर-लेस्ते','🇬🇧 यूनाइटेड किंगडम','🇺🇸 संयुक्त राज्य','🇩🇪 जर्मनी','🇪🇸 स्पेन','🇮🇹 इटली','🇵🇹 पुर्तगाल','🇳🇱 नीदरलैंड','🇧🇷 ब्राज़ील','🇲🇽 मेक्सिको','🇨🇴 कोलंबिया','🇪🇬 मिस्र','🇨🇩 कांगो लोकतांत्रिक','🇬🇭 घाना','🇳🇬 नाइजीरिया','🇲🇺 मॉरीशस','🇱🇧 लेबनान','🇲🇨 मोनाको','🇦🇹 ऑस्ट्रिया','🇬🇷 ग्रीस','🇵🇱 पोलैंड','🇷🇴 रोमानिया','🇭🇺 हंगरी','🇨🇿 चेक गणराज्य','🇸🇰 स्लोवाकिया','🇸🇪 स्वीडन','🇳🇴 नॉर्वे','🇩🇰 डेनमार्क','🇫🇮 फिनलैंड','🇷🇺 रूस','🇺🇦 यूक्रेन','🇹🇷 तुर्की','🇮🇷 ईरान','🇮🇱 इज़राइल','🇮🇳 भारत','🇨🇳 चीन','🇯🇵 जापान','🇰🇷 दक्षिण कोरिया','🇻🇳 वियतनाम','🇮🇩 इंडोनेशिया','🇹🇭 थाईलैंड','🇰🇭 कंबोडिया','🇱🇦 लाओस','🇲🇲 म्यांमार','🇲🇳 मंगोलिया','🇧🇹 भूटान','🇲🇻 मालदीव','🇧🇳 ब्रुनेई','🇦🇲 आर्मेनिया','🇬🇪 जॉर्जिया','🇦🇿 अज़रबैजान','🇰🇿 कजाकिस्तान','🇺🇿 उज़्बेकिस्तान','🇦🇫 अफ़ग़ानिस्तान','🇰🇬 किर्गिज़स्तान','🇹🇯 ताजिकिस्तान','🇹🇲 तुर्कमेनिस्तान','🇵🇬 पापुआ न्यू गिनी','🇸🇧 सोलोमन द्वीप','🇻🇺 वानुअतु','🇼🇸 समोआ','🇹🇴 टोंगा','🇱🇨 सेंट लूसिया','🇻🇨 सेंट विंसेंट','🇬🇩 ग्रेनाडा','🇦🇬 एंटीगुआ','🇰🇳 सेंट किट्स','🇩🇲 डोमिनिका','🇧🇿 बेलीज','🇧🇸 बहामास','🇬🇶 इक्वेटोरियल गिनी','अन्य'],
  zh:['未指定','🇫🇷 法国','🇧🇪 比利时','🇨🇭 瑞士','🇨🇦 加拿大','🇲🇦 摩洛哥','🇩🇿 阿尔及利亚','🇹🇳 突尼斯','🇸🇳 塞内加尔','🇨🇮 科特迪瓦','🇨🇲 喀麦隆','🇨🇬 刚果','🇧🇯 贝宁','🇹🇬 多哥','🇧🇫 布基纳法索','🇲🇱 马里','🇬🇳 几内亚','🇲🇬 马达加斯加','🇷🇼 卢旺达','🇧🇮 布隆迪','🇬🇦 加蓬','🇳🇪 尼日尔','🇹🇩 乍得','🇲🇷 毛里塔尼亚','🇩🇯 吉布提','🇰🇲 科摩罗','🇨🇻 佛得角','🇸🇹 圣多美','🇭🇹 海地','🇬🇵 瓜德罗普岛','🇲🇶 马提尼克岛','🇷🇪 留尼旺岛','🇬🇫 法属圭亚那','🇵🇫 法属波利尼西亚','🇱🇺 卢森堡','🇳🇨 新喀里多尼亚','🇵🇲 圣皮埃尔','🇨🇫 中非共和国','🇸🇨 塞舌尔','🇾🇹 马约特','🇦🇺 澳大利亚','🇳🇿 新西兰','🇮🇪 爱尔兰','🇰🇪 肯尼亚','🇹🇿 坦桑尼亚','🇺🇬 乌干达','🇿🇦 南非','🇿🇼 津巴布韦','🇿🇲 赞比亚','🇲🇼 马拉维','🇧🇼 博茨瓦纳','🇳🇦 纳米比亚','🇸🇱 塞拉利昂','🇱🇷 利比里亚','🇬🇲 冈比亚','🇵🇭 菲律宾','🇸🇬 新加坡','🇵🇰 巴基斯坦','🇧🇩 孟加拉国','🇱🇰 斯里兰卡','🇯🇲 牙买加','🇹🇹 特立尼达','🇧🇧 巴巴多斯','🇬🇾 圭亚那','🇲🇹 马耳他','🇪🇹 埃塞俄比亚','🇸🇸 南苏丹','🇪🇷 厄立特里亚','🇦🇷 阿根廷','🇵🇪 秘鲁','🇻🇪 委内瑞拉','🇨🇱 智利','🇪🇨 厄瓜多尔','🇬🇹 危地马拉','🇨🇺 古巴','🇧🇴 玻利维亚','🇩🇴 多米尼加共和国','🇭🇳 洪都拉斯','🇵🇾 巴拉圭','🇸🇻 萨尔瓦多','🇳🇮 尼加拉瓜','🇨🇷 哥斯达黎加','🇵🇦 巴拿马','🇺🇾 乌拉圭','🇵🇷 波多黎各','🇸🇦 沙特阿拉伯','🇦🇪 阿联酋','🇮🇶 伊拉克','🇸🇾 叙利亚','🇯🇴 约旦','🇾🇪 也门','🇵🇸 巴勒斯坦','🇶🇦 卡塔尔','🇧🇭 巴林','🇰🇼 科威特','🇴🇲 阿曼','🇱🇾 利比亚','🇸🇩 苏丹','🇸🇴 索马里','🇳🇵 尼泊尔','🇫🇯 斐济','🇹🇼 台湾','🇭🇰 香港','🇲🇴 澳门','🇲🇾 马来西亚','🇦🇴 安哥拉','🇲🇿 莫桑比克','🇬🇼 几内亚比绍','🇹🇱 东帝汶','🇬🇧 英国','🇺🇸 美国','🇩🇪 德国','🇪🇸 西班牙','🇮🇹 意大利','🇵🇹 葡萄牙','🇳🇱 荷兰','🇧🇷 巴西','🇲🇽 墨西哥','🇨🇴 哥伦比亚','🇪🇬 埃及','🇨🇩 刚果民主共和国','🇬🇭 加纳','🇳🇬 尼日利亚','🇲🇺 毛里求斯','🇱🇧 黎巴嫩','🇲🇨 摩纳哥','🇦🇹 奥地利','🇬🇷 希腊','🇵🇱 波兰','🇷🇴 罗马尼亚','🇭🇺 匈牙利','🇨🇿 捷克','🇸🇰 斯洛伐克','🇸🇪 瑞典','🇳🇴 挪威','🇩🇰 丹麦','🇫🇮 芬兰','🇷🇺 俄罗斯','🇺🇦 乌克兰','🇹🇷 土耳其','🇮🇷 伊朗','🇮🇱 以色列','🇮🇳 印度','🇨🇳 中国','🇯🇵 日本','🇰🇷 韩国','🇻🇳 越南','🇮🇩 印度尼西亚','🇹🇭 泰国','🇰🇭 柬埔寨','🇱🇦 老挝','🇲🇲 缅甸','🇲🇳 蒙古','🇧🇹 不丹','🇲🇻 马尔代夫','🇧🇳 文莱','🇦🇲 亚美尼亚','🇬🇪 格鲁吉亚','🇦🇿 阿塞拜疆','🇰🇿 哈萨克斯坦','🇺🇿 乌兹别克斯坦','🇦🇫 阿富汗','🇰🇬 吉尔吉斯斯坦','🇹🇯 塔吉克斯坦','🇹🇲 土库曼斯坦','🇵🇬 巴布亚新几内亚','🇸🇧 所罗门群岛','🇻🇺 瓦努阿图','🇼🇸 萨摩亚','🇹🇴 汤加','🇱🇨 圣卢西亚','🇻🇨 圣文森特','🇬🇩 格林纳达','🇦🇬 安提瓜','🇰🇳 圣基茨','🇩🇲 多米尼克','🇧🇿 伯利兹','🇧🇸 巴哈马','🇬🇶 赤道几内亚','其他'],
  pt:['Não especificado','🇫🇷 França','🇧🇪 Bélgica','🇨🇭 Suíça','🇨🇦 Canadá','🇲🇦 Marrocos','🇩🇿 Argélia','🇹🇳 Tunísia','🇸🇳 Senegal','🇨🇮 Costa do Marfim','🇨🇲 Camarões','🇨🇬 Congo','🇧🇯 Benim','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guiné','🇲🇬 Madagascar','🇷🇼 Ruanda','🇧🇮 Burundi','🇬🇦 Gabão','🇳🇪 Níger','🇹🇩 Chade','🇲🇷 Mauritânia','🇩🇯 Djibuti','🇰🇲 Comores','🇨🇻 Cabo Verde','🇸🇹 São Tomé','🇭🇹 Haiti','🇬🇵 Guadalupe','🇲🇶 Martinica','🇷🇪 Reunião','🇬🇫 Guiana Francesa','🇵🇫 Polinésia','🇱🇺 Luxemburgo','🇳🇨 Nova Caledônia','🇵🇲 Saint-Pierre','🇨🇫 República Centro-Africana','🇸🇨 Seychelles','🇾🇹 Maiote','🇦🇺 Austrália','🇳🇿 Nova Zelândia','🇮🇪 Irlanda','🇰🇪 Quênia','🇹🇿 Tanzânia','🇺🇬 Uganda','🇿🇦 África do Sul','🇿🇼 Zimbábue','🇿🇲 Zâmbia','🇲🇼 Malawi','🇧🇼 Botsuana','🇳🇦 Namíbia','🇸🇱 Serra Leoa','🇱🇷 Libéria','🇬🇲 Gâmbia','🇵🇭 Filipinas','🇸🇬 Singapura','🇵🇰 Paquistão','🇧🇩 Bangladesh','🇱🇰 Sri Lanka','🇯🇲 Jamaica','🇹🇹 Trinidad e Tobago','🇧🇧 Barbados','🇬🇾 Guiana','🇲🇹 Malta','🇪🇹 Etiópia','🇸🇸 Sudão do Sul','🇪🇷 Eritreia','🇦🇷 Argentina','🇵🇪 Peru','🇻🇪 Venezuela','🇨🇱 Chile','🇪🇨 Equador','🇬🇹 Guatemala','🇨🇺 Cuba','🇧🇴 Bolívia','🇩🇴 República Dominicana','🇭🇳 Honduras','🇵🇾 Paraguai','🇸🇻 El Salvador','🇳🇮 Nicarágua','🇨🇷 Costa Rica','🇵🇦 Panamá','🇺🇾 Uruguai','🇵🇷 Porto Rico','🇸🇦 Arábia Saudita','🇦🇪 Emirados Árabes','🇮🇶 Iraque','🇸🇾 Síria','🇯🇴 Jordânia','🇾🇪 Iêmen','🇵🇸 Palestina','🇶🇦 Catar','🇧🇭 Barein','🇰🇼 Kuwait','🇴🇲 Omã','🇱🇾 Líbia','🇸🇩 Sudão','🇸🇴 Somália','🇳🇵 Nepal','🇫🇯 Fiji','🇹🇼 Taiwan','🇭🇰 Hong Kong','🇲🇴 Macau','🇲🇾 Malásia','🇦🇴 Angola','🇲🇿 Moçambique','🇬🇼 Guiné-Bissau','🇹🇱 Timor-Leste','🇬🇧 Reino Unido','🇺🇸 Estados Unidos','🇩🇪 Alemanha','🇪🇸 Espanha','🇮🇹 Itália','🇵🇹 Portugal','🇳🇱 Países Baixos','🇧🇷 Brasil','🇲🇽 México','🇨🇴 Colômbia','🇪🇬 Egito','🇨🇩 Congo RDC','🇬🇭 Gana','🇳🇬 Nigéria','🇲🇺 Maurício','🇱🇧 Líbano','🇲🇨 Mônaco','🇦🇹 Áustria','🇬🇷 Grécia','🇵🇱 Polônia','🇷🇴 Romênia','🇭🇺 Hungria','🇨🇿 República Checa','🇸🇰 Eslováquia','🇸🇪 Suécia','🇳🇴 Noruega','🇩🇰 Dinamarca','🇫🇮 Finlândia','🇷🇺 Rússia','🇺🇦 Ucrânia','🇹🇷 Turquia','🇮🇷 Irã','🇮🇱 Israel','🇮🇳 Índia','🇨🇳 China','🇯🇵 Japão','🇰🇷 Coreia do Sul','🇻🇳 Vietnã','🇮🇩 Indonésia','🇹🇭 Tailândia','🇰🇭 Camboja','🇱🇦 Laos','🇲🇲 Myanmar','🇲🇳 Mongólia','🇧🇹 Butão','🇲🇻 Maldivas','🇧🇳 Brunei','🇦🇲 Armênia','🇬🇪 Geórgia','🇦🇿 Azerbaijão','🇰🇿 Cazaquistão','🇺🇿 Uzbequistão','🇦🇫 Afeganistão','🇰🇬 Quirguistão','🇹🇯 Tajiquistão','🇹🇲 Turcomenistão','🇵🇬 Papua Nova Guiné','🇸🇧 Ilhas Salomão','🇻🇺 Vanuatu','🇼🇸 Samoa','🇹🇴 Tonga','🇱🇨 Santa Lúcia','🇻🇨 São Vicente','🇬🇩 Granada','🇦🇬 Antígua','🇰🇳 São Cristóvão','🇩🇲 Dominica','🇧🇿 Belize','🇧🇸 Bahamas','🇬🇶 Guiné Equatorial','Outro'],
};
var COUNTRIES_VALUES=['','fr','be','ch','ca','ma','dz','tn','sn','ci','cm','cg','bj','tg','bf','ml','gn','mg','rw','bi','ga','ne','td','mr','dj','km','cv','st','ht','gp','mq','re','gf','pf','lu','nc','pm','cf','sc','yt','au','nz','ie','ke','tz','ug','za','zw','zm','mw','bw','na','sl','lr','gm','ph','sg','pk','bd','lk','jm','tt','bb','gy','mt','et','ss','er','ar','pe','ve','cl','ec','gt','cu','bo','do','hn','py','sv','ni','cr','pa','uy','pr','sa','ae','iq','sy','jo','ye','ps','qa','bh','kw','om','ly','sd','so','np','fj','tw','hk','mo','my','ao','mz','gw','tl','gb','us','de','es','it','pt','nl','br','mx','co','eg','cd','gh','ng','mu','lb','mc','at','gr','pl','ro','hu','cz','sk','se','no','dk','fi','ru','ua','tr','ir','il','in','cn','jp','kr','vn','id','th','kh','la','mm','mn','bt','mv','bn','am','ge','az','kz','uz','af','kg','tj','tm','pg','sb','vu','ws','to','lc','vc','gd','ag','kn','dm','bz','bs','gq','other'];

function _normStr(s){
  return s.replace(/[\uD83C][\uDDE6-\uDDFF]/g,'').replace(/[\uD83C][\uDDE6-\uDDFF]/g,'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
}
function buildCountrySelect(selId,currentVal){
  var sel=document.getElementById(selId);
  if(!sel) return;
  var labels=COUNTRIES[appLang]||COUNTRIES.fr;
  var first={label:labels[0],value:''};
  var rest=[];
  for(var i=1;i<labels.length;i++) rest.push({label:labels[i],value:COUNTRIES_VALUES[i]||labels[i]});
  rest.sort(function(a,b){return _normStr(a.label).localeCompare(_normStr(b.label));});
  var pairs=[first].concat(rest);
  var wrap=sel.parentElement;
  if(wrap&&!wrap.querySelector('.country-search')){
    var si=document.createElement('input');
    si.type='text';si.className='country-search';si.autocomplete='off';
    si.placeholder=t('countrySearchPlaceholder')||'\uD83D\uDD0D Rechercher\u2026';
    wrap.insertBefore(si,sel);
    si.addEventListener('input',function(){
      var q=_normStr(si.value);
      var opts=sel.options;
      for(var oi=0;oi<opts.length;oi++){
        if(oi===0){opts[oi].style.display='';continue;}
        opts[oi].style.display=(!q||_normStr(opts[oi].textContent).indexOf(q)!==-1)?'':'none';
      }
    });
  }
  while(sel.firstChild) sel.removeChild(sel.firstChild);
  pairs.forEach(function(p){
    var opt=document.createElement('option');
    opt.value=p.value;
    opt.textContent=p.label;
    if(p.value===currentVal||p.label===currentVal) opt.selected=true;
    sel.appendChild(opt);
  });
}

function _fillMonthSelect(sel, useShort, addBlank){
  if(!sel||!sel.appendChild) return;
  var current=sel.value;
  var months=I18N[appLang]&&I18N[appLang].months?I18N[appLang].months:I18N.fr.months;
  var monthsShort=I18N[appLang]&&I18N[appLang].monthsShort?I18N[appLang].monthsShort:I18N.fr.monthsShort;
  var names=useShort?monthsShort:months;
  while(sel.firstChild) sel.removeChild(sel.firstChild);
  if(addBlank){
    var blank=document.createElement('option');
    blank.value='';
    blank.textContent=t('monthLabel');
    sel.appendChild(blank);
  }
  for(var mi=0;mi<12;mi++){
    var opt=document.createElement('option');
    opt.value=mi+1;
    opt.textContent=names[mi];
    sel.appendChild(opt);
  }
  if(current) sel.value=current;
}
function buildMonthSelect(){
  _fillMonthSelect(document.getElementById('em-month'), false, true);
  _fillMonthSelect(document.getElementById('inp-month'), true, false);
  _fillMonthSelect(document.getElementById('ob-month'), true, false);
}

function getOrCreateUID(){
  var k='bdg16_uid';
  var uid=localStorage.getItem(k);
  if(!uid){
    var arr=new Uint32Array(2);
    crypto.getRandomValues(arr);
    uid='u-'+arr[0].toString(36)+arr[1].toString(36);
    localStorage.setItem(k,uid);
  }
  return uid;
}

function initUID(){
  getOrCreateUID();
}

function buildCats(){
  var sel=document.getElementById('inp-type');
  if(!sel) return;
  var cats=[['birthday',t('evtBirthday')||'Anniversaire'],['wedding','Mariage'],['work','Entrée entreprise'],['custom','Autre']];
  var cur=sel.value||'birthday';
  sel.innerHTML='';
  cats.forEach(function(c){
    var opt=document.createElement('option');
    opt.value=c[0];
    opt.textContent=c[1];
    if(c[0]===cur) opt.selected=true;
    sel.appendChild(opt);
  });
}