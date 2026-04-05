import React, { useState } from 'react';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { 
  Code, 
  HelpCircle, 
  BookOpen, 
  BadgeCheck, 
  Layers, 
  Zap, 
  Loader2, 
  Trash2,
  ChevronRight,
  Info,
  ShieldCheck,
  Award
} from 'lucide-react';

const CodeExplainer = () => {
  const [inputCode, setInputCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const { isDark } = useTheme();

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

  const handleExplain = async () => {
    if (!inputCode.trim()) return;

    setIsExplaining(true);
    setExplanationData(null);

    try {
      const { data } = await axios.post('http://localhost:5000/api/explain-code', {
        code: inputCode,
        language
      });
      setExplanationData(data);
    } catch (error) {
      console.error('Explanation Error:', error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || 'AI failed to explain. Keep trying or simplify the snippet.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const clearAll = () => {
    setInputCode('');
    setExplanationData(null);
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'beginner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'advanced': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    }
  };

  // Theme Helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textAreaBg = isDark ? 'bg-[#0A1120] border-white/10' : 'bg-slate-50 border-slate-200';

  return (
    <div className={`min-h-screen ${bg} pt-32 pb-20 px-6 transition-colors duration-300 relative overflow-hidden`}>
      {/* Background Decor */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <BadgeCheck className="w-5 h-5 text-blue-400" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondary}`}>Intelligent Insights</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 text-transparent bg-clip-text tracking-tight mb-2">
                Code Explainer
              </h1>
              <p className={`font-medium ${textSecondary}`}>Break down complex logic into human-friendly explanations.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border appearance-none cursor-pointer outline-none transition-all font-bold text-xs uppercase tracking-widest ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                }`}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <button
                onClick={clearAll}
                className={`p-2.5 rounded-xl border transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-400/10' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Clear input"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleExplain}
                disabled={isExplaining || !inputCode.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  inputCode.trim() 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                {isExplaining ? (
                  <> <Loader2 className="w-4 h-4 animate-spin" /> Analyzing... </>
                ) : (
                  <> Explain Code <ChevronRight className="w-4 h-4 text-blue-300" /> </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8 relative h-[300px] border rounded-3xl overflow-hidden backdrop-blur-md transition-all shadow-2xl">
            <div className={`absolute top-0 left-0 w-full h-10 border-b flex items-center px-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <span className={`ml-4 text-[9px] font-black uppercase tracking-widest ${textSecondary}`}>Editor Context</span>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your code snippet here..."
              className={`w-full h-full pt-14 pb-6 px-6 outline-none resize-none bg-transparent font-mono text-sm leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400 text-slate-700'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
        </header>

        {/* Explain Output Section */}
        {explanationData ? (
          <div className="animate-fade-slide-up">
            {/* Difficulty Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getDifficultyColor(explanationData.difficulty)} shadow-sm flex items-center gap-2`}>
                  <Award className="w-3.5 h-3.5" />
                  {explanationData.difficulty || 'Analysis'} Level
                </div>
              </div>
            </div>

            {/* Explainer Table/List */}
            <div className={`border rounded-3xl overflow-hidden transition-all shadow-2xl backdrop-blur-sm mb-10 ${cardBg}`}>
              <div className={`grid grid-cols-[60px_1fr_1.5fr] border-b font-black text-[10px] uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                <div className="py-4 text-center">No.</div>
                <div className="py-4 px-6 border-l border-white/5">Source Code</div>
                <div className="py-4 px-6 border-l border-white/5">Plain-English Explanation</div>
              </div>

              {(explanationData.lines || []).map((line, index) => (
                <div 
                  key={index} 
                  className={`grid grid-cols-[60px_1fr_1.5fr] group transition-colors duration-200 ${
                    index % 2 === 0 
                      ? (isDark ? 'bg-white/[0.02]' : 'bg-white') 
                      : (isDark ? 'bg-transparent' : 'bg-slate-50/50')
                  } hover:bg-blue-500/5`}
                >
                  {/* Line Number */}
                  <div className={`py-4 text-center font-bold text-xs select-none border-r ${isDark ? 'text-slate-600 border-white/5' : 'text-slate-300 border-slate-100'}`}>
                    {line.line || index + 1}
                  </div>

                  {/* Code Column */}
                  <div className={`py-4 px-6 font-mono text-sm border-r whitespace-pre ${isDark ? 'text-slate-300 border-white/5' : 'text-slate-700 border-slate-100'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {line.code}
                  </div>

                  {/* Explanation Column */}
                  <div className={`py-4 px-6 flex items-center gap-3 font-medium text-sm leading-relaxed ${isDark ? 'text-blue-400/90' : 'text-blue-600'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 shrink-0" />
                    {line.explanation}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className={`p-8 lg:p-12 rounded-[40px] border relative overflow-hidden shadow-2xl ${isDark ? 'bg-gradient-to-br from-white/5 to-transparent border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BookOpen className="w-32 h-32 text-blue-500" />
              </div>

              <div className="relative z-10 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-6 h-6 text-blue-400" />
                  <h3 className={`text-xl font-black uppercase tracking-tight ${textPrimary}`}>High-Level Summary</h3>
                </div>
                <p className={`text-2xl lg:text-3xl font-bold leading-tight tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {explanationData.summary || "Your code has been analyzed. Read the line-by-line breakdown above for full context."}
                </p>
                <div className={`mt-8 pt-8 border-t flex flex-wrap gap-6 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Optimized Understanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Senior Verified Logic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !isExplaining && (
            <div className={`flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl opacity-50 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <Layers className="w-16 h-16 text-slate-500 mb-6" />
              <p className={`text-lg font-bold ${textSecondary}`}>Awaiting your code to decode...</p>
              <p className={`text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Enter a function or script above to see the magic.</p>
            </div>
          )
        )}
        
        {isExplaining && (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-blue-500 animate-[spin_1s_linear_infinite]" />
                <div className="absolute inset-3 rounded-full border-l-2 border-r-2 border-cyan-500 animate-[spin_1.5s_linear_infinite_reverse]" />
                <Layers className="absolute inset-6 w-8 h-8 text-blue-400 opacity-50" />
            </div>
            <p className={`text-xl font-black uppercase tracking-[0.3em] bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text animate-pulse`}>
              Agent Decoding Code...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeExplainer;
