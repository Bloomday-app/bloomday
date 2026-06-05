// ── DB.JS — Supabase data layer ──

async function dbLoadGroups(userId) {
  try {
    const gRes = await supabase.from('groups').select('*').eq('user_id', userId);
    const mRes = await supabase.from('members').select('*').eq('user_id', userId);

    if (gRes.error || mRes.error) return null;

    const groups = (gRes.data || []).map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      mode: g.mode,
      members: (mRes.data || [])
        .filter(m => m.group_id === g.id)
        .map(m => ({
          id: m.id,
          name: m.name,
          day: m.day,
          month: m.month,
          year: m.year,
          phone: m.phone,
          note: m.note,
          type: m.type,
          gender: m.gender,
          incomplete: m.incomplete || false,
          notif_days_before: m.notif_days_before != null ? m.notif_days_before : null,
          notif_time: m.notif_time || null
        }))
    }));

    return groups;
  } catch (e) {
    return null;
  }
}

async function dbSaveGroups(userId, groups) {
  try {
    const gRows = groups.map(g => ({
      id: g.id,
      user_id: userId,
      name: g.name,
      icon: g.icon || '',
      mode: g.mode || 'perso'
    }));

    // Delete members first (FK constraint: members reference groups)
    await supabase.from('members').delete().eq('user_id', userId);
    // Delete all groups then re-insert so removed groups don't persist in DB
    await supabase.from('groups').delete().eq('user_id', userId);
    if (gRows.length > 0) {
      await supabase.from('groups').insert(gRows);
    }

    const mRows = [];
    for (const g of groups) {
      for (const m of (g.members || [])) {
        mRows.push({
          id: String(m.id),
          user_id: userId,
          group_id: g.id,
          name: m.name,
          day: m.day || null,
          month: m.month || null,
          year: m.year || null,
          phone: m.phone || '',
          note: m.note || '',
          type: m.type || 'birthday',
          gender: m.gender || '',
          incomplete: m.incomplete || false,
          notif_days_before: m.notif_days_before != null ? m.notif_days_before : null,
          notif_time: m.notif_time || null
        });
      }
    }

    if (mRows.length > 0) {
      await supabase.from('members').insert(mRows);
    }
  } catch (e) {
    // silent catch
  }
}

async function dbLoadProfile(userId) {
  try {
    const res = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (res.error) return null;
    return res.data;
  } catch (e) {
    return null;
  }
}

async function dbSaveProfile(userId, profile) {
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name || '',
      phone: profile.phone || '',
      live: profile.live || 'fr',
      origin: profile.origin || '',
      origin2: profile.origin2 || '',
      religion: profile.religion || 'christian'
    });
  } catch (e) {
    // silent catch
  }
}

async function dbLoadStats(userId) {
  try {
    const res = await supabase.from('stats').select('*').eq('user_id', userId).maybeSingle();
    if (res.error) return null;
    const d = res.data;
    return {
      msgsM: d.msgs_month,
      celeb: d.celeb,
      totalSent: d.total_sent,
      totalGen: d.total_gen,
      code: d.code,
      refsCount: d.refs_count || 0
    };
  } catch (e) {
    return null;
  }
}

async function dbSaveStats(userId, stats) {
  try {
    await supabase.from('stats').upsert({
      user_id: userId,
      msgs_month: stats.msgsM || 0,
      celeb: stats.celeb || 0,
      total_sent: stats.totalSent || 0,
      total_gen: stats.totalGen || 0,
      code: stats.code || '',
      refs_count: stats.refsCount || 0,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    // silent catch
  }
}

async function savePushSubscription(endpoint, p256dh, auth){
  var uid=currentUser&&currentUser.uid;
  if(!uid)return;
  await supabase.from('push_subscriptions').upsert({
    user_id:uid,
    endpoint:endpoint,
    p256dh:p256dh,
    auth:auth,
    updated_at:new Date().toISOString()
  },{onConflict:'user_id,endpoint'});
}

async function saveNotificationSettings(settings){
  var uid=currentUser&&currentUser.uid;
  if(!uid)return;
  await supabase.from('profiles').update({notification_settings:settings}).eq('id',uid);
}

async function loadNotificationSettings(){
  var uid=currentUser&&currentUser.uid;
  if(!uid)return null;
  var r=await supabase.from('profiles').select('notification_settings').eq('id',uid).single();
  return r.data&&r.data.notification_settings||{enabled:false,daysBefore:1,time:'09:00',festivalsEnabled:false};
}
