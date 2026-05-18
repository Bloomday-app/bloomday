# Wave 2 — Layout Desktop + Refonte Pricing : Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un vrai layout desktop 3 colonnes (sidebar + contenu + panneau contextuel) et remplacer les cartes pricing par un tableau comparatif 4 colonnes sur une seule page.

**Architecture:**
- **Pricing** : nouvelle fonction `renderPricingTable()` dans `core.js` remplace `renderAllPlans()`. Le HTML `#land` perd ses onglets Perso/Biz et gagne `#pricing-table-container`. Responsive mobile : cartes empilées via media query.
- **Desktop layout** : bloc CSS `@media(min-width:1024px)` + éléments `.desktop-sidebar` et `.desktop-right-panel` dans le DOM. `showSec()` est enrichi pour mettre à jour le panneau contextuel et l'icône active.

**Tech Stack:** Vanilla JS ES6+ (pas d'import/export, tout global), CSS custom variables, HTML5. Vérification syntaxe : `node --check`.

---

## Fichiers modifiés

| Fichier | Rôle |
|---|---|
| `js/i18n.js` | +12 clés pricing (7 langues) |
| `css/app.css` | styles pricing table + desktop 3 colonnes |
| `js/core.js` | `renderPricingTable()` + `showSec()` enrichi |
| `js/render.js` | appel `renderPricingTable()` + `renderDesktopRightPanel()` |
| `js/features.js` | mise à jour des 3 appels `renderAllPlans` |
| `index.html` | section pricing remplacée + éléments desktop ajoutés |

---

## Task 1 : i18n — Nouvelles clés pricing (7 langues)

**Files:** Modify `js/i18n.js`

Dans chaque bloc de langue, chercher `planCTAtry` et ajouter les clés suivantes juste après.

- [ ] **Step 1 : Ajouter dans I18N.fr**

Après `planCTAtry:'🌸 Essayer 7 jours gratuits',` ajouter :

```
pricingHeroTitle:'Choisissez votre formule',
pricingHeroSub:'Messages IA · Cadeaux · 140 pays · 7 langues',
pricingStatsPays:'Pays',
pricingStatsLangues:'Langues',
pricingStatsAI:'IA Personnalisé',
pricingRowMembers:'Membres max',
pricingRowGroups:'Groupes',
pricingRowMessages:'Messages IA/mois',
pricingRowGifts:'Cadeaux IA',
pricingRowCards:'Cartes virtuelles',
pricingRowAdmins:'Admins de groupe',
pricingRowCSV:'Import CSV',
pricingRowWhiteLabel:'Marque blanche',
pricingRowAds:'Publicités',
pricingAdsYes:'Oui',
pricingAdsNo:'✗ Aucune',
pricingUnlimited:'Illimité',
planCTAbiz:'Essai 14 jours →',
```

- [ ] **Step 2 : Ajouter dans I18N.en**

```
pricingHeroTitle:'Choose your plan',
pricingHeroSub:'AI messages · Gifts · 140 countries · 7 languages',
pricingStatsPays:'Countries',
pricingStatsLangues:'Languages',
pricingStatsAI:'AI Personalised',
pricingRowMembers:'Max members',
pricingRowGroups:'Groups',
pricingRowMessages:'AI messages/month',
pricingRowGifts:'AI gift ideas',
pricingRowCards:'Virtual cards',
pricingRowAdmins:'Group admins',
pricingRowCSV:'CSV import',
pricingRowWhiteLabel:'White label',
pricingRowAds:'Ads',
pricingAdsYes:'Yes',
pricingAdsNo:'None',
pricingUnlimited:'Unlimited',
planCTAbiz:'14-day free trial',
```

- [ ] **Step 3 : Ajouter dans I18N.es**

```
pricingHeroTitle:'Elige tu plan',
pricingHeroSub:'Mensajes IA · Regalos · 140 países · 7 idiomas',
pricingStatsPays:'Países', pricingStatsLangues:'Idiomas', pricingStatsAI:'IA Personalizado',
pricingRowMembers:'Miembros máx.', pricingRowGroups:'Grupos', pricingRowMessages:'Mensajes IA/mes',
pricingRowGifts:'Ideas de regalo IA', pricingRowCards:'Tarjetas virtuales', pricingRowAdmins:'Admins del grupo',
pricingRowCSV:'Importación CSV', pricingRowWhiteLabel:'Marca blanca', pricingRowAds:'Publicidad',
pricingAdsYes:'Sí', pricingAdsNo:'Ninguna', pricingUnlimited:'Ilimitado',
planCTAbiz:'Prueba 14 días gratis',
```

- [ ] **Step 4 : Ajouter dans I18N.ar**

```
pricingHeroTitle:'اختر خطتك',
pricingHeroSub:'رسائل ذكاء اصطناعي · هدايا · 140 دولة · 7 لغات',
pricingStatsPays:'دولة', pricingStatsLangues:'لغات', pricingStatsAI:'ذكاء اصطناعي',
pricingRowMembers:'الحد الأقصى للأعضاء', pricingRowGroups:'المجموعات', pricingRowMessages:'رسائل/شهر',
pricingRowGifts:'أفكار هدايا', pricingRowCards:'بطاقات افتراضية', pricingRowAdmins:'مشرفو المجموعة',
pricingRowCSV:'استيراد CSV', pricingRowWhiteLabel:'العلامة البيضاء', pricingRowAds:'الإعلانات',
pricingAdsYes:'نعم', pricingAdsNo:'لا يوجد', pricingUnlimited:'غير محدود',
planCTAbiz:'تجربة 14 يومًا مجانًا',
```

- [ ] **Step 5 : Ajouter dans I18N.hi**

```
pricingHeroTitle:'अपनी योजना चुनें',
pricingHeroSub:'AI संदेश · उपहार · 140 देश · 7 भाषाएं',
pricingStatsPays:'देश', pricingStatsLangues:'भाषाएं', pricingStatsAI:'AI व्यक्तिगत',
pricingRowMembers:'अधिकतम सदस्य', pricingRowGroups:'समूह', pricingRowMessages:'AI संदेश/माह',
pricingRowGifts:'AI उपहार विचार', pricingRowCards:'वर्चुअल कार्ड', pricingRowAdmins:'समूह व्यवस्थापक',
pricingRowCSV:'CSV आयात', pricingRowWhiteLabel:'व्हाइट लेबल', pricingRowAds:'विज्ञापन',
pricingAdsYes:'हाँ', pricingAdsNo:'कोई नहीं', pricingUnlimited:'असीमित',
planCTAbiz:'14 दिन मुफ्त',
```

- [ ] **Step 6 : Ajouter dans I18N.zh**

```
pricingHeroTitle:'选择您的套餐',
pricingHeroSub:'AI消息 · 礼物 · 140个国家 · 7种语言',
pricingStatsPays:'国家', pricingStatsLangues:'语言', pricingStatsAI:'AI个性化',
pricingRowMembers:'最大成员数', pricingRowGroups:'群组', pricingRowMessages:'AI消息/月',
pricingRowGifts:'AI礼品创意', pricingRowCards:'虚拟卡', pricingRowAdmins:'群组管理员',
pricingRowCSV:'CSV导入', pricingRowWhiteLabel:'白标', pricingRowAds:'广告',
pricingAdsYes:'是', pricingAdsNo:'无广告', pricingUnlimited:'无限制',
planCTAbiz:'14天免费试用',
```

- [ ] **Step 7 : Ajouter dans I18N.pt**

```
pricingHeroTitle:'Escolha o seu plano',
pricingHeroSub:'Mensagens IA · Presentes · 140 países · 7 idiomas',
pricingStatsPays:'Países', pricingStatsLangues:'Idiomas', pricingStatsAI:'IA Personalizado',
pricingRowMembers:'Máx. membros', pricingRowGroups:'Grupos', pricingRowMessages:'Mensagens IA/mês',
pricingRowGifts:'Ideias de presentes IA', pricingRowCards:'Cartões virtuais', pricingRowAdmins:'Admins do grupo',
pricingRowCSV:'Importação CSV', pricingRowWhiteLabel:'Marca branca', pricingRowAds:'Publicidade',
pricingAdsYes:'Sim', pricingAdsNo:'Nenhuma', pricingUnlimited:'Ilimitado',
planCTAbiz:'Teste 14 dias grátis',
```

- [ ] **Step 8 : Vérifier syntaxe**

```bash
node --check js/i18n.js
```
Attendu : aucun output.

- [ ] **Step 9 : Commit**

```bash
git add js/i18n.js
git commit -m "feat(i18n): clés tableau pricing (7 langues)"
```

---

## Task 2 : CSS — Styles tableau pricing + desktop layout

**Files:** Modify `css/app.css`

Deux parties : A) styles pricing, B) desktop layout 3 colonnes.

### Partie A — Pricing

- [ ] **Step 1 : Remplacer le bloc @media(min-width:1024px) existant (lignes ~45-48)**

Repérer et remplacer :
```css
@media(min-width:1024px){
  body{display:flex;justify-content:center;align-items:flex-start;padding:48px 0;...}
  .wrap{max-width:430px;border-radius:32px;...}
}
```

Par :
```css
@media(min-width:1024px){
  body{background:linear-gradient(145deg,#FFF8F0 0%,#FFECD6 50%,#FFD8B4 100%);min-height:100vh}
  #app.scr.on{display:flex;flex-direction:row;min-height:100vh;width:100%;max-width:100%}
  #app .wrap{flex:1;display:flex;flex-direction:row;max-width:100%;border-radius:0;overflow:visible;max-height:none;box-shadow:none;width:100%}
  #app .scroll{flex:1;padding:16px 32px 24px;overflow-y:auto;height:100vh}
  .nav{display:none}
  .desktop-sidebar,.desktop-right-panel{display:flex}
  #land .wrap{max-width:980px;border-radius:0;box-shadow:none;margin:0 auto}
}
```

- [ ] **Step 2 : Ajouter les styles pricing et desktop à la fin de app.css**

```css
/* ── PRICING TABLE ── */
.pricing-wrap{padding:24px 16px 48px;max-width:960px;margin:0 auto}
.pricing-hero{text-align:center;padding:40px 16px 28px}
.pricing-hero h2{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;line-height:1.2;color:var(--txt);margin-bottom:8px}
.pricing-hero p{font-size:14px;color:var(--txt2);max-width:440px;margin:0 auto 16px;line-height:1.7}
.pricing-badge{display:inline-block;background:var(--b4l);color:var(--b4d);font-size:13px;font-weight:700;padding:7px 18px;border-radius:20px;border:1px solid var(--b4);margin-bottom:20px}
.pricing-stats{display:flex;justify-content:center;gap:28px;flex-wrap:wrap}
.pricing-stat-n{font-size:22px;font-weight:900;color:var(--b4);display:block}
.pricing-stat-l{font-size:11px;color:var(--txt2);font-weight:600}
.pricing-table-outer{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:16px;box-shadow:0 4px 32px rgba(45,27,20,.08)}
.pricing-table{width:100%;min-width:600px;border-collapse:separate;border-spacing:0;background:var(--card)}
.pricing-table thead th{padding:18px 14px;font-size:12px;font-weight:700;text-align:center;background:var(--bg2);vertical-align:bottom}
.pricing-th-feat{text-align:left!important;color:var(--txt2);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
.pricing-th-bloom{background:linear-gradient(160deg,#D4A843,#FF8C7A)!important;color:white;border-radius:12px 12px 0 0}
.pt-badge{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.75;display:block;margin-bottom:4px}
.pt-price{font-size:26px;font-weight:900;color:var(--txt);display:block;line-height:1}
.pricing-th-bloom .pt-price{color:white}
.pt-period{font-size:12px;color:var(--txt2)}
.pricing-th-bloom .pt-period{color:rgba(255,255,255,.75)}
.pricing-table tbody tr{border-bottom:1px solid var(--brd)}
.pricing-table tbody tr:last-child{border-bottom:none}
.pricing-table tbody td{padding:12px 14px;font-size:13px;text-align:center;color:var(--txt)}
.pricing-table tbody td:first-child{text-align:left;font-weight:600;color:var(--txt2)}
.pricing-table tbody .col-bloom{background:#fffbf0}
.pt-yes{color:#18A86B;font-weight:700;font-size:15px}
.pt-no{color:var(--brd2);font-size:15px}
.pt-val{font-weight:700;color:var(--txt)}
.pt-val-bloom{font-weight:700;color:#c08830;background:#fff5d9;border-radius:5px;padding:1px 7px;display:inline-block}
.pt-ads-yes{font-weight:700;color:var(--b2)}
.pricing-table tfoot td{padding:16px 14px;background:var(--bg2)}
.pricing-table tfoot .col-bloom{background:linear-gradient(160deg,#D4A843,#FF8C7A)}
.pt-cta{display:block;width:100%;padding:11px 8px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;text-align:center;transition:opacity .15s}
.pt-cta:hover{opacity:.85}
.pt-cta-free{background:var(--b3l);color:var(--b3d)}
.pt-cta-bloom{background:white;color:#c08830}
.pt-cta-biz{background:var(--bizl);color:var(--bizd)}
.pt-cta-ent{background:rgba(45,27,20,.08);color:var(--txt)}
.pricing-footer{text-align:center;font-size:12px;color:var(--txt2);padding:12px 0 32px}
@media(max-width:767px){
  .pricing-table-outer{overflow:visible;box-shadow:none}
  .pricing-table,.pricing-table thead,.pricing-table tbody,.pricing-table tfoot,.pricing-table tr,.pricing-table td,.pricing-table th{display:block}
  .pricing-table thead{display:none}
  .pricing-table tbody tr{background:var(--card);border-radius:16px;border:1.5px solid var(--brd);margin-bottom:12px;padding:0;box-shadow:var(--sh)}
  .pricing-table tbody tr.bloom-row{border-color:#D4A843;background:#fffbf0}
  .pricing-table tbody td{padding:10px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--brd)}
  .pricing-table tbody td:first-child{font-size:12px;color:var(--txt2);background:var(--bg2);border-radius:14px 14px 0 0}
  .pricing-table tfoot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
  .pricing-table tfoot td{border-radius:12px;background:var(--card);border:1.5px solid var(--brd)}
  .pricing-table tfoot .col-bloom{border-color:#D4A843}
}

/* ── DESKTOP SIDEBAR ── */
.desktop-sidebar{display:none;flex-direction:column;align-items:center;width:64px;flex-shrink:0;background:var(--txt);min-height:100vh;padding:12px 0;position:sticky;top:0;height:100vh;z-index:200}
.dsb-logo{margin-bottom:20px;padding:8px}
.dsb-logo-wrap{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--b4),#5B4FBB);display:flex;align-items:center;justify-content:center}
.dsb-logo-wrap svg{fill:white;stroke:white}
.dsb-nav{display:flex;flex-direction:column;gap:4px;flex:1;width:100%;padding:0 8px}
.dsb-btn{width:100%;aspect-ratio:1;border:none;background:transparent;border-radius:10px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.35);cursor:pointer;transition:all .18s}
.dsb-btn:hover{background:rgba(212,168,67,.12);color:rgba(255,255,255,.7)}
.dsb-btn.on{background:var(--b1l);color:var(--b1)}
.dsb-avatar{width:36px;height:36px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;cursor:pointer;margin:8px auto 12px;overflow:hidden;font-size:13px;color:white;font-weight:800;border:2px solid rgba(255,255,255,.15)}
.dsb-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}

/* ── DESKTOP RIGHT PANEL ── */
.desktop-right-panel{display:none;flex-direction:column;width:280px;flex-shrink:0;background:var(--card);border-left:1px solid var(--brd);min-height:100vh;overflow-y:auto;padding:20px 16px;position:sticky;top:0;height:100vh}
.drp-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt2);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--brd)}
.drp-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--brd)}
.drp-item:last-child{border-bottom:none}
.drp-av{width:32px;height:32px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:800;flex-shrink:0;overflow:hidden}
.drp-av img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.drp-name{font-size:13px;font-weight:600;color:var(--txt);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.drp-date{font-size:11px;color:var(--txt2)}
.drp-shortcut{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--brd);font-size:13px}
.drp-shortcut:last-child{border-bottom:none}
.drp-sc-label{color:var(--txt2);font-weight:600}
.drp-sc-val{font-weight:700;color:var(--txt)}
.drp-sc-btn{background:var(--b4l);color:var(--b4d);border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer}
```

- [ ] **Step 3 : Vérifier**

```bash
node -e "require('fs').readFileSync('css/app.css','utf8')" && echo "OK"
```
Attendu : `OK`

- [ ] **Step 4 : Commit**

```bash
git add css/app.css
git commit -m "feat(css): tableau pricing + desktop layout 3 colonnes"
```

---

## Task 3 : JS core.js — renderPricingTable()

**Files:** Modify `js/core.js`

- [ ] **Step 1 : Trouver `function renderAllPlans(mode)` dans core.js et remplacer toute la fonction**

La fonction actuelle commence à `function renderAllPlans(mode){` et se termine à la ligne contenant `el.innerHTML=html;` suivi de `}`. Remplacer tout ce bloc par :

```js
function renderPricingTable(){
  var el=document.getElementById('pricing-table-container');if(!el)return;
  var rows=[
    {key:'pricingRowMembers', s:'10', bl:t('pricingUnlimited'), bz:'50', en:t('pricingUnlimited')},
    {key:'pricingRowGroups',  s:'1',  bl:'5', bz:t('pricingUnlimited'), en:t('pricingUnlimited')},
    {key:'pricingRowMessages',s:'5',  bl:t('pricingUnlimited'), bz:t('pricingUnlimited'), en:t('pricingUnlimited')},
    {key:'pricingRowGifts',   s:'no', bl:'yes', bz:'yes', en:'yes'},
    {key:'pricingRowCards',   s:'no', bl:'yes', bz:'yes', en:'yes'},
    {key:'pricingRowAdmins',  s:'no', bl:'2',   bz:'5',   en:t('pricingUnlimited')},
    {key:'pricingRowCSV',     s:'no', bl:'no',  bz:'yes', en:'yes'},
    {key:'pricingRowWhiteLabel',s:'no',bl:'no', bz:'no',  en:'yes'},
    {key:'pricingRowAds',     s:'ads',bl:'noads',bz:'noads',en:'noads'},
  ];
  function cellVal(v){
    if(v==='yes') return '<span class="pt-yes">✓</span>';
    if(v==='no')  return '<span class="pt-no">✗</span>';
    if(v==='ads') return '<span class="pt-ads-yes">'+t('pricingAdsYes')+'</span>';
    if(v==='noads') return '<span class="pt-yes">'+t('pricingAdsNo')+'</span>';
    return '<span class="pt-val">'+v+'</span>';
  }
  function cellBloom(v){
    if(v==='yes') return '<span class="pt-yes">✓</span>';
    if(v==='no')  return '<span class="pt-no">✗</span>';
    if(v==='noads') return '<span class="pt-yes">'+t('pricingAdsNo')+'</span>';
    return '<span class="pt-val-bloom">'+v+'</span>';
  }
  var bodyRows='';
  rows.forEach(function(r){
    bodyRows+='<tr>'
      +'<td>'+t(r.key)+'</td>'
      +'<td>'+cellVal(r.s)+'</td>'
      +'<td class="col-bloom">'+cellBloom(r.bl)+'</td>'
      +'<td>'+cellVal(r.bz)+'</td>'
      +'<td>'+cellVal(r.en)+'</td>'
      +'</tr>';
  });
  var hero='<div class="pricing-hero">'
    +'<h2>'+t('pricingHeroTitle')+'</h2>'
    +'<p>'+t('pricingHeroSub')+'</p>'
    +'<div class="pricing-badge">🌸 7 jours gratuits · Sans carte bancaire</div>'
    +'<div class="pricing-stats">'
    +'<div><span class="pricing-stat-n">140</span><span class="pricing-stat-l">'+t('pricingStatsPays')+'</span></div>'
    +'<div><span class="pricing-stat-n">7</span><span class="pricing-stat-l">'+t('pricingStatsLangues')+'</span></div>'
    +'<div><span class="pricing-stat-n">IA</span><span class="pricing-stat-l">'+t('pricingStatsAI')+'</span></div>'
    +'</div></div>';
  var thead='<thead><tr>'
    +'<th class="pricing-th-feat"></th>'
    +'<th><span class="pt-badge">Starter</span><span class="pt-price">0€</span><span class="pt-period">'+t('planForever')+'</span></th>'
    +'<th class="pricing-th-bloom"><span class="pt-badge">⭐ Bloom</span><span class="pt-price">4,99€</span><span class="pt-period">'+t('perMonth')+'</span></th>'
    +'<th><span class="pt-badge">🏢 Business</span><span class="pt-price">19,99€</span><span class="pt-period">'+t('perMonth')+'</span></th>'
    +'<th><span class="pt-badge">Enterprise</span><span class="pt-price">'+t('planPriceOnRequest')+'</span><span class="pt-period"></span></th>'
    +'</tr></thead>';
  var tfoot='<tfoot><tr>'
    +'<td></td>'
    +'<td><button class="pt-cta pt-cta-free" onclick="startFromBtn(this)" data-plan="free" data-mode="perso">'+t('planCTAfree')+'</button></td>'
    +'<td class="col-bloom"><button class="pt-cta pt-cta-bloom" onclick="openPaymentFromBtn(this)" data-plan="bloom">'+t('planCTAtry')+'</button></td>'
    +'<td><button class="pt-cta pt-cta-biz" onclick="openPaymentFromBtn(this)" data-plan="pro">'+t('planCTAbiz')+'</button></td>'
    +'<td><button class="pt-cta pt-cta-ent" onclick="openPaymentFromBtn(this)" data-plan="enterprise">'+t('planCTAcontact')+'</button></td>'
    +'</tr></tfoot>';
  el.innerHTML=hero
    +'<div class="pricing-table-outer">'
    +'<table class="pricing-table">'+thead+'<tbody>'+bodyRows+'</tbody>'+tfoot+'</table>'
    +'</div>'
    +'<div class="pricing-footer" data-i18n="securePayment">🔒 RGPD · Paiement sécurisé · Annulation à tout moment</div>';
}

function renderAllPlans(mode){
  renderPricingTable();
}
```

- [ ] **Step 2 : Vérifier syntaxe**

```bash
node --check js/core.js
```
Attendu : aucun output.

- [ ] **Step 3 : Commit**

```bash
git add js/core.js
git commit -m "feat(pricing): renderPricingTable() tableau comparatif 4 colonnes"
```

---

## Task 4 : HTML — Section pricing dans index.html

**Files:** Modify `index.html`

- [ ] **Step 1 : Supprimer la div `.mtgl` (onglets Particulier/Entreprise) dans le hero**

Chercher et supprimer ce bloc :
```html
<div class="mtgl">
  <button class="mbt on" id="lbp" onclick="selMode('perso')" ...>👤 Particulier</button>
  <button class="mbt" id="lbb" onclick="selMode('biz')" ...>🏢 Entreprise</button>
</div>
```

- [ ] **Step 2 : Remplacer les divs #lperso et #lbiz**

Supprimer tout le contenu entre les commentaires `<!-- PERSO -->` et la fin de `<!-- BIZ -->` (les deux divs `<div id="lperso"` et `<div id="lbiz"` avec leur contenu).

À la place, insérer :

```html
<div id="pricing-table-container" class="pricing-wrap"></div>
<div style="padding:0 16px">
<div style="font-family:var(--ff-title);font-size:20px;font-weight:700;margin-bottom:14px" data-i18n="reviewsTitle">Ils ont fleuri avec Bloomday</div>
<div class="tstc"><p data-i18n="review1q">Bloomday a changé la dynamique de notre groupe.</p><div class="tstc-a" data-i18n="review1a">Marie L. — Responsable d'association</div></div>
<div class="tstc"><p data-i18n="review2q">80 collaborateurs gérés sans effort. Les messages IA sont parfaitement adaptés.</p><div class="tstc-a" data-i18n="review2a">Thomas B. — DRH, agence de communication</div></div>
<div class="tstc"><p data-i18n="review3q">Ambassador Bronze depuis 3 mois. Déjà 2 mois gratuits !</p><div class="tstc-a" data-i18n="review3a">Karim M. — Ambassador Bloomday</div></div>
<div style="text-align:center;font-size:12px;color:var(--txt2);padding-bottom:30px;margin-top:10px" data-i18n="securePayment">🔒 RGPD · Paiement sécurisé · Annulation à tout moment</div>
</div>
```

- [ ] **Step 3 : Mettre à jour render.js — remplacer les 2 lignes renderAllPlans**

Chercher dans `js/render.js` :
```js
if(document.getElementById('plan-cards-perso')) renderAllPlans('perso');
if(document.getElementById('plan-cards-biz')) renderAllPlans('biz');
```
Remplacer par :
```js
if(document.getElementById('pricing-table-container')) renderPricingTable();
```

- [ ] **Step 4 : Mettre à jour features.js — 3 occurrences renderAllPlans**

Occurrence 1 (deux lignes consécutives) :
```js
renderAllPlans('perso');
renderAllPlans('biz');
```
→ Remplacer par `renderPricingTable();`

Occurrence 2 (une ligne seule) :
```js
renderAllPlans(m);
```
→ Remplacer par `renderPricingTable();`

- [ ] **Step 5 : Vérifier syntaxes**

```bash
node --check js/render.js && node --check js/features.js && echo "OK"
```
Attendu : `OK`

- [ ] **Step 6 : Test manuel — page pricing**

Ouvrir `index.html` dans le navigateur. Vérifier :
- Tableau comparatif 4 colonnes visible sur la landing page
- Colonne Bloom fond doré
- Bouton "Commencer gratuitement" → lance l'onboarding (startFromBtn)
- Sur mobile (< 768px) : cards empilées au lieu du tableau

- [ ] **Step 7 : Commit**

```bash
git add index.html js/render.js js/features.js
git commit -m "feat(pricing): tableau dans #land, suppression onglets perso/biz"
```

---

## Task 5 : HTML — Éléments desktop dans #app

**Files:** Modify `index.html`

- [ ] **Step 1 : Ajouter .desktop-sidebar dans #app juste avant .topbar**

Trouver dans `index.html` :
```html
<div id="app" class="scr">
<div class="wrap" style="display:flex;flex-direction:column;min-height:100vh;width:100%">

<div class="topbar">
```

Insérer entre `<div class="wrap"...>` et `<div class="topbar">` :

```html
<div class="desktop-sidebar" id="desktop-sidebar">
  <div class="dsb-logo"><div class="dsb-logo-wrap"><svg width="22" height="22"><use href="#bi"/></svg></div></div>
  <nav class="dsb-nav">
    <button class="dsb-btn on" id="dsb0" onclick="showSec('home',0)" title="Accueil">
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><rect x="3" y="10" width="16" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M1 11L11 3l10 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
    <button class="dsb-btn" id="dsb1" onclick="showSec('members',1)" title="Membres">
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><circle cx="8" cy="7" r="3.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 19c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
    <button class="dsb-btn" id="dsb2" onclick="showSec('add',2)" title="Ajouter">
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><circle cx="11" cy="11" r="8.5" stroke="currentColor" stroke-width="1.4"/><path d="M11 7v8M7 11h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
    <button class="dsb-btn" id="dsb3" onclick="showSec('events',3)" title="Fêtes">
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><path d="M11 3C7.686 3 5 5.686 5 9c0 5 6 10 6 10s6-5 6-10c0-3.314-2.686-6-6-6z" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="9" r="2" stroke="currentColor" stroke-width="1.4"/></svg>
    </button>
    <button class="dsb-btn" id="dsb4" onclick="showSec('more',4)" title="Profil">
      <svg viewBox="0 0 22 22" fill="none" width="22" height="22"><circle cx="11" cy="8" r="4" stroke="currentColor" stroke-width="1.4"/><path d="M3 19c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
  </nav>
  <div class="dsb-avatar" id="dsb-avatar" onclick="showSec('more',4)">🌸</div>
</div>
```

- [ ] **Step 2 : Ajouter .desktop-right-panel avant .nav**

Chercher `<div class="nav">` (la barre de navigation du bas) et insérer juste avant :

```html
<div class="desktop-right-panel" id="desktop-right-panel"></div>
```

- [ ] **Step 3 : Commit**

```bash
git add index.html
git commit -m "feat(desktop): sidebar et right panel dans le DOM"
```

---

## Task 6 : JS render.js — renderDesktopRightPanel()

**Files:** Modify `js/render.js`

Ajouter à la fin de render.js.

- [ ] **Step 1 : Ajouter renderDesktopRightPanel() à la fin de render.js**

```js
function renderDesktopRightPanel(section){
  var el=document.getElementById('desktop-right-panel');
  if(!el)return;
  var today=new Date();
  var mm=mems();
  var html='';

  if(section==='home'||section==='cal'){
    var upcoming=mm.map(function(p){
      var yr=today.getFullYear();
      var d=new Date(yr,p.month-1,p.day);
      if(d<today)d=new Date(yr+1,p.month-1,p.day);
      var diff=Math.round((d-today)/(864e5));
      return{p:p,diff:diff};
    }).filter(function(x){return x.diff<=60;})
      .sort(function(a,b){return a.diff-b.diff;})
      .slice(0,7);
    html+='<div class="drp-title">🎂 À venir</div>';
    if(!upcoming.length){
      html+='<p style="font-size:13px;color:var(--txt2);padding:12px 0">Aucune célébration dans les 60 prochains jours.</p>';
    } else {
      upcoming.forEach(function(x){
        var ini=(x.p.name||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
        var lbl=x.diff===0?'Aujourd\'hui 🎉':x.diff===1?'Demain':'Dans '+x.diff+' j.';
        var av=x.p.photo?'<img src="'+x.p.photo+'" alt="">':ini;
        html+='<div class="drp-item"><div class="drp-av">'+av+'</div>'
          +'<div style="flex:1;min-width:0"><div class="drp-name">'+esc(x.p.name)+'</div><div class="drp-date">'+lbl+'</div></div></div>';
      });
    }

  } else if(section==='members'){
    var g=groups&&groups.find(function(x){return x.id===curG;});
    var gname=g?(g.isDefault?t('myGroup'):g.name):'Groupe';
    html+='<div class="drp-title">👥 '+esc(gname)+'</div>';
    if(!mm.length){
      html+='<p style="font-size:13px;color:var(--txt2);padding:12px 0">Aucun membre dans ce groupe.</p>';
    } else {
      mm.slice(0,8).forEach(function(p){
        var ini=(p.name||'?').split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2).toUpperCase();
        var d=new Date(today.getFullYear(),p.month-1,p.day);
        if(d<today)d=new Date(today.getFullYear()+1,p.month-1,p.day);
        var diff=Math.round((d-today)/(864e5));
        var lbl=diff===0?'Aujourd\'hui !':diff===1?'Demain':'Dans '+diff+' j.';
        var av=p.photo?'<img src="'+p.photo+'" alt="">':ini;
        html+='<div class="drp-item"><div class="drp-av">'+av+'</div>'
          +'<div style="flex:1;min-width:0"><div class="drp-name">'+esc(p.name)+'</div><div class="drp-date">'+lbl+'</div></div></div>';
      });
    }

  } else if(section==='more'){
    var pname=PLANS[plan]?PLANS[plan].name:'Starter';
    html+='<div class="drp-title">⚙️ Mon compte</div>'
      +'<div class="drp-shortcut"><span class="drp-sc-label">Forfait</span><span class="drp-sc-val">'+esc(pname)+'</span></div>'
      +'<div class="drp-shortcut"><span class="drp-sc-label">Membres</span><span class="drp-sc-val">'+mm.length+'/'+PL().mm+'</span></div>'
      +'<div style="margin-top:16px;display:flex;flex-direction:column;gap:8px">'
      +'<button class="drp-sc-btn" style="width:100%;padding:10px" onclick="goLand()">✨ Changer de forfait</button>'
      +'<button class="drp-sc-btn" style="width:100%;padding:10px;background:var(--b2l);color:var(--b2d)" onclick="doLogoutSupabase()">Déconnexion</button>'
      +'</div>';

  } else {
    html+='<div class="drp-title">Bloomday 🌸</div>'
      +'<p style="font-size:13px;color:var(--txt2);line-height:1.7;padding:8px 0">Gérez vos célébrations, ne ratez plus jamais un anniversaire.</p>';
  }

  el.innerHTML='<div style="animation:fi .2s ease">'+html+'</div>';
}
```

- [ ] **Step 2 : Vérifier syntaxe**

```bash
node --check js/render.js
```
Attendu : aucun output.

- [ ] **Step 3 : Commit**

```bash
git add js/render.js
git commit -m "feat(desktop): renderDesktopRightPanel() contenu contextuel"
```

---

## Task 7 : JS core.js — showSec() enrichi + avatar sidebar

**Files:** Modify `js/core.js`

- [ ] **Step 1 : Remplacer showSec() dans core.js**

Chercher `function showSec(name,idx){` et remplacer toute la fonction par :

```js
function showSec(name,idx){
  ['home','members','add','events','cal','more'].forEach(s=>{const e=document.getElementById('s-'+s);if(e)e.style.display=s===name?'block':'none';});
  document.querySelectorAll('.nb').forEach((b,i)=>{b.classList.toggle('on',i===idx);});
  for(var di=0;di<5;di++){var sb=document.getElementById('dsb'+di);if(sb)sb.classList.toggle('on',di===idx);}
  const ms=document.getElementById('mscroll');if(ms)ms.scrollTo(0,0);
  if(name==='home')rHome();
  if(name==='events')rEvents();
  if(name==='cal')rCal();
  if(name==='more')rMore();
  if(name==='members')rMembers();
  if(typeof renderDesktopRightPanel==='function')renderDesktopRightPanel(name);
}
```

- [ ] **Step 2 : Ajouter la mise à jour de l'avatar sidebar dans startApp()**

Dans la fonction `startApp(m,p)`, après la ligne `load().then(function(){...})`, ajouter une IIFE qui met à jour l'avatar de la sidebar. Trouver la fin du bloc `startApp` et ajouter juste avant la fermeture `}` :

```js
  (function(){
    var av=document.getElementById('dsb-avatar');
    if(!av)return;
    var u=null;try{u=JSON.parse(localStorage.getItem('bdg16_user'));}catch(e){}
    if(u&&u.photo){av.innerHTML='<img src="'+u.photo+'" alt="">';}
    else if(u&&u.name){av.textContent=(u.name.split(' ').map(function(w){return w[0]||'';}).join('').slice(0,2)||'🌸').toUpperCase();}
  })();
```

- [ ] **Step 3 : Vérifier syntaxe**

```bash
node --check js/core.js
```
Attendu : aucun output.

- [ ] **Step 4 : Test manuel desktop (≥ 1024px)**

Redimensionner le navigateur à > 1024px. Vérifier :
- Sidebar sombre à gauche, 5 icônes
- Clic sur une icône : icône devient active (dorée), contenu change, panneau droit se met à jour
- Panneau droit "À venir" sur l'accueil
- Panneau droit "Mon compte" sur Profil
- Retour mobile (< 1024px) : sidebar disparaît, bottom nav revient

- [ ] **Step 5 : Commit**

```bash
git add js/core.js
git commit -m "feat(desktop): showSec() avec sidebar active state + renderDesktopRightPanel"
```

---

## Task 8 : Push et vérification finale

- [ ] **Step 1 : Vérifier tous les fichiers**

```bash
node --check js/core.js && node --check js/render.js && node --check js/features.js && node --check js/i18n.js && echo "Tous OK"
```
Attendu : `Tous OK`

- [ ] **Step 2 : Critères d'acceptance**

```
[ ] Desktop >= 1024px : sidebar + panneau droit visibles, bottom nav cachée
[ ] Mobile < 1024px : aucun changement vs avant
[ ] Icône sidebar active (dorée) suit les changements de vue
[ ] Panneau droit change de contenu selon la vue
[ ] Pricing : tableau 4 colonnes, colonne Bloom dorée
[ ] Pricing mobile : cartes empilées lisibles
[ ] Strings traduits en EN et ES (vérifier en changeant la langue dans l'app)
```

- [ ] **Step 3 : Push**

```bash
git push origin main
```
