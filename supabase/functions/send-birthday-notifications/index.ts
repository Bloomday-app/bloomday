import webpush from "npm:web-push@3.6.7";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_EMAIL = Deno.env.get("VAPID_EMAIL") || "contact@mybloomday.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

function getBirthdayTargetDate(daysBefore: number): { day: number; month: number } {
  const target = new Date();
  target.setUTCDate(target.getUTCDate() + daysBefore);
  return { day: target.getUTCDate(), month: target.getUTCMonth() + 1 };
}

async function supabaseGet(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  return res.json();
}

async function supabaseDelete(path: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
}

Deno.serve(async (_req) => {
  try {
    const subs = await supabaseGet(
      "push_subscriptions?select=user_id,endpoint,p256dh,auth"
    );
    if (!Array.isArray(subs) || !subs.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let sent = 0;
    for (const sub of subs) {
      try {
        const profiles = await supabaseGet(
          `profiles?id=eq.${sub.user_id}&select=notification_settings,id`
        );
        const profile = Array.isArray(profiles) && profiles[0];
        if (!profile) continue;
        const ns = profile.notification_settings || {};
        if (!ns.enabled) continue;
        const defaultDaysBefore = ns.daysBefore ?? 1;

        const members = await supabaseGet(
          `members?user_id=eq.${sub.user_id}&select=id,name,day,month,incomplete,notif_days_before`
        );
        if (!Array.isArray(members)) continue;

        for (const member of members as Array<{id: string|number; name: string; day: number; month: number; incomplete?: boolean; notif_days_before?: number|null}>) {
          if (member.incomplete || !member.day || !member.month) continue;
          const daysBefore = member.notif_days_before ?? defaultDaysBefore;
          const target = getBirthdayTargetDate(daysBefore);
          if (member.day !== target.day || member.month !== target.month) continue;

          const daysLabel = daysBefore === 0
            ? "aujourd'hui"
            : `dans ${daysBefore} jour${daysBefore > 1 ? "s" : ""}`;
          const payload = JSON.stringify({
            title: `🎂 ${member.name}`,
            body: `Anniversaire ${daysLabel} !`,
            tag: `birthday-${member.id}`,
            data: { contactId: String(member.id) }
          });

          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
            sent++;
          } catch (e: unknown) {
            if (e && typeof e === "object" && "statusCode" in e && (e as {statusCode: number}).statusCode === 410) {
              await supabaseDelete(
                `push_subscriptions?user_id=eq.${sub.user_id}&endpoint=eq.${encodeURIComponent(sub.endpoint)}`
              );
            }
          }
        }
      } catch (e) {
        console.warn("Error processing subscription", sub.user_id, e);
      }
    }

    return new Response(JSON.stringify({ sent }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
