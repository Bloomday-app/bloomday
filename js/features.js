async function openContactPicker(mode){
  if('contacts' in navigator && navigator.contacts && navigator.contacts.select){
    try{
      var props=['name','tel'];
      var opts={multiple:(mode==='all')};
      var cts=await navigator.contacts.select(props,opts);
      if(!cts||cts.length===0) return;
      var imported=0;
      for(var ci=0;ci<cts.length;ci++){
        var c=cts[ci];
        var cname=(c.name&&c.name[0])||'';
        var cphone=(c.tel&&c.tel[0])||'';
        if(!cname) continue;
        var _nmA=new Uint32Array(1);crypto.getRandomValues(_nmA);var nm={id:'m'+Date.now()+'_'+_nmA[0].toString(36).slice(0,6),
          name:cname,phone:cphone,type:'birthday',day:0,month:0,year:0};
        if(!groups.length) groups=[{id:'g1',name:t('myGroup'),icon:'🌸',members:[]}];
        groups[0].members.push(nm);
        imported++;
      }
      if(imported>0){
        saveG();
        showToast(t('contactsSelected').replace('%d',String(imported)));
        showSec('members',1);
      }
      return;
    }catch(e){ console.log('picker:',e); }
  }
  showImportContactsMenu();
}

function showImportContactsMenu(){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  ov.onclick=function(e){if(e.target===ov) ov.remove();};
  var sh=document.createElement('div');
  sh.style.cssText='background:var(--card);border-radius:20px 20px 0 0;padding:20px 16px 32px;width:100%;max-width:500px';
  function addBtn(txt,cls,fn){
    var b=document.createElement('button');
    b.className=cls;b.style.marginBottom='10px';b.textContent=txt;
    b.onclick=function(){ov.remove();fn();};
    sh.appendChild(b);
  }
  var ttl=document.createElement('div');
  ttl.style.cssText='font-size:16px;font-weight:700;margin-bottom:8px;text-align:center';
  ttl.textContent=t('importContactsTitle');
  var sub=document.createElement('div');
  sub.style.cssText='font-size:13px;color:var(--txt2);margin-bottom:14px;text-align:center';
  sub.textContent=t('importContactsDesc');
  sh.appendChild(ttl);sh.appendChild(sub);
  addBtn('📱 '+t('importSingleBtn'),'btn B fw',function(){openContactPicker('one');});
  addBtn('📋 '+t('importAllBtn'),'btn B fw',function(){openContactPicker('all');});
  addBtn('📂 '+t('importVcf2'),'btn fw',function(){var inp=document.getElementById('vcfinp');if(inp)inp.click();});
  addBtn(t('closeBtn'),'btn fw',function(){});
  ov.appendChild(sh);document.body.appendChild(ov);
}

function showToast(msg){
  var el=document.getElementById('bd-toast');
  if(!el){
    el=document.createElement('div');el.id='bd-toast';
    el.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--b1);color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;z-index:9998;transition:opacity .3s;max-width:300px;text-align:center;pointer-events:none';
    document.body.appendChild(el);
  }
  el.textContent=msg;el.style.opacity='1';
  clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity='0';},2500);
}

function showUpgradeModal(targetPlan){
  var planName=PLANS[targetPlan]?PLANS[targetPlan].name:targetPlan;
  var price=targetPlan==='bloom'?'4,99':targetPlan==='pro'?'19,99':'?';
  var trialDays=7;
  function mk(tag,css,txt){var e=document.createElement(tag);if(css)e.style.cssText=css;if(txt!==undefined)e.textContent=txt;return e;}

  var existing=document.getElementById('stripe-modal-ov');if(existing)existing.remove();
  var ov=document.createElement('div');ov.id='stripe-modal-ov';
  ov.style.cssText='position:fixed;inset:0;background:rgba(20,12,8,.65);z-index:9999;display:flex;align-items:flex-end;justify-content:center;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)';

  var md=document.createElement('div');
  md.style.cssText='background:var(--card);border-radius:28px 28px 0 0;padding:28px 20px calc(28px + env(safe-area-inset-bottom));width:100%;max-width:440px;max-height:90vh;overflow-y:auto;animation:su .25s ease';

  // Header
  var hdr=mk('div','text-align:center;margin-bottom:20px');
  hdr.appendChild(mk('div','font-size:36px;margin-bottom:8px','🌸'));
  hdr.appendChild(mk('div','font-family:var(--ff-title);font-size:22px;font-weight:800;color:var(--txt);margin-bottom:6px',planName+' — '+trialDays+' jours gratuits'));
  var sub=mk('div','font-size:13px;color:var(--txt2);line-height:1.65');
  sub.textContent='Carte enregistrée mais non débitée pendant l\'essai. '+price+t('perMonth')+' après '+trialDays+' jours. Annulable à tout moment.';
  hdr.appendChild(sub);
  md.appendChild(hdr);

  // Email
  var ew=mk('div','margin-bottom:14px');
  ew.appendChild(mk('label','font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px',t('emailOptional')));
  var ei=document.createElement('input');ei.type='email';ei.id='stripe-email';ei.placeholder='vous@exemple.com';
  ei.style.cssText='width:100%;border:1.5px solid var(--brd);border-radius:10px;padding:11px 14px;font-size:15px;background:var(--bg);color:var(--txt);box-sizing:border-box';
  ew.appendChild(ei);md.appendChild(ew);

  // Card mount
  var cw=mk('div','margin-bottom:20px');
  cw.appendChild(mk('label','font-size:11px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:6px',t('cardLabel')));
  var cm=mk('div','border:1.5px solid var(--brd);border-radius:10px;padding:13px 14px;background:var(--bg);transition:border .2s');cm.id='stripe-card-el';
  var ce=mk('div','color:#c0392b;font-size:12px;margin-top:6px;display:none');ce.id='stripe-card-err';
  cw.appendChild(cm);cw.appendChild(ce);md.appendChild(cw);

  // Buttons
  var sb=mk('button','padding:15px;font-size:15px;font-weight:700;border-radius:14px;margin-bottom:10px',t('startTrialBtn'));
  sb.id='stripe-submit-btn';sb.className='btn P fw';md.appendChild(sb);
  var cb=mk('button','font-size:14px',t('cancelBtn'));cb.className='btn fw';
  cb.onclick=function(){ov.remove();};md.appendChild(cb);
  md.appendChild(mk('div','margin-top:16px;text-align:center;font-size:11px;color:var(--txt3)',t('stripeSecure')));

  ov.appendChild(md);document.body.appendChild(ov);

  // Stripe Elements
  var STRIPE_PK=window.STRIPE_PUBLISHABLE_KEY||'';
  if(!STRIPE_PK||!window.Stripe){
    ce.textContent=t('stripeConfigError');ce.style.display='block';
    return;
  }
  var stripe=Stripe(STRIPE_PK);
  var els=stripe.elements();
  var cardEl=els.create('card',{style:{base:{fontFamily:'\'DM Sans\', sans-serif',fontSize:'15px',color:'#2D1B14',iconColor:'#D4A843','::placeholder':{color:'#C8B0A4'}},invalid:{color:'#c0392b'}},hidePostalCode:true});
  cardEl.mount('#stripe-card-el');
  cardEl.on('focus',function(){cm.style.borderColor='var(--b1)';});
  cardEl.on('blur',function(){cm.style.borderColor='var(--brd)';});
  cardEl.on('change',function(ev){if(ev.error){ce.textContent=ev.error.message;ce.style.display='block';}else{ce.style.display='none';}});

  sb.onclick=async function(){
    sb.disabled=true;sb.textContent=t('registeringText');ce.style.display='none';
    try{
      var resp=await fetch('/.netlify/functions/create-setup-intent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:targetPlan,email:ei.value.trim(),userId:currentUser?currentUser.uid:''})});
      var data=await resp.json();
      if(!resp.ok||!data.clientSecret)throw new Error(data.error||t('serverError'));
      var res=await stripe.confirmCardSetup(data.clientSecret,{payment_method:{card:cardEl,billing_details:{email:ei.value.trim()||undefined}}});
      if(res.error)throw new Error(res.error.message);
      safeLsSet('bdg16_plan',targetPlan);
      safeLsSet('bdg16_customer',data.customerId||'');
      safeLsSet('bdg16_since',new Date().getFullYear()+'');
      plan=targetPlan;ov.remove();
      showToast(t('trialStarted')+' '+planName,'success');
      refresh();
    }catch(e){
      ce.textContent=e.message||t('errorRetry');ce.style.display='block';
      sb.disabled=false;sb.textContent=t('startTrialBtn');
    }
  };
}

function showDowngradeModal(targetPlan){
  var planName=PLANS[targetPlan]?PLANS[targetPlan].name:targetPlan;
  var ov=document.createElement('div');
  ov.className='dg-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  var md=document.createElement('div');
  md.style.cssText='background:var(--card);border-radius:20px;padding:24px 20px;width:100%;max-width:400px;max-height:85vh;overflow-y:auto';
  var ttl=document.createElement('div');
  ttl.style.cssText='font-size:18px;font-weight:800;margin-bottom:4px';
  ttl.textContent=t('downgradeTitle');
  md.appendChild(ttl);
  var sub=document.createElement('div');
  sub.style.cssText='font-size:13px;color:var(--txt2);margin-bottom:16px';
  sub.textContent=planName;
  md.appendChild(sub);
  var q=document.createElement('div');
  q.style.cssText='font-size:14px;font-weight:600;margin-bottom:12px';
  q.textContent=t('downgradeQ1');
  md.appendChild(q);
  var opts=['downgradeOpt1','downgradeOpt2','downgradeOpt3','downgradeOpt4','downgradeOpt5'];
  for(var oi=0;oi<opts.length;oi++){
    (function(okey){
      var lbl=document.createElement('label');
      lbl.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid var(--bd);border-radius:10px;margin-bottom:8px;cursor:pointer;font-size:14px';
      var inp=document.createElement('input');
      inp.type='radio';inp.name='dg-reason';inp.value=okey;
      inp.style.accentColor='var(--b1)';
      var sp=document.createElement('span');
      sp.textContent=t(okey);
      lbl.appendChild(inp);lbl.appendChild(sp);
      md.appendChild(lbl);
    })(opts[oi]);
  }
  var cfmBtn=document.createElement('button');
  cfmBtn.className='btn P fw';cfmBtn.style.marginTop='16px';
  cfmBtn.textContent=t('downgradeConfirmBtn');
  cfmBtn.onclick=function(){confirmDowngrade(targetPlan,ov);};
  md.appendChild(cfmBtn);
  var cancelBtn=document.createElement('button');
  cancelBtn.className='btn fw';cancelBtn.style.marginTop='8px';
  cancelBtn.textContent=t('downgradeCancelBtn');
  cancelBtn.onclick=function(){ov.remove();};
  md.appendChild(cancelBtn);
  ov.appendChild(md);document.body.appendChild(ov);
}

async function confirmDowngrade(targetPlan,overlay){
  var sel=document.querySelector('[name="dg-reason"]:checked');
  if(!sel){showToast(t('downgradeQ1'));return;}
  plan=targetPlan;
  safeLsSet('bdg16_plan',plan);
  if(overlay) overlay.remove();
  showToast(t('downgradeSuccessMsg'));
  updateTopbar();refresh();
}

function openPaymentFromBtn(btn){
  var targetPlan=btn?btn.getAttribute('data-plan'):'bloom';
  var planOrder={free:0,bloom:1,pro:2,enterprise:3};
  var curOrder=planOrder[plan]||0;
  var tgtOrder=planOrder[targetPlan]||0;
  if(tgtOrder>curOrder) showUpgradeModal(targetPlan);
  else if(tgtOrder<curOrder) showDowngradeModal(targetPlan);
  else showToast(t('confirmPlanActive'));
}

function showAccountPage(){
  var planName=PLANS[plan]?PLANS[plan].name:'Starter';
  var memberSince=localStorage.getItem('bdg16_since')||'2024';
  var ov=document.createElement('div');
  ov.id='account-page';
  ov.style.cssText='position:fixed;inset:0;background:var(--bg);z-index:9990;overflow-y:auto';

  // Topbar
  var tb=document.createElement('div');
  tb.style.cssText='position:sticky;top:0;background:var(--topbar);z-index:2;padding:14px 16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--bd)';
  var bk=document.createElement('button');
  bk.style.cssText='background:none;border:none;font-size:22px;color:var(--txt);cursor:pointer;padding:2px 8px';
  bk.textContent='←';bk.onclick=function(){ov.remove();};
  var tit=document.createElement('div');
  tit.style.cssText='font-size:17px;font-weight:700';tit.textContent=t('profilePageTitle');
  tb.appendChild(bk);tb.appendChild(tit);ov.appendChild(tb);

  var body=document.createElement('div');
  body.style.cssText='padding:20px 16px;max-width:500px;margin:0 auto';

  // Avatar
  var az=document.createElement('div');az.style.cssText='text-align:center;padding:24px 0 20px';
  var av=document.createElement('div');
  av.style.cssText='width:72px;height:72px;border-radius:50%;background:var(--b1l);display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:10px';
  av.textContent='??';
  var un=document.createElement('div');un.style.cssText='font-size:18px;font-weight:700';
  un.textContent=(user&&user.name)||'Bloomday';
  var ue=document.createElement('div');ue.style.cssText='font-size:13px;color:var(--txt2);margin-top:2px';
  ue.textContent=(user&&user.email)||'';
  az.appendChild(av);az.appendChild(un);az.appendChild(ue);body.appendChild(az);

  // Info rows
  function mkRow(labelKey,val,last){
    var row=document.createElement('div');
    row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:12px 0'+(last?'':';border-bottom:1px solid var(--bd)');
    var l=document.createElement('span');l.style.cssText='font-size:14px;color:var(--txt2)';l.textContent=t(labelKey);
    var v=document.createElement('span');v.style.cssText='font-size:14px;font-weight:600';v.textContent=val;
    row.appendChild(l);row.appendChild(v);return row;
  }
  var card=document.createElement('div');card.className='card';card.style.marginBottom='12px';
  card.appendChild(mkRow('accountPlan',planName,false));
  card.appendChild(mkRow('accountEmail',(user&&user.email)||'—',false));
  card.appendChild(mkRow('accountMember',memberSince,true));
  body.appendChild(card);

  // Boutons action
  function addActionBtn(txt,cls,fn,icon){
    var b=document.createElement('button');
    b.className=cls+' fw';b.style.marginBottom='10px';
    b.textContent=(icon?icon+' ':'')+txt;b.onclick=fn;
    body.appendChild(b);
  }
  addActionBtn(t('changePlanBtn'),'btn V',function(){ov.remove();goLand();},'');
  addActionBtn(t('signOutBtn'),'btn',function(){confirmSignOut(ov);},'??');

  // Sélecteur langue
  var lcard=document.createElement('div');lcard.className='card';lcard.style.cssText='margin-top:16px;padding:14px';
  var ltit=document.createElement('div');ltit.style.cssText='font-size:13px;font-weight:700;margin-bottom:10px';
  ltit.textContent=t('languageLabel');lcard.appendChild(ltit);
  var lrow=document.createElement('div');lrow.style.cssText='display:flex;flex-wrap:wrap;gap:8px';
  var langs2=['fr','en','es','ar','hi','zh','pt'];
  var fgs={fr:'????',en:'????',es:'????',
           ar:'????',hi:'????',zh:'????',pt:'????'};
  for(var li=0;li<langs2.length;li++){
    (function(lg){
      var lb=document.createElement('button');
      lb.className='btn'+(lg===appLang?' B':'')+' sm';
      lb.textContent=(fgs[lg]||'')+' '+lg.toUpperCase();
      lb.onclick=function(){setLang(lg);ov.remove();setTimeout(showAccountPage,50);};
      lrow.appendChild(lb);
    })(langs2[li]);
  }
  lcard.appendChild(lrow);body.appendChild(lcard);
  ov.appendChild(body);document.body.appendChild(ov);
}

function confirmSignOut(overlay){
  if(!confirm(t('signOutConfirm'))) return;
  doSignOut(overlay);
}
function doSignOut(overlay){
  user={};plan='free';
  localStorage.removeItem('bdg16_user');localStorage.removeItem('bdg16_plan');
  if(overlay) overlay.remove();
  goLand();
  showToast(t('signOutBtn'));
}

function refresh(){
  rGbar();updateTopbar();
  rHome();
  ['members','events','cal','more'].forEach(s=>{const e=document.getElementById('s-'+s);if(e&&e.style.display!=='none'){if(s==='members')rMembers();else if(s==='events')rEvents();else if(s==='cal')rCal();else if(s==='more')rMore();}});
  renderSideCalendar();
}

function handleHash(){
  var h=window.location.hash;
  if(h.startsWith('#app')){
    var m=h.includes('biz')?'biz':'perso';
    startApp(m,'free');
  }
}

function startFromBtn(btn){
  var m=(btn&&btn.getAttribute('data-mode'))||'perso';
  if(currentUser){startApp(m,currentUser.plan||'free');}
  else{openAuth('signup');}
}

document.addEventListener('DOMContentLoaded',function(){
  // Google OAuth callback : Supabase place #access_token= dans l'URL au lieu de #app
  if(window.location.hash.includes('access_token=')){
    history.replaceState(null,'',window.location.pathname);
    startApp('perso','free');
  } else {
    handleHash();
  }
  window.addEventListener('hashchange',handleHash);
  document.getElementById('s-home').style.display='block';
  // Rendre tous les plans en cartes scrollables (adaptatif iOS/Android/iPad/desktop)
  renderPricingTable();
});

// ── TOAST ──
function showToast(msg,type){
  var ex=document.getElementById('bd-toast');if(ex)ex.remove();
  var t2=document.createElement('div');t2.id='bd-toast';
  t2.style.cssText='position:fixed;bottom:88px;left:50%;transform:translateX(-50%);'+
    'background:'+(type==='success'?'#18A86B':'#FF8C7A')+';color:#fff;'+
    'padding:10px 20px;border-radius:20px;font-size:13px;font-weight:700;'+
    'z-index:9999;animation:bdFadeIn .3s ease;box-shadow:0 4px 16px rgba(0,0,0,.2);'+
    'max-width:90vw;text-align:center;pointer-events:none';
  t2.textContent=msg;document.body.appendChild(t2);
  setTimeout(function(){t2.style.opacity='0';t2.style.transition='opacity .4s';setTimeout(function(){if(t2.parentNode)t2.remove();},400);},2800);
}
// ── LANGUE ──
function toggleLangDd(){
  var dd=document.getElementById('lang-dd');if(dd)dd.classList.toggle('open');
}
function pickLang(lang){
  var labels={fr:'FR',en:'EN',es:'ES',ar:'AR',hi:'HI',zh:'ZH',pt:'PT'};
  var cur=document.getElementById('lang-cur');if(cur)cur.textContent=labels[lang]||lang.toUpperCase();
  document.querySelectorAll('.lang-opt').forEach(function(el){
    el.classList.toggle('on',el.getAttribute('data-lang')===lang);
  });
  var dd=document.getElementById('lang-dd');if(dd)dd.classList.remove('open');
  setLang(lang);
}
document.addEventListener('click',function(e){
  var sel=document.getElementById('lang-sel');var dd=document.getElementById('lang-dd');
  if(dd&&sel&&!sel.contains(e.target)&&!dd.contains(e.target))dd.classList.remove('open');
});
// ── AUTH ──
var currentUser=null;
function openAuth(ctx){switchAuthTab(ctx||'signup');openOv('m-auth');}
function switchAuthTab(tab){
  document.getElementById('auth-form-s').style.display=tab==='signup'?'block':'none';
  document.getElementById('auth-form-l').style.display=tab==='login'?'block':'none';
  document.getElementById('auth-tab-s').classList.toggle('on',tab==='signup');
  document.getElementById('auth-tab-l').classList.toggle('on',tab==='login');
}
function doSignup(){ doSignupSupabase(); }
function doLogin(){ doLoginSupabase(); }
function loadUser(){
  var saved=localStorage.getItem('bdg16_user');
  if(saved){try{currentUser=JSON.parse(saved);}catch(e){currentUser=null;}}
  // Supabase session restored by initAuth() called in core.js
}
// ── PAIEMENT ──
function openPayment(planKey){
  var pd=PLAN_DETAILS[planKey];var pn=PLANS[planKey];if(!pd||!pn)return;
  var el; 
  el=document.getElementById('pay-plan-name');if(el)el.textContent=pn.name;
  el=document.getElementById('pay-price');if(el)el.textContent=pd.price;
  el=document.getElementById('pay-features');if(el)el.textContent=pd.feats.slice(0,3).join(' · ');
  window.__pendingPlan=planKey;
  var pe=document.getElementById('pay-email');
  if(pe&&currentUser&&currentUser.email)pe.value=currentUser.email;
  openOv('m-payment');
}
function doPayment(){
  var pe=document.getElementById('pay-email');
  var email=(pe&&pe.value||'').trim().toLowerCase();
  var emailReg=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if(!email||!emailReg.test(email)){
    showToast(t('errEmailInvalid'),'error');
    return;
  }
  var planKey=window.__pendingPlan||plan;
  var pn=PLANS[planKey];
  if(!pn){showToast(t('planNotFound'),'error');return;}
  // Activer le plan
  plan=planKey;
  if(!currentUser) currentUser={email:email,uid:getOrCreateUID(),plan:planKey,createdAt:new Date().toISOString()};
  else currentUser.plan=planKey;
  currentUser.planActivatedAt=new Date().toISOString();
  safeLsSet('bdg16_user',JSON.stringify(currentUser));
  safeLsSet('bdg16_plan',planKey);
  if(profile){profile.userEmail=email;savePr();}
  closeOv('m-payment');
  // Confirmation
  var cnPlan=document.getElementById('confirm-plan');if(cnPlan)cnPlan.textContent=pn.name;
  var cnEmail=document.getElementById('confirm-email');if(cnEmail)cnEmail.textContent=email;
  var d=new Date();d.setDate(d.getDate()+7);
  var cnDate=document.getElementById('confirm-date');if(cnDate)cnDate.textContent=d.getDate()+' '+MNS[d.getMonth()];
  openOv('m-confirm');
  // Topbar + emails
  var tbp=document.getElementById('tbplan');if(tbp)tbp.textContent=pn.name+' ▾';
  sendEmail('subscription',{email:email,plan:pn.name});
  refresh();
}
// ── SELMODE ──
function selMode(m){
  mode=m;
  renderPricingTable();
}
// ── FOOTER LEGAL ──
// LEGAL_CONTENT is static developer-controlled HTML (no user input) - innerHTML is safe here
const LEGAL_CONTENT = {
  faq: '<h2>FAQ</h2>'
    +'<h3>Comment ajouter un contact ?</h3><p>Depuis l\'onglet "Ajouter", renseignez le prénom, la date d\'anniversaire et la relation. Bloomday génère ensuite un message personnalisé.</p>'
    +'<h3>Bloomday envoie les messages lui-même ?</h3><p>Non. Bloomday génère le message, vous le copiez et l\'envoyez via WhatsApp, SMS ou email. Vous gardez le contrôle.</p>'
    +'<h3>Comment annuler mon abonnement ?</h3><p>Depuis votre profil → "Gérer mon abonnement". L\'annulation prend effet à la fin de la période en cours.</p>'
    +'<h3>Mes données sont-elles sécurisées ?</h3><p>Oui. Vos données sont stockées sur Supabase (infrastructure européenne), chiffrées en transit et au repos.</p>',

  cgu: '<h2>Conditions d\'utilisation</h2>'
    +'<p>Dernière mise à jour : mai 2026</p>'
    +'<h3>1. Objet</h3><p>Bloomday est une application de rappel d\'anniversaires et de génération de messages personnalisés. En utilisant Bloomday, vous acceptez les présentes conditions.</p>'
    +'<h3>2. Compte utilisateur</h3><p>Vous êtes responsable de la confidentialité de vos identifiants.</p>'
    +'<h3>3. Usage acceptable</h3><p>Bloomday est destiné à un usage personnel. L\'utilisation à des fins commerciales non autorisées ou de spam est interdite.</p>'
    +'<h3>4. Propriété intellectuelle</h3><p>Les messages générés par l\'IA vous appartiennent une fois envoyés.</p>'
    +'<h3>5. Modification des conditions</h3><p>Bloomday se réserve le droit de modifier ces conditions. Notification par email en cas de changement majeur.</p>',

  rgpd: '<h2>Politique de confidentialité</h2>'
    +'<p>Dernière mise à jour : mai 2026</p>'
    +'<h3>Données collectées</h3><ul><li>Email et nom lors de l\'inscription</li><li>Contacts ajoutés manuellement par vous</li><li>Logs d\'utilisation anonymisés</li></ul>'
    +'<h3>Utilisation</h3><p>Vos données servent uniquement à faire fonctionner Bloomday : rappels, génération de messages, gestion de compte.</p>'
    +'<h3>Partage</h3><p>Aucune donnée n\'est vendue ou partagée avec des tiers à des fins publicitaires.</p>'
    +'<h3>Hébergement</h3><p>Supabase (infrastructure AWS eu-west, Europe). Chiffrement TLS en transit.</p>'
    +'<h3>Vos droits RGPD</h3><ul><li>Accès : support@mybloomday.app</li><li>Suppression : profil → "Supprimer mon compte"</li><li>Portabilité : export sur demande</li></ul>',

  about: '<h2>À propos de Bloomday</h2>'
    +'<p>Bloomday est né d\'une conviction simple : les personnes qui comptent méritent d\'être célébrées, et pas seulement quand on s\'en souvient par hasard.</p>'
    +'<h3>La mission</h3><p>Aider chacun à ne plus jamais rater un moment important pour les gens qu\'il aime, avec des messages authentiques et personnalisés.</p>'
    +'<h3>Contact</h3><p>support@mybloomday.app</p>'
};

function showLegal(type){
  var m=document.getElementById('modal-legal');
  var c=document.getElementById('modal-legal-content');
  if(!m||!c)return;
  c.innerHTML=LEGAL_CONTENT[type]||'';
  m.style.display='flex';
  document.body.style.overflow='hidden';
}

function closeLegal(){
  var m=document.getElementById('modal-legal');
  if(m)m.style.display='none';
  document.body.style.overflow='';
}

// ── SUGGESTIONS FLEURS AFFILIÉES ──
var FLOWER_SUGGESTIONS = {
  birthday: [
    { emoji: '🌹', name: 'Roses rouges', price: '~29€', url: '#' },
    { emoji: '💐', name: 'Bouquet mixte printanier', price: '~35€', url: '#' },
    { emoji: '🌻', name: 'Tournesols du jardin', price: '~24€', url: '#' }
  ],
  wedding: [
    { emoji: '🌸', name: 'Pivoines roses', price: '~45€', url: '#' },
    { emoji: '🤍', name: 'Bouquet blanc élégant', price: '~55€', url: '#' },
    { emoji: '🪷', name: 'Orchidées de luxe', price: '~65€', url: '#' }
  ],
  default: [
    { emoji: '💐', name: 'Bouquet de saison', price: '~30€', url: '#' },
    { emoji: '🌿', name: 'Plante verte zen', price: '~25€', url: '#' },
    { emoji: '🌷', name: 'Tulipes colorées', price: '~22€', url: '#' }
  ]
};

function showFlowerIdeas(name, eventType) {
  var m = document.getElementById('modal-flowers');
  var list = document.getElementById('modal-flowers-list');
  var title = document.getElementById('modal-flowers-title');
  if (!m || !list) return;

  if (title) title.textContent = t('flowerModalTitle') + (name ? ' — ' + name : '');

  var suggestions = FLOWER_SUGGESTIONS[eventType] || FLOWER_SUGGESTIONS.default;
  while (list.firstChild) list.removeChild(list.firstChild);
  suggestions.forEach(function(f) {
    var card = document.createElement('div');
    card.className = 'flower-card';

    var emojiEl = document.createElement('div');
    emojiEl.className = 'flower-emoji';
    emojiEl.textContent = f.emoji;

    var info = document.createElement('div');
    info.className = 'flower-info';
    var nameEl = document.createElement('div');
    nameEl.className = 'flower-name';
    nameEl.textContent = f.name;
    var priceEl = document.createElement('div');
    priceEl.className = 'flower-price';
    priceEl.textContent = f.price;
    info.appendChild(nameEl);
    info.appendChild(priceEl);

    var link = document.createElement('a');
    link.className = 'flower-link';
    link.href = f.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = t('flowerSeeBtn');

    card.appendChild(emojiEl);
    card.appendChild(info);
    card.appendChild(link);
    list.appendChild(card);
  });

  m.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeFlowers() {
  var m = document.getElementById('modal-flowers');
  if (m) m.style.display = 'none';
  document.body.style.overflow = '';
}

// ── CHATBOT BLOOM ──
var _chatHistory = [];
var _chatOpen = false;
var _chatInitialized = false;

function toggleChat() {
  _chatOpen = !_chatOpen;
  var panel = document.getElementById('chat-panel');
  if (!panel) return;
  panel.style.display = _chatOpen ? 'flex' : 'none';
  if (_chatOpen) {
    if (!_chatInitialized) {
      _chatInitialized = true;
      var msgs = document.getElementById('chat-messages');
      if (msgs) {
        var welcome = document.createElement('div');
        welcome.className = 'chat-bubble bot';
        welcome.textContent = t('chatWelcome');
        msgs.appendChild(welcome);
      }
    }
    _updateChatQuotaBar();
    var inp = document.getElementById('chat-input');
    if (inp) inp.focus();
  }
}

function _getChatQuota() {
  if (!window.currentUser) {
    var usedV = parseInt(localStorage.getItem('bloom_chat_session') || '0', 10);
    return { used: usedV, max: 3, type: 'visitor' };
  }
  var monthKey = new Date().toISOString().slice(0, 7);
  var storageKey = 'bloom_chat_' + window.currentUser.uid + '_' + monthKey;
  var usedU = parseInt(localStorage.getItem(storageKey) || '0', 10);
  var plan = (window.profile && window.profile.plan) || 'free';
  var unlimited = ['premium', 'bloom', 'pro', 'enterprise'].indexOf(plan) >= 0;
  return { used: usedU, max: unlimited ? Infinity : 10, type: 'user', storageKey: storageKey };
}

function _incrementChatQuota(quota) {
  if (quota.type === 'visitor') {
    localStorage.setItem('bloom_chat_session', String(quota.used + 1));
  } else if (quota.storageKey) {
    localStorage.setItem(quota.storageKey, String(quota.used + 1));
  }
}

function _updateChatQuotaBar() {
  var bar = document.getElementById('chat-quota-bar');
  if (!bar) return;
  var q = _getChatQuota();
  bar.textContent = q.max === Infinity ? '' : (q.used + '/' + q.max + ' ' + t('chatMsgUsed'));
}

function _addBubble(text, role) {
  var msgs = document.getElementById('chat-messages');
  if (!msgs) return null;
  var el = document.createElement('div');
  el.className = 'chat-bubble ' + role;
  el.textContent = text;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

async function sendChat() {
  var inp = document.getElementById('chat-input');
  if (!inp) return;
  var text = inp.value.trim();
  if (!text) return;

  var quota = _getChatQuota();
  if (quota.used >= quota.max) {
    _addBubble(quota.type === 'visitor' ? t('chatQuotaVisitor') : t('chatQuotaFree'), 'bot');
    return;
  }

  inp.value = '';
  _addBubble(text, 'user');
  var typingEl = _addBubble('…', 'bot typing');

  _chatHistory.push({ role: 'user', content: text });
  if (_chatHistory.length > 20) _chatHistory = _chatHistory.slice(-20);

  try {
    var r = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: _chatHistory })
    });
    var d = await r.json();
    var reply = d.reply || t('chatError');
    _chatHistory.push({ role: 'assistant', content: reply });
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    _addBubble(reply, 'bot');
    _incrementChatQuota(quota);
    _updateChatQuotaBar();
  } catch (e) {
    if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
    _addBubble(t('chatError'), 'bot');
  }
}
