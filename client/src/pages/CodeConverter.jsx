import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import {
  Code,
  Trash2,
  Copy,
  Check,
  Loader2,
  Repeat,
  Zap,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

const CodeConverter = () => {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('javascript');
  const [targetLanguage, setTargetLanguage] = useState('python');
  const [isConverting, setIsConverting] = useState(false);
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
    { value: 'c#', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
  ];

  const handleConvert = async () => {
    if (!inputCode.trim()) return;

    setIsConverting(true);
    setOutputCode('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/convert-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: inputCode,
          source: sourceLanguage,
          target: targetLanguage
        }),
      });

      if (!response.ok) throw new Error('Failed to start conversion');

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
              setIsConverting(false);
              break;
            }

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                setOutputCode(fullText);
              } else if (data.error) {
                setOutputCode(`❌ Error: ${data.error}`);
                setIsConverting(false);
                break;
              }
            } catch (e) {
              // Ignore partial JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Conversion Error:', error);
      setIsConverting(false);
      setOutputCode('❌ Failed to connect to server. Ensure backend is running.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
  };

  // Theme Helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg} pt-24 pb-20 px-6 transition-colors duration-300 relative overflow-hidden`}>
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

      {/* Decorative Orbs */}
      {isDark && (
        <>
          <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Section */}
        <header className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                <Repeat className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-indigo-400 via-blue-300 to-cyan-400 text-transparent bg-clip-text tracking-tight">
                  Code Converter
                </h1>
                <p className={`text-xs font-medium ${textSecondary}`}>Migrate logic across stacks instantly with sub-second latency.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 backdrop-blur-md p-4 rounded-3xl border border-white/5 bg-white/5">
              <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary} px-2`}>Convert To</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`px-5 py-2.5 rounded-xl border border-white/10 outline-none cursor-pointer font-bold text-xs uppercase tracking-widest transition-all ${isDark ? 'bg-[#0A1120] text-indigo-300 hover:border-indigo-500/40' : 'bg-white text-indigo-600 shadow-sm'
                  }`}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">

          {/* Left Column: Source */}
          <div className={`relative flex flex-col min-h-[340px] h-[calc(100vh-16rem)] border rounded-3xl overflow-hidden backdrop-blur-md transition-all shadow-2xl ${cardBg}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className={`bg-transparent outline-none font-black text-[10px] uppercase tracking-widest cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={clearAll}
                className={`transition-colors p-1.5 rounded-lg ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`Write ${sourceLanguage} here...`}
              className={`flex-1 w-full p-8 code-textarea outline-none resize-none bg-transparent text-sm leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          {/* Action Group */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={handleConvert}
              disabled={isConverting || !inputCode.trim()}
              className={`relative w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all duration-500 group ${inputCode.trim()
                ? (isConverting ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 hover:scale-110 active:scale-95')
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
            >
              {isConverting ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Repeat className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" />
              )}
            </button>
          </div>

          {/* Right Column: Result */}
          <div className={`relative flex flex-col min-h-[340px] h-[calc(100vh-16rem)] border rounded-3xl overflow-hidden backdrop-blur-md transition-all shadow-2xl ${outputCode ? 'border-indigo-500/30 shadow-indigo-500/5' : cardBg
            }`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {targetLanguage} Output
              </span>
              <button
                onClick={copyToClipboard}
                disabled={!outputCode}
                className={`transition-colors p-1.5 rounded-lg ${isCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-indigo-500/10'
                  }`}
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden">
              {isConverting && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="h-0.5 w-full bg-indigo-500 shadow-[0_0_15px_indigo] opacity-50 animate-[scan_2s_linear_infinite]" />
                </div>
              )}
              <textarea
                readOnly
                value={outputCode}
                placeholder={isConverting ? "Analyzing architecture & porting logic..." : `Target ${targetLanguage} code will appear here...`}
                className={`w-full h-full p-8 code-textarea outline-none resize-none bg-transparent text-sm leading-relaxed ${outputCode ? (isDark ? 'text-indigo-300' : 'text-indigo-800') : (isDark ? 'text-slate-700' : 'text-slate-400')
                  }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className={`mt-10 p-6 rounded-3xl border flex items-center gap-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-1 ${textPrimary}`}>Autonomous Porting Engine</h4>
            <p className={`text-[10px] font-medium ${textSecondary}`}>This feature uses Groq-accelerated Llama-3 70B for zero-latency conversion. Logic, variable scopes, and async patterns are preserved as per target language idiomatics.</p>
          </div>
          <div className="ml-auto hidden lg:flex items-center gap-4 border-l border-white/10 pl-10">
            <div className="text-right">
              <p className={`text-[9px] font-black uppercase tracking-widest ${textSecondary}`}>Engine Status</p>
              <p className="text-emerald-400 text-[10px] font-bold">OPTIMIZED (8.2k t/s)</p>
            </div>
            <Cpu className={`w-5 h-5 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeConverter;
