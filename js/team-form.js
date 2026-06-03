// ── TEAM-FORM.JS ──

function tfEsc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var TF = {
  survey: null,
  members: [],
  mode: null,
  adminToken: null,
  memberToken: null,
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingInviteMsg: '',
  relationLabels: [],
  currentMember: null,
  selectedGender: '',
  pollInterval: null
};

window.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else { TF.mode = 'create'; tfInitCreate(); }
});

function tfShow(id) {
  ['tf-view-create','tf-view-dashboard','tf-view-member','tf-view-thanks'].forEach(function(v) {
    document.getElementById(v).style.display = 'none';
  });
  document.getElementById(id).style.display = 'block';
}

function tfToast(msg, ms) {
  var el = document.getElementById('tf-toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, ms || 2500);
}

function tfRenderSteps(current) {
  var labels = [tfT('stepTeam'), tfT('stepMembers'), tfT('stepShare')];
  document.getElementById('tf-wizard-steps').innerHTML = labels.map(function(label, i) {
    var n = i + 1;
    var cls = n < current ? 'tf-step done' : n === current ? 'tf-step active' : 'tf-step';
    return '<div class="' + cls + '">' + (n < current ? '✓ ' : '') + label + '</div>';
  }).join('');
}

// ── MODE CRÉATION — Étape 1 ──
function tfInitCreate() {
  TF.relationLabels = tfT('defaultRelations').slice();
  tfShow('tf-view-create');
  tfRenderSteps(1);
  document.getElementById('tf-step-2').style.display = 'none';
  document.getElementById('tf-step-1').style.display = 'block';
  tfRenderStep1();
}

function tfRenderStep1() {
  document.getElementById('tf-step-1').innerHTML =
    '<div class="tf-card"><h2>' + tfT('stepTeam') + '</h2>'
    + '<label>' + tfT('teamName') + '</label>'
    + '<input id="tf-team-name" type="text" placeholder="Ex : équipe marketing">'
    + '<label>' + tfT('managerName') + '</label>'
    + '<input id="tf-manager-name" type="text" placeholder="Ex : Sophie">'
    + '<label style="margin-bottom:8px">' + tfT('relationLabels') + '</label>'
    + '<div id="tf-relation-tags"></div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-bottom:16px" onclick="tfAddRelation()">' + tfT('addRelation') + '</button>'
    + '<label>' + tfT('inviteMessage') + '</label>'
    + '<textarea id="tf-invite-msg"></textarea>'
    + '<button class="btn btn-primary" onclick="tfStep1Next()">' + tfT('next') + '</button>'
    + '</div>';
  document.getElementById('tf-invite-msg').value = tfT('defaultInviteMsg');
  tfRenderRelationTags();
}

function tfRenderRelationTags() {
  document.getElementById('tf-relation-tags').innerHTML = TF.relationLabels.map(function(label, i) {
    return '<span class="relation-tag">'
      + '<input type="text" value="' + label.replace(/&/g,'&amp;').replace(/"/g,'&quot;') + '" oninput="TF.relationLabels[' + i + ']=this.value">'
      + '<button onclick="tfRemoveRelation(' + i + ')" title="Supprimer">&times;</button>'
      + '</span>';
  }).join('');
}

function tfAddRelation() {
  TF.relationLabels.push('');
  tfRenderRelationTags();
  var inputs = document.querySelectorAll('#tf-relation-tags input');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function tfRemoveRelation(i) {
  TF.relationLabels.splice(i, 1);
  tfRenderRelationTags();
}

function tfStep1Next() {
  var teamName = (document.getElementById('tf-team-name').value || '').trim();
  var managerName = (document.getElementById('tf-manager-name').value || '').trim();
  if (!teamName || !managerName) { alert(tfT('errorRequired')); return; }
  TF.pendingTeamName = teamName;
  TF.pendingManagerName = managerName;
  TF.pendingInviteMsg = (document.getElementById('tf-invite-msg').value || '').trim() || tfT('defaultInviteMsg');
  TF.relationLabels = TF.relationLabels.filter(function(l) { return l.trim(); });
  tfRenderSteps(2);
  document.getElementById('tf-step-1').style.display = 'none';
  document.getElementById('tf-step-2').style.display = 'block';
  tfRenderStep2();
}

// ── MODE CRÉATION — Étape 2 ──
function tfRenderStep2() {
  var relOptions = TF.relationLabels.map(function(l) { return '<option>' + l.replace(/</g,'&lt;') + '</option>'; }).join('');
  document.getElementById('tf-step-2').innerHTML =
    '<div class="tf-card"><h2>' + tfT('stepMembers') + '</h2>'
    + '<div id="tf-member-list" style="margin-bottom:16px"></div>'
    + '<div style="border:1.5px solid #eee;border-radius:8px;padding:12px;margin-bottom:16px">'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-inp-email" type="email" placeholder="email@exemple.com">'
    + '<label>' + tfT('relation') + '</label>'
    + '<select id="tf-inp-relation">' + relOptions + '</select>'
    + '<button class="btn btn-ghost" style="width:100%" onclick="tfAddMember()">' + tfT('addMember') + '</button>'
    + '</div>'
    + '<button class="btn btn-ghost btn-sm" style="margin-bottom:8px" onclick="tfBackToStep1()">' + tfT('back') + '</button>'
    + '<button class="btn btn-primary" onclick="tfSubmitCreate()">' + tfT('createTeam') + '</button>'
    + '</div>';
  tfRefreshMemberList();
}

function tfRefreshMemberList() {
  var el = document.getElementById('tf-member-list');
  if (!el) return;
  if (!TF.pendingMembers.length) {
    el.innerHTML = '<p style="font-size:13px;color:var(--txt2)">' + tfT('noMembers') + '</p>';
    return;
  }
  el.innerHTML = TF.pendingMembers.map(function(m, i) {
    return '<div class="member-card">'
      + '<div><div class="mname">' + tfEsc(m.firstName) + ' ' + tfEsc(m.lastName) + '</div>'
      + '<div class="mmeta">' + tfEsc(m.relation) + (m.email ? ' · ' + tfEsc(m.email) : '') + '</div></div>'
      + '<button class="btn btn-ghost btn-sm" onclick="tfRemovePendingMember(' + i + ')">' + tfT('removeMember') + '</button>'
      + '</div>';
  }).join('');
}

function tfAddMember() {
  var firstName = (document.getElementById('tf-inp-first').value || '').trim();
  if (!firstName) { alert(tfT('errorRequired')); return; }
  TF.pendingMembers.push({
    firstName: firstName,
    lastName: (document.getElementById('tf-inp-last').value || '').trim(),
    email: (document.getElementById('tf-inp-email').value || '').trim(),
    relation: document.getElementById('tf-inp-relation').value || ''
  });
  document.getElementById('tf-inp-first').value = '';
  document.getElementById('tf-inp-last').value = '';
  document.getElementById('tf-inp-email').value = '';
  document.getElementById('tf-inp-first').focus();
  tfRefreshMemberList();
}

function tfRemovePendingMember(i) {
  TF.pendingMembers.splice(i, 1);
  tfRefreshMemberList();
}

function tfBackToStep1() {
  tfRenderSteps(1);
  document.getElementById('tf-step-2').style.display = 'none';
  document.getElementById('tf-step-1').style.display = 'block';
}

async function tfSubmitCreate() {
  if (!TF.pendingMembers.length) { alert(tfT('noMembers')); return; }
  var adminToken = crypto.randomUUID();
  var memberRows = TF.pendingMembers.map(function(m) {
    return { token: crypto.randomUUID(), first_name: m.firstName, last_name: m.lastName, email: m.email || '', relation: m.relation || '' };
  });
  var res = await supabase.rpc('tf_create_survey', {
    p_admin_token:     adminToken,
    p_team_name:       TF.pendingTeamName,
    p_manager_name:    TF.pendingManagerName,
    p_relation_labels: TF.relationLabels,
    p_invite_message:  TF.pendingInviteMsg,
    p_members:         memberRows
  });
  if (res.error) { alert('Erreur création équipe : ' + res.error.message); return; }
  window.location.href = 'team-form.html?admin=' + adminToken;
}

// ── MODE DASHBOARD ──
async function tfInitDashboard() {
  tfShow('tf-view-dashboard');
  var res = await supabase.rpc('tf_get_dashboard', { p_admin_token: TF.adminToken });
  if (res.error || !res.data) {
    document.getElementById('tf-dash-title').textContent = 'Équipe introuvable.';
    return;
  }
  TF.survey = res.data.survey;
  TF.members = res.data.members || [];
  tfRenderDashboard();
  tfStartDashboardPolling();
}

async function tfLoadDashboardMembers() {
  var res = await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) { TF.members = res.data; tfRenderDashboard(); }
}

function tfRenderDashboard() {
  var done = TF.members.filter(function(m) { return m.completed; }).length;
  var total = TF.members.length;
  document.getElementById('tf-dash-title').textContent = '🌸 ' + TF.survey.team_name;
  document.getElementById('tf-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  document.getElementById('tf-progress-text').textContent = tfT('progress').replace('%done', done).replace('%total', total);
  document.getElementById('tf-dash-actions').innerHTML =
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('syncBloomday') + '</button>'
    + '</div>';
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
}

function tfRenderMemberCard(m) {
  var hasEmail = m.email ? 1 : 0;
  var badgeCls = m.completed ? 'badge-ok' : 'badge-wait';
  var badgeTxt = m.completed ? tfT('statusCompleted') : tfT('statusPending');
  return '<div class="tf-dash-card">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    + '<div><div style="font-weight:700;font-size:15px">' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</div>'
    + '<div style="font-size:12px;color:var(--txt2)">' + tfEsc(m.relation || '') + '</div></div>'
    + '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>'
    + '</div>'
    + '<div class="share-btns">'
    + (hasEmail ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareEmail(this.dataset.token)">' + tfT('sendEmail') + '</button>' : '')
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareWhatsApp(this.dataset.token)">' + tfT('sendWhatsApp') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareSMS(this.dataset.token)">' + tfT('sendSMS') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareCopy(this.dataset.token)">' + tfT('copyLink') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShowQR(this.dataset.token)">' + tfT('qrCode') + '</button>'
    + '</div></div>';
}

function tfMemberUrl(memberToken) {
  return window.location.origin + window.location.pathname + '?member=' + memberToken;
}

function tfBuildMsg(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  var url = tfMemberUrl(memberToken);
  return (TF.survey.invite_message || tfT('defaultInviteMsg'))
    .replace(/\[Prénom\]/g, m.first_name).replace(/\[First name\]/g, m.first_name)
    .replace(/\[Manager\]/g, TF.survey.manager_name)
    .replace(/\[Équipe\]/g, TF.survey.team_name).replace(/\[Team\]/g, TF.survey.team_name)
    .replace(/\[LIEN\]/g, url).replace(/\[LINK\]/g, url);
}

async function tfShareEmail(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  if (!m || !m.email) return;
  var url = tfMemberUrl(memberToken);
  var msg = tfBuildMsg(memberToken);
  await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'survey_invite', data: { email: m.email, firstName: m.first_name, managerName: TF.survey.manager_name, teamName: TF.survey.team_name, link: url, customMessage: msg } })
  });
  tfToast('Email envoyé à ' + m.email + ' !');
}

function tfShareWhatsApp(memberToken) {
  window.open('https://wa.me/?text=' + encodeURIComponent(tfBuildMsg(memberToken)), '_blank');
}

function tfShareSMS(memberToken) {
  window.open('sms:?body=' + encodeURIComponent(tfBuildMsg(memberToken)), '_blank');
}

function tfShareCopy(memberToken) {
  navigator.clipboard.writeText(tfBuildMsg(memberToken)).then(function() { tfToast(tfT('copied')); });
}

function tfStartDashboardPolling() {
  if (TF.pollInterval) clearInterval(TF.pollInterval);
  TF.pollInterval = setInterval(tfLoadDashboardMembers, 30000);
}

// ── QR CODES ──
function tfShowQR(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  var url = tfMemberUrl(memberToken);
  var qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  var win = window.open('', '_blank', 'width=320,height=420');
  win.document.write('<html><body style="text-align:center;font-family:sans-serif;padding:24px">'
    + '<h3 style="margin:0 0 16px">' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</h3>'
    + qr.createImgTag(4)
    + '<p style="font-size:11px;color:#aaa;margin-top:12px;word-break:break-all">' + tfEsc(url) + '</p>'
    + '<button onclick="window.print()" style="margin-top:12px;padding:8px 16px;background:#e75480;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px">Imprimer</button>'
    + '</body></html>');
  win.document.close();
}

function tfPrintQR() {
  var html = '<html><head><style>body{font-family:sans-serif} .item{display:inline-block;text-align:center;margin:12px;vertical-align:top;page-break-inside:avoid} h3{font-size:13px;margin:8px 0 4px}</style></head><body>';
  TF.members.forEach(function(m) {
    var qr = qrcode(0, 'M');
    qr.addData(tfMemberUrl(m.token));
    qr.make();
    html += '<div class="item"><h3>' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</h3>' + qr.createImgTag(3) + '</div>';
  });
  html += '</body></html>';
  var win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(function() { win.print(); }, 300);
}

// ── EXPORT CSV ──
function tfExportCSV() {
  var completed = TF.members.filter(function(m) { return m.completed; });
  if (!completed.length) { alert('Aucun membre complété pour l\'export.'); return; }
  var lines = [];
  completed.forEach(function(m) {
    var fullName = (m.first_name + ' ' + m.last_name).trim();
    if (m.birth_day && m.birth_month) {
      lines.push('"' + fullName.replace(/"/g, '""') + '",' + m.birth_day + ',' + m.birth_month + (m.birth_year ? ',' + m.birth_year : ''));
    }
    if (m.married && m.wedding_day && m.wedding_month) {
      var label = fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')';
      lines.push('"' + label.replace(/"/g, '""') + '",' + m.wedding_day + ',' + m.wedding_month + (m.wedding_year ? ',' + m.wedding_year : ''));
    }
  });
  var blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = TF.survey.team_name.replace(/\s+/g, '-') + '-bloomday.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── SYNC DIRECTE BLOOMDAY ──
async function tfSyncBloomday() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

  var completed = TF.members.filter(function(m) { return m.completed; });
  if (!completed.length) { alert('Aucun membre complété.'); return; }

  var gRes = await supabase.from('groups').select('id').eq('user_id', userId).eq('name', TF.survey.team_name).maybeSingle();
  var groupId;
  if (gRes.data && gRes.data.id) {
    groupId = gRes.data.id;
  } else {
    var newG = await supabase.from('groups').insert({ id: 'g' + Date.now(), user_id: userId, name: TF.survey.team_name, icon: '👥', mode: 'biz' }).select('id').single();
    if (newG.error) { alert('Erreur groupe : ' + newG.error.message); return; }
    groupId = newG.data.id;
  }

  var rows = [];
  var base = Date.now();
  completed.forEach(function(m, i) {
    var fullName = (m.first_name + ' ' + m.last_name).trim();
    var note = m.relation ? 'Relation : ' + m.relation : '';
    if (m.birth_day && m.birth_month) {
      rows.push({ id: String(base + i * 2), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: '', note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
    }
    if (m.married && m.wedding_day && m.wedding_month) {
      rows.push({ id: String(base + i * 2 + 1), user_id: userId, group_id: groupId, name: fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: '', note: note, type: 'birthday', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
    }
  });

  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}

// ── MODE FORMULAIRE MEMBRE ──
async function tfInitMember() {
  var res = await supabase.rpc('tf_get_member_form', { p_member_token: TF.memberToken });
  if (res.error || !res.data) {
    tfShow('tf-view-member');
    document.getElementById('tf-member-title').textContent = 'Lien invalide ou expiré.';
    return;
  }
  TF.currentMember = res.data;
  TF.survey = res.data.surveys;
  if (res.data.completed) {
    tfShow('tf-view-thanks');
    document.getElementById('tf-thanks-title').textContent = tfT('alreadyCompleted');
    document.getElementById('tf-thanks-sub').textContent = '';
    return;
  }
  tfShow('tf-view-member');
  document.getElementById('tf-member-title').textContent = tfT('memberTitle');
  document.getElementById('tf-member-sub').textContent = tfT('memberSub');
  tfRenderMemberForm();
}

function tfRenderMemberForm() {
  var m = TF.currentMember;
  var months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  var monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var mo = tfLang() === 'fr' ? months : monthsEn;
  var monthOpts = mo.map(function(name, i) { return '<option value="' + (i+1) + '">' + name + '</option>'; }).join('');

  TF.selectedGender = '';
  document.getElementById('tf-member-form').innerHTML =
    '<p style="font-size:15px;font-weight:700;margin-bottom:16px">👋 ' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</p>'
    + '<label>' + tfT('birthDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-birth-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-birth-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-birth-year" type="number" min="1920" max="2015" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '<label>' + tfT('gender') + '</label>'
    + '<div class="tf-gender-row">'
    + '<button class="tf-gender-btn" id="tf-gender-m" onclick="tfSelectGender(\'M\')">' + tfT('male') + '</button>'
    + '<button class="tf-gender-btn" id="tf-gender-f" onclick="tfSelectGender(\'F\')">' + tfT('female') + '</button>'
    + '</div>'
    + '<div class="tf-toggle">'
    + '<input type="checkbox" id="tf-married" onchange="tfToggleMarried(this.checked)">'
    + '<label for="tf-married" style="margin:0;font-size:14px;font-weight:600;color:var(--txt)">' + tfT('married') + '</label>'
    + '</div>'
    + '<div id="tf-married-fields" style="display:none">'
    + '<label>' + tfT('spouseName') + '</label>'
    + '<input id="tf-spouse-name" type="text" placeholder="Prénom Nom">'
    + '<label>' + tfT('weddingDate') + '</label>'
    + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px;margin-bottom:12px">'
    + '<input id="tf-wed-day" type="number" min="1" max="31" placeholder="' + tfT('day') + '">'
    + '<select id="tf-wed-month"><option value="">— ' + tfT('month') + ' —</option>' + monthOpts + '</select>'
    + '<input id="tf-wed-year" type="number" min="1950" max="2030" placeholder="' + tfT('year') + '">'
    + '</div>'
    + '</div>'
    + '<button class="btn btn-primary" onclick="tfSubmitMember()">' + tfT('submit') + '</button>';
}

function tfSelectGender(g) {
  TF.selectedGender = g;
  document.getElementById('tf-gender-m').classList.toggle('selected', g === 'M');
  document.getElementById('tf-gender-f').classList.toggle('selected', g === 'F');
}

function tfToggleMarried(checked) {
  document.getElementById('tf-married-fields').style.display = checked ? 'block' : 'none';
}

async function tfSubmitMember() {
  var birthDay = parseInt(document.getElementById('tf-birth-day').value) || null;
  var birthMonth = parseInt(document.getElementById('tf-birth-month').value) || null;
  var birthYear = parseInt(document.getElementById('tf-birth-year').value) || null;
  if (!birthDay || !birthMonth) { alert(tfT('errorRequired')); return; }
  var married = document.getElementById('tf-married').checked;
  var spouseName = married ? (document.getElementById('tf-spouse-name').value || '').trim() : null;
  var wedDay = married ? (parseInt(document.getElementById('tf-wed-day').value) || null) : null;
  var wedMonth = married ? (parseInt(document.getElementById('tf-wed-month').value) || null) : null;
  var wedYear = married ? (parseInt(document.getElementById('tf-wed-year').value) || null) : null;
  if (married && (!spouseName || !wedDay || !wedMonth)) { alert(tfT('errorRequired')); return; }

  var res = await supabase.rpc('tf_submit_member_form', {
    p_member_token:  TF.memberToken,
    p_birth_day:     birthDay,  p_birth_month: birthMonth,  p_birth_year: birthYear,
    p_gender:        TF.selectedGender || null,
    p_married:       married,   p_spouse_name: spouseName,
    p_wedding_day:   wedDay,    p_wedding_month: wedMonth,  p_wedding_year: wedYear
  });

  if (res.error || !res.data) { alert(res.error ? 'Erreur : ' + res.error.message : tfT('errorRequired')); return; }
  tfShow('tf-view-thanks');
  document.getElementById('tf-thanks-title').textContent = tfT('thankYou')
    .replace('[Prénom]', TF.currentMember.first_name)
    .replace('[First name]', TF.currentMember.first_name);
  document.getElementById('tf-thanks-sub').textContent = tfT('thankYouSub');
}
