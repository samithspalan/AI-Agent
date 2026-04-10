const { GoogleGenerativeAI } = require('@google/generative-ai');
const AgentLog = require('../models/AgentLog');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const lastProcessedShas = new Map();
const lastProcessedTimes = new Map();

/**
 * Generic retry wrapper with exponential backoff
 */
const withRetry = async (fn, retries = 3, backoff = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    console.log(`⚠️ Retrying after ${backoff}ms... (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, backoff));
    return withRetry(fn, retries - 1, backoff * 2);
  }
};

const githubFetch = async (u, m = 'GET', b = null) => {
  return await withRetry(async () => {
    const op = {
      method: m,
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'Node-AI-Agent',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };
    if (b) op.body = JSON.stringify(b);

    const resp = await fetch(u, op);
    const data = await resp.json();
    if (!resp.ok) {
        // Only retry on 5xx or rate limits (403/429)
        if (resp.status >= 500 || resp.status === 403 || resp.status === 429) {
            throw new Error(`GitHub HTTP ${resp.status}: ${data.message || 'Error'}`);
        }
        return { error: true, message: data.message || 'GitHub Error', status: resp.status };
    }
    return data;
  });
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

const updateFileOnGitHub = async (o, r, p, code, br, sha, msg = "AI auto-fix: applied fixes") => 
  await githubFetch(`https://api.github.com/repos/${o}/${r}/contents/${p}`, 'PUT', { message: msg, content: Buffer.from(code).toString('base64'), branch: br, sha });

const postPRComment = async (o, r, n, body) => 
  await githubFetch(`https://api.github.com/repos/${o}/${r}/issues/${n}/comments`, 'POST', { body });

/**
 * AI Service: Groq (Primary) with Gemini Fallback
 */
const callGroqAI = async (prompt) => {
  console.log("⚡ [Primary] Attempting with Groq (Llama-3.3-70b)...");
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
  console.log("📡 [Fallback] Attempting with Gemini...");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
      console.log(`🛡️ Loop Intercepted: PR #${pull_number} recently updated.`);
      return;
    }

    const commitData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/commits/${currentSha}`);
    if (commitData.commit?.message?.includes("AI auto-fix")) {
      console.log(`🛡️ Loop Intercepted: AI commit.`);
      lastProcessedShas.set(currentSha, true);
      return;
    }

    if (lastProcessedShas.has(currentSha)) {
      console.log(`🛡️ Loop Intercepted: SHA already seen.`);
      return;
    }

    lastProcessedShas.set(currentSha, true);
    lastProcessedTimes.set(pull_number, now);

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

    const prompt = `You are a strict senior software engineer performing a code audit.
## MANDATORY RULES:
1. CHECK only for: syntax errors, undefined variables, broken logic, missing return statements, invalid function calls, or runtime-breaking issues.
2. DO NOT change code for style or naming.
3. IF NO BUGS FOUND → respond with EXACTLY: "NO CHANGES NEEDED".
4. IF BUGS FOUND → describe each bug, then output FULL corrected file in a single \`\`\`javascript block.
5. End with: "Confidence Score: <number>" (0-100).

## CODE DIFF for \`${fileToFix}\`:
${microContext}`;

    let output;
    try {
      output = await callGroqAI(prompt);
    } catch (err) {
      try {
        output = await callGeminiAI(prompt);
      } catch (gemErr) {
        console.error("💀 ALL AI FAILED.");
        await postPRComment(owner, repo, pull_number, "🤖 **AI Status**: ⚠️ AI Services unavailable.");
        return;
      }
    }

    const isPerfect = !output.includes("```javascript") && !output.includes("```js") && 
                     (/NO CHANGES NEEDED/i.test(output) || /no bugs detected/i.test(output));

    if (isPerfect) {
      await postPRComment(owner, repo, pull_number, `🤖 **AI Audit Complete — No Issues Found**\n\n✅ I reviewed \`${fileToFix}\` and found no errors.`);
      return;
    }

    const confidenceMatch = output.match(/(?:Confidence Score|Confidence)[^:\n]*:\s*(\d+)/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
    const codeMatch = output.match(/```(?:javascript|js)?\n([\s\S]*?)```/i);

    if (confidence >= 75 && codeMatch && codeMatch[1]) {
      const fixedCode = codeMatch[1].trim();
      const fileData = await getFileContent(owner, repo, fileToFix, branch);
      await updateFileOnGitHub(owner, repo, fileToFix, fixedCode, branch, fileData.sha, `AI auto-fix: [${fileToFix}] (Confidence: ${confidence}%)`);

      const auditSummary = output.split(/```/)[0].trim();
      await postPRComment(owner, repo, pull_number, `🤖 **Auto-Fix Deployed!** 🚀\n\n### 🛡️ Improvements:\n${auditSummary}\n\n--- *Confidence: ${confidence}%*`);

      // SAVE TO DB
      await new AgentLog({
        repo: `${owner}/${repo}`,
        branch,
        prNumber: pull_number,
        previousCode: fileData.code,
        updatedCode: fixedCode,
        summary: auditSummary,
        confidence,
        patch: targetPatch
      }).save();
    } else {
      await postPRComment(owner, repo, pull_number, `🤖 **AI Review (No Auto-Fix Applied)**\n\n${output}`);
    }
  } catch (err) { console.error("❌ Workflow Error:", err.message); }
};

module.exports = { runPRWorkflow, githubFetch };
