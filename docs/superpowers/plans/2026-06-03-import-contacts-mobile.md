# Import Contacts Mobile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Améliorer l'import de contacts téléphone : CTA dynamique sur la liste principale, bottom sheet avec explication + choix unitaire/en masse, et écran récap post-import pour compléter les dates manquantes.

**Architecture:** La Contact Picker API est déjà détectée dans `core.js`. On refactorise `importFromContacts()` en `openImportSheet()` qui ouvre un bottom sheet avec deux options. L'option A préremplit le formulaire existant ; l'option B fait un import en masse et affiche un écran récap temporaire. La liste principale (`rMembers()`) affiche dynamiquement un CTA proéminent (0 contacts) ou un bouton discret (≥1 contact).

**Tech Stack:** Vanilla JS ES6+, HTML5, CSS custom, Contact Picker API (`navigator.contacts`). Pas de framework de test — validation via `node --check js/<file>.js` + test manuel.

---

### Task 1 : Clés i18n pour l'import

**Files:**
- Modify: `js/i18n.js`

- [ ] **Étape 1 : Ajouter les clés en français (bloc `fr:`)**

Trouver la ligne contenant `contactImported:'✓ Contact importé !'` et ajouter juste après :

```js
importChoiceTitle:'Importer un contact',importChoiceHint:'Sélectionnez un contact précis ou importez-en plusieurs — vous compléterez les dates manquantes ensuite.',importChoiceSingle:'Choisir un contact',importChoiceSingleSub:'Sélectionner dans mes contacts et compléter sa fiche',importChoiceMultiple:'Importer plusieurs contacts',importChoiceMultipleSub:'Sélection multiple, puis compléter les anniversaires après',importRecapBanner:'contacts importés · avec une date manquante — complétez-les pour recevoir leurs rappels.',importDateMissing:'Date manquante',importComplete:'Compléter',importFinish:'Terminer',importCancelBtn:'Annuler',
```

- [ ] **Étape 2 : Ajouter les mêmes clés en anglais (bloc `en:`)**

Trouver `contactImported:'✓ Contact imported!'` et ajouter juste après :

```js
importChoiceTitle:'Import a contact',importChoiceHint:'Select one contact or import several at once — you can fill in missing dates afterwards.',importChoiceSingle:'Choose a contact',importChoiceSingleSub:'Select from my contacts and complete their profile',importChoiceMultiple:'Import multiple contacts',importChoiceMultipleSub:'Multi-select, then fill in birthdays afterwards',importRecapBanner:'contacts imported · with a missing date — complete them to receive reminders.',importDateMissing:'Missing date',importComplete:'Complete',importFinish:'Done',importCancelBtn:'Cancel',
```

- [ ] **Étape 3 : Ajouter les clés en espagnol (bloc `es:`)**

Trouver `contactImported:'✓ Contacto importado!'` et ajouter juste après :

```js
importChoiceTitle:'Importar un contacto',importChoiceHint:'Seleccione un contacto o importe varios a la vez — podrá completar las fechas faltantes después.',importChoiceSingle:'Elegir un contacto',importChoiceSingleSub:'Seleccionar de mis contactos y completar su ficha',importChoiceMultiple:'Importar varios contactos',importChoiceMultipleSub:'Selección múltiple, luego completar cumpleaños',importRecapBanner:'contactos importados · con fecha faltante — complétalos para recibir recordatorios.',importDateMissing:'Fecha faltante',importComplete:'Completar',importFinish:'Listo',importCancelBtn:'Cancelar',
```

- [ ] **Étape 4 : Ajouter les clés en arabe (bloc `ar:`)**

Trouver `contactImported:'✓ تم استيراد جهة الاتصال!'` et ajouter juste après :

```js
importChoiceTitle:'استيراد جهة اتصال',importChoiceHint:'اختر جهة اتصال واحدة أو استورد عدة جهات دفعة واحدة — يمكنك إكمال التواريخ الناقصة لاحقاً.',importChoiceSingle:'اختيار جهة اتصال',importChoiceSingleSub:'الاختيار من جهات اتصالي وملء بياناتها',importChoiceMultiple:'استيراد جهات اتصال متعددة',importChoiceMultipleSub:'تحديد متعدد ثم إكمال أعياد الميلاد لاحقاً',importRecapBanner:'جهات اتصال مستوردة · بتاريخ مفقود — أكملها لتلقي التذكيرات.',importDateMissing:'تاريخ مفقود',importComplete:'إكمال',importFinish:'تم',importCancelBtn:'إلغاء',
```

- [ ] **Étape 5 : Ajouter les clés en hindi (bloc `hi:`)**

Trouver `contactImported:'✓ संपर्क आयात हुआ!'` et ajouter juste après :

```js
importChoiceTitle:'संपर्क आयात करें',importChoiceHint:'एक संपर्क चुनें या एक साथ कई आयात करें — बाद में छूटी हुई तारीखें भर सकते हैं।',importChoiceSingle:'एक संपर्क चुनें',importChoiceSingleSub:'मेरे संपर्कों से चुनें और उनकी फाइल भरें',importChoiceMultiple:'कई संपर्क आयात करें',importChoiceMultipleSub:'एकाधिक चयन, फिर जन्मदिन बाद में भरें',importRecapBanner:'संपर्क आयात हुए · तारीख गायब है — याद दिलाने के लिए उन्हें पूरा करें।',importDateMissing:'तारीख गायब',importComplete:'पूरा करें',importFinish:'समाप्त',importCancelBtn:'रद्द करें',
```

- [ ] **Étape 6 : Ajouter les clés en chinois (bloc `zh:`)**

Trouver `contactImported:'✓ 联系人已导入！'` et ajouter juste après :

```js
importChoiceTitle:'导入联系人',importChoiceHint:'选择一个联系人或一次导入多个 — 您可以之后补充缺失的日期。',importChoiceSingle:'选择联系人',importChoiceSingleSub:'从我的联系人中选择并填写信息',importChoiceMultiple:'导入多个联系人',importChoiceMultipleSub:'多选后再补充生日',importRecapBanner:'个联系人已导入 · 缺少日期 — 请补充以接收提醒。',importDateMissing:'日期缺失',importComplete:'完善',importFinish:'完成',importCancelBtn:'取消',
```

- [ ] **Étape 7 : Ajouter les clés en portugais (bloc `pt:`)**

Trouver `contactImported:'✓ Contato importado!'` et ajouter juste après :

```js
importChoiceTitle:'Importar um contato',importChoiceHint:'Selecione um contato ou importe vários de uma vez — você pode preencher as datas ausentes depois.',importChoiceSingle:'Escolher um contato',importChoiceSingleSub:'Selecionar dos meus contatos e preencher o perfil',importChoiceMultiple:'Importar vários contatos',importChoiceMultipleSub:'Seleção múltipla e preencher aniversários depois',importRecapBanner:'contatos importados · com data ausente — complete-os para receber lembretes.',importDateMissing:'Data ausente',importComplete:'Completar',importFinish:'Concluir',importCancelBtn:'Cancelar',
```

- [ ] **Étape 8 : Vérifier la syntaxe**

```bash
node --check js/i18n.js
```

Résultat attendu : aucune sortie (pas d'erreur).

- [ ] **Étape 9 : Commit**

```bash
git add js/i18n.js
git commit -m "feat(import): i18n keys for contact import bottom sheet"
```

---

### Task 2 : Bottom sheet HTML dans index.html

**Files:**
- Modify: `index.html`
- Modify: `css/app.css`

- [ ] **Étape 1 : Ajouter le bottom sheet juste avant `</body>`**

Trouver la balise `</body>` dans `index.html` et ajouter avant :

```html
<!-- ── IMPORT CONTACTS BOTTOM SHEET ── -->
<div id="import-sheet-overlay" style="display:none;position:fixed;inset:0;background:rgba(45,27,20,.35);z-index:200" onclick="closeImportSheet()"></div>
<div id="import-sheet" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:440px;background:var(--card);border-radius:20px 20px 0 0;z-index:201;padding:0 16px 32px">
  <div style="width:36px;height:3px;background:var(--brd2);border-radius:2px;margin:12px auto 16px"></div>
  <div style="font-family:'Playfair Display',serif;font-size:17px;font-weight:800;color:var(--txt);margin-bottom:6px" data-i18n="importChoiceTitle">Importer un contact</div>
  <div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--brd)" data-i18n="importChoiceHint">Sélectionnez un contact précis ou importez-en plusieurs.</div>
  <div id="import-sheet-opt-single" onclick="importSingleContact()" style="border:1.5px solid var(--b1);background:var(--b1l);border-radius:12px;padding:12px 14px;margin-bottom:8px;cursor:pointer;display:flex;align-items:center;gap:12px">
    <div style="width:36px;height:36px;border-radius:8px;background:var(--b1l);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">👤</div>
    <div>
      <div style="font-size:14px;font-weight:700;color:var(--txt)" data-i18n="importChoiceSingle">Choisir un contact</div>
      <div style="font-size:12px;color:var(--txt2);margin-top:2px" data-i18n="importChoiceSingleSub">Sélectionner dans mes contacts et compléter sa fiche</div>
    </div>
    <div style="margin-left:auto;color:var(--txt3);font-size:18px">›</div>
  </div>
  <div id="import-sheet-opt-multi" onclick="importMultipleContacts()" style="border:1.5px solid var(--brd);background:var(--card);border-radius:12px;padding:12px 14px;margin-bottom:16px;cursor:pointer;display:flex;align-items:center;gap:12px">
    <div style="width:36px;height:36px;border-radius:8px;background:var(--b4l);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">👥</div>
    <div>
      <div style="font-size:14px;font-weight:700;color:var(--txt)" data-i18n="importChoiceMultiple">Importer plusieurs contacts</div>
      <div style="font-size:12px;color:var(--txt2);margin-top:2px" data-i18n="importChoiceMultipleSub">Sélection multiple, puis compléter les anniversaires après</div>
    </div>
    <div style="margin-left:auto;color:var(--txt3);font-size:18px">›</div>
  </div>
  <button onclick="closeImportSheet()" style="width:100%;padding:10px;background:transparent;border:none;font-size:13px;color:var(--txt2);cursor:pointer;font-family:inherit" data-i18n="importCancelBtn">Annuler</button>
</div>

<!-- ── IMPORT RECAP SCREEN ── -->
<div id="import-recap-overlay" style="display:none;position:fixed;inset:0;background:var(--bg);z-index:202;overflow-y:auto;padding:20px 16px 40px">
  <div style="max-width:440px;margin:0 auto">
    <div id="import-recap-banner" style="background:var(--b1l);border:1px solid var(--b1);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--b1d);line-height:1.5;margin-bottom:14px"></div>
    <div id="import-recap-list"></div>
    <button onclick="closeImportRecap()" style="width:100%;padding:12px;border:none;border-radius:12px;background:var(--grad);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;margin-top:12px" data-i18n="importFinish">Terminer</button>
  </div>
</div>
```

- [ ] **Étape 2 : Commit**

```bash
git add index.html
git commit -m "feat(import): add import bottom sheet and recap overlay HTML"
```

---

### Task 3 : Fonctions d'ouverture/fermeture du bottom sheet

**Files:**
- Modify: `js/core.js`

- [ ] **Étape 1 : Remplacer la fonction `importFromContacts()` dans `core.js`**

Remplacer tout le bloc (lignes 421–447) par :

```js
function openImportSheet(){
  if(!('contacts' in navigator&&'ContactsManager' in window))return;
  var ov=document.getElementById('import-sheet-overlay');
  var sh=document.getElementById('import-sheet');
  if(ov)ov.style.display='block';
  if(sh)sh.style.display='block';
  applyI18n();
}
function closeImportSheet(){
  var ov=document.getElementById('import-sheet-overlay');
  var sh=document.getElementById('import-sheet');
  if(ov)ov.style.display='none';
  if(sh)sh.style.display='none';
}
async function importSingleContact(){
  closeImportSheet();
  try{
    var res=await navigator.contacts.select(['name','tel','birthday'],{multiple:false});
    if(!res||!res.length)return;
    var c=res[0];
    var name=(c.name&&c.name[0])||'';
    var phone=(c.tel&&c.tel[0])||'';
    var bday=c.birthday;
    if(name)document.getElementById('inp-name').value=name;
    if(phone)document.getElementById('inp-phone').value=phone;
    if(bday){
      var d=new Date(bday);
      if(!isNaN(d.getTime())){
        document.getElementById('inp-day').value=d.getDate();
        document.getElementById('inp-month').value=d.getMonth()+1;
        if(d.getFullYear()>1900)document.getElementById('inp-year').value=d.getFullYear();
      }
    }
    showSec('add',1);
    showToast(t('contactImported'));
  }catch(e){}
}
async function importMultipleContacts(){
  closeImportSheet();
  try{
    var res=await navigator.contacts.select(['name','tel','birthday'],{multiple:true});
    if(!res||!res.length)return;
    var m=mems();
    var pl=PL();
    var added=[],skipped=0;
    res.forEach(function(c){
      if(m.length+added.length>=pl.mm){skipped++;return;}
      var name=(c.name&&c.name[0])||'';
      if(!name)return;
      var phone=(c.tel&&c.tel[0])||'';
      var bday=c.birthday;
      var day=null,month=null,year=null,incomplete=true;
      if(bday){
        var d=new Date(bday);
        if(!isNaN(d.getTime())){
          day=d.getDate();month=d.getMonth()+1;
          year=d.getFullYear()>1900?d.getFullYear():null;
          incomplete=false;
        }
      }
      added.push({id:Date.now()+added.length,day,month,year,name,phone,note:'',photo:'',type:'birthday',gender:'',incomplete:incomplete||undefined});
    });
    if(!added.length)return;
    added.forEach(function(p){m.push(p);});
    m.sort(function(a,b){
      if(!a.month&&!b.month)return 0;
      if(!a.month)return 1;
      if(!b.month)return -1;
      return a.month-b.month||a.day-b.day;
    });
    setMems(m);saveG();refresh();
    showImportRecap(added);
  }catch(e){}
}
if('contacts' in navigator&&'ContactsManager' in window){
  var _bcb=document.getElementById('btn-import-contacts');
  if(_bcb){_bcb.style.display='block';_bcb.onclick=openImportSheet;}
}
```

- [ ] **Étape 2 : Vérifier la syntaxe**

```bash
node --check js/core.js
```

Résultat attendu : aucune sortie.

- [ ] **Étape 3 : Commit**

```bash
git add js/core.js
git commit -m "feat(import): openImportSheet, importSingleContact, importMultipleContacts"
```

---

### Task 4 : Écran récap post-import

**Files:**
- Modify: `js/render.js`

- [ ] **Étape 1 : Ajouter `showImportRecap()` et `closeImportRecap()` à la fin de `render.js`**

```js
function showImportRecap(added){
  var ov=document.getElementById('import-recap-overlay');
  if(!ov)return;
  var missing=added.filter(function(p){return p.incomplete;});
  var banner=document.getElementById('import-recap-banner');
  if(banner){
    var txt=added.length+' '+t('importRecapBanner');
    if(missing.length>0)txt=added.length+' '+t('importRecapBanner').replace('·',missing.length+' ·');
    else txt=added.length+' contacts importés.';
    banner.textContent=txt;
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
        h+='<button onclick="closeImportRecap();editMemberInline(\''+p.id+'\')" style="background:var(--b1l);border:1px solid var(--b1);color:var(--b1d);border-radius:8px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;flex-shrink:0">'+t('importComplete')+' ›</button>';
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
```

- [ ] **Étape 2 : Vérifier la syntaxe**

```bash
node --check js/render.js
```

Résultat attendu : aucune sortie.

- [ ] **Étape 3 : Commit**

```bash
git add js/render.js
git commit -m "feat(import): showImportRecap and editMemberInline"
```

---

### Task 5 : CTA dynamique dans la liste principale

**Files:**
- Modify: `js/render.js`

- [ ] **Étape 1 : Ajouter le CTA dynamique au début de `rMembers()`**

Dans `rMembers()`, trouver la ligne `let h=\`<div class="sw">` et ajouter AVANT :

```js
  // CTA import contacts dynamique (Contact Picker API only)
  if('contacts' in navigator&&'ContactsManager' in window){
    if(m.length===0){
      h='<div style="margin-bottom:16px"><button onclick="openImportSheet()" style="width:100%;padding:14px;border:none;border-radius:14px;background:var(--grad);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 16px rgba(212,168,67,.3)" data-i18n="importFromContacts">'+t('importFromContacts')+'</button></div>';
    }else{
      h='<div style="margin-bottom:10px"><button onclick="openImportSheet()" style="width:100%;padding:9px;border:1px solid var(--b4);border-radius:10px;background:var(--b4l);color:var(--b4d);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit" data-i18n="importFromContacts">'+t('importFromContacts')+'</button></div>';
    }
  }
```

Note : la variable `h` est déclarée juste après avec `let h=\`<div class="sw">`. Il faut changer cette déclaration en `h+=\`<div class="sw">` (sans `let`) puisque `h` est maintenant déclarée avant. Si `h` n'existait pas avant ce bloc, initialiser avec `let h='';` au tout début de la fonction et retirer le `let` de la ligne `let h=\`<div class="sw">`.

- [ ] **Étape 2 : Ajuster la déclaration de `h` dans `rMembers()`**

La fonction `rMembers()` commence à la ligne 219. Le premier `let h=` se trouve quelques lignes après. Chercher ce pattern et l'adapter :

Avant :
```js
  let h=`<div class="sw">
```

Après :
```js
  h+=`<div class="sw">
```

Et ajouter `let h='';` comme première instruction du corps de la fonction (après la ligne `if(!el||...`)

- [ ] **Étape 3 : Vérifier la syntaxe**

```bash
node --check js/render.js
```

- [ ] **Étape 4 : Commit**

```bash
git add js/render.js
git commit -m "feat(import): dynamic CTA in members list (big when empty, small when populated)"
```

---

### Task 6 : Migration Supabase — colonne `incomplete` dans `members`

**Files:**
- Create: `netlify/migrations/20260603_members_incomplete.sql`
- Modify: `js/db.js`

- [ ] **Étape 1 : Créer la migration SQL**

```sql
alter table public.members
  add column if not exists incomplete boolean default false;
```

- [ ] **Étape 2 : Exécuter dans Supabase Dashboard → SQL Editor**

Résultat attendu : "Success. No rows returned."

- [ ] **Étape 3 : Mettre à jour `dbSaveGroups` dans `db.js` pour persister `incomplete`**

Dans la boucle qui construit `mRows`, trouver le bloc `.push({...})` et ajouter le champ :

```js
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
  incomplete: m.incomplete || false   // ← ajouter cette ligne
});
```

Et dans `dbLoadGroups`, dans le `.map(m => ({...}))`, ajouter :

```js
incomplete: m.incomplete || false,   // ← ajouter cette ligne
```

- [ ] **Étape 4 : Vérifier la syntaxe**

```bash
node --check js/db.js
```

- [ ] **Étape 5 : Commit**

```bash
git add netlify/migrations/20260603_members_incomplete.sql js/db.js
git commit -m "feat(import): add incomplete column to members table"
```

---

### Task 8 : Badge "date manquante" dans la liste

**Files:**
- Modify: `js/render.js`

- [ ] **Étape 1 : Ajouter le badge dans la boucle de rendu des membres**

Dans `rMembers()`, trouver la ligne qui génère `.pname` :

```js
h+=`<div class="prow">...
    <div class="pname">${tIco(p.type)} ${esc(p.name)}${tod?...
```

Ajouter à la fin de la ligne `.pname`, juste avant la fermeture du template string de la div pname, le badge pour les contacts incomplets :

```js
${p.incomplete?`<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--b2);margin-left:5px;vertical-align:middle" title="${t('importDateMissing')}"></span>`:''}
```

Le résultat concret : trouver `${tod?'<span class="pbdg pbt">'+t('todayLabel')+'</span>':''}` et ajouter immédiatement avant :

```js
${p.incomplete?`<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--b2);margin-left:5px;vertical-align:middle"></span>`:''}
```

- [ ] **Étape 2 : Vérifier la syntaxe**

```bash
node --check js/render.js
```

- [ ] **Étape 3 : Tester manuellement**

Ouvrir l'app. Avec un appareil Android Chrome (ou simulator avec ContactsManager) :
1. Avec 0 contact : vérifier que le bouton gradient s'affiche bien en pleine largeur
2. Tapper le bouton → le bottom sheet s'ouvre avec les deux options et la phrase d'explication
3. "Choisir un contact" → le formulaire add se préremplit
4. "Importer plusieurs" → l'écran récap s'affiche avec ✓ et badges oranges
5. "Compléter" ouvre la fiche en édition
6. "Terminer" revient à la liste
7. Avec ≥1 contact : le bouton devient petit et discret

- [ ] **Étape 4 : Tester manuellement (reprendre la checklist de Task 5 étape 3)**

- [ ] **Étape 5 : Commit final**

```bash
git add js/render.js
git commit -m "feat(import): incomplete contact badge in members list"
```
