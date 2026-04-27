function rHome(){
  const el=document.getElementById('s-home');
  if(!el)return;
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