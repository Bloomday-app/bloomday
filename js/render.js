function rHome(){
  const el=document.getElementById('s-home');
  if(!el||el.style.display==='none')return;
  const now=new Date();
  const m=mems();
  const todays=m.filter(p=>isToday(p.day,p.month));
  const missed=m.filter(p=>wasYest(p.day,p.month));
  const upcoming=m.filter(p=>{const d=daysTill(p.day,p.month);return d>0&&d<=7;}).sort((a,b)=>daysTill(a.day,a.month)-daysTill(b.day,b.month));
  const thisMonthCount=m.filter(p=>p.month===now.getMonth()+1).length;
  const nextEv=m.filter(p=>daysTill(p.day,p.month)>0).sort((a,b)=>daysTill(a.day,a.month)-daysTill(b.day,b.month))[0];
  const pl=PL();
  let h='';

  // --- Prompt push notifs ---
  if(!pushGranted&&window.Notification&&Notification.permission==='default'&&!localStorage.getItem('bdg16_push_dismissed')&&m.length>0){
    h+='<div class="push-prompt"><div style="font-size:26px">🔔</div>';
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--b3d)">Ne jamais rater un anniversaire</div>';
    h+='<div style="font-size:12px;color:var(--b3d);margin-top:2px">Activez les alertes du matin.</div>';
    h+='<div class="brow" style="margin-top:8px">';
    h+='<button class="btn G sm" onclick="requestPush().then(function(){rHome();})">🔔 Activer</button>';
    h+='<button class="btn sm" onclick="safeLsSet(\'bdg16_push_dismissed\',\'1\');rHome()">Plus tard</button>';
    h+='</div></div></div>';
  }

  // --- Stats ---
  h+='<div class="stg">';
  h+='<div class="stat"><div class="stn">'+m.length+'</div><div class="stl">'+t('statMembersLbl')+'</div></div>';
  h+='<div class="stat"><div class="stn">'+thisMonthCount+'</div><div class="stl">'+t('statMonthLbl')+'</div></div>';
  h+='<div class="stat"><div class="stn">'+(stats.celeb||0)+'</div><div class="stl">'+t('statCelebLbl')+'</div></div>';
  h+='</div>';

  // --- Limite plan ---
  if(pl.msgs<999){
    const left=Math.max(0,pl.msgs-(stats.msgsM||0));
    h+='<div class="plb">';
    h+='<div><div style="font-size:13px;font-weight:700;color:var(--b4d)">'+t('planInfoLabel')+' '+PLANS[plan].name+'</div>';
    h+='<div style="font-size:12px;color:var(--b4)">'+m.length+'/'+pl.mm+' membres · '+left+' msg restant'+(left!==1?'s':'')+'</div></div>';
    h+='<button class="btn V sm" onclick="goLand()">'+t('upgradeLabel')+'</button></div>';
  }

  // --- Urgence (raté hier) ---
  missed.forEach(function(p){
    h+='<div class="card curg">';
    h+='<div style="font-size:14px;font-weight:700;color:var(--b2d);margin-bottom:4px">⚡ Anniversaire raté hier !</div>';
    h+='<div style="font-size:13px;color:var(--b2);margin-bottom:8px">C\'était l\'anniversaire de <strong>'+esc(p.name)+'</strong>. Il n\'est pas trop tard !</div>';
    h+='<div id="urg-'+p.id+'"><button class="btn R sm" onclick="genUrgence('+p.id+',\'urg-'+p.id+'\')">'+t('urgentBtn')+'</button></div>';
    h+='</div>';
  });

  // --- Prochain anniversaire ---
  if(nextEv){
    const d=daysTill(nextEv.day,nextEv.month);
    const age=ageBday(nextEv.day,nextEv.month,nextEv.year);
    const idx=m.indexOf(nextEv);
    h+='<div class="card cp" style="display:flex;align-items:center;gap:14px;margin-bottom:16px">';
    h+='<div style="text-align:center;min-width:58px"><div style="font-family:var(--ff-title);font-size:42px;font-weight:800;color:var(--b4d);line-height:1">'+d+'</div>';
    h+='<div style="font-size:10px;color:var(--b4);margin-top:1px;font-weight:700">jour'+(d>1?'s':'')+'</div></div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<div style="font-size:11px;font-weight:700;color:var(--b4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Prochain '+tLbl(nextEv.type)+'</div>';
    h+='<div style="display:flex;align-items:center;gap:8px">';
    h+='<div class="av '+AV[idx%4]+'" style="width:34px;height:34px;font-size:11px">'+(nextEv.photo?'<img src="'+nextEv.photo+'" alt="">':ini(nextEv.name))+'</div>';
    h+='<div><div style="font-size:15px;font-weight:700;color:var(--b4d)">'+esc(nextEv.name.split(' ')[0])+'</div>';
    h+='<div style="font-size:12px;color:var(--b4);margin-top:1px">'+nextEv.day+' '+MN[nextEv.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
    if(MS[age])h+='<div style="font-size:11px;color:var(--b4d);margin-top:3px;font-weight:700">'+MS[age]+'</div>';
    h+='</div></div></div></div>';
  }

  // --- Semaine ---
  h+='<div class="sh">'+t('thisWeekLabel')+'</div><div class="wrow">';
  for(let i=0;i<7;i++){
    const d=new Date(now);d.setDate(now.getDate()+i);
    const dd=d.getDate(),mm=d.getMonth()+1;
    const hb=m.some(function(p){return p.day===dd&&p.month===mm;});
    h+='<div class="dc'+(hb?' hb':'')+(i===0?' td':'')+'">';
    h+='<div class="dl">'+JRS[d.getDay()]+'</div>';
    h+='<div class="dn" style="color:'+(i===0?'#fff':hb?'var(--b2d)':'var(--txt)')+'">'+dd+'</div>';
    h+=(hb?'<div class="dd"></div>':'<div style="height:9px"></div>');
    h+='</div>';
  }
  h+='</div>';

  // --- Aujourd'hui ---
  if(todays.length>0){
    h+='<div class="sh" style="color:var(--b2)">🌸 Aujourd\'hui</div>';
    // Sélecteur ton
    const allTpl=[].concat(DTPL,utpls);
    h+='<div style="margin-bottom:12px"><label style="margin-top:0">Ton du message :</label><div class="chips" style="margin-bottom:0">';
    allTpl.forEach(function(t){
      h+='<button class="chip'+(actTpl===t.id?' on':'')+'" onclick="setTpl(\''+t.id+'\',this)">'+t.e+' '+t.n+'</button>';
    });
    h+='</div></div>';
    todays.forEach(function(p){
      const age=ageBday(p.day,p.month,p.year);
      const ms=MS[age];
      const idx=m.indexOf(p);
      h+='<div class="card cr">';
      h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
      h+='<div class="av '+AV[idx%4]+'" style="width:50px;height:50px;font-size:16px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div><div style="font-family:var(--ff-title);font-size:18px;font-weight:700;color:var(--b2d)">'+tIco(p.type)+' '+esc(p.name)+'</div>';
      h+='<div style="font-size:13px;color:var(--b2);margin-top:2px">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(p.year?' '+p.year:'')+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
      if(ms)h+='<div style="display:inline-block;background:var(--b4l);color:var(--b4d);font-size:11px;padding:3px 10px;border-radius:20px;margin-top:5px;font-weight:700">'+ms+'</div>';
      h+='</div></div>';
      if(p.phone)h+='<div style="font-size:12px;color:var(--b2);margin-bottom:8px">📞 '+esc(p.phone)+'</div>';
      h+='<div id="h-msg-'+p.id+'"><div class="brow">';
      h+='<button class="btn G" onclick="genMsg('+p.id+',\'h-msg-'+p.id+'\')">'+t('msgBtn')+'</button>';
      if(pl.gifts)h+='<button class="btn V" onclick="genGift('+p.id+',\'h-gift-'+p.id+'\')">'+t('giftBtn')+'</button>';
      if(pl.cards)h+='<button class="btn O" onclick="genCard('+p.id+',\'h-card-'+p.id+'\')">'+t('cardBtn')+'</button>';
      h+='</div></div>';
      h+='<div id="h-gift-'+p.id+'"></div><div id="h-card-'+p.id+'"></div>';
      h+='</div>';
    });
    if(todays.length>1)h+='<button class="btn P fw" onclick="prepAll()" style="margin-bottom:12px">🌸 Préparer tous les messages</button>';
  } else if(m.length===0){
    h+='<div class="es"><div style="margin-bottom:14px"><svg width="64" height="64"><use href="#bi"/></svg></div>';
    h+='<div style="font-family:var(--ff-title);font-size:18px;font-weight:700;margin-bottom:10px">Bienvenue sur Bloomday !</div>';
    h+='<div style="margin-bottom:16px">Ajoutez vos premiers membres pour commencer à célébrer.</div>';
    h+='<button class="btn P" onclick="showSec(\'add\',2)">🌸 Ajouter un membre</button>';
    h+='</div>';
  } else {
    // Pas d'anniv aujourd'hui — afficher les prochains
    const nextFew=m.filter(function(p){return daysTill(p.day,p.month)>0;}).sort(function(a,b){return daysTill(a.day,a.month)-daysTill(b.day,b.month);}).slice(0,3);
    h+='<div class="card" style="background:linear-gradient(135deg,var(--b4l),var(--b1l));border:1.5px solid var(--b4);padding:20px;text-align:center;margin-bottom:12px">';
    h+='<div style="font-size:32px;margin-bottom:8px">🌸</div>';
    h+='<div style="font-family:var(--ff-title);font-size:17px;font-weight:700;color:var(--b4d);margin-bottom:5px">Aucun anniversaire aujourd\'hui</div>';
    h+='<div style="font-size:13px;color:var(--b4d);opacity:.75">Profitez-en pour préparer les prochains</div>';
    h+='</div>';
    if(nextFew.length>0){
      h+='<div class="sh">🎯 À préparer</div>';
      nextFew.forEach(function(p){
        const d=daysTill(p.day,p.month);
        const age=ageBday(p.day,p.month,p.year);
        const idx=m.indexOf(p);
        h+='<div class="card cb" style="display:flex;align-items:center;gap:12px">';
        h+='<div class="av '+AV[idx%4]+'" style="width:46px;height:46px;font-size:15px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
        h+='<div style="flex:1;min-width:0">';
        h+='<div style="font-size:15px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'</div>';
        h+='<div style="font-size:12px;color:var(--b1d);margin-top:2px">'+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t('yearsOld'):'')+'</div>';
        h+='<div style="font-size:11px;font-weight:700;color:var(--b1);margin-top:3px">dans '+d+' jour'+(d>1?'s':'')+'</div>';
        h+='</div>';
        h+='<div id="prep-'+p.id+'"><button class="btn O sm" onclick="genMsg('+p.id+',\'prep-'+p.id+'\')">'+t('prepareBtnLabel')+'</button></div>';
        h+='</div>';
      });
    }
  }

  // --- 7 jours ---
  if(upcoming.length>0){
    h+='<div class="sh" style="margin-top:14px">'+t('in7daysTitle')+'</div>';
    upcoming.forEach(function(p){
      const d=daysTill(p.day,p.month);
      const age=ageBday(p.day,p.month,p.year);
      const idx=m.indexOf(p);
      h+='<div class="card cb">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[idx%4]+'">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'<span class="pbdg pbs">dans '+d+'j</span></div>';
      h+='<div style="font-size:12px;color:var(--b1d)">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
      h+='</div></div>';
      h+='<div id="up-'+p.id+'"><div class="brow" style="margin-top:8px"><button class="btn sm" onclick="genMsg('+p.id+',\'up-'+p.id+'\')">'+t('prepareBtnLabel')+'</button></div></div>';
      h+='</div>';
    });
  }

  // --- Vue mensuelle ---
  const monthAll=m.filter(function(p){return p.month===now.getMonth()+1;}).sort(function(a,b){return a.day-b.day;});
  if(monthAll.length>0){
    h+='<div class="sh" style="margin-top:16px">'+t('allOfMonth')+' '+MN[now.getMonth()]+'</div>';
    h+='<div class="card" style="padding:8px 14px">';
    monthAll.forEach(function(p){
      const age=ageBday(p.day,p.month,p.year);
      const isPast=now.getDate()>p.day;
      const isTod=isToday(p.day,p.month);
      h+='<div class="me">';
      h+='<div class="med'+(isPast&&!isTod?' past':'')+'">'+p.day+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:13px;font-weight:'+(isTod?700:500)+';color:'+(isTod?'var(--b2d)':'var(--txt)')+'">'+tIco(p.type)+' '+esc(p.name)+'</div>';
      h+='<div style="font-size:11px;color:var(--txt2)">'+tLbl(p.type)+(age?' · '+age+' '+t('yearsOld'):'')+'</div>';
      h+='</div>';
      if(isTod)h+='<span class="pbdg pbt">'+t('todayBadge')+'</span>';
      h+='</div>';
    });
    h+='</div>';
  }

  // --- Rappel hebdo admins ---
  if(admins.length>0){
    const wb=[];
    for(let i=0;i<7;i++){
      const d=new Date(now);d.setDate(now.getDate()+i);
      m.filter(function(p){return p.day===d.getDate()&&p.month===d.getMonth()+1;}).forEach(function(p){wb.push({p:p,o:i});});
    }
    if(wb.length>0){
      const lines=wb.map(function(x){return(x.o===0?t('todayLabel'):x.o===1?t('tomorrowLabel'):'Dans '+x.o+'j')+' : '+x.p.name;}).join('\n');
      const subj=encodeURIComponent('Bloomday — Rappels');
      const body=encodeURIComponent(lines);
      h+='<div class="sh" style="margin-top:16px">Rappels</div>';
      h+='<div class="nb2"><div style="font-size:13px;font-weight:700;color:var(--b3d);margin-bottom:8px">🌸 Cette semaine : '+wb.map(function(x){return esc(x.p.name.split(' ')[0]);}).join(', ')+'</div>';
      h+='<div class="brow">';
      admins.forEach(function(a){
        if(a.email)h+='<a href="mailto:'+a.email+'?subject='+subj+'&body='+body+'"><button class="btn V sm">✉ '+esc(a.name.split(' ')[0])+'</button></a>';
        if(a.phone)h+='<a href="https://wa.me/'+a.phone.replace(/[^0-9]/g,'')+'?text='+subj+'%0A'+body+'" target="_blank"><button class="btn G sm">💬 '+esc(a.name.split(' ')[0])+'</button></a>';
      });
      h+='</div></div>';
    }
  }

  // --- Conseil du jour ---
  var tips=[
    {i:'💡',t:'Astuce',d:t('tip1d')},
    {i:'🌍',t:'50+ pays',d:t('tip2d')},
    {i:'🌿',t:'Ripple',d:t('tip3d')},
    {i:'🎁',t:'Ambassador',d:t('tip4d')},
    {i:'🎁',t:'Cadeaux IA',d:t('tip5d')},
  ];
  const tip=(tArr('tips')[new Date().getDate()%5]||tArr('tips')[0]);
  h+='<div class="sh" style="margin-top:16px">'+t('tipSectionTitle')+'</div>';
  h+='<div style="background:linear-gradient(135deg,var(--b3l),var(--b4l));border:1px solid var(--b3);border-radius:18px;padding:16px;display:flex;gap:12px;align-items:flex-start">';
  h+='<div style="font-size:28px;flex-shrink:0">'+tip.i+'</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--b3d);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">'+tip.t+'</div>';
  h+='<div style="font-size:13px;color:var(--b3d);line-height:1.65">'+tip.d+'</div></div>';
  h+='</div>';

  el.innerHTML=h;
}

function setTpl(id,btn){actTpl=id;document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));if(btn)btn.classList.add('on');}
async function prepAll(){const m=mems(),todays=m.filter(p=>isToday(p.day,p.month));for(const p of todays)await genMsg(p.id,'h-msg-'+p.id);}

// ═══════════════════════════════════
// RENDER MEMBRES (Axe 2 — recherche découplée)
// ═══════════════════════════════════
function rMembers(){
  const el=document.getElementById('s-members');if(!el||el.style.display==='none')return;
  const m=mems();
  // Axe 2 : filtre appliqué uniquement sur searchFiltered (état local)
  let filtered=searchFiltered!==null?searchFiltered:m;
  if(fMonth>0)filtered=filtered.filter(p=>p.month===fMonth);
  const pl=PL();
  // Champ de recherche FIXE — ne se recrée pas à chaque frappe
  // → le clavier reste ouvert sur mobile
  let h=`<div class="sw">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" id="search-inp" data-i18n-placeholder="searchPlaceholder" placeholder="Rechercher un membre…" value="${esc(searchInput)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      inputmode="search"
      oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter'){this.blur();}">
    <button id="srch-clr" class="clear-btn" style="display:${searchInput?'flex':'none'}" onclick="clearSearch()">✕</button>
  </div>`;
  h+=`<div class="chips"><button class="chip${fMonth===0?' on':''}" onclick="fMonth=0;rMembers()">Tous</button>`;
  for(let mo=1;mo<=12;mo++){if(m.some(p=>p.month===mo))h+=`<button class="chip${fMonth===mo?' on':''}" onclick="fMonth=${mo};rMembers()">${MNS[mo-1]}</button>`;}
  h+=`</div>`;
  if(!filtered.length){h+=`<div class="es">${m.length===0?t('noMembersYet'):t('noSearchResult')}</div>`;el.innerHTML=h;return;}
  h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} membre${filtered.length!==1?'s':''} · Plan ${PLANS[plan].name}</div>`;
  filtered.forEach(p=>{
    const idx=m.indexOf(p),tod=isToday(p.day,p.month),days=daysTill(p.day,p.month),soon=days>0&&days<=7;
    const age=ageBday(p.day,p.month,p.year),ms=MS[age],isEd=editId===p.id;
    const h2=hist[String(p.id)]||[];const isBiz=p.type==='work',ancOk=isBiz&&age&&[1,3,5,10,15,20,25,30].includes(age);
    h+=`<div class="prow"><div class="av ${isBiz?'av4':AV[idx%4]}">${p.photo?`<img src="${p.photo}" alt="">`:ini(p.name)}</div>
    <div class="pinfo"><div class="pname">${tIco(p.type)} ${esc(p.name)}${tod?'<span class="pbdg pbt">Aujourd\'hui !</span>':''}${soon&&!tod?`<span class="pbdg pbs">'+t('inXdaysMini').replace('%d',String(days))+'</span>`:''}${ms&&(tod||soon)&&!isBiz?'<span class="pbdg pbk">Âge clé</span>':''}</div>
    <div class="pmeta">${p.day} ${MN[p.month-1]}${p.year?' '+p.year:''}${age&&!isBiz?' — '+age+' '+t('yearsOld'):isBiz&&age?' — '+age+' an(s)':''}</div>
    ${ancOk?`<div style="font-size:11px;color:var(--bizd);margin-top:2px;font-weight:700">🏆 ${age} an${age>1?'s':''} d'ancienneté !</div>`:''}
    ${ms&&!isBiz?`<div style="font-size:11px;color:var(--b4d);margin-top:2px;font-weight:600">${ms}</div>`:''}
    ${p.phone?`<div class="pmeta">📞 ${esc(p.phone)}</div>`:''}
    ${h2.length>0?`<details><summary>${h2.length} ${t('msgCountLabel')} envoyé${h2.length>1?'s':''}</summary><div style="margin-top:6px">${h2.slice(-3).reverse().map(x=>`<div class="hi"><div class="hid">${x.date}</div><div style="font-size:12px;color:var(--txt2);margin-top:2px;line-height:1.5">${esc((x.text||'').substring(0,140))}${(x.text||'').length>140?'…':''}</div></div>`).join('')}</div></details>`:''}
    ${isEd?`<div class="ef"><div style="font-size:13px;font-weight:700;color:var(--b1d);margin-bottom:8px">✏️ Modifier</div>
    <div class="f3"><div><label>Jour</label><input id="em-day" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="${p.day}" inputmode="numeric"></div><div><label>Mois</label><select id="em-month"><option value="">—</option></select></div><div><label>Année</label><input id="em-year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="${p.year||''}" inputmode="numeric"></div></div>
    <label>Nom</label><input id="em-name" value="${esc(p.name)}">
    <label>Téléphone</label><input id="em-phone" type="tel" value="${esc(p.phone||'')}">
    <label>'+t('genderEditLabel')+'</label><select id="em-gender"><option value=""${!p.gender?' selected':''}>'+t('genderNone')+'</option><option value="femme"${p.gender==='femme'?' selected':''}>'+t('genderF')+'</option><option value="homme"${p.gender==='homme'?' selected':''}>'+t('genderM')+'</option><option value="enfant"${p.gender==='enfant'?' selected':''}>'+t('genderKid')+'</option></select>
    <label>'+t('notesEditLabel')+'</label><textarea id="em-note">${esc(p.note||'')}</textarea>
    <div class="brow" style="margin-top:10px"><button class="btn G" style="flex:1" onclick="saveEdit(${p.id})">✓ Enregistrer</button><button class="btn" onclick="togEdit(${p.id})">Annuler</button></div></div>`:''}
    <div id="m-msg-${p.id}"></div><div id="m-gift-${p.id}"></div></div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button class="btn O sm" onclick="togEdit(${p.id})">${isEd?'✕':'✏'}</button>
    <button class="btn G sm" onclick="genMsg(${p.id},'m-msg-${p.id}')">✨</button>
    ${pl.gifts?`<button class="btn V sm" onclick="genGift(${p.id},'m-gift-${p.id}')">🎁</button>`:''}
    <button class="btn D sm" onclick="removeMem(${p.id})">✕</button></div></div>`;
  });
  // Div séparé pour la liste — mis à jour sans recréer le champ
  h+=`<div id="members-result"></div>`;
  h+=`<button class="exbtn" onclick="exportPDF()">📄 Exporter en PDF</button>`;
  el.innerHTML=h;
  // Rendre la liste immédiatement
  const listEl2=document.getElementById('members-result');
  if(listEl2)renderMembersList(listEl2);
  // Refocaliser le champ si recherche active (sans provoquer de scroll)
  if(searchInput){
    const inp=document.getElementById('search-inp');
    if(inp&&document.activeElement!==inp)inp.focus({preventScroll:true});
  }
}

// Recherche : temps réel lettre par lettre, sans perte de focus clavier
// Le champ reste actif — seule la liste se met à jour
function onSearchInput(val){
  searchInput=val;
  clearTimeout(searchDebounceTimer);
  // Filtre immédiat à chaque lettre tapée
  const m=mems();
  searchFiltered=val.trim()?m.filter(p=>(p.name||'').toLowerCase().includes(val.toLowerCase())||(p.phone&&p.phone.includes(val))):null;
  // Mise à jour partielle de la liste SANS toucher au champ de recherche
  const listEl=document.getElementById('members-result');
  if(listEl){
    renderMembersList(listEl);
  } else {
    rMembers(); // Fallback si le DOM n'est pas encore prêt
  }
  // Bouton clear
  const clr=document.getElementById('srch-clr');
  if(clr)clr.style.display=val?'flex':'none';
}
function applySearch(val){onSearchInput(val);}
function clearSearch(){
  searchInput='';searchFiltered=null;
  clearTimeout(searchDebounceTimer);
  const inp=document.getElementById('search-inp');
  if(inp){inp.value='';inp.focus();}
  const clr=document.getElementById('srch-clr');
  if(clr)clr.style.display='none';
  const listEl=document.getElementById('members-result');
  if(listEl){renderMembersList(listEl);}else{rMembers();}
}
// Rendu de la liste seule (sans recréer le champ — clavier fixe)
function renderMembersList(listEl){
  const m=mems(),pl=PL();
  let filtered=searchFiltered!==null?searchFiltered.slice():(m.slice());
  if(fMonth>0)filtered=filtered.filter(p=>p.month===fMonth);
  if(!filtered.length){
    listEl.innerHTML=`<div class="es" style="padding:1.5rem">${m.length===0?t('noMembersYet'):searchInput?'Aucun résultat pour "'+esc(searchInput)+'".':"Aucun membre ce mois-ci."}</div>`;
    return;
  }
  listEl.innerHTML=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} membre${filtered.length!==1?'s':''}</div>`
  +filtered.map(p=>{
    const idx=m.indexOf(p),tod=isToday(p.day,p.month),days=daysTill(p.day,p.month),soon=days>0&&days<=7;
    const age=ageBday(p.day,p.month,p.year),ms=MS[age],isBiz=p.type==='work';
    const hh=hist[String(p.id)]||[];
    return `<div class="prow"><div class="av ${isBiz?'av4':AV[idx%4]}">${p.photo?`<img src="${p.photo}" alt="">`:ini(p.name)}</div>
    <div class="pinfo"><div class="pname">${tIco(p.type)} ${esc(p.name)}${tod?'<span class="pbdg pbt">Aujourd\'hui !</span>':''}${soon&&!tod?`<span class="pbdg pbs">dans ${days}j</span>`:''}</div>
    <div class="pmeta">${p.day} ${MN[p.month-1]}${p.year?' '+p.year:''}${age&&!isBiz?' — '+age+' '+t('yearsOld'):isBiz&&age?' — '+age+' an(s)':''}</div>
    ${p.phone?`<div class="pmeta">📞 ${esc(p.phone)}</div>`:''}
    ${hh.length>0?`<details><summary>${hh.length} message${hh.length>1?'s':''} envoyé${hh.length>1?'s':''}</summary><div style="margin-top:5px">${hh.slice(-2).reverse().map(x=>`<div class="hi"><div class="hid">${x.date}</div><div style="font-size:12px;color:var(--txt2);line-height:1.5">${esc((x.text||'').substring(0,120))}…</div></div>`).join('')}</div></details>`:''}
    <div id="m-msg-${p.id}"></div></div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button class="btn O sm" onclick="togEdit(${p.id})">✏</button>
    <button class="btn G sm" onclick="genMsg(${p.id},'m-msg-${p.id}')">✨</button>
    ${pl.gifts?`<button class="btn V sm" onclick="genGift(${p.id},'m-gift-${p.id}')">🎁</button>`:''}
    <button class="btn D sm" onclick="removeMem(${p.id})">✕</button></div></div>`;
  }).join('');
}

// ═══════════════════════════════════
// RENDER FÊTES
// ═══════════════════════════════════
function getActiveFetes(){
  const now=new Date(),y=now.getFullYear();
  const cats=new Set(profile.cats||['universal','fr','christian']);
  var fetes=FETES.filter(function(f){return f.c.some(function(c){return !!cats[c];})});
  const e=easter(y);
  if(cats.has('christian')){
    fetes.push({n:'Pâques',i:'🥚',m:e.m,d:e.d,c:['christian']});
    const lun=new Date(y,e.m-1,e.d+1);fetes.push({n:'Lundi de Pâques',i:'✝️',m:lun.getMonth()+1,d:lun.getDate(),c:['christian']});
    const asc=new Date(y,e.m-1,e.d+39);fetes.push({n:'Ascension',i:'✝️',m:asc.getMonth()+1,d:asc.getDate(),c:['christian']});
    const cen=new Date(y,e.m-1,e.d-46);fetes.push({n:'Mercredi des Cendres',i:'✝️',m:cen.getMonth()+1,d:cen.getDate(),c:['christian']});
  }
  const mc=['muslim','ma','dz','tn','sn','ml','ne','gn','td','mr','eg','lb','sa','km','dj'];
  if(mc.some(c=>cats[c])){const ram=ramadan(y);const re=new Date(y,ram.m-1,ram.d+29);fetes.push({n:'Début Ramadan',i:'🌙',m:ram.m,d:ram.d,c:['muslim']});fetes.push({n:'Aïd el-Fitr',i:'🌙',m:re.getMonth()+1,d:re.getDate(),c:['muslim']});fetes.push({n:'Aïd el-Adha',i:'🕌',m:6,d:7,c:['muslim']});}
  if(cats.has('jewish')){fetes.push({n:'Pessah',i:'🍷',m:4,d:13,c:['jewish']});fetes.push({n:'Rosh Hashana',i:'🍎',m:10,d:3,c:['jewish']});}
  if(cats.has('cn')||cats.has('jp')){const c=cny(y);fetes.push({n:'Nouvel An Chinois',i:'🐉',m:c.m,d:c.d,c:['cn','jp']});}
  if(cats.has('in')||cats.has('hindu')){fetes.push({n:'Diwali',i:'🪔',m:10,d:20,c:['in','hindu']});fetes.push({n:'Holi',i:'🎨',m:3,d:14,c:['in','hindu']});}
  return fetes.map(function(f){return {n:f.n,i:f.i,m:f.m,d:f.d,c:f.c,dl:daysTill(f.d,f.m)};}).sort(function(a,b){return a.dl-b.dl;});
}
function rEvents(){
  const el=document.getElementById('s-events');if(!el)return;
  const fetes=getActiveFetes(),up=fetes.filter(f=>f.dl<=90);
  let h=`<div class="sh">Prochaines fêtes & célébrations</div><div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Personnalisez dans <strong style="color:var(--txt)">Plus → Mon profil</strong></div><div class="card" style="padding:6px 14px">`;
  if(!up.length)h+=`<div style="font-size:13px;color:var(--txt2);padding:10px 0">Aucune fête dans les 90 prochains jours.</div>`;
  up.forEach(f=>{const lbl=f.dl===0?'Aujourd\'hui !':f.dl===1?t('tomorrowLabel'):`dans ${f.dl}j`;const st=f.dl===0?'background:var(--b2l);color:var(--b2d)':f.dl<=7?'background:var(--b1l);color:var(--b1d)':'background:var(--bg2);color:var(--txt2)';h+=`<div class="fr"><div class="fi">${f.i}</div><div style="flex:1"><div class="fn">${tFete(tFete(f.n))}</div><div class="fd">${f.d} ${MN[f.m-1]}</div></div><div class="fpill" style="${st}">${lbl}</div></div>`;});
  h+=`</div>`;
  el.innerHTML=h;
}

// ═══════════════════════════════════
// RENDER CALENDRIER
// ═══════════════════════════════════
function rCal(){
  var el=document.getElementById('s-cal'); if(!el)return;
  var now=new Date();
  var h='<div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px 12px">';
  h+='<button class="btn sm" onclick="calPrev()">&#8249;</button>';
  h+='<div style="font-size:16px;font-weight:700">'+MN[calM]+' '+calY+'</div>';
  h+='<button class="btn sm" onclick="calNext()">&#8250;</button></div>';
  // Jours de la semaine
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:8px">';
  for(var di=0;di<7;di++){h+='<div style="text-align:center;font-size:10px;font-weight:700;color:var(--txt2);padding:4px 0">'+JRS[di]+'</div>';}
  h+='</div>';
  // Grille des jours
  var firstDay=new Date(calY,calM,1).getDay();
  var daysInMonth=new Date(calY,calM+1,0).getDate();
  var am=allMems();
  h+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:16px">';
  for(var pad=0;pad<firstDay;pad++){h+='<div></div>';}
  for(var day=1;day<=daysInMonth;day++){
    var hasBday=false;
    for(var mi=0;mi<am.length;mi++){
      if(am[mi].day===day&&am[mi].month===calM+1){hasBday=true;break;}
    }
    var isToday2=(day===now.getDate()&&calM===now.getMonth()&&calY===now.getFullYear());
    var bg=isToday2?'var(--b1)':hasBday?'var(--b3l)':'transparent';
    var color=isToday2?'#fff':hasBday?'var(--b3d)':'var(--txt)';
    var fw=isToday2||hasBday?'700':'400';
    var onclick2=hasBday?'scrollCal('+day+')':'';
    h+='<div onclick="'+onclick2+'" style="text-align:center;padding:6px 2px;border-radius:8px;background:'+bg+';color:'+color+';font-weight:'+fw+';font-size:13px;cursor:'+(hasBday?'pointer':'default')+'">'+day+(hasBday?'<div style="width:4px;height:4px;background:var(--b3d);border-radius:50%;margin:1px auto 0"></div>':'')+'</div>';
  }
  h+='</div>';
  // Liste des événements du mois
  var mb=[];
  for(var mi2=0;mi2<am.length;mi2++){
    var p=am[mi2];
    if(p.month===calM+1){mb.push(p);}
  }
  mb.sort(function(a,b){return a.day-b.day;});
  if(mb.length>0){
    h+='<div class="sh">'+MN[calM]+' — '+mb.length+' événement'+(mb.length>1?'s':'')+'</div>';
    h+='<div class="card" style="padding:8px 14px">';
    mb.forEach(function(p){
      var gN='';
      for(var gi=0;gi<groups.length;gi++){
        var mbs=groups[gi].members||[];
        for(var mmi=0;mmi<mbs.length;mmi++){
          if(mbs[mmi].id===p.id){gN=groups[gi].name||'';break;}
        }
        if(gN) break;
      }
      var age=ageBday(p.day,p.month,p.year);
      var ms=MS[age];
      var isNow2=isToday(p.day,calM+1)&&calY===now.getFullYear()&&calM===now.getMonth();
      var ai=am.indexOf(p);
      h+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)" id="c-d-'+p.day+'">';
      h+='<div class="av '+AV[ai%4]+'" style="width:32px;height:32px;font-size:11px">';
      h+=p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name);
      h+='</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<span style="font-size:13px;font-weight:'+(isNow2?'700':'500')+';color:'+(isNow2?'var(--b2d)':'var(--txt)')+'">'+tIco(p.type)+' '+p.day+' — '+esc(p.name)+'</span>';
      if(age){h+='<span style="font-size:11px;color:var(--txt2);margin-left:5px">'+age+' ans</span>';}
      if(ms){h+='<span class="pbdg pbk" style="font-size:10px">'+ms+'</span>';}
      h+='<div style="font-size:11px;color:var(--txt2)">'+gN+'</div>';
      h+='</div>';
      if(isNow2){h+='<button class="btn G sm" onclick="genCalMsg('+p.id+','+p.day+')">✨</button>';}
      h+='</div>';
    });
    h+='</div>';
  } else {
    h+='<div class="card" style="text-align:center;color:var(--txt2);font-size:13px">Aucun événement ce mois-ci.</div>';
  }
  h+='<button class="exbtn" onclick="exportPDF()">'+t('exportPdf')+'</button>';
  el.innerHTML=h;
}
function calPrev(){if(calM===0){calM=11;calY--;}else calM--;rCal();}
function calNext(){if(calM===11){calM=0;calY++;}else calM++;rCal();}
function scrollCal(d){var _e=document.getElementById('c-d-'+d);if(_e)_e.scrollIntoView({behavior:'smooth',block:'center'});}
async function genCalMsg(id,day){
  var am=allMems();
  var p=null;
  for(var i=0;i<am.length;i++){if(am[i].id===id){p=am[i];break;}}
  if(!p) return;
  var cid='c-m-'+id;
  var el=document.getElementById(cid);
  if(!el){
    var dd=document.getElementById('c-d-'+day);
    if(dd) dd.insertAdjacentHTML('afterend','<div id="'+cid+'"></div>');
    el=document.getElementById(cid);
  }
  await genMsg(id,cid);
}


// ── ACTIONS ──
function buyTpl(t){const o={id:'mkt_'+t.id,n:t.n,t:t.t,e:t.e};if(!utpls.find(x=>x.id===o.id)){utpls.push(o);saveTp();}actTpl='mkt_'+t.id;alert(`✓ Modèle "${t.n}" acheté et activé !`);}
function sellTpl(){const n=prompt('Nom de votre pack :');if(!n)return;const t=prompt('Décrivez le ton :');if(!t)return;alert(`✓ Modèle "${n}" soumis. Validation sous 48h. Contact: support@bloomday.app`);}
function addTpl(){const n=prompt('Nom de votre modèle :');if(!n)return;const t=prompt('Décrivez le ton :');if(!t)return;utpls.push({id:'u'+Date.now(),n,t,e:'🌸'});saveTp();rMore();}
function togAdm(i){editAdm=editAdm===i?null:i;rMore();}
function saveAdm(i){const n=((document.getElementById('ea-n')&&document.getElementById('ea-n').value)||'').trim();if(!n){alert('Nom requis.');return;}admins[i]={name:n,email:((document.getElementById('ea-e')&&document.getElementById('ea-e').value)||'').trim(),phone:((document.getElementById('ea-p')&&document.getElementById('ea-p').value)||'').trim()};editAdm=null;saveA();rMore();}
function remAdm(i){if(!confirm('Retirer ?'))return;admins.splice(i,1);saveA();rMore();}
function addAdm(){const n=((document.getElementById('adm-n')&&document.getElementById('adm-n').value)||'').trim();if(!n){alert('Nom requis.');return;}if(admins.length>=PL().adm&&PL().adm!==999){alert(`Max ${PL().adm} admins.`);return;}admins.push({name:n,email:((document.getElementById('adm-e')&&document.getElementById('adm-e').value)||'').trim(),phone:((document.getElementById('adm-p')&&document.getElementById('adm-p').value)||'').trim()});saveA();['adm-n','adm-e','adm-p'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});rMore();}
function copyCode(){navigator.clipboard.writeText(stats.code||'').then(()=>alert('✓ Code copié !'));}
function natShare(t){if(navigator.share){navigator.share({title:'Bloomday',text:t,url:'https://bloomday.app'}).catch(()=>{});}else{navigator.clipboard.writeText(t).then(()=>alert('✓ Message copié !'));}}
function delFav(i){if(!confirm('Supprimer ?'))return;favs.splice(i,1);saveF();rMore();}
function addFav(id,text,name){favs.push({id,mn:name,text,date:new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})});saveF();alert('⭐ Ajouté aux favoris !');}

// ── EXPORT PDF ──
function exportPDF(){
  const am=allMems();if(!am.length){alert('Aucun membre.');return;}
  const now=new Date();
  let h=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bloomday — Export</title><style>body{font-family:Georgia,serif;max-width:720px;margin:40px auto;color:#1A1510;font-size:14px}.header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #E8891A}.logo{font-size:32px;font-weight:800;color:#E8891A}h2{font-size:16px;color:#7A4E00;margin:22px 0 8px;border-bottom:2px solid #E8891A;padding-bottom:4px}table{width:100%;border-collapse:collapse}th{background:#FEF3DC;color:#7A4E00;font-size:11px;padding:8px 10px;text-align:left;text-transform:uppercase}td{padding:8px 10px;border-bottom:1px solid #EDE6D8;font-size:12px}.tod{background:#FDEDF5;font-weight:bold}.footer{margin-top:40px;font-size:11px;color:#A89E90;text-align:center;border-top:1px solid #EDE6D8;padding-top:12px}</style></head><body>`;
  h+=`<div class="header"><div class="logo">🌸 Bloomday</div><div><div style="font-size:13px;color:#E05C8A;font-style:italic">Le jour où tu fleuris</div><div style="font-size:12px;color:#7A6E5F;margin-top:4px">Exporté le ${now.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>`;
  groups.forEach(g=>{const gm=(g.members||[]).sort((a,b)=>a.month-b.month||a.day-b.day);if(!gm.length)return;h+=`<h2>${esc(g.icon)} ${esc(g.name)} (${gm.length})</h2><table><tr><th>Nom</th><th>Type</th><th>Date</th><th>Âge</th><th>Tél</th><th>Notes</th></tr>`;gm.forEach(p=>{const age=ageBday(p.day,p.month,p.year),tod=isToday(p.day,p.month);h+=`<tr${tod?' class="tod"':''}><td><strong>${esc(p.name)}</strong>${tod?' 🌸':''}</td><td>${esc(tLbl(p.type))}</td><td>${p.day} ${esc(MN[p.month-1])}${p.year?' '+p.year:''}</td><td>${age?age+' '+t('yearsOld'):'—'}</td><td>${esc(p.phone||'—')}</td><td>${esc(p.note||'—')}</td></tr>`;});h+=`</table>`;});
  h+=`<div class="footer">🌸 Bloomday · bloomday.app</div></body></html>`;
  const blob=new Blob([h],{type:'text/html'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Bloomday_Export.html';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ═══════════════════════════════════
// IA — GÉNÉRATION (Axe 7 : récurrence intelligente)
// ═══════════════════════════════════
function getTone(){var all=DTPL.concat(utpls);for(var i=0;i<all.length;i++){if(all[i].id===actTpl)return all[i].t;}return all[0].t;}

async function genMsg(id,cid){
  const pl=PL();
  if(pl.msgs<999&&(stats.msgsM||0)>=pl.msgs){alert(`Limite de ${pl.msgs} messages/mois atteinte.\nPassez au plan Bloom pour des messages illimités.`);return;}
  const am=allMems(),p=am.find(x=>x.id===id);if(!p)return;
  const el=document.getElementById(cid);if(!el)return;
  el.innerHTML=`<div class="mload"><span class="spin">⟳</span> Génération...</div>`;
  stats.totalGen++;stats.msgsM++;saveSt();
  const age=ageBday(p.day,p.month,p.year),ms=MS[age];
  const isBiz=p.type==='work';
  // Axe 7 : contexte historique pour récurrence intelligente
  const histCtx=buildHistCtx(id,3);
  const tc=p.type==='wedding'?`Anniversaire de mariage${age?' — '+age+' an(s) ensemble':''}.`:isBiz?`Entrée dans l'entreprise${age?' — '+age+' an(s) ancienneté':''}.`:'';
  const safeName=(p.name||'').substring(0,100);
  const safeNote=(p.note||'').substring(0,500);
  const safePhone=(p.phone||'').replace(/[^0-9+\s\-]/g,'').substring(0,25);
  const prompt=`Tu aides le responsable d'un groupe ${isBiz?'professionnel':'convivial'} à rédiger un message pour ${safeName}.
${tc||(age?`Fête ses ${age} ans.`:'')+(ms?` Âge symbolique important : ${ms}. Mentionne-le chaleureusement.`:'')}
${safeNote?`Informations personnelles importantes : "${safeNote}".`:'Tu ne la/le connais pas très bien, reste chaleureux et universel.'}
${safePhone?`Son WhatsApp : ${safePhone}. Mentionne-le à la fin pour que les membres puissent lui écrire.`:''}${histCtx}
Ton SOUHAITÉ (respecte-le) : ${getTone()}.
RÈGLES ABSOLUES : 4-5 phrases maximum. Invite le groupe à célébrer cette personne. Sois créatif et original.`;

  if(!isOnline){
    // Axe 5 : mode hors-ligne
    const fallback=getFallback(p.type);
    const enc=encodeURIComponent(fallback);
    el.innerHTML=`<div class="mbox offline"><div style="font-size:11px;font-weight:700;color:var(--b1d);margin-bottom:6px">⚡ Mode hors-ligne — Message de secours</div>${esc(fallback)}</div><div class="brow"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(fallback)+"')">📋 Copier</button><button class="btn G sm" onclick="saveMsgCached(${id},'"+_c(fallback)+"')">✓ Envoyé</button></div>`;
    return;
  }

  try{
    const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});
    if(resp.status===429){el.innerHTML=`<div class="mbox offline"><div style="font-size:11px;font-weight:700;color:var(--b1d);margin-bottom:4px">⏳ Limite atteinte</div>Trop de messages générés récemment. Réessayez dans une heure.</div>`;return;}
    if(!resp.ok)throw new Error('API '+resp.status);
    const data=await resp.json(),text=data.message||t('errGeneration');
    const enc=encodeURIComponent(text);
    // Axe 6 : générer lien Ripple
    const ripNameKey=_c(p.name.split(' ')[0]);const ripSnipKey=_c(text.substring(0,200));
    const _ripA=new Uint32Array(1);crypto.getRandomValues(_ripA);const ripId=_ripA[0].toString(36).toUpperCase().substring(0,6);
    const ripUrl=`#ripple/${ripId}`;
    const adBtns=admins.map(a=>`${a.email?`<a href="mailto:${a.email}?subject=${encodeURIComponent(tLbl(p.type)+' de '+p.name)}&body=${enc}"><button class="btn V sm">✉ ${esc(a.name.split(' ')[0])}</button></a>`:''}${a.phone?`<a href="https://wa.me/${a.phone.replace(/[^0-9]/g,'')}?text=${enc}" target="_blank"><button class="btn G sm">💬 ${esc(a.name.split(' ')[0])}</button></a>`:''}`).join('');
    el.innerHTML=`<div class="mbox">${esc(text)}</div>
    <div class="brow">
      <button class="btn sm" onclick="copyMsgCached(this,'"+_c(text)+"')">📋 Copier</button>
      <button class="btn O sm" onclick="noteMsgCached(${id},'${cid}','"+_c(text)+"')">✏️ Note</button>
      <button class="btn R sm" onclick="favMsgCached(${id},'"+_c(text)+"','"+_c(p.name||'')+"')">⭐</button>
      <button class="btn G sm" onclick="saveMsgCached(${id},'"+_c(text)+"')">✓ Envoyé</button>
      <button class="btn sm" onclick='genMsg(${id},"${cid}")'>↺</button>
    </div>
    ${admins.length>0?`<div style="font-size:11px;color:var(--txt2);margin:8px 0 4px;font-weight:600">Envoyer aux admins :</div><div class="brow">${adBtns}</div>`:''}
    <div style="font-size:11px;color:var(--b3d);background:var(--b3l);padding:7px 10px;border-radius:8px;margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px">
      <span>🌸 Lien Ripple créé — le destinataire peut découvrir Bloomday</span>
      <a href="${ripUrl}" onclick="event.preventDefault();showRipple(_g('${ripNameKey}'),_g('${ripSnipKey}'))"><button class="btn G sm" style="flex-shrink:0">Voir →</button></a>
    </div>`;
  }catch(e){
    // Axe 5 : fallback automatique en cas d'erreur
    const fallback=getFallback(p.type);
    el.innerHTML=`<div class="mbox offline"><div style="font-size:11px;font-weight:700;color:var(--b1d);margin-bottom:6px">⚡ Mode secours (IA indisponible)</div>${esc(fallback)}</div><div class="brow"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(fallback)+"')">📋 Copier</button><button class="btn G sm" onclick="saveMsgCached(${id},'"+_c(fallback)+"')">✓ Envoyé</button><button class="btn sm" onclick='genMsg(${id},"${cid}")'>↺ Réessayer</button></div>`;
  }
}

async function genUrgence(id,cid){
  const am=allMems(),p=am.find(x=>x.id===id);if(!p)return;
  const el=document.getElementById(cid);if(!el)return;
  if(!isOnline){el.innerHTML=`<div class="mbox offline">${getFallback('birthday')}</div>`;return;}
  el.innerHTML=`<div class="mload"><span class="spin">⟳</span> Message de rattrapage...</div>`;
  const age=ageBday(p.day,p.month,p.year);
  const safeName=(p.name||'').substring(0,100);
  const safePhone=(p.phone||'').replace(/[^0-9+\s\-]/g,'').substring(0,25);
  const prompt=`Hier c'était l'anniversaire de ${safeName}${age?' qui a eu '+age+' '+t('yearsOld'):''}. On l'a oublié. Rédige un message de rattrapage chaleureux qui reconnaît l'oubli avec humour bienveillant et beaucoup d'amour. 3-4 phrases joyeuses.${safePhone?` WhatsApp : ${safePhone}.`:''}`;
  try{const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});if(!resp.ok)throw new Error();const data=await resp.json(),text=data.message||'Erreur.';el.innerHTML=`<div class="mbox">${esc(text)}</div><div class="brow"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(text)+"')">📋 Copier</button><button class="btn G sm" onclick="saveMsgCached(${id},'"+_c(text)+"')">✓ Envoyé</button></div>`;}catch(e){el.innerHTML=`<div class="mbox offline">${getFallback('birthday')}</div>`;}
}

async function genCard(id,cid){
  if(!PL().cards){alert('Les cartes nécessitent le plan Bloom ou supérieur.');return;}
  const am=allMems(),p=am.find(x=>x.id===id);if(!p)return;
  const el=document.getElementById(cid);if(!el)return;
  if(!isOnline){el.innerHTML=`<div class="mbox offline">Mode hors-ligne — cartes indisponibles.</div>`;return;}
  el.innerHTML=`<div class="mload"><span class="spin">⟳</span> Création de la carte...</div>`;
  const age=ageBday(p.day,p.month,p.year);
  const safeName=(p.name||'').substring(0,100);
  const safeNote=(p.note||'').substring(0,300);
  const safePhone=(p.phone||'').replace(/[^0-9]/g,'');
  const prompt=`Rédige un message poétique très court (2 phrases belles) pour une carte d'anniversaire fleurie pour ${safeName}${age?' qui fête ses '+age+' '+t('yearsOld'):''}.${safeNote?` Profil : "${safeNote}".`:''} Style : poétique, floral, lumineux. Commence directement par le message.`;
  try{const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});if(!resp.ok)throw new Error();const data=await resp.json(),text=data.message||'Joyeux anniversaire !';const cardMsg=`🌸🎂 Joyeux Anniversaire, ${safeName.split(' ')[0]} !\n\n${text}`;el.innerHTML=`<div class="bcrd"><div class="bcrd-n">🌸 Joyeux Anniversaire, ${esc(safeName.split(' ')[0])} !</div><div class="bcrd-m">${esc(text)}</div><div style="font-size:28px">🌸🌺🌷✨🌻</div></div><div class="brow"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(cardMsg)+"')">📋 Copier</button>${safePhone?`<a href="https://wa.me/${safePhone}?text=${encodeURIComponent(cardMsg)}" target="_blank"><button class="btn G sm">💬 WhatsApp</button></a>`:''}</div>`;}catch(e){el.innerHTML=`<div class="mbox offline">Erreur — réessayez.</div>`;}
}

async function genGift(id,cid){
  if(!PL().gifts){alert('Les idées cadeaux nécessitent le plan Bloom ou supérieur.');return;}
  const am=allMems(),p=am.find(x=>x.id===id);if(!p)return;
  const el=document.getElementById(cid);if(!el)return;
  if(!isOnline){el.innerHTML=`<div class="mbox offline">Mode hors-ligne — cadeaux indisponibles.</div>`;return;}
  el.innerHTML=`<div class="mload"><span class="spin">⟳</span> Recherche d'idées cadeaux...</div>`;
  const age=ageBday(p.day,p.month,p.year);
  const safeName=(p.name||'').substring(0,100);
  const safeNote=(p.note||'').substring(0,300);
  const prompt=`Propose 5 idées de cadeaux originaux pour ${safeName}${age?', '+age+' '+t('yearsOld'):''}${p.gender?', '+p.gender:''}.${safeNote?` Profil : "${safeNote}".`:''} Budget varié 10€-100€. Une idée par ligne avec budget entre parenthèses. Pas d'introduction.`;
  try{const resp=await fetch("/.netlify/functions/generate-message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:prompt})});if(!resp.ok)throw new Error();const data=await resp.json(),text=data.message||'Erreur.';const items=text.split('\n').filter(l=>l.trim());let gh=`<div style="background:var(--b4l);border:1px solid var(--b4);border-radius:14px;padding:14px;margin-top:8px"><div style="font-size:13px;font-weight:700;color:var(--b4d);margin-bottom:8px">🎁 Idées cadeaux pour ${esc(safeName.split(' ')[0])}</div>`;items.forEach(it=>gh+=`<div style="font-size:13px;padding:5px 0;border-bottom:1px solid var(--brd);display:flex;gap:6px"><span>🎁</span><span>${esc(it.replace(/^[-•*\d\.]+\s*/,''))}</span></div>`);gh+=`<div class="brow" style="margin-top:8px"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(items.join('\\n'))+"')">📋 Copier</button><button class="btn V sm" onclick='genGift(${id},"${cid}")'>↺ Nouvelles</button></div></div>`;el.innerHTML=gh;}catch(e){el.innerHTML=`<div class="mbox offline">Erreur — réessayez.</div>`;}
}

// ── COMMUNS ──
function openNoteAndSend(id,cid,baseText){openNoteModal(note=>{const finalText=note?baseText+'\n\n'+note:baseText;const el=document.getElementById(cid);if(!el)return;const enc=encodeURIComponent(finalText);const adBtns=admins.map(a=>`${a.email?`<a href="mailto:${a.email}"><button class="btn V sm">✉ ${esc(a.name.split(' ')[0])}</button></a>`:''}${a.phone?`<a href="https://wa.me/${a.phone.replace(/[^0-9]/g,'')}?text=${enc}" target="_blank"><button class="btn G sm">💬 ${esc(a.name.split(' ')[0])}</button></a>`:''}`).join('');el.innerHTML=`<div class="mbox">${esc(finalText)}</div><div class="brow"><button class="btn sm" onclick="copyMsgCached(this,'"+_c(finalText)+"')">📋 Copier</button><button class="btn G sm" onclick="saveMsgCached(${id},'"+_c(finalText)+"')">✓ Envoyé</button></div>${admins.length>0?`<div class="brow" style="margin-top:6px">${adBtns}</div>`:''}`; });}

function saveToHist(id,text){const k=String(id);if(!hist[k])hist[k]=[];hist[k].push({date:new Date().toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}),text});stats.totalSent++;stats.celeb++;saveH();saveSt();const b=CELEB.find(x=>x.nb===stats.celeb);if(b)setTimeout(()=>alert(`🌸 Badge débloqué : "${b.l}" !`),400);schedulePushForToday();}
function copyMsgById(btn,cacheKey){
  const text=window.__bdFavs?window.__bdFavs[cacheKey]||'':'';
  copyMsg(btn,text);
}
function copyMsg(btn,text){navigator.clipboard.writeText(text||'').then(()=>{const o=btn.textContent;btn.textContent='✓ Copié !';setTimeout(()=>btn.textContent=o,2000);});}
async function prepAll(){const m=mems(),todays=m.filter(p=>isToday(p.day,p.month));for(const p of todays)await genMsg(p.id,'h-msg-'+p.id);}

// ── RIPPLE (Axe 6) ──
function showRipple(name,msg){
  const rn=document.getElementById('rname');if(rn)rn.textContent=`${name||'Quelqu\'un'} a pensé à toi aujourd'hui 🌸`;
  const rr=document.getElementById('rrecip');if(rr)rr.textContent=`🌸 Joyeux Anniversaire, ${name||''} !`;
  const rm=document.getElementById('rmsg');if(rm)rm.textContent=msg||'Un message spécial a été créé pour toi avec amour.';
  document.getElementById('land').style.display='none';
  document.getElementById('app').classList.remove('on');
  document.getElementById('ripple').classList.add('on');
  window.scrollTo(0,0);
}
function sendRippleThanks(){
  const thanks=(document.getElementById('rthanks')&&document.getElementById('rthanks').value)||'';
  if(!thanks.trim()){alert('Écrivez quelques mots de remerciement.');return;}
  const msg=encodeURIComponent(`🌸 Merci beaucoup ! ${thanks} — Envoyé depuis Bloomday`);
  window.open(`https://wa.me/?text=${msg}`,'_blank');
}

// ── INIT ROUTING ──
function handleHash(){
  const h=window.location.hash;
  if(h.startsWith('#ripple/')){document.getElementById('land').style.display='block';return;}
  document.getElementById('land').style.display='block';
}


function buyTplAt(idx){
  var t=MKT[idx];
  if(!t)return;
  buyTpl(t);
}
function copyFav(i){
  var recentFavs=favs.slice(-5).reverse();
  var f=recentFavs[i];
  if(!f)return;
  navigator.clipboard.writeText(f.text||'').then(function(){alert('✓ Copié !');});
}

function startFromBtn(btn){
  var m = btn.getAttribute('data-mode') || 'perso';
  var p = btn.getAttribute('data-plan') || 'free';
  startApp(m, p);
}
function openPaymentFromBtn(btn){
  var p = btn.getAttribute('data-plan') || 'bloom';
  openPayment(p);
}


// Cache messages (remplace JSON.stringify dans onclick — compatible iOS)
window.__bdCache = {};
var __bdCacheIdx = 0;
function _c(v){var k='_'+(++__bdCacheIdx);window.__bdCache[k]=v;return k;}
function _g(k){return window.__bdCache[k]||'';}
function copyMsgCached(btn,k){copyMsg(btn,_g(k));}
function saveMsgCached(id,k){saveToHist(id,_g(k));}
function noteMsgCached(id,cid,k){openNoteAndSend(id,cid,_g(k));}
function favMsgCached(id,k,n){addFav(id,_g(k),n);}

function rMore(){
  const el=document.getElementById('s-more');
  if(!el)return;
  const m=mems();
  const refs=stats.refs||0;
  const al=ambLv(refs);
  const pl=PL();
  const pNext=PALIERS.find(function(p){return refs<p.nb;});
  const pPrev=PALIERS.filter(function(p){return refs>=p.nb;});
  const pct=pNext?Math.round(((refs-(pPrev.length?pPrev[pPrev.length-1].nb:0))/(pNext.nb-(pPrev.length?pPrev[pPrev.length-1].nb:0)))*100):100;
  const allTpl=[].concat(DTPL,utpls);
  const popts=PAYS.map(function(p){return '<option value="'+p.c+'"'+(profile.live===p.c?' selected':'')+'>'+p.l+'</option>';}).join('');
  const oopts='<option value="">Non précisé</option>'+PAYS.map(function(p){return '<option value="'+p.c+'"'+(profile.origin===p.c?' selected':'')+'>'+p.l+'</option>';}).join('');
  let h='';

  // --- Ambassador ---
  if(pl.amb){
    const earn=(refs*(al?al.c:0)/100*4.99).toFixed(2);
    const nxl=AMB.find(function(l){return refs<l.m;});
    h+='<div class="sh">💰 Espace Ambassador</div>';
    h+='<div class="ambc">';
    h+='<div style="font-family:var(--ff-title);font-size:20px;font-weight:700;color:var(--b4d);margin-bottom:8px">Programme Ambassador Bloomday</div>';
    if(al){
      h+='<div class="alv '+al.cl+'">'+al.i+' Ambassador '+al.n+' — '+al.c+'% commission</div>';
    } else {
      h+='<div style="font-size:13px;color:var(--b4d);margin-bottom:10px">Parrainez 3 amis pour devenir Ambassador Bronze 🥉</div>';
    }
    h+='<div style="font-size:13px;color:var(--b4d);margin-bottom:10px">Parrainages : <strong>'+refs+'</strong>';
    if(al)h+=' · Commission estimée : <strong style="color:var(--b3d)">'+earn+'€</strong>';
    if(nxl)h+=' · Encore '+(nxl.m-refs)+' pour '+nxl.n;
    h+='</div>';
    h+='<div style="font-size:11px;color:var(--b4d);margin-bottom:12px;line-height:1.6">🥉 Bronze (3+, 10%) → 🥈 Silver (10+, 15%) → 🥇 Gold (25+, 20%) → 💎 Platinum (50+, 30%)</div>';
    h+='<button class="btn V fw" onclick="alert(\'Commissions versées mensuellement via PayPal dès 10€. Contact: support@bloomday.app\')">💳 Toucher mes commissions</button>';
    h+='</div>';
  }

  // --- Bloomday Ripple ---
  h+='<div class="sh">'+t('rippleStratLabel')+'</div>';
  h+='<div class="card cg">';
  h+='<div style="font-size:14px;font-weight:700;color:var(--b3d);margin-bottom:6px">'+t('rippleStrategy')+'</div>';
  h+='<div style="font-size:13px;color:var(--b3d);line-height:1.65;margin-bottom:12px">'+t('rippleStratDesc')+'</div>';
  const ripCode=(stats.code||'BLD-XXXXX').replace('BLD-','').toLowerCase();
  h+='<div style="font-family:monospace;font-size:13px;color:var(--b3d);background:var(--card);padding:8px 12px;border-radius:10px;border:1px dashed var(--b3)">bloomday.app/ripple/'+ripCode+'</div>';
  h+='</div>';

  // --- Marketplace ---
  h+='<div class="sh" style="margin-top:6px">🛒 Marketplace de modèles</div>';
  h+='<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Achetez des modèles ou vendez les vôtres (70% des ventes).</div>';
  getMKT().forEach(function(mktItem,ti){
    h+='<div class="mktc">';
    h+='<div style="display:flex;align-items:flex-start;gap:10px">';
    h+='<div style="font-size:28px">'+mktItem.e+'</div>';
    h+='<div style="flex:1"><div style="font-size:14px;font-weight:700">'+mktItem.n+'</div>';
    h+='<div style="font-size:11px;color:var(--txt2);margin-top:2px">par '+mktItem.a+' · '+mktItem.s+' ventes</div></div>';
    h+='<div class="mktp">'+mktItem.p+'€</div></div>';
    h+='<div style="font-size:12px;color:var(--txt2);margin:6px 0 8px;line-height:1.5">Ton : '+(t(mktItem.dk)||mktItem.n||'').substring(0,65)+'…</div>';
    h+='<div class="brow"><button class="btn G sm" onclick="buyTplAt('+ti+')">'+t('mktBuyBtn')+'</button></div>';
    h+='</div>';
  });
  h+='<div class="card" style="border:2px dashed var(--brd2);background:transparent;text-align:center;padding:18px;margin-bottom:10px">';
  h+='<div style="font-size:24px;margin-bottom:8px">✍️</div>';
  h+='<div style="font-size:14px;font-weight:700;margin-bottom:4px">Vendez votre modèle</div>';
  h+='<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Créez un pack, fixez votre prix, touchez 70%.</div>';
  h+='<button class="btn P" onclick="sellTpl()">Créer mon modèle</button>';
  h+='</div>';

  // --- Fleurs offertes ---
  const cc=stats.celeb||0;
  h+='<div class="sh" style="margin-top:8px">'+t('flowersTitle')+'</div>';
  h+='<div class="celc">';
  h+='<div style="font-family:var(--ff-title);font-size:56px;font-weight:800;color:var(--b4d);line-height:1">'+cc+'</div>';
  h+='<div style="font-size:13px;color:var(--b4d);margin-top:4px">'+cc+' '+t('celebCountLabel')+'</div>';
  h+='<div style="display:flex;gap:7px;justify-content:center;margin-top:12px;flex-wrap:wrap">';
  CELEB.forEach(function(b){
    h+='<div style="font-size:11px;padding:3px 9px;border-radius:20px;font-weight:600;background:'+(cc>=b.nb?'var(--b1l)':'var(--bg2)')+';color:'+(cc>=b.nb?'var(--b1d)':'var(--txt3)')+';border:1px solid '+(cc>=b.nb?'var(--b1)':'var(--brd)')+'">'+b.l+'</div>';
  });
  h+='</div></div>';

  // --- Mes modèles ---
  h+='<div class="sh">✏️ Mes modèles</div>';
  h+='<div class="card" style="padding:8px 14px">';
  allTpl.forEach(function(_tpl){
    h+='<div class="tpl-r" onclick="actTpl=\''+_tpl.id+'\';rHome();alert(\'Modèle '+_tpl.n+' activé ✓\')">';
    h+='<div style="font-size:20px">'+_tpl.e+'</div>';
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:700">'+_tpl.n+'</div>';
    h+='<div style="font-size:12px;color:var(--txt2);margin-top:1px">'+_tpl.t.substring(0,55)+'…</div></div>';
    if(actTpl===_tpl.id)h+='<span style="font-size:11px;color:var(--b3d);font-weight:700">✓ Actif</span>';
    h+='</div>';
  });
  h+='<button class="btn P fw" style="margin-top:10px" onclick="addTpl()">🌸 Créer mon modèle</button>';
  h+='</div>';

  // --- Favoris ---
  h+='<div class="sh" style="margin-top:8px">'+t('favsTitle')+'('+favs.length+')</div>';
  if(!favs.length){
    h+='<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;padding:11px;background:var(--bg2);border-radius:12px;border:1px solid var(--brd)">Marquez des messages comme favoris après génération.</div>';
  } else {
    h+='<div class="card" style="padding:8px 14px">';
    const recentFavs=favs.slice(-5).reverse();
    recentFavs.forEach(function(f,i){
      const txt=(f.text||'').substring(0,120);
      h+='<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)">';
      h+='<div style="flex:1"><div style="font-size:12px;color:var(--txt);line-height:1.5">'+esc(txt)+((f.text||'').length>120?'…':'')+'</div>';
      h+='<div style="font-size:10px;color:var(--txt2);margin-top:3px">'+f.date+' · '+esc(f.mn||'')+'</div></div>';
      h+='<div style="display:flex;flex-direction:column;gap:4px">';
      h+='<button class="btn sm" onclick="copyFav('+i+')">📋</button>';
      h+='<button class="btn D sm" onclick="delFav('+i+')">✕</button>';
      h+='</div></div>';
    });
    h+='</div>';
  }

  // --- Profil ---
  h+='<div class="sh" style="margin-top:8px">'+t('profileTitle')+'</div>';
  h+='<div class="card">';
  h+='<div style="font-size:13px;color:var(--txt2);margin-bottom:10px">'+t('profileSubTitle')+'.</div>';
  h+='<label>'+t('profileLiveLabel')+'</label><select onchange="profile.live=this.value;savePr()">'+popts+'</select>';
  h+='<label>'+t('profileOriginLabel')+'</label><select onchange="profile.origin=this.value;savePr()">'+oopts+'</select>';
  h+='<label>Religion / Culture</label>';
  h+='<select onchange="profile.religion=this.value;savePr()">';
  const religs=[['christian','✝️ Chrétien'],['muslim','🌙 Musulman'],['jewish','✡️ Juif'],['hindu','🕉️ Hindou'],['buddhist','☸️ Bouddhiste'],['universal','🌍 Toutes'],['none','Aucune']];
  religs.forEach(function(r){
    h+='<option value="'+r[0]+'"'+((profile.religion||'christian')===r[0]?' selected':'')+'>'+r[1]+'</option>';
  });
  h+='</select>';
  h+='<div style="margin-top:12px;font-size:12px;color:var(--b3d);background:var(--b3l);padding:8px 12px;border-radius:10px">✓ L\'onglet Fêtes s\'adapte automatiquement.</div>';
  h+='</div>';

  // --- Stats ---
  h+='<div class="sh" style="margin-top:8px">'+t('statsTitle')+'</div>';
  h+='<div class="stg2">';
  h+='<div class="sc"><div class="scn">'+allMems().length+'</div><div class="scl">'+t('statTotalMembers')+'</div></div>';
  h+='<div class="sc"><div class="scn">'+groups.length+'</div><div class="scl">'+t('statsGroupsLabel')+'</div></div>';
  h+='<div class="sc"><div class="scn">'+(stats.totalSent||0)+'</div><div class="scl">'+t('statMsgSent')+'</div></div>';
  h+='<div class="sc"><div class="scn">'+refs+'</div><div class="scl">'+t('statsRefLabel')+'</div></div>';
  h+='</div>';

  // Graphique mois
  h+='<div class="sh">'+t('statsParMois')+'</div><div class="card" style="padding:10px 14px">';
  const mc=Array(12).fill(0);m.forEach(function(p){mc[p.month-1]++;});
  const mx=Math.max.apply(null,mc.concat([1]));
  mc.forEach(function(c,i){
    if(c===0)return;
    const w=Math.round((c/mx)*100);
    h+='<div style="display:flex;align-items:center;gap:8px;padding:3px 0">';
    h+='<div style="font-size:11px;color:var(--txt2);width:28px;font-weight:600">'+MNS[i]+'</div>';
    h+='<div style="flex:1;background:var(--bg3);border-radius:5px;height:18px;overflow:hidden">';
    h+='<div style="width:'+w+'%;background:linear-gradient(90deg,var(--b1),var(--b2));height:100%;border-radius:5px;display:flex;align-items:center;justify-content:flex-end;padding-right:6px">';
    h+='<span style="font-size:10px;font-weight:800;color:#fff">'+c+'</span></div></div>';
    h+='</div>';
  });
  if(mc.every(function(c){return c===0;}))h+='<div style="font-size:13px;color:var(--txt2);text-align:center;padding:8px 0">'+t('noMemberStat')+'.</div>';
  h+='</div>';

  // --- Push notifs ---
  h+='<div class="sh" style="margin-top:8px">'+t('notifTitle')+'</div>';
  h+='<div class="card">';
  if(!window.Notification){
    h+='<div style="font-size:13px;color:var(--txt2)">'+t('notifBrowserNA')+'</div>';
  } else if(Notification.permission==='granted'){
    h+='<div style="font-size:13px;color:var(--b3d);font-weight:700;margin-bottom:6px">✓ Notifications activées</div>';
    h+='<button class="btn G sm" onclick="schedulePushForToday()">🔔 Tester</button>';
  } else if(Notification.permission==='denied'){
    h+='<div style="font-size:13px;color:var(--b2d);font-weight:700;margin-bottom:6px">✗ Notifications bloquées</div>';
    h+='<div style="font-size:12px;color:var(--txt2)">'+t('notifDeniedBrowser')+'</div>';
  } else {
    h+='<div style="font-size:13px;color:var(--txt2);margin-bottom:8px">Recevez une alerte chaque matin des anniversaires.</div>';
    h+='<button class="btn G fw" onclick="requestPush().then(function(ok){if(ok)rMore();})">🔔 Activer les notifications</button>';
  }
  h+='</div>';

  // --- Admins ---
  h+='<div class="sh" style="margin-top:8px">⚙️ Administrateurs ('+admins.length+'/'+(pl.adm===999?'∞':pl.adm)+')</div>';
  if(pl.adm===0){
    h+='<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;padding:11px;background:var(--bg2);border-radius:12px;border:1px solid var(--brd)">'+t('notAvailable')+'. <button class="btn V sm" style="margin-left:6px" onclick="goLand()">Upgrader →</button></div>';
  } else {
    admins.forEach(function(a,i){
      const isEd=(typeof editAdm!=='undefined'&&editAdm===i);
      h+='<div class="card">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av av0" style="width:36px;height:36px;font-size:12px">'+ini(a.name)+'</div>';
      h+='<div style="flex:1"><div style="font-size:14px;font-weight:700">'+esc(a.name)+'</div></div>';
      h+='<span style="font-size:10px;background:var(--b1l);color:var(--b1d);padding:2px 9px;border-radius:20px;font-weight:700">Admin</span>';
      h+='<button class="btn O sm" style="margin-left:4px" onclick="togAdm('+i+')">'+(isEd?'✕':'✏')+'</button>';
      h+='<button class="btn D sm" style="margin-left:4px" onclick="remAdm('+i+')">✕</button>';
      h+='</div>';
      if(isEd){
        h+='<div class="efp">';
        h+='<label>Nom</label><input id="ea-n" value="'+esc(a.name)+'">';
        h+='<label>Email</label><input id="ea-e" type="email" value="'+esc(a.email||'')+'">';
        h+='<label>WhatsApp</label><input id="ea-p" type="tel" value="'+esc(a.phone||'')+'">';
        h+='<div class="brow" style="margin-top:10px"><button class="btn G" style="flex:1" onclick="saveAdm('+i+')">✓ Enregistrer</button></div>';
        h+='</div>';
      } else {
        h+='<div style="margin-top:8px">';
        h+='<div class="frow"><span style="color:var(--txt2)">Email</span><span style="color:#4A80B8;word-break:break-all">'+esc(a.email||'—')+'</span></div>';
        h+='<div class="frow"><span style="color:var(--txt2)">Tél</span><span>'+esc(a.phone||'—')+'</span></div>';
        h+='<div class="brow" style="margin-top:8px">';
        if(a.email)h+='<a href="mailto:'+a.email+'"><button class="btn V sm">✉ '+esc(a.name.split(' ')[0])+'</button></a>';
        if(a.phone)h+='<a href="https://wa.me/'+a.phone.replace(/[^0-9]/g,'')+'" target="_blank"><button class="btn G sm">💬 '+esc(a.name.split(' ')[0])+'</button></a>';
        h+='</div></div>';
      }
      h+='</div>';
    });
    if(admins.length<pl.adm){
      h+='<div class="card">';
      h+='<label>Nom complet</label><input type="text" id="adm-n" placeholder="Jean Martin">';
      h+='<label>Email</label><input type="email" id="adm-e" placeholder="jean@exemple.com">';
      h+='<label>WhatsApp</label><input type="tel" id="adm-p" placeholder="+33 6 12 34 56 78">';
      h+='<div style="margin-top:12px"><button class="btn P fw" onclick="addAdm()">🌸 Ajouter</button></div>';
      h+='</div>';
    }
  }

  // --- Parrainage ---
  h+='<div class="sh" style="margin-top:8px">🎁 Parrainage</div>';
  h+='<div style="background:linear-gradient(135deg,var(--b4l),var(--b1l));border:1.5px solid var(--b4);border-radius:20px;padding:20px;margin-bottom:14px;text-align:center">';
  h+='<div style="font-family:var(--ff-title);font-size:20px;font-weight:700;color:var(--b4d);margin-bottom:6px">'+t('referralDesc')+'</div>';
  h+='<div style="font-size:13px;color:var(--b4d);line-height:1.6;margin-bottom:12px">Chaque ami abonné vous rapproche d\'une récompense.</div>';
  h+='<div class="refc" onclick="copyCode()">'+( stats.code||'BLD-XXXXX')+'</div>';
  h+='<div style="font-size:11px;color:var(--b4d);opacity:.7;margin-bottom:10px">Appuyez pour copier</div>';
  if(pNext){
    h+='<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--b4d);font-weight:600;margin-bottom:4px"><span>'+refs+' parrainage'+(refs!==1?'s':'')+'</span><span>Objectif : '+pNext.nb+'</span></div>';
    h+='<div class="prog"><div class="pf" style="width:'+pct+'%"></div></div>';
  }
  h+='</div>';
  h+='<div class="sh">Paliers</div><div class="card" style="padding:8px 14px">';
  PALIERS.forEach(function(p){
    const done=refs>=p.nb;
    const cur=!done&&pNext&&pNext.nb===p.nb;
    h+='<div class="pal-row">';
    h+='<div class="pn '+(done?'pd':cur?'pc':'pl')+'">'+(done?'✓':p.nb)+'</div>';
    h+='<div class="pi"><div class="pt">'+p.nb+' parrainage'+(p.nb>1?'s':'')+'</div>';
    h+='<div class="ps">'+(done?'✅ Débloqué':cur?t('refInProgress'):t('refLocked'))+'</div></div>';
    h+='<div class="prw" style="background:'+(done?'var(--b3l)':cur?'var(--b1l)':'var(--bg2)')+';color:'+(done?'var(--b3d)':cur?'var(--b1d)':'var(--txt3)')+'">'+p.r+'</div>';
    h+='</div>';
  });
  h+='</div>';

  // --- Partage ---
  const msgShare='🌸 J\''+t('refShareMsg')+'\n code '+(stats.code||'BLD-XXXXX')+' pour 7 jours gratuits → bloomday.app';
  window.__bdMsgShare=msgShare;
  const me=encodeURIComponent(msgShare);
  h+='<div class="sh" style="margin-top:8px">'+t('referralShare')+'</div>';
  h+='<div class="sgrid">';
  h+='<a href="https://wa.me/?text='+me+'" target="_blank"><button class="shr"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#25D366"/><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff"/></svg>WhatsApp</button></a>';
  h+='<a href="https://t.me/share/url?url=bloomday.app&text='+me+'" target="_blank"><button class="shr"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0088CC"/><path d="M5.491 11.74L18.48 6.68c.61-.22 1.14.15.94 1.08l-2.19 10.32c-.16.73-.6.91-1.21.56l-3.3-2.43-1.59 1.53c-.18.18-.33.33-.67.33l.24-3.37 6.15-5.56c.27-.24-.06-.37-.41-.14L7.07 13.56 3.8 12.54c-.72-.22-.73-.72.15-1.07l.14.01z" fill="#fff"/></svg>Telegram</button></a>';
  h+='<a href="mailto:?subject='+encodeURIComponent('7j gratuits sur Bloomday!')+'&body='+me+'" target="_blank"><button class="shr"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#EA4335"/><path d="M4 8l8 5 8-5V7H4v1zm0 2.5V17h16v-6.5l-8 5-8-5z" fill="#fff"/></svg>Email</button></a>';
  h+='<button class="shr" onclick="natShare(window.__bdMsgShare)"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="var(--b1)"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="#3D1A00"/></svg>Partager</button>';
  h+='</div>';

  h+='<button class="exbtn" onclick="exportPDF()">📄 Exporter tous les anniversaires</button>';
  el.innerHTML=h;
}
function rHome(){
  const el=document.getElementById('s-home');
  if(!el||el.style.display==='none')return;
  const now=new Date();
  const m=mems();
  const todays=m.filter(p=>isToday(p.day,p.month));
  const missed=m.filter(p=>wasYest(p.day,p.month));
  const upcoming=m.filter(p=>{const d=daysTill(p.day,p.month);return d>0&&d<=7;}).sort((a,b)=>daysTill(a.day,a.month)-daysTill(b.day,b.month));
  const thisMonthCount=m.filter(p=>p.month===now.getMonth()+1).length;
  const nextEv=m.filter(p=>daysTill(p.day,p.month)>0).sort((a,b)=>daysTill(a.day,a.month)-daysTill(b.day,b.month))[0];
  const pl=PL();
  let h='';

  // --- Prompt push notifs ---
  if(!pushGranted&&window.Notification&&Notification.permission==='default'&&!localStorage.getItem('bdg16_push_dismissed')&&m.length>0){
    h+='<div class="push-prompt"><div style="font-size:26px">🔔</div>';
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--b3d)">Ne jamais rater un anniversaire</div>';
    h+='<div style="font-size:12px;color:var(--b3d);margin-top:2px">Activez les alertes du matin.</div>';
    h+='<div class="brow" style="margin-top:8px">';
    h+='<button class="btn G sm" onclick="requestPush().then(function(){rHome();})">🔔 Activer</button>';
    h+='<button class="btn sm" onclick="safeLsSet(\'bdg16_push_dismissed\',\'1\');rHome()">Plus tard</button>';
    h+='</div></div></div>';
  }

  // --- Stats ---
  h+='<div class="stg">';
  h+='<div class="stat"><div class="stn">'+m.length+'</div><div class="stl">'+t('statMembersLbl')+'</div></div>';
  h+='<div class="stat"><div class="stn">'+thisMonthCount+'</div><div class="stl">'+t('statMonthLbl')+'</div></div>';
  h+='<div class="stat"><div class="stn">'+(stats.celeb||0)+'</div><div class="stl">'+t('statCelebLbl')+'</div></div>';
  h+='</div>';

  // --- Limite plan ---
  if(pl.msgs<999){
    const left=Math.max(0,pl.msgs-(stats.msgsM||0));
    h+='<div class="plb">';
    h+='<div><div style="font-size:13px;font-weight:700;color:var(--b4d)">Plan '+PLANS[plan].name+'</div>';
    h+='<div style="font-size:12px;color:var(--b4)">'+m.length+'/'+pl.mm+' membres · '+left+' msg restant'+(left!==1?'s':'')+'</div></div>';
    h+='<button class="btn V sm" onclick="goLand()">Upgrader →</button></div>';
  }

  // --- Urgence (raté hier) ---
  missed.forEach(function(p){
    h+='<div class="card curg">';
    h+='<div style="font-size:14px;font-weight:700;color:var(--b2d);margin-bottom:4px">⚡ Anniversaire raté hier !</div>';
    h+='<div style="font-size:13px;color:var(--b2);margin-bottom:8px">C\'était l\'anniversaire de <strong>'+esc(p.name)+'</strong>. Il n\'est pas trop tard !</div>';
    h+='<div id="urg-'+p.id+'"><button class="btn R sm" onclick="genUrgence('+p.id+',\'urg-'+p.id+'\')">'+t('urgentBtn')+'</button></div>';
    h+='</div>';
  });

  // --- Prochain anniversaire ---
  if(nextEv){
    const d=daysTill(nextEv.day,nextEv.month);
    const age=ageBday(nextEv.day,nextEv.month,nextEv.year);
    const idx=m.indexOf(nextEv);
    h+='<div class="card cp" style="display:flex;align-items:center;gap:14px;margin-bottom:16px">';
    h+='<div style="text-align:center;min-width:58px"><div style="font-family:var(--ff-title);font-size:42px;font-weight:800;color:var(--b4d);line-height:1">'+d+'</div>';
    h+='<div style="font-size:10px;color:var(--b4);margin-top:1px;font-weight:700">jour'+(d>1?'s':'')+'</div></div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<div style="font-size:11px;font-weight:700;color:var(--b4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Prochain '+tLbl(nextEv.type)+'</div>';
    h+='<div style="display:flex;align-items:center;gap:8px">';
    h+='<div class="av '+AV[idx%4]+'" style="width:34px;height:34px;font-size:11px">'+(nextEv.photo?'<img src="'+nextEv.photo+'" alt="">':ini(nextEv.name))+'</div>';
    h+='<div><div style="font-size:15px;font-weight:700;color:var(--b4d)">'+esc(nextEv.name.split(' ')[0])+'</div>';
    h+='<div style="font-size:12px;color:var(--b4);margin-top:1px">'+nextEv.day+' '+MN[nextEv.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
    if(MS[age])h+='<div style="font-size:11px;color:var(--b4d);margin-top:3px;font-weight:700">'+MS[age]+'</div>';
    h+='</div></div></div></div>';
  }

  // --- Semaine ---
  h+='<div class="sh">Cette semaine</div><div class="wrow">';
  for(let i=0;i<7;i++){
    const d=new Date(now);d.setDate(now.getDate()+i);
    const dd=d.getDate(),mm=d.getMonth()+1;
    const hb=m.some(function(p){return p.day===dd&&p.month===mm;});
    h+='<div class="dc'+(hb?' hb':'')+(i===0?' td':'')+'">';
    h+='<div class="dl">'+JRS[d.getDay()]+'</div>';
    h+='<div class="dn" style="color:'+(i===0?'#fff':hb?'var(--b2d)':'var(--txt)')+'">'+dd+'</div>';
    h+=(hb?'<div class="dd"></div>':'<div style="height:9px"></div>');
    h+='</div>';
  }
  h+='</div>';

  // --- Aujourd'hui ---
  if(todays.length>0){
    h+='<div class="sh" style="color:var(--b2)">🌸 Aujourd\'hui</div>';
    // Sélecteur ton
    const allTpl=[].concat(DTPL,utpls);
    h+='<div style="margin-bottom:12px"><label style="margin-top:0">Ton du message :</label><div class="chips" style="margin-bottom:0">';
    allTpl.forEach(function(t){
      h+='<button class="chip'+(actTpl===t.id?' on':'')+'" onclick="setTpl(\''+t.id+'\',this)">'+t.e+' '+t.n+'</button>';
    });
    h+='</div></div>';
    todays.forEach(function(p){
      const age=ageBday(p.day,p.month,p.year);
      const ms=MS[age];
      const idx=m.indexOf(p);
      h+='<div class="card cr">';
      h+='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">';
      h+='<div class="av '+AV[idx%4]+'" style="width:50px;height:50px;font-size:16px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div><div style="font-family:var(--ff-title);font-size:18px;font-weight:700;color:var(--b2d)">'+tIco(p.type)+' '+esc(p.name)+'</div>';
      h+='<div style="font-size:13px;color:var(--b2);margin-top:2px">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(p.year?' '+p.year:'')+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
      if(ms)h+='<div style="display:inline-block;background:var(--b4l);color:var(--b4d);font-size:11px;padding:3px 10px;border-radius:20px;margin-top:5px;font-weight:700">'+ms+'</div>';
      h+='</div></div>';
      if(p.phone)h+='<div style="font-size:12px;color:var(--b2);margin-bottom:8px">📞 '+esc(p.phone)+'</div>';
      h+='<div id="h-msg-'+p.id+'"><div class="brow">';
      h+='<button class="btn G" onclick="genMsg('+p.id+',\'h-msg-'+p.id+'\')">'+t('msgBtn')+'</button>';
      if(pl.gifts)h+='<button class="btn V" onclick="genGift('+p.id+',\'h-gift-'+p.id+'\')">'+t('giftBtn')+'</button>';
      if(pl.cards)h+='<button class="btn O" onclick="genCard('+p.id+',\'h-card-'+p.id+'\')">'+t('cardBtn')+'</button>';
      h+='</div></div>';
      h+='<div id="h-gift-'+p.id+'"></div><div id="h-card-'+p.id+'"></div>';
      h+='</div>';
    });
    if(todays.length>1)h+='<button class="btn P fw" onclick="prepAll()" style="margin-bottom:12px">🌸 Préparer tous les messages</button>';
  } else if(m.length===0){
    h+='<div class="es"><div style="margin-bottom:14px"><svg width="64" height="64"><use href="#bi"/></svg></div>';
    h+='<div style="font-family:var(--ff-title);font-size:18px;font-weight:700;margin-bottom:10px">Bienvenue sur Bloomday !</div>';
    h+='<div style="margin-bottom:16px">Ajoutez vos premiers membres pour commencer à célébrer.</div>';
    h+='<button class="btn P" onclick="showSec(\'add\',2)">🌸 Ajouter un membre</button>';
    h+='</div>';
  } else {
    // Pas d'anniv aujourd'hui — afficher les prochains
    const nextFew=m.filter(function(p){return daysTill(p.day,p.month)>0;}).sort(function(a,b){return daysTill(a.day,a.month)-daysTill(b.day,b.month);}).slice(0,3);
    h+='<div class="card" style="background:linear-gradient(135deg,var(--b4l),var(--b1l));border:1.5px solid var(--b4);padding:20px;text-align:center;margin-bottom:12px">';
    h+='<div style="font-size:32px;margin-bottom:8px">🌸</div>';
    h+='<div style="font-family:var(--ff-title);font-size:17px;font-weight:700;color:var(--b4d);margin-bottom:5px">Aucun anniversaire aujourd\'hui</div>';
    h+='<div style="font-size:13px;color:var(--b4d);opacity:.75">Profitez-en pour préparer les prochains</div>';
    h+='</div>';
    if(nextFew.length>0){
      h+='<div class="sh">🎯 À préparer</div>';
      nextFew.forEach(function(p){
        const d=daysTill(p.day,p.month);
        const age=ageBday(p.day,p.month,p.year);
        const idx=m.indexOf(p);
        h+='<div class="card cb" style="display:flex;align-items:center;gap:12px">';
        h+='<div class="av '+AV[idx%4]+'" style="width:46px;height:46px;font-size:15px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
        h+='<div style="flex:1;min-width:0">';
        h+='<div style="font-size:15px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'</div>';
        h+='<div style="font-size:12px;color:var(--b1d);margin-top:2px">'+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t('yearsOld'):'')+'</div>';
        h+='<div style="font-size:11px;font-weight:700;color:var(--b1);margin-top:3px">dans '+d+' jour'+(d>1?'s':'')+'</div>';
        h+='</div>';
        h+='<div id="prep-'+p.id+'"><button class="btn O sm" onclick="genMsg('+p.id+',\'prep-'+p.id+'\')">Préparer →</button></div>';
        h+='</div>';
      });
    }
  }

  // --- 7 jours ---
  if(upcoming.length>0){
    h+='<div class="sh" style="margin-top:14px">Dans les 7 jours</div>';
    upcoming.forEach(function(p){
      const d=daysTill(p.day,p.month);
      const age=ageBday(p.day,p.month,p.year);
      const idx=m.indexOf(p);
      h+='<div class="card cb">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[idx%4]+'">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'<span class="pbdg pbs">dans '+d+'j</span></div>';
      h+='<div style="font-size:12px;color:var(--b1d)">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
      h+='</div></div>';
      h+='<div id="up-'+p.id+'"><div class="brow" style="margin-top:8px"><button class="btn sm" onclick="genMsg('+p.id+',\'up-'+p.id+'\')">Préparer →</button></div></div>';
      h+='</div>';
    });
  }

  // --- Vue mensuelle ---
  const monthAll=m.filter(function(p){return p.month===now.getMonth()+1;}).sort(function(a,b){return a.day-b.day;});
  if(monthAll.length>0){
    h+='<div class="sh" style="margin-top:16px">Tout '+MN[now.getMonth()]+'</div>';
    h+='<div class="card" style="padding:8px 14px">';
    monthAll.forEach(function(p){
      const age=ageBday(p.day,p.month,p.year);
      const isPast=now.getDate()>p.day;
      const isTod=isToday(p.day,p.month);
      h+='<div class="me">';
      h+='<div class="med'+(isPast&&!isTod?' past':'')+'">'+p.day+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:13px;font-weight:'+(isTod?700:500)+';color:'+(isTod?'var(--b2d)':'var(--txt)')+'">'+tIco(p.type)+' '+esc(p.name)+'</div>';
      h+='<div style="font-size:11px;color:var(--txt2)">'+tLbl(p.type)+(age?' · '+age+' '+t('yearsOld'):'')+'</div>';
      h+='</div>';
      if(isTod)h+='<span class="pbdg pbt">Aujourd\'hui</span>';
      h+='</div>';
    });
    h+='</div>';
  }

  // --- Rappel hebdo admins ---
  if(admins.length>0){
    const wb=[];
    for(let i=0;i<7;i++){
      const d=new Date(now);d.setDate(now.getDate()+i);
      m.filter(function(p){return p.day===d.getDate()&&p.month===d.getMonth()+1;}).forEach(function(p){wb.push({p:p,o:i});});
    }
    if(wb.length>0){
      const lines=wb.map(function(x){return(x.o===0?t('todayLabel'):x.o===1?t('tomorrowLabel'):'Dans '+x.o+'j')+' : '+x.p.name;}).join('\n');
      const subj=encodeURIComponent('Bloomday — Rappels');
      const body=encodeURIComponent(lines);
      h+='<div class="sh" style="margin-top:16px">Rappels</div>';
      h+='<div class="nb2"><div style="font-size:13px;font-weight:700;color:var(--b3d);margin-bottom:8px">🌸 Cette semaine : '+wb.map(function(x){return esc(x.p.name.split(' ')[0]);}).join(', ')+'</div>';
      h+='<div class="brow">';
      admins.forEach(function(a){
        if(a.email)h+='<a href="mailto:'+a.email+'?subject='+subj+'&body='+body+'"><button class="btn V sm">✉ '+esc(a.name.split(' ')[0])+'</button></a>';
        if(a.phone)h+='<a href="https://wa.me/'+a.phone.replace(/[^0-9]/g,'')+'?text='+subj+'%0A'+body+'" target="_blank"><button class="btn G sm">💬 '+esc(a.name.split(' ')[0])+'</button></a>';
      });
      h+='</div></div>';
    }
  }

  // --- Conseil du jour ---
  const tips=[
    {i:'💡',t:'Astuce',d:'Ajoutez des notes sur chaque membre pour des messages encore plus personnalisés.'},
    {i:'🌍',t:'50+ pays',d:'Configurez votre pays dans l\'onglet Plus pour voir vos fêtes locales.'},
    {i:'🌸',t:t('rippleTitle2')||'Bloomday Ripple',d:'Chaque message crée une belle page pour le destinataire — il peut s\'inscrire en 1 clic !'},
    {i:'💰',t:'Programme Ambassador',d:'Parrainez 3 amis = 1 mois gratuit. Jusqu\'à 30% de commission.'},
    {i:'🎁',t:'Cadeaux IA',d:'Plan Bloom : idées cadeaux personnalisées selon l\'âge et les goûts.'},
  ];
  const tip=(tArr('tips')[new Date().getDate()%5]||tArr('tips')[0]);
  h+='<div class="sh" style="margin-top:16px">✨ Conseil du jour</div>';
  h+='<div style="background:linear-gradient(135deg,var(--b3l),var(--b4l));border:1px solid var(--b3);border-radius:18px;padding:16px;display:flex;gap:12px;align-items:flex-start">';
  h+='<div style="font-size:28px;flex-shrink:0">'+tip.i+'</div>';
  h+='<div><div style="font-size:12px;font-weight:700;color:var(--b3d);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">'+tip.t+'</div>';
  h+='<div style="font-size:13px;color:var(--b3d);line-height:1.65">'+tip.d+'</div></div>';
  h+='</div>';

  el.innerHTML=h;
}
function rMembers(){
  const el=document.getElementById('s-members');if(!el||el.style.display==='none')return;
  const m=mems();
  // Axe 2 : filtre appliqué uniquement sur searchFiltered (état local)
  let filtered=searchFiltered!==null?searchFiltered:m;
  if(fMonth>0)filtered=filtered.filter(p=>p.month===fMonth);
  const pl=PL();
  // Champ de recherche FIXE — ne se recrée pas à chaque frappe
  // → le clavier reste ouvert sur mobile
  let h=`<div class="sw">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" id="search-inp" placeholder="Rechercher un membre…" value="${esc(searchInput)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      inputmode="search"
      oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter'){this.blur();}">
    <button id="srch-clr" class="clear-btn" style="display:${searchInput?'flex':'none'}" onclick="clearSearch()">✕</button>
  </div>`;
  h+=`<div class="chips"><button class="chip${fMonth===0?' on':''}" onclick="fMonth=0;rMembers()">Tous</button>`;
  for(let mo=1;mo<=12;mo++){if(m.some(p=>p.month===mo))h+=`<button class="chip${fMonth===mo?' on':''}" onclick="fMonth=${mo};rMembers()">${MNS[mo-1]}</button>`;}
  h+=`</div>`;
  if(!filtered.length){h+=`<div class="es">${m.length===0?t('noMembersYet'):'Aucun résultat pour cette recherche.'}</div>`;el.innerHTML=h;return;}
  h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} membre${filtered.length!==1?'s':''} · Plan ${PLANS[plan].name}</div>`;
  filtered.forEach(p=>{
    const idx=m.indexOf(p),tod=isToday(p.day,p.month),days=daysTill(p.day,p.month),soon=days>0&&days<=7;
    const age=ageBday(p.day,p.month,p.year),ms=MS[age],isEd=editId===p.id;
    const h2=hist[String(p.id)]||[];const isBiz=p.type==='work',ancOk=isBiz&&age&&[1,3,5,10,15,20,25,30].includes(age);
    h+=`<div class="prow"><div class="av ${isBiz?'av4':AV[idx%4]}">${p.photo?`<img src="${p.photo}" alt="">`:ini(p.name)}</div>
    <div class="pinfo"><div class="pname">${tIco(p.type)} ${esc(p.name)}${tod?'<span class="pbdg pbt">Aujourd\'hui !</span>':''}${soon&&!tod?`<span class="pbdg pbs">dans ${days}j</span>`:''}${ms&&(tod||soon)&&!isBiz?'<span class="pbdg pbk">Âge clé</span>':''}</div>
    <div class="pmeta">${p.day} ${MN[p.month-1]}${p.year?' '+p.year:''}${age&&!isBiz?' — '+age+' '+t('yearsOld'):isBiz&&age?' — '+age+' an(s)':''}</div>
    ${ancOk?`<div style="font-size:11px;color:var(--bizd);margin-top:2px;font-weight:700">🏆 ${age} an${age>1?'s':''} d'ancienneté !</div>`:''}
    ${ms&&!isBiz?`<div style="font-size:11px;color:var(--b4d);margin-top:2px;font-weight:600">${ms}</div>`:''}
    ${p.phone?`<div class="pmeta">📞 ${esc(p.phone)}</div>`:''}
    ${h2.length>0?`<details><summary>${h2.length} message${h2.length>1?'s':''} envoyé${h2.length>1?'s':''}</summary><div style="margin-top:6px">${h2.slice(-3).reverse().map(x=>`<div class="hi"><div class="hid">${x.date}</div><div style="font-size:12px;color:var(--txt2);margin-top:2px;line-height:1.5">${esc((x.text||'').substring(0,140))}${(x.text||'').length>140?'…':''}</div></div>`).join('')}</div></details>`:''}
    ${isEd?`<div class="ef"><div style="font-size:13px;font-weight:700;color:var(--b1d);margin-bottom:8px">✏️ Modifier</div>
    <div class="f3"><div><label>Jour</label><input id="em-day" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="${p.day}" inputmode="numeric"></div><div><label>Mois</label><select id="em-month">${[1,2,3,4,5,6,7,8,9,10,11,12].map(mo=>`<option value="${mo}"${p.month===mo?' selected':''}>${MNS[mo-1]}</option>`).join('')}</select></div><div><label>Année</label><input id="em-year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="${p.year||''}" inputmode="numeric"></div></div>
    <label>Nom</label><input id="em-name" value="${esc(p.name)}">
    <label>Téléphone</label><input id="em-phone" type="tel" value="${esc(p.phone||'')}">
    <label>Genre</label><select id="em-gender"><option value=""${!p.gender?' selected':''}>Non précisé</option><option value="femme"${p.gender==='femme'?' selected':''}>👩 Femme</option><option value="homme"${p.gender==='homme'?' selected':''}>👨 Homme</option><option value="enfant"${p.gender==='enfant'?' selected':''}>👶 Enfant</option></select>
    <label>Notes</label><textarea id="em-note">${esc(p.note||'')}</textarea>
    <div class="brow" style="margin-top:10px"><button class="btn G" style="flex:1" onclick="saveEdit(${p.id})">✓ Enregistrer</button><button class="btn" onclick="togEdit(${p.id})">Annuler</button></div></div>`:''}
    <div id="m-msg-${p.id}"></div><div id="m-gift-${p.id}"></div></div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button class="btn O sm" onclick="togEdit(${p.id})">${isEd?'✕':'✏'}</button>
    <button class="btn G sm" onclick="genMsg(${p.id},'m-msg-${p.id}')">✨</button>
    ${pl.gifts?`<button class="btn V sm" onclick="genGift(${p.id},'m-gift-${p.id}')">🎁</button>`:''}
    <button class="btn D sm" onclick="removeMem(${p.id})">✕</button></div></div>`;
  });
  // Div séparé pour la liste — mis à jour sans recréer le champ
  h+=`<div id="members-result"></div>`;
  h+=`<button class="exbtn" onclick="exportPDF()">📄 Exporter en PDF</button>`;
  el.innerHTML=h;
  // Rendre la liste immédiatement
  const listEl2=document.getElementById('members-result');
  if(listEl2)renderMembersList(listEl2);
  // Refocaliser le champ si recherche active (sans provoquer de scroll)
  if(searchInput){
    const inp=document.getElementById('search-inp');
    if(inp&&document.activeElement!==inp)inp.focus({preventScroll:true});
  }
}
function rEvents(){
  const el=document.getElementById('s-events');if(!el)return;
  const fetes=getActiveFetes(),up=fetes.filter(f=>f.dl<=90);
  let h=`<div class="sh">Prochaines fêtes & célébrations</div><div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Personnalisez dans <strong style="color:var(--txt)">Plus → Mon profil</strong></div><div class="card" style="padding:6px 14px">`;
  if(!up.length)h+=`<div style="font-size:13px;color:var(--txt2);padding:10px 0">Aucune fête dans les 90 prochains jours.</div>`;
  up.forEach(f=>{const lbl=f.dl===0?'Aujourd\'hui !':f.dl===1?t('tomorrowLabel'):`dans ${f.dl}j`;const st=f.dl===0?'background:var(--b2l);color:var(--b2d)':f.dl<=7?'background:var(--b1l);color:var(--b1d)':'background:var(--bg2);color:var(--txt2)';h+=`<div class="fr"><div class="fi">${f.i}</div><div style="flex:1"><div class="fn">${f.n}</div><div class="fd">${f.d} ${MN[f.m-1]}</div></div><div class="fpill" style="${st}">${lbl}</div></div>`;});
  h+=`</div>`;
  el.innerHTML=h;
}


// ══════════════════════════════════════════════════
// SYSTÈME EMAILS AUTOMATIQUES (simulé MVP)
// En An 2 : Resend ou Brevo via backend Supabase
// ══════════════════════════════════════════════════
var EMAIL_TEMPLATES = {
  welcome: function(d){
    return {
      subject: 'Bienvenue dans Bloomday, '+d.name.split(' ')[0]+' ! 🌸',
      body: 'Bonjour '+d.name.split(' ')[0]+',\n\n'+
        'Votre compte Bloomday est créé !\n'+
        '• 7 jours d\'essai offerts sur le plan Bloom\n'+
        '• Ajoutez vos premiers membres et générez votre premier message\n\n'+
        'Bienvenue dans la communauté 🌸\nL\'équipe Bloomday\nbloomday.app'
    };
  },
  subscription: function(d){
    return {
      subject: 'Confirmation — Plan '+d.plan+' activé ✓',
      body: 'Bonjour,\n\n'+
        'Votre plan Bloomday '+d.plan+' est actif.\n'+
        '• 7 jours d\'essai gratuits\n'+
        '• Premier prélèvement dans 7 jours\n'+
        '• Annulable à tout moment\n\n'+
        'Merci de nous faire confiance 🌸\nbloomday.app'
    };
  },
  renewal_reminder: function(d){
    return {
      subject: 'Votre abonnement Bloomday expire dans 3 jours ⏳',
      body: 'Bonjour,\n\n'+
        'Votre abonnement Bloomday '+d.plan+' expire dans 3 jours.\n\n'+
        'Continuez à célébrer vos proches sans interruption.\n'+
        '→ Renouveler sur bloomday.app\n\n'+
        'Code fidélité -10% : MERCI10\n\nL\'équipe Bloomday'
    };
  },
  anniversary: function(d){
    return {
      subject: 'Ça fait 1 an ensemble 🎉',
      body: 'Bonjour '+d.name+',\n\n'+
        'Aujourd\'hui, ça fait exactement 1 an que vous utilisez Bloomday !\n\n'+
        'En un an avec vous :\n'+
        '• Nombreux anniversaires célébrés\n'+
        '• Des messages qui ont touché des coeurs\n\n'+
        'Merci d\'être là. Pour vous : -20% sur le plan supérieur avec le code BLOOM1AN.\n\n'+
        'L\'équipe Bloomday 🌸'
    };
  }
};

function sendEmail(type, data){
  var tpl = EMAIL_TEMPLATES[type];
  if(!tpl) return;
  var email = tpl(data);
  showToast(t('emailSentTo')+' '+data.email, 'success');
}

function checkRenewalEmail(){
  // Vérifier si abonnement expire dans 3 jours
  if(!currentUser||!currentUser.planActivatedAt) return;
  var activated = new Date(currentUser.planActivatedAt);
  var expires = new Date(activated);
  expires.setMonth(expires.getMonth()+1);
  var now = new Date();
  var daysLeft = Math.ceil((expires-now)/86400000);
  if(daysLeft<=3&&daysLeft>0&&!localStorage.getItem('bdg16_renewal_notif')){
    sendEmail('renewal_reminder',{email:currentUser.email,plan:PLANS[plan]?PLANS[plan].name:'Bloom'});
    safeLsSet('bdg16_renewal_notif','1');
  }
}

function checkAnniversaryEmail(){
  if(!currentUser||!currentUser.createdAt) return;
  var created = new Date(currentUser.createdAt);
  var now = new Date();
  var days = Math.floor((now-created)/86400000);
  if(days===365&&!localStorage.getItem('bdg16_anniv_notif')){
    sendEmail('anniversary',{email:currentUser.email,name:currentUser.name||'',plan:PLANS[plan]?PLANS[plan].name:'Bloom'});
    safeLsSet('bdg16_anniv_notif','1');
  }
}


function updateAllTexts(){
  // 1. Éléments [data-i18n]
  var els=document.querySelectorAll('[data-i18n]');
  for(var i=0;i<els.length;i++){
    var el=els[i];var key=el.getAttribute('data-i18n');
    var val=t(key);if(val&&val!==key) el.textContent=val;
  }
  // 2. Placeholders [data-i18n-placeholder]
  var pEls=document.querySelectorAll('[data-i18n-placeholder]');
  for(var j=0;j<pEls.length;j++){
    var pEl=pEls[j];var pKey=pEl.getAttribute('data-i18n-placeholder');
    var pVal=t(pKey);if(pVal&&pVal!==pKey) pEl.placeholder=pVal;
  }
  // 3. Nav bas
  var navKeys=['navHome','navMembers','navAdd','navEvents','navMore'];
  var nbls=document.querySelectorAll('.nbl');
  for(var n=0;n<nbls.length;n++){if(navKeys[n]) nbls[n].textContent=t(navKeys[n]);}
  // 4. Slogan topbar
  var slogan=document.getElementById('tbsub-lang');
  if(slogan) slogan.textContent=t('appSlogan');
  // 5. Badge plan topbar
  var tbp=document.getElementById('tbplan');
  if(tbp) tbp.textContent=(PLANS[plan]?PLANS[plan].name:'Bloom')+' ▾';
  // 6. Langue courante dans sélecteur
  var langLabels={fr:'FR',en:'EN',es:'ES',ar:'AR',hi:'HI',zh:'ZH',pt:'PT'};
  var langCur=document.getElementById('lang-cur');
  if(langCur) langCur.textContent=langLabels[appLang]||appLang.toUpperCase();
  // 7. Direction RTL arabe
  document.body.style.direction=(appLang==='ar'?'rtl':'ltr');
  // 8. Noms des langues dans le sélecteur
  var langOpts=document.querySelectorAll('.lang-opt');
  var lnFlags={fr:'🇫🇷',en:'🇬🇧',es:'🇪🇸',ar:'🇸🇦',hi:'🇮🇳',zh:'🇨🇳',pt:'🇧🇷'};
  for(var lo=0;lo<langOpts.length;lo++){
    var loEl=langOpts[lo];var loCode=loEl.getAttribute('data-lang');
    loEl.classList.toggle('on',loCode===appLang);
    var lnKey='langName_'+loCode;var lnVal=t(lnKey);
    if(lnVal&&lnVal!==lnKey) loEl.textContent=(lnFlags[loCode]||'')+' '+lnVal;
  }
  // 9. Langue IA
  var aiLangMap={fr:'français',en:'English',es:'español',ar:'arabe',hi:'hindi',zh:'chinois',pt:'portugais'};
  window.__aiLang=aiLangMap[appLang]||'français';
  // 10. Forfaits re-render
  if(document.getElementById('plan-cards-perso')) renderAllPlans('perso');
  if(document.getElementById('plan-cards-biz')) renderAllPlans('biz');
  // 11. Sélecteur mois
  buildMonthSelect();
  // 12b. Sélecteurs pays
  if(typeof profile!=="undefined"){
    buildCountrySelect("prof-live",profile.live||"");
    buildCountrySelect("prof-origin",profile.origin||"");
  }
  // 12. <title> page
  var titleEl=document.getElementById('page-title');
  if(!titleEl){titleEl=document.querySelector('title');}
  if(titleEl) titleEl.textContent=t('pageTitle')||'Bloomday';
  // 13. Placeholder recherche membres
  var srch=document.getElementById('srch-inp');
  if(srch) srch.placeholder=t('searchMember');
  // 14. Placeholder nom dans formulaire
  var obName=document.getElementById('ob-name');
  if(obName) obName.placeholder=t('namePlaceholder');
  
// Bouton compte dans topbar
var tbAcctBtn=document.getElementById('tb-account-btn');
if(!tbAcctBtn){
  tbAcctBtn=document.createElement('button');
  tbAcctBtn.id='tb-account-btn';
  tbAcctBtn.style.cssText='background:none;border:none;font-size:18px;cursor:pointer;padding:4px 8px;color:var(--txt)';
  tbAcctBtn.textContent='\uD83D\uDC64';
  tbAcctBtn.title=t('myAccountTitle');
  tbAcctBtn.onclick=showAccountPage;
  var tbEl=document.getElementById('topbar');
  if(tbEl) tbEl.appendChild(tbAcctBtn);
}

  // 15. DTPL noms traduits
  var dtplNames=['dtpl1Name','dtpl2Name','dtpl3Name','dtpl4Name','dtpl5Name','dtpl6Name'];
  if(typeof DTPL!=='undefined'){
    for(var di=0;di<DTPL.length;di++){if(dtplNames[di])DTPL[di].n=t(dtplNames[di]);}
  }
  // 16. Options religion dans rMore
  var relSel=document.getElementById('prof-rel');
  if(relSel&&relSel.appendChild&&relSel.innerHTML!==undefined){
    var relKeys=['','relChristian','relMuslim','relJewish','relHindu','relBuddhist','relNone'];
    var relVals=['','christian','muslim','jewish','hindu','buddhist','none'];
    var relCur=relSel.value;
    relSel.innerHTML='';
    for(var ri=0;ri<relKeys.length;ri++){
      var rOpt=document.createElement('option');
      rOpt.value=relVals[ri];
      rOpt.textContent=ri===0?'—':t(relKeys[ri]);
      if(relVals[ri]===relCur) rOpt.selected=true;
      relSel.appendChild(rOpt);
    }
  }
}


// Traductions des noms de fêtes