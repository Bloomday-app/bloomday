# Email System Design — Bloomday
**Date:** 2026-05-04  
**Status:** Approved  
**Scope:** Transactional emails via Brevo API (welcome, subscription, renewal_reminder, anniversary)

---

## Context

Bloomday currently has email template objects defined in `render.js` and a `sendEmail()` function in `features.js` that only shows a toast notification — no actual email is sent. This design replaces that stub with a real implementation using Brevo's transactional email API.

Infrastructure already configured:
- Brevo account created, domain `mybloomday.app` authenticated (DKIM + DMARC + SPF)
- `BREVO_API_KEY` added to Netlify environment variables
- Sender address: `noreply@mybloomday.app`

---

## Architecture

```
Frontend (features.js)
  └── calls → POST /api/send-email
                └── netlify/functions/send-email.js
                      └── POST https://api.brevo.com/v3/smtp/email
```

One Netlify Function handles all email types. The frontend passes `{ type, to, data }` and the function builds the HTML and sends via Brevo API.

---

## Netlify Function: `send-email.js`

**Endpoint:** `POST /.netlify/functions/send-email`

**Request body:**
```json
{
  "type": "welcome" | "subscription" | "renewal_reminder" | "anniversary",
  "to": "user@example.com",
  "data": {
    "name": "Sophie",
    "plan": "Bloom",
    "expiryDate": "2026-05-07"
  }
}
```

**Behaviour:**
- Validates `type` and `to` fields
- Selects HTML template based on `type`
- Calls Brevo API `POST /v3/smtp/email`
- Returns `200 { success: true }` or `4xx/5xx { error: "..." }`

**Security:**
- No auth token required (called only from same-origin frontend)
- Rate limit inherited from Netlify Function invocation limits
- `BREVO_API_KEY` never exposed to client

---

## Email Types

| Type | Trigger | Subject |
|------|---------|---------|
| `welcome` | User completes signup | Bienvenue sur Bloomday 🌸 |
| `subscription` | Payment confirmed | Votre abonnement Bloomday est actif |
| `renewal_reminder` | 3 days before plan expiry (checked at login) | Votre abonnement expire dans 3 jours |
| `anniversary` | 1 year since account creation (checked at login) | 1 an avec Bloomday 🎉 |

Templates are HTML strings built in the function, i18n in French (app's primary language). Plain-text fallback included in each send call.

---

## Frontend Integration

In `features.js`, replace the current `sendEmail()` stub:

```js
async function sendEmail(type, to, data = {}) {
  try {
    await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, to, data })
    });
  } catch (e) {
    // Silent fail — email is non-blocking
  }
}
```

Existing call sites (`checkRenewalEmail()`, `checkAnniversaryEmail()`, signup flow, payment confirmation) remain unchanged — they already call `sendEmail()` with the right arguments.

---

## Out of Scope

- Annual subscription plans (noted for future)
- Email preference management / unsubscribe
- Marketing/campaign emails
- Multi-language email templates
- Bounce/complaint handling

---

## Notes for Future (forfait annuel)

When annual plans are added, a new email type `subscription_annual` should be added with the renewal date clearly displayed. Stripe webhook will be the trigger rather than client-side.
