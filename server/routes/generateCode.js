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
  let fullGeneratedCode = "";
  
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
            fullGeneratedCode += chunkText;
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
          }
        } catch (e) {
          // Ignore partial
        }
      }
    }
  }
  return fullGeneratedCode;
};

// Helper for Gemini (Streaming)
const streamGeminiAI = async (prompt, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContentStream(prompt);
  let fullGeneratedCode = "";

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullGeneratedCode += chunkText;
    res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
  }
  return fullGeneratedCode;
};

// Helper for Explanation (Single Shot)
const getExplanation = async (code) => {
  const prompt = `In 2-3 simple sentences explain what this code does: ${code}`;
  
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }
    
    // Fallback to Gemini if Groq fails
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("Explanation failed:", err.message);
    return "Code analysis complete.";
  }
};

router.post('/', async (req, res) => {
  const { description, language, context } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const codePrompt = `You are an expert ${language} developer. Generate clean, highly readable, and production-ready ${language} code for the following requirement: ${description}. 

Guidelines:
- Prioritize clear variable names and standard idiomatic patterns.
- Avoid obscure bitwise tricks or overly complex one-liners (unless specifically requested).
- Do NOT include any code comments (unless specifically requested).
- Ensure the code is accessible to developers of all levels.
- Additional context: ${context || 'None'}.

Return only the code, no markdown fences, no explanation before or after.`;

  // Set headers for streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    let generatedCode = "";
    console.log(`⚡ [Code Generator] Generating ${language} code via Groq...`);
    
    try {
      generatedCode = await streamGroqAI(codePrompt, res);
    } catch (error) {
      if (error.type === 'rate_limit') {
        console.warn("⚠️ Groq Rate Limit (429). Falling back to Gemini...");
        generatedCode = await streamGeminiAI(codePrompt, res);
      } else {
        throw error;
      }
    }

    console.log("✅ Code Generation Complete. Fetching explanation...");
    
    // Fetch explanation and send as a separate data packet
    const explanation = await getExplanation(generatedCode);
    res.write(`data: ${JSON.stringify({ explanation })}\n\n`);

  } catch (error) {
    console.error("❌ Generation Error:", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

module.exports = router;
