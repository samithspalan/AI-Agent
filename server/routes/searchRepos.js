const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = Joi.object({
  query: Joi.string().min(2).max(100).required(),
  requirements: Joi.string().max(500).allow('')
});

// --- Autonomous Tool Handlers ---

const githubFetch = async (endpoint) => {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'CodeSage-Agent'
    }
  });
  if (response.status === 404) return { error: "File not found" };
  if (!response.ok) throw new Error(`GitHub API Error: ${response.status}`);
  const data = await response.json();
  if (data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return data;
};

const read_github_readme = async (owner, repo) => {
  console.log(`🤖 Tool Call: Reading README for ${owner}/${repo}`);
  return await githubFetch(`/repos/${owner}/${repo}/readme`);
};

const read_package_json = async (owner, repo) => {
  console.log(`🤖 Tool Call: Reading package.json for ${owner}/${repo}`);
  return await githubFetch(`/repos/${owner}/${repo}/contents/package.json`);
};

// --- AI Tools Definition ---

const tools = [
  {
    type: "function",
    function: {
      name: "read_github_readme",
      description: "Read the README.md of a GitHub repository to understand its purpose, setup, and features.",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "The owner of the repository" },
          repo: { type: "string", description: "The name of the repository" }
        },
        required: ["owner", "repo"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "read_package_json",
      description: "Read the package.json of a GitHub repository to verify dependencies, scripts, and TypeScript support.",
      parameters: {
        type: "object",
        properties: {
          owner: { type: "string", description: "The owner of the repository" },
          repo: { type: "string", description: "The name of the repository" }
        },
        required: ["owner", "repo"]
      }
    }
  }
];

// --- Agentic Agent logic ---

const callGroqAgent = async (messages) => {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Groq API Error:", errorData);
    throw new Error("Groq API Request Failed");
  }

  const data = await response.json();
  const message = data.choices[0].message;

  if (message.tool_calls) {
    messages.push(message);

    for (const toolCall of message.tool_calls) {
      const { name, arguments: args } = toolCall.function;
      const parsedArgs = JSON.parse(args);
      let result;

      if (name === "read_github_readme") {
        result = await read_github_readme(parsedArgs.owner, parsedArgs.repo);
      } else if (name === "read_package_json") {
        result = await read_package_json(parsedArgs.owner, parsedArgs.repo);
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: name,
        content: typeof result === 'string' ? result.substring(0, 5000) : JSON.stringify(result) // Limit size
      });
    }

    // Call back to Groq with tool results
    return await callGroqAgent(messages);
  }

  return message.content;
};

const callGeminiFallback = async (prompt) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

router.post('/', async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { query, requirements } = value;

  try {
    // 1. Search GitHub API for candidates
    const ghResp = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'CodeSage-Agent'
      }
    });

    if (!ghResp.ok) throw new Error("GitHub Search API Failed");
    const ghData = await ghResp.json();

    const repoContext = ghData.items.map(repo => ({
      full_name: repo.full_name,
      owner: repo.owner.login,
      name: repo.name,
      stars: repo.stargazers_count,
      description: repo.description,
      url: repo.html_url,
      language: repo.language
    }));

    const systemPrompt = `You are CodeSage Autonomous Agent, an elite AI Solutions Architect and Repository Scout.
Your mission is to find the absolute best repository for a developer based on their specific requirements.

USER QUERY: "${query}"
USER REQUIREMENTS: "${requirements || 'None'}"

CANDIDATES FOUND:
${JSON.stringify(repoContext, null, 2)}

DIRECTIONS:
1. You are an AUTONOMOUS AGENT. Do not just trust repository descriptions.
2. Use your tools (read_github_readme, read_package_json) to perform DEEP INSPECTION on the most promising candidates.
3. Verify critical criteria: dependencies, project structure, TypeScript support, and activity.
4. After inspection, provide a comprehensive analysis.
5. RECOMMEND precisely ONE repository as the primary choice and explain why it wins over the others.
6. Format your response in high-fidelity Markdown with clear sections, bold headers, and professional icons.`;

    let analysis;
    try {
      const messages = [{ role: "system", content: systemPrompt }];
      analysis = await callGroqAgent(messages);
    } catch (err) {
      console.warn("⚠️ Groq Agentic Loop Failed, falling back to standard Gemini analysis:", err.message);
      const fallbackPrompt = `${systemPrompt}\n\nNote: Proceed with analysis based on available context as the deep inspection tools are currently unavailable.`;
      analysis = await callGeminiFallback(fallbackPrompt);
    }

    res.json({ analysis, candidates: repoContext });

  } catch (err) {
    console.error("❌ Search Error:", err.message);
    res.status(500).json({ error: "Failed to perform autonomous repository scouting." });
  }
});

module.exports = router;
