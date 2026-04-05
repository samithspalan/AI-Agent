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
  ArrowRight
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
      const { data } = await axios.post('http://localhost:5000/api/analyze-complexity', {
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
      case 'Excellent': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-500/10';
      case 'Good': return 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-500/10';
      case 'Needs Improvement': return 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-500/10';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  // Theme Helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bg} pt-32 pb-20 px-6 transition-colors duration-300 relative overflow-hidden`}>
      
      {/* Abstract Background Elements */}
      {isDark && (
        <>
          <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${textSecondary}`}>Performance Audit</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 text-transparent bg-clip-text tracking-tight mb-2">
              Complexity Analyzer
            </h1>
            <p className={`font-medium ${textSecondary}`}>Identify algorithmic bottlenecks and optimize your memory footprint.</p>
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
                 isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-400/10' : 'bg-white border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 shadow-sm'
               }`}
               title="Reset all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputCode.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                inputCode.trim() 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
              }`}
            >
              {isAnalyzing ? (
                <> <Loader2 className="w-4 h-4 animate-spin" /> auditing... </>
              ) : (
                <> Analyze → </>
              )}
            </button>
          </div>
        </header>

        {/* Input Area */}
        <div className="mb-10 relative h-[400px] border rounded-[2rem] overflow-hidden backdrop-blur-md transition-all shadow-2xl">
          <div className={`absolute top-0 left-0 w-full h-10 border-b flex items-center px-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <span className={`ml-4 text-[9px] font-black uppercase tracking-widest ${textSecondary}`}>Performance Lab</span>
          </div>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Paste your function or logic block here..."
            className={`w-full h-full pt-14 pb-6 px-6 outline-none resize-none bg-transparent font-mono text-sm leading-relaxed ${textPrimary} ${isDark ? 'placeholder:text-slate-800' : 'placeholder:text-slate-400'}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
        </div>

        {/* Analysis Results Section */}
        {analysis ? (
          <div className="animate-fade-slide-up">
            
            {/* Rating & Insights Badge */}
            <div className="flex items-center justify-between mb-8">
               <div className={`px-5 py-2 rounded-full border flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl transition-all ${getRatingStyles(analysis.rating)}`}>
                  {analysis.rating === 'Excellent' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  Audit Result: {analysis.rating}
               </div>
               <div className={`text-[10px] font-bold flex items-center gap-2 ${textSecondary}`}>
                  <Info className="w-3.5 h-3.5" />
                  Calculated via Autonomous Profiling Engine
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Time Complexity */}
              <div className={`group p-8 rounded-[2.5rem] border transition-all hover:-translate-y-1 backdrop-blur-sm ${cardBg}`}>
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-blue-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/50">Runtime Analysis</span>
                </div>
                <h3 className={`text-4xl lg:text-5xl font-black mb-4 tracking-tighter ${textPrimary}`}>
                  {analysis.time_complexity}
                </h3>
                <p className={`text-sm font-medium leading-relaxed mb-6 border-l-2 border-blue-500/30 pl-4 ${textSecondary}`}>
                  {analysis.time_explanation}
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                   <TrendingUp className="w-4 h-4 text-emerald-400" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Execution Path optimized</span>
                </div>
              </div>

              {/* Card 2: Space Complexity */}
              <div className={`group p-8 rounded-[2.5rem] border transition-all hover:-translate-y-1 backdrop-blur-sm ${cardBg}`}>
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                      <Cpu className="w-6 h-6 text-purple-400" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/50">Memory Leak Check</span>
                </div>
                <h3 className={`text-4xl lg:text-5xl font-black mb-4 tracking-tighter ${textPrimary}`}>
                  {analysis.space_complexity}
                </h3>
                <p className={`text-sm font-medium leading-relaxed mb-6 border-l-2 border-purple-500/30 pl-4 ${textSecondary}`}>
                  {analysis.space_explanation}
                </p>
                <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                   <Layers className="w-4 h-4 text-purple-400" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400">Heap usage verified</span>
                </div>
              </div>

              {/* Card 3: Optimization Tips */}
              <div className={`p-8 rounded-[2.5rem] border bg-gradient-to-br from-emerald-500/5 to-transparent transition-all ${cardBg}`}>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Zap className="w-5 h-5" />
                   </div>
                   <h3 className={`text-lg font-black uppercase tracking-tight ${textPrimary}`}>Scale Insights</h3>
                </div>
                <ul className="space-y-4">
                  {(analysis.optimization_tips || []).map((tip, index) => (
                    <li key={index} className="flex gap-3">
                       <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                       <span className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
                          {tip}
                       </span>
                    </li>
                  ))}
                  {(!analysis.optimization_tips || analysis.optimization_tips.length === 0) && (
                    <li className="text-xs font-medium text-emerald-400/80 italic">The code is already well-optimized for typical use cases.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          !isAnalyzing && (
            <div className={`flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-[3rem] transition-all duration-500 ${isDark ? 'bg-white/5 border-white/5 opacity-50' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
               <Activity className={`w-20 h-20 mb-6 animate-pulse ${isDark ? 'text-emerald-500/30' : 'text-slate-300'}`} />
               <p className={`text-2xl font-black uppercase tracking-[0.2em] mb-2 ${textPrimary}`}>Neural Audit Standby</p>
               <p className={`text-sm font-medium ${textSecondary}`}>Waiting for algorithmic source to calculate complexity.</p>
            </div>
          )
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-24 animate-pulse">
             <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-[1.5rem] border-2 border-emerald-500/20" />
                <div className="absolute inset-0 rounded-[1.5rem] border-t-2 border-emerald-500 animate-spin" />
                <Loader2 className="absolute inset-8 w-8 h-8 text-emerald-400" />
             </div>
             <p className={`text-xl font-black uppercase tracking-[0.3em] bg-gradient-to-r from-emerald-400 to-teal-300 text-transparent bg-clip-text`}>
               Profiling Big-O Notation...
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeComplexity;
