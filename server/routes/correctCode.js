const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to stream Groq response
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
    if (response.status === 429) {
      throw { type: 'rate_limit', message: 'Groq Rate Limit Reached' };
    }
    const error = await response.json();
    throw new Error(`Groq Fail: ${error.error?.message || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
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
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        } catch (e) {
          // Ignore partial JSON
        }
      }
    }
  }
};

// Helper to stream Gemini response
const streamGeminiAI = async (prompt, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
  }
};

router.post('/', async (req, res) => {
  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const prompt = `You are an expert code reviewer. Fix all bugs, improve quality, return only the corrected code, no markdown, no explanation.
    
Language: ${language || 'Auto-detect'}
Code:
${code}`;

  // Set headers for streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    console.log("⚡ [Code Correction] Attempting with Groq...");
    await streamGroqAI(prompt, res);
    console.log("✅ Groq Streaming Complete");
  } catch (error) {
    if (error.type === 'rate_limit') {
      console.warn("⚠️ Groq Rate Limit (429). Falling back to Gemini...");
      try {
        await streamGeminiAI(prompt, res);
        console.log("✅ Gemini Fallback Streaming Complete");
      } catch (gemError) {
        console.error("💀 Gemini Fallback Failed:", gemError);
        res.write(`data: ${JSON.stringify({ error: 'Both AI services failed' })}\n\n`);
      }
    } else {
      console.error("❌ Groq Streaming Error:", error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
