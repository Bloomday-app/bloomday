async function load(){
  groups=await gg('bdg16_groups',[]);
  var _defNames=['Mon groupe','My group','Mi grupo','\u0645\u062c\u0645\u0648\u0639\u062a\u064a','\u092e\u0947\u0930\u093e \u0938\u092e\u0942\u0939','\u6211\u7684\u7fa4\u7ec4','Meu grupo'];
  var _migrated=false;
  groups.forEach(function(g){if(!g.isDefault&&_defNames.indexOf(g.name)!==-1){g.isDefault=true;_migrated=true;}});
  if(_migrated)sg('bdg16_groups',groups);
  if(!groups.length)groups=[{id:'g1',name:mode==='biz'?'Mon équipe':t('myGroup'),icon:mode==='biz'?'💼':'🌸',members:[],isDefault:mode!=='biz'}];
  admins=await gg('bdg16_admins',[]);
  hist=await gg('bdg16_hist',{});
  stats=await gg('bdg16_stats',{});
  profile=await gg('bdg16_profile',{});
  favs=await gg('bdg16_favs',[]);
  utpls=await gg('bdg16_tpls',[]);
  ['totalSent','totalGen','refs','celeb','msgsM'].forEach(k=>{if(!stats[k])stats[k]=0;});
  if(!profile.live)profile.live='fr';
  if(!profile.religion)profile.religion='christian';
  buildCats();
  initUID();
  initLang();
  if(typeof applyDarkMode==='function')applyDarkMode();
  refresh();
}

function startApp(m,p){
  mode=m;
  var chosenPlan=p||'free';
  var savedPlan=localStorage.getItem('bdg16_plan');
  var planOrder={free:0,bloom:1,pro:2,enterprise:3};
  // Restaurer le plan payant uniquement si supérieur au choix actuel (utilisateur déjà abonné)
  plan=(savedPlan&&PLANS[savedPlan]&&(planOrder[savedPlan]||0)>(planOrder[chosenPlan]||0))?savedPlan:chosenPlan;
  var landEl=document.getElementById('land');if(landEl)landEl.style.display='none';
  var tbp=document.getElementById('tbplan');
  if(tbp)tbp.textContent=((PLANS[plan]&&PLANS[plan].name)||'Free')+' ▾';
  loadUser();
  initAuth();
  var firstLaunch=!localStorage.getItem('bdg16_ob');
  if(firstLaunch){
    var obs=document.getElementById('ob-screen');if(obs)obs.classList.add('on');
    load().then(function(){checkPushNeeded();startOnboarding();});
  } else {
    var app=document.getElementById('app');if(app)app.classList.add('on');
    load().then(function(){checkPushNeeded();});
  }
  (function(){
    var av=document.getElementById('dsb-avatar');
    if(!av)return;
    var u=null;try{u=JSON.parse(localStorage.getItem('bdg16_user'));}catch(e){}
    if(u&&u.photo){av.innerHTML='<img src="'+u.photo+'" alt="">';}
    else if(u&&u.name){av.textContent=(u.name.split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2)||'🌸').toUpperCase();}
  })();
}

// ── AXE 1 : ONBOARDING MAGIQUE ──
async function startOnboarding(){
  var demoEl=document.getElementById('demo-ai-msg');
  var demoName=document.getElementById('ob-name');
  var demoAge=document.getElementById('demo-age');
  var demoNote=document.getElementById('ob-note');
  var demoDate=document.getElementById('ob-day');

  // Remplir les champs avec une animation d'écriture
  var today=new Date();
  var demoMember={
    name:'Léa Martin',
    day:today.getDate(),
    month:today.getMonth()+1,
    year:1992,
    note:t('obDemoNote'),
    type:'birthday'
  };

  // Animer l'écriture du prénom
  async function typeText(el, text, speed){
    if(!el) return;
    el.value='';
    for(var i=0;i<text.length;i++){
      el.value+=text[i];
      await new Promise(function(r){setTimeout(r,speed);});
    }
  }

  // Afficher le fallback immédiatement (avant les animations)
  var fallbackMsg = 'Léa, en ce jour si particulier, toute notre communauté se joint à moi pour te souhaiter un anniversaire aussi épanoui que tu l\'es. Que cette nouvelle année t\'apporte des fleurs plein les bras et du bonheur à chaque instant ! 🌸✨';
  if(demoEl){
    demoEl.innerHTML='<div class="ob-msg">'+esc(fallbackMsg)+'</div>'+'<div style="display:flex;gap:8px;margin-top:12px">'+'<button class="btn G fw" onclick="copyObMsg()">'+t('obCopyBtn2')+'</button>'+'<button class="btn sm" onclick="regenObMsg()">'+t('obRetryBtn2')+'</button>'+'</div>';
    window.__obFallback=fallbackMsg;
  }

  // Animer l'écriture dans les champs ob1 (en arrière-plan)
  var obName=document.getElementById('ob-name');
  var obDay=document.getElementById('ob-day');
  var obMonth=document.getElementById('ob-month');
  var obYear=document.getElementById('ob-year');
  var obNote=document.getElementById('ob-note');
  if(obName) await typeText(obName,t('namePlaceholder')||'Léa Martin',60);
  if(obDay) await typeText(obDay,''+today.getDate(),80);
  if(obMonth) await typeText(obMonth,''+(today.getMonth()+1),80);
  if(obYear) await typeText(obYear,'1992',60);
  if(obNote) await typeText(obNote,t('obDemoNote'),30);

  // Tenter l'API IA en arrière-plan
  try{
    var resp=await fetch("/.netlify/functions/generate-message",{
      method:"POST",
      headers:await getAuthHeaders(),
      body:JSON.stringify({prompt:"Génère en "+(window.__aiLang||'français')+" un message d'anniversaire chaleureux et personnalisé pour Léa (33 ans aujourd'hui, aime les fleurs et le chocolat). Maximum 3 phrases. Sans majuscule de début, commence directement par quelque chose de chaleureux.",plan:plan})
    });
    if(resp.ok){
      var data=await resp.json();
      var aiMsg=data.message||fallbackMsg;
      window.__obAiMsg=aiMsg;
      if(demoEl){
        demoEl.innerHTML='<div class="ob-msg">'+esc(aiMsg)+'</div>'+
          '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button class="btn G fw" onclick="copyObMsg()">'+t('obCopyBtn2')+'</button>'+
          '<button class="btn sm" onclick="regenObMsg()">'+t('obRetryBtn2')+'</button>'+
          '</div>';
      }
    }
  } catch(e){
    // Fallback déjà affiché — pas d'action nécessaire
    console.log('IA indisponible — fallback affiché');
  }
}

function copyObMsg(){
  var msg=window.__obAiMsg||window.__obFallback||'';
  if(!msg) return;
  navigator.clipboard.writeText(msg).then(function(){
    showToast(t('copied'),'success');
  }).catch(function(){
    showToast(msg.substring(0,50)+'...','success');
  });
  stats.msgsM++;
}

async function regenObMsg(){
  var demoEl=document.getElementById('demo-ai-msg');
  if(!demoEl) return;
  demoEl.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt2)"><div class="ld"></div></div>';
  try{
    var resp=await fetch("/.netlify/functions/generate-message",{
      method:"POST",
      headers:await getAuthHeaders(),
      body:JSON.stringify({prompt:"Génère en "+(window.__aiLang||'français')+" un NOUVEAU message d'anniversaire différent pour Léa (33 ans, aime les fleurs et le chocolat). Maximum 3 phrases. Commence par quelque chose d'original.",plan:plan})
    });
    if(!resp.ok) throw new Error('Erreur serveur');
    var data=await resp.json();
    var aiMsg=data.message||window.__obFallback;
    window.__obAiMsg=aiMsg;
    demoEl.innerHTML='<div class="ob-msg">'+esc(aiMsg)+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px">'+
      '<button class="btn G fw" onclick="copyObMsg()">'+t('obCopyBtn2')+'</button>'+
      '<button class="btn sm" onclick="regenObMsg()">'+t('obRetryBtn2')+'</button>'+
      '</div>';
  } catch(e){
    var fallbacks=['Léa, que cette journée soit aussi lumineuse que ton sourire ! Joyeux anniversaire 🌸','Les 33 ans te vont à merveille ! Profite de chaque pétale de cette journée. 🌺'];
    var msg=fallbacks[Math.floor(Math.random()*fallbacks.length)];
    window.__obAiMsg=msg;
    demoEl.innerHTML='<div class="ob-msg">'+esc(msg)+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px">'+
      '<button class="btn G fw" onclick="copyObMsg()">'+t('obCopyBtn2')+'</button>'+
      '<button class="btn sm" onclick="regenObMsg()">'+t('retryBtn')+'</button>'+
      '</div>';
  }
}

function obNext(){
  obStep++;
  if(obStep===1){
    document.getElementById('ob0').style.display='none';
    document.getElementById('ob1').style.display='block';
    document.getElementById('obs0').classList.replace('on','done');
    document.getElementById('obs1').classList.add('on');
  }
}
async function obAddMember(){
  const name=(document.getElementById('ob-name').value||'').trim();
  const day=parseInt(document.getElementById('ob-day').value)||0;
  const month=parseInt(document.getElementById('ob-month').value)||0;
  if(!name||!day||!month){alert(t('requiredFields'));return;}
  // Ajouter dans le premier groupe
  if(!groups.length)groups=[{id:'g1',name:t('myGroup'),icon:'🌸',members:[],isDefault:true}];
  const nm={id:Date.now(),day,month,year:null,name,phone:'',note:'',photo:'',type:'birthday',gender:''};
  groups[0].members.push(nm);
  saveG();
  // Passer au step 2
  obStep=2;
  document.getElementById('ob1').style.display='none';
  document.getElementById('ob2').style.display='block';
  document.getElementById('obs1').classList.replace('on','done');
  document.getElementById('obs2').classList.add('on');
  document.getElementById('ob2-name').textContent=name.split(' ')[0];
  // Afficher un fallback immédiatement, puis tenter l'IA
  const msgEl=document.getElementById('ob2-msg');
  const isTod=isToday(day,month);
  const ob2Fallback=getFallback('birthday');
  msgEl.innerHTML='<div style="font-size:13px;line-height:1.8;color:var(--b4d)">'+esc(ob2Fallback)+'</div>'+'<div class="brow" style="margin-top:10px"><button class="btn sm G" onclick="copyMsgCached(this,\''+_c(ob2Fallback)+'\')">📋 Copier</button></div>';
  try{
    const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:await getAuthHeaders(),body:JSON.stringify({prompt:"Génère un message d'anniversaire chaleureux pour "+name+(isTod?" dont c'est l'anniversaire aujourd'hui!":".")+". Ton : chaleureux, festif, sincère. 3-4 phrases. Commence directement par le message.",plan:plan})});
    if(resp.ok){const data=await resp.json();const text=data.message||'';if(text)msgEl.innerHTML='<div style="font-size:13px;font-weight:600;color:var(--b4d);margin-bottom:8px">✨ Message généré pour '+esc(name.split(' ')[0])+' :</div><div style="font-size:13px;line-height:1.8;color:var(--b4d)">'+esc(text)+'</div><div class="brow" style="margin-top:10px"><button class="btn sm G" onclick="copyMsgCached(this,\''+_c(text)+'\')">📋 Copier</button></div>';}
  }catch(e){}
}
function finishOb(){
  safeLsSet('bdg16_ob','1');
  document.getElementById('ob-screen').classList.remove('on');
  document.getElementById('app').classList.add('on');
  requestPush();
  refresh();
}
function skipOb(){
  safeLsSet('bdg16_ob','1');
  document.getElementById('ob-screen').classList.remove('on');
  document.getElementById('app').classList.add('on');
  load();
}

// ── AXE 8 : PLAN SELECTOR ──
// Plans : carrousel de cartes scrollables (adaptatif iOS/Android/iPad/desktop)
function renderMobilePlanCards(){
  var el=document.getElementById('mobile-plan-cards');if(!el)return;
  var plans=[
    {key:'free',name:'Starter',pop:false,price:'0\u20AC',period:t('planForever'),
     feats:[t('planFeatMem10'),t('planFeat1Group'),t('planFeatMsg5')],
     cta:t('planCTAfree'),free:true},
    {key:'bloom',name:'\u2B50 Bloom',pop:true,price:'4,99\u20AC',period:t('perMonth'),
     feats:[t('planFeatMemUnlim'),t('planFeat5Groups'),t('planFeatMsgUnlim'),t('planFeatGiftsYes')],
     cta:t('planCTAtry'),free:false},
    {key:'pro',name:'\uD83C\uDFE2 Business',pop:false,price:'19,99\u20AC',period:t('perMonth'),
     feats:[t('planFeat50Collab'),t('planFeatGroupUnlim'),t('planFeatCSV')],
     cta:t('planCTAbiz'),free:false},
  ];
  var html='';
  plans.forEach(function(p){
    html+='<div class="pcard'+(p.pop?' pop':'')+'">';
    html+='<div style="font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">'+p.name+'</div>';
    html+='<div style="margin-bottom:8px"><span class="price-font">'+p.price+'</span><span style="font-size:13px;color:var(--txt2)"> '+p.period+'</span></div>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">';
    p.feats.forEach(function(f){html+='<span class="ft ok">\u2713 '+f+'</span>';});
    html+='</div>';
    if(p.free){
      html+='<button class="lcta F" onclick="openAuth(\'signup\')">'+p.cta+'</button>';
    }else{
      html+='<button class="lcta P" data-plan="'+p.key+'" onclick="openPaymentFromBtn(this)" style="width:100%">'+p.cta+'</button>';
    }
    html+='</div>';
  });
  el['\x69\x6e\x6e\x65\x72\x48\x54\x4d\x4c']=html;
}

function renderPricingTable(){
  var el=document.getElementById('pricing-table-container');if(!el)return;

  // Mobile : grille features + cartes plans
  var feats=[
    {i:'\uD83C\uDF38',tk:'feat1Title',dk:'feat1Desc'},{i:'\u2728',tk:'feat2Title',dk:'feat2Desc'},
    {i:'\uD83C\uDF81',tk:'feat3Title',dk:'feat3Desc'},{i:'\uD83C\uDF0D',tk:'feat4Title',dk:'feat4Desc'},
    {i:'\uD83D\uDC8C',tk:'feat5Title',dk:'feat5Desc'},{i:'\uD83D\uDCB0',tk:'feat6Title',dk:'feat6Desc'},
  ];
  var fgrid='<div class="fgrid">';
  feats.forEach(function(f){fgrid+='<div class="fci"><span class="fci-i">'+f.i+'</span><div class="fci-t">'+t(f.tk)+'</div><div class="fci-d">'+t(f.dk)+'</div></div>';});
  fgrid+='</div>';
  var mobileSection='<div class="pricing-mobile" style="padding:0 16px 8px">'
    +fgrid
    +'<div style="font-family:var(--ff-title);font-size:20px;font-weight:700;margin-bottom:10px">'+t('choosePlanTitle')+'</div>'
    +'<div class="plan-sel"><div class="plan-cards" id="mobile-plan-cards"></div>'
    +'<div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:2px">'+t('scrollHintPlans')+'</div>'
    +'</div></div>';

  // Desktop : tableau comparatif
  var rows=[
    {key:'pricingRowMembers', s:'10', bl:t('pricingUnlimited'), bz:'50', en:t('pricingUnlimited')},
    {key:'pricingRowGroups',  s:'1',  bl:'5', bz:t('pricingUnlimited'), en:t('pricingUnlimited')},
    {key:'pricingRowMessages',s:'5',  bl:t('pricingUnlimited'), bz:t('pricingUnlimited'), en:t('pricingUnlimited')},
    {key:'pricingRowGifts',   s:'no', bl:'yes', bz:'yes', en:'yes'},
    {key:'pricingRowCards',   s:'no', bl:'yes', bz:'yes', en:'yes'},
    {key:'pricingRowAdmins',  s:'no', bl:'2',   bz:'5',   en:t('pricingUnlimited')},
    {key:'pricingRowCSV',     s:'no', bl:'no',  bz:'yes', en:'yes'},
    {key:'pricingRowWhiteLabel',s:'no',bl:'no', bz:'no',  en:'yes'},
    {key:'pricingRowAds',     s:'ads',bl:'noads',bz:'noads',en:'noads'},
  ];
  function cellVal(v){
    if(v==='yes') return '<span class="pt-yes">\u2713</span>';
    if(v==='no')  return '<span class="pt-no">\u2717</span>';
    if(v==='ads') return '<span class="pt-ads-yes">'+t('pricingAdsYes')+'</span>';
    if(v==='noads') return '<span class="pt-yes">'+t('pricingAdsNo')+'</span>';
    return '<span class="pt-val">'+v+'</span>';
  }
  function cellBloom(v){
    if(v==='yes') return '<span class="pt-yes">\u2713</span>';
    if(v==='no')  return '<span class="pt-no">\u2717</span>';
    if(v==='noads') return '<span class="pt-yes">'+t('pricingAdsNo')+'</span>';
    return '<span class="pt-val-bloom">'+v+'</span>';
  }
  var bodyRows='';
  rows.forEach(function(r){
    bodyRows+='<tr>'
      +'<td>'+t(r.key)+'</td>'
      +'<td>'+cellVal(r.s)+'</td>'
      +'<td class="col-bloom">'+cellBloom(r.bl)+'</td>'
      +'<td>'+cellVal(r.bz)+'</td>'
      +'<td>'+cellVal(r.en)+'</td>'
      +'</tr>';
  });
  var hero='<div class="pricing-hero">'
    +'<h2>'+t('pricingHeroTitle')+'</h2>'
    +'<p>'+t('pricingHeroSub')+'</p>'
    +'<div class="pricing-badge">\uD83C\uDF38 '+t('heroCta')+'</div>'
    +'<div class="pricing-stats">'
    +'<div><span class="pricing-stat-n">140</span><span class="pricing-stat-l">'+t('pricingStatsPays')+'</span></div>'
    +'<div><span class="pricing-stat-n">7</span><span class="pricing-stat-l">'+t('pricingStatsLangues')+'</span></div>'
    +'<div><span class="pricing-stat-n">IA</span><span class="pricing-stat-l">'+t('pricingStatsAI')+'</span></div>'
    +'</div></div>';
  var thead='<thead><tr>'
    +'<th class="pricing-th-feat"></th>'
    +'<th><span class="pt-badge">Starter</span><span class="pt-price">0\u20AC</span><span class="pt-period">'+t('planForever')+'</span></th>'
    +'<th class="pricing-th-bloom"><span class="pt-badge">\u2B50 Bloom</span><span class="pt-price">4,99\u20AC</span><span class="pt-period">'+t('perMonth')+'</span></th>'
    +'<th><span class="pt-badge">\uD83C\uDFE2 Business</span><span class="pt-price">19,99\u20AC</span><span class="pt-period">'+t('perMonth')+'</span></th>'
    +'<th><span class="pt-badge">Enterprise</span><span class="pt-price">'+t('planPriceOnRequest')+'</span><span class="pt-period"></span></th>'
    +'</tr></thead>';
  var tfoot='<tfoot><tr>'
    +'<td></td>'
    +'<td><button class="pt-cta pt-cta-free" onclick="openAuth(\'signup\')" data-plan="free">'+t('planCTAfree')+'</button></td>'
    +'<td class="col-bloom"><button class="pt-cta pt-cta-bloom" onclick="openPaymentFromBtn(this)" data-plan="bloom">'+t('planCTAtry')+'</button></td>'
    +'<td><button class="pt-cta pt-cta-biz" onclick="openPaymentFromBtn(this)" data-plan="pro">'+t('planCTAbiz')+'</button></td>'
    +'<td><button class="pt-cta pt-cta-ent" onclick="openPaymentFromBtn(this)" data-plan="enterprise">'+t('planCTAcontact')+'</button></td>'
    +'</tr></tfoot>';
  var desktopSection='<div class="pricing-desktop">'
    +hero
    +'<div class="pricing-table-outer">'
    +'<table class="pricing-table">'+thead+'<tbody>'+bodyRows+'</tbody>'+tfoot+'</table>'
    +'</div>'
    +'<div class="pricing-footer">\uD83D\uDD12 RGPD \u00B7 Paiement s\u00E9curis\u00E9 \u00B7 Annulation \u00E0 tout moment</div>'
    +'</div>';

  el['\x69\x6e\x6e\x65\x72\x48\x54\x4d\x4c']=mobileSection+desktopSection;
  renderMobilePlanCards();
}

function renderAllPlans(mode){
  renderMobilePlanCards();
}
function selPlan(){}
function renderPlanDetail(){}


// ── GROUPES ──
var _gcMenuGroupId = null;

// ── NOTIFICATIONS ──
var _adminNotifs = [];
var _adminNotifReads = new Set();
var _criticalNotifId = null;
var _adminSuggestions = [];
function rGbar(){
  const b=document.getElementById('gbar');if(!b)return;
  var _allDefNames=Object.keys(I18N).map(function(lang){return I18N[lang].myGroup;}).filter(Boolean);
  while(b.firstChild) b.removeChild(b.firstChild);
  groups.forEach(function(g){
    var isDef=g.isDefault||_allDefNames.indexOf(g.name)!==-1;
    var btn=document.createElement('button');
    btn.className='gc'+(g.id===curG?' on':'');
    btn.textContent=g.icon+' '+(isDef?t('myGroup'):g.name);
    btn.onclick=function(){switchG(g.id);};
    btn.addEventListener('contextmenu',function(e){e.preventDefault();openGroupMenu(g.id,btn);});
    var _lpt=null;
    btn.addEventListener('touchstart',function(){_lpt=setTimeout(function(){openGroupMenu(g.id,btn);},600);},{passive:true});
    btn.addEventListener('touchend',function(){clearTimeout(_lpt);});
    btn.addEventListener('touchmove',function(){clearTimeout(_lpt);});
    b.appendChild(btn);
  });
  var addBtn=document.createElement('button');
  addBtn.className='gc add';
  addBtn.textContent='＋';
  addBtn.title=t('groupModalTitle')||'Nouveau groupe';
  addBtn.onclick=addGroup;
  b.appendChild(addBtn);
}
function openGroupMenu(groupId,triggerBtn){
  _gcMenuGroupId=groupId;
  var menu=document.getElementById('gc-menu');
  if(!menu)return;
  var rect=triggerBtn.getBoundingClientRect();
  menu.style.left=Math.min(rect.left,window.innerWidth-160)+'px';
  menu.style.top=(rect.bottom+4)+'px';
  menu.style.display='block';
}
function closeGroupMenu(){
  var menu=document.getElementById('gc-menu');
  if(menu)menu.style.display='none';
  _gcMenuGroupId=null;
}
function switchG(id){curG=id;fMonth=0;fType='';searchInput='';searchFiltered=null;editId=null;refresh();}
function addGroup(){
  const pl=PL();
  if(groups.length>=pl.mg){
    alert('Plan '+PLANS[plan].name+' : '+pl.mg+' '+t('groupLimitAlert'));
    return;
  }
  // Ouvrir la modale de création (pas de prompt() → marche sur iOS PWA)
  openOv('mgrp');
  setTimeout(()=>{
    const inp=document.getElementById('grp-name-inp');
    if(inp){inp.value='';inp.focus();}
    // Reset icône sélectionnée
    document.querySelectorAll('.icon-sel').forEach((b,i)=>b.classList.toggle('on',i===0));
  },120);
}
function confirmAddGroup(){
  const inp=document.getElementById('grp-name-inp');
  const n=((inp&&inp.value)||'').trim();
  if(!n){
    if(inp){inp.style.borderColor='var(--b2)';inp.placeholder='← Entrez un nom';inp.focus();}
    setTimeout(()=>{if(inp){inp.style.borderColor='';inp.placeholder='Ex: Famille, Église, Équipe…';}},2000);
    return;
  }
  const selBtn=document.querySelector('.icon-sel.on');
  const icon=selBtn?selBtn.dataset.icon:'🌸';
  groups.push({id:'g'+Date.now(),name:n,icon,members:[]});
  curG=groups[groups.length-1].id;
  saveG();closeOv('mgrp');refresh();
}
function selGrpIcon(btn){
  document.querySelectorAll('.icon-sel').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}
function openRenameGroup(){
  var gid=_gcMenuGroupId;
  closeGroupMenu();
  if(!gid)return;
  _gcMenuGroupId=gid;
  var g=groups.find(function(x){return x.id===_gcMenuGroupId;});
  if(!g)return;
  var inp=document.getElementById('mrename-inp');
  if(inp)inp.value=g.name;
  openOv('mrename');
  setTimeout(function(){var i=document.getElementById('mrename-inp');if(i){i.focus();i.select();}},120);
}
function confirmRenameGroup(){
  if(!_gcMenuGroupId)return;
  var inp=document.getElementById('mrename-inp');
  var n=(inp&&inp.value||'').trim();
  if(!n){if(inp){inp.style.borderColor='var(--b2)';setTimeout(function(){inp.style.borderColor='';},2000);inp.focus();}return;}
  var g=groups.find(function(x){return x.id===_gcMenuGroupId;});
  if(g)g.name=n;
  _gcMenuGroupId=null;
  saveG();closeOv('mrename');refresh();
}
function openDeleteGroup(){
  var gid=_gcMenuGroupId;
  closeGroupMenu();
  if(!gid)return;
  _gcMenuGroupId=gid;
  if(groups.length<=1){alert(t('groupCannotDeleteLast'));return;}
  var g=groups.find(function(x){return x.id===_gcMenuGroupId;});
  if(!g)return;
  var titleEl=document.getElementById('mdelete-title');
  var msgEl=document.getElementById('mdelete-msg');
  var membersEl=document.getElementById('mdelete-members');
  var moveEl=document.getElementById('mdelete-move');
  var targetEl=document.getElementById('mdelete-target');
  if(titleEl)titleEl.textContent=t('groupDeleteTitle')+' « '+g.name+' »';
  var members=g.members||[];
  if(!members.length){
    if(msgEl)msgEl.textContent=t('groupDeleteConfirmEmpty');
    if(membersEl)membersEl.innerHTML='';
    if(moveEl)moveEl.style.display='none';
  }else{
    if(msgEl)msgEl.textContent=t('groupDeleteMembersHeader').replace('%n',members.length);
    if(membersEl){
      membersEl.innerHTML=members.map(function(m){
        var sub=m.day&&m.month?' ('+m.day+'/'+m.month+(m.year?' '+m.year:'')+')':(m.type==='birthday'?'':' ');
        return '<label class="gc-member-row"><input type="checkbox" value="'+String(m.id)+'"> '+esc(m.name)+sub+'</label>';
      }).join('');
      membersEl.onchange=function(){
        if(moveEl)moveEl.style.display=membersEl.querySelectorAll('input:checked').length>0?'block':'none';
      };
    }
    if(targetEl)targetEl.innerHTML=groups.filter(function(x){return x.id!==g.id;}).map(function(x){
      var _allDef=Object.keys(I18N).map(function(l){return I18N[l].myGroup;}).filter(Boolean);
      var isDef=x.isDefault||_allDef.indexOf(x.name)!==-1;
      return '<option value="'+esc(x.id)+'">'+esc(x.icon)+' '+(isDef?esc(t('myGroup')):esc(x.name))+'</option>';
    }).join('');
    if(moveEl)moveEl.style.display='none';
  }
  openOv('mdelete');
}
function confirmDeleteGroup(){
  if(!_gcMenuGroupId)return;
  var gIdx=groups.findIndex(function(x){return x.id===_gcMenuGroupId;});
  if(gIdx===-1)return;
  var g=groups[gIdx];
  var membersEl=document.getElementById('mdelete-members');
  var targetEl=document.getElementById('mdelete-target');
  if(membersEl&&targetEl){
    var checked=membersEl.querySelectorAll('input:checked');
    if(checked.length>0){
      var targetGroup=groups.find(function(x){return x.id===targetEl.value;});
      if(targetGroup){
        checked.forEach(function(cb){
          var m=g.members&&g.members.find(function(x){return String(x.id)===cb.value;});
          if(m)targetGroup.members.push(m);
        });
      }
    }
  }
  if(curG===_gcMenuGroupId)curG=groups[gIdx===0?1:0].id;
  groups.splice(gIdx,1);
  _gcMenuGroupId=null;
  saveG();closeOv('mdelete');refresh();
}

// ── TOPBAR ──
function updateTopbar(){const e=document.getElementById('tbdate');if(e)e.textContent=formatDateLocal(new Date());}

// ── REFERRAL ──
async function ensureRefCode(){
  if(stats.code)return stats.code;
  var uid=currentUser&&currentUser.uid;
  if(!uid)return null;
  var a=new Uint32Array(1);crypto.getRandomValues(a);
  stats.code='BLD-'+a[0].toString(36).toUpperCase().substring(0,5);
  await sg('bdg16_stats',stats);
  return stats.code;
}

// ── PHOTO / IMPORT ──
function prevPhoto(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{ppPhoto=e.target.result;const p=document.getElementById('phuprev');if(p)p.innerHTML=`<img src="${ppPhoto}" alt="">`;};r.readAsDataURL(i.files[0]);}
function impVCard(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{const t=e.target.result,nm=t.match(/FN:(.*)/),tm=t.match(/TEL[^:]*:(.*)/),bm=t.match(/BDAY:(\d{4})(\d{2})(\d{2})/);if(nm)document.getElementById('inp-name').value=nm[1].trim();if(tm)document.getElementById('inp-phone').value=tm[1].trim();if(bm){document.getElementById('inp-year').value=bm[1];document.getElementById('inp-month').value=parseInt(bm[2]);document.getElementById('inp-day').value=parseInt(bm[3]);}alert(t('contactImported'));};r.readAsText(i.files[0]);}
function impCSV(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{const ls=e.target.result.split('\n').filter(l=>l.trim());let cnt=0;const m=mems();ls.forEach(line=>{const p=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));if(p.length<3)return;const name=p[0],day=parseInt(p[1]),month=parseInt(p[2]);if(!name||!day||isNaN(day)||!month||isNaN(month)||day<1||day>31||month<1||month>12)return;m.push({id:Date.now()+cnt,day,month,year:p[3]?parseInt(p[3]):null,name,phone:p[4]||'',note:'',photo:'',type:'birthday',gender:''});cnt++;});m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);saveG();refresh();alert(`✓ ${cnt} membre${cnt>1?'s':''} importé${cnt>1?'s':''} !`);};r.readAsText(i.files[0]);}

function openImportSheet(){
  if(!('contacts' in navigator&&'ContactsManager' in window))return;
  var ov=document.getElementById('import-sheet-overlay');
  var sh=document.getElementById('import-sheet');
  if(ov)ov.style.display='block';
  if(sh)sh.style.display='block';
  applyI18n();
}
function closeImportSheet(){
  var ov=document.getElementById('import-sheet-overlay');
  var sh=document.getElementById('import-sheet');
  if(ov)ov.style.display='none';
  if(sh)sh.style.display='none';
}
async function importSingleContact(){
  closeImportSheet();
  try{
    var res=await navigator.contacts.select(['name','tel','birthday'],{multiple:false});
    if(!res||!res.length)return;
    var c=res[0];
    var name=(c.name&&c.name[0])||'';
    var phone=(c.tel&&c.tel[0])||'';
    var bday=c.birthday;
    if(name)document.getElementById('inp-name').value=name;
    if(phone)document.getElementById('inp-phone').value=phone;
    if(bday){
      var d=new Date(bday);
      if(!isNaN(d.getTime())){
        document.getElementById('inp-day').value=d.getDate();
        document.getElementById('inp-month').value=d.getMonth()+1;
        if(d.getFullYear()>1900)document.getElementById('inp-year').value=d.getFullYear();
      }
    }
    showSec('add',1);
    showToast(t('contactImported'));
  }catch(e){}
}
async function importMultipleContacts(){
  closeImportSheet();
  try{
    var res=await navigator.contacts.select(['name','tel','birthday'],{multiple:true});
    if(!res||!res.length)return;
    var m=mems();
    var pl=PL();
    var added=[],skipped=0;
    res.forEach(function(c){
      if(m.length+added.length>=pl.mm){skipped++;return;}
      var name=(c.name&&c.name[0])||'';
      if(!name)return;
      var phone=(c.tel&&c.tel[0])||'';
      var bday=c.birthday;
      var day=null,month=null,year=null,incomplete=true;
      if(bday){
        var d=new Date(bday);
        if(!isNaN(d.getTime())){
          day=d.getDate();month=d.getMonth()+1;
          year=d.getFullYear()>1900?d.getFullYear():null;
          incomplete=false;
        }
      }
      added.push({id:Date.now()+added.length,day,month,year,name,phone,note:'',photo:'',type:'birthday',gender:'',incomplete:incomplete||undefined});
    });
    if(!added.length)return;
    added.forEach(function(p){m.push(p);});
    m.sort(function(a,b){
      if(!a.month&&!b.month)return 0;
      if(!a.month)return 1;
      if(!b.month)return -1;
      return a.month-b.month||a.day-b.day;
    });
    setMems(m);saveG();refresh();
    showImportRecap(added);
  }catch(e){}
}
if('contacts' in navigator&&'ContactsManager' in window){
  var _bcb=document.getElementById('btn-import-contacts');
  if(_bcb){_bcb.style.display='block';_bcb.onclick=openImportSheet;}
}

// ── ADD MEMBER ──
function addMember(){
  const pl=PL(),m=mems();
  if(m.length>=pl.mm){alert('Plan '+PLANS[plan].name+' : '+pl.mm+' '+t('memberLimitAlert'));return;}
  const day=parseInt(document.getElementById('inp-day').value)||0,month=parseInt(document.getElementById('inp-month').value)||0,yv=document.getElementById('inp-year').value,name=(document.getElementById('inp-name').value||'').trim();
  if(!day||!month||!name){alert(t('requiredFieldsFull'));return;}
  if(day<1||day>31||month<1||month>12){alert(t('invalidDate'));return;}
  var rawType=document.getElementById('inp-type').value;
  var memberType=rawType==='other'?(document.getElementById('inp-other-text').value||'').trim().slice(0,40)||'other':rawType;
  var customMsg=(document.getElementById('inp-custom-msg').value||'').trim();
  m.push({id:Date.now(),day,month,year:yv?parseInt(yv):null,name,phone:(document.getElementById('inp-phone').value||'').trim(),note:(document.getElementById('inp-note').value||'').trim(),customMsg:customMsg||undefined,photo:ppPhoto,type:memberType,gender:document.getElementById('inp-gender').value});
  m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);ppPhoto='';saveG();
  ['inp-day','inp-year','inp-name','inp-phone','inp-note','inp-custom-msg'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const pp=document.getElementById('phuprev');
  if(pp)pp.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3.5" stroke="#D4A843" stroke-width="1.5"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#D4A843" stroke-width="1.5" stroke-linecap="round"/><path d="M17 6h4M19 4v4" stroke="#D4A843" stroke-width="1.5" stroke-linecap="round"/></svg>';
  if(mems().length===1&&!localStorage.getItem('notif-prompt-shown')){
    setTimeout(showNotifPrompt,800);
  }
  refresh();showSec('members',1);
}
function removeMem(id){if(!confirm(t('removeMemberConfirm')))return;setMems(mems().filter(p=>String(p.id)!==String(id)));saveG();refresh();}
function togEdit(id){editId=String(editId)===String(id)?null:id;rMembers();}
function saveEdit(id){
  const m=mems(),p=m.find(x=>String(x.id)===String(id));if(!p)return;
  const name=(document.getElementById('em-name').value||'').trim(),day=parseInt(document.getElementById('em-day').value)||0,month=parseInt(document.getElementById('em-month').value)||0;
  if(!name||!day||!month||day<1||day>31||month<1||month>12){alert(t('invalidData'));return;}
  const yv=document.getElementById('em-year').value;
  var emCustomMsg=(document.getElementById('em-custom-msg').value||'').trim();
  Object.assign(p,{name,day,month,year:yv?parseInt(yv):null,phone:(document.getElementById('em-phone').value||'').trim(),note:(document.getElementById('em-note').value||'').trim(),customMsg:emCustomMsg||undefined,gender:(document.getElementById('em-gender')&&document.getElementById('em-gender').value)||p.gender});
  m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);editId=null;saveG();rMembers();
}

// ── MODALS ──
function openOv(id){const m=document.getElementById(id);if(m){m.classList.add('op');m.style.display='flex';}}
function closeOv(id){const m=document.getElementById(id);if(m){m.classList.remove('op');setTimeout(()=>{if(!m.classList.contains('op'))m.style.display='none';},300);}}
document.querySelectorAll('.ov').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeOv(m.id);}));
document.addEventListener('click',function(e){var menu=document.getElementById('gc-menu');if(menu&&menu.style.display!=='none'&&!menu.contains(e.target))closeGroupMenu();});
function openNoteModal(cb){document.getElementById('ntxt').value='';openOv('mnote');document.getElementById('nok').onclick=()=>{const n=document.getElementById('ntxt').value.trim();closeOv('mnote');if(cb)cb(n);};}
function openPlanModal(){
  const c=document.getElementById('mplan-c');
  c.innerHTML=[['free','0€'],['bloom','4,99€/mois'],['pro','19,99€/mois']].map(([k,pr])=>`
  <div class="pmc${k===plan?' sel':''}" onclick="changePlan('${k}')">
    ${k===plan?'<div class="pmbdg">'+t('planCurrentBadge')+'</div>':''}
    <div class="pmn">${PLANS[k].name}</div>
    <div class="pmp">${pr}</div>
    <div class="pmf">
      <span class="${PLANS[k].mm>10?'on':'off'}">${PLANS[k].mm<999?PLANS[k].mm+' '+t('membersCount'):'∞ '+t('membersCount')}</span>
      <span class="${PLANS[k].gifts?'on':'off'}">${PLANS[k].gifts?t('planFeatGiftsYes'):t('planFeatGiftsNo')}</span>
      <span class="${PLANS[k].cards?'on':'off'}">${PLANS[k].cards?t('planFeatCardsYes'):t('planFeatCardsNo')}</span>
      <span class="${PLANS[k].amb?'on':'off'}">${PLANS[k].amb?t('planFeatAmbYes'):t('planFeatAmbNo')}</span>
    </div>
  </div>`).join('');
  openOv('mplan');
}
function changePlan(p){
  var planOrder={free:0,bloom:1,pro:2,enterprise:3};
  var curOrder=planOrder[plan]||0;
  var tgtOrder=planOrder[p]||0;
  closeOv('mplan');
  if(tgtOrder>curOrder){showUpgradeModal(p);return;}
  if(tgtOrder<curOrder){showDowngradeModal(p);return;}
}

// ── NAVIGATION SECTIONS ──
function showSec(name,idx){
  window._curSection=name;
  ['home','members','add','events','cal','more','admin'].forEach(s=>{const e=document.getElementById('s-'+s);if(e)e.style.display=s===name?'block':'none';});
  document.querySelectorAll('.nb').forEach((b,i)=>{b.classList.toggle('on',i===idx);});
  for(var di=0;di<5;di++){var sb=document.getElementById('dsb'+di);if(sb)sb.classList.toggle('on',di===idx);}
  const ms=document.getElementById('mscroll');if(ms)ms.scrollTo(0,0);
  if(name==='home')rHome();
  if(name==='events')rEvents();
  if(name==='cal')rCal();
  if(name==='more')rMore();
  if(name==='members')rMembers();
  if(name==='admin')rAdmin();
  if(typeof renderDesktopRightPanel==='function')renderDesktopRightPanel(name);
}

function _clearEl(el){while(el.firstChild)el.removeChild(el.firstChild);}

async function rAdmin(){
  if(!window.isAdmin)return;
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(!sess)return;
  var token=sess.access_token;
  var r=await fetch('/.netlify/functions/admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'stats'})});
  var s=await r.json();
  var conv=s.totalUsers>0?Math.round((s.premiumUsers/s.totalUsers)*100)+'%':'0%';
  var elTotal=document.getElementById('stat-total');if(elTotal)elTotal.textContent=s.totalUsers||0;
  var elActive=document.getElementById('stat-active');if(elActive)elActive.textContent=s.activeUsers||0;
  var elPrem=document.getElementById('stat-premium');if(elPrem)elPrem.textContent=s.premiumUsers||0;
  var elConv=document.getElementById('stat-conv');if(elConv)elConv.textContent=conv;
  adminLoadUsers(token,0,'');
  adminLoadSuggestions();
}

async function adminLoadUsers(token,page,search){
  var r=await fetch('/.netlify/functions/admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'users',page:page,search:search})});
  var d=await r.json();
  var el=document.getElementById('admin-user-list');
  if(!el)return;
  _clearEl(el);
  if(!d.users||!d.users.length){el.textContent=search?t('adminNoResults'):'';return;}
  d.users.forEach(function(u){
    var div=document.createElement('div');div.className='card';div.style.cssText='padding:10px 14px;cursor:pointer;margin-bottom:6px';
    div.onclick=function(){adminShowUser(u.id,token);};
    var nm=document.createElement('div');nm.style.cssText='font-size:13px;font-weight:600;color:var(--b1d)';nm.textContent=u.email;
    var info=document.createElement('div');info.style.cssText='font-size:11px;color:var(--txt2);margin-top:2px';
    info.textContent='Plan : '+(u.plan||'free')+' · Inscrit le '+new Date(u.created_at).toLocaleDateString('fr-FR');
    div.appendChild(nm);div.appendChild(info);el.appendChild(div);
  });
}

async function adminSearchUsers(){
  var q=document.getElementById('admin-search');var search=q?q.value:'';
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(sess)adminLoadUsers(sess.access_token,0,search);
}

async function adminShowUser(uid,token){
  var r=await fetch('/.netlify/functions/admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({action:'user_detail',uid:uid})});
  var d=await r.json();
  var el=document.getElementById('admin-user-detail');
  if(!el)return;
  el.style.display='block';_clearEl(el);
  var card=document.createElement('div');card.className='card';card.style.cssText='padding:14px;margin-top:10px';
  var emailEl=document.createElement('div');emailEl.style.cssText='font-size:14px;font-weight:700;margin-bottom:8px';
  emailEl.textContent=(d.profile&&d.profile.email)||'';card.appendChild(emailEl);
  var planEl=document.createElement('div');planEl.style.cssText='font-size:12px;color:var(--txt2);margin-bottom:10px';
  planEl.textContent='Plan : '+((d.profile&&d.profile.plan)||'free')+' · Inscrit : '+new Date((d.profile&&d.profile.created_at)||0).toLocaleDateString('fr-FR');
  card.appendChild(planEl);
  var ctTitle=document.createElement('div');ctTitle.style.cssText='font-size:13px;font-weight:600;margin-bottom:6px';
  ctTitle.textContent='Contacts ('+(d.contacts?d.contacts.length:0)+')';card.appendChild(ctTitle);
  (d.contacts||[]).forEach(function(c){
    var row=document.createElement('div');row.style.cssText='font-size:12px;color:var(--txt2);padding:3px 0;border-bottom:1px solid #f0f0f0';
    row.textContent=c.name+' — '+c.day+'/'+c.month+(c.year?'/'+c.year:'');card.appendChild(row);
  });
  var closeBtn=document.createElement('button');closeBtn.className='btn sm';closeBtn.style.marginTop='10px';
  closeBtn.textContent='Fermer';closeBtn.onclick=function(){el.style.display='none';};card.appendChild(closeBtn);
  el.appendChild(card);
}

function adminNotifPickTarget(btn){
  document.querySelectorAll('.admin-notif-pill').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  var emailRow=document.getElementById('admin-notif-email-row');
  if(emailRow)emailRow.style.display=btn.dataset.target==='user'?'block':'none';
}

function adminNotifPickType(btn){
  document.querySelectorAll('.admin-notif-type').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
}

async function adminSendNotif(){
  var titleEl=document.getElementById('admin-notif-title-inp');
  var msgEl=document.getElementById('admin-notif-text');
  var title=(titleEl&&titleEl.value||'').trim();
  var msg=(msgEl&&msgEl.value||'').trim();
  if(!title||!msg){showToast(t('errorRequired')||'Titre et message requis');return;}

  var targetBtn=document.querySelector('.admin-notif-pill.on');
  var typeBtn=document.querySelector('.admin-notif-type.on');
  var targetType=(targetBtn&&targetBtn.dataset.target)||'all';
  var type=(typeBtn&&typeBtn.dataset.type)||'announce';

  var targetEmail=null;
  if(targetType==='user'){
    var emailEl=document.getElementById('admin-notif-email');
    targetEmail=(emailEl&&emailEl.value||'').trim();
    if(!targetEmail){showToast(t('errorRequired')||'Email requis');return;}
  }

  var sess=await window._supabase.auth.getSession();
  var token=sess&&sess.data&&sess.data.session&&sess.data.session.access_token;
  if(!token)return;

  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'notify',title:title,message:msg,type:type,target_type:targetType,target_email:targetEmail})
  });
  var d=await r.json();
  if(d.ok){
    if(titleEl)titleEl.value='';
    if(msgEl)msgEl.value='';
    showToast(t('adminNotifSent')||'Notification envoyée !');
  }else{
    showToast(d.error||'Erreur');
  }
}

async function adminLoadSuggestions(){
  var el=document.getElementById('admin-notif-suggestions');
  if(!el)return;
  el.innerHTML='<div style="padding:12px;color:var(--txt2);font-size:13px">'+t('adminNotifSugLoading')+'</div>';

  var totalEl=document.getElementById('stat-total');
  var userCount=totalEl?totalEl.textContent:'?';
  var month=new Date().toLocaleString('fr',{month:'long'});

  var prompt='Tu es assistant pour Bloomday, une app d\'anniversaires. Génère exactement 3 suggestions de notifications push pour les utilisateurs. Contexte : '+userCount+' utilisateurs, nous sommes en '+month+'. Format JSON strict : [{"tag":"jalon|saison|astuce","title":"...","body":"..."},{"tag":"...","title":"...","body":"..."},{"tag":"...","title":"...","body":"..."}]. Les messages doivent être chaleureux, personnels, max 120 chars pour body. Réponds uniquement avec le JSON.';

  try{
    var r=await fetch('/.netlify/functions/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:[{role:'user',content:prompt}]})
    });
    var d=await r.json();
    var raw=d.reply||'';
    var match=raw.match(/\[[\s\S]*\]/);
    if(!match)throw new Error('bad json');
    var sugs=JSON.parse(match[0]);
    renderAdminSuggestions(sugs,el);
  }catch(e){
    el.innerHTML='<div style="padding:12px;color:var(--txt2);font-size:13px">'+t('adminNotifSugError')+'</div>';
  }
}

function renderAdminSuggestions(sugs,el){
  _adminSuggestions=sugs;
  var tagColors={jalon:'var(--b1l)|var(--b1d)',saison:'var(--b3l)|var(--b3)',astuce:'var(--b2l)|#8B2A1A'};
  el.innerHTML=sugs.map(function(s,i){
    var colors=(tagColors[s.tag]||'var(--bg2)|var(--txt2)').split('|');
    return '<div style="border:1.5px solid var(--brd);border-radius:var(--rad-sm);padding:14px 16px;margin-bottom:10px">'+
      '<div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:6px">'+
      '<div style="font-size:14px;font-weight:700;color:var(--txt);flex:1;line-height:1.35">'+esc(s.title)+'</div>'+
      '<span style="font-size:10px;font-weight:700;padding:2px 9px;border-radius:10px;background:'+colors[0]+';color:'+colors[1]+';white-space:nowrap">'+esc(s.tag)+'</span>'+
      '</div>'+
      '<div style="font-size:13px;color:var(--txt2);line-height:1.5;margin-bottom:10px">'+esc(s.body)+'</div>'+
      '<div style="display:flex;gap:7px">'+
      '<button onclick="adminSugEdit('+i+')" style="flex:1;padding:8px;border:1.5px solid var(--brd2);border-radius:9px;font-size:12px;font-weight:600;color:var(--txt2);background:transparent;font-family:\'DM Sans\',sans-serif;cursor:pointer" data-i18n="adminNotifModify">✏️ Modifier</button>'+
      '<button onclick="adminSugSend('+i+')" style="flex:1;padding:8px;background:var(--grad);border:none;border-radius:9px;font-size:12px;font-weight:700;color:#fff;font-family:\'DM Sans\',sans-serif;cursor:pointer" data-i18n="adminNotifSendBtn">Envoyer →</button>'+
      '</div>'+
      '</div>';
  }).join('');
}

function adminSugEdit(i){
  var s=_adminSuggestions[i];
  if(!s)return;
  var titleEl=document.getElementById('admin-notif-title-inp');
  var msgEl=document.getElementById('admin-notif-text');
  if(titleEl)titleEl.value=s.title||'';
  if(msgEl)msgEl.value=s.body||'';
  if(titleEl)titleEl.scrollIntoView({behavior:'smooth',block:'center'});
}

async function adminSugSend(i){
  var s=_adminSuggestions[i];
  if(!s)return;
  var sess=await window._supabase.auth.getSession();
  var token=sess&&sess.data&&sess.data.session&&sess.data.session.access_token;
  if(!token)return;
  var r=await fetch('/.netlify/functions/admin',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({action:'notify',title:s.title,message:s.body,type:'announce',target_type:'all',target_email:null})
  });
  var d=await r.json();
  if(d.ok)showToast(t('adminNotifSent')||'Notification envoyée !');
  else showToast(d.error||'Erreur');
}

async function checkAdminNotifications(){
  if(!window.currentUser)return;
  try{
    var uid=currentUser.uid;
    var r=await window._supabase.from('admin_notifications').select('*').eq('active',true).order('created_at',{ascending:false});
    if(!r.data||!r.data.length){updateBellBadge(0);return;}

    var rr=await window._supabase.from('user_notification_reads').select('notification_id').eq('user_id',uid);
    var readSet=new Set((rr.data||[]).map(function(x){return x.notification_id;}));
    _adminNotifReads=readSet;

    var userPlan=(window.stats&&window.stats.plan)||'free';
    var visible=r.data.filter(function(n){
      if(n.target_type==='all')return true;
      if(n.target_type==='free'&&userPlan==='free')return true;
      if(n.target_type==='premium'&&userPlan!=='free')return true;
      if(n.target_type==='user'&&n.target_uid===uid)return true;
      return false;
    });
    _adminNotifs=visible;

    var unread=visible.filter(function(n){return!readSet.has(n.id);});
    updateBellBadge(unread.length);

    var critical=unread.find(function(n){return n.type==='critical';});
    if(critical)showCriticalNotif(critical);
  }catch(e){}
}

function updateBellBadge(count){
  var tbBell=document.getElementById('tb-bell');
  var dsbBell=document.getElementById('dsb-bell');
  var tbBadge=document.getElementById('tb-bell-badge');
  var dsbBadge=document.getElementById('dsb-bell-badge');
  if(tbBell)tbBell.style.display=window.currentUser?'flex':'none';
  if(dsbBell)dsbBell.style.display=window.currentUser?'flex':'none';
  if(tbBadge)tbBadge.style.display=count>0?'block':'none';
  if(dsbBadge)dsbBadge.style.display=count>0?'block':'none';
}

function showCriticalNotif(notif){
  _criticalNotifId=notif.id;
  var ov=document.getElementById('notif-critical-ov');
  var titleEl=document.getElementById('notif-critical-title');
  var bodyEl=document.getElementById('notif-critical-body');
  if(!ov)return;
  if(titleEl)titleEl.textContent=notif.title||'';
  if(bodyEl)bodyEl.textContent=notif.message||'';
  ov.style.display='flex';
}

async function closeCriticalNotif(){
  var ov=document.getElementById('notif-critical-ov');
  if(ov)ov.style.display='none';
  if(_criticalNotifId&&window.currentUser){
    try{
      await window._supabase.from('user_notification_reads').upsert({user_id:currentUser.uid,notification_id:_criticalNotifId},{onConflict:'user_id,notification_id'});
      _adminNotifReads.add(_criticalNotifId);
    }catch(e){}
    _criticalNotifId=null;
    updateBellBadge(_adminNotifs.filter(function(n){return!_adminNotifReads.has(n.id);}).length);
  }
}

function formatNotifAge(isoDate){
  var diff=Date.now()-new Date(isoDate).getTime();
  var min=Math.floor(diff/60000);
  var h=Math.floor(min/60);
  var d=Math.floor(h/24);
  if(d>=7)return new Date(isoDate).toLocaleDateString();
  if(d>=1)return (t('daysAgo')||'Il y a %nj').replace('%n',d);
  if(h>=1)return 'Il y a '+h+'h';
  if(min>=1)return 'Il y a '+min+' min';
  return 'À l\'instant';
}

function openNotifDropdown(){
  var dropdown=document.getElementById('notif-dropdown');
  var overlay=document.getElementById('notif-overlay');
  if(!dropdown||!overlay)return;
  var bell=document.getElementById('tb-bell')||document.getElementById('dsb-bell');
  if(bell){
    var rect=bell.getBoundingClientRect();
    var rightOffset=window.innerWidth-rect.right;
    dropdown.style.top=(rect.bottom+8)+'px';
    dropdown.style.right=Math.max(8,rightOffset)+'px';
    dropdown.style.left='auto';
  }
  renderNotifList();
  overlay.style.display='block';
  dropdown.style.display='block';
  markAllNotifsRead();
}

function closeNotifDropdown(){
  var d=document.getElementById('notif-dropdown');
  var o=document.getElementById('notif-overlay');
  if(d)d.style.display='none';
  if(o)o.style.display='none';
}

function renderNotifList(){
  var el=document.getElementById('notif-list');
  if(!el)return;
  if(!_adminNotifs.length){
    el.innerHTML='<div style="padding:24px 16px;text-align:center;color:var(--txt3);font-size:13px">'+t('notifEmpty')+'</div>';
    return;
  }
  el.innerHTML=_adminNotifs.map(function(n,i){
    var isRead=_adminNotifReads.has(n.id);
    var age=formatNotifAge(n.created_at);
    var sep=i<_adminNotifs.length-1?'<div style="height:1px;background:var(--brd);margin:0 16px"></div>':'';
    return '<div style="display:flex;gap:10px;align-items:flex-start;padding:12px 16px;'+(isRead?'opacity:.65':'background:var(--b1l)')+'">'+
      '<span style="font-size:18px;margin-top:1px">📣</span>'+
      '<div style="flex:1;min-width:0">'+
      '<div style="font-size:13px;font-weight:'+(isRead?'600':'700')+';color:var(--txt);margin-bottom:2px">'+esc(n.title||'')+'</div>'+
      '<div style="font-size:12px;color:var(--txt2);line-height:1.45;word-break:break-word">'+esc(n.message)+'</div>'+
      '<div style="font-size:11px;color:var(--txt3);margin-top:4px">'+age+'</div>'+
      '</div>'+
      (!isRead?'<span style="width:8px;height:8px;background:var(--b1);border-radius:50%;flex-shrink:0;margin-top:5px"></span>':'')+
      '</div>'+sep;
  }).join('');
}

async function markAllNotifsRead(){
  if(!window.currentUser||!_adminNotifs.length)return;
  var uid=currentUser.uid;
  var unread=_adminNotifs.filter(function(n){return!_adminNotifReads.has(n.id);});
  if(!unread.length)return;
  try{
    await window._supabase.from('user_notification_reads').upsert(
      unread.map(function(n){return{user_id:uid,notification_id:n.id};}),
      {onConflict:'user_id,notification_id'}
    );
    unread.forEach(function(n){_adminNotifReads.add(n.id);});
    updateBellBadge(0);
  }catch(e){}
}

function toggleContactNotifDefault(id,useDefault){
  var m=mems(),p=m.find(function(x){return String(x.id)===String(id);});
  if(!p)return;
  var customDiv=document.getElementById('notif-contact-custom-'+id);
  if(useDefault){
    p.notif_days_before=null;p.notif_time=null;
    if(customDiv)customDiv.style.display='none';
  }else{
    p.notif_days_before=1;
    if(customDiv)customDiv.style.display='block';
  }
  setMems(m);saveG();
}
function setContactNotifDays(id,days){
  var m=mems(),p=m.find(function(x){return String(x.id)===String(id);});
  if(!p)return;
  p.notif_days_before=days;
  setMems(m);saveG();rMembers();
}

// ═══════════════════════════════════
// RENDER HOME
// ═══════════════════════════════════