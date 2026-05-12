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
  fr:['Non précisé','🇫🇷 France','🇧🇪 Belgique','🇨🇭 Suisse','🇨🇦 Canada','🇲🇦 Maroc','🇩🇿 Algérie','🇹🇳 Tunisie','🇸🇳 Sénégal','🇨🇮 Côte d\'Ivoire','🇨🇲 Cameroun','🇨🇬 Congo','🇧🇯 Bénin','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guinée','🇲🇬 Madagascar','🇷🇼 Rwanda','🇧🇮 Burundi','🇬🇦 Gabon','🇳🇪 Niger','🇹🇩 Tchad','🇲🇷 Mauritanie','🇩🇯 Djibouti','🇰🇲 Comores','🇨🇻 Cap-Vert','🇸🇹 São Tomé','🇭🇹 Haïti','🇬🇵 Guadeloupe','🇲🇶 Martinique','🇷🇪 Réunion','🇬🇫 Guyane','🇵🇫 Polynésie','Autre'],
  en:['Not specified','🇫🇷 France','🇧🇪 Belgium','🇨🇭 Switzerland','🇨🇦 Canada','🇲🇦 Morocco','🇩🇿 Algeria','🇹🇳 Tunisia','🇸🇳 Senegal','🇨🇮 Ivory Coast','🇨🇲 Cameroon','🇨🇬 Congo','🇧🇯 Benin','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guinea','🇲🇬 Madagascar','🇷🇼 Rwanda','🇧🇮 Burundi','🇬🇦 Gabon','🇳🇪 Niger','🇹🇩 Chad','🇲🇷 Mauritania','🇩🇯 Djibouti','🇰🇲 Comoros','🇨🇻 Cape Verde','🇸🇹 São Tomé','🇭🇹 Haiti','🇬🇵 Guadeloupe','🇲🇶 Martinique','🇷🇪 Réunion','🇬🇫 French Guiana','🇵🇫 Polynesia','Other'],
  es:['No especificado','🇫🇷 Francia','🇧🇪 Bélgica','🇨🇭 Suiza','🇨🇦 Canadá','🇲🇦 Marruecos','🇩🇿 Argelia','🇹🇳 Túnez','🇸🇳 Senegal','🇨🇮 Costa de Marfil','🇨🇲 Camerún','🇨🇬 Congo','🇧🇯 Benín','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Malí','🇬🇳 Guinea','🇲🇬 Madagascar','🇷🇼 Ruanda','🇧🇮 Burundi','🇬🇦 Gabón','🇳🇪 Níger','🇹🇩 Chad','🇲🇷 Mauritania','🇩🇯 Yibuti','🇰🇲 Comoras','🇨🇻 Cabo Verde','🇸🇹 Santo Tomé','🇭🇹 Haití','🇬🇵 Guadalupe','🇲🇶 Martinica','🇷🇪 Reunión','🇬🇫 Guayana Francesa','🇵🇫 Polinesia','Otro'],
  ar:['غير محدد','🇫🇷 فرنسا','🇧🇪 بلجيكا','🇨🇭 سويسرا','🇨🇦 كندا','🇲🇦 المغرب','🇩🇿 الجزائر','🇹🇳 تونس','🇸🇳 السنغال','🇨🇮 ساحل العاج','🇨🇲 الكاميرون','🇨🇬 الكونغو','🇧🇯 بنين','🇹🇬 توغو','🇧🇫 بوركينا فاسو','🇲🇱 مالي','🇬🇳 غينيا','🇲🇬 مدغشقر','🇷🇼 رواندا','🇧🇮 بوروندي','🇬🇦 الغابون','🇳🇪 النيجر','🇹🇩 تشاد','🇲🇷 موريتانيا','🇩🇯 جيبوتي','🇰🇲 جزر القمر','🇨🇻 الرأس الأخضر','🇸🇹 ساو تومي','🇭🇹 هايتي','🇬🇵 غوادلوب','🇲🇶 مارتينيك','🇷🇪 ريونيون','🇬🇫 غيانا الفرنسية','🇵🇫 بولينيزيا','أخرى'],
  hi:['निर्दिष्ट नहीं','🇫🇷 फ्रांस','🇧🇪 बेल्जिम','🇨🇭 स्विट्जरलैंड','🇨🇦 कनाडा','🇲🇦 मोरक्को','🇩🇿 अल्जीरिया','🇹🇳 ट्यूनीशिया','🇸🇳 सेनेगल','🇨🇮 आइवरी कोस्ट','🇨🇲 कैमरून','🇨🇬 कांगो','🇧🇯 बेनिन','🇹🇬 टोगो','🇧🇫 बुर्किना फासो','🇲🇱 माली','🇬🇳 गिनी','🇲🇬 मेडागास्कर','🇷🇼 रवांडा','🇧🇮 बुरुंडी','🇬🇦 गैबॉन','🇳🇪 नाइजर','🇹🇩 चाड','🇲🇷 मॉरिटानिया','🇩🇯 जिबूती','🇰🇲 कोमोरोस','🇨🇻 केप वर्दे','🇸🇹 साओ टोमे','🇭🇹 हैती','🇬🇵 ग्वाडेलूप','🇲🇶 मार्टिनिक','🇷🇪 रीयूनियन','🇬🇫 फ्रेंच गुयाना','🇵🇫 पोलिनेशिया','अन्य'],
  zh:['未指定','🇫🇷 法国','🇧🇪 比利时','🇨🇭 瑞士','🇨🇦 加拿大','🇲🇦 摩洛哥','🇩🇿 阿尔及利亚','🇹🇳 突尼斯','🇸🇳 塞内加尔','🇨🇮 科特迪瓦','🇨🇲 喀麦隆','🇨🇬 刚果','🇧🇯 贝宁','🇹🇬 多哥','🇧🇫 布基纳法索','🇲🇱 马里','🇬🇳 几内亚','🇲🇬 马达加斯加','🇷🇼 卢旺达','🇧🇮 布隆迪','🇬🇦 加蓬','🇳🇪 尼日尔','🇹🇩 乍得','🇲🇷 毛里塔尼亚','🇩🇯 吉布提','🇰🇲 科摩罗','🇨🇻 佛得角','🇸🇹 圣多美','🇭🇹 海地','🇬🇵 瓜德罗普岛','🇲🇶 马提尼克岛','🇷🇪 留尼旺岛','🇬🇫 法属圭亚那','🇵🇫 法属波利尼西亚','其他'],
  pt:['Não especificado','🇫🇷 França','🇧🇪 Bélgica','🇨🇭 Suíça','🇨🇦 Canadá','🇲🇦 Marrocos','🇩🇿 Argélia','🇹🇳 Tunísia','🇸🇳 Senegal','🇨🇮 Costa do Marfim','🇨🇲 Camarões','🇨🇬 Congo','🇧🇯 Benim','🇹🇬 Togo','🇧🇫 Burkina Faso','🇲🇱 Mali','🇬🇳 Guiné','🇲🇬 Madagascar','🇷🇼 Ruanda','🇧🇮 Burundi','🇬🇦 Gabão','🇳🇪 Níger','🇹🇩 Chade','🇲🇷 Mauritânia','🇩🇯 Djibuti','🇰🇲 Comores','🇨🇻 Cabo Verde','🇸🇹 São Tomé','🇭🇹 Haiti','🇬🇵 Guadalupe','🇲🇶 Martinica','🇷🇪 Reunião','🇬🇫 Guiana Francesa','🇵🇫 Polinésia','Outro'],
};
var COUNTRIES_VALUES=['','fr','be','ch','ca','ma','dz','tn','sn','ci','cm','cg','bj','tg','bf','ml','gn','mg','rw','bi','ga','ne','td','mr','dj','km','cv','st','ht','gp','mq','re','gf','pf','other'];

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

function buildMonthSelect(){
  var sel=document.getElementById('em-month');
  if(!sel||!sel.appendChild) return;
  var current=sel.value;
  sel.innerHTML='<option value="">'+t('monthLabel')+'</option>';
  var months=I18N[appLang]&&I18N[appLang].months?I18N[appLang].months:I18N.fr.months;
  for(var mi=0;mi<12;mi++){
    var opt=document.createElement('option');
    opt.value=mi+1;
    opt.textContent=months[mi];
    sel.appendChild(opt);
  }
  if(current) sel.value=current;
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