// ── MIGRATION.JS — localStorage → Supabase (one-shot) ──

async function migrateIfNeeded(userId) {
  if (localStorage.getItem('bdg16_migrated') === '1') {
    return;
  }

  try {
    const result = await supabase.from('groups').select('id').eq('user_id', userId).limit(1);
    if (result.data && result.data.length > 0) {
      localStorage.setItem('bdg16_migrated', '1');
      return;
    }
  } catch (e) {
    // silent
  }

  const lsGet = (key, defaultVal) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || defaultVal;
    } catch (e) {
      return defaultVal;
    }
  };

  const lsGroups = lsGet('bdg16_groups', []);
  const lsProfile = lsGet('bdg16_profile', {});
  const lsStats = lsGet('bdg16_stats', {});
  const lsPlan = localStorage.getItem('bdg16_plan') || 'free';

  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: lsProfile.name || '',
      phone: lsProfile.phone || '',
      plan: lsPlan,
      live: lsProfile.live || 'fr',
      religion: lsProfile.religion || 'christian'
    });
  } catch (e) {
    // silent
  }

  if (Object.keys(lsStats).length > 0) {
    try {
      await supabase.from('stats').upsert({
        user_id: userId,
        msgs_month: lsStats.msgsM || 0,
        celeb: lsStats.celeb || 0,
        total_sent: lsStats.totalSent || 0,
        total_gen: lsStats.totalGen || 0,
        code: lsStats.code || ''
      });
    } catch (e) {
      // silent
    }
  }

  if (lsGroups.length > 0) {
    try {
      await dbSaveGroups(userId, lsGroups);
    } catch (e) {
      // silent
    }
  }

  localStorage.setItem('bdg16_migrated', '1');
}
