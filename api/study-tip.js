export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.AI_GATEWAY_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "AI_GATEWAY_KEY not configured" });
    }

    try {
        const { subjects, currentAverage, target } = req.body;

        if (!subjects || !Array.isArray(subjects)) {
            return res.status(400).json({ error: "Invalid subjects data" });
        }

        const subjectList = subjects
            .map(s => `${s.name}: ${s.average}/20`)
            .join(", ");

        const prompt = `Tu es un conseiller académique bienveillant. Voici les notes d'un étudiant (sur 20):
${subjectList}
Moyenne actuelle: ${currentAverage}/20. Objectif: ${target}/20.
Donne UN seul conseil court (maximum 25 mots) en français, motivant et spécifique à ses matières. Pas de formule de politesse. Juste le conseil.`;

        const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 80,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("AI Gateway error:", errText);
            return res.status(502).json({ error: "AI service unavailable" });
        }

        const data = await response.json();
        const tip = data?.choices?.[0]?.message?.content?.trim() || "";

        return res.status(200).json({ tip });
    } catch (err) {
        console.error("study-tip error:", err);
        return res.status(500).json({ error: "Internal error" });
    }
}
