const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enable CORS and JSON body parsing
app.use(cors());
app.use(express.json());

// 🔍 Check Gemini Key
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Error: GEMINI_API_KEY is not defined in .env file.");
} else {
  console.log("✅ Gemini API Key loaded. Length:", process.env.GEMINI_API_KEY.length);
}

// --- SHARED TOOLS ---
const getLowStockItems = () => {
  return [
    { name: "Milk", stock: 2 },
    { name: "Bread", stock: 1 }
  ];
};

const functions = {
  getLowStockItems: () => getLowStockItems(),
};

const tools = [
  {
    functionDeclarations: [
      {
        name: "getLowStockItems",
        description: "Get items with low stock",
        parameters: {
          type: "OBJECT",
          properties: {},
        },
      },
    ],
  },
];

// --- ROUTES ---

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend connected with Gemini 🚀' });
});

// 🔥 Step 3 & 4 — Define /api/agent Route (Conversational with tools)
app.post('/api/agent', async (req, res) => {
  const { message } = req.body || {};
  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      tools: tools,
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(message);
    const response = result.response;
    
    // Handle Function Calling
    const calls = response.functionCalls();
    if (calls && calls.length > 0) {
      const call = calls[0];
      const functionName = call.name;
      
      let functionResult;
      if (functions[functionName]) {
        functionResult = functions[functionName]();
      }

      // Send result back to model
      const result2 = await chat.sendMessage([{
        functionResponse: {
          name: functionName,
          response: { content: functionResult }
        }
      }]);
      
      return res.json({ reply: result2.response.text() });
    }

    return res.json({ reply: response.text() });

  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ reply: "AI encountered an error. Check your API key and quota." });
  }
});

// 🛠️ Step 6, 7 & 8 — Define /api/issue Route (Full PR Workflow)
app.post('/api/issue', async (req, res) => {
  const { issue } = req.body || {};
  if (!issue) return res.status(400).json({ error: "No issue text provided." });

  try {
    const analysisModel = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    // 1. Analyze the issue context
    const analysisPrompt = `You are a senior software engineer. Analyze the given issue and extract:
1. task (what needs to be done)
2. target (which part of system, e.g., login API, database, UI)
3. type (bug, feature, improvement)

Issue: "${issue}"

Return ONLY valid JSON in this format:
{"task": "...", "target": "...", "type": "..."}`;

    const analysisResult = await analysisModel.generateContent(analysisPrompt);
    const parsedData = JSON.parse(analysisResult.response.text());
    
    const target = parsedData.target.toLowerCase();
    let fileToRead = null;

    // 2. Identify relevant file based on target
    if (target.includes("login") || target.includes("auth")) {
      fileToRead = "auth.js";
    } else if (target.includes("user")) {
      fileToRead = "user.js";
    }

    if (!fileToRead) {
      return res.status(404).json({ error: "No relevant file found for this issue." });
    }

    const filePath = path.join(__dirname, 'codebase', fileToRead);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Selected file ${fileToRead} not found in codebase.` });
    }

    const originalCode = fs.readFileSync(filePath, 'utf8');

    // 3. Generate the updated code using Gemini
    const coderModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const coderPrompt = `You are a senior software engineer.

Your task is to modify the given code to solve the issue.

Instructions:
* Keep the existing structure
* Only add or modify necessary parts
* Do not remove unrelated logic
* Return ONLY the updated code
* Do not include explanations

Issue description:
"${issue}"

Existing code:
\`\`\`javascript
${originalCode}
\`\`\``;

    const coderResult = await coderModel.generateContent(coderPrompt);
    // Remove potential markdown code blocks if the model includes them
    let updatedCode = coderResult.response.text().trim();
    updatedCode = updatedCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();

    // 4. Generate PR Title & Description using Gemini (JSON)
    const prModel = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });
    const prPrompt = `You are a software engineer. Based on the issue and code changes, generate a pull request title and description.

Issue: "${issue}"

Updated Code Preview:
"${updatedCode.substring(0, 500)}..."

Return ONLY valid JSON in this format:
{
"prTitle": "...",
"prDescription": "..."
}`;

    const prResult = await prModel.generateContent(prPrompt);
    const prData = JSON.parse(prResult.response.text());

    // 5. Return the final structured response
    return res.json({
      prTitle: prData.prTitle,
      prDescription: prData.prDescription,
      file: fileToRead,
      originalCode: originalCode,
      updatedCode: updatedCode
    });

  } catch (error) {
    console.error("Gemini PR workflow error detail:", error);
    res.status(500).json({ error: "AI PR generation failed.", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
