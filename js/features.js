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
        var nm={id:'m'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
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
  var ov=document.createElement('div');
  ov.className='upg-overlay';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  var md=document.createElement('div');
  md.style.cssText='background:var(--card);border-radius:20px;padding:24px 20px;width:100%;max-width:400px;text-align:center';

  var icon=document.createElement('div');
  icon.style.cssText='font-size:40px;margin-bottom:12px';
  icon.textContent='🌸';
  md.appendChild(icon);

  var ttl=document.createElement('div');
  ttl.style.cssText='font-size:18px;font-weight:800;margin-bottom:6px';
  ttl.textContent=planName+' — '+price+t('perMonth');
  md.appendChild(ttl);

  var sub=document.createElement('div');
  sub.style.cssText='font-size:14px;color:var(--txt2);margin-bottom:20px;line-height:1.5';
  sub.textContent=t('upgradeContactMsg')||'Le paiement en ligne arrive bientôt. Pour activer votre plan, contactez-nous par email.';
  md.appendChild(sub);

  var mailBtn=document.createElement('a');
  mailBtn.href='mailto:contact@bloomday.app?subject='+encodeURIComponent('Activation plan '+planName);
  mailBtn.style.cssText='display:block;margin-bottom:10px;text-decoration:none';
  var mailBtnInner=document.createElement('button');
  mailBtnInner.className='btn P fw';
  mailBtnInner.textContent='✉ Contacter pour activer';
  mailBtn.appendChild(mailBtnInner);
  md.appendChild(mailBtn);

  var cancelBtn=document.createElement('button');
  cancelBtn.className='btn fw';
  cancelBtn.textContent=t('downgradeCancelBtn');
  cancelBtn.onclick=function(){ov.remove();};
  md.appendChild(cancelBtn);

  ov.appendChild(md);document.body.appendChild(ov);
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
  ltit.textContent='Langue';lcard.appendChild(ltit);
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
}

document.addEventListener('DOMContentLoaded',function(){
  handleHash();
  window.addEventListener('hashchange',handleHash);
  document.getElementById('s-home').style.display='block';
  // Rendre tous les plans en cartes scrollables (adaptatif iOS/Android/iPad/desktop)
  renderAllPlans('perso');
  renderAllPlans('biz');
});

// ── TOAST ──
function showToast(msg,type){
  var ex=document.getElementById('bd-toast');if(ex)ex.remove();
  var t2=document.createElement('div');t2.id='bd-toast';
  t2.style.cssText='position:fixed;bottom:88px;left:50%;transform:translateX(-50%);'+
    'background:'+(type==='success'?'#18A86B':'#E05C8A')+';color:#fff;'+
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
function doSignup(){
  var nameEl=document.getElementById('auth-name');
  var emailEl=document.getElementById('auth-email');
  var phoneEl=document.getElementById('auth-phone');
  var passEl=document.getElementById('auth-pass');
  var name=(nameEl&&nameEl.value||'').trim();
  var email=(emailEl&&emailEl.value||'').trim().toLowerCase();
  var phone=(phoneEl&&phoneEl.value||'').trim();
  var pass=(passEl&&passEl.value||'').trim();
  // Validation
  if(!name){showToast('Votre prénom est requis','error');return;}
  // Validation email stricte
  var emailReg=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if(!email||!emailReg.test(email)){showToast(t('errEmailInvalid'),'error');return;}
  if(pass.length<8){showToast(t('errPassShort'),'error');return;}
  // Créer le compte
  currentUser={name:name,email:email,phone:phone,uid:getOrCreateUID(),plan:plan,createdAt:new Date().toISOString()};
  safeLsSet('bdg16_user',JSON.stringify(currentUser));
  profile.userName=name;profile.userEmail=email;
  if(phone)profile.userPhone=phone;
  savePr();
  closeOv('m-auth');
  showToast(t('welcomeUser')+' '+name.split(' ')[0]+' !','success');
  // Email bienvenue simulé
  sendEmail('welcome',{name:name,email:email});
  updateTopbar();
  refresh();
}
function doLogin(){
  var emailEl=document.getElementById('auth-login-email');
  var passEl=document.getElementById('auth-login-pass');
  var email=(emailEl&&emailEl.value||'').trim();
  var pass=(passEl&&passEl.value||'').trim();
  if(!email||!pass){showToast('Remplissez tous les champs','error');return;}
  var saved=localStorage.getItem('bdg16_user');
  if(saved){try{currentUser=JSON.parse(saved);}catch(e){currentUser=null;}}
  if(currentUser){closeOv('m-auth');showToast('Bienvenue '+currentUser.name+' !','success');}
  else{showToast('Aucun compte trouvé','error');switchAuthTab('signup');}
}
function loadUser(){
  var saved=localStorage.getItem('bdg16_user');
  if(saved){try{currentUser=JSON.parse(saved);}catch(e){currentUser=null;}}
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
    showToast('Entrez un email valide (ex: nom@domaine.fr)','error');
    return;
  }
  var planKey=window.__pendingPlan||plan;
  var pn=PLANS[planKey];
  if(!pn){showToast('Plan introuvable','error');return;}
  // Activer le plan
  plan=planKey;
  if(!currentUser) currentUser={email:email,uid:getOrCreateUID(),plan:planKey,createdAt:new Date().toISOString()};
  else currentUser.plan=planKey;
  currentUser.planActivatedAt=new Date().toISOString();
  safeLsSet('bdg16_user',JSON.stringify(currentUser));
  localStorage.setItem('bdg16_plan',planKey);
  if(profile){profile.userEmail=email;savePr();}
  closeOv('m-payment');
  // Confirmation
  var cnPlan=document.getElementById('confirm-plan');if(cnPlan)cnPlan.textContent=pn.name;
  var cnEmail=document.getElementById('confirm-email');if(cnEmail)cnEmail.textContent=email;
  var d=new Date();d.setDate(d.getDate()+7);
  var months=['janv.','fév.','mars','avr.','mai','juin','juil.','août','sep.','oct.','nov.','déc.'];
  var cnDate=document.getElementById('confirm-date');if(cnDate)cnDate.textContent='le '+d.getDate()+' '+months[d.getMonth()];
  openOv('m-confirm');
  // Topbar + emails
  var tbp=document.getElementById('tbplan');if(tbp)tbp.textContent=pn.name+' ▾';
  sendEmail('subscription',{email:email,plan:pn.name});
  refresh();
}
// ── SELMODE ──
function selMode(m){
  mode=m;
  var lbp=document.getElementById('lbp');if(lbp)lbp.classList.toggle('on',m==='perso');
  var lbb=document.getElementById('lbb');if(lbb)lbb.classList.toggle('on',m==='biz');
  var lperso=document.getElementById('lperso');if(lperso)lperso.style.display=m==='perso'?'block':'none';
  var lbiz=document.getElementById('lbiz');if(lbiz)lbiz.style.display=m==='biz'?'block':'none';
  renderAllPlans(m);
}