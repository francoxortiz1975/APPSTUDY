export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
    }

    try {
        const { subjects, currentAverage, target } = req.body;

        if (!subjects || !Array.isArray(subjects)) {
            return res.status(400).json({ error: "Invalid subjects data" });
        }

        const subjectDetails = subjects.map(s => {
            let detail = `${s.name} (coef ${s.weight}, moyenne: ${s.average}/20)`;
            if (s.grades && s.grades.length > 0) {
                const gradeList = s.grades.map(g => `${g.name}: ${g.score}/20 (${g.weight})`).join(", ");
                detail += ` — Notes: ${gradeList}`;
            }
            return detail;
        }).join("\n");

        const prompt = `Tu es un conseiller académique. Voici le détail des cours et notes d'un étudiant (sur 20):
${subjectDetails}

Moyenne actuelle: ${currentAverage}/20. Objectif: ${target}/20.

Analyse les évaluations (quizzes, projets, examens, TDs...) et identifie celles qui ont le plus de poids ou les plus faciles à améliorer.
Donne exactement 3 actions concrètes et spécifiques pour monter la moyenne. Format:
1. [action]
2. [action]
3. [action]
Maximum 20 mots par action. En français. Pas d'introduction ni de conclusion.`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        maxOutputTokens: 1024,
                        temperature: 0.7,
                        thinkingConfig: { thinkingBudget: 0 }
                    }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API error:", response.status, errText);
            return res.status(502).json({ error: "AI service unavailable" });
        }

        const data = await response.json();
        console.log("Gemini raw response:", JSON.stringify(data).substring(0, 1000));
        const tip = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        return res.status(200).json({ tip });
    } catch (err) {
        console.error("study-tip error:", err);
        return res.status(500).json({ error: "Internal error" });
    }
}
