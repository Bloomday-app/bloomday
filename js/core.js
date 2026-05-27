async function load(){
  groups=await gg('bdg16_groups',[]);
  var _defNames=['Mon groupe','My group','Mi grupo','\u0645\u062c\u0645\u0648\u0639\u062a\u064a','\u092e\u0947\u0930\u093e \u0938\u092e\u0942\u0939','\u6211\u7684\u7fa4\u7ec4','Meu grupo'];
  var _migrated=false;
  groups.forEach(function(g){if(!g.isDefault&&_defNames.indexOf(g.name)!==-1){g.isDefault=true;_migrated=true;}});
  if(_migrated)saveG();
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
    b.appendChild(btn);
  });
  var addBtn=document.createElement('button');
  addBtn.className='gc add';
  addBtn.textContent='＋';
  addBtn.title=t('groupModalTitle')||'Nouveau groupe';
  addBtn.onclick=addGroup;
  b.appendChild(addBtn);
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

async function importFromContacts(){
  if(!('contacts' in navigator&&'ContactsManager' in window))return;
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
    alert(t('contactImported'));
  }catch(e){}
}

if('contacts' in navigator&&'ContactsManager' in window){
  var _bcb=document.getElementById('btn-import-contacts');
  if(_bcb)_bcb.style.display='block';
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

async function adminSendNotif(){
  var msgEl=document.getElementById('admin-notif-text');var msg=msgEl?msgEl.value.trim():'';
  if(!msg)return;
  var sess=(await window._supabase.auth.getSession()).data.session;
  if(!sess)return;
  var r=await fetch('/.netlify/functions/admin',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+sess.access_token},body:JSON.stringify({action:'notify',message:msg})});
  var d=await r.json();
  if(d.ok){if(msgEl)msgEl.value='';alert(t('adminNotifSent'));}
}

async function checkAdminNotifications(){
  if(!window.currentUser)return;
  try{
    var r=await window._supabase.from('admin_notifications').select('message').eq('active',true).order('created_at',{ascending:false}).limit(1);
    if(r.data&&r.data.length>0){var b=document.getElementById('offline-banner');if(b){b.textContent=r.data[0].message;b.style.display='block';}}
  }catch(e){}
}

// ═══════════════════════════════════
// RENDER HOME
// ═══════════════════════════════════