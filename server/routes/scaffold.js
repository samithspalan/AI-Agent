const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  const { repoUrl, repoName } = req.body;

  if (!repoUrl || !repoName) {
    return res.status(400).json({ error: 'Repo URL and Name are required.' });
  }

  // Define workspace paths
  const workspacesDir = path.join(__dirname, '../temp_workspaces');
  const projectDir = path.join(workspacesDir, repoName);
  const zipFilePath = path.join(workspacesDir, `${repoName}.zip`);

  // Setup Server-Sent Events (SSE) for the Live Terminal
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent Nginx buffering

  const streamMsg = (msg) => {
    res.write(`data: ${JSON.stringify({ text: msg })}\n\n`);
    if (res.flush) res.flush(); // Express compression compatibility
  };

  try {
    if (!fs.existsSync(workspacesDir)) fs.mkdirSync(workspacesDir, { recursive: true });

    streamMsg(`> Initializing secure workspace for ${repoName}...`);
    
    // 1. Clone the repository
    streamMsg(`> Executing git clone ${repoUrl}...`);
    await new Promise((resolve, reject) => {
      exec(`git clone ${repoUrl} "${projectDir}"`, (err, stdout, stderr) => {
        if (err) reject(new Error(`Git Clone Failed: ${stderr || err.message}`));
        else resolve();
      });
    });

    // 2. Strip .git folder
    streamMsg(`> Stripping version control history...`);
    const gitDir = path.join(projectDir, '.git');
    if (fs.existsSync(gitDir)) {
      fs.rmSync(gitDir, { recursive: true, force: true });
    }

    // 3. Zip the project
    streamMsg(`> Finalizing ZIP archive with archiver@zlib:level9...`);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      
      output.on('close', resolve);
      output.on('error', (err) => reject(new Error(`Stream Error: ${err.message}`)));
      archive.on('error', (err) => reject(new Error(`Archiver Error: ${err.message}`)));
      
      archive.pipe(output);
      archive.directory(projectDir, repoName);
      archive.finalize();
    });

    // 4. Read Local Context
    streamMsg(`> Inspecting local files for architectural context...`);
    let packageJsonContent = "{}";
    let readmeSnippet = "No README provided.";

    try {
      const pkgPath = path.join(projectDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        packageJsonContent = fs.readFileSync(pkgPath, 'utf8');
      }
      const files = fs.readdirSync(projectDir);
      const readmeFile = files.find(f => f.toLowerCase().startsWith('readme'));
      if (readmeFile) {
        readmeSnippet = fs.readFileSync(path.join(projectDir, readmeFile), 'utf8').slice(0, 3000);
      }
    } catch (fsErr) {
      console.warn("FS Context read failed:", fsErr.message);
    }

    streamMsg(`> Terminating temporary workspace environment...`);
    try {
      fs.rmSync(projectDir, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn("Cleanup failed:", rmErr.message);
    }

    // 5. Generate Setup Commands using AI
    streamMsg(`> Analyzing metadata for intelligent setup commands...`);
    
    const prompt = `Act as a Senior DevOps Engineer. 
Analyze the provided package.json and README snippet to output a markdown block of setup commands for the repository: ${repoName} (${repoUrl}).

PACKAGE_JSON:
${packageJsonContent}

README_SNIPPET:
${readmeSnippet}

YOUR MISSION:
1. Provide standard installation commands (e.g., npm install).
2. Identify and include Global Tools required based on scripts/deps (e.g., npm install -g prisma, pm2, typescript).
3. Identify and resolve potential missing Peer Dependencies.
4. Output ONLY the bash commands in a markdown block, using short '#' comments for clarity. Do not explain anything else.`;
    
    let setupCommands = "";
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ 
            model: "llama-3.3-70b-versatile", 
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
        })
      });
      
      if (!groqRes.ok) throw new Error(`Groq Status ${groqRes.status}`);
      const groqData = await groqRes.json();
      setupCommands = groqData.choices[0].message.content;
    } catch (e) {
      console.warn("Groq failed, using Gemini:", e.message);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const fallbackData = await model.generateContent(prompt);
        setupCommands = fallbackData.response.text();
      } catch (geminiErr) {
        setupCommands = "```bash\n# Standard Setup\nnpm install\nnpm start\n```";
      }
    }

    // Send final payload
    res.write(`data: ${JSON.stringify({ done: true, downloadUrl: `/api/scaffold/download/${repoName}.zip`, commands: setupCommands })}\n\n`);

  } catch (err) {
    console.error("Scaffold Fatal Error:", err);
    streamMsg(`> FATAL_ERROR: ${err.message}`);
    res.write(`data: ${JSON.stringify({ error: true, details: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

// Route to download the actual zip file
router.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, '../temp_workspaces', req.params.filename);
  if (fs.existsSync(file)) {
    res.download(file, (err) => {
      if (!err) {
        try { fs.unlinkSync(file); } catch (e) {} // Delete zip after download
      }
    });
  } else {
    res.status(404).send('File not found');
  }
});

module.exports = router;
