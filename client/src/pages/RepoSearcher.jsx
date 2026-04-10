import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Search, 
  Rocket, 
  AlertCircle, 
  Loader2, 
  Github, 
  Notebook as Robot, 
  ArrowLeft, 
  ChevronRight, 
  Cpu, 
  Zap,
  Star,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const RepoSearcher = () => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [terminalStream, setTerminalStream] = useState([]);
  const [isScaffolding, setIsScaffolding] = useState(false);
  const [setupCommands, setSetupCommands] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const terminalEndRef = useRef(null);

  // View: 'search' | 'results'
  const showResults = result || error || loading;

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalStream]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult('');
    setCandidates([]);
    setError('');
    setTerminalStream([]);
    setSetupCommands('');
    setDownloadUrl('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const resp = await axios.post(`${apiUrl}/api/search-repos`, { query, requirements });
      setResult(resp.data.analysis);
      setCandidates(resp.data.candidates || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to scout repositories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setResult('');
    setCandidates([]);
    setError('');
    setTerminalStream([]);
    setSetupCommands('');
    setDownloadUrl('');
  };

  const handleScaffold = async (repoUrl, repoName) => {
    if (!repoUrl || !repoName) return;
    setIsScaffolding(true);
    setTerminalStream([]);
    setSetupCommands('');
    setDownloadUrl('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/scaffold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, repoName })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep the last partial line in buffer

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const jsonStr = line.replace('data: ', '').trim();
              if (!jsonStr) continue;
              const data = JSON.parse(jsonStr);
              if (data.text) setTerminalStream(prev => [...prev, data.text]);
              if (data.done) { 
                setDownloadUrl(data.downloadUrl); 
                setSetupCommands(data.commands); 
                setIsScaffolding(false); 
              }
              if (data.error) setIsScaffolding(false);
            } catch (e) {
              console.warn("SSE Parse Error:", e);
            }
          }
        }
      }
    } catch (err) {
      setTerminalStream(prev => [...prev, '> Failed to connect to execution environment.']);
      setIsScaffolding(false);
    }
  };

  // ─── Search View ─────────────────────────────────────────────────────────────
  if (!showResults) {
    return (
      <div className={`min-h-screen pt-24 pb-20 px-6 flex flex-col items-center justify-center transition-colors duration-500 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
        {/* Decorative orb */}
        {isDark && <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />}

        <div className="w-full max-w-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4 leading-none">
              Scout the{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Best Codebases
              </span>
            </h1>
            <p className={`text-base font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Describe what you're building. The agent deep-inspects repos — reading their README and dependencies — before recommending the best match.
            </p>
          </div>

          {/* Search Card */}
          <form
            onSubmit={handleSearch}
            className={`p-8 rounded-[2rem] border space-y-6 transition-all ${isDark ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-2xl'}`}
          >
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                What are you building?
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., MERN Dashboard, AI Chat UI, E-commerce..."
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border text-sm font-medium transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border-white/5 focus:border-emerald-500/50 placeholder:text-slate-600'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-400 placeholder:text-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Specific Requirements <span className="font-medium normal-case tracking-normal opacity-60">(optional)</span>
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g., Must use Tailwind, needs Docker support, TypeScript only, clean architecture..."
                rows="3"
                className={`w-full p-4 rounded-2xl outline-none border text-sm font-medium transition-all resize-none ${
                  isDark
                    ? 'bg-slate-800/80 border-white/5 focus:border-emerald-500/50 placeholder:text-slate-600'
                    : 'bg-slate-50 border-slate-200 focus:border-emerald-400 placeholder:text-slate-400'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!query.trim()}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95"
            >
              <Search className="w-5 h-5" /> Start AI Scout <ChevronRight className="w-4 h-4 text-emerald-300" />
            </button>
          </form>

          {/* Trust badges */}
          <div className={`mt-6 flex items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> Groq LLaMA 3.3</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Deep README Scan</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-40" />
            <span className="flex items-center gap-1.5"><Rocket className="w-3 h-3" /> One-click Scaffold</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Results View (full-width) ────────────────────────────────────────────────
  return (
    <div className={`min-h-screen pt-24 pb-20 px-6 transition-colors duration-500 ${isDark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {isDark && <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button + Context */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>
          <div className={`flex items-center gap-2 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Scouting for: <span className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>"{query}"</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`p-16 rounded-[2rem] border flex flex-col items-center justify-center text-center transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
              <Robot className="absolute inset-0 m-auto w-10 h-10 text-emerald-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black mb-2">Agent is Scouting...</h3>
            <p className={`max-w-sm font-medium animate-pulse ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fetching candidates, reading READMEs & package.json, reasoning with ReAct logic...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-black text-lg">Scout Failed</p>
              <p className="font-medium text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* AI Analysis Result */}
        {result && !loading && (
          <div className="space-y-10">
            <div className={`rounded-[2rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
              {/* Result Header */}
              <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} rounded-t-[2rem]`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30">
                    <Robot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Expert AI Curator</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Deep Inspection Complete
                    </p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ReAct Verified
                </div>
              </div>

              {/* Markdown Result */}
              <div className={`p-8 prose prose-sm max-w-none ${isDark ? 'prose-invert' : 'prose-slate'}`}>
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => <a {...props} className="text-emerald-500 hover:text-emerald-400 font-bold" target="_blank" rel="noreferrer" />,
                    h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-black mb-4" />,
                    h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold mb-3 mt-8" />,
                    h3: ({ node, ...props }) => <h3 {...props} className="text-base font-black mb-2 mt-6" />,
                    ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 space-y-2 mb-4" />,
                    li: ({ node, ...props }) => <li {...props} className={isDark ? 'text-slate-300' : 'text-slate-600'} />,
                    code: ({ node, ...props }) => <code {...props} className={`px-1.5 py-0.5 rounded text-xs font-mono ${isDark ? 'bg-white/10 text-emerald-300' : 'bg-slate-100 text-emerald-700'}`} />,
                    pre: ({ node, ...props }) => <pre {...props} className={`p-4 rounded-xl text-xs overflow-x-auto ${isDark ? 'bg-black/40 border border-white/10' : 'bg-slate-900 text-slate-100'}`} />,
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </div>

            {/* Select a Repository to Scaffold */}
            {candidates.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Rocket className="w-6 h-6 text-emerald-500" />
                    Select a Repository to Scaffold
                  </h3>
                  <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    One-click environment preparation
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.map((repo, idx) => (
                    <div 
                      key={idx} 
                      className={`group p-6 rounded-[2rem] border transition-all hover:scale-[1.02] flex flex-col justify-between ${
                        isDark 
                          ? 'bg-white/5 border-white/10 hover:border-emerald-500/50' 
                          : 'bg-white border-slate-200 shadow-xl hover:border-emerald-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <Github className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            {repo.stars.toLocaleString()}
                          </div>
                        </div>
                        <h4 className={`text-sm font-black truncate mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{repo.name}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{repo.language || 'Unknown'}</p>
                        <p className={`text-xs font-medium line-clamp-2 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{repo.description || 'No description provided.'}</p>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => handleScaffold(repo.url, repo.name)}
                          disabled={isScaffolding}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          {isScaffolding ? 'Deploying...' : 'Scaffold This'}
                        </button>
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`w-full py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Terminal & Setup Commands */}
            {(isScaffolding || terminalStream.length > 0 || setupCommands) && (
              <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">System Execution Engine</h3>
                  </div>
                  {isScaffolding && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processing...</span>
                    </div>
                  )}
                </div>

                <div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0F172A]">
                  {/* Terminal header */}
                  <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="ml-3 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">codesage_terminal_v1.0</span>
                    </div>
                  </div>
                  
                  {/* Terminal body */}
                  <div className="p-8 font-mono text-xs leading-relaxed overflow-hidden">
                    <div className="space-y-2 text-emerald-400/90 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                      {terminalStream.map((line, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className="text-emerald-500/30 select-none">$</span>
                          <span>{line}</span>
                        </div>
                      ))}
                      {isScaffolding && (
                        <div className="flex gap-4">
                          <span className="text-emerald-500/30 select-none">$</span>
                          <span className="animate-pulse text-emerald-100">_</span>
                        </div>
                      )}
                      <div ref={terminalEndRef} />
                    </div>

                    {setupCommands && (
                      <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                            <Rocket className="w-4 h-4" />
                          </div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Environment Ready — Intelligent Setup:</h4>
                        </div>
                        
                        <div className={`prose prose-invert prose-xs max-w-none mb-8 text-slate-300 bg-black/30 p-6 rounded-2xl border border-white/5`}>
                          <ReactMarkdown>{setupCommands}</ReactMarkdown>
                        </div>

                        {downloadUrl && (
                          <div className="flex flex-col sm:flex-row gap-4">
                            <a
                              href={`${import.meta.env.VITE_API_URL || ''}${downloadUrl}`}
                              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 text-center"
                            >
                              Download Scaffolding (.zip)
                            </a>
                            <button
                              onClick={() => { setSetupCommands(''); setTerminalStream([]); setDownloadUrl(''); }}
                              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl text-center"
                            >
                              Start Fresh
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoSearcher;
