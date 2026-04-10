import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Wand2,
  Code,
  Copy,
  Check,
  Loader2,
  Trash2,
  Sparkles,
  ChevronRight,
  Info,
  Lightbulb,
  Zap,
  Globe,
  ShieldCheck,
  ZapOff,
  Terminal
} from 'lucide-react';

const CodeGenerator = () => {
  const [description, setDescription] = useState('');
  const [context, setContext] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { isDark } = useTheme();

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML/CSS' },
  ];

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setGeneratedCode('');
    setExplanation('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://ai-agent-apnv.onrender.com'}/api/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          language,
          context
        }),
      });

      if (!response.ok) throw new Error('Failed to start generation');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullCode = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              setIsGenerating(false);
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullCode += data.text;
                setGeneratedCode(fullCode);
              } else if (data.explanation) {
                setExplanation(data.explanation);
              } else if (data.error) {
                setGeneratedCode(`❌ Error: ${data.error}`);
                setIsGenerating(false);
                break;
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Generation failure:', error);
      setIsGenerating(false);
      alert('Internal Server Error. Please ensure backend services are active.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearAll = () => {
    setDescription('');
    setContext('');
    setGeneratedCode('');
    setExplanation('');
  };

  // Theme Helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg} pt-24 pb-20 px-6 transition-colors duration-300 relative overflow-hidden`}>
      <style>{`
        .code-textarea {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .code-textarea::-webkit-scrollbar { width: 6px; }
        .code-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* Background Decor */}
      {isDark && (
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(59,130,246,0.05),transparent_40%)] pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Modern Compact Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 text-transparent bg-clip-text tracking-tight">
                Code Generator
              </h1>
              <p className={`text-xs font-medium ${textSecondary}`}>Translate requirements into stable, production-ready source code.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-5 py-2.5 rounded-xl border outline-none font-bold text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                }`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !description.trim()}
              className={`flex items-center gap-3 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${description.trim()
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-50'
                }`}
            >
              {isGenerating ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing... </>
              ) : (
                <> Generate Code <Wand2 className="w-4 h-4" /> </>
              )}
            </button>
          </div>
        </header>

        {/* Modern Split Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[380px] h-[calc(100vh-14rem)]">

          {/* Left Column: Requirements */}
          <div className="flex flex-col gap-6">
            <div className={`flex-1 flex flex-col border rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all shadow-2xl ${cardBg}`}>
              <div className={`px-8 py-4 border-b flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Requirement Definition</span>
                </div>
                <button onClick={clearAll} className={`p-1.5 rounded-lg ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500'}`}><Trash2 className="w-4 h-4" /></button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the logic you need. Example: Create a Node.js API endpoint to stream file uploads to S3 with progress tracking..."
                className={`flex-1 w-full p-8 code-textarea outline-none resize-none bg-transparent text-sm leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400'}`}
              />
            </div>

            <div className={`p-8 rounded-[2.5rem] border ${cardBg}`}>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Technical Context</span>
              </div>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Additional constraints: use async/await, no external libraries, functional style..."
                className={`w-full h-24 outline-none resize-none bg-transparent font-medium text-xs leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400'}`}
              />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className={`relative flex flex-col border rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all shadow-2xl ${generatedCode ? 'border-blue-500/30' : cardBg
            }`}>
            <div className={`px-8 py-4 border-b flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Synthesized Source: {language}</span>
                {generatedCode && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!generatedCode}
                className={`transition-all p-2 rounded-xl ${isCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
              >
                {isCopied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {generatedCode ? (
                <>
                  <div className="flex-1 p-8">
                    <pre className={`text-sm leading-relaxed whitespace-pre-wrap font-mono ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>{generatedCode}</pre>
                  </div>
                  {explanation && (
                    <div className={`m-6 p-6 rounded-3xl border animate-fade-in ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex items-center gap-3 mb-3 text-emerald-400">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Logic Insight</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{explanation}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  {isGenerating ? (
                    <div className="space-y-6">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/10 animate-pulse" />
                        <div className="absolute inset-0 rounded-2xl border-t-2 border-blue-500 animate-spin" />
                        <Code className="absolute inset-6 w-8 h-8 text-blue-400" />
                      </div>
                      <p className={`text-sm font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-indigo-300 text-transparent bg-clip-text animate-pulse`}>
                        Synthesizing Logical Pattern...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`w-20 h-20 mx-auto rounded-[2rem] border flex items-center justify-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <ZapOff className={`w-10 h-10 ${isDark ? 'text-slate-800' : 'text-slate-300'}`} />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className={`text-xl font-black uppercase tracking-[0.2em] mb-2 ${textPrimary}`}>Ready to Build</p>
                        <p className={`text-xs font-medium ${textSecondary}`}>Enter your requirements on the left to project an optimized solution here.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`px-8 py-3 border-t flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500/40" />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${textSecondary}`}>Production Optimized Output</span>
              </div>
              <div className="flex items-center gap-4 text-blue-400 opacity-50">
                <Zap className="w-4 h-4" />
                <Terminal className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
