const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv-safe').config();

// Models & Services
const { runPRWorkflow, githubFetch } = require('./services/githubAgent');

// Routes
const correctCodeRoute = require('./routes/correctCode');
const explainCodeRoute = require('./routes/explainCode');
const convertCodeRoute = require('./routes/convertCode');
const analyzeComplexityRoute = require('./routes/analyzeComplexity');
const generateCodeRoute = require('./routes/generateCode');
const searchReposRoute = require('./routes/searchRepos');
const analyticsRoute = require('./routes/analytics');
const scaffoldRoute = require('./routes/scaffold');


// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then((conn) => {
    console.log(`📦 Connected to MongoDB: ${conn.connection.host}`);
  })
  .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---
app.use('/api/correct-code', correctCodeRoute);
app.use('/api/explain-code', explainCodeRoute);
app.use('/api/convert-code', convertCodeRoute);
app.use('/api/analyze-complexity', analyzeComplexityRoute);
app.use('/api/generate-code', generateCodeRoute);
app.use('/api/search-repos', searchReposRoute);
app.use('/api/analytics', analyticsRoute);
app.use('/api/scaffold', scaffoldRoute);


// --- WEBHOOK HANDLER ---
app.post('/api/webhook', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

    if (signature !== digest) {
      console.warn('⚠️ Webhook Signature Verification Failed!');
      return res.status(401).send('Invalid Signature');
    }
  } else if (secret) {
    // Secret exists but no signature provided
    return res.status(401).send('Missing Signature');
  }

  const event = req.headers["x-github-event"];
  const action = req.body?.action;
  const senderType = req.body?.sender?.type;

  // Bot protection
  if (senderType === "Bot") return res.status(200).send('Ignored: Bot');

  if (event === "pull_request") {
    if (action === "opened" || action === "synchronize") {
      const { repository, pull_request } = req.body;
      if (pull_request.title.includes("AI auto-fix")) return res.status(200).send('Ignored: AI PR');

      console.log(`📡 Event: ${event} | Action: ${action} | PR: #${pull_request.number}`);
      runPRWorkflow(repository.owner.login, repository.name, pull_request.number, pull_request.head.ref);
    }
  }

  if (event === "issue_comment" && action === "created") {
    const body = req.body.comment.body.toLowerCase();
    if (body.includes("@agent retry") || body.includes("@ai-agent retry")) {
      const { repository, issue } = req.body;
      const prData = await githubFetch(`https://api.github.com/repos/${repository.owner.login}/${repository.name}/pulls/${issue.number}`);
      if (!prData.error) {
        runPRWorkflow(repository.owner.login, repository.name, issue.number, prData.head.ref);
      }
    }
  }

  res.status(200).send('Webhook Received');
});

// Logs & Test
const AgentLog = require('./models/AgentLog');
app.get('/api/test', (req, res) => res.json({ message: 'CodeSage AI Backend Protected & Ready 🚀' }));

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await AgentLog.find().sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.get('/api/logs/:id', async (req, res) => {
  try {
    const log = await AgentLog.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch log" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server audit complete. Running on port ${PORT}`));
