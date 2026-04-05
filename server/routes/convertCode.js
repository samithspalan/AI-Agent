const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for Groq (Streaming)
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
          // Ignore partial chunks
        }
      }
    }
  }
};

// Helper for Gemini (Streaming)
const streamGeminiAI = async (prompt, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContentStream(prompt);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
  }
};

router.post('/', async (req, res) => {
  const { code, source, target } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const prompt = `You are an expert programmer. Convert the following ${source || 'auto-detected'} code to ${target}. 
Return only the converted code, no markdown, no explanation, preserve logic exactly.

Code to convert:
${code}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    console.log(`⚡ [Code Converter] Converting ${source} to ${target} via Groq...`);
    await streamGroqAI(prompt, res);
    console.log("✅ Groq Conversion Complete");
  } catch (error) {
    if (error.type === 'rate_limit') {
      console.warn("⚠️ Groq Rate Limit (429). Falling back to Gemini...");
      try {
        await streamGeminiAI(prompt, res);
        console.log("✅ Gemini Fallback complete");
      } catch (gemError) {
        console.error("💀 Gemini Fallback Failed:", gemError.message);
        res.write(`data: ${JSON.stringify({ error: gemError.message })}\n\n`);
      }
    } else {
      console.error("❌ Groq Error:", error.message);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
