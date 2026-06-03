// ── TEAM-FORM.JS ──

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
  selectedGender: ''
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
      + '<div><div class="mname">' + m.firstName + ' ' + m.lastName + '</div>'
      + '<div class="mmeta">' + m.relation + (m.email ? ' · ' + m.email : '') + '</div></div>'
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
  var res = await supabase.from('surveys').insert({
    token: adminToken,
    team_name: TF.pendingTeamName,
    manager_name: TF.pendingManagerName,
    relation_labels: TF.relationLabels,
    invite_message: TF.pendingInviteMsg
  }).select().single();
  if (res.error) { alert('Erreur création équipe : ' + res.error.message); return; }
  var surveyId = res.data.id;
  var memberRows = TF.pendingMembers.map(function(m) {
    return { survey_id: surveyId, token: crypto.randomUUID(), first_name: m.firstName, last_name: m.lastName, email: m.email || null, relation: m.relation || null };
  });
  var mRes = await supabase.from('survey_members').insert(memberRows);
  if (mRes.error) { alert('Erreur membres : ' + mRes.error.message); return; }
  window.location.href = 'team-form.html?admin=' + adminToken;
}
