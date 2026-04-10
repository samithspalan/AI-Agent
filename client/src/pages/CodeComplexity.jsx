import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  Activity,
  BarChart2,
  Layers,
  TrendingUp,
  Zap,
  Loader2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Cpu,
  ChevronRight,
  ShieldCheck,
  ZapOff
} from 'lucide-react';

const CodeComplexity = () => {
  const [inputCode, setInputCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const { isDark } = useTheme();

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'go', label: 'Go' },
    { value: 'cpp', label: 'C++' },
    { value: 'rust', label: 'Rust' },
  ];

  const handleAnalyze = async () => {
    if (!inputCode.trim()) return;

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze-complexity`, {
        code: inputCode,
        language
      });
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis Error:', error);
      alert('AI failed to analyze. Please try again with different code.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setInputCode('');
    setAnalysis(null);
  };

  const getRatingStyles = (rating) => {
    switch (rating) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Good': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Needs Improvement': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
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

      {/* Decorative Radiance */}
      {isDark && (
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header Title */}
        <header className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-transparent bg-clip-text tracking-tight">
                Complexity Analyzer
              </h1>
              <p className={`text-xs font-medium ${textSecondary}`}>Identify algorithmic bottlenecks and optimize your memory footprint.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
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
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputCode.trim()}
              className={`flex items-center gap-2 px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${inputCode.trim()
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5 opacity-50'
                }`}
            >
              {isAnalyzing ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> PROFILING... </>
              ) : (
                <> Analyze Complexity <ChevronRight className="w-4 h-4" /> </>
              )}
            </button>
          </div>
        </header>

        {/* Split Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch min-h-[380px] h-[calc(100vh-14rem)]">

          {/* Left Column: Input */}
          <div className={`relative flex flex-col border rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all shadow-2xl ${cardBg}`}>
            <div className={`flex items-center justify-between px-8 py-4 border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Algorithmic Source</span>
              </div>
              <button
                onClick={clearAll}
                className={`transition-colors p-1.5 rounded-lg ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-400/10' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your function or algorithm here to profile..."
              className={`flex-1 w-full p-8 code-textarea outline-none resize-none bg-transparent text-sm leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          {/* Right Column: Output */}
          <div className={`relative flex flex-col border rounded-[2.5rem] overflow-hidden backdrop-blur-md transition-all shadow-2xl ${analysis ? 'border-emerald-500/30' : cardBg
            }`}>
            <div className={`flex items-center justify-between px-8 py-4 border-b ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                {analysis ? (
                  <div className={`px-4 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${getRatingStyles(analysis.rating)}`}>
                    Overall Audit: {analysis.rating}
                  </div>
                ) : (
                  <div className={`px-4 py-1 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest transition-all ${textSecondary}`}>
                    Awaiting Source Trace
                  </div>
                )}
              </div>
              <div className="p-1 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
                AI PR Engine
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              {analysis ? (
                <div className="animate-fade-in space-y-10">

                  {/* Big-O Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-4 text-emerald-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Time complexity</span>
                      </div>
                      <h4 className={`text-4xl font-black mb-2 tracking-tighter ${textPrimary}`}>{analysis.time_complexity}</h4>
                      <p className={`text-[11px] font-medium leading-relaxed ${textSecondary}`}>{analysis.time_explanation}</p>
                    </div>
                    <div className={`p-6 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-4 text-blue-400">
                        <Cpu className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Space complexity</span>
                      </div>
                      <h4 className={`text-4xl font-black mb-2 tracking-tighter ${textPrimary}`}>{analysis.space_complexity}</h4>
                      <p className={`text-[11px] font-medium leading-relaxed ${textSecondary}`}>{analysis.space_explanation}</p>
                    </div>
                  </div>

                  {/* Optimization List */}
                  <div className={`p-8 rounded-[2rem] border bg-gradient-to-br from-emerald-500/5 to-transparent ${isDark ? 'border-emerald-500/20' : 'bg-white border-emerald-100'}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${textPrimary}`}>Scale Optimization</h3>
                        <p className="text-[9px] font-medium text-emerald-400/70">Bullet-tips to improve algorithm ranking</p>
                      </div>
                    </div>
                    <ul className="space-y-4">
                      {(analysis.optimization_tips || []).map((tip, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  {isAnalyzing ? (
                    <div className="space-y-6">
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/10 animate-pulse" />
                        <div className="absolute inset-0 rounded-2xl border-t-2 border-emerald-500 animate-spin" />
                        <Activity className="absolute inset-6 w-8 h-8 text-emerald-400" />
                      </div>
                      <p className={`text-sm font-black uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text animate-pulse`}>
                        Tracing Performance Paths...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className={`w-20 h-20 mx-auto rounded-[2rem] border flex items-center justify-center ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <ZapOff className={`w-10 h-10 ${isDark ? 'text-slate-800' : 'text-slate-300'}`} />
                      </div>
                      <div className="max-w-xs mx-auto">
                        <p className={`text-xl font-black uppercase tracking-[0.2em] mb-2 ${textPrimary}`}>Neural Audit Standby</p>
                        <p className={`text-xs font-medium ${textSecondary}`}>The profiler is ready. Submit source code to analyze runtime bottlenecks.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Logic */}
            <div className={`px-8 py-4 border-t flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${textSecondary}`}>Verified scale heuristics</span>
              </div>
              <div className="flex items-center gap-4 text-emerald-400 opacity-50">
                <TrendingUp className="w-4 h-4" />
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeComplexity;
