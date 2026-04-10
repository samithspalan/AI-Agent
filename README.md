# CodeSage: Autonomous AI Code Guardian 🛡️🚀

CodeSage is a high-performance, autonomous AI development agent designed to revolutionize the software development lifecycle. It monitors your GitHub repositories in real-time, performing deep code audits on every Pull Request and autonomously pushing high-confidence fixes for logic and syntax bugs.

![CodeSage Showcase](https://ai-agent-1-r12b.onrender.com/)

## 🌟 Core Features

### 🤖 Autonomous PR Audit & Auto-Fix
- **Real-time Webhook Monitoring**: Instantly reacts to PR creation and updates.
- **Hybrid AI Engine**: Leverages a dual-brain architecture using **Groq (Llama 3.3 70B)** for primary reasoning and **Google Gemini Flash** for robust fallbacks.
- **Confidence-Based Commits**: Only pushes automated fixes to your branch if the AI achieves a confidence score of **75% or higher**, ensuring stability.
- **Micro-Context Analysis**: Analyzes logical diffs instead of just raw syntax to understand the *intent* of your changes.

### 🛠️ AI Developer Toolkit
- **Code Explainer**: Get instant, human-readable breakdowns of complex logic.
- **Code Converter**: Multi-language translation (e.g., Python to JavaScript).
- **Complexity Analyzer**: Tracks cyclomatic complexity and suggests optimizations.
- **Bug Corrector**: Identifies and resolves syntax errors, undefined variables, and broken logic.
- **Code Generator**: Converts natural language prompts into production-ready code blocks.

### 📊 Transparent Monitoring
- **AI Audit Dashboard**: A sleek, high-fidelity React interface to track every decision made by the agent.
- **Detailed Logs**: View previous/updated code diffs, audit summaries, and confidence scores for every automated action.
- **Interactive Commands**: Control the agent directly from GitHub comments (e.g., `@agent retry`).

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose) for persistence of agent logs and audit trails.
- **Auth**: Clerk for secure developer authentication.
- **AI Services**: Groq API, Google Generative AI (Gemini).

### Architecture Overview
CodeSage follows a modern distributed architecture:
1. **GitHub Webhooks** trigger the Express backend.
2. **Analysis Pipeline** fetches micro-contexts via GitHub API.
3. **Hybrid AI Layer** processes the diff using the confidence-weighted model.
4. **Action Layer** either posts a PR review comment or pushes an auto-fix commit.
5. **Logging Layer** stores the entire transaction in MongoDB for dashboard visualization.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- GitHub Personal Access Token (with `repo` permissions)
- API Keys: Groq, Gemini, Clerk

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/samithspalan/AI-Agent.git
   cd AI-Agent
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

### Webhook Configuration
Set your GitHub Webhook URL to `your-domain/api/webhook` with the content type `application/json`.

---

## 🛡️ Loop Protection
CodeSage implements advanced safety mechanisms:
- **Bot Detection**: Ignores activity from other AI agents.
- **Recursive Prevention**: Filters out commits tagged with `AI auto-fix`.
- **Temporal Debouncing**: Prevents rapid-fire triggers on the same PR.

---

## 📄 License
This project is licensed under the ISC License.

---
*Built with ❤️ by the CodeSage Team.*
