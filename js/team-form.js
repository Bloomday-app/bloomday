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
  coadminToken: null,
  isCoadmin: false,
  pendingMembers: [],
  pendingTeamName: '',
  pendingManagerName: '',
  pendingInviteMsg: '',
  relationLabels: [],
  currentMember: null,
  selectedGender: '',
  pollInterval: null,
  submitting: false,
  user: null
};
var TF_DELETE = { token: null, teamName: null, groupId: null, bloomdayMembers: [] };
var TF_REMOVE = { token: null, name: null, userId: null };

var TF_PHONE_CODES = [
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgique / Belgium' },
  { code: '+41',  flag: '🇨🇭', name: 'Suisse / Schweiz' },
  { code: '+1',   flag: '🇺🇸', name: 'États-Unis / Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'Royaume-Uni / UK' },
  { code: '+49',  flag: '🇩🇪', name: 'Allemagne / Deutschland' },
  { code: '+34',  flag: '🇪🇸', name: 'Espagne / España' },
  { code: '+39',  flag: '🇮🇹', name: 'Italie / Italia' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+31',  flag: '🇳🇱', name: 'Pays-Bas / Nederland' },
  { code: '+212', flag: '🇲🇦', name: 'Maroc' },
  { code: '+213', flag: '🇩🇿', name: 'Algérie' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisie' },
  { code: '+221', flag: '🇸🇳', name: 'Sénégal' },
  { code: '+225', flag: '🇨🇮', name: "Côte d'Ivoire" },
  { code: '+237', flag: '🇨🇲', name: 'Cameroun' },
  { code: '+243', flag: '🇨🇩', name: 'Congo (RDC)' },
  { code: '+242', flag: '🇨🇬', name: 'Congo (Brazzaville)' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+229', flag: '🇧🇯', name: 'Bénin' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+262', flag: '🇷🇪', name: 'Réunion / Mayotte' },
  { code: '+596', flag: '🇲🇶', name: 'Martinique' },
  { code: '+590', flag: '🇬🇵', name: 'Guadeloupe' },
  { code: '+689', flag: '🇵🇫', name: 'Polynésie française' },
  { code: '+55',  flag: '🇧🇷', name: 'Brésil / Brasil' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexique / México' },
  { code: '+91',  flag: '🇮🇳', name: 'Inde / India' },
  { code: '+86',  flag: '🇨🇳', name: 'Chine / China' },
  { code: '+81',  flag: '🇯🇵', name: 'Japon / Japan' },
  { code: '+7',   flag: '🇷🇺', name: 'Russie / Россия' }
];

window.addEventListener('DOMContentLoaded', async function() {
  var params = new URLSearchParams(window.location.search);
  TF.adminToken = params.get('admin');
  TF.memberToken = params.get('member');
  TF.coadminToken = params.get('coadmin');
  TF.prefillManager = params.get('manager') || '';
  if (TF.memberToken) { TF.mode = 'member'; tfInitMember(); }
  else if (TF.adminToken) { TF.mode = 'dashboard'; tfInitDashboard(); }
  else if (TF.coadminToken) { TF.mode = 'coadmin'; tfInitCoadminClaim(); }
  else {
    try {
      var sessRes = await supabase.auth.getSession();
      var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
      TF.user = (sessRes.data && sessRes.data.session && sessRes.data.session.user) || null;
      if (userId) {
        var localTeams = tfGetSavedTeams();
        if (localTeams.length > 0) {
          var localTokens = localTeams.map(function(t) { return t.token; });
          await supabase.rpc('tf_claim_surveys', { p_tokens: localTokens });
        }
        var syncRes = await supabase.rpc('tf_get_my_surveys');
        if (!syncRes.error && Array.isArray(syncRes.data)) {
          tfMergeAndSaveTeams(syncRes.data);
        }
      }
    } catch(e) { /* sync failed, fall through to localStorage */ }
    var savedTeams = tfGetSavedTeams();
    if (savedTeams.length > 0) { TF.mode = 'teams'; tfInitTeams(); return; }
    var legacyToken = localStorage.getItem('tf_admin_token');
    if (legacyToken) { window.location.href = 'team-form.html?admin=' + legacyToken; return; }
    TF.mode = 'create'; tfInitCreate();
  }
});

function tfShow(id) {
  ['tf-view-teams','tf-view-create','tf-view-dashboard','tf-view-member','tf-view-thanks'].forEach(function(v) {
    document.getElementById(v).style.display = 'none';
  });
  document.getElementById(id).style.display = '';
}

// ── MULTI-TEAM LOCALSTORAGE ──
function tfGetSavedTeams() {
  try {
    var arr = JSON.parse(localStorage.getItem('tf_admin_tokens') || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch(e) { return []; }
}

function tfSaveAdminToken(token, teamName, managerName, isCoadmin) {
  var teams = tfGetSavedTeams();
  teams = teams.filter(function(t) { return t.token !== token; });
  teams.unshift({ token: token, teamName: teamName, managerName: managerName || '', createdAt: Date.now(), is_coadmin: !!isCoadmin });
  if (teams.length > 10) teams = teams.slice(0, 10);
  localStorage.setItem('tf_admin_tokens', JSON.stringify(teams));
  localStorage.setItem('tf_admin_token', token);
}

function tfMergeAndSaveTeams(remoteTeams) {
  if (!Array.isArray(remoteTeams)) return;
  var previousLast = localStorage.getItem('tf_admin_token');
  var teams = tfGetSavedTeams();
  var localTokens = {};
  teams.forEach(function(t) { localTokens[t.token] = true; });
  remoteTeams.forEach(function(t) {
    if (!t.token) return;
    if (!localTokens[t.token]) {
      tfSaveAdminToken(t.token, t.team_name, t.manager_name, t.is_coadmin);
    }
  });
  if (previousLast !== null) localStorage.setItem('tf_admin_token', previousLast);
}

function tfToast(msg, ms) {
  var el = document.getElementById('tf-toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(function() { el.classList.remove('show'); }, ms || 2500);
}

function tfSetBodyClass(cls) {
  document.body.classList.remove('tf-dashboard-active', 'tf-step2-active');
  if (cls) document.body.classList.add(cls);
}

function tfInitials(name) {
  var parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
}

function tfRenderTopbarAvatar() {
  var el = document.getElementById('tf-topbar-right');
  if (!el) return;
  var displayName = '';
  var avatarUrl = '';
  if (TF.user) {
    displayName = (TF.user.user_metadata && (TF.user.user_metadata.full_name || TF.user.user_metadata.name)) || TF.user.email || '';
    avatarUrl = (TF.user.user_metadata && TF.user.user_metadata.avatar_url) || '';
  } else if (TF.survey && TF.survey.manager_name) {
    displayName = TF.survey.manager_name;
  } else {
    var teams = tfGetSavedTeams();
    displayName = teams.length ? teams[0].managerName || teams[0].teamName || '' : '';
  }
  var initials = tfInitials(displayName);
  var avatarInner = avatarUrl
    ? '<img src="' + tfEsc(avatarUrl) + '" alt="">'
    : initials;
  el.innerHTML = '<button class="tf-avatar-btn" onclick="tfToggleAvatarMenu(event)" aria-label="' + tfT('profileMenu') + '">'
    + avatarInner + '</button>';
}

function tfToggleAvatarMenu(e) {
  e.stopPropagation();
  var el = document.getElementById('tf-topbar-right');
  var existing = el.querySelector('.tf-avatar-menu');
  if (existing) { existing.remove(); return; }
  var displayName = '';
  var email = '';
  if (TF.user) {
    displayName = (TF.user.user_metadata && (TF.user.user_metadata.full_name || TF.user.user_metadata.name)) || TF.user.email || '';
    email = TF.user.email || '';
  } else if (TF.survey && TF.survey.manager_name) {
    displayName = TF.survey.manager_name;
  } else {
    var teams = tfGetSavedTeams();
    displayName = teams.length ? teams[0].managerName || teams[0].teamName || '' : '';
  }
  var menu = document.createElement('div');
  menu.className = 'tf-avatar-menu';
  menu.innerHTML = (displayName ? '<div class="tf-avatar-menu-name">' + tfEsc(displayName) + '</div>' : '')
    + (email ? '<div class="tf-avatar-menu-email">' + tfEsc(email) + '</div>' : '')
    + '<a href="https://mybloomday.app" class="tf-avatar-menu-link">' + tfT('openBloomday') + '</a>';
  el.appendChild(menu);
  document.addEventListener('click', tfCloseAvatarMenu, { once: true });
}

function tfCloseAvatarMenu() {
  var el = document.getElementById('tf-topbar-right');
  if (!el) return;
  var menu = el.querySelector('.tf-avatar-menu');
  if (menu) menu.remove();
}

function tfRenderSteps(current) {
  var labels = [tfT('stepTeam'), tfT('stepMembers'), tfT('stepShare')];
  document.getElementById('tf-wizard-steps').innerHTML = labels.map(function(label, i) {
    var n = i + 1;
    var cls = n < current ? 'tf-step done' : n === current ? 'tf-step active' : 'tf-step';
    return '<div class="' + cls + '">' + (n < current ? '✓ ' : '') + label + '</div>';
  }).join('');
}

// ── MODE MES ÉQUIPES ──
function tfInitTeams() {
  tfSetBodyClass('');
  tfShow('tf-view-teams');
  var teams = tfGetSavedTeams();
  var html = '<div class="tf-card"><h1>' + tfT('myTeams') + '</h1>'
    + '<p style="font-size:13px;color:var(--txt2);margin-bottom:16px">' + teams.length + ' ' + (tfLang() === 'fr' ? (teams.length > 1 ? 'équipes enregistrées' : 'équipe enregistrée') : (teams.length > 1 ? 'saved teams' : 'saved team')) + '</p>';
  teams.forEach(function(t) {
    html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--brd)">'
      + '<div><div style="font-weight:700;font-size:15px">' + tfEsc(t.teamName) + '</div>'
      + '<div style="font-size:12px;color:var(--txt2)">' + tfT('managerLabel') + ' ' + tfEsc(t.managerName || '') + '</div></div>'
      + '<div style="display:flex;gap:8px">'
      + '<a href="team-form.html?' + (t.is_coadmin ? 'coadmin' : 'admin') + '=' + encodeURIComponent(t.token) + '" class="btn btn-ghost btn-sm">' + tfT('openTeam') + '</a>'
      + (!t.is_coadmin
        ? '<button class="btn btn-ghost btn-sm" style="color:#c0392b;border-color:#e8c0b8" '
          + 'data-token="' + tfEsc(t.token) + '" data-teamname="' + tfEsc(t.teamName) + '" '
          + 'onclick="tfDeleteTeam(this.dataset.token,this.dataset.teamname)">' + tfT('tfDeleteBtn') + '</button>'
        : '')
      + '</div>'
      + '</div>';
  });
  html += '</div>'
    + '<button class="btn btn-primary" onclick="tfGoCreate()">' + tfT('createNewTeam') + '</button>';
  document.getElementById('tf-view-teams').innerHTML = html;
  tfRenderTopbarAvatar();
}

function tfGoCreate() {
  TF.mode = 'create';
  tfInitCreate();
}

// ── MODE CRÉATION — Étape 1 ──
function tfInitCreate() {
  tfSetBodyClass('');
  TF.relationLabels = tfT('defaultRelations').slice();
  tfShow('tf-view-create');
  tfRenderSteps(1);
  document.getElementById('tf-step-2').style.display = 'none';
  document.getElementById('tf-step-1').style.display = 'block';
  tfRenderStep1();
  tfRenderTopbarAvatar();
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
  if (TF.prefillManager) document.getElementById('tf-manager-name').value = TF.prefillManager;
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
  tfSetBodyClass('tf-step2-active');
}

// ── MODE CRÉATION — Étape 2 ──
function tfRenderStep2() {
  var relOptions = TF.relationLabels.map(function(l) { return '<option>' + l.replace(/</g,'&lt;') + '</option>'; }).join('');
  document.getElementById('tf-step-2').innerHTML =
    '<div class="tf-two-col">'
    + '<div class="tf-col-left">'
    + '<div class="tf-card"><h2>' + tfT('stepMembers') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-inp-email" type="email" placeholder="email@exemple.com">'
    + '<label>' + tfT('relation') + '</label>'
    + '<select id="tf-inp-relation">' + relOptions + '</select>'
    + '<button class="btn btn-ghost" style="width:100%;margin-top:4px" onclick="tfAddMember()">' + tfT('addMember') + '</button>'
    + '</div></div>'
    + '<div>'
    + '<div id="tf-member-list" style="margin-bottom:16px"></div>'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:16px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfBackToStep1()">' + tfT('back') + '</button>'
    + '<button class="btn btn-primary" style="flex:1" onclick="tfSubmitCreate()">' + tfT('createTeam') + '</button>'
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
  tfSetBodyClass('');
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
  tfSaveAdminToken(adminToken, TF.pendingTeamName, TF.pendingManagerName);
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
  tfSaveAdminToken(TF.adminToken, TF.survey.team_name, TF.survey.manager_name);
  tfRenderDashboard();
  tfRenderAddMemberForm();
  tfStartDashboardPolling();
  tfSetBodyClass('tf-dashboard-active');
  tfRenderTopbarAvatar();
}

async function tfInitCoadminClaim() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user
    ? sessRes.data.session.user.id : null;

  if (!userId) {
    var wrapEl = document.querySelector('.tf-wrap');
    wrapEl.innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px">'
      + '<div style="font-size:40px;margin-bottom:16px">🤝</div>'
      + '<h1 style="margin-bottom:12px">' + tfT('tfCoAdminClaimTitle') + '</h1>'
      + '<p style="color:var(--txt2);font-size:14px;margin-bottom:24px">' + tfT('tfCoAdminClaimMsg').replace('%name', '') + '</p>'
      + '<a href="index.html" class="btn btn-primary" style="display:inline-block;text-decoration:none">' + tfT('tfCoAdminSignIn') + '</a>'
      + '</div>';
    return;
  }

  var res = await supabase.rpc('tf_claim_coadmin', { p_token: TF.coadminToken });
  if (!res.data || res.data.error) {
    var errMsg = res.data && res.data.error === 'already_owner'
      ? (tfLang() === 'fr' ? 'Vous êtes déjà propriétaire de cette équipe.' : 'You are already the owner.')
      : (tfLang() === 'fr' ? 'Lien invalide ou expiré.' : 'Invalid or expired link.');
    document.querySelector('.tf-wrap').innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px"><p style="color:var(--txt2)">' + errMsg + '</p><a href="team-form.html" class="btn btn-primary" style="display:inline-block;text-decoration:none;margin-top:16px">Retour</a></div>';
    return;
  }

  tfSaveAdminToken(res.data.co_admin_token, res.data.team_name, res.data.manager_name, true);
  TF.isCoadmin = true;
  await tfInitCoadminDashboard();
}

async function tfInitCoadminDashboard() {
  var res = await supabase.rpc('tf_get_dashboard_coadmin', { p_coadmin_token: TF.coadminToken });
  if (res.error || !res.data) {
    document.querySelector('.tf-wrap').innerHTML = '<div class="tf-card" style="text-align:center;padding:40px 24px"><p style="color:var(--txt2)">' + (tfLang() === 'fr' ? 'Accès refusé ou session expirée.' : 'Access denied or session expired.') + '</p></div>';
    return;
  }
  TF.survey = res.data.survey || {};
  TF.members = res.data.members || [];
  TF.isCoadmin = true;
  tfShow('tf-view-dashboard');
  tfRenderDashboard();
}

async function tfLoadDashboardMembers() {
  var res = TF.isCoadmin
    ? await supabase.rpc('tf_refresh_dashboard_coadmin', { p_coadmin_token: TF.coadminToken })
    : await supabase.rpc('tf_refresh_dashboard', { p_admin_token: TF.adminToken });
  if (!res.error && res.data) { TF.members = res.data; tfRenderDashboard(); }
}

function tfRenderDashboard() {
  var done = TF.members.filter(function(m) { return m.completed; }).length;
  var total = TF.members.length;
  document.getElementById('tf-dash-title').textContent = '🌸 ' + TF.survey.team_name;
  document.getElementById('tf-progress-fill').style.width = (total ? Math.round(done / total * 100) : 0) + '%';
  document.getElementById('tf-progress-text').textContent = tfT('progress').replace('%done', done).replace('%total', total);
  var coAdminSection = TF.isCoadmin ? '' :
    '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--brd)">'
    + '<div style="font-size:12px;font-weight:700;color:var(--txt2);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px">' + tfT('tfCoAdmin') + '</div>'
    + '<div id="tf-coadmin-section"><div style="font-size:13px;color:var(--txt3)">' + tfT('tfCoAdminClaiming') + '</div></div>'
    + '</div>';

  document.getElementById('tf-dash-actions').innerHTML =
    '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfPrintQR()">' + tfT('printQR') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfExportCSV()">' + tfT('exportCSV') + '</button>'
    + '<button class="btn btn-primary btn-sm" onclick="tfSyncBloomday()">' + tfT('importAllMembers') + '</button>'
    + '</div>'
    + '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfNewTeam()">' + tfT('newTeam') + '</button>'
    + '</div>'
    + coAdminSection;

  if (!TF.isCoadmin) tfLoadCoAdminSection();
  document.getElementById('tf-member-cards').innerHTML = TF.members.map(function(m) {
    return tfRenderMemberCard(m);
  }).join('');
  tfInitSwipe();
}

function tfRenderAddMemberForm() {
  var formCard = document.getElementById('tf-dash-form-card');
  if (!formCard) return;
  var relLabels = (TF.survey && Array.isArray(TF.survey.relation_labels)) ? TF.survey.relation_labels : [];
  var relOptions = relLabels.map(function(l) { return '<option>' + tfEsc(l) + '</option>'; }).join('');
  formCard.innerHTML =
    '<h2 style="margin-bottom:16px">' + tfT('addMemberDash') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-dash-inp-first" type="text" placeholder="Prénom">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-dash-inp-last" type="text" placeholder="Nom">'
    + '<label>' + tfT('emailLabel') + '</label>'
    + '<input id="tf-dash-inp-email" type="email" placeholder="email@exemple.com">'
    + (relOptions ? '<label>' + tfT('relation') + '</label><select id="tf-dash-inp-relation">' + relOptions + '</select>' : '')
    + '<button class="btn btn-primary" style="width:100%;margin-top:4px" onclick="tfSubmitAddMember()">' + tfT('addMember') + '</button>';
}

async function tfSubmitAddMember() {
  var firstEl = document.getElementById('tf-dash-inp-first');
  var firstName = firstEl ? (firstEl.value || '').trim() : '';
  if (!firstName) { alert(tfT('errorRequired')); return; }
  var lastName = (document.getElementById('tf-dash-inp-last').value || '').trim();
  var email = (document.getElementById('tf-dash-inp-email').value || '').trim();
  var relationEl = document.getElementById('tf-dash-inp-relation');
  var relation = relationEl ? relationEl.value : '';

  var res = TF.isCoadmin
    ? await supabase.rpc('tf_add_member_coadmin', {
        p_coadmin_token: TF.coadminToken,
        p_member: { first_name: firstName, last_name: lastName, email: email || '', relation: relation || '' }
      })
    : await supabase.rpc('tf_add_member', {
        p_admin_token: TF.adminToken,
        p_member: { first_name: firstName, last_name: lastName, email: email || '', relation: relation || '' }
      });

  if (res.error || !res.data) {
    alert('Erreur ajout membre' + (res.error ? ' : ' + res.error.message : '.'));
    return;
  }

  TF.members.push(res.data);
  var firstEl2 = document.getElementById('tf-dash-inp-first');
  var lastEl2 = document.getElementById('tf-dash-inp-last');
  var emailEl2 = document.getElementById('tf-dash-inp-email');
  if (firstEl2) firstEl2.value = '';
  if (lastEl2) lastEl2.value = '';
  if (emailEl2) emailEl2.value = '';
  if (firstEl2) firstEl2.focus();
  tfRenderDashboard();
  tfToast(firstName + ' ajouté·e !');
}

function tfNewTeam() {
  TF.mode = 'teams';
  tfInitTeams();
}

function tfRenderMemberCard(m) {
  var hasEmail = m.email ? 1 : 0;
  var badgeCls = m.completed ? 'badge-ok' : 'badge-wait';
  var badgeTxt = m.completed ? tfT('statusCompleted') : tfT('statusPending');
  var months = ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'];
  var detailsHtml = '';
  if (m.completed) {
    var lines = [];
    if (m.birth_day && m.birth_month) {
      lines.push('🎂 ' + m.birth_day + ' ' + (months[m.birth_month - 1] || '') + (m.birth_year ? ' ' + m.birth_year : ''));
    }
    if (m.gender === 'M') lines.push('♂ Homme');
    else if (m.gender === 'F') lines.push('♀ Femme');
    if (m.married && m.wedding_day && m.wedding_month) {
      lines.push('💍 Marié·e' + (m.spouse_name ? ' avec ' + tfEsc(m.spouse_name) : '') + ' — ' + m.wedding_day + ' ' + (months[m.wedding_month - 1] || '') + (m.wedding_year ? ' ' + m.wedding_year : ''));
    }
    if (lines.length) {
      detailsHtml = '<div style="margin-top:8px;padding:8px 10px;background:var(--bg);border-radius:8px;font-size:12px;color:var(--txt2);line-height:1.9">'
        + lines.map(function(l) { return '<div>' + l + '</div>'; }).join('')
        + '</div>';
    }
  }
  var fullName = tfEsc(m.first_name + ' ' + m.last_name);
  return '<div class="tf-dash-card">'
    + (TF.isCoadmin ? '' : '<div class="tf-dash-swipe-track">')
    + '<div class="tf-dash-swipe-inner">'
    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
    + '<div><div style="font-weight:700;font-size:15px">' + tfEsc(m.first_name) + ' ' + tfEsc(m.last_name) + '</div>'
    + '<div style="font-size:12px;color:var(--txt2)">' + tfEsc(m.relation || '') + '</div></div>'
    + '<div style="display:flex;align-items:center;gap:6px">'
    + '<span class="badge ' + badgeCls + '">' + badgeTxt + '</span>'
    + (TF.isCoadmin ? '' : '<button class="tf-remove-btn" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)" title="' + tfT('tfRemoveMemberBtn') + '">×</button>')
    + '</div>'
    + '</div>'
    + detailsHtml
    + '<div class="share-btns">'
    + (hasEmail ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareEmail(this.dataset.token)">' + tfT('sendEmail') + '</button>' : '')
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareWhatsApp(this.dataset.token)">' + tfT('sendWhatsApp') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareSMS(this.dataset.token)">' + tfT('sendSMS') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShareCopy(this.dataset.token)">' + tfT('copyLink') + '</button>'
    + '<button class="share-btn" data-token="' + m.token + '" onclick="tfShowQR(this.dataset.token)">' + tfT('qrCode') + '</button>'
    + (m.completed ? '<button class="share-btn" data-token="' + m.token + '" onclick="tfImportMember(this.dataset.token)" style="grid-column:span 2;background:#E3F9F0;border-color:#0A5C3A;color:#0A5C3A;font-weight:700">' + tfT('importMember') + '</button>' : '')
    + '</div>'
    + '</div>'
    + (TF.isCoadmin ? '' : '<div class="tf-dash-card-del" data-token="' + m.token + '" data-name="' + fullName + '" onclick="tfOpenRemoveModal(this.dataset.token,this.dataset.name)">' + tfT('tfRemoveMemberBtn') + '</div>')
    + (TF.isCoadmin ? '' : '</div>')
    + '</div>';
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
  if (!m) return;
  var url = tfMemberUrl(memberToken);
  document.getElementById('tf-modal-qr-name').textContent = m.first_name + ' ' + m.last_name;
  document.getElementById('tf-modal-qr-url').textContent = url;
  var container = document.getElementById('tf-modal-qr-code');
  container.innerHTML = '';
  var qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  container.innerHTML = qr.createImgTag(6);
  document.getElementById('tf-modal-print-btn').textContent = tfT('print');
  document.getElementById('tf-modal-qr').style.display = 'flex';
}

function tfCloseQRModal() {
  document.getElementById('tf-modal-qr').style.display = 'none';
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

// ── SYNC LOCALSTORAGE APRÈS IMPORT ──
function tfUpdateLocalStorage(groupId, groupName, rows) {
  try {
    var stored = localStorage.getItem('bdg16_groups');
    var localGroups = stored ? JSON.parse(stored) : [];
    var g = localGroups.find(function(x) { return x.id === groupId; });
    if (!g) {
      g = { id: groupId, name: groupName, icon: '👥', mode: 'biz', members: [] };
      localGroups.push(g);
    }
    rows.forEach(function(r) {
      if (!g.members.find(function(x) { return String(x.id) === String(r.id); })) {
        g.members.push({
          id: r.id, name: r.name, day: r.day, month: r.month, year: r.year || null,
          phone: r.phone || '', note: r.note || '', type: 'birthday', gender: r.gender || '',
          incomplete: false, notif_days_before: null, notif_time: null
        });
      }
    });
    localStorage.setItem('bdg16_groups', JSON.stringify(localGroups));
  } catch(e) {}
}

// ── IMPORT UNITAIRE ──
async function tfImportMember(memberToken) {
  var m = TF.members.find(function(x) { return x.token === memberToken; });
  if (!m || !m.completed) return;

  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;
  if (!userId) { alert(tfT('syncNotConnected')); return; }

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
  var fullName = (m.first_name + ' ' + m.last_name).trim();
  var note = m.relation ? 'Relation : ' + m.relation : '';
  if (m.birth_day && m.birth_month) {
    rows.push({ id: String(base), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (m.married && m.wedding_day && m.wedding_month) {
    rows.push({ id: String(base + 1), user_id: userId, group_id: groupId, name: fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'wedding', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
  }
  if (!rows.length) { tfToast(tfLang() === 'fr' ? 'Aucune date à importer.' : 'No date to import.'); return; }
  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
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
  var weddingCandidates = [];
  completed.forEach(function(m, i) {
    var fullName = (m.first_name + ' ' + m.last_name).trim();
    var note = m.relation ? 'Relation : ' + m.relation : '';
    if (m.birth_day && m.birth_month) {
      rows.push({ id: String(base + i * 2), user_id: userId, group_id: groupId, name: fullName, day: m.birth_day, month: m.birth_month, year: m.birth_year || null, phone: ((m.phone_code || '') + (m.phone_number || '')).trim(), note: note, type: 'birthday', gender: m.gender || '', incomplete: false, notif_days_before: null, notif_time: null });
    }
    if (m.married && m.wedding_day && m.wedding_month) {
      weddingCandidates.push({ m: m, i: i, fullName: fullName, phone: ((m.phone_code || '') + (m.phone_number || '')).trim() });
    }
  });

  // Déduplique les anniversaires de mariage : si deux membres se réfèrent l'un à l'autre, crée une seule fiche "A & B"
  var weddingPaired = {};
  weddingCandidates.forEach(function(cand) {
    if (weddingPaired[cand.i]) return;
    var m = cand.m;
    var spouseLower = (m.spouse_name || '').toLowerCase();
    var partner = null;
    weddingCandidates.forEach(function(other) {
      if (other.i === cand.i || weddingPaired[other.i]) return;
      if (other.m.wedding_day !== m.wedding_day || other.m.wedding_month !== m.wedding_month) return;
      var otherFirstLower = (other.m.first_name || '').toLowerCase();
      var otherSpouseLower = (other.m.spouse_name || '').toLowerCase();
      var myFirstLower = (m.first_name || '').toLowerCase();
      if (spouseLower.includes(otherFirstLower) && otherSpouseLower.includes(myFirstLower)) partner = other;
    });
    if (partner) {
      weddingPaired[cand.i] = true;
      weddingPaired[partner.i] = true;
      rows.push({ id: String(base + completed.length * 2 + rows.length), user_id: userId, group_id: groupId, name: cand.fullName + ' & ' + partner.fullName, day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: cand.phone, note: '', type: 'wedding', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
    } else {
      rows.push({ id: String(base + cand.i * 2 + 1), user_id: userId, group_id: groupId, name: cand.fullName + ' (mariage avec ' + (m.spouse_name || '?') + ')', day: m.wedding_day, month: m.wedding_month, year: m.wedding_year || null, phone: cand.phone, note: '', type: 'wedding', gender: '', incomplete: false, notif_days_before: null, notif_time: null });
    }
  });

  var iRes = await supabase.from('members').insert(rows);
  if (iRes.error) { alert('Erreur import : ' + iRes.error.message); return; }
  tfUpdateLocalStorage(groupId, TF.survey.team_name, rows);
  tfToast(tfT('syncSuccess').replace('%d', rows.length));
}

// ── MODE FORMULAIRE MEMBRE ──
async function tfInitMember() {
  tfSetBodyClass('');
  tfRenderTopbarAvatar();
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
    '<h2 style="font-size:14px;font-weight:700;color:var(--txt2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">' + tfT('yourInfo') + '</h2>'
    + '<label>' + tfT('firstName') + '</label>'
    + '<input id="tf-inp-edit-first" type="text" value="' + tfEsc(m.first_name) + '" autocomplete="given-name">'
    + '<label>' + tfT('lastName') + '</label>'
    + '<input id="tf-inp-edit-last" type="text" value="' + tfEsc(m.last_name) + '" autocomplete="family-name">'
    + '<label>' + tfT('phoneOptional') + '</label>'
    + '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<select id="tf-phone-code" style="width:150px;flex-shrink:0;margin-bottom:0">'
    + TF_PHONE_CODES.map(function(c) {
        return '<option value="' + c.code + '"'
          + (c.code === '+33' ? ' selected' : '')
          + '>' + c.flag + ' ' + c.code + ' — ' + tfEsc(c.name) + '</option>';
      }).join('')
    + '</select>'
    + '<input id="tf-phone-number" type="tel" style="flex:1;margin-bottom:0" placeholder="' + tfT('phonePlaceholder') + '">'
    + '</div>'
    + '<hr style="border:none;border-top:1px solid var(--brd);margin:4px 0 16px">'
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
    + '<button id="tf-submit-btn" class="btn btn-primary" onclick="tfSubmitMember()">' + tfT('submit') + '</button>';
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
  if (TF.submitting) return;
  var firstName = (document.getElementById('tf-inp-edit-first').value || '').trim();
  var lastName  = (document.getElementById('tf-inp-edit-last').value  || '').trim();
  if (!firstName || !lastName) { alert(tfT('errorRequired')); return; }
  var phoneCode   = document.getElementById('tf-phone-code').value || null;
  var phoneNumber = (document.getElementById('tf-phone-number').value || '').trim() || null;
  var birthDay   = parseInt(document.getElementById('tf-birth-day').value)   || null;
  var birthMonth = parseInt(document.getElementById('tf-birth-month').value) || null;
  var birthYear  = parseInt(document.getElementById('tf-birth-year').value)  || null;
  if (!birthDay || !birthMonth) { alert(tfT('errorRequired')); return; }
  var married    = document.getElementById('tf-married').checked;
  var spouseName = married ? (document.getElementById('tf-spouse-name').value || '').trim() : null;
  var wedDay     = married ? (parseInt(document.getElementById('tf-wed-day').value)   || null) : null;
  var wedMonth   = married ? (parseInt(document.getElementById('tf-wed-month').value) || null) : null;
  var wedYear    = married ? (parseInt(document.getElementById('tf-wed-year').value)  || null) : null;
  if (married && (!spouseName || !wedDay || !wedMonth)) { alert(tfT('errorRequired')); return; }

  TF.submitting = true;
  var btn = document.getElementById('tf-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  var res = await supabase.rpc('tf_submit_member_form', {
    p_member_token:  TF.memberToken,
    p_first_name:    firstName,
    p_last_name:     lastName,
    p_birth_day:     birthDay,   p_birth_month: birthMonth, p_birth_year: birthYear,
    p_gender:        TF.selectedGender || null,
    p_married:       married,    p_spouse_name: spouseName,
    p_wedding_day:   wedDay,     p_wedding_month: wedMonth, p_wedding_year: wedYear,
    p_phone_code:    phoneNumber ? phoneCode : null,
    p_phone_number:  phoneNumber || null
  });

  TF.submitting = false;
  if (btn) { btn.disabled = false; btn.textContent = tfT('submit'); }

  if (res.error || !res.data) {
    var isNetwork = res.error && (
      res.error.message.includes('Load failed') ||
      res.error.message.includes('Failed to fetch') ||
      res.error.message.includes('NetworkError') ||
      res.error.message.toLowerCase().includes('network')
    );
    alert(isNetwork ? tfT('errorNetwork') : (res.error ? 'Erreur : ' + res.error.message : tfT('errorRequired')));
    return;
  }
  TF.currentMember.first_name = firstName;
  TF.currentMember.last_name  = lastName;
  tfShow('tf-view-thanks');
  document.getElementById('tf-thanks-title').textContent = tfT('thankYou')
    .replace('[Prénom]', TF.currentMember.first_name)
    .replace('[First name]', TF.currentMember.first_name);
  document.getElementById('tf-thanks-sub').textContent = tfT('thankYouSub');
  setTimeout(function() { window.location.href = 'https://mybloomday.app'; }, 3000);
}

// ── SUPPRESSION D'ÉQUIPE ──
function tfDeleteTeam(token, teamName) {
  TF_DELETE.token = token;
  TF_DELETE.teamName = teamName;
  TF_DELETE.groupId = null;
  TF_DELETE.bloomdayMembers = [];
  var modal = document.getElementById('tf-modal-delete');
  modal.style.display = 'flex';
  document.getElementById('tf-modal-delete-inner').innerHTML = tfRenderDeleteStep1(teamName);
}

function tfRenderDeleteStep1(teamName) {
  return '<h2 style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:800;margin-bottom:12px">'
    + tfT('tfDeleteConfirmTitle').replace('%name', tfEsc(teamName)) + '</h2>'
    + '<p style="font-size:13px;color:var(--txt2);margin-bottom:20px">' + tfT('tfDeleteConfirmMsg') + '</p>'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="tfCloseDeleteModal()">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1;background:#c0392b;border:none" onclick="tfDeleteStep2()">'
    + tfT('tfDeleteBtn') + '</button>'
    + '</div>';
}

function tfCloseDeleteModal() {
  document.getElementById('tf-modal-delete').style.display = 'none';
  TF_DELETE.token = null;
  TF_DELETE.teamName = null;
  TF_DELETE.groupId = null;
  TF_DELETE.bloomdayMembers = [];
}

async function tfDeleteStep2() {
  var sessRes = await supabase.auth.getSession();
  var userId = sessRes.data && sessRes.data.session && sessRes.data.session.user && sessRes.data.session.user.id;

  if (!userId) { await tfExecuteDelete(null, []); return; }

  var gRes = await supabase.from('groups').select('id')
    .eq('user_id', userId).eq('name', TF_DELETE.teamName).maybeSingle();
  var groupId = gRes.data && gRes.data.id;

  if (!groupId) { await tfExecuteDelete(null, []); return; }

  var mRes = await supabase.from('members').select('id, name, day, month').eq('group_id', groupId);
  var members = mRes.data || [];

  if (!members.length) { await tfExecuteDelete(groupId, []); return; }

  TF_DELETE.groupId = groupId;
  TF_DELETE.bloomdayMembers = members;
  document.getElementById('tf-modal-delete-inner').innerHTML = tfRenderDeleteStep2(members);
}

function tfRenderDeleteStep2(members) {
  var months = ['Janv.','Févr.','Mars','Avr.','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'];
  var html = '<h2 style="font-family:\'Playfair Display\',serif;font-size:15px;font-weight:800;margin-bottom:8px">'
    + tfT('tfDeleteMembersTitle') + '</h2>'
    + '<p style="font-size:12px;color:var(--txt2);margin-bottom:12px">' + tfT('tfDeleteMembersDesc') + '</p>'
    + '<div style="display:flex;gap:8px;margin-bottom:10px">'
    + '<button class="btn btn-ghost btn-sm" onclick="tfToggleAllDeleteMembers(true)">' + tfT('tfSelectAll') + '</button>'
    + '<button class="btn btn-ghost btn-sm" onclick="tfToggleAllDeleteMembers(false)">' + tfT('tfDeselectAll') + '</button>'
    + '</div>'
    + '<div id="tf-delete-members-list" style="max-height:180px;overflow-y:auto;margin-bottom:16px">';
  members.forEach(function(m) {
    var dateStr = m.day && m.month ? m.day + ' ' + (months[m.month - 1] || '') : '';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)">'
      + '<input type="checkbox" id="tf-del-m-' + tfEsc(m.id) + '" value="' + tfEsc(m.id) + '" checked '
      + 'style="width:18px;height:18px;accent-color:var(--b3);flex-shrink:0;margin:0">'
      + '<label for="tf-del-m-' + tfEsc(m.id) + '" style="font-size:13px;font-weight:600;cursor:pointer;margin:0;flex:1">'
      + tfEsc(m.name)
      + (dateStr ? ' <span style="color:var(--txt2);font-weight:400">— 🎂 ' + dateStr + '</span>' : '')
      + '</label></div>';
  });
  html += '</div>'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="tfCloseDeleteModal()">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1;background:#c0392b;border:none" id="tf-delete-exec-btn" onclick="tfExecuteDeleteFromUI()">'
    + tfT('tfDeleteBtn') + '</button>'
    + '</div>';
  return html;
}

function tfToggleAllDeleteMembers(checked) {
  document.querySelectorAll('#tf-delete-members-list input[type=checkbox]').forEach(function(cb) {
    cb.checked = checked;
  });
}

async function tfExecuteDeleteFromUI() {
  var keepIds = [];
  document.querySelectorAll('#tf-delete-members-list input[type=checkbox]').forEach(function(cb) {
    if (cb.checked) keepIds.push(cb.value);
  });
  await tfExecuteDelete(TF_DELETE.groupId, keepIds);
}

async function tfExecuteDelete(groupId, keepIds) {
  var btn = document.getElementById('tf-delete-exec-btn') || document.querySelector('#tf-modal-delete-inner .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = tfT('tfDeleting'); }

  // 1. Supprimer le survey dans Supabase
  var res = await supabase.rpc('tf_delete_survey', { p_admin_token: TF_DELETE.token });
  if (res.error || res.data === false) {
    alert('Erreur lors de la suppression : ' + (res.error ? res.error.message : 'Token invalide.'));
    if (btn) { btn.disabled = false; btn.textContent = tfT('tfDeleteBtn'); }
    return;
  }

  // 2. Supprimer les membres Bloomday non conservés
  if (groupId && TF_DELETE.bloomdayMembers.length) {
    var allIds = TF_DELETE.bloomdayMembers.map(function(m) { return m.id; });
    var toDeleteIds = allIds.filter(function(id) { return keepIds.indexOf(id) === -1; });
    if (toDeleteIds.length) {
      var delRes = await supabase.from('members').delete().in('id', toDeleteIds);
      if (delRes.error) {
        tfToast('Équipe supprimée, erreur membres : ' + delRes.error.message);
      }
    }
    // Supprimer le groupe s'il est vide
    var remRes = await supabase.from('members').select('id').eq('group_id', groupId);
    if ((remRes.data || []).length === 0) {
      await supabase.from('groups').delete().eq('id', groupId);
    }
  }

  // 3. Retirer du localStorage
  var token = TF_DELETE.token;
  var teams = tfGetSavedTeams().filter(function(t) { return t.token !== token; });
  localStorage.setItem('tf_admin_tokens', JSON.stringify(teams));
  if (teams.length === 0) localStorage.removeItem('tf_admin_token');

  // 4. Fermer modale + rafraîchir
  tfCloseDeleteModal();
  tfToast(tfT('tfDeleteSuccess'));

  if (teams.length === 0) {
    TF.mode = 'create';
    tfInitCreate();
  } else {
    tfInitTeams();
  }
}

// ── SUPPRESSION DE MEMBRE ──
async function tfOpenRemoveModal(memberToken, memberName) {
  TF_REMOVE.token = memberToken;
  TF_REMOVE.name = memberName;
  var sessRes = await supabase.auth.getSession();
  TF_REMOVE.userId = sessRes.data && sessRes.data.session && sessRes.data.session.user
    ? sessRes.data.session.user.id : null;
  var modal = document.getElementById('tf-modal-remove');
  modal.style.display = 'flex';
  document.getElementById('tf-modal-remove-inner').innerHTML = tfRenderRemoveModal(memberName, !!TF_REMOVE.userId);
}

function tfRenderRemoveModal(memberName, showBloomday) {
  return '<h2 style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:800;margin-bottom:12px">'
    + tfT('tfRemoveConfirmTitle').replace('%name', tfEsc(memberName)) + '</h2>'
    + (showBloomday
      ? '<label style="display:flex;align-items:center;gap:10px;font-size:13px;margin-bottom:20px;cursor:pointer;text-align:left">'
        + '<input type="checkbox" id="tf-remove-bloomday-cb" style="width:18px;height:18px;accent-color:var(--b3);flex-shrink:0;margin:0">'
        + '<span>' + tfT('tfRemoveAlsoBloomday') + '</span>'
        + '</label>'
      : '<div style="margin-bottom:20px"></div>')
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="tfCloseRemoveModal()">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1;background:#c0392b;border:none" id="tf-remove-exec-btn" onclick="tfExecuteRemoveMember()">'
    + tfT('tfRemoveMemberBtn') + '</button>'
    + '</div>';
}

function tfCloseRemoveModal() {
  document.getElementById('tf-modal-remove').style.display = 'none';
  TF_REMOVE.token = null;
  TF_REMOVE.name = null;
  TF_REMOVE.userId = null;
  document.querySelectorAll('.tf-dash-swipe-track').forEach(function(el) {
    el.style.transform = 'translateX(0)';
  });
}

async function tfExecuteRemoveMember() {
  var btn = document.getElementById('tf-remove-exec-btn');
  if (btn) { btn.disabled = true; btn.textContent = tfT('tfRemoving'); }

  var res = await supabase.rpc('tf_remove_member', {
    p_admin_token: TF.adminToken,
    p_member_token: TF_REMOVE.token
  });
  if (res.error || res.data === false) {
    alert('Erreur : ' + (res.error ? res.error.message : 'Token invalide'));
    if (btn) { btn.disabled = false; btn.textContent = tfT('tfRemoveMemberBtn'); }
    return;
  }

  var alsoBloomday = document.getElementById('tf-remove-bloomday-cb') && document.getElementById('tf-remove-bloomday-cb').checked;
  if (alsoBloomday && TF_REMOVE.userId) {
    var member = TF.members.find(function(m) { return m.token === TF_REMOVE.token; });
    if (member) {
      var fullName = (member.first_name + ' ' + member.last_name).trim();
      var gRes = await supabase.from('groups').select('id')
        .eq('user_id', TF_REMOVE.userId).eq('name', TF.survey.team_name).maybeSingle();
      if (gRes.data && gRes.data.id) {
        await supabase.from('members').delete().eq('group_id', gRes.data.id).eq('name', fullName);
        await supabase.from('members').delete().eq('group_id', gRes.data.id).ilike('name', fullName + ' (mariage%');
      }
    }
  }

  TF.members = TF.members.filter(function(m) { return m.token !== TF_REMOVE.token; });
  tfCloseRemoveModal();
  tfToast(tfT('tfRemoveSuccess'));
  tfRenderDashboard();
}

// ── SWIPE-TO-DELETE MOBILE ──
function tfInitSwipe() {
  document.querySelectorAll('#tf-member-cards .tf-dash-card').forEach(function(card) {
    var startX = 0, startY = 0, dragging = false, delta = 0;
    card.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragging = true;
      delta = 0;
    }, { passive: true });
    card.addEventListener('touchmove', function(e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
      if (dx > 0) { delta = 0; return; }
      delta = Math.max(dx, -80);
      var inner = card.querySelector('.tf-dash-swipe-track');
      if (inner) inner.style.transform = 'translateX(' + delta + 'px)';
    }, { passive: true });
    card.addEventListener('touchend', function() {
      if (!dragging) return;
      dragging = false;
      var inner = card.querySelector('.tf-dash-swipe-track');
      if (delta < -40) {
        if (inner) inner.style.transform = 'translateX(-80px)';
        document.querySelectorAll('#tf-member-cards .tf-dash-swipe-track').forEach(function(other) {
          if (other !== inner) other.style.transform = 'translateX(0)';
        });
      } else {
        if (inner) inner.style.transform = 'translateX(0)';
      }
    });
  });
}

// ── CO-ADMIN SECTION ──
async function tfLoadCoAdminSection() {
  var el = document.getElementById('tf-coadmin-section');
  if (!el) return;
  var res = await supabase.rpc('tf_get_coadmin_info', { p_admin_token: TF.adminToken });
  if (res.error || !res.data) { el.innerHTML = ''; return; }
  var info = res.data;
  if (info.has_active_coadmin) {
    el.innerHTML = '<div style="font-size:13px;color:var(--txt2);margin-bottom:8px">'
      + (tfLang() === 'fr' ? 'Co-admin actif' : 'Active co-admin')
      + (info.invited_email ? ' : <strong>' + tfEsc(info.invited_email) + '</strong>' : '')
      + '</div>'
      + '<button class="btn btn-ghost btn-sm" style="color:#c0392b;border-color:#e8c0b8" onclick="tfRevokeCoAdmin()">' + tfT('tfRevokeCoAdmin') + '</button>';
  } else {
    el.innerHTML = '<div style="font-size:13px;color:var(--txt3);margin-bottom:10px">' + tfT('tfNoCoAdmin') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<button class="btn btn-ghost btn-sm" onclick="tfOpenCoAdminInviteEmail()">' + tfT('tfInviteByEmail') + '</button>'
      + '<button class="btn btn-ghost btn-sm" onclick="tfCopyCoAdminLink(\'' + tfEsc(info.co_admin_token) + '\')">' + tfT('tfCopyCoAdminLink') + '</button>'
      + '</div>';
  }
}

function tfOpenCoAdminInviteEmail() {
  document.getElementById('tf-modal-coadmin-invite').style.display = 'flex';
  document.getElementById('tf-modal-coadmin-invite-inner').innerHTML =
    '<h2 style="font-family:\'Playfair Display\',serif;font-size:17px;font-weight:800;margin-bottom:16px">' + tfT('tfInviteByEmail') + '</h2>'
    + '<label style="text-align:left;display:block">' + tfT('tfCoAdminEmailLabel') + '</label>'
    + '<input id="tf-coadmin-email-inp" type="email" placeholder="email@exemple.com" style="margin-bottom:16px">'
    + '<div style="display:flex;gap:8px">'
    + '<button class="btn btn-ghost" style="flex:1" onclick="document.getElementById(\'tf-modal-coadmin-invite\').style.display=\'none\'">' + tfT('cancelAdd') + '</button>'
    + '<button class="btn btn-primary" style="flex:1" id="tf-coadmin-invite-btn" onclick="tfSendCoAdminInvite()">' + tfT('tfInviteByEmail') + '</button>'
    + '</div>';
  setTimeout(function() {
    var inp = document.getElementById('tf-coadmin-email-inp');
    if (inp) inp.focus();
  }, 100);
}

async function tfSendCoAdminInvite() {
  var inp = document.getElementById('tf-coadmin-email-inp');
  var email = inp ? inp.value.trim() : '';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert(tfT('errorRequired'));
    return;
  }
  var btn = document.getElementById('tf-coadmin-invite-btn');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }

  var infoRes = await supabase.rpc('tf_get_coadmin_info', { p_admin_token: TF.adminToken });
  if (infoRes.error || !infoRes.data) {
    alert(tfLang() === 'fr' ? 'Erreur lors de la récupération du lien.' : 'Error fetching link.');
    if (btn) { btn.disabled = false; btn.textContent = tfT('tfInviteByEmail'); }
    return;
  }
  var claimUrl = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(infoRes.data.co_admin_token);

  await supabase.rpc('tf_save_coadmin_invitation', { p_admin_token: TF.adminToken, p_email: email });

  await fetch('/.netlify/functions/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'coadmin_invite',
      data: {
        email: email,
        managerName: TF.survey.manager_name || '',
        teamName: TF.survey.team_name || '',
        claimUrl: claimUrl
      }
    })
  });

  document.getElementById('tf-modal-coadmin-invite').style.display = 'none';
  tfToast(tfT('tfCoAdminInviteSent'));
  tfLoadCoAdminSection();
}

async function tfCopyCoAdminLink(coAdminToken) {
  var url = window.location.origin + window.location.pathname + '?coadmin=' + encodeURIComponent(coAdminToken);
  try {
    await navigator.clipboard.writeText(url);
    tfToast(tfT('tfLinkCopied'));
  } catch(e) {
    prompt(tfLang() === 'fr' ? 'Copiez ce lien :' : 'Copy this link:', url);
  }
}

async function tfRevokeCoAdmin() {
  if (!confirm(tfLang() === 'fr' ? 'Révoquer l\'accès du co-admin ?' : 'Revoke co-admin access?')) return;
  var res = await supabase.rpc('tf_revoke_coadmin', { p_admin_token: TF.adminToken });
  if (res.error) { alert('Erreur : ' + res.error.message); return; }
  tfToast(tfLang() === 'fr' ? 'Accès révoqué.' : 'Access revoked.');
  tfLoadCoAdminSection();
}
