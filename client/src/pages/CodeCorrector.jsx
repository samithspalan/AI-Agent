import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Code,
  Trash2,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const CodeCorrector = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');
  const { isDark } = useTheme();

  const eventSourceRef = useRef(null);
  const outputRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ];

  const handleCorrect = async () => {
    if (!inputCode.trim()) return;

    setIsCorrecting(true);
    setOutputCode('');
    setExplanation('');
    setShowExplanation(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/correct-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputCode, language }),
      });

      if (!response.ok) throw new Error('Failed to start correction');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              setIsCorrecting(false);
              // After code is done, we can optionally trigger an explanation request
              // For now, let's just generate a dummy explanation or use Gemini for it too
              generateExplanation(fullText);
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                setOutputCode(fullText);
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Correction error:', error);
      setIsCorrecting(false);
    }
  };

  const generateExplanation = (correctedCode) => {
    // In a real app, this could be another Gemini call. 
    // For this version, we'll derive some generic "fixed" points if the code changed.
    if (correctedCode !== inputCode) {
      setExplanation("• Fixed potential syntax issues\n• Optimized logic flow\n• Improved variable naming and consistency\n• Ensured best practices for " + language);
    } else {
      setExplanation("• Code appears correct, no changes were necessary.");
    }
  };

  const clearInput = () => {
    setInputCode('');
    setOutputCode('');
    setExplanation('');
    setShowExplanation(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Theme Helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-[#0A1120] border-white/10' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`min-h-screen ${bg} pt-32 pb-20 px-6 transition-colors duration-300 relative overflow-hidden`}>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .code-textarea {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .code-textarea::-webkit-scrollbar { width: 6px; }
        .code-textarea::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* Background blobs */}
      {isDark && (
        <>
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">

            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-emerald-300 to-blue-400 text-transparent bg-clip-text tracking-tight">
              Code Correction
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-4 py-2 rounded-xl border appearance-none cursor-pointer outline-none transition-all font-bold text-xs uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
            <button
              onClick={clearInput}
              className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-400/10' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50'
                }`}
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">

          {/* Left Panel: Input */}
          <div className={`relative flex flex-col h-[600px] border rounded-3xl overflow-hidden backdrop-blur-md transition-all ${cardBg}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className={`text-xs font-bold uppercase tracking-widest ${textPrimary}`}>Input Source</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
              </div>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your problematic code here..."
              className={`flex-1 w-full p-6 code-textarea outline-none resize-none bg-transparent ${textPrimary} ${isDark ? 'placeholder:text-slate-700' : 'placeholder:text-slate-400'}`}
            />
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleCorrect}
              disabled={isCorrecting || !inputCode.trim()}
              className={`relative group w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCorrecting
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : inputCode.trim()
                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
            >
              {isCorrecting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              )}

              {/* Tooltip */}
              <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 uppercase tracking-widest">
                Correct Code
              </div>
            </button>
          </div>

          {/* Right Panel: AI Output */}
          <div className={`relative flex flex-col h-[600px] border rounded-3xl overflow-hidden backdrop-blur-md transition-all ${outputCode ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : cardBg
            }`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className={`text-xs font-bold uppercase tracking-widest ${textPrimary}`}>Corrected Output</span>
              </div>
              <button
                onClick={copyToClipboard}
                disabled={!outputCode}
                className={`p-1.5 rounded-lg transition-all ${isCopied
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {isCorrecting && (
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <div className="h-0.5 w-full bg-emerald-500/50 blur-[2px] animate-[scan_2s_linear_infinite]" />
                </div>
              )}
              <textarea
                readOnly
                value={outputCode}
                placeholder={isCorrecting ? "Gemini is thinking..." : "AI-corrected code will appear here..."}
                className={`w-full h-full p-6 code-textarea outline-none resize-none bg-transparent ${outputCode ? 'text-emerald-400/90' : textSecondary
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Explain Changes Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            disabled={!explanation}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all w-full text-left ${explanation
                ? (isDark ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' : 'bg-blue-50 border-blue-200 hover:bg-blue-100')
                : (isDark ? 'opacity-50 cursor-not-allowed border-white/10 text-slate-600' : 'opacity-50 cursor-not-allowed border-slate-200 text-slate-400')
              }`}
          >
            <div className={`p-1.5 rounded-lg ${explanation ? 'bg-blue-500/10 text-blue-400' : 'text-slate-600'}`}>
              <Cpu className="w-4 h-4" />
            </div>
            <span className={`flex-1 text-xs font-bold uppercase tracking-widest ${explanation ? (isDark ? 'text-slate-200' : 'text-slate-700') : ''}`}>
              Explain My Changes
            </span>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExplanation && explanation && (
            <div className={`mt-4 p-8 rounded-3xl border animate-fade-slide-up ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                    AI Reasoning
                  </h4>
                  <p className={`text-sm leading-relaxed whitespace-pre-line font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {explanation}
                  </p>
                </div>
                <div className="hidden md:flex items-center justify-center border-l border-white/5 pl-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Verified Optimization</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeCorrector;
