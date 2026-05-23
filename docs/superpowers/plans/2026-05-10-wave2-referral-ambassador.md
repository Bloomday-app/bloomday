# Wave 2 — Parrainage & Programme Ambassadeur

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre aux utilisateurs de parrainer d'autres utilisateurs pour débloquer des plans gratuits et accéder à un programme ambassadeur par paliers (Bronze/Argent/Or).

**Architecture:** Le code de parrainage existe déjà dans la table `stats` (colonne `code`). On ajoute une colonne `refs_count` à la table stats, une fonction Netlify `track-referral.js` pour enregistrer les parrainages au moment de l'inscription, et une UI dédiée dans la section "Plus". Les paliers ambassadeur sont calculés côté client en fonction du `refs_count`.

**Tech Stack:** Supabase (DB), Netlify Functions (Node.js), HTML/CSS/JS vanilla, localStorage `bdg16_*`

---

## Architecture des fichiers

| Fichier | Action | Rôle |
|---------|--------|------|
| `netlify/functions/track-referral.js` | Créer | Incrémente `refs_count` du parrain dans Supabase |
| `js/auth.js` | Modifier | Détecter `?ref=CODE` à l'inscription et appeler `track-referral` |
| `js/db.js` | Modifier | Ajouter `refs_count` dans la lecture/écriture des stats |
| `js/render.js` | Modifier | Section parrainage + carte ambassadeur animée dans `rMore()` |
| `js/i18n.js` | Modifier | Clés i18n pour parrainage (7 langues) |
| `js/data.js` | Modifier | Logique `effectivePlan()` — plan upgradé selon `refs_count` |
| `js/core.js` | Modifier | Générer `code` unique si absent + appel `syncRefs()` |

---

## Task 1 : Fonction Netlify `track-referral.js`

**Files:**
- Create: `netlify/functions/track-referral.js`
- Reference: `netlify/functions/lib/verify-jwt.js` (pattern auth)
- Reference: `netlify/functions/delete-account.js` (pattern Supabase admin)

- [ ] **Step 1: Créer la fonction**

```js
// netlify/functions/track-referral.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad JSON' }; }

  const { ref_code, new_user_id } = body;
  if (!ref_code || !new_user_id) {
    return { statusCode: 400, body: 'Missing ref_code or new_user_id' };
  }

  // Trouver le parrain via son code
  const { data: referrer, error: findErr } = await supabase
    .from('stats')
    .select('user_id, refs_count')
    .eq('code', ref_code)
    .single();

  if (findErr || !referrer) {
    return { statusCode: 404, body: 'Referral code not found' };
  }

  // Empêcher l'auto-parrainage
  if (referrer.user_id === new_user_id) {
    return { statusCode: 400, body: 'Self-referral not allowed' };
  }

  // Vérifier que ce new_user_id n'a pas déjà été compté
  const { data: alreadyTracked } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrer.user_id)
    .eq('referred_id', new_user_id)
    .maybeSingle();

  if (alreadyTracked) {
    return { statusCode: 200, body: JSON.stringify({ already_tracked: true }) };
  }

  // Insérer dans la table referrals
  await supabase.from('referrals').insert({
    referrer_id: referrer.user_id,
    referred_id: new_user_id,
    created_at: new Date().toISOString()
  });

  // Incrémenter refs_count du parrain
  await supabase
    .from('stats')
    .update({ refs_count: (referrer.refs_count || 0) + 1 })
    .eq('user_id', referrer.user_id);

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
```

- [ ] **Step 2: Créer la table `referrals` dans Supabase**

Exécuter dans le SQL Editor de Supabase :

```sql
-- Table de tracking des parrainages
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- Ajouter refs_count à la table stats
ALTER TABLE stats ADD COLUMN IF NOT EXISTS refs_count INTEGER DEFAULT 0;

-- RLS : seule la service_role peut écrire
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON referrals USING (false);
```

- [ ] **Step 3: Commit**

```bash
git add netlify/functions/track-referral.js
git commit -m "feat: add track-referral netlify function + referrals table"
```

---

## Task 2 : Génération du code de parrainage dans `core.js`

**Files:**
- Modify: `js/core.js` (fonction `sg()` et init stats)
- Reference: `js/core.js` ligne ~6 — `bdg16_stats` localStorage

La colonne `code` existe déjà en Supabase stats. Si un utilisateur n'a pas de code, il faut en générer un.

- [ ] **Step 1: Ajouter la fonction `ensureRefCode()` dans `js/core.js`**

Trouver la section `// ── STATS ──` ou la zone de définition des fonctions utilitaires et ajouter :

```js
function genRefCode(uid){
  // Code court basé sur UID : 6 chars alphanumériques
  var base=(uid||'').replace(/-/g,'').slice(0,6).toUpperCase();
  var suffix=Math.random().toString(36).slice(2,4).toUpperCase();
  return base+suffix;
}

async function ensureRefCode(){
  var st=stats();
  if(st.code)return st.code;
  var uid=currentUser&&currentUser.uid;
  if(!uid)return null;
  var code=genRefCode(uid);
  st.code=code;
  setStats(st);
  // Persister dans Supabase
  try{
    var {supabase}=window;
    if(supabase){
      await supabase.from('stats').upsert({user_id:uid,code:code},{onConflict:'user_id'});
    }
  }catch(e){}
  return code;
}
```

- [ ] **Step 2: Appeler `ensureRefCode()` dans le flux d'initialisation**

Dans `js/auth.js`, dans le handler `SIGNED_IN` (après chargement des stats depuis Supabase), ajouter l'appel :

```js
// Après setStats(...) dans le SIGNED_IN handler
await ensureRefCode();
```

- [ ] **Step 3: Lire `refs_count` depuis Supabase dans `db.js`**

Dans `js/db.js`, dans la fonction qui charge les stats depuis Supabase (chercher `stats` + `select`), ajouter `refs_count` dans la sélection et le mapper dans l'objet local :

```js
// Dans loadStatsFromSupabase() ou équivalent
// Ajouter refs_count au select
const { data } = await supabase
  .from('stats')
  .select('msgs_month, celeb, total_sent, total_gen, code, refs_count')
  .eq('user_id', uid)
  .single();

if (data) {
  var st = stats();
  // ... mapping existant ...
  st.refsCount = data.refs_count || 0;
  setStats(st);
}
```

- [ ] **Step 4: Commit**

```bash
git add js/core.js js/auth.js js/db.js
git commit -m "feat: generate and persist referral code, sync refs_count from Supabase"
```

---

## Task 3 : Détecter `?ref=CODE` à l'inscription

**Files:**
- Modify: `js/auth.js` — fonctions signup email + Google OAuth callback

- [ ] **Step 1: Stocker le code de parrainage depuis l'URL**

En haut de `js/auth.js` (ou dans le code d'initialisation global), ajouter :

```js
// Capturer le code de parrainage depuis l'URL et le persister
(function(){
  var urlRef=new URLSearchParams(window.location.search).get('ref');
  if(urlRef)sessionStorage.setItem('bdg16_pending_ref',urlRef.slice(0,10).toUpperCase());
})();
```

- [ ] **Step 2: Appeler `track-referral` après inscription réussie**

Créer la fonction helper dans `js/auth.js` :

```js
async function trackPendingReferral(newUserId){
  var ref=sessionStorage.getItem('bdg16_pending_ref');
  if(!ref||!newUserId)return;
  sessionStorage.removeItem('bdg16_pending_ref');
  try{
    await fetch('/.netlify/functions/track-referral',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ref_code:ref,new_user_id:newUserId})
    });
  }catch(e){}
}
```

- [ ] **Step 3: Appeler `trackPendingReferral` dans le handler signup**

Dans `js/auth.js`, trouver la section où l'inscription email réussit (après `signUp` Supabase). Ajouter :

```js
// Après inscription réussie, uid = data.user.id
await trackPendingReferral(data.user.id);
```

Et pour Google OAuth, dans le handler `SIGNED_IN` si c'est un nouvel utilisateur (vérifier `session.user.created_at` proche de maintenant) :

```js
// Dans SIGNED_IN handler, si nouvel utilisateur
var isNew = (Date.now() - new Date(session.user.created_at).getTime()) < 30000;
if(isNew) await trackPendingReferral(session.user.id);
```

- [ ] **Step 4: Commit**

```bash
git add js/auth.js
git commit -m "feat: detect ?ref=CODE on signup and track referral"
```

---

## Task 4 : Logique de plan effectif selon les parrainages

**Files:**
- Modify: `js/data.js` — ajouter `effectivePlan()` 
- Modify: `js/core.js` — remplacer les usages de `PL()` par `EPL()` là où pertinent

Les paliers :
- 0-2 refs → plan actuel (inchangé)
- 3-9 refs → plan minimum `solo` (gratuit)
- 10-24 refs → plan minimum `bloom`
- 25+ refs → plan minimum `premium`

- [ ] **Step 1: Ajouter `EPL()` dans `js/data.js`**

À la fin de `js/data.js`, après la définition de `PL()` (ou dans `js/i18n.js` à la ligne ~4349 où `PL` est définie) :

```js
// Plan effectif tenant compte des parrainages
function ambTier(refs){
  if(refs>=25)return 'or';
  if(refs>=10)return 'argent';
  if(refs>=3)return 'bronze';
  return null;
}

function refPlanUpgrade(refs){
  if(refs>=25)return 'premium';
  if(refs>=10)return 'bloom';
  if(refs>=3)return 'solo';
  return null;
}

const EPL=()=>{
  var base=PLANS[plan]||PLANS.free;
  var refs=(stats()||{}).refsCount||0;
  var upgrade=refPlanUpgrade(refs);
  if(!upgrade)return base;
  var upgradedPlan=PLANS[upgrade];
  // Merge : prendre le meilleur de base et upgrade
  return {
    name:base.p>=(upgradedPlan.p||0)?base.name:upgradedPlan.name+'*',
    mm:Math.max(base.mm,upgradedPlan.mm),
    mg:Math.max(base.mg,upgradedPlan.mg),
    msgs:Math.max(base.msgs,upgradedPlan.msgs),
    gifts:base.gifts||upgradedPlan.gifts,
    cards:base.cards||upgradedPlan.cards,
    adm:Math.max(base.adm,upgradedPlan.adm),
    amb:base.amb||upgradedPlan.amb,
    p:base.p
  };
};
```

- [ ] **Step 2: Commit**

```bash
git add js/data.js
git commit -m "feat: add EPL() for referral-based plan upgrade + ambTier()"
```

---

## Task 5 : UI parrainage dans la section "Plus"

**Files:**
- Modify: `js/render.js` — fonction `rMore()` 
- Modify: `js/i18n.js` — clés i18n (fr + 6 autres langues)

- [ ] **Step 1: Ajouter les clés i18n dans les 7 langues**

Dans `js/i18n.js`, ajouter dans chaque bloc langue (près de `contactImported`) :

**Français (ligne ~599) :**
```js
refTitle:'🌸 Parrainez vos proches',
refSub:'Partagez Bloomday et débloquez des avantages gratuits',
refCopyBtn:'📋 Copier le lien',
refCopied:'✓ Lien copié !',
refShareBtn:'📤 Partager',
refStatsLabel:'Parrainages actifs :',
refNextTier:'Pour atteindre le palier suivant :',
refTierBronze:'🥉 Ambassadeur Bronze',
refTierArgent:'🥈 Ambassadeur Argent',
refTierOr:'🥇 Ambassadeur Or',
refTierNone:'Commencez à parrainer !',
refBenefit3:'3 parrainages → Plan Solo offert',
refBenefit10:'10 parrainages → Plan Bloom offert',
refBenefit25:'25 parrainages → Plan Premium offert',
```

**Anglais, Espagnol, Arabe, Hindi, Chinois, Portugais :** ajouter les équivalents traduits dans chaque bloc.

Anglais :
```js
refTitle:'🌸 Refer your friends',refSub:'Share Bloomday and unlock free perks',refCopyBtn:'📋 Copy link',refCopied:'✓ Link copied!',refShareBtn:'📤 Share',refStatsLabel:'Active referrals:',refNextTier:'To reach next tier:',refTierBronze:'🥉 Bronze Ambassador',refTierArgent:'🥈 Silver Ambassador',refTierOr:'🥇 Gold Ambassador',refTierNone:'Start referring!',refBenefit3:'3 referrals → Free Solo plan',refBenefit10:'10 referrals → Free Bloom plan',refBenefit25:'25 referrals → Free Premium plan',
```

Espagnol :
```js
refTitle:'🌸 Refiere a tus amigos',refSub:'Comparte Bloomday y desbloquea beneficios gratis',refCopyBtn:'📋 Copiar enlace',refCopied:'✓ ¡Enlace copiado!',refShareBtn:'📤 Compartir',refStatsLabel:'Referencias activas:',refNextTier:'Para el siguiente nivel:',refTierBronze:'🥉 Embajador Bronce',refTierArgent:'🥈 Embajador Plata',refTierOr:'🥇 Embajador Oro',refTierNone:'¡Empieza a referir!',refBenefit3:'3 referencias → Plan Solo gratis',refBenefit10:'10 referencias → Plan Bloom gratis',refBenefit25:'25 referencias → Plan Premium gratis',
```

Arabe :
```js
refTitle:'🌸 أحل أصدقاءك',refSub:'شارك Bloomday واحصل على مزايا مجانية',refCopyBtn:'📋 نسخ الرابط',refCopied:'✓ تم نسخ الرابط!',refShareBtn:'📤 مشاركة',refStatsLabel:'الإحالات النشطة:',refNextTier:'للوصول إلى المستوى التالي:',refTierBronze:'🥉 سفير برونزي',refTierArgent:'🥈 سفير فضي',refTierOr:'🥇 سفير ذهبي',refTierNone:'ابدأ الإحالة!',refBenefit3:'3 إحالات ← خطة Solo مجانية',refBenefit10:'10 إحالات ← خطة Bloom مجانية',refBenefit25:'25 إحالات ← خطة Premium مجانية',
```

Hindi :
```js
refTitle:'🌸 दोस्तों को रेफर करें',refSub:'Bloomday शेयर करें और मुफ्त लाभ पाएं',refCopyBtn:'📋 लिंक कॉपी करें',refCopied:'✓ लिंक कॉपी हो गया!',refShareBtn:'📤 शेयर करें',refStatsLabel:'सक्रिय रेफरल:',refNextTier:'अगले स्तर के लिए:',refTierBronze:'🥉 ब्रॉन्ज़ एंबेसडर',refTierArgent:'🥈 सिल्वर एंबेसडर',refTierOr:'🥇 गोल्ड एंबेसडर',refTierNone:'रेफरल शुरू करें!',refBenefit3:'3 रेफरल → मुफ्त Solo प्लान',refBenefit10:'10 रेफरल → मुफ्त Bloom प्लान',refBenefit25:'25 रेफरल → मुफ्त Premium प्लान',
```

Chinois :
```js
refTitle:'🌸 邀请好友',refSub:'分享 Bloomday，解锁免费权益',refCopyBtn:'📋 复制链接',refCopied:'✓ 链接已复制！',refShareBtn:'📤 分享',refStatsLabel:'活跃邀请：',refNextTier:'距离下一等级：',refTierBronze:'🥉 铜牌大使',refTierArgent:'🥈 银牌大使',refTierOr:'🥇 金牌大使',refTierNone:'开始邀请吧！',refBenefit3:'3次邀请 → 免费Solo计划',refBenefit10:'10次邀请 → 免费Bloom计划',refBenefit25:'25次邀请 → 免费Premium计划',
```

Portugais :
```js
refTitle:'🌸 Indique seus amigos',refSub:'Compartilhe o Bloomday e desbloqueie vantagens grátis',refCopyBtn:'📋 Copiar link',refCopied:'✓ Link copiado!',refShareBtn:'📤 Compartilhar',refStatsLabel:'Indicações ativas:',refNextTier:'Para o próximo nível:',refTierBronze:'🥉 Embaixador Bronze',refTierArgent:'🥈 Embaixador Prata',refTierOr:'🥇 Embaixador Ouro',refTierNone:'Comece a indicar!',refBenefit3:'3 indicações → Plano Solo grátis',refBenefit10:'10 indicações → Plano Bloom grátis',refBenefit25:'25 indicações → Plano Premium grátis',
```

- [ ] **Step 2: Ajouter la section parrainage dans `rMore()` de `js/render.js`**

Dans `rMore()`, trouver la section "Plan Actuel" et ajouter **avant** celle-ci :

```js
// ── SECTION PARRAINAGE ──
var st2=stats()||{};
var refs=st2.refsCount||0;
var refCode=st2.code||'';
var refUrl=refCode?'https://bloomday.app/?ref='+refCode:'';
var tier=ambTier(refs); // bronze | argent | or | null

// Carte ambassadeur animée
var tierColors={
  bronze:{bg:'#FFF3E0',border:'#E0A070',text:'#8B4513',glow:'rgba(224,160,112,0.3)'},
  argent:{bg:'#F0F4FF',border:'#8FA8D8',text:'#2D4A8A',glow:'rgba(143,168,216,0.3)'},
  or:    {bg:'#FFFBEA',border:'#D4AF37',text:'#7B5A00',glow:'rgba(212,175,55,0.35)'}
};
var tc=tier?tierColors[tier]:null;
var tierLabel=tier?t('refTier'+tier.charAt(0).toUpperCase()+tier.slice(1)):t('refTierNone');

var nextCount=refs<3?3:refs<10?10:refs<25?25:null;
var nextLabel=nextCount?`${nextCount-refs} ${t('refNextTier')} ${nextCount===3?'Bronze':nextCount===10?'Argent':'Or'}`:'🌟 Palier maximum atteint !';

h+=`<div style="background:var(--bg2);border-radius:16px;padding:16px;margin-bottom:14px">`;
h+=`<div style="font-size:15px;font-weight:700;color:var(--b1d);margin-bottom:4px">${t('refTitle')}</div>`;
h+=`<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">${t('refSub')}</div>`;

// Carte ambassadeur
if(tc){
  h+=`<div style="background:${tc.bg};border:2px solid ${tc.border};border-radius:14px;padding:14px;margin-bottom:12px;box-shadow:0 0 18px ${tc.glow};position:relative;overflow:hidden">`;
  h+=`<div style="position:absolute;top:-18px;right:-18px;font-size:60px;opacity:0.12;transform:rotate(-15deg)">🌸</div>`;
  h+=`<div style="font-size:17px;font-weight:800;color:${tc.text}">${tierLabel}</div>`;
  h+=`<div style="font-size:12px;color:${tc.text};opacity:0.8;margin-top:2px">${refs} ${t('refStatsLabel')}</div>`;
  h+=`</div>`;
} else {
  h+=`<div style="background:var(--bg3,#f0f0f0);border-radius:12px;padding:12px;margin-bottom:12px;text-align:center;font-size:13px;color:var(--txt2)">${tierLabel} — 0 ${t('refStatsLabel')}</div>`;
}

// Barre de progression
if(nextCount){
  var progress=Math.min(100,Math.round(refs/(nextCount)*100));
  h+=`<div style="background:var(--bg3,#eee);border-radius:99px;height:6px;margin-bottom:6px">`;
  h+=`<div style="background:var(--b1);border-radius:99px;height:6px;width:${progress}%;transition:width 0.5s"></div></div>`;
  h+=`<div style="font-size:11px;color:var(--txt2);margin-bottom:10px">${nextLabel}</div>`;
}

// Avantages
h+=`<div style="font-size:11px;color:var(--txt2);margin-bottom:10px;line-height:1.8">${t('refBenefit3')}<br>${t('refBenefit10')}<br>${t('refBenefit25')}</div>`;

// Boutons partage
if(refUrl){
  h+=`<div style="display:flex;gap:8px">`;
  h+=`<button class="btn G" style="flex:1;font-size:12px" onclick="copyRefLink('${refUrl}')">${t('refCopyBtn')}</button>`;
  if(navigator.share){
    h+=`<button class="btn P" style="flex:1;font-size:12px" onclick="shareRefLink('${refUrl}','${esc(t('refTitle'))}')">${t('refShareBtn')}</button>`;
  }
  h+=`</div>`;
}
h+=`</div>`;
```

- [ ] **Step 3: Ajouter les fonctions `copyRefLink()` et `shareRefLink()` dans `js/render.js`**

À la fin de `js/render.js` (avant la dernière ligne ou dans la section utilitaires) :

```js
function copyRefLink(url){
  navigator.clipboard.writeText(url).then(function(){
    showToast(t('refCopied'));
  }).catch(function(){
    prompt('Copiez ce lien :', url);
  });
}

function shareRefLink(url, title){
  if(!navigator.share)return;
  navigator.share({title:title||'Bloomday',text:t('refSub'),url:url}).catch(function(){});
}
```

- [ ] **Step 4: S'assurer que `showToast()` existe (vérifier dans `js/core.js`)**

Chercher `showToast` dans `js/core.js`. Si elle n'existe pas, ajouter :

```js
function showToast(msg, dur){
  var d=dur||2500;
  var el=document.getElementById('toast');
  if(!el){el=document.createElement('div');el.id='toast';el.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 18px;border-radius:24px;font-size:13px;z-index:9999;opacity:0;transition:opacity 0.2s';document.body.appendChild(el);}
  el.textContent=msg;el.style.opacity='1';
  clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity='0';},d);
}
```

- [ ] **Step 5: Commit**

```bash
git add js/render.js js/i18n.js
git commit -m "feat: referral UI in Plus section with ambassador tier card"
```

---

## Task 6 : Vérification finale et déploiement

**Files:** Aucun fichier nouveau

- [ ] **Step 1: Tester le flux complet en local**

```bash
netlify dev
```

Scénario de test :
1. Ouvrir `http://localhost:8888/?ref=TESTCODE`
2. Créer un compte → vérifier que `bdg16_pending_ref` est bien stocké en sessionStorage
3. Après inscription → vérifier l'appel à `/.netlify/functions/track-referral` dans les Network devtools
4. Ouvrir la section "Plus" → vérifier que le code de parrainage s'affiche
5. Cliquer "Copier le lien" → vérifier le toast

- [ ] **Step 2: Vérifier en SQL Supabase**

```sql
-- Vérifier que refs_count s'incrémente
SELECT user_id, code, refs_count FROM stats WHERE code IS NOT NULL LIMIT 10;

-- Vérifier la table referrals
SELECT * FROM referrals LIMIT 10;
```

- [ ] **Step 3: Commit final et push**

```bash
git add -A
git commit -m "feat: Wave 2 — referral system + ambassador tiers complete"
git push
```

---

## Résumé des paliers ambassadeur

| Palier | Refs nécessaires | Plan offert | Couleur carte |
|--------|-----------------|-------------|---------------|
| Bronze | 3 | Solo (1,99€/mois) | Orange chaleureux |
| Argent | 10 | Bloom (4,99€/mois) | Bleu-gris élégant |
| Or | 25 | Premium (7,99€/mois) | Doré lumineux |
