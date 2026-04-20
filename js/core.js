async function load(){
  groups=await gg('bdg16_groups',[]);
  if(!groups.length)groups=[{id:'g1',name:mode==='biz'?'Mon équipe':t('myGroup'),icon:mode==='biz'?'💼':'🌸',members:[]}];
  admins=await gg('bdg16_admins',[]);
  hist=await gg('bdg16_hist',{});
  stats=await gg('bdg16_stats',{});
  profile=await gg('bdg16_profile',{});
  favs=await gg('bdg16_favs',[]);
  utpls=await gg('bdg16_tpls',[]);
  ['totalSent','totalGen','refs','celeb','msgsM'].forEach(k=>{if(!stats[k])stats[k]=0;});
  if(!stats.code)stats.code='BLD-'+Math.random().toString(36).substring(2,7).toUpperCase();
  if(!profile.live)profile.live='fr';
  if(!profile.religion)profile.religion='christian';
  buildCats();
  initUID();
  initLang();
  refresh();
}

function startApp(m,p){
  mode=m;plan=p||'bloom';
  var landEl=document.getElementById('land');if(landEl)landEl.style.display='none';
  var tbp=document.getElementById('tbplan');
  if(tbp)tbp.textContent=((PLANS[plan]&&PLANS[plan].name)||'Bloom')+' ▾';
  loadUser();
  var savedPlan=localStorage.getItem('bdg16_plan');
  if(savedPlan&&PLANS[savedPlan])plan=savedPlan;
  var firstLaunch=!localStorage.getItem('bdg16_ob');
  if(firstLaunch){
    var obs=document.getElementById('ob-screen');if(obs)obs.classList.add('on');
    load().then(function(){checkPushNeeded();startOnboarding();});
  } else {
    var app=document.getElementById('app');if(app)app.classList.add('on');
    load().then(function(){checkPushNeeded();});
  }
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

  // Animer l'écriture dans les champs ob1
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

  // Afficher le chargement
  if(demoEl){
    demoEl.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt2)"><div class="ld"></div><div style="margin-top:8px;font-size:13px">Génération du message IA...</div></div>';
  }

  // Message de secours immédiat (affiché pendant le chargement)
  var fallbackMsg = 'Léa, en ce jour si particulier, toute notre communauté se joint à moi pour te souhaiter un anniversaire aussi épanoui que tu l\'es. Que cette nouvelle année t\'apporte des fleurs plein les bras et du bonheur à chaque instant ! 🌸✨';

  // Afficher le fallback pendant qu'on tente l'IA
  if(demoEl){
    demoEl.innerHTML='<div class="ob-msg">'+esc(fallbackMsg)+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px">'+
      '<button class="btn G fw" onclick="copyObMsg()">📋 Copier</button>'+
      '<button class="btn sm" onclick="regenObMsg()">↺ Autre message</button>'+
      '</div>';
    window.__obFallback=fallbackMsg;
  }

  // Tenter l'API IA en arrière-plan
  try{
    var resp=await fetch("/.netlify/functions/generate-message",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt:"Génère en "+(window.__aiLang||'français')+" un message d'anniversaire chaleureux et personnalisé pour Léa (33 ans aujourd'hui, aime les fleurs et le chocolat). Maximum 3 phrases. Sans majuscule de début, commence directement par quelque chose de chaleureux."})
    });
    if(resp.ok){
      var data=await resp.json();
      var aiMsg=data.message||fallbackMsg;
      window.__obAiMsg=aiMsg;
      if(demoEl){
        demoEl.innerHTML='<div class="ob-msg">'+esc(aiMsg)+'</div>'+
          '<div style="display:flex;gap:8px;margin-top:12px">'+
          '<button class="btn G fw" onclick="copyObMsg()">📋 Copier</button>'+
          '<button class="btn sm" onclick="regenObMsg()">↺ Autre message</button>'+
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
    showToast('📋 Message copié !','success');
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
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({prompt:"Génère en "+(window.__aiLang||'français')+" un NOUVEAU message d'anniversaire différent pour Léa (33 ans, aime les fleurs et le chocolat). Maximum 3 phrases. Commence par quelque chose d'original."})
    });
    if(resp.ok){
      var data=await resp.json();
      var aiMsg=data.message||window.__obFallback;
      window.__obAiMsg=aiMsg;
      demoEl.innerHTML='<div class="ob-msg">'+esc(aiMsg)+'</div>'+
        '<div style="display:flex;gap:8px;margin-top:12px">'+
        '<button class="btn G fw" onclick="copyObMsg()">📋 Copier</button>'+
        '<button class="btn sm" onclick="regenObMsg()">↺ Autre message</button>'+
        '</div>';
    }
  } catch(e){
    var fallbacks=['Léa, que cette journée soit aussi lumineuse que ton sourire ! Joyeux anniversaire 🌸','Les 33 ans te vont à merveille ! Profite de chaque pétale de cette journée. 🌺'];
    var msg=fallbacks[Math.floor(Math.random()*fallbacks.length)];
    window.__obAiMsg=msg;
    demoEl.innerHTML='<div class="ob-msg">'+esc(msg)+'</div>'+
      '<div style="display:flex;gap:8px;margin-top:12px">'+
      '<button class="btn G fw" onclick="copyObMsg()">📋 Copier</button>'+
      '<button class="btn sm" onclick="regenObMsg()">↺ Autre</button>'+
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
  if(!name||!day||!month){alert('Prénom, jour et mois requis.');return;}
  // Ajouter dans le premier groupe
  if(!groups.length)groups=[{id:'g1',name:t('myGroup'),icon:'🌸',members:[]}];
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
  // Générer le message IA
  const msgEl=document.getElementById('ob2-msg');
  const isTod=isToday(day,month);
  try{
    const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:"Génère un message d'anniversaire chaleureux pour "+name+(isTod?" dont c'est l'anniversaire aujourd'hui!":".")+". Ton : chaleureux, festif, sincère. 3-4 phrases. Commence directement par le message."})});
    if(resp.ok){const data=await resp.json();const text=data.message||'';msgEl.innerHTML=`<div style="font-size:13px;font-weight:600;color:var(--b4d);margin-bottom:8px">✨ Message généré pour ${esc(name.split(' ')[0])} :</div><div style="font-size:13px;line-height:1.8;color:var(--b4d)">${esc(text)}</div><div class="brow" style="margin-top:10px"><button class="btn sm G" onclick="copyMsgCached(this,'"+_c(text)+"')">📋 Copier</button></div>`;}
    else throw new Error();
  }catch(e){msgEl.innerHTML=`<div style="font-size:13px;line-height:1.8;color:var(--b4d)">${getFallback('birthday')}</div>`;}
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
function renderAllPlans(mode){
  var PD={
    free:{badge:t('free'),badgeCls:'fre',pop:false,price:'0€',period:t('planForever'),
      feats:[t('planFeatMem10'),t('planFeat1Group'),t('planFeatMsg5'),t('planFeatGiftsNo'),t('planFeatCardsNo')],
      nope:[],cta:t('planCTAfree'),ctaCls:'F'},
    bloom:{badge:t('planBadgeBloom'),badgeCls:'pop',pop:true,price:'4,99€',period:t('perMonth'),
      feats:[t('planFeatMemUnlim'),t('planFeat5Groups'),t('planFeatMsgUnlim'),t('planFeatGiftsYes'),t('planFeatCardsYes')],
      nope:[],cta:t('planCTAtry'),ctaCls:'P'},
    pro:{badge:'🏢 Business',badgeCls:'biz',pop:false,price:'19,99€',period:t('perMonth'),
      feats:[t('planFeat50Collab'),t('planFeatGroupUnlim'),t('planFeatMsgUnlim'),t('planFeatCSV'),t('planFeat5Admin')],
      nope:[],cta:t('planCTAtry'),ctaCls:'B'},
    enterprise:{badge:'Enterprise',badgeCls:'biz',pop:false,price:'Sur devis',period:'',
      feats:[t('planFeatUnlimCollab'),t('planFeatGroupUnlim'),t('planFeatMsgUnlim'),t('planFeatCSV')],
      nope:[],cta:'Nous contacter',ctaCls:'B'}
  };
  var BBGC={pop:'linear-gradient(135deg,#F5A623,#E05C8A)',biz:'#1A6FC4',fre:'#18A86B',p:'#7C6EE0'};
  var pKeys=['free','bloom','pro']; var bKeys=['pro','enterprise'];
  var keys=mode==='biz'?bKeys:pKeys;
  var cId=mode==='biz'?'plan-cards-biz':'plan-cards-perso';
  var el=document.getElementById(cId); if(!el) return;
  var html='';
  keys.forEach(function(k){
    var pd=PD[k]; if(!pd) return;
    var pname=PLANS[k]?PLANS[k].name:k;
    var bc=BBGC[pd.badgeCls]||BBGC.p; var mtop=pd.badge?'18px':'4px';
    html+='<div class="pcard'+(pd.pop?' pop':'')+'">';
    if(pd.badge) html+='<div class="pbdg2" style="background:'+bc+';color:#fff;position:absolute;top:-1px;right:14px;font-size:10px;font-weight:700;padding:4px 11px;border-radius:0 0 9px 9px">'+pd.badge+'</div>';
    html+='<div style="font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.07em;margin-top:'+mtop+';margin-bottom:5px">'+pname+'</div>';
    html+='<div style="margin-bottom:8px"><span class="price-font">'+pd.price+'</span><span style="font-size:13px;color:var(--txt2)"> '+pd.period+'</span></div>';
    html+='<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">';
    for(var fi=0;fi<pd.feats.length;fi++) html+='<span class="ft ok">✓ '+pd.feats[fi]+'</span>';
    html+='</div>';
    if(k==='free') html+='<button class="lcta '+pd.ctaCls+'" data-mode="'+mode+'" data-plan="'+k+'" onclick="startFromBtn(this)">'+pd.cta+'</button>';
    else html+='<button class="lcta P" data-plan="'+k+'" onclick="openPaymentFromBtn(this)" style="width:100%">'+t('planCTAtry')+'</button>';
    html+='</div>';
  });
  el.innerHTML=html;
}
// Rétrocompatibilité (appelée nulle part maintenant)
function selPlan(){}
function renderPlanDetail(){}


// ── GROUPES ──
function rGbar(){
  const b=document.getElementById('gbar');if(!b)return;
  b.innerHTML=groups.map(g=>`<button class="gc${g.id===curG?' on':''}" onclick="switchG('${esc(g.id)}')">${esc(g.icon)} ${esc(g.name)}</button>`).join('')+`<button class="gc add" onclick="addGroup()" title="Nouveau groupe">＋</button>`;
}
function switchG(id){curG=id;fMonth=0;searchInput='';searchFiltered=null;editId=null;refresh();}
function addGroup(){
  const pl=PL();
  if(groups.length>=pl.mg){
    alert(t('planLabel')||'Plan '+PLANS[plan].name+' : maximum '+pl.mg+' groupe'+(pl.mg>1?'s':'')+'.\nPassez à un plan supérieur.');
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

// ── PHOTO / IMPORT ──
function prevPhoto(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{ppPhoto=e.target.result;const p=document.getElementById('phuprev');if(p)p.innerHTML=`<img src="${ppPhoto}" alt="">`;};r.readAsDataURL(i.files[0]);}
function impVCard(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{const t=e.target.result,nm=t.match(/FN:(.*)/),tm=t.match(/TEL[^:]*:(.*)/),bm=t.match(/BDAY:(\d{4})(\d{2})(\d{2})/);if(nm)document.getElementById('inp-name').value=nm[1].trim();if(tm)document.getElementById('inp-phone').value=tm[1].trim();if(bm){document.getElementById('inp-year').value=bm[1];document.getElementById('inp-month').value=parseInt(bm[2]);document.getElementById('inp-day').value=parseInt(bm[3]);}alert('✓ Contact importé !');};r.readAsText(i.files[0]);}
function impCSV(i){if(!i.files||!i.files[0])return;const r=new FileReader();r.onload=e=>{const ls=e.target.result.split('\n').filter(l=>l.trim());let cnt=0;const m=mems();ls.forEach(line=>{const p=line.split(',').map(x=>x.trim().replace(/^"|"$/g,''));if(p.length<3)return;const name=p[0],day=parseInt(p[1]),month=parseInt(p[2]);if(!name||!day||isNaN(day)||!month||isNaN(month)||day<1||day>31||month<1||month>12)return;m.push({id:Date.now()+cnt,day,month,year:p[3]?parseInt(p[3]):null,name,phone:p[4]||'',note:'',photo:'',type:'birthday',gender:''});cnt++;});m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);saveG();refresh();alert(`✓ ${cnt} membre${cnt>1?'s':''} importé${cnt>1?'s':''} !`);};r.readAsText(i.files[0]);}

// ── ADD MEMBER ──
function addMember(){
  const pl=PL(),m=mems();
  if(m.length>=pl.mm){alert(`Plan ${PLANS[plan].name} : maximum ${pl.mm} membres.\nPassez à un plan supérieur.`);return;}
  const day=parseInt(document.getElementById('inp-day').value)||0,month=parseInt(document.getElementById('inp-month').value)||0,yv=document.getElementById('inp-year').value,name=(document.getElementById('inp-name').value||'').trim();
  if(!day||!month||!name){alert('Jour, mois et nom sont requis.');return;}
  if(day<1||day>31||month<1||month>12){alert('Date invalide.');return;}
  m.push({id:Date.now(),day,month,year:yv?parseInt(yv):null,name,phone:(document.getElementById('inp-phone').value||'').trim(),note:(document.getElementById('inp-note').value||'').trim(),photo:ppPhoto,type:document.getElementById('inp-type').value,gender:document.getElementById('inp-gender').value});
  m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);ppPhoto='';saveG();
  ['inp-day','inp-year','inp-name','inp-phone','inp-note'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  const pp=document.getElementById('phuprev');
  if(pp)pp.innerHTML='<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="3.5" stroke="#E8891A" stroke-width="1.5"/><path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#E8891A" stroke-width="1.5" stroke-linecap="round"/><path d="M17 6h4M19 4v4" stroke="#E8891A" stroke-width="1.5" stroke-linecap="round"/></svg>';
  refresh();showSec('members',1);
}
function removeMem(id){if(!confirm('Retirer ce membre ?'))return;setMems(mems().filter(p=>p.id!==id));saveG();refresh();}
function togEdit(id){editId=editId===id?null:id;rMembers();}
function saveEdit(id){
  const m=mems(),p=m.find(x=>x.id===id);if(!p)return;
  const name=(document.getElementById('em-name').value||'').trim(),day=parseInt(document.getElementById('em-day').value)||0,month=parseInt(document.getElementById('em-month').value)||0;
  if(!name||!day||!month||day<1||day>31||month<1||month>12){alert('Données invalides.');return;}
  const yv=document.getElementById('em-year').value;
  Object.assign(p,{name,day,month,year:yv?parseInt(yv):null,phone:(document.getElementById('em-phone').value||'').trim(),note:(document.getElementById('em-note').value||'').trim(),gender:(document.getElementById('em-gender')&&document.getElementById('em-gender').value)||p.gender});
  m.sort((a,b)=>a.month-b.month||a.day-b.day);setMems(m);editId=null;saveG();rMembers();
}

// ── MODALS ──
function openOv(id){const m=document.getElementById(id);if(m){m.classList.add('op');m.style.display='flex';}}
function closeOv(id){const m=document.getElementById(id);if(m){m.classList.remove('op');setTimeout(()=>{if(!m.classList.contains('op'))m.style.display='none';},300);}}
document.querySelectorAll('.ov').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeOv(m.id);}));
function openNoteModal(cb){document.getElementById('ntxt').value='';openOv('mnote');document.getElementById('nok').onclick=()=>{const n=document.getElementById('ntxt').value.trim();closeOv('mnote');if(cb)cb(n);};}
function openPlanModal(){
  const c=document.getElementById('mplan-c');
  c.innerHTML=[['free','0€'],['solo','1,99€/mois'],['bloom','4,99€/mois'],['premium','7,99€/mois'],['pro','19,99€/mois']].map(([k,pr])=>`
  <div class="pmc${k===plan?' sel':''}" onclick="changePlan('${k}')">
    ${k===plan?'<div class="pmbdg">Actuel ✓</div>':''}
    <div class="pmn">${PLANS[k].name}</div>
    <div class="pmp">${pr}</div>
    <div class="pmf">
      <span class="${PLANS[k].mm>10?'on':'off'}">${PLANS[k].mm<999?PLANS[k].mm+' membres':'∞ membres'}</span>
      <span class="${PLANS[k].gifts?'on':'off'}">${PLANS[k].gifts?'Cadeaux ✓':'Cadeaux ✗'}</span>
      <span class="${PLANS[k].cards?'on':'off'}">${PLANS[k].cards?'Cartes ✓':'Cartes ✗'}</span>
      <span class="${PLANS[k].amb?'on':'off'}">${PLANS[k].amb?'Ambassador ✓':'Ambassador ✗'}</span>
    </div>
  </div>`).join('');
  openOv('mplan');
}
function changePlan(p){plan=p;document.getElementById('tbplan').textContent=((PLANS[p]&&PLANS[p].name)||'Bloom')+' ▾';closeOv('mplan');refresh();}

// ── NAVIGATION SECTIONS ──
function showSec(name,idx){
  ['home','members','add','events','cal','more'].forEach(s=>{const e=document.getElementById('s-'+s);if(e)e.style.display=s===name?'block':'none';});
  document.querySelectorAll('.nb').forEach((b,i)=>{b.classList.toggle('on',i===idx);});
  const ms=document.getElementById('mscroll');if(ms)ms.scrollTo(0,0);
  if(name==='events')rEvents();
  if(name==='cal')rCal();
  if(name==='more')rMore();
  if(name==='members')rMembers();
}

// ═══════════════════════════════════
// RENDER HOME
// ═══════════════════════════════════