export default async (request) => {
  try {
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY manquante sur Netlify" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    const body = await request.json();
    const {
      name = "quelqu’un",
      age = null,
      phone = "",
      gender = "",
      note = "",
      tone = "chaleureux, élégant, sincère",
      event = "birthday"
    } = body || {};

    const eventLabel =
      event === "birthday"
        ? "anniversaire"
        : event === "wedding"
        ? "anniversaire de mariage"
        : event === "work"
        ? "anniversaire professionnel"
        : "événement spécial";

    const prompt = `
Tu es un expert en messages d'anniversaire ultra personnalisés.

Objectif :
Créer un message UNIQUE, émotionnel, naturel et impactant.

Informations sur la personne :
- Prénom : ${name}
- Type d'événement : ${eventLabel}
- Âge : ${age ?? "non précisé"}
- Genre : ${gender || "non précisé"}
- Notes / passions : ${note || "aucune"}

Contraintes :
- Ton chaleureux, humain, sincère
- Pas générique
- Faire référence aux passions ou à la personnalité si disponibles
- Ajouter une touche émotionnelle
- Style naturel, comme un vrai message WhatsApp élégant
- 4 à 6 lignes max
- Ajouter quelques emojis bien placés
- Ne pas recopier brutalement les notes, les intégrer avec finesse

Interdit :
- Les phrases bateau
- Les répétitions
- Les introductions du style "Bien sûr"

Bonus :
- Si possible, ajoute une petite touche mémorable ou complice

Génère uniquement le message final.
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        input: prompt
      })
    });

if (!openaiResponse.ok) {
  const errorText = await openaiResponse.text();
  return new Response(
    JSON.stringify({
      error: "Erreur OpenAI",
      details: errorText,
      source: "backend_error"
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}

    const data = await openaiResponse.json();
const message =
  data.output_text ||
  "Joyeux anniversaire ! Que cette journée soit belle et remplie de joie.";

return new Response(
  JSON.stringify({
    message,
    source: "openai"
  }),
  {
    status: 200,
    headers: { "Content-Type": "application/json" }
  }
);
} catch (error) {
  return new Response(
    JSON.stringify({
      error: "Erreur serveur",
      details: error.message,
      source: "server_error"
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" }
    }
  );
}
};