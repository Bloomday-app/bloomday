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
Tu rédiges un message court en français pour Bloomday.

Contexte :
- Personne : ${name}
- Type d'événement : ${eventLabel}
- Âge : ${age ?? "non précisé"}
- Genre : ${gender || "non précisé"}
- Notes : ${note || "aucune"}
- Téléphone : ${phone || "non précisé"}
- Ton demandé : ${tone}

Consignes :
- Écris un message naturel, humain, élégant et chaleureux.
- 3 à 5 phrases maximum.
- Pas de guillemets.
- Pas d'introduction du type "Bien sûr".
- Commence directement par le message.
- Si une note personnelle existe, intègre-la avec subtilité.
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
          details: errorText
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
      JSON.stringify({ message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Erreur serveur",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};