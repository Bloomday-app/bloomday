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
    h+='<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--b3d)">'+t('pushNeverMiss')+'</div>';
    h+='<div style="font-size:12px;color:var(--b3d);margin-top:2px">'+t('pushAlerts')+'</div>';
    h+='<div class="brow" style="margin-top:8px">';
    h+='<button class="btn G sm" onclick="requestPush().then(function(){rHome();})">'+t('pushBtn')+'</button>';
    h+='<button class="btn sm" onclick="safeLsSet(\'bdg16_push_dismissed\',\'1\');rHome()">'+t('pushLater')+'</button>';
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
    h+='<div style="font-size:12px;color:var(--b4)">'+m.length+'/'+pl.mm+' '+t('membersPlanInfo')+' '+PLANS[plan].name+' · '+left+' '+(left!==1?t('planLeftPlural'):t('planLeft'))+'</div></div>';
    h+='<button class="btn V sm" onclick="goLand()">'+t('upgradeBtn')+'</button></div>';
  }

  // --- Urgence (raté hier) ---
  missed.forEach(function(p){
    h+='<div class="card curg">';
    h+='<div style="font-size:14px;font-weight:700;color:var(--b2d);margin-bottom:4px">⚡ '+t('missedBday')+'</div>';
    h+='<div style="font-size:13px;color:var(--b2);margin-bottom:8px">'+t('urgentSub')+' <strong>'+esc(p.name)+'</strong></div>';
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
    h+='<div style="font-size:10px;color:var(--b4);margin-top:1px;font-weight:700">'+(d>1?t('daysUnit'):t('dayUnit'))+'</div></div>';
    h+='<div style="flex:1;min-width:0">';
    h+='<div style="font-size:11px;font-weight:700;color:var(--b4);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">'+t('nextEventLabel')+' '+tLbl(nextEv.type)+'</div>';
    h+='<div style="display:flex;align-items:center;gap:8px">';
    h+='<div class="av '+AV[idx%4]+'" style="width:34px;height:34px;font-size:11px">'+(nextEv.photo?'<img src="'+nextEv.photo+'" alt="">':ini(nextEv.name))+'</div>';
    h+='<div><div style="font-size:15px;font-weight:700;color:var(--b4d)">'+esc(nextEv.name.split(' ')[0])+'</div>';
    h+='<div style="font-size:12px;color:var(--b4);margin-top:1px">'+nextEv.day+' '+MN[nextEv.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
    if(MS[age])h+='<div style="font-size:11px;color:var(--b4d);margin-top:3px;font-weight:700">'+MS[age]+'</div>';
    h+='</div></div></div></div>';
  }

  // --- Semaine ---
  h+='<div class="sh">'+t('thisWeek')+'</div><div class="wrow">';
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
    h+='<div class="sh" style="color:var(--b2)">'+t('todaySec')+'</div>';
    // Sélecteur ton
    const allTpl=[].concat(DTPL,utpls);
    h+='<div style="margin-bottom:12px"><label style="margin-top:0">'+t('messageTone')+' :</label><div class="chips" style="margin-bottom:0">';
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
      h+='<button class="btn V" onclick="genGiftModal('+p.id+')">'+t('giftBtn')+'</button>';
      if(pl.cards)h+='<button class="btn O" onclick="genCard('+p.id+',\'h-card-'+p.id+'\')">'+t('cardBtn')+'</button>';
      h+='</div></div>';
      h+='<div id="h-gift-'+p.id+'"></div><div id="h-card-'+p.id+'"></div>';
      h+='</div>';
    });
    if(todays.length>1)h+='<button class="btn P fw" onclick="prepAll()" style="margin-bottom:12px">'+t('prepareAllBtn')+'</button>';
  } else if(m.length===0){
    h+='<div class="es"><div style="margin-bottom:14px"><svg width="64" height="64"><use href="#bi"/></svg></div>';
    h+='<div style="font-family:var(--ff-title);font-size:18px;font-weight:700;margin-bottom:10px">'+t('welcomeBloom')+'</div>';
    h+='<div style="margin-bottom:16px">'+t('addFirstMembers')+'</div>';
    h+='<button class="btn P" onclick="showSec(\'add\',2)">'+t('addMemberCTA')+'</button>';
    h+='</div>';
  } else {
    // Pas d'anniv aujourd'hui — afficher les prochains
    const nextFew=m.filter(function(p){return daysTill(p.day,p.month)>0;}).sort(function(a,b){return daysTill(a.day,a.month)-daysTill(b.day,b.month);}).slice(0,3);
    h+='<div class="card" style="background:linear-gradient(135deg,var(--b4l),var(--b1l));border:1.5px solid var(--b4);padding:20px;text-align:center;margin-bottom:12px">';
    h+='<div style="font-size:32px;margin-bottom:8px">🌸</div>';
    h+='<div style="font-family:var(--ff-title);font-size:17px;font-weight:700;color:var(--b4d);margin-bottom:5px">'+t('noBirthdaysToday')+'</div>';
    h+='<div style="font-size:13px;color:var(--b4d);opacity:.75">'+t('prepareUpcoming')+'</div>';
    h+='</div>';
    if(nextFew.length>0){
      h+='<div class="sh">'+t('toPrepare')+'</div>';
      nextFew.forEach(function(p){
        const d=daysTill(p.day,p.month);
        const age=ageBday(p.day,p.month,p.year);
        const idx=m.indexOf(p);
        h+='<div class="card cb" style="display:flex;align-items:center;gap:12px">';
        h+='<div class="av '+AV[idx%4]+'" style="width:46px;height:46px;font-size:15px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
        h+='<div style="flex:1;min-width:0">';
        h+='<div style="font-size:15px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'</div>';
        h+='<div style="font-size:12px;color:var(--b1d);margin-top:2px">'+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t('yearsOld'):'')+'</div>';
        h+='<div style="font-size:11px;font-weight:700;color:var(--b1);margin-top:3px">'+t('inDays')+' '+d+' '+(d>1?t('daysUnit'):t('dayUnit'))+'</div>';
        h+='</div>';
        h+='<div id="prep-'+p.id+'"><button class="btn O sm" onclick="genMsg('+p.id+',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
        h+='</div>';
      });
    }
  }

  // --- 7 jours ---
  if(upcoming.length>0){
    h+='<div class="sh" style="margin-top:14px">'+t('next7Days')+'</div>';
    upcoming.forEach(function(p){
      const d=daysTill(p.day,p.month);
      const age=ageBday(p.day,p.month,p.year);
      const idx=m.indexOf(p);
      h+='<div class="card cb">';
      h+='<div style="display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[idx%4]+'">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
      h+='<div style="flex:1;min-width:0">';
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d)">'+tIco(p.type)+' '+esc(p.name)+'<span class="pbdg pbs">'+t('inDays')+' '+d+'j</span></div>';
      h+='<div style="font-size:12px;color:var(--b1d)">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t('yearsOld'):'')+'</div>';
      h+='</div></div>';
      h+='<div id="up-'+p.id+'"><div class="brow" style="margin-top:8px"><button class="btn sm" onclick="genMsg('+p.id+',\'up-'+p.id+'\')">'+t('prepareBtn')+'</button></div></div>';
      h+='</div>';
    });
  }

  // --- Vue mensuelle ---
  const monthAll=m.filter(function(p){return p.month===now.getMonth()+1;}).sort(function(a,b){return a.day-b.day;});
  if(monthAll.length>0){
    h+='<div class="sh" style="margin-top:16px">'+t('allThisMonth')+' '+MN[now.getMonth()]+'</div>';
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
      if(isTod)h+='<span class="pbdg pbt">'+t('todayLabel')+'</span>';
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
      const lines=wb.map(function(x){return(x.o===0?t('todayLabel'):x.o===1?t('tomorrowLabel'):t('inDays')+' '+x.o+'j')+' : '+x.p.name;}).join('\n');
      const subj=encodeURIComponent('Bloomday — '+t('remindersTitle'));
      const body=encodeURIComponent(lines);
      h+='<div class="sh" style="margin-top:16px">'+t('remindersTitle')+'</div>';
      h+='<div class="nb2"><div style="font-size:13px;font-weight:700;color:var(--b3d);margin-bottom:8px">'+t('remindersWeek')+' '+wb.map(function(x){return esc(x.p.name.split(' ')[0]);}).join(', ')+'</div>';
      h+='<div class="brow">';
      admins.forEach(function(a){
        if(a.email)h+='<a href="mailto:'+a.email+'?subject='+subj+'&body='+body+'"><button class="btn V sm">✉ '+esc(a.name.split(' ')[0])+'</button></a>';
        if(a.phone)h+='<a href="https://wa.me/'+a.phone.replace(/[^0-9]/g,'')+'?text='+subj+'%0A'+body+'" target="_blank"><button class="btn G sm">💬 '+esc(a.name.split(' ')[0])+'</button></a>';
      });
      h+='</div></div>';
    }
  }

  // --- Conseil du jour ---
  const tip=(tArr('tips')[new Date().getDate()%5]||tArr('tips')[0]);
  h+='<div class="sh" style="margin-top:16px">'+t('tipOfDay')+'</div>';
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
  if(fType){
    if(fType==='other')filtered=filtered.filter(p=>p.type!=='birthday'&&p.type!=='wedding'&&p.type!=='work'&&p.type!=='custom');
    else filtered=filtered.filter(p=>p.type===fType);
  }
  const pl=PL();
  // Champ de recherche FIXE — ne se recrée pas à chaque frappe
  // → le clavier reste ouvert sur mobile
  let h=`<div class="sw">
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    <input type="text" id="search-inp" placeholder="${t('searchMember')}" value="${esc(searchInput)}"
      autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
      inputmode="search"
      oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Enter'){this.blur();}">
    <button id="srch-clr" class="clear-btn" style="display:${searchInput?'flex':'none'}" onclick="clearSearch()">✕</button>
  </div>`;
  h+=`<div class="chips"><button class="chip${fMonth===0?' on':''}" onclick="fMonth=0;rMembers()">${t('allMonths')}</button>`;
  for(let mo=1;mo<=12;mo++){if(m.some(p=>p.month===mo))h+=`<button class="chip${fMonth===mo?' on':''}" onclick="fMonth=${mo};rMembers()">${MNS[mo-1]}</button>`;}
  h+=`</div>`;
  const typeOpts=[{v:'',l:'🎯 '+t('allTypes')},{v:'birthday',l:'🎂'},{v:'wedding',l:'💍'},{v:'work',l:'💼'},{v:'custom',l:'⭐'},{v:'other',l:'✏️'}];
  const typeLabels={birthday:t('evtBirthday'),wedding:t('evtWedding'),work:t('evtWork'),custom:t('evtCustom'),other:t('evtOther')};
  const usedTypes=new Set(m.map(p=>['birthday','wedding','work','custom'].includes(p.type)?p.type:'other'));
  if(usedTypes.size>1){
    h+=`<div class="chips" style="margin-top:4px">`;
    typeOpts.forEach(o=>{
      if(o.v===''||usedTypes.has(o.v))
        h+=`<button class="chip${fType===o.v?' on':''}" onclick="fType='${o.v}';rMembers()">${o.v?typeLabels[o.v]||o.l:o.l}</button>`;
    });
    h+=`</div>`;
  }
  if(!filtered.length){h+=`<div class="es">${m.length===0?t('noMembersYet'):t('noSearchResults')}</div>`;el.innerHTML=h;return;}
  h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:10px;font-weight:600">${filtered.length} ${filtered.length!==1?t('membersCount'):t('memberCount')} · Plan ${PLANS[plan].name}</div>`;
  filtered.forEach(p=>{
    const idx=m.indexOf(p),tod=isToday(p.day,p.month),days=daysTill(p.day,p.month),soon=days>0&&days<=7;
    const age=ageBday(p.day,p.month,p.year),ms=MS[age],isEd=editId===p.id;
    const h2=hist[String(p.id)]||[];const isBiz=p.type==='work',ancOk=isBiz&&age&&[1,3,5,10,15,20,25,30].includes(age);
    h+=`<div class="prow"><div class="av ${isBiz?'av4':AV[idx%4]}">${p.photo?`<img src="${p.photo}" alt="">`:ini(p.name)}</div>
    <div class="pinfo"><div class="pname">${tIco(p.type)} ${esc(p.name)}${tod?'<span class="pbdg pbt">'+t('todayLabel')+'</span>':''}${soon&&!tod?`<span class="pbdg pbs">${t('inDays')} ${days}j</span>`:''}${ms&&(tod||soon)&&!isBiz?'<span class="pbdg pbk">'+t('yearsOld')+'</span>':''}</div>
    <div class="pmeta">${p.day} ${MN[p.month-1]}${p.year?' '+p.year:''}${age&&!isBiz?' — '+age+' '+t('yearsOld'):isBiz&&age?' — '+age+' '+t('yearsOld'):''}</div>
    ${ancOk?`<div style="font-size:11px;color:var(--bizd);margin-top:2px;font-weight:700">🏆 ${age} ${t('yearsOld')}</div>`:''}
    ${ms&&!isBiz?`<div style="font-size:11px;color:var(--b4d);margin-top:2px;font-weight:600">${ms}</div>`:''}
    ${p.phone?`<div class="pmeta">📞 ${esc(p.phone)}</div>`:''}
    ${h2.length>0?`<details><summary>${h2.length} ${h2.length>1?t('membersCount'):t('memberCount')}</summary><div style="margin-top:6px">${h2.slice(-3).reverse().map(x=>`<div class="hi"><div class="hid">${x.date}</div><div style="font-size:12px;color:var(--txt2);margin-top:2px;line-height:1.5">${esc((x.text||'').substring(0,140))}${(x.text||'').length>140?'…':''}</div></div>`).join('')}</div></details>`:''}
    ${isEd?`<div class="ef"><div style="font-size:13px;font-weight:700;color:var(--b1d);margin-bottom:8px">${t('editMember')}</div>
    <div class="f3"><div><label>${t('dayLabel')||'Jour'}</label><input id="em-day" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" value="${p.day}" inputmode="numeric"></div><div><label>${t('monthLabel')||'Mois'}</label><select id="em-month">${[1,2,3,4,5,6,7,8,9,10,11,12].map(mo=>`<option value="${mo}"${p.month===mo?' selected':''}>${MNS[mo-1]}</option>`).join('')}</select></div><div><label>${t('yearLabel')||'Année'}</label><input id="em-year" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="${p.year||''}" inputmode="numeric"></div></div>
    <label>${t('namePlaceholder')||'Nom'}</label><input id="em-name" value="${esc(p.name)}">
    <label>${t('labelPhone')||'Téléphone'}</label><input id="em-phone" type="tel" value="${esc(p.phone||'')}">
    <label>${t('genderLabel')||'Genre'}</label><select id="em-gender"><option value=""${!p.gender?' selected':''}>${t('genderNone')}</option><option value="femme"${p.gender==='femme'?' selected':''}>${t('genderF')}</option><option value="homme"${p.gender==='homme'?' selected':''}>${t('genderM')}</option><option value="enfant"${p.gender==='enfant'?' selected':''}>${t('genderKid')}</option></select>
    <label>${t('notesLabel')||'Notes'}</label><textarea id="em-note">${esc(p.note||'')}</textarea>
    <label>${t('customMsgLabel')||'Message personnalisé'}</label><textarea id="em-custom-msg" style="min-height:70px">${esc(p.customMsg||'')}</textarea>
    <div class="brow" style="margin-top:10px"><button class="btn G" style="flex:1" onclick="saveEdit(${p.id})">${t('saveBtn')}</button><button class="btn" onclick="togEdit(${p.id})">${t('cancelBtn')}</button></div></div>`:''}
    <div id="m-msg-${p.id}"></div><div id="m-gift-${p.id}"></div></div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button class="btn O sm" onclick="togEdit(${p.id})">${isEd?'✕':'✏'}</button>
    <button class="btn G sm" onclick="genMsg(${p.id},'m-msg-${p.id}')">✨</button>
    <button class="btn V sm" onclick="genGiftModal(${p.id})">💡</button>
    <button class="btn D sm" onclick="removeMem(${p.id})">✕</button></div></div>`;
  });
  h+=`<button class="exbtn" onclick="exportPDF()">${t('exportPDFBtn')}</button>`;
  el.innerHTML=h;
  // Refocaliser le champ si recherche active (sans provoquer de scroll)
  if(searchInput){
    const inp=document.getElementById('search-inp');
    if(inp&&document.activeElement!==inp)inp.focus({preventScroll:true});
  }
}
function rEvents(){
  const el=document.getElementById('s-events');if(!el)return;
  const fetes=getActiveFetes(),up=fetes.filter(f=>f.dl<=90);
  let h=`<div class="sh">${t('nextCelebrations')}</div><div style="font-size:12px;color:var(--txt2);margin-bottom:12px">${t('personalizeProfile')}</div><div class="card" style="padding:6px 14px">`;
  if(!up.length)h+=`<div style="font-size:13px;color:var(--txt2);padding:10px 0">${t('noCelebrations')}</div>`;
  up.forEach(f=>{
    const nom=tFete(f.n)||f.n;
    const lbl=f.dl===0?t('today')||'Aujourd\'hui !':f.dl===1?t('tomorrowLabel')||'Demain':`${t('inDays')||'dans'} ${f.dl}j`;
    const st=f.dl===0?'background:var(--b2l);color:var(--b2d)':f.dl<=7?'background:var(--b1l);color:var(--b1d)':'background:var(--bg2);color:var(--txt2)';
    h+=`<div class="fr"><div class="fi">${f.i}</div><div style="flex:1"><div class="fn">${esc(nom)}</div><div class="fd">${f.d} ${MN[f.m-1]}</div></div><div class="fpill" style="${st}">${esc(lbl)}</div></div>`;
  });
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
        'Bienvenue dans la communauté 🌸\nL\'équipe Bloomday\nmybloomday.app'
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
        'Merci de nous faire confiance 🌸\nmybloomday.app'
    };
  },
  renewal_reminder: function(d){
    return {
      subject: 'Votre abonnement Bloomday expire dans 3 jours ⏳',
      body: 'Bonjour,\n\n'+
        'Votre abonnement Bloomday '+d.plan+' expire dans 3 jours.\n\n'+
        'Continuez à célébrer vos proches sans interruption.\n'+
        '→ Renouveler sur mybloomday.app\n\n'+
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
  if(!data||!data.email) return;
  if(!EMAIL_TEMPLATES[type]) return;
  fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({type, data})
  }).catch(function(){});
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


function updateNavAvatar(){
  var av=document.getElementById('nb4-avatar');
  if(!av) return;
  var photo=localStorage.getItem('bdg16_user_photo')||'';
  if(photo){
    av.textContent='';
    var img=document.createElement('img');
    img.src=photo;
    img.alt='profil';
    av.appendChild(img);
    return;
  }
  var sp=document.getElementById('nb4-initials');
  if(!sp) return;
  var name=(profile&&profile.name)||'';
  sp.textContent=(name.trim()[0]||'').toUpperCase()||'\uD83C\uDF38';
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
  var navKeys=['navHome','navMembers','navAdd','navEvents','navProfile'];
  var nbls=document.querySelectorAll('.nbl');
  for(var n=0;n<nbls.length;n++){if(navKeys[n]) nbls[n].textContent=t(navKeys[n]);}
  updateNavAvatar();
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

// ── FÊTES ──
function getActiveFetes(){
  var now=new Date();
  var live=(profile&&profile.live)||'fr';
  var rel=(profile&&profile.religion)||'';
  return FETES.map(function(f){
    var m=f.m,d=f.d;
    var ok=f.c.includes('universal')||f.c.includes(live)||(rel&&f.c.includes(rel));
    if(!ok)return null;
    var x=new Date(now.getFullYear(),m-1,d);
    var dl=Math.round((x-now)/86400000);
    if(dl<0){x.setFullYear(now.getFullYear()+1);dl=Math.round((x-now)/86400000);}
    return {n:f.n,i:f.i,m:m,d:d,dl:dl};
  }).filter(Boolean).sort(function(a,b){return a.dl-b.dl;});
}

// ── CALENDRIER ──
function rCal(){
  var el=document.getElementById('s-cal');if(!el)return;
  var m=mems();
  var h='<div class="sh">'+t('calendarTitle')+'</div>';
  var found=false;
  for(var mo=1;mo<=12;mo++){
    var inM=m.filter(function(p){return p.month===mo;});
    if(!inM.length)continue;
    found=true;
    h+='<div class="sh" style="font-size:12px;margin-top:12px;color:var(--b1d)">'+MN[mo-1]+'</div>';
    inM.forEach(function(p){
      var age=ageBday(p.day,p.month,p.year);
      var tod=isToday(p.day,p.month);
      h+='<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)">';
      h+='<div style="min-width:32px;text-align:center;font-size:14px;font-weight:700;color:'+(tod?'var(--b2d)':'var(--b1d)')+'">'+p.day+'</div>';
      h+='<div style="flex:1"><div style="font-size:14px;font-weight:600">'+tIco(p.type)+' '+esc(p.name)+(tod?'<span class="pbdg pbt" style="margin-left:6px">'+t('calendarToday')+'</span>':'')+'</div>';
      if(age)h+='<div style="font-size:12px;color:var(--txt2)">'+age+' '+t('yearsOld')+'</div>';
      h+='</div></div>';
    });
  }
  if(!found)h+='<div style="font-size:13px;color:var(--txt2);padding:20px 0">'+t('calendarEmpty')+'</div>';
  el.innerHTML=h;
}

// ── PLUS ──
function rMore(){
  var el=document.getElementById('s-more');if(!el)return;
  var h='';
  h+='<div class="sh">'+t('monProfil')+'</div>';
  h+='<div class="card" style="padding:16px">';
  h+='<label>'+t('liveCountry')+'</label><select id="prof-live" onchange="profile.live=this.value;savePr();rEvents()"></select>';
  h+='<label style="margin-top:12px">'+t('originCountry')+'</label><select id="prof-origin" onchange="profile.origin=this.value;savePr()"></select>';
  h+='<label style="margin-top:12px">'+t('religionLabel')+'</label><select id="prof-rel" onchange="profile.religion=this.value;savePr();rEvents()"></select>';
  h+='</div>';
  // ── SECTION PARRAINAGE ──
  var refs = (stats && stats.refsCount) || 0;
  var refCode = (stats && stats.code) || '';
  var refUrl = refCode ? window.location.origin + '/?ref=' + refCode : '';
  var tier = ambTier(refs);

  var tierColors = {
    bronze: {bg:'#FFF3E0', border:'#E0A070', text:'#8B4513', glow:'rgba(224,160,112,0.3)'},
    argent: {bg:'#F0F4FF', border:'#8FA8D8', text:'#2D4A8A', glow:'rgba(143,168,216,0.3)'},
    or:     {bg:'#FFFBEA', border:'#D4AF37', text:'#7B5A00', glow:'rgba(212,175,55,0.35)'}
  };
  var tc = tier ? tierColors[tier] : null;
  var tierLabel = tier ? t('refTier' + tier.charAt(0).toUpperCase() + tier.slice(1)) : t('refTierNone');
  var nextCount = refs < 3 ? 3 : refs < 10 ? 10 : refs < 25 ? 25 : null;

  h += '<div style="background:var(--bg2);border-radius:16px;padding:16px;margin-bottom:14px">';
  h += '<div style="font-size:15px;font-weight:700;color:var(--b1d);margin-bottom:4px">' + t('refTitle') + '</div>';
  h += '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">' + t('refSub') + '</div>';

  if (tc) {
    h += '<div style="background:' + tc.bg + ';border:2px solid ' + tc.border + ';border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 0 18px ' + tc.glow + ';position:relative;overflow:hidden">';
    h += '<div style="position:absolute;top:-18px;right:-18px;font-size:60px;opacity:0.12;transform:rotate(-15deg)">🌸</div>';
    h += '<div style="font-size:17px;font-weight:800;color:' + tc.text + '">' + tierLabel + '</div>';
    h += '<div style="font-size:12px;color:' + tc.text + ';opacity:0.8;margin-top:2px">' + refs + ' ' + t('refStatsLabel') + '</div>';
    h += '</div>';
  } else {
    h += '<div style="background:var(--bg3,#f0f0f0);border-radius:12px;padding:12px;margin-bottom:12px;text-align:center;font-size:13px;color:var(--txt2)">' + tierLabel + ' — 0 ' + t('refStatsLabel') + '</div>';
  }

  if (nextCount) {
    var progress = Math.min(100, Math.round(refs / nextCount * 100));
    h += '<div style="background:var(--bg3,#eee);border-radius:99px;height:6px;margin-bottom:6px">';
    h += '<div style="background:var(--b1);border-radius:99px;height:6px;width:' + progress + '%;transition:width 0.5s"></div></div>';
    var remaining = nextCount - refs;
    h += '<div style="font-size:11px;color:var(--txt2);margin-bottom:10px">' + remaining + ' ' + t('refNextTier') + '</div>';
  }

  h += '<div style="font-size:11px;color:var(--txt2);margin-bottom:10px;line-height:1.8">' + t('refBenefit3') + '<br>' + t('refBenefit10') + '<br>' + t('refBenefit25') + '</div>';

  if (refUrl) {
    h += '<div style="display:flex;gap:8px">';
    h += '<button class="btn G" style="flex:1;font-size:12px" onclick="copyRefLink(\'' + esc(refUrl) + '\')">' + t('refCopyBtn') + '</button>';
    if (navigator.share) {
      h += '<button class="btn P" style="flex:1;font-size:12px" onclick="shareRefLink(\'' + esc(refUrl) + '\')">' + t('refShareBtn') + '</button>';
    }
    h += '</div>';
  }
  h += '</div>';

  h+='<div class="sh" style="margin-top:16px">'+t('planActuel')+'</div>';
  h+='<div class="card" style="padding:16px">';
  h+='<div style="font-size:15px;font-weight:700">'+((PLANS[plan]&&PLANS[plan].name)||'Starter')+'</div>';
  h+='<div style="font-size:12px;color:var(--txt2);margin-top:4px">'+mems().length+'/'+PL().mm+' '+t('membresLabel')+' · '+PL().msgs+' '+t('msgsLabel')+'</div>';
  h+='<button class="btn P fw" style="margin-top:12px" onclick="goLand()">'+t('voirTousPlans')+'</button>';
  h+='</div>';
  if(currentUser){
    var ini=(currentUser.name||currentUser.email||'?')[0].toUpperCase();
    h+='<div class="sh" style="margin-top:16px">'+t('sectionMonCompte')+'</div>';
    h+='<div class="card" style="padding:16px">';
    h+='<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    h+='<div style="width:50px;height:50px;border-radius:50%;background:var(--b3l);color:var(--b3d);display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;flex-shrink:0">'+esc(ini)+'</div>';
    h+='<div style="min-width:0"><div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(currentUser.name)+'</div>';
    h+='<div style="font-size:12px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(currentUser.email)+'</div></div>';
    h+='</div>';
    h+='<div style="font-size:11px;color:var(--txt3);margin-bottom:14px;background:var(--bg2);padding:7px 10px;border-radius:8px;font-family:monospace">ID: '+currentUser.uid.substring(0,8)+'•••</div>';
    h+='<button class="btn fw" style="margin-bottom:8px" onclick="doResetPassword()">'+t('resetPasswordBtn')+'</button>';
    h+='<button class="btn D fw" onclick="doDeleteAccount()">'+t('deleteAccountBtn')+'</button>';
    h+='</div>';
  }
  h+='<div class="sh" style="margin-top:16px">'+t('sectionCompte')+'</div>';
  h+='<div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">';
  h+='<button class="btn fw" onclick="openPlanModal()">'+t('changerPlan')+'</button>';
  h+='<button class="btn D fw" onclick="doLogoutSupabase()">'+t('signOutBtn')+'</button>';
  h+='</div>';
  h+='<div style="text-align:center;font-size:11px;color:var(--txt3);margin:24px 0 8px">Bloomday v2 · mybloomday.app</div>';
  el.innerHTML=h;
  buildCountrySelect('prof-live',profile.live||'fr');
  buildCountrySelect('prof-origin',profile.origin||'');
  updateAllTexts();
}

// ── GÉNÉRATION MESSAGES ──
function _renderMsgActions(elId,msg,phone){
  return '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">'+
    '<button class="btn G sm" onclick="copyMsg(\''+elId+'\')">'+t('copyBtn')+'</button>'+
    (phone?'<button class="btn sm" onclick="sendWA(\''+esc(phone)+'\',\''+elId+'\')">'+t('sendWhatsApp')+'</button>':'')+
    '<button class="btn sm" style="font-size:11px" onclick="openRipple(\''+_c(msg)+'\',\''+elId+'\')" title="Bloomday Ripple">🌊</button>'+
    '</div>';
}
async function genMsg(id,elId){
  var el=document.getElementById(elId);if(!el)return;
  var p=mems().find(function(x){return x.id===id;});if(!p)return;
  var pl=PL();
  if((stats.msgsM||0)>=pl.msgs){
    el.innerHTML='<div style="color:var(--b2d);font-size:12px;padding:8px">'+t('msgLimitReached')+'</div>';return;
  }
  if(p.customMsg){
    var cm=p.customMsg;
    el.innerHTML='<div class="ob-msg" style="font-size:13px">'+esc(cm)+'</div>'+
      _renderMsgActions(elId,cm,p.phone)+
      '<button class="btn sm" style="font-size:11px;color:var(--txt2);margin-top:4px" onclick="genMsgAI('+id+',\''+elId+'\')">✨ '+t('generateAIInstead')+'</button>';
    return;
  }
  el.innerHTML='<div style="text-align:center;padding:12px"><div class="ld"></div></div>';
  var tpl=DTPL.find(function(x){return x.id===actTpl;})||DTPL[0];
  var age=ageBday(p.day,p.month,p.year);
  var isTod=isToday(p.day,p.month);
  var prompt='Génère en '+(window.__aiLang||'français')+' un message '+tpl.t+' pour '+p.name+(age?' ('+age+' ans'+(isTod?' aujourd\'hui':'')+')':''+(isTod?" dont c'est l'événement aujourd'hui":''))+(p.note?'. Notes personnelles : '+p.note:'')+'. Maximum 3-4 phrases.';
  try{
    var ac=new AbortController();var tid=setTimeout(function(){ac.abort();},15000);
    var resp=await fetch('/.netlify/functions/generate-message',{method:'POST',headers:await getAuthHeaders(),body:JSON.stringify({prompt:prompt,plan:plan}),signal:ac.signal});
    clearTimeout(tid);
    var data=await resp.json();
    if(!resp.ok){console.error('[AI]',resp.status,data.error);throw new Error(data.error||'HTTP '+resp.status);}
    var msg=data.message||'';
    stats.msgsM=(stats.msgsM||0)+1;sg('bdg16_stats',stats);
    var h2=hist[String(id)]||[];h2.push({date:new Date().toLocaleDateString('fr'),text:msg});hist[String(id)]=h2.slice(-20);sg('bdg16_hist',hist);
    stats.celeb=(stats.celeb||0)+1;
    el.innerHTML='<div class="ob-msg" style="font-size:13px">'+esc(msg)+'</div>'+_renderMsgActions(elId,msg,p.phone);
  }catch(e){
    el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:8px;white-space:pre-wrap">'+esc(getFallback('birthday'))+'</div>';
  }
}
async function genMsgAI(id,elId){
  var p=mems().find(function(x){return x.id===id;});
  if(p){var orig=p.customMsg;p.customMsg=undefined;await genMsg(id,elId);p.customMsg=orig;}
}

async function genGift(id,elId){
  var el=document.getElementById(elId);if(!el)return;
  var p=mems().find(function(x){return x.id===id;});if(!p)return;
  el.innerHTML='<div style="text-align:center;padding:12px"><div class="ld"></div></div>';
  var age=ageBday(p.day,p.month,p.year);
  var lang=window.__aiLang||'français';
  var genderTxt=p.gender==='F'?'femme':p.gender==='M'?'homme':p.gender==='Kid'?'enfant':'';
  var prompt='Tu es un assistant cadeaux. Génère en '+lang+' exactement 3 idées cadeaux pour '+p.name+(age?' ('+age+' ans)':'')+(genderTxt?', '+genderTxt:'')+(p.note?', intérêts : '+p.note:'')+'. Réponds UNIQUEMENT en JSON valide, format : [{"emoji":"...","nom":"...","desc":"courte description","prix":"fourchette prix","search":"mot-clé court pour Amazon"}]. Juste le JSON, sans explication.';
  try{
    var ac2=new AbortController();var tid2=setTimeout(function(){ac2.abort();},15000);
    var resp=await fetch('/.netlify/functions/generate-message',{method:'POST',headers:await getAuthHeaders(),body:JSON.stringify({prompt:prompt,plan:plan}),signal:ac2.signal});
    clearTimeout(tid2);
    var data=await resp.json();
    if(!resp.ok){console.error('[AI]',resp.status,data.error);throw new Error(data.error||'HTTP '+resp.status);}
    var raw=(data.message||'').trim();
    var gifts=null;
    try{var m=raw.match(/\[[\s\S]*\]/);if(m)gifts=JSON.parse(m[0]);}catch(e2){}
    if(gifts&&gifts.length){
      var h='<div style="display:flex;flex-direction:column;gap:8px;margin-top:4px">';
      gifts.forEach(function(g){
        var link='https://www.amazon.fr/s?k='+encodeURIComponent(g.search||g.nom)+'&tag=bloomday-21';
        h+='<div style="background:var(--bg2,#f7f7f7);border-radius:12px;padding:10px 12px">';
        h+='<div style="font-size:15px;margin-bottom:2px">'+esc(g.emoji||'🎁')+' <strong>'+esc(g.nom)+'</strong> <span style="color:var(--b2,#e8a0b0);font-size:12px">'+esc(g.prix)+'</span></div>';
        h+='<div style="font-size:12px;color:var(--txt2,#888);margin-bottom:6px">'+esc(g.desc)+'</div>';
        h+='<a href="'+link+'" target="_blank" rel="noopener" style="display:inline-block;font-size:12px;color:var(--b2,#e8a0b0);text-decoration:none;background:var(--bg3,#fff);border:1px solid var(--brd,#eee);padding:4px 10px;border-radius:6px">🛒 '+t('giftAmazonBtn')+'</a>';
        h+='</div>';
      });
      h+='</div>';
      h+='<div style="background:linear-gradient(135deg,#fff5f7,#fff);border:1px solid #ffd6e0;border-radius:12px;padding:10px 12px;margin-top:8px">';
      h+='<div style="font-size:13px;font-weight:600;margin-bottom:2px">'+t('floristTitle')+'</div>';
      h+='<div style="font-size:12px;color:var(--txt2,#888);margin-bottom:6px">'+t('floristDesc')+'</div>';
      h+='<button class="btn sm" style="font-size:12px" onclick="openFlorist(\''+elId+'\',\''+esc(p.name)+'\')">'+t('floristBtn')+'</button>';
      h+='</div>';
      el.innerHTML=h;
    }else{
      el.innerHTML='<div class="ob-msg" style="font-size:13px">'+esc(raw)+'</div>'+
        '<button class="btn G sm" style="margin-top:8px" onclick="copyMsg(\''+elId+'\')">'+t('copyBtn')+'</button>';
    }
  }catch(e){el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:8px">'+t('errorRetry')+'</div>';}
}

function openFlorist(elId,name){
  var q='livraison fleurs anniversaire '+name;
  window.open('https://www.google.fr/search?q='+encodeURIComponent(q),'_blank');
}

window.__giftData={};

async function genGiftModal(id){
  var p=mems().find(function(x){return x.id===id;});if(!p)return;
  var nameEl=document.getElementById('mgift-name');
  var el=document.getElementById('mgift-c');
  if(!el||!nameEl)return;
  nameEl.textContent=p.name;
  el.innerHTML='<div style="text-align:center;padding:24px"><div class="ld"></div></div>';
  openOv('mgift');
  var age=ageBday(p.day,p.month,p.year);
  var rel=tLbl(p.type)||'';
  var lang=window.__aiLang||'français';
  var genderTxt=p.gender==='femme'?'femme':p.gender==='homme'?'homme':p.gender==='enfant'?'enfant':'';
  var ctx=[p.name,age?age+' ans':'',rel,genderTxt,p.note?'intérêts: '+p.note:''].filter(Boolean).join(', ');
  var prompt='Tu es un assistant cadeaux. Génère en '+lang+' exactement 6 idées cadeaux créatives et personnalisées pour '+ctx+'. Réponds UNIQUEMENT en JSON valide, format : [{"emoji":"...","nom":"...","desc":"courte description","prix":"fourchette prix","search":"mot-clé court pour Amazon"}]. Juste le JSON, sans explication.';
  try{
    var ac=new AbortController();var tid=setTimeout(function(){ac.abort();},15000);
    var resp=await fetch('/.netlify/functions/generate-message',{method:'POST',headers:await getAuthHeaders(),body:JSON.stringify({prompt:prompt,plan:plan}),signal:ac.signal});
    clearTimeout(tid);
    var data=await resp.json();
    if(!resp.ok)throw new Error(data.error||'HTTP '+resp.status);
    var raw=(data.message||'').trim();
    var gifts=null;
    try{var mx=raw.match(/\[[\s\S]*\]/);if(mx)gifts=JSON.parse(mx[0]);}catch(e2){}
    if(gifts&&gifts.length){
      window.__giftData[id]={name:p.name,gifts:gifts};
      var h='<div style="display:flex;flex-direction:column;gap:10px;margin-top:2px">';
      gifts.forEach(function(g,i){
        var amazonUrl='https://www.amazon.fr/s?k='+encodeURIComponent(g.search||g.nom)+'&tag=bloomday-21';
        var gid='gsi-'+id+'-'+i;
        h+='<div style="background:var(--bg2,#f7f7f7);border-radius:12px;padding:12px 14px">';
        h+='<div style="font-size:15px;margin-bottom:3px">'+esc(g.emoji||'🎁')+' <strong>'+esc(g.nom)+'</strong> <span style="color:var(--b2,#e8a0b0);font-size:12px">'+esc(g.prix)+'</span></div>';
        h+='<div style="font-size:12px;color:var(--txt2,#888);margin-bottom:8px">'+esc(g.desc)+'</div>';
        h+='<div style="display:flex;gap:8px;flex-wrap:wrap">';
        h+='<a href="'+amazonUrl+'" target="_blank" rel="noopener noreferrer" style="font-size:12px;color:var(--b2,#e8a0b0);text-decoration:none;background:var(--bg3,#fff);border:1px solid var(--brd,#eee);padding:4px 10px;border-radius:6px">🛒 '+t('giftAmazonBtn')+'</a>';
        h+='<button id="'+gid+'" class="btn sm" style="font-size:12px;padding:4px 10px" onclick="saveGiftIdea('+Number(id)+','+Number(i)+',\''+gid+'\')">'+t('saveBtn')+'</button>';
        h+='</div></div>';
      });
      h+='</div>';
      el.innerHTML=h;
    }else{
      el.innerHTML='<div style="font-size:13px;padding:12px">'+esc(raw)+'</div>';
    }
  }catch(e){el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:12px">'+t('errorRetry')+'</div>';}
}

function saveGiftIdea(memberId,idx,btnId){
  var d=window.__giftData[memberId];if(!d)return;
  var g=d.gifts[idx];if(!g)return;
  var saved=JSON.parse(localStorage.getItem('bdg16_saved_gifts')||'[]');
  saved.push({memberId:memberId,memberName:d.name,gift:g,savedAt:Date.now()});
  localStorage.setItem('bdg16_saved_gifts',JSON.stringify(saved));
  var btn=document.getElementById(btnId);
  if(btn){btn.textContent='✓ Sauvegardé';btn.disabled=true;btn.style.opacity='0.6';}
}

async function genUrgence(id,elId){
  var el=document.getElementById(elId);if(!el)return;
  var p=mems().find(function(x){return x.id===id;});if(!p)return;
  el.innerHTML='<div style="text-align:center;padding:12px"><div class="ld"></div></div>';
  var prompt='Génère en '+(window.__aiLang||'français')+' un message de rattrapage bienveillant pour '+p.name+" dont c'était l'anniversaire hier. Chaleureux, légèrement humoristique sur le retard. 2-3 phrases.";
  try{
    var ac3=new AbortController();var tid3=setTimeout(function(){ac3.abort();},15000);
    var resp=await fetch('/.netlify/functions/generate-message',{method:'POST',headers:await getAuthHeaders(),body:JSON.stringify({prompt:prompt,plan:plan}),signal:ac3.signal});
    clearTimeout(tid3);
    var data=await resp.json();
    if(!resp.ok){console.error('[AI]',resp.status,data.error);throw new Error(data.error||'HTTP '+resp.status);}
    el.innerHTML='<div class="ob-msg" style="font-size:13px">'+esc(data.message||'')+'</div>'+
      '<button class="btn G sm" style="margin-top:8px" onclick="copyMsg(\''+elId+'\')">'+t('copyBtn')+'</button>';
  }catch(e){el.innerHTML='<div style="font-size:12px;color:var(--txt2);padding:8px">'+t('errorRetry')+'</div>';}
}

function copyMsg(elId){
  var el=document.getElementById(elId);if(!el)return;
  var msg=el.querySelector('.ob-msg');if(!msg)return;
  navigator.clipboard.writeText(msg.textContent).then(function(){showToast(t('copied'),'success');}).catch(function(){showToast(msg.textContent.substring(0,60)+'…','success');});
}

function sendWA(phone,elId){
  var el=document.getElementById(elId);if(!el)return;
  var msg=el.querySelector('.ob-msg');if(!msg)return;
  window.open('https://wa.me/'+phone.replace(/\D/g,'')+'?text='+encodeURIComponent(msg.textContent),'_blank');
}

// ── RECHERCHE ──
function onSearchInput(val){
  searchInput=val;
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer=setTimeout(function(){
    var v=(val||'').trim().toLowerCase();
    searchFiltered=v?mems().filter(function(p){return p.name.toLowerCase().includes(v)||(p.note||'').toLowerCase().includes(v);}):null;
    rMembers();
  },300);
}

function clearSearch(){
  searchInput='';searchFiltered=null;
  var inp=document.getElementById('search-inp');if(inp)inp.value='';
  rMembers();
}

// ── TEMPLATE & EXPORT ──
function setTpl(id,btn){
  actTpl=id;
  document.querySelectorAll('.chip').forEach(function(c){c.classList.remove('on');});
  if(btn)btn.classList.add('on');
}

function exportPDF(){
  var m=mems();
  if(!m.length){showToast(t('noMembersExport'),'error');return;}
  var rows=m.map(function(p){
    var age=ageBday(p.day,p.month,p.year);
    return '<tr><td>'+esc(p.name)+'</td><td>'+p.day+'/'+p.month+(p.year?'/'+p.year:'')+'</td><td>'+(age!==null?age:'—')+'</td><td>'+(p.phone||'—')+'</td><td>'+(p.note||'—')+'</td></tr>';
  }).join('');
  var html='<html><head><title>Bloomday Export</title><style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;font-size:13px}th{background:#f5f5f5}@media print{button{display:none}}</style></head><body><h1>🌸 Bloomday — '+m.length+' '+t('membresLabel')+'</h1><button onclick="window.print()">'+t('pdfPrint')+'</button><table><thead><tr><th>'+t('pdfColName')+'</th><th>'+t('pdfColDate')+'</th><th>'+t('pdfColAge')+'</th><th>'+t('pdfColPhone')+'</th><th>'+t('pdfColNotes')+'</th></tr></thead><tbody>'+rows+'</tbody></table></body></html>';
  var blob=new Blob([html],{type:'text/html'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.target='_blank';a.click();
  setTimeout(function(){URL.revokeObjectURL(url);},5000);
}

function openRipple(encodedMsg,elId){
  var msg='';
  try{msg=atob(encodedMsg);}catch(e){msg=encodedMsg;}
  if(!msg)return;
  var mid=elId?elId.replace('m-msg-',''):null;
  var p=mid?mems().find(function(x){return String(x.id)===String(mid);}):null;
  var recipient=p?p.name.split(' ')[0]:'';
  var data={m:msg,n:recipient};
  var encoded=btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  var base=window.location.origin+window.location.pathname.replace(/[^/]*$/,'');
  var rippleUrl=base+'ripple.html?d='+encoded;
  navigator.clipboard.writeText(rippleUrl).then(function(){
    showToast(t('rippleCopied'),'success');
  }).catch(function(){
    showToast(rippleUrl,'success');
  });
}
function signOut(){
  if(!confirm("Se déconnecter et revenir à l'accueil ?"))return;
  plan='free';
  localStorage.removeItem('bdg16_plan');
  localStorage.removeItem('bdg16_customer');
  goLand();
  showToast(t('logoutBye'),'success');
}

function showAccountPage(){
  showSec('more',4);
}

function copyRefLink(url){
  navigator.clipboard.writeText(url).then(function(){
    showToast(t('refCopied'));
  }).catch(function(){
    prompt('Copiez ce lien :', url);
  });
}

function shareRefLink(url){
  if(!navigator.share)return;
  navigator.share({title:'Bloomday',text:t('refSub'),url:url}).catch(function(){});
}