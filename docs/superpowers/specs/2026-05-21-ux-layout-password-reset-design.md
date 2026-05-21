# Design Spec — UX Layout 3 colonnes, Reset Mot de Passe, Email Supabase

**Date :** 2026-05-21  
**Statut :** Validé

---

## Contexte

4 problèmes UX identifiés :
1. Layout app non conforme — nav en bas horizontal au lieu de colonne gauche
2. Sélecteur de langue en `position:fixed` qui masque des boutons quand connecté
3. Flux reset mot de passe cassé — Supabase redirige directement dans l'app sans proposer de saisir un nouveau mot de passe
4. Email reset Supabase sans design, non représentatif de Bloomday

---

## Chantier 1 — Layout 3 colonnes desktop

### Décision
Option C : colonne gauche **140px** avec icône + label texte.

### Structure
```
[sidebar 140px] [contenu flex:1] [panneau droit 280px]
```

### Sidebar gauche (`.desktop-sidebar`, 140px)
- Largeur : passer de `64px` à `140px`
- Chaque bouton nav : icône SVG (22px) + span texte (ex: "Accueil") sur la même ligne
- Ordre : logo Bloomday en haut → 5 boutons nav → bouton Admin (conditionnel) → sélecteur de langue tout en bas
- Fond : `#1a1a2e` (inchangé)

### Panneau droit (`.desktop-right-panel`, 280px)
- Déjà présent dans le HTML, actuellement vide
- Rendre le calendrier mensuel dedans au chargement et à chaque navigation
- Extraire le rendu calendrier de `#s-cal` vers une fonction `renderSideCalendar()` appelée aussi dans `renderDesktopRightPanel()`

### Mobile
- La barre `.nav` du bas reste inchangée
- La sidebar et le panneau droit restent `display:none` sur mobile (comportement actuel)

---

## Chantier 2 — Sélecteur de langue

### Problème actuel
`position:fixed; top:12px; right:12px` — chevauche les boutons topbar quand l'utilisateur est connecté.

### Solution desktop
- Supprimer la position `fixed` du `.lang-sel`
- Intégrer le sélecteur dans le bas de la sidebar gauche
- Style : bouton discret `🌍 Français ▾`, dropdown qui s'ouvre **vers le haut** (`bottom: 100%`)

### Solution mobile
- Retirer le sélecteur de langue de sa position fixe globale
- Le déplacer dans la section Profil (`#s-more`), zone Paramètres
- Ou le garder visible uniquement sur la page vitrine (avant connexion)

---

## Chantier 3 — Flux reset mot de passe

### Problème actuel
`onAuthStateChange` ne gère que `SIGNED_IN` et `SIGNED_OUT`. L'événement `PASSWORD_RECOVERY` n'est pas intercepté — Supabase connecte l'utilisateur directement.

### Solution
Dans `js/auth.js`, ajouter un handler `PASSWORD_RECOVERY` dans `onAuthStateChange` :

```js
} else if (event === 'PASSWORD_RECOVERY') {
  showPasswordResetForm();
}
```

### Formulaire `showPasswordResetForm()`
- Modale ou écran dédié (même style que `.m-auth`)
- Champs : "Nouveau mot de passe" + "Confirmer le mot de passe"
- Validation : min 8 caractères, les deux champs identiques
- Submit : `supabase.auth.updateUser({ password: newPass })`
- Succès : fermer la modale, toast `t('passwordUpdated')`, rediriger vers dashboard
- Erreur : toast d'erreur

### HTML à ajouter dans `index.html`
Modale `#m-reset-pass` avec les deux champs et le bouton submit.

### Clés i18n à ajouter (7 langues)
- `resetPassTitle` — "Nouveau mot de passe"
- `resetPassLabel` — "Choisissez votre nouveau mot de passe"
- `resetPassConfirm` — "Confirmer le mot de passe"
- `resetPassBtn` — "Enregistrer le nouveau mot de passe"
- `passwordUpdated` — "Mot de passe mis à jour !"
- `errPassMismatch` — "Les mots de passe ne correspondent pas"

---

## Chantier 4 — Email reset Supabase

### Template HTML (à copier dans le dashboard Supabase)
Reprend exactement la DA des emails Brevo existants :
- Header violet `#5b2d8e`
- Logo `https://mybloomday.app/img/logo.png` avec `border-radius:14px`
- Titre violet, encart `#f9f4ff`, bouton gradient `linear-gradient(135deg,#e85d9a,#5b2d8e)`
- Footer `#f9f4ff` avec lien `mybloomday.app`
- Variable Supabase pour le lien : `{{ .ConfirmationURL }}`

### Instruction manuelle
Le template ne peut pas être modifié par code. Il faut le copier-coller dans :
> Supabase Dashboard → Authentication → Email Templates → Reset Password

### Bonus — Fix bug URLs Brevo
Dans `netlify/functions/send-email.js` :
- `APP_URL` : `https://bloomday-day.netlify.app` → `https://mybloomday.app`
- `LOGO_URL` : `https://bloomday-day.netlify.app/img/logo.png` → `https://mybloomday.app/img/logo.png`

---

## Ordre d'implémentation recommandé

1. Fix URLs Brevo (2 min, sans risque)
2. Flux reset mot de passe — handler + modale + i18n
3. Email reset — template HTML à fournir + instructions Supabase
4. Layout sidebar 140px + panneau droit calendrier
5. Sélecteur de langue — repositionnement sidebar + mobile

---

## Fichiers concernés

| Fichier | Modification |
|---|---|
| `netlify/functions/send-email.js` | Fix APP_URL + LOGO_URL |
| `js/auth.js` | Handler PASSWORD_RECOVERY + showPasswordResetForm() |
| `js/i18n.js` | 6 nouvelles clés × 7 langues |
| `index.html` | Modale reset + sidebar 140px + boutons nav avec labels |
| `css/app.css` | Sidebar 140px + lang-sel repositionné + dropdown vers le haut |
