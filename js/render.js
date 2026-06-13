function _dedupWeddings(arr){
  var byDate={};
  arr.forEach(function(p){
    var isW=p.type==='wedding'||(typeof p.name==='string'&&p.name.indexOf('(mariage avec')!==-1);
    if(!isW)return;
    var k=p.day+'-'+p.month;
    if(!byDate[k])byDate[k]=[];
    byDate[k].push(p);
  });
  var drop=new Set();
  Object.keys(byDate).forEach(function(k){
    var g=byDate[k];if(g.length<2)return;
    for(var i=0;i<g.length;i++)for(var j=i+1;j<g.length;j++){
      var nA=g[i].name||'',nB=g[j].name||'';
      var baseA=nA.split('(mariage avec')[0].trim().toLowerCase();
      var baseB=nB.split('(mariage avec')[0].trim().toLowerCase();
      var spA=(nA.match(/\(mariage avec (.+?)\)/)||['',''])[1].toLowerCase();
      var spB=(nB.match(/\(mariage avec (.+?)\)/)||['',''])[1].toLowerCase();
      var fA=baseA.split(' ')[0],fB=baseB.split(' ')[0];
      if((spA&&fB&&spA.indexOf(fB)!==-1)||(spB&&fA&&spB.indexOf(fA)!==-1))drop.add(g[j].id||nB+g[j].day);
    }
  });
  return drop.size?arr.filter(function(p){return!drop.has(p.id||(p.name||'')+p.day);}):arr;
}

function isWed(p){return p.type==='wedding'||(typeof p.name==='string'&&p.name.indexOf('(mariage avec')!==-1);}
function wname(p){if(!isWed(p))return p.name;var base=(p.name||'').split('(mariage avec')[0].trim();var sp=((p.name||'').match(/\(mariage avec (.+?)\)/)||['',''])[1];var f1=base.split(' ')[0];var f2=sp?sp.split(' ')[0]:'';return f2?f1+' & '+f2:f1;}
function expandTlCard(id){var cl=document.getElementById('tl-cl-'+id);var op=document.getElementById('tl-op-'+id);if(cl)cl.style.display='none';if(op)op.style.display='block';}
function escJs(v){return esc(JSON.stringify(String(v||'')));}

function rHome(){
  const el=document.getElementById('s-home');
  if(!el)return;
  const now=new Date();
  const m=_dedupWeddings(mems());
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

  // --- CTA Team Survey ---
  var _mnHome=(currentUser&&currentUser.name)||(profile&&profile.name)||'';
  h+='<a href="team-form.html'+(_mnHome?'?manager='+encodeURIComponent(_mnHome):'')+'" style="display:flex;align-items:center;gap:12px;background:var(--bg2);border:1.5px solid var(--brd);border-radius:14px;padding:12px 16px;margin-bottom:12px;text-decoration:none;cursor:pointer">'
   +'<div style="width:36px;height:36px;border-radius:10px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">👥</div>'
   +'<div style="flex:1;min-width:0">'
   +'<div style="font-size:13px;font-weight:700;color:var(--txt)">'+t('teamSurveyCtaTitle')+'</div>'
   +'<div style="font-size:11px;color:var(--txt2);margin-top:1px">'+t('teamSurveyCtaSub')+'</div>'
   +'</div>'
   +'<div style="font-size:18px;color:var(--txt3)">›</div>'
   +'</a>';

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
    h+='<div id="urg-'+p.id+'"><button class="btn R sm" onclick="genUrgence(\''+p.id+'\',\'urg-'+p.id+'\')">'+t('urgentBtn')+'</button></div>';
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
    h+='<div><div style="font-size:15px;font-weight:700;color:var(--b4d)">'+esc(isWed(nextEv)?wname(nextEv):nextEv.name.split(' ')[0])+'</div>';
    h+='<div style="font-size:12px;color:var(--b4);margin-top:1px">'+nextEv.day+' '+MN[nextEv.month-1]+(age?' — '+age+' '+t(isWed(nextEv)?'yearsTogether':'yearsOld'):'')+'</div>';
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
      h+='<div><div style="font-family:var(--ff-title);font-size:18px;font-weight:700;color:var(--b2d)">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
      h+='<div style="font-size:13px;color:var(--b2);margin-top:2px">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(p.year?' '+p.year:'')+(age?' — '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
      if(ms)h+='<div style="display:inline-block;background:var(--b4l);color:var(--b4d);font-size:11px;padding:3px 10px;border-radius:20px;margin-top:5px;font-weight:700">'+ms+'</div>';
      h+='</div></div>';
      if(p.phone)h+='<div style="font-size:12px;color:var(--b2);margin-bottom:8px">📞 '+esc(p.phone)+'</div>';
      h+='<div id="h-msg-'+p.id+'"><div class="brow">';
      h+='<button class="btn G" onclick="genMsg(\''+p.id+'\',\'h-msg-'+p.id+'\')">'+t('msgBtn')+'</button>';
      h+='<button class="btn V" onclick="genGiftModal(\''+p.id+'\')">'+t('giftBtn')+'</button>';
      if(pl.cards)h+='<button class="btn O" onclick="genCard(\''+p.id+'\',\'h-card-'+p.id+'\')">'+t('cardBtn')+'</button>';
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
      nextFew.forEach(function(p,i){
        const d=daysTill(p.day,p.month);
        const age=ageBday(p.day,p.month,p.year);
        const idx=m.indexOf(p);
        const isLast=i===nextFew.length-1;
        const metaLine=tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'');
        const dlText=p.day+' '+MN[p.month-1]+(age?' · '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+' · '+t('inDays')+' '+d+' '+(d>1?t('daysUnit'):t('dayUnit'));
        h+='<div style="display:flex;gap:14px">';
        // axe timeline
        h+='<div style="display:flex;flex-direction:column;align-items:center;width:24px;flex-shrink:0;padding-top:3px">';
        if(i===0){
          h+='<div style="width:12px;height:12px;border-radius:50%;border:2px solid var(--b1);background:var(--b1l);flex-shrink:0"></div>';
        } else {
          h+='<div style="width:10px;height:10px;border-radius:50%;border:2px solid var(--brd2);background:var(--card);flex-shrink:0"></div>';
        }
        if(!isLast) h+='<div style="flex:1;width:2px;background:var(--brd);min-height:16px;margin:3px 0"></div>';
        h+='</div>';
        // contenu
        h+='<div style="flex:1;min-width:0;padding-bottom:'+(isLast?'0':'14px')+'">';
        if(i===0){
          h+='<div style="font-size:11px;font-weight:700;color:var(--b1d);margin-bottom:8px;letter-spacing:.02em">'+dlText+'</div>';
          // carte ouverte
          h+='<div class="card cb" style="padding:0;overflow:hidden">';
          h+='<div style="display:flex;align-items:center;gap:10px;padding:12px 14px">';
          h+='<div class="av '+AV[idx%4]+'" style="width:40px;height:40px;font-size:13px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
          h+='<div style="flex:1;min-width:0">';
          h+='<div style="font-size:14px;font-weight:800;color:var(--b1d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
          h+='<div style="font-size:11px;color:var(--b1d);margin-top:2px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+metaLine+'</div>';
          h+='</div>';
          h+='</div>';
          h+='<div style="border-top:1px solid var(--brd);padding:12px 14px">';
          h+='<div id="prep-'+p.id+'" style="margin-bottom:8px"><button class="btn O fw" onclick="genMsg(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
          h+='<div><button class="btn sm O" onclick="showFlowerIdeas('+escJs(p.name)+','+escJs(p.type)+')">'+t('flowerIdeasBtn')+'</button></div>';
          h+='</div>';
          h+='</div>';
        } else {
          h+='<div style="font-size:11px;font-weight:600;color:var(--txt3);margin-bottom:6px">'+dlText+'</div>';
          // carte repliée
          h+='<div id="tl-cl-'+p.id+'" class="card" style="padding:10px 14px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="expandTlCard(\''+p.id+'\')">';
          h+='<div class="av '+AV[idx%4]+'" style="width:32px;height:32px;font-size:10px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
          h+='<div style="flex:1;min-width:0">';
          h+='<div style="font-size:13px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
          h+='<div style="font-size:11px;color:var(--txt2);margin-top:1px">'+tLbl(p.type)+'</div>';
          h+='</div>';
          h+='<span style="font-size:11px;font-weight:700;color:var(--txt2);flex-shrink:0;margin-right:4px">'+d+' '+(d>1?t('daysUnit'):t('dayUnit'))+'</span>';
          h+='<span style="color:var(--txt3);font-size:18px">›</span>';
          h+='</div>';
          // carte dépliée (cachée)
          h+='<div id="tl-op-'+p.id+'" class="card cb" style="display:none;padding:0;overflow:hidden;margin-top:0">';
          h+='<div style="display:flex;align-items:center;gap:10px;padding:12px 14px">';
          h+='<div class="av '+AV[idx%4]+'" style="width:40px;height:40px;font-size:13px">'+(p.photo?'<img src="'+p.photo+'" alt="">':ini(p.name))+'</div>';
          h+='<div style="flex:1;min-width:0">';
          h+='<div style="font-size:14px;font-weight:800;color:var(--b1d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
          h+='<div style="font-size:11px;color:var(--b1d);margin-top:2px;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+metaLine+'</div>';
          h+='</div>';
          h+='</div>';
          h+='<div style="border-top:1px solid var(--brd);padding:12px 14px">';
          h+='<div id="prep-'+p.id+'" style="margin-bottom:8px"><button class="btn O fw" onclick="genMsg(\''+p.id+'\',\'prep-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
          h+='<div><button class="btn sm O" onclick="showFlowerIdeas('+escJs(p.name)+','+escJs(p.type)+')">'+t('flowerIdeasBtn')+'</button></div>';
          h+='</div>';
          h+='</div>';
        }
        h+='</div>';
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
      h+='<div style="font-size:14px;font-weight:700;color:var(--b1d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
      h+='<div style="font-size:11px;color:var(--b1d);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+tLbl(p.type)+' · '+p.day+' '+MN[p.month-1]+(age?' — '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
      h+='</div>';
      h+='<span class="pbdg pbs" style="flex-shrink:0">'+t('inDays')+' '+d+' '+(d>1?t('daysUnit'):t('dayUnit'))+'</span>';
      h+='</div>';
      h+='<div id="up-'+p.id+'" style="margin-top:8px"><button class="btn sm" onclick="genMsg(\''+p.id+'\',\'up-'+p.id+'\')">'+t('prepareBtn')+'</button></div>';
      h+='<div style="margin-top:8px"><button class="btn sm O" onclick="showFlowerIdeas('+escJs(p.name)+','+escJs(p.type)+')">'+t('flowerIdeasBtn')+'</button></div>';
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
      h+='<div style="font-size:13px;font-weight:'+(isTod?700:500)+';color:'+(isTod?'var(--b2d)':'var(--txt)')+'">'+tIco(p.type)+' '+esc(wname(p))+'</div>';
      h+='<div style="font-size:11px;color:var(--txt2)">'+tLbl(p.type)+(age?' · '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):'')+'</div>';
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
  const m=_dedupWeddings(mems());
  // Axe 2 : filtre appliqué uniquement sur searchFiltered (état local)
  let filtered=_dedupWeddings(searchFiltered!==null?searchFiltered:m);
  if(fMonth>0)filtered=filtered.filter(p=>p.month===fMonth);
  if(fType){
    if(fType==='other')filtered=filtered.filter(p=>p.type!=='birthday'&&p.type!=='wedding'&&p.type!=='work'&&p.type!=='custom');
    else filtered=filtered.filter(p=>p.type===fType);
  }
  const pl=PL();
  let h='';
  // CTA Team Survey — toujours visible, pré-rempli avec le nom du manager connecté
  var _managerName=(currentUser&&currentUser.name)||(profile&&profile.name)||'';
  var _teamUrl='team-form.html'+(_managerName?'?manager='+encodeURIComponent(_managerName):'');
  h+='<a href="'+_teamUrl+'" style="display:flex;align-items:center;gap:12px;background:var(--bg2);border:1.5px solid var(--brd);border-radius:14px;padding:14px 16px;margin-bottom:12px;text-decoration:none;cursor:pointer">'
   +'<div style="width:40px;height:40px;border-radius:10px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">👥</div>'
   +'<div style="flex:1;min-width:0">'
   +'<div style="font-size:14px;font-weight:700;color:var(--txt)">'+t('teamSurveyCtaTitle')+'</div>'
   +'<div style="font-size:12px;color:var(--txt2);margin-top:2px">'+t('teamSurveyCtaSub')+'</div>'
   +'</div>'
   +'<div style="font-size:20px;color:var(--txt3)">›</div>'
   +'</a>';
  // CTA import contacts dynamique (Contact Picker API only)
  if('contacts' in navigator&&'ContactsManager' in window){
    if(m.length===0){
      h+='<div style="margin-bottom:16px"><button onclick="openImportSheet()" style="width:100%;padding:14px;border:none;border-radius:14px;background:var(--grad);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(212,168,67,.3)" data-i18n="importFromContacts">'+t('importFromContacts')+'</button></div>';
    }else{
      h+='<div style="margin-bottom:10px"><button onclick="openImportSheet()" style="width:100%;padding:9px;border:1px solid var(--b4);border-radius:10px;background:var(--b4l);color:var(--b4d);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit" data-i18n="importFromContacts">'+t('importFromContacts')+'</button></div>';
    }
  }
  // Champ de recherche FIXE — ne se recrée pas à chaque frappe
  // → le clavier reste ouvert sur mobile
  h+=`<div class="sw">
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
    <div class="pinfo"><div class="pname">${tIco(p.type)} ${esc(wname(p))}${p.incomplete?`<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--b2);margin-left:5px;vertical-align:middle"></span>`:''}${tod?'<span class="pbdg pbt">'+t('todayLabel')+'</span>':''}${soon&&!tod?`<span class="pbdg pbs">${t('inDays')} ${days}j</span>`:''}${ms&&(tod||soon)&&!isBiz?'<span class="pbdg pbk">'+t('yearsOld')+'</span>':''}</div>
    <div class="pmeta">${p.day} ${MN[p.month-1]}${p.year?' '+p.year:''}${age&&!isBiz?' — '+age+' '+t(isWed(p)?'yearsTogether':'yearsOld'):isBiz&&age?' — '+age+' '+t('yearsOld'):''}</div>
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
    <div style="margin-top:12px;border-top:1px solid var(--brd);padding-top:12px">
    <div style="font-size:12px;font-weight:700;color:var(--txt2);margin-bottom:8px">${t('notifCustomLabel')}</div>
    <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer">
      <input type="checkbox" id="notif-use-default-${p.id}" ${!p.notif_days_before&&p.notif_days_before!==0?'checked':''} onchange="toggleContactNotifDefault('${p.id}',this.checked)" style="width:16px;height:16px">
      <span style="font-size:13px;color:var(--txt2)">${t('notifUseDefault')}</span>
    </label>
    <div id="notif-contact-custom-${p.id}" style="display:${p.notif_days_before!=null?'block':'none'}">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        ${[{v:0,l:t('notifDaysJ')},{v:1,l:t('notifDays1')},{v:3,l:t('notifDays3')},{v:7,l:t('notifDays7')}].map(o=>`<button onclick="setContactNotifDays('${p.id}',${o.v})" style="padding:5px 12px;border-radius:16px;border:1.5px solid ${p.notif_days_before===o.v?'var(--b1)':'var(--brd)'};background:${p.notif_days_before===o.v?'var(--b1l)':'var(--card)'};color:${p.notif_days_before===o.v?'var(--b1d)':'var(--txt2)'};font-size:12px;font-weight:600;cursor:pointer;font-family:inherit">${o.l}</button>`).join('')}
      </div>
    </div>
    </div>
    <div class="brow" style="margin-top:10px"><button class="btn G" style="flex:1" onclick="saveEdit('${p.id}')">${t('saveBtn')}</button><button class="btn" onclick="togEdit('${p.id}')">${t('cancelBtn')}</button></div></div>`:''}
    <div id="m-msg-${p.id}"></div><div id="m-gift-${p.id}"></div></div>
    <div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0">
    <button class="btn O sm" onclick="togEdit('${p.id}')">${isEd?'✕':'✏'}</button>
    <button class="btn G sm" onclick="genMsg('${p.id}','m-msg-${p.id}')">✨</button>
    <button class="btn V sm" onclick="genGiftModal('${p.id}')">💡</button>
    <button class="btn D sm" onclick="removeMem('${p.id}')">✕</button></div></div>`;
  });
  h+=`<button class="exbtn" onclick="exportPDF()">${t('exportPDFBtn')}</button>`;
  el.innerHTML=h;
  // Refocaliser le champ si recherche active (sans provoquer de scroll)
  if(searchInput){
    const inp=document.getElementById('search-inp');
    if(inp&&document.activeElement!==inp)inp.focus({preventScroll:true});
  }
}
var evtCal={year:new Date().getFullYear(),month:new Date().getMonth()};

function rEvents(){
  var el=document.getElementById('s-events');if(!el)return;
  while(el.firstChild)el.removeChild(el.firstChild);

  var now=new Date();
  var year=evtCal.year,month=evtCal.month;
  var daysInMonth=new Date(year,month+1,0).getDate();
  var firstDay=new Date(year,month,1).getDay();
  firstDay=firstDay===0?6:firstDay-1;
  var m=_dedupWeddings(mems());
  var allFetes=getActiveFetes();

  // ── CALENDRIER ──
  var calCard=document.createElement('div');
  calCard.className='card';
  calCard.style.cssText='padding:14px 12px;margin-bottom:14px';

  var nav=document.createElement('div');
  nav.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px';
  var prevBtn=document.createElement('button');
  prevBtn.textContent='‹';
  prevBtn.style.cssText='background:var(--bg2);border:1px solid var(--brd);border-radius:8px;color:var(--txt);font-size:20px;width:34px;height:34px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center';
  prevBtn.onclick=function(){evtCal.month--;if(evtCal.month<0){evtCal.month=11;evtCal.year--;}rEvents();};
  var monthTitle=document.createElement('div');
  monthTitle.style.cssText='font-size:15px;font-weight:700;color:var(--txt)';
  monthTitle.textContent=MN[month]+' '+year;
  var nextBtn=document.createElement('button');
  nextBtn.textContent='›';
  nextBtn.style.cssText='background:var(--bg2);border:1px solid var(--brd);border-radius:8px;color:var(--txt);font-size:20px;width:34px;height:34px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center';
  nextBtn.onclick=function(){evtCal.month++;if(evtCal.month>11){evtCal.month=0;evtCal.year++;}rEvents();};
  nav.appendChild(prevBtn);nav.appendChild(monthTitle);nav.appendChild(nextBtn);
  calCard.appendChild(nav);

  var grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center';
  ['L','M','M','J','V','S','D'].forEach(function(d){
    var hd=document.createElement('div');
    hd.style.cssText='color:var(--txt2);padding:3px 0;font-size:10px;font-weight:600';
    hd.textContent=d;grid.appendChild(hd);
  });
  for(var i=0;i<firstDay;i++)grid.appendChild(document.createElement('div'));
  var evtDayPanel=document.createElement('div');
  evtDayPanel.id='evt-day-panel';
  evtDayPanel.style.cssText='margin-top:10px';

  for(var day=1;day<=daysInMonth;day++){
    var isTd=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
    var hasBday=m.some(function(p){return p.day===day&&p.month===(month+1);});
    var hasFete=allFetes.some(function(f){return f.d===day&&f.m===(month+1);});
    var cell=document.createElement('div');
    cell.textContent=String(day);
    var css='padding:6px 2px;border-radius:8px;font-size:13px;cursor:pointer;';
    if(isTd)css+='background:var(--b1);color:#2D1B14;font-weight:700;';
    else if(hasBday)css+='background:var(--b2l);color:var(--b2d);font-weight:700;';
    else if(hasFete)css+='background:var(--b4l);color:var(--b4d);font-weight:700;';
    cell.style.cssText=css;
    (function(d){
      cell.onclick=function(){showEvtDay(d,month+1,m,allFetes,evtDayPanel);};
    })(day);
    grid.appendChild(cell);
  }
  calCard.appendChild(grid);
  calCard.appendChild(evtDayPanel);
  el.appendChild(calCard);

  // ── LISTE UNIFIÉE (fêtes + anniversaires) ──
  var sh=document.createElement('div');
  sh.className='sh';sh.textContent=t('nextCelebrations');
  el.appendChild(sh);

  var items=[];
  allFetes.forEach(function(f){
    items.push({icon:f.i,name:tFete(f.n)||f.n,day:f.d,month:f.m,dl:f.dl});
  });
  m.forEach(function(p){
    var dl=daysTill(p.day,p.month);
    if(dl>=0)items.push({icon:tIco(p.type),name:p.name,day:p.day,month:p.month,dl:dl});
  });
  items.sort(function(a,b){return a.dl-b.dl;});
  items=items.slice(0,10);

  var listCard=document.createElement('div');
  listCard.className='card';listCard.style.cssText='padding:6px 14px';
  if(!items.length){
    var empty=document.createElement('div');
    empty.style.cssText='font-size:13px;color:var(--txt2);padding:10px 0';
    empty.textContent=t('noCelebrations');listCard.appendChild(empty);
  }else{
    items.forEach(function(item){
      var row=document.createElement('div');row.className='fr';
      var ico=document.createElement('div');ico.className='fi';ico.textContent=item.icon;
      var info=document.createElement('div');info.style.cssText='flex:1';
      var nm=document.createElement('div');nm.className='fn';nm.textContent=item.name;
      var dt=document.createElement('div');dt.className='fd';dt.textContent=item.day+' '+MN[item.month-1];
      info.appendChild(nm);info.appendChild(dt);
      var pill=document.createElement('div');pill.className='fpill';
      var lbl=item.dl===0?(t('today')||'Aujourd\'hui'):item.dl===1?(t('tomorrowLabel')||'Demain'):(t('inDays')||'dans')+' '+item.dl+'j';
      var st=item.dl===0?'background:var(--b2l);color:var(--b2d)':item.dl<=7?'background:var(--b1l);color:var(--b1d)':'background:var(--bg2);color:var(--txt2)';
      pill.style.cssText=st;pill.textContent=lbl;
      row.appendChild(ico);row.appendChild(info);row.appendChild(pill);
      listCard.appendChild(row);
    });
  }
  el.appendChild(listCard);
}

function showEvtDay(day,month,members,allFetes,panel){
  while(panel.firstChild)panel.removeChild(panel.firstChild);
  var bdaysDay=members.filter(function(p){return p.day===day&&p.month===month;});
  var fetesDay=allFetes.filter(function(f){return f.d===day&&f.m===month;});
  if(!bdaysDay.length&&!fetesDay.length){panel.style.display='none';return;}
  panel.style.display='block';
  var wrap=document.createElement('div');
  wrap.style.cssText='border-top:1px solid var(--brd);margin-top:10px;padding-top:10px';
  var title=document.createElement('div');
  title.style.cssText='font-size:12px;font-weight:700;color:var(--txt2);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em';
  title.textContent=day+' '+MN[month-1];
  wrap.appendChild(title);
  fetesDay.forEach(function(f){
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--brd)';
    var ico=document.createElement('span');ico.textContent=f.i||'🎉';ico.style.cssText='font-size:16px';
    var nm=document.createElement('span');nm.style.cssText='font-size:13px;font-weight:600;color:var(--b4d);flex:1';nm.textContent=tFete(f.n)||f.n;
    row.appendChild(ico);row.appendChild(nm);wrap.appendChild(row);
  });
  bdaysDay.forEach(function(p){
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--brd)';
    var ico=document.createElement('span');ico.textContent=tIco(p.type);ico.style.cssText='font-size:16px';
    var nm=document.createElement('span');nm.style.cssText='font-size:13px;font-weight:600;color:var(--b2d);flex:1';nm.textContent=p.name;
    var age=ageBday(p.day,p.month,p.year);
    if(age){var ag=document.createElement('span');ag.style.cssText='font-size:11px;color:var(--txt2)';ag.textContent=age+' '+t('yearsOld');row.appendChild(ag);}
    row.appendChild(ico);row.appendChild(nm);wrap.appendChild(row);
  });
  panel.appendChild(wrap);
}

// ══════════════════════════════════════════════════
// SYSTÈME EMAILS AUTOMATIQUES (simulé MVP)
// En An 2 : Resend ou Brevo via backend Supabase
// ══════════════════════════════════════════════════
var EMAIL_TEMPLATES = {
  welcome: function(d){
    var n=d.name.split(' ')[0];
    return {
      subject: t('emailWelcomeSubject').replace('%s',n),
      body: t('emailWelcomeBody').replace('%s',n)
    };
  },
  subscription: function(d){
    return {
      subject: t('emailSubConfirmSubject').replace('%s',d.plan),
      body: t('emailSubConfirmBody').replace('%s',d.plan)
    };
  },
  renewal_reminder: function(d){
    return {
      subject: t('emailRenewalSubject'),
      body: t('emailRenewalBody').replace('%s',d.plan)
    };
  },
  anniversary: function(d){
    return {
      subject: t('emailAnnivSubject'),
      body: t('emailAnnivBody').replace('%s',d.name)
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
  // 1b. Alt text [data-i18n-alt]
  var altEls=document.querySelectorAll('[data-i18n-alt]');
  for(var ia=0;ia<altEls.length;ia++){
    var altEl=altEls[ia];var altKey=altEl.getAttribute('data-i18n-alt');
    var altVal=t(altKey);if(altVal&&altVal!==altKey) altEl.alt=altVal;
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
  // 5. Badge plan topbar (admin seulement)
  var isAdmin=!!(currentUser&&currentUser.email==='zekingfinance@gmail.com');
  var tbp=document.getElementById('tbplan');
  if(tbp){tbp.textContent=(PLANS[plan]?PLANS[plan].name:'Bloom')+' ▾';tbp.style.display=isAdmin?'':'none';}
  var tbPlansBtn=document.getElementById('tb-plans-btn');
  if(tbPlansBtn) tbPlansBtn.style.display=isAdmin?'':'none';
  // 6. Langue courante dans sélecteur
  var langLabels={fr:'FR',en:'EN',es:'ES',ar:'AR',hi:'HI',zh:'ZH',pt:'PT'};
  var lnFlags={fr:'🇫🇷',en:'🇬🇧',es:'🇪🇸',ar:'🇸🇦',hi:'🇮🇳',zh:'🇨🇳',pt:'🇵🇹'};
  var flagEl=document.getElementById('lang-flag');if(flagEl)flagEl.textContent=lnFlags[appLang]||'🌍';
  var codeEl=document.getElementById('lang-code');if(codeEl)codeEl.textContent=langLabels[appLang]||appLang.toUpperCase();
  var nameEl=document.getElementById('lang-name');
  var lnNameKey='langName_'+appLang;var lnNameVal=t(lnNameKey);
  if(nameEl&&lnNameVal&&lnNameVal!==lnNameKey)nameEl.textContent=lnNameVal;
  // 7. Direction RTL arabe
  document.body.style.direction=(appLang==='ar'?'rtl':'ltr');
  // 8. Noms des langues dans le sélecteur
  var langOpts=document.querySelectorAll('.lang-opt');
  for(var lo=0;lo<langOpts.length;lo++){
    var loEl=langOpts[lo];var loCode=loEl.getAttribute('data-lang');
    loEl.classList.toggle('on',loCode===appLang);
    var lnKey='langName_'+loCode;var lnVal=t(lnKey);
    var loName=lnVal&&lnVal!==lnKey?lnVal:(loCode.charAt(0).toUpperCase()+loCode.slice(1));
    loEl.textContent='';
    loEl.appendChild(document.createTextNode((lnFlags[loCode]||'')+' '));
    var loNameSpan=document.createElement('span');loNameSpan.className='lo-name';loNameSpan.textContent=loName;loEl.appendChild(loNameSpan);
    var loCodeSpan=document.createElement('span');loCodeSpan.className='lo-code';loCodeSpan.textContent=langLabels[loCode]||loCode.toUpperCase();loEl.appendChild(loCodeSpan);
  }
  // 9. Langue IA
  var aiLangMap={fr:'français',en:'English',es:'español',ar:'arabe',hi:'hindi',zh:'chinois',pt:'portugais'};
  window.__aiLang=aiLangMap[appLang]||'français';
  // 10. Forfaits re-render
  if(document.getElementById('pricing-table-container')) renderPricingTable();
  // 11. Sélecteur mois
  buildMonthSelect();
  // 12b. Sélecteurs pays
  if(typeof profile!=="undefined"){
    buildCountrySelect("prof-live",profile.live||"");
    buildCountrySelect("prof-origin",profile.origin||"");
    buildCountrySelect("prof-origin2",profile.origin2||"");
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
  // 14b. Reconstruire le select type d'événement (force rafraîchissement navigateur)
  var typeSel=document.getElementById('inp-type');
  if(typeSel){
    var curType=typeSel.value||'birthday';
    var typeOpts=[{v:'birthday',k:'evtBirthday'},{v:'wedding',k:'evtWedding'},{v:'work',k:'evtWork'},{v:'custom',k:'evtCustom'},{v:'other',k:'evtOther'}];
    while(typeSel.firstChild) typeSel.removeChild(typeSel.firstChild);
    for(var ti=0;ti<typeOpts.length;ti++){
      var tOpt=document.createElement('option');
      tOpt.value=typeOpts[ti].v;
      tOpt.textContent=t(typeOpts[ti].k);
      if(typeOpts[ti].v===curType) tOpt.selected=true;
      typeSel.appendChild(tOpt);
    }
  }
  
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
  // 15b. MS milestones traduits
  if(typeof MS!=='undefined'){
    var msAges=[1,10,18,20,30,40,50,60,70,80,90,100];
    for(var mi=0;mi<msAges.length;mi++){var mk='ms'+msAges[mi],mv=t(mk);if(mv!==mk)MS[msAges[mi]]=mv;}
  }
  // 16. Options religion dans rMore
  var relSel=document.getElementById('prof-rel');
  if(relSel&&relSel.appendChild&&relSel.innerHTML!==undefined){
    var relKeys=['','relChristian','relMuslim','relJewish','relHindu','relBuddhist','relNone'];
    var relVals=['','christian','muslim','jewish','hindu','buddhist','none'];
    var relCur=(profile&&profile.religion)||'';
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
  var now=new Date();now.setHours(0,0,0,0);
  var year=now.getFullYear();
  var live=(profile&&profile.live)||'fr';
  var origin=(profile&&profile.origin)||'';
  var origin2=(profile&&profile.origin2)||'';
  var rel=(profile&&profile.religion)||'';
  // Combine fêtes fixes + mobiles (année courante + suivante)
  var allFetes=FETES.concat(getMoveableFetes(year),getMoveableFetes(year+1));
  var seen={};
  return allFetes.map(function(f){
    var ok=f.c.includes('universal')||f.c.includes(live)||(origin&&f.c.includes(origin))||(origin2&&f.c.includes(origin2))||(rel&&f.c.includes(rel));
    if(!ok)return null;
    var x=new Date(year,f.m-1,f.d);
    if(!f.moveable&&x<now){x.setFullYear(year+1);}
    var dl=Math.round((x-now)/86400000);
    if(dl<0)return null;
    // Garder seulement la prochaine occurrence par nom
    if(seen[f.n]!==undefined&&seen[f.n]<=dl)return null;
    seen[f.n]=dl;
    return {n:f.n,i:f.i,m:f.m,d:f.d,dl:dl};
  }).filter(Boolean).sort(function(a,b){return a.dl-b.dl;});
}

// ── CALENDRIER ──
function rCal(){
  var el=document.getElementById('s-cal');if(!el)return;
  var m=_dedupWeddings(mems());
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
      h+='<div style="flex:1"><div style="font-size:14px;font-weight:600">'+tIco(p.type)+' '+esc(wname(p))+(tod?'<span class="pbdg pbt" style="margin-left:6px">'+t('calendarToday')+'</span>':'')+'</div>';
      if(age)h+='<div style="font-size:12px;color:var(--txt2)">'+age+' '+t(isWed(p)?'yearsTogether':'yearsOld')+'</div>';
      h+='</div></div>';
    });
  }
  if(!found)h+='<div style="font-size:13px;color:var(--txt2);padding:20px 0">'+t('calendarEmpty')+'</div>';
  el.innerHTML=h;
}

var sideCal = { year: new Date().getFullYear(), month: new Date().getMonth() };

function renderSideCalendar() {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var m = mems();
  var now = new Date();
  var year = sideCal.year;
  var month = sideCal.month;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var firstDay = new Date(year, month, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  var parts = [];

  // Rangée année (±1 an)
  var yearRow = document.createElement('div');
  yearRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px';
  var prevYearBtn = document.createElement('button');
  prevYearBtn.textContent = '‹‹';
  prevYearBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:12px;padding:1px 7px;cursor:pointer;line-height:1';
  prevYearBtn.onclick = function() { sideCal.year--; renderSideCalendar(); };
  var yearEl = document.createElement('div');
  yearEl.style.cssText = 'font-size:10px;font-weight:700;color:var(--b1d);letter-spacing:1px';
  yearEl.textContent = String(year);
  var nextYearBtn = document.createElement('button');
  nextYearBtn.textContent = '››';
  nextYearBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:12px;padding:1px 7px;cursor:pointer;line-height:1';
  nextYearBtn.onclick = function() { sideCal.year++; renderSideCalendar(); };
  yearRow.appendChild(prevYearBtn);
  yearRow.appendChild(yearEl);
  yearRow.appendChild(nextYearBtn);

  // Rangée mois (±1 mois)
  var monthRow = document.createElement('div');
  monthRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px';
  var prevBtn = document.createElement('button');
  prevBtn.textContent = '‹';
  prevBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:16px;padding:1px 8px;cursor:pointer;line-height:1';
  prevBtn.onclick = function() {
    sideCal.month--;
    if (sideCal.month < 0) { sideCal.month = 11; sideCal.year--; }
    renderSideCalendar();
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt)';
  titleEl.textContent = MN[month];
  var nextBtn = document.createElement('button');
  nextBtn.textContent = '›';
  nextBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--brd);border-radius:6px;color:var(--txt);font-size:16px;padding:1px 8px;cursor:pointer;line-height:1';
  nextBtn.onclick = function() {
    sideCal.month++;
    if (sideCal.month > 11) { sideCal.month = 0; sideCal.year++; }
    renderSideCalendar();
  };
  monthRow.appendChild(prevBtn);
  monthRow.appendChild(titleEl);
  monthRow.appendChild(nextBtn);

  parts.push(yearRow);
  parts.push(monthRow);

  // Fêtes du mois affiché, filtrées selon le profil
  function getFetesForMonth(y, mo) {
    var lv = (profile && profile.live) || 'fr';
    var or = (profile && profile.origin) || '';
    var or2 = (profile && profile.origin2) || '';
    var rl = (profile && profile.religion) || '';
    var all = FETES.concat(getMoveableFetes(y));
    var seen = {};
    return all.filter(function(f) {
      if (f.m !== mo + 1) return false;
      var ok = f.c.includes('universal') || f.c.includes(lv) ||
               (or && f.c.includes(or)) || (or2 && f.c.includes(or2)) ||
               (rl && f.c.includes(rl));
      if (!ok || seen[f.n]) return false;
      seen[f.n] = true;
      return true;
    });
  }
  var feteDays = {};
  getFetesForMonth(year, month).forEach(function(f) { feteDays[f.d] = true; });

  // Grille
  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:3px;font-size:11px;text-align:center';
  ['L','M','M','J','V','S','D'].forEach(function(d) {
    var hd = document.createElement('div');
    hd.style.cssText = 'color:var(--txt2);padding:2px;font-size:10px';
    hd.textContent = d;
    grid.appendChild(hd);
  });
  for (var i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement('div'));
  }
  for (var day = 1; day <= daysInMonth; day++) {
    var isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    var dayMembers = m.filter(function(p) { return p.day === day && p.month === (month + 1); });
    var hasBday = dayMembers.length > 0;
    var hasFete = !!feteDays[day];
    var cell = document.createElement('div');
    cell.textContent = String(day);
    cell.style.cssText = 'padding:5px 2px;border-radius:6px;cursor:pointer;';
    if (isToday) {
      cell.style.cssText += 'background:var(--b1);color:#2D1B14;font-weight:700;';
    } else if (hasBday && hasFete) {
      cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;position:relative;';
      var dot = document.createElement('span');
      dot.style.cssText = 'position:absolute;bottom:2px;right:2px;width:4px;height:4px;border-radius:50%;background:var(--b3);pointer-events:none';
      cell.appendChild(dot);
    } else if (hasBday) {
      cell.style.cssText += 'background:var(--b2l);color:var(--b2d);font-weight:700;';
    } else if (hasFete) {
      cell.style.cssText += 'background:var(--b3l);color:var(--b3d);font-weight:600;';
    }
    (function(d, members) {
      cell.onclick = function() { showDayDetails(d, month + 1, members); };
      if (members.length) cell.title = members.map(function(p) { return p.name; }).join(', ');
    })(day, dayMembers);
    grid.appendChild(cell);
  }
  parts.push(grid);

  // Panneau mensuel mixte — anniversaires + fêtes du mois affiché, triés par date
  var monthBdays = m.filter(function(p) { return p.month === month + 1; });
  var monthFetes = getFetesForMonth(year, month);

  var events = [];
  monthBdays.forEach(function(p) {
    events.push({ d: p.day, type: 'bday', name: tIco(p.type) + ' ' + p.name });
  });
  monthFetes.forEach(function(f) {
    events.push({ d: f.d, type: 'fete', name: f.i + ' ' + f.n });
  });
  events.sort(function(a, b) {
    if (a.d !== b.d) return a.d - b.d;
    return a.type === 'bday' ? -1 : 1;
  });

  var monthTitle = document.createElement('div');
  monthTitle.style.cssText = 'font-size:12px;font-weight:700;color:var(--txt);margin:16px 0 8px';
  monthTitle.textContent = t('thisMonth');
  parts.push(monthTitle);

  if (events.length === 0) {
    var emptyEl = document.createElement('div');
    emptyEl.style.cssText = 'font-size:11px;color:var(--txt2);padding:8px 0';
    emptyEl.textContent = t('noEventsThisMonth');
    parts.push(emptyEl);
  } else {
    events.forEach(function(ev) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--brd)';
      var dateEl = document.createElement('div');
      dateEl.style.cssText = 'min-width:28px;font-size:10px;font-weight:700;color:var(--b1d)';
      dateEl.textContent = ev.d + '/' + (month + 1);
      var nameEl = document.createElement('div');
      nameEl.style.cssText = 'flex:1;font-size:11px;font-weight:600';
      nameEl.textContent = ev.name;
      var tagEl = document.createElement('span');
      if (ev.type === 'bday') {
        tagEl.style.cssText = 'background:var(--b2l);color:var(--b2d);border-radius:3px;font-size:9px;padding:1px 5px;white-space:nowrap;flex-shrink:0';
        tagEl.textContent = t('tagBirthday');
      } else {
        tagEl.style.cssText = 'background:var(--b3l);color:var(--b3d);border-radius:3px;font-size:9px;padding:1px 5px;white-space:nowrap;flex-shrink:0';
        tagEl.textContent = t('tagHoliday');
      }
      row.appendChild(dateEl);
      row.appendChild(nameEl);
      row.appendChild(tagEl);
      parts.push(row);
    });
  }

  while (el.firstChild) el.removeChild(el.firstChild);
  parts.forEach(function(node) { el.appendChild(node); });
}

function showDayDetails(day, month, members) {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var monthName = MN[month - 1] || String(month);
  var allMems = mems();
  var parts = [];

  var backBtn = document.createElement('button');
  backBtn.textContent = '← ' + MN[sideCal.month] + ' ' + sideCal.year;
  backBtn.style.cssText = 'background:none;border:none;color:var(--b1d);font-size:12px;font-weight:700;cursor:pointer;padding:0 0 12px;display:block';
  backBtn.onclick = function() { renderSideCalendar(); };
  parts.push(backBtn);

  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:800;color:var(--txt);margin-bottom:14px';
  titleEl.textContent = day + ' ' + monthName;
  parts.push(titleEl);

  members.forEach(function(p) {
    var idx = allMems.indexOf(p);
    var card = document.createElement('div');
    card.style.cssText = 'background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px;margin-bottom:10px';

    var top = document.createElement('div');
    top.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px';

    var av = document.createElement('div');
    av.className = 'av ' + (idx >= 0 ? AV[idx % 4] : AV[0]);
    av.style.cssText = 'width:38px;height:38px;font-size:13px;flex-shrink:0';
    if (p.photo) {
      var img = document.createElement('img');
      img.src = p.photo;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
      av.appendChild(img);
    } else {
      av.textContent = ini(p.name);
    }

    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0';

    var nm = document.createElement('div');
    nm.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt)';
    nm.textContent = tIco(p.type) + ' ' + wname(p);

    var sub = document.createElement('div');
    sub.style.cssText = 'font-size:11px;color:var(--txt2);margin-top:1px';
    var age = ageBday(p.day, p.month, p.year);
    sub.textContent = tLbl(p.type) + ' · ' + p.day + ' ' + MN[p.month - 1] + (p.year ? ' ' + p.year : '') + (age ? ' — ' + age + ' ' + t(isWed(p)?'yearsTogether':'yearsOld') : '');

    var dl = daysTill(p.day, p.month);
    var dlEl = document.createElement('div');
    dlEl.style.cssText = 'font-size:11px;color:var(--b1d);margin-top:2px;font-weight:700';
    dlEl.textContent = dl === 0 ? t('calendarToday') : t('inDays') + ' ' + dl + ' ' + (dl > 1 ? t('daysUnit') : t('dayUnit'));

    info.appendChild(nm);
    info.appendChild(sub);
    info.appendChild(dlEl);
    top.appendChild(av);
    top.appendChild(info);
    card.appendChild(top);

    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:5px';

    var editBtn = document.createElement('button');
    editBtn.className = 'btn O sm';
    editBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    editBtn.textContent = '✏ ' + t('editMember');
    (function(pid) { editBtn.onclick = function() { showMemberEditPanel(pid, day, month); }; })(p.id);

    var msgBtn = document.createElement('button');
    msgBtn.className = 'btn G sm';
    msgBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    msgBtn.textContent = '✨ ' + t('msgBtn');
    (function(pid) { msgBtn.onclick = function() { genMsg(pid, 'side-msg-' + pid); }; })(p.id);

    var giftBtn = document.createElement('button');
    giftBtn.className = 'btn V sm';
    giftBtn.style.cssText = 'flex:1;font-size:10px;padding:6px 4px';
    giftBtn.textContent = '💡 ' + t('giftBtn');
    (function(pid) { giftBtn.onclick = function() { genGiftModal(pid); }; })(p.id);

    btns.appendChild(editBtn);
    btns.appendChild(msgBtn);
    btns.appendChild(giftBtn);
    card.appendChild(btns);

    var msgDiv = document.createElement('div');
    msgDiv.id = 'side-msg-' + p.id;
    card.appendChild(msgDiv);

    parts.push(card);
  });

  while (el.firstChild) el.removeChild(el.firstChild);
  parts.forEach(function(node) { el.appendChild(node); });
}

function showMemberEditPanel(memberId, backDay, backMonth) {
  var el = document.getElementById('desktop-right-panel');
  if (!el) return;
  var p = mems().find(function(x) { return String(x.id) === String(memberId); });
  if (!p) return;
  var backMonthName = MN[backMonth - 1] || String(backMonth);

  while (el.firstChild) el.removeChild(el.firstChild);

  function mkLabel(text) {
    var l = document.createElement('label');
    l.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt2);display:block;margin-bottom:4px;margin-top:10px';
    l.textContent = text;
    return l;
  }
  function mkInput(id, type, value) {
    var inp = document.createElement('input');
    inp.id = id;
    inp.className = 'inp';
    inp.type = type || 'text';
    inp.value = value || '';
    return inp;
  }
  function mkTextarea(id, value) {
    var ta = document.createElement('textarea');
    ta.id = id;
    ta.className = 'inp';
    ta.rows = 2;
    ta.style.cssText = 'min-height:50px';
    ta.value = value || '';
    return ta;
  }

  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:none;border:none;color:var(--b1d);font-size:12px;font-weight:700;cursor:pointer;padding:0 0 12px;display:block';
  backBtn.textContent = '← ' + backDay + ' ' + backMonthName;
  backBtn.onclick = function() {
    showDayDetails(backDay, backMonth, mems().filter(function(x) { return x.day === backDay && x.month === backMonth; }));
  };
  el.appendChild(backBtn);

  var title = document.createElement('div');
  title.style.cssText = 'font-size:13px;font-weight:700;color:var(--txt);margin-bottom:4px';
  title.textContent = '✏ ' + t('editMember') + ' ' + p.name;
  el.appendChild(title);

  el.appendChild(mkLabel(t('namePlaceholder') || 'Nom'));
  el.appendChild(mkInput('sp-name', 'text', p.name));

  var dateRow = document.createElement('div');
  dateRow.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px';
  [
    { label: t('dayLabel') || 'Jour', id: 'sp-day', val: String(p.day), maxlength: '2' },
    { label: t('monthLabel') || 'Mois', id: 'sp-month', val: String(p.month), maxlength: '2' },
    { label: t('yearLabel') || 'Année', id: 'sp-year', val: String(p.year || ''), maxlength: '4' }
  ].forEach(function(f) {
    var w = document.createElement('div');
    var l = document.createElement('label');
    l.style.cssText = 'font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--txt2);display:block;margin-bottom:4px';
    l.textContent = f.label;
    var inp = document.createElement('input');
    inp.id = f.id;
    inp.className = 'inp';
    inp.setAttribute('inputmode', 'numeric');
    inp.setAttribute('maxlength', f.maxlength);
    inp.value = f.val;
    w.appendChild(l);
    w.appendChild(inp);
    dateRow.appendChild(w);
  });
  el.appendChild(dateRow);

  el.appendChild(mkLabel(t('labelPhone') || 'Téléphone'));
  el.appendChild(mkInput('sp-phone', 'tel', p.phone || ''));

  el.appendChild(mkLabel(t('notesLabel') || 'Notes'));
  el.appendChild(mkTextarea('sp-note', p.note || ''));

  el.appendChild(mkLabel(t('customMsgLabel') || 'Message personnalisé'));
  el.appendChild(mkTextarea('sp-custom-msg', p.customMsg || ''));

  var errDiv = document.createElement('div');
  errDiv.id = 'sp-err';
  errDiv.style.cssText = 'font-size:12px;color:var(--b2d);margin-top:8px;display:none';
  el.appendChild(errDiv);

  var saveBtn = document.createElement('button');
  saveBtn.className = 'btn P fw';
  saveBtn.style.cssText = 'margin-top:12px;margin-bottom:8px';
  saveBtn.textContent = '✓ ' + t('saveBtn');
  (function(mid, bd, bm) {
    saveBtn.onclick = function() { saveEditPanel(mid, bd, bm); };
  })(memberId, backDay, backMonth);
  el.appendChild(saveBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn fw';
  cancelBtn.textContent = t('cancelBtn');
  (function(bd, bm) {
    cancelBtn.onclick = function() {
      showDayDetails(bd, bm, mems().filter(function(x) { return x.day === bd && x.month === bm; }));
    };
  })(backDay, backMonth);
  el.appendChild(cancelBtn);
}

function saveEditPanel(memberId, backDay, backMonth) {
  var m = mems();
  var p = m.find(function(x) { return String(x.id) === String(memberId); });
  if (!p) return;

  var name = (document.getElementById('sp-name').value || '').trim();
  var day = parseInt(document.getElementById('sp-day').value) || 0;
  var month = parseInt(document.getElementById('sp-month').value) || 0;
  var yearVal = document.getElementById('sp-year').value;
  var phone = (document.getElementById('sp-phone').value || '').trim();
  var note = (document.getElementById('sp-note').value || '').trim();
  var customMsg = (document.getElementById('sp-custom-msg').value || '').trim();

  var errDiv = document.getElementById('sp-err');
  if (!name || !day || !month || day < 1 || day > 31 || month < 1 || month > 12) {
    if (errDiv) { errDiv.textContent = t('invalidData'); errDiv.style.display = 'block'; }
    return;
  }
  if (errDiv) errDiv.style.display = 'none';

  Object.assign(p, {
    name: name,
    day: day,
    month: month,
    year: yearVal ? parseInt(yearVal) : null,
    phone: phone,
    note: note,
    customMsg: customMsg || undefined
  });
  m.sort(function(a, b) { return a.month - b.month || a.day - b.day; });
  setMems(m);
  saveG();

  var sHome = document.getElementById('s-home');
  if (sHome && sHome.style.display !== 'none') rHome();

  renderSideCalendar();

  var el = document.getElementById('desktop-right-panel');
  if (el) {
    var flash = document.createElement('div');
    flash.style.cssText = 'background:var(--b3l);color:var(--b3d);border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;margin-bottom:10px';
    flash.textContent = '✓ ' + name + ' ' + t('saveBtn').toLowerCase();
    el.insertBefore(flash, el.firstChild);
    setTimeout(function() { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 2000);
  }
}

// ── PLUS ──
function rMore(){
  var el=document.getElementById('s-more');if(!el)return;
  var h='';
  var isDark=typeof _isDarkMode==='function'&&_isDarkMode();
  h+='<div class="card" style="padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">';
  h+='<span style="font-size:14px;font-weight:600">'+t('darkModeLabel')+'</span>';
  h+='<button class="btn sm" style="min-width:72px;font-size:13px" onclick="toggleDarkMode()">'+(isDark?'☀️ OFF':'🌙 ON')+'</button>';
  h+='</div>';
  h+='<div class="card" style="padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between">';
  h+='<span style="font-size:14px;font-weight:600">'+t('notifSettingsTitle')+'</span>';
  h+='<button class="btn sm" style="min-width:72px;font-size:13px" onclick="showSec(\'settings-notif\',1);renderNotifSettings()">→</button>';
  h+='</div>';
  h+='<div class="sh">'+t('monProfil')+'</div>';
  h+='<div class="card" style="padding:16px">';
  h+='<label>'+t('liveCountry')+'</label><select id="prof-live"></select>';
  h+='<label style="margin-top:12px">'+t('originCountry')+'</label><select id="prof-origin"></select>';
  h+='<label style="margin-top:12px">'+t('originCountry2')+'</label><select id="prof-origin2"></select>';
  h+='<label style="margin-top:12px">'+t('religionLabel')+'</label><select id="prof-rel"></select>';
  h+='<button class="btn P fw" style="margin-top:16px" onclick="saveProfileSettings()">✓ '+t('applyProfileBtn')+'</button>';
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
    h += '<button class="btn P" style="flex:1;font-size:12px" onclick="shareRefLink(\'' + esc(refUrl) + '\')">' + t('refShareBtn') + '</button>';
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
    var savedPhoto=localStorage.getItem('bdg16_user_photo')||'';
    h+='<div class="sh" style="margin-top:16px">'+t('sectionMonCompte')+'</div>';
    h+='<div class="card" style="padding:16px">';
    h+='<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    h+='<div style="position:relative;flex-shrink:0" onclick="document.getElementById(\'profPhotoInp\').click()" title="Changer la photo" style="cursor:pointer">';
    h+='<div style="width:60px;height:60px;border-radius:50%;background:var(--b3l);color:var(--b3d);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;overflow:hidden;cursor:pointer;border:2px solid var(--b1)">';
    if(savedPhoto) h+='<img src="'+savedPhoto+'" style="width:100%;height:100%;object-fit:cover">';
    else h+=esc(ini);
    h+='</div>';
    h+='<div style="position:absolute;bottom:0;right:0;background:var(--b1);border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;pointer-events:none">📷</div>';
    h+='</div>';
    h+='<input type="file" id="profPhotoInp" accept="image/*" style="display:none" onchange="updateUserPhoto(this)">';
    h+='<div style="min-width:0"><div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(currentUser.name)+'</div>';
    h+='<div style="font-size:12px;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(currentUser.email)+'</div></div>';
    h+='</div>';
    h+='<div style="font-size:11px;color:var(--txt3);margin-bottom:14px;background:var(--bg2);padding:7px 10px;border-radius:8px;font-family:monospace">ID: '+currentUser.uid.substring(0,8)+'•••</div>';
    h+='<button class="btn fw" style="margin-bottom:8px" onclick="doForgotPassword()">'+t('resetPasswordBtn')+'</button>';
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
  buildCountrySelect('prof-live',profile.live||'');
  buildCountrySelect('prof-origin',profile.origin||'');
  buildCountrySelect('prof-origin2',profile.origin2||'');
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

function buildMsgPrompt(p, tpl, age, isTod, lang, prevMsgs) {
  var lines = [];
  var gender = p.gender || '';
  var genderFr = gender === 'femme' ? "C'est une femme."
    : gender === 'homme' ? "C'est un homme."
    : gender === 'enfant' ? "C'est un enfant."
    : '';

  if (p.type === 'wedding') {
    var couple = wname(p);
    lines.push("Génère en " + lang + " un message " + tpl.t + " pour l'anniversaire de mariage de " + couple + ".");
    if (age && isTod)  lines.push("Ils célèbrent " + age + " an" + (age > 1 ? 's' : '') + " de mariage aujourd'hui.");
    else if (age)      lines.push("Ils vont fêter " + age + " an" + (age > 1 ? 's' : '') + " de mariage.");
    else if (isTod)    lines.push("C'est leur anniversaire de mariage aujourd'hui.");
    lines.push("Célèbre leur parcours commun, leur amour et ce qu'ils ont construit ensemble.");

  } else if (p.type === 'work') {
    var ancPrefix = age
      ? age + " an" + (age > 1 ? 's' : '') + " d'ancienneté de"
      : "l'anniversaire d'entrée en entreprise de";
    lines.push("Génère en " + lang + " un message " + tpl.t + " pour célébrer " + ancPrefix + " " + p.name + ".");
    if (age === 1)     lines.push("C'est sa première année dans l'équipe.");
    else if (age > 1)  lines.push(age + " ans de fidélité et d'engagement dans l'équipe.");
    if (genderFr)      lines.push(genderFr);
    var pronoun = gender === 'femme' ? 'elle' : gender === 'homme' ? 'il' : 'il/elle';
    lines.push("Valorise sa contribution, son engagement et l'impact que " + pronoun + " a dans l'équipe. Ton professionnel et chaleureux, pas trop formel.");

  } else if (p.type === 'custom' || p.type === 'other') {
    var occasion = p.note ? "cet événement (voir détails ci-dessous)" : "cet événement spécial";
    lines.push("Génère en " + lang + " un message " + tpl.t + " pour célébrer " + p.name + " à l'occasion de " + occasion + ".");
    if (age && isTod)  lines.push("Cela fait " + age + " an" + (age > 1 ? 's' : '') + " — c'est aujourd'hui.");
    else if (age)      lines.push("Cela fait " + age + " an" + (age > 1 ? 's' : '') + ".");
    else if (isTod)    lines.push("C'est aujourd'hui.");
    if (genderFr)      lines.push(genderFr);
    lines.push("Sois créatif et adapte complètement le message au contexte fourni.");

  } else {
    // birthday (défaut)
    lines.push("Génère en " + lang + " un message " + tpl.t + " pour l'anniversaire de " + p.name + ".");
    if (age && isTod)  lines.push(p.name + " fête ses " + age + " ans aujourd'hui.");
    else if (age)      lines.push(p.name + " va avoir " + age + " ans.");
    else if (isTod)    lines.push("C'est son anniversaire aujourd'hui.");
    if (genderFr)      lines.push(genderFr);
  }

  if (p.note) {
    lines.push("Personnalise vraiment le message en intégrant ces caractéristiques dans le texte — ne les liste pas, inspire-toi en pour créer des phrases spécifiques à cette personne : " + p.note);
  }

  if (prevMsgs && prevMsgs.length > 0) {
    var excerpts = prevMsgs.map(function(m) {
      return '"' + (m.text || '').substring(0, 80) + '"';
    }).join(' / ');
    lines.push("Évite impérativement les formulations et tournures des messages précédents : " + excerpts);
  }

  var lengthTarget = p.type === 'work' ? '3 à 4 phrases' : '3 à 5 phrases';
  lines.push("Écris " + lengthTarget + " courtes et percutantes. Commence directement par le message, sans guillemets, sans titre, sans explication.");

  return lines.join('\n');
}

async function genMsg(id,elId){
  var el=document.getElementById(elId);if(!el)return;
  var p=mems().find(function(x){return String(x.id)===String(id);});if(!p)return;
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
  var prevMsgs=(hist[String(id)]||[]).slice(-2);
  var prompt=buildMsgPrompt(p,tpl,age,isTod,window.__aiLang||'français',prevMsgs);
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
  var p=mems().find(function(x){return String(x.id)===String(id);});
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
    var raw=(data.message||'').trim().replace(/^`{1,3}(?:json)?\s*/i,'').replace(/\s*`{1,3}$/,'');
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
  var q=t('floristQuery')+' '+name;
  window.open('https://www.google.com/search?q='+encodeURIComponent(q),'_blank');
}

window.__giftData={};

async function genGiftModal(id){
  var p=mems().find(function(x){return String(x.id)===String(id);});if(!p)return;
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
    var raw=(data.message||'').trim().replace(/^`{1,3}(?:json)?\s*/i,'').replace(/\s*`{1,3}$/,'');
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
  var p=mems().find(function(x){return String(x.id)===String(id);});if(!p)return;
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
  var grpName=(groups&&groups[0]&&groups[0].name)||'Bloomday';
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Bloomday Export</title><style>*{box-sizing:border-box}body{font-family:"Helvetica Neue",Arial,sans-serif;background:#FFF8F0;margin:0;padding:0}header{background:linear-gradient(135deg,#D4A843,#FF8C7A);padding:28px 32px;display:flex;align-items:center;gap:16px}header img{width:52px;height:52px;border-radius:12px;object-fit:contain;background:#fff;padding:4px}header h1{color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em}header p{color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px}.container{padding:28px 32px}table{border-collapse:collapse;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)}th{background:#2D1B14;color:#fff;padding:12px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.06em}td{padding:11px 14px;font-size:13px;border-bottom:1px solid #f0e8e0}tr:last-child td{border-bottom:none}tr:hover td{background:#FFF5E8}.print-btn{background:#D4A843;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;margin-bottom:20px;font-family:inherit}@media print{.print-btn{display:none}header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><header><img src="https://mybloomday.app/img/logo.png" alt="Bloomday"><div><h1>'+esc(grpName)+'</h1><p>'+m.length+' '+t('membresLabel')+' · mybloomday.app</p></div></header><div class="container"><button class="print-btn" onclick="window.print()">'+t('pdfPrint')+'</button><table><thead><tr><th>'+t('pdfColName')+'</th><th>'+t('pdfColDate')+'</th><th>'+t('pdfColAge')+'</th><th>'+t('pdfColPhone')+'</th><th>'+t('pdfColNotes')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div></body></html>';
  var blob=new Blob([html],{type:'text/html;charset=utf-8'});
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
  var msg='🌸 '+t('refShareMsg')+' : '+url;
  if(navigator.share){
    navigator.share({title:'Bloomday',text:'🌸 '+t('refShareMsg'),url:url}).catch(function(){
      navigator.clipboard&&navigator.clipboard.writeText(msg).then(function(){showToast(t('refCopied')||'Lien copié !','success');});
    });
  } else {
    navigator.clipboard&&navigator.clipboard.writeText(msg).then(function(){showToast(t('refCopied')||'Lien copié !','success');});
  }
}
function _drpClear(el){while(el.firstChild)el.removeChild(el.firstChild);}
function _drpTitle(el,text){var d=document.createElement('div');d.className='drp-title';d.textContent=text;el.appendChild(d);}
function _drpEmpty(el,text){var d=document.createElement('div');d.style.cssText='font-size:13px;color:var(--txt2);padding:8px 0';d.textContent=text;el.appendChild(d);}
function _drpMemberRow(el,p){
  var row=document.createElement('div');row.className='drp-item';
  var av=document.createElement('div');av.className='drp-av';
  if(p.photo){var img=document.createElement('img');img.src=p.photo;img.alt='';av.appendChild(img);}
  else{av.textContent=ini(p.name);}
  var info=document.createElement('div');info.style.cssText='flex:1;min-width:0';
  var nm=document.createElement('div');nm.className='drp-name';nm.textContent=tIco(p.type)+' '+p.name;
  var d=daysTill(p.day,p.month);
  var dLabel=d===0?t('todayLabel'):d===1?t('tomorrowLabel'):t('inDays')+' '+d+'j';
  var dt=document.createElement('div');dt.className='drp-date';dt.textContent=MN[p.month-1]+' '+p.day+' · '+dLabel;
  info.appendChild(nm);info.appendChild(dt);
  var btn=document.createElement('button');btn.className='drp-btn';btn.textContent=t('drpSendMsg');
  (function(id){btn.onclick=function(){genMsg(id,null);};})(p.id);
  row.appendChild(av);row.appendChild(info);row.appendChild(btn);
  el.appendChild(row);
}
function renderDesktopRightPanel(section){
  var el=document.getElementById('desktop-right-panel');
  if(!el)return;
  if(window.innerWidth<1024){el.style.display='none';return;}
  if(section!=='home'&&section!=='cal'){el.style.display='none';return;}
  el.style.display='flex';
  renderSideCalendar();
}
function showImportRecap(added){
  var ov=document.getElementById('import-recap-overlay');
  if(!ov)return;
  var missing=added.filter(function(p){return p.incomplete;});
  var banner=document.getElementById('import-recap-banner');
  if(banner){
    if(missing.length>0){
      banner.textContent=added.length+' '+t('importRecapBanner').replace('·',missing.length+' ·');
      banner.style.display='';
    }else{
      banner.textContent='';
      banner.style.display='none';
    }
  }
  var list=document.getElementById('import-recap-list');
  if(list){
    var h='';
    added.forEach(function(p){
      var hasDate=!p.incomplete;
      h+='<div style="background:var(--card);border:1px solid var(--brd);border-radius:10px;padding:10px 12px;margin-bottom:6px;display:flex;align-items:center;gap:10px">';
      h+='<div class="av '+AV[0]+'" style="width:32px;height:32px;font-size:13px;flex-shrink:0">'+ini(p.name)+'</div>';
      h+='<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(p.name)+'</div>';
      if(hasDate){
        h+='<div style="font-size:12px;color:var(--b3d);margin-top:1px">✓ '+p.day+' '+MNS[p.month-1]+'</div>';
      }else{
        h+='<div style="font-size:12px;color:var(--b2d);margin-top:1px">'+t('importDateMissing')+'</div>';
      }
      h+='</div>';
      if(!hasDate){
        h+='<button data-id="'+String(p.id)+'" onclick="closeImportRecap();editMemberInline(this.dataset.id)" style="background:var(--b1l);border:1px solid var(--b1);color:var(--b1d);border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">'+t('importComplete')+' ›</button>';
      }
      h+='</div>';
    });
    list.innerHTML=h;
  }
  ov.style.display='block';
}
function closeImportRecap(){
  var ov=document.getElementById('import-recap-overlay');
  if(ov)ov.style.display='none';
}
function editMemberInline(id){
  editId=String(id);
  showSec('members',1);
  rMembers();
  setTimeout(function(){
    var el=document.getElementById('em-name');
    if(el)el.focus();
  },200);
}

async function renderNotifSettings(){
  var settings=await loadNotificationSettings()||{enabled:false,daysBefore:1,time:'09:00',festivalsEnabled:false};
  var body=document.getElementById('notif-settings-body');
  if(!body)return;
  var daysOpts=[{v:0,l:t('notifDaysJ')},{v:1,l:t('notifDays1')},{v:3,l:t('notifDays3')},{v:7,l:t('notifDays7')}];
  var h='';
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px">'+t('notifDefault')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between">';
  h+='<div><div style="font-size:14px;font-weight:600;color:var(--txt)">'+t('notifEnabled')+'</div><div style="font-size:12px;color:var(--txt2);margin-top:2px">'+t('notifEnabledSub')+'</div></div>';
  h+='<label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0"><input type="checkbox" id="notif-toggle" '+(settings.enabled?'checked':'')+' style="opacity:0;width:0;height:0" onchange="onNotifToggle(this.checked)"><span style="position:absolute;cursor:pointer;inset:0;border-radius:24px;background:'+(settings.enabled?'var(--b3)':'var(--brd2)')+';transition:.2s"><span style="position:absolute;width:18px;height:18px;left:'+(settings.enabled?'22':'3')+'px;bottom:3px;background:#fff;border-radius:50%;transition:.2s"></span></span></label>';
  h+='</div>';
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px;margin-top:16px">'+t('notifDaysLabel')+'</div>';
  h+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">';
  daysOpts.forEach(function(o){
    h+='<button onclick="onNotifDaysChange('+o.v+')" style="padding:7px 14px;border-radius:20px;border:1.5px solid '+(settings.daysBefore===o.v?'var(--b1)':'var(--brd)')+';background:'+(settings.daysBefore===o.v?'var(--b1l)':'var(--card)')+';color:'+(settings.daysBefore===o.v?'var(--b1d)':'var(--txt2)')+';font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">'+o.l+'</button>';
  });
  h+='</div>';
  h+='<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--txt2);margin-bottom:8px">'+t('notifTimeLabel')+'</div>';
  h+='<div style="background:var(--card);border:1px solid var(--brd);border-radius:12px;padding:12px 14px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">';
  h+='<div style="font-size:14px;font-weight:600;color:var(--txt)">'+t('notifTimeLabel')+'</div>';
  h+='<input type="time" id="notif-time-input" value="'+settings.time+'" onchange="onNotifTimeChange(this.value)" style="border:1px solid var(--brd);border-radius:8px;padding:5px 10px;font-size:14px;color:var(--txt);background:var(--bg2);font-family:inherit">';
  h+='</div>';
  body.innerHTML=h;
  if(typeof _notifSettings!=='undefined')_notifSettings=Object.assign({},settings);
}
