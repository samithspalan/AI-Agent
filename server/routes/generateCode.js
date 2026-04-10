const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = Joi.object({
  description: Joi.string().max(1000).required(),
  language: Joi.string().alphanum().max(50).required(),
  context: Joi.string().max(2000).allow('')
});

const streamGroqAI = async (prompt, res) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`Groq HTTP Error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullCode = "";
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.trim().startsWith('data: ')) {
        const dataStr = line.replace('data: ', '').trim();
        if (dataStr === '[DONE]') continue;
        
        try {
          const data = JSON.parse(dataStr);
          const chunkText = data.choices[0]?.delta?.content || '';
          if (chunkText) {
            fullCode += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        } catch (e) {}
      }
    }
  }
  return fullCode;
};

const streamGeminiAI = async (prompt, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContentStream(prompt);
  let fullCode = "";

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullCode += chunkText;
    res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
  }
  return fullCode;
};

const getExplanation = async (code) => {
  const prompt = `Explain this code in 2-3 sentences: ${code}`;
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) throw new Error("Groq Fail");
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.warn("⚠️ Groq Explanation Failed, falling back to Gemini.");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
};

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { description, language, context } = value;

  const codePrompt = `Generate clean, idiomatic ${language} code for: ${description}. 
Context: ${context || 'None'}. Return ONLY raw code, no markdown fences.`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let generatedCode = "";
    try {
      generatedCode = await streamGroqAI(codePrompt, res);
    } catch (err) {
      console.warn("⚠️ Groq Stream Failed, falling back to Gemini.");
      generatedCode = await streamGeminiAI(codePrompt, res);
    }
    
    const explanation = await getExplanation(generatedCode);
    res.write(`data: ${JSON.stringify({ explanation })}\n\n`);

  } catch (error) {
    console.error("❌ Generation Error:", error.message);
    res.write(`data: ${JSON.stringify({ error: "Service temporarily unavailable" })}\n\n`);
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
