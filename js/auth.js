// ── SUPABASE AUTH ──

// Capture referral code from URL on page load
(function(){
  var urlRef=new URLSearchParams(window.location.search).get('ref');
  if(urlRef)sessionStorage.setItem('bdg16_pending_ref',urlRef.slice(0,10).toUpperCase());
})();

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
        await sg('bdg16_groups', groups);
      }
      var sbStats = await dbLoadStats(currentUser.uid);
      if (sbStats) {
        Object.assign(stats, sbStats);
        await sg('bdg16_stats', stats);
      }
      await ensureRefCode();
      var isNewUser = (Date.now() - new Date(session.user.created_at).getTime()) < 30000;
      if(isNewUser) await trackPendingReferral(session.user.id);
      var sbProfile = await dbLoadProfile(currentUser.uid);
      if (sbProfile) {
        profile.live = sbProfile.live || profile.live;
        profile.religion = sbProfile.religion || profile.religion;
        await sg('bdg16_profile', profile);
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
      var wasUser = currentUser;
      currentUser = null;
      localStorage.removeItem('bdg16_user');
      updateTopbar();
      var logoutBtnOut = document.getElementById('tb-logout');
      if (logoutBtnOut) logoutBtnOut.style.display = 'none';
      refresh();
      showLogoutScreen(wasUser);
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
    if(result.data.user) await trackPendingReferral(result.data.user.id);
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
    var msg = result.error.message || '';
    if (msg.toLowerCase().includes('email not confirmed')) {
      showToast('Confirmez votre email avant de vous connecter.', 'error');
    } else if (msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
      showToast('Email ou mot de passe incorrect.', 'error');
    } else {
      showToast(msg || t('noAccountFound'), 'error');
    }
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

function showLogoutScreen(wasUser) {
  var screen = document.getElementById('logout-screen');
  if (!screen) return;
  var firstName = wasUser && wasUser.name ? wasUser.name.split(' ')[0] : '';
  var greeting = document.getElementById('logout-greeting');
  var subtext = document.getElementById('logout-subtext');
  var reconnectBtn = document.getElementById('logout-reconnect-btn');
  if (greeting) greeting.textContent = (t('logoutTitle') || 'A bientot') + (firstName ? ', ' + firstName + ' !' : ' !');
  if (subtext) subtext.textContent = t('logoutSubtext') || 'Votre journee nous manquera. On se retrouve bientot !';
  if (reconnectBtn) reconnectBtn.textContent = t('logoutReconnect') || 'Se reconnecter';
  screen.style.display = 'flex';
  screen.style.animation = 'fi .4s ease';
  setTimeout(function() { closeLogoutScreen(); }, 3000);
}

function closeLogoutScreen() {
  var screen = document.getElementById('logout-screen');
  if (!screen) return;
  screen.style.opacity = '0';
  screen.style.transition = 'opacity .5s ease';
  setTimeout(function() {
    screen.style.display = 'none';
    screen.style.opacity = '';
    screen.style.transition = '';
    openOv('m-auth');
  }, 500);
}

async function doResetPassword() {
  if (!currentUser || !currentUser.email) return;
  var result = await supabase.auth.resetPasswordForEmail(currentUser.email, {
    redirectTo: window.location.origin
  });
  if (result.error) {
    showToast(result.error.message, 'error');
  } else {
    showToast(t('resetPasswordSent') || 'Email envoye ! Verifiez votre boite mail.', 'success');
  }
}

async function doDeleteAccount() {
  var msg = t('deleteAccountConfirmMsg') || 'Etes-vous sur ? Toutes vos donnees seront definitvement perdues.';
  if (!confirm(msg)) return;
  var headers = await getAuthHeaders();
  var resp = await fetch('/.netlify/functions/delete-account', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ confirm: true })
  });
  if (resp.ok) {
    showToast(t('deleteAccountSuccess') || 'Compte supprime. A bientot !', 'success');
    await supabase.auth.signOut();
  } else {
    var data = await resp.json().catch(function() { return {}; });
    showToast(data.error || t('deleteAccountError') || 'Erreur.', 'error');
  }
}

async function trackPendingReferral(newUserId){
  var ref=sessionStorage.getItem('bdg16_pending_ref');
  if(!ref||!newUserId)return;
  sessionStorage.removeItem('bdg16_pending_ref');
  try{
    var headers=await getAuthHeaders();
    await fetch('/.netlify/functions/track-referral',{
      method:'POST',
      headers:Object.assign({'Content-Type':'application/json'},headers),
      body:JSON.stringify({ref_code:ref,new_user_id:newUserId})
    });
  }catch(e){}
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
