const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for Groq (Primary)
const callGroqAI = async (prompt) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" } // Force JSON
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw { type: 'rate_limit', message: 'Groq Rate Limit Reached' };
    }
    const error = await response.json();
    throw new Error(`Groq Fail: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

// Helper for Gemini (Fallback)
const callGeminiAI = async (prompt) => {
  // Use gemini-pro or gemini-1.5-flash-latest for better compatibility
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash-latest",
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    const match = responseText.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Gemini returned invalid JSON");
  }
};

router.post('/', async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const prompt = `You are a professional coding teacher. Analyze the following ${language || 'Auto-detect'} code and return a JSON object with:
1. "lines": An array where each object has { "line": <number>, "code": <the actual code line>, "explanation": <plain English explanation, max 15 words> }.
2. "summary": A 2-3 sentence overview of what the entire code does.
3. "difficulty": One of "Beginner", "Intermediate", or "Advanced".

Return ONLY JSON.

Code:
${code}`;

  try {
    console.log("⚡ [Code Explainer] Attempting with Groq...");
    const data = await callGroqAI(prompt);
    res.json(data);
    console.log("✅ Groq Explanation Complete");
  } catch (error) {
    if (error.type === 'rate_limit') {
      console.warn("⚠️ Groq Rate Limit (429). Falling back to Gemini...");
      try {
        const data = await callGeminiAI(prompt);
        res.json(data);
        console.log("✅ Gemini Fallback Complete");
      } catch (gemError) {
        console.error("💀 Gemini Fallback Failed:", gemError.message);
        res.status(500).json({ error: 'Both AI services failed', details: gemError.message });
      }
    } else {
      console.error("❌ Groq Error:", error.message);
      res.status(500).json({ error: 'Failed to explain code', details: error.message });
    }
  }
});

module.exports = router;
