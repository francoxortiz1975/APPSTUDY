export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { subject, topics, numQuestions } = req.body || {};

    if (!subject || !Array.isArray(topics) || topics.length === 0 || !numQuestions) {
        return res.status(400).json({ error: 'Paramètres manquants: subject, topics[], numQuestions' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY non configurée dans les variables d\'environnement Vercel.' });
    }

    const n = Math.min(Math.max(parseInt(numQuestions), 3), 20);
    const topicsText = topics.slice(0, 10).join(', ');

    const prompt = `Tu es un professeur expert. Génère exactement ${n} questions à choix multiples (QCM) en français sur la matière "${subject}".
Thèmes à couvrir: ${topicsText}.

Réponds UNIQUEMENT avec ce JSON valide, sans texte avant ou après:
{"questions":[{"question":"Texte de la question?","options":["Option A","Option B","Option C","Option D"],"correct":0,"explanation":"Brève explication de la bonne réponse."}]}

Règles:
- Exactement ${n} questions
- 4 options par question (options = tableau de 4 strings)
- "correct" = index 0-3 de la bonne réponse
- Questions variées, pédagogiques et claires
- Une seule bonne réponse par question`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.7,
                        maxOutputTokens: 4096
                    }
                })
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini API error:', response.status, errText);
            return res.status(502).json({ error: `Gemini API: ${response.status}`, details: errText });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'Réponse vide de Gemini' });
        }

        const quiz = JSON.parse(text);

        if (!quiz.questions || !Array.isArray(quiz.questions)) {
            return res.status(500).json({ error: 'Format de réponse invalide' });
        }

        return res.status(200).json(quiz);
    } catch (err) {
        console.error('generate-quiz error:', err);
        return res.status(500).json({ error: err.message || 'Erreur interne' });
    }
}
