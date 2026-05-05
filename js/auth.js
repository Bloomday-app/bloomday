// ── SUPABASE AUTH ──

function buildUserFromSession(session) {
  var meta = session.user.user_metadata || {};
  return {
    uid: session.user.id,
    email: session.user.email,
    name: meta.full_name || meta.name || session.user.email.split('@')[0],
    phone: meta.phone || '',
    plan: localStorage.getItem('bdg16_plan') || 'free',
    createdAt: session.user.created_at
  };
}

function initAuth() {
  supabase.auth.getSession().then(function(result) {
    var session = result.data.session;
    if (session) {
      currentUser = buildUserFromSession(session);
      safeLsSet('bdg16_user', JSON.stringify(currentUser));
      updateTopbar();
    }
    var logoutBtn = document.getElementById('tb-logout');
    if (logoutBtn) logoutBtn.style.display = session ? 'inline-block' : 'none';
  });

  supabase.auth.onAuthStateChange(async function(event, session) {
    if (event === 'SIGNED_IN' && session) {
      var isNew = !currentUser;
      currentUser = buildUserFromSession(session);
      safeLsSet('bdg16_user', JSON.stringify(currentUser));

      await migrateIfNeeded(currentUser.uid);

      var sbGroups = await dbLoadGroups(currentUser.uid);
      if (sbGroups && sbGroups.length) {
        groups = sbGroups;
        sg('bdg16_groups', groups);
      }
      var sbStats = await dbLoadStats(currentUser.uid);
      if (sbStats) {
        Object.assign(stats, sbStats);
        sg('bdg16_stats', stats);
      }
      var sbProfile = await dbLoadProfile(currentUser.uid);
      if (sbProfile) {
        profile.live = sbProfile.live || profile.live;
        profile.religion = sbProfile.religion || profile.religion;
        sg('bdg16_profile', profile);
      }

      if (isNew) {
        closeOv('m-auth');
        showToast(t('welcomeUser') + ' ' + currentUser.name.split(' ')[0] + ' !', 'success');
        sendEmail('welcome', { name: currentUser.name, email: currentUser.email });
      }
      updateTopbar();
      var logoutBtnIn = document.getElementById('tb-logout');
      if (logoutBtnIn) logoutBtnIn.style.display = 'inline-block';
      refresh();
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      localStorage.removeItem('bdg16_user');
      updateTopbar();
      var logoutBtnOut = document.getElementById('tb-logout');
      if (logoutBtnOut) logoutBtnOut.style.display = 'none';
      refresh();
    }
  });
}

async function doSignupSupabase() {
  var nameEl = document.getElementById('auth-name');
  var emailEl = document.getElementById('auth-email');
  var phoneEl = document.getElementById('auth-phone');
  var passEl = document.getElementById('auth-pass');
  var name = (nameEl && nameEl.value || '').trim();
  var email = (emailEl && emailEl.value || '').trim().toLowerCase();
  var phone = (phoneEl && phoneEl.value || '').trim();
  var pass = (passEl && passEl.value || '').trim();

  if (!name) { showToast('Votre prénom est requis', 'error'); return; }
  var emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailReg.test(email)) { showToast(t('errEmailInvalid'), 'error'); return; }
  if (pass.length < 8) { showToast(t('errPassShort'), 'error'); return; }

  var btn = document.getElementById('auth-submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = t('registeringText') || 'Création...'; }

  var result = await supabase.auth.signUp({
    email: email,
    password: pass,
    options: {
      data: { full_name: name, phone: phone },
      emailRedirectTo: 'https://bloomday-day.netlify.app'
    }
  });

  if (btn) { btn.disabled = false; btn.textContent = t('authCreateBtn') || '🌸 Créer mon compte gratuit'; }

  if (result.error) {
    showToast(result.error.message, 'error');
    return;
  }

  // Email confirmation required — session is null until user clicks the link
  if (result.data.user && !result.data.session) {
    showToast(t('checkYourEmail') || 'Vérifiez votre boîte mail pour confirmer votre compte !', 'success');
    closeOv('m-auth');
    return;
  }
  // onAuthStateChange SIGNED_IN handles the rest (auto-confirm disabled)
}

async function doLoginSupabase() {
  var emailEl = document.getElementById('auth-login-email');
  var passEl = document.getElementById('auth-login-pass');
  var email = (emailEl && emailEl.value || '').trim();
  var pass = (passEl && passEl.value || '').trim();
  if (!email || !pass) { showToast('Remplissez tous les champs', 'error'); return; }

  var result = await supabase.auth.signInWithPassword({ email: email, password: pass });
  if (result.error) {
    showToast(t('noAccountFound'), 'error');
    switchAuthTab('signup');
    return;
  }
  // onAuthStateChange SIGNED_IN handles the rest
}

async function doGoogleLogin() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
}

async function doLogoutSupabase() {
  await supabase.auth.signOut();
}

async function getAuthToken() {
  var result = await supabase.auth.getSession();
  var session = result.data.session;
  return session ? session.access_token : null;
}

async function getAuthHeaders() {
  var token = await getAuthToken();
  var h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = 'Bearer ' + token;
  return h;
}
