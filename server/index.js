const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose');
const AgentLog = require('./models/AgentLog');
require('dotenv').config();


mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aiagent', {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('📦 Connected to MongoDB (Local System)'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

const app = express();
const PORT = 5000;
const correctCodeRoute = require('./routes/correctCode');
const explainCodeRoute = require('./routes/explainCode');
const convertCodeRoute = require('./routes/convertCode');
const analyzeComplexityRoute = require('./routes/analyzeComplexity');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use('/api/correct-code', correctCodeRoute);
app.use('/api/explain-code', explainCodeRoute);
app.use('/api/convert-code', convertCodeRoute);
app.use('/api/analyze-complexity', analyzeComplexityRoute);

const lastProcessedShas = new Map();
const lastProcessedTimes = new Map();

const githubFetch = async (u, m = 'GET', b = null) => {
  const op = { method: m, headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'Node-AI-Agent', 'X-GitHub-Api-Version': '2022-11-28' } };
  if (b) op.body = JSON.stringify(b);
  const resp = await fetch(u, op);
  const data = await resp.json();
  if (!resp.ok) return { error: true, message: data.message || 'GitHub Error' };
  return data;
};

const getPRFiles = async (o, r, n) => await githubFetch(`https://api.github.com/repos/${o}/${r}/pulls/${n}/files`);
const getFileContent = async (o, r, p, ref) => {
  const data = await githubFetch(`https://api.github.com/repos/${o}/${r}/contents/${p}${ref ? `?ref=${ref}` : ''}`);
  if (data.error) throw new Error(`GitHub File Fetch Error: ${data.message} (${p})`);
  return { 
    code: data.content ? Buffer.from(data.content, 'base64').toString('utf8') : '', 
    sha: data.sha 
  };
};
const updateFileOnGitHub = async (o, r, p, code, br, sha, msg = "AI auto-fix: applied fixes") => await githubFetch(`https://api.github.com/repos/${o}/${r}/contents/${p}`, 'PUT', { message: msg, content: Buffer.from(code).toString('base64'), branch: br, sha });
const postPRComment = async (o, r, n, body) => await githubFetch(`https://api.github.com/repos/${o}/${r}/issues/${n}/comments`, 'POST', { body });


const callGroqAI = async (prompt) => {
  console.log("⚡ Attempting with Groq (Llama-3.3-70b)...");
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
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Groq Fail: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("⚠️ Groq Failed:", err.message);
    throw err;
  }
};

const callGeminiAI = async (prompt) => {
  console.log("📡 Attempting with Gemini Fallback...");
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const runPRWorkflow = async (owner, repo, pull_number, branch) => {
  console.log(`📡 [Hybrid Mode] Starting analysis for PR #${pull_number}...`);
  try {
    const prData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}`);
    if (prData.error) return;

    const currentSha = prData.head.sha;
    const now = Date.now();
    const lastTime = lastProcessedTimes.get(pull_number) || 0;

    if (now - lastTime < 30000) {
      console.log(`🛡️ Loop Intercepted: PR #${pull_number} was just updated ${Math.round((now-lastTime)/1000)}s ago.`);
      return;
    }

    const commitData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/commits/${currentSha}`);
    if (commitData.commit?.message?.includes("AI auto-fix")) {
      console.log(`🛡️ Loop Intercepted: Latest commit is AI-generated.`);
      lastProcessedShas.set(currentSha, true); // Mark it so we don't fetch it again
      return;
    }

    if (lastProcessedShas.has(currentSha)) {
      console.log(`🛡️ Loop Intercepted: Already seen SHA ${currentSha.slice(0, 7)}`);
      return;
    }
    
    lastProcessedShas.set(currentSha, true);
    lastProcessedTimes.set(pull_number, now);
    
    console.log(`🚀 [Micro-Context Mode] PR #${pull_number} (SHA: ${currentSha.slice(0, 7)})`);

    const files = await getPRFiles(owner, repo, pull_number);
    let microContext = "";
    let fileToFix = null;

    let targetPatch = "";
    for (const f of files) {
      if (!f.patch || f.status === 'removed') continue;
      microContext += `FILE: ${f.filename}\nDIFF:\n${f.patch}\n`;
      fileToFix = f.filename;
      targetPatch = f.patch;
    }

    if (!microContext) return;

    const prompt = `You are a strict senior software engineer performing a code audit. Your ONLY job is to find REAL bugs — not rewrite, refactor, or beautify code.

## MANDATORY RULES (you MUST follow these exactly):
1. READ the diff below carefully.
2. CHECK only for: syntax errors, undefined variables, broken logic, missing return statements, invalid function calls, or runtime-breaking issues.
3. DO NOT change code for: style, naming conventions, performance micro-optimizations, comment removal, or personal preference.
4. IF the code has NO bugs or critical errors → respond with EXACTLY: "NO CHANGES NEEDED" on the first line. Do NOT output any code block. Do NOT suggest refactors.
5. IF you find a REAL bug (syntax/logic only) → describe each bug clearly, then output the FULL corrected file in a single \`\`\`javascript block.
6. At the end of your response, write: "Confidence Score: <number>" (0-100). If no changes were needed, use 100.

## CODE DIFF for \`${fileToFix}\`:
${microContext}`;

    let output;
    try {
      // 🚀 TRY GROQ FIRST
      output = await callGroqAI(prompt);
    } catch (err) {
      // 🛡️ FALLBACK TO GEMINI
      try {
        output = await callGeminiAI(prompt);
      } catch (gemErr) {
        console.error("💀 ALL AI FAILED.");
        await postPRComment(owner, repo, pull_number, "🤖 **AI Status**: ⚠️ AI Services currently unavailable. Please retry later.");
        return;
      }
    }

    // 🛡️ Check if AI determined code is already correct (no real bugs found)
    const noCodeBlock = !output.includes("```javascript") && !output.includes("```js");
    const isPerfect = noCodeBlock && (
      /NO CHANGES NEEDED/i.test(output) ||
      /NO CHANGES REQUIRED/i.test(output) ||
      /code is correct/i.test(output) ||
      /no (bugs?|errors?|issues?|problems?) (found|detected|identified)/i.test(output) ||
      /looks? (good|correct|fine|solid|clean)/i.test(output)
    );

    if (isPerfect) {
      console.log(`✅ [No-Op] Code is already correct. Skipping commit for ${fileToFix}.`);
      await postPRComment(owner, repo, pull_number, `🤖 **AI Audit Complete — No Issues Found**\n\n✅ I reviewed \`${fileToFix}\` and found **no logic or syntax errors**. The code is correct and no changes were made.\n\n--- *Analyzed by AI Agent | No auto-fix applied*`);
      return;
    }

    // 🛡️ NEW: Support for Confidence Score (Improved Regex)
    const confidenceMatch = output.match(/(?:Confidence Score|Confidence)[^:\n]*:\s*(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
    const decision = (confidence >= 75) ? "Commit" : "Review Only";

    console.log(`🧠 Confidence: ${confidence} → Decision: ${decision}`);

    // 🛡️ MODIFIED: More robust regex to catch "Corrected Code", "Fixed Code", or just naked code blocks
    const codeMatch = output.match(/(?:Fixed Code|Corrected Code|Full Corrected Code|Updated Code|Revised Code):?\s*\n```[a-z]*\n([\s\S]*?)```/i) || output.match(/```javascript\n([\s\S]*?)```/i) || output.match(/```\n([\s\S]*?)```/i);
    
    if (confidence >= 75 && codeMatch && codeMatch[1]) {
      const fixedCode = codeMatch[1].trim();
      const fileData = await getFileContent(owner, repo, fileToFix, branch);
      const latestSha = fileData.sha;
      const previousCode = fileData.code;
      
      // 🚀 Step 1: Push the Auto-Fix Commit
      const commitMsg = `AI auto-fix: [${fileToFix}] applied fixes (Confidence: ${confidence}%)`;
      await updateFileOnGitHub(owner, repo, fileToFix, fixedCode, branch, latestSha, commitMsg);
      
      // 📝 Step 2: Post a Celebration Audit Comment
      const auditSummary = output.split(/Fixed Code|Corrected Code|Updated Code|Revised Code/i)[0].trim();
      const finalMsg = `🤖 **Auto-Fix Deployed & Verified!** 🚀\n\nI've analyzed your changes and pushed a professional upgrade to \`${fileToFix}\`.\n\n### 🛡️ What was Improved:\n${auditSummary}\n\n--- *Code refined and committed automatically by AI Agent (Confidence: ${confidence}%)*`;
      
      await postPRComment(owner, repo, pull_number, finalMsg);
      console.log(`✅ AI Success: Fix committed and documented on PR #${pull_number}`);

      // 📦 SAVE TO DATABASE
      try {
        await new AgentLog({
          repo: `${owner}/${repo}`,
          branch: branch,
          prNumber: pull_number,
          previousCode: previousCode,
          updatedCode: fixedCode,
          summary: auditSummary,
          confidence: confidence,
          patch: targetPatch,
        }).save();
        console.log("📦 Saved AI log to database");
      } catch (dbErr) {
        console.error("❌ Database Save Error:", dbErr.message);
      }
    } else {
      const reason = !codeMatch ? "no clear code block identified" : `low confidence score (${confidence}%)`;
      console.warn(`⚠️ AI provided a review but ${reason}. Posting review only.`);
      
      let reviewBody = output;
      if (confidence < 75 && confidenceMatch) {
          reviewBody = `🤖 **AI Review (Caution: Low Confidence: ${confidence}%)**\n\n${output}\n\n--- *Auto-fix was NOT applied due to confidence threshold.*`;
      } else if (!codeMatch) {
          reviewBody = `🤖 **AI Review (No Auto-Fix Applied)**\n\n${output}\n\n--- *Agent could not extract a clean code block to commit.*`;
      }

      await postPRComment(owner, repo, pull_number, reviewBody);
      
      // 📦 SAVE REVIEW LOG TO DATABASE (Optional, but useful)
      try {
        await new AgentLog({
          repo: `${owner}/${repo}`,
          branch: branch,
          prNumber: pull_number,
          previousCode: "", // No fix applied
          updatedCode: "",  // No fix applied
          summary: output,
          confidence: confidence,
          patch: microContext, 
        }).save();
        console.log("📦 Saved AI review log to database");
      } catch (dbErr) {
        console.error("❌ Database Save Review Log Error:", dbErr.message);
      }
    }
  } catch (err) { console.error("❌ Process Error:", err.message); }
};

// --- ROUTES ---

app.post('/api/webhook', async (req, res) => {
  const event = req.headers["x-github-event"];
  const action = req.body?.action;
  const senderType = req.body?.sender?.type;

  // 🛡️ REINFORCED LOOP PROTECTION: Check sender and latest activity
  if (senderType === "Bot") return res.status(200).send('Ignored: Bot');
  
  if (event === "pull_request") {
    // Check if the PR update was actually triggered by an AI auto-fix commit
    // (GitHub doesn't always show the commit msg in the PR event, so we use a "last fix" timestamp check if needed)
    if (action === "opened" || action === "synchronize") {
      const { repository, pull_request } = req.body;
      
      // Additional Safety: If the PR title says "AI auto-fix", we might be in a loop
      if (pull_request.title.includes("AI auto-fix")) return res.status(200).send('Ignored: AI PR');

      console.log(`📡 Event: ${event} | Action: ${action} | User: ${req.body.sender.login}`);
      runPRWorkflow(repository.owner.login, repository.name, pull_request.number, pull_request.head.ref);
    }
  }

  if (event === "issue_comment" && action === "created") {
    const body = req.body.comment.body.toLowerCase();
    if (body.includes("@agent retry") || body.includes("@ai-agent retry")) {
      const { repository, issue } = req.body;
      const prData = await githubFetch(`https://api.github.com/repos/${repository.owner.login}/${repository.name}/pulls/${issue.number}`);
      runPRWorkflow(repository.owner.login, repository.name, issue.number, prData.head.ref);
    }
  }

  res.status(200).send('Webhook Received');
});

app.get('/api/test', (req, res) => res.json({ message: 'AI Agent Hybrid Ready 🚀' }));

// --- LOGGING API ---

// 1. GET all logs sorted by latest
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await AgentLog.find().sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

// 2. GET single log by ID
app.get('/api/logs/:id', async (req, res) => {
  try {
    const log = await AgentLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch log details" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
