import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, GitBranch, Github, Code, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';

const LogDetail = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs/${id}`);
        setLog(data);
      } catch (err) {
        console.error('Failed to fetch log details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  // Theme helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const borderCol = isDark ? 'border-white/10' : 'border-slate-200';
  const cardBg = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const headerBg = isDark ? 'bg-white/5 border-slate-800' : 'bg-slate-50 border-slate-200';
  const codeBg = isDark ? 'bg-slate-950/80 text-slate-400' : 'bg-slate-50 text-slate-600';
  const codeGreenBg = isDark ? 'bg-slate-950 text-emerald-400/90' : 'bg-slate-50 text-emerald-700';
  const patchBg = isDark ? 'bg-slate-950' : 'bg-slate-50';

  if (loading) return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${bg}`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-emerald-500 animate-[spin_1s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border-l-2 border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]" />
      </div>
    </div>
  );

  if (!log) return (
    <div className={`flex flex-col items-center justify-center py-20 min-h-screen ${bg}`}>
      <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
      <h2 className={`text-2xl font-bold mb-4 ${textPrimary}`}>Log not found</h2>
      <Link to="/dashboard" className="text-blue-500 flex items-center gap-2 font-medium hover:text-blue-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className={`min-h-screen pb-20 transition-colors duration-300 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          className={`inline-flex items-center gap-2 hover:text-blue-400 transition-colors mb-8 group font-medium uppercase tracking-widest text-xs ${textSecondary}`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Logs Dashboard
        </Link>

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl font-black flex items-center gap-3 ${textPrimary}`}>
                Log Entry <span className="text-blue-500">#{id.slice(-6)}</span>
              </h1>
              <div className={`flex flex-wrap items-center gap-4 text-sm mt-1 ${textSecondary}`}>
                <div className="flex items-center gap-1"><Github className="w-3 h-3" /> {log.repo}</div>
                <div className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> {log.branch}</div>
                <div className="flex items-center gap-1"><Star className="w-3 h-3" /> PR #{log.prNumber}</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className={`text-xs font-bold uppercase tracking-widest mb-1 italic ${textMuted}`}>
              Processed on {new Date(log.createdAt).toLocaleString()}
            </span>
            <div className={`px-4 py-1.5 rounded-lg border font-bold flex items-center gap-2 shadow-md ${log.confidence >= 75
                ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400'
                : 'bg-amber-500/10 border-amber-400 text-amber-400'
              }`}>
              {log.confidence >= 75 ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
              Confidence: {log.confidence}%
            </div>
          </div>
        </div>

        {/* Code panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Original */}
          <div className={`flex flex-col h-[600px] rounded-xl border overflow-hidden transition-colors duration-300 ${cardBg}`}>
            <div className={`p-4 border-b flex justify-between items-center ${headerBg}`}>
              <span className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${textSecondary}`}>
                <div className="w-2 h-2 rounded-full bg-rose-400" /> Original Codebase
              </span>
              <span className={`text-[10px] font-mono ${textMuted}`}>READ-ONLY</span>
            </div>
            <div className={`flex-grow overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre transition-colors duration-300 ${codeBg}`}>
              {log.previousCode || 'No previous code recorded (Review-only event)'}
            </div>
          </div>

          {/* AI Fix */}
          <div className={`flex flex-col h-[600px] rounded-xl border overflow-hidden transition-colors duration-300 ${isDark ? 'bg-white/[0.04] border-emerald-500/20 shadow-2xl shadow-emerald-500/5' : 'bg-white border-emerald-300 shadow-sm'}`}>
            <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'bg-white/5 border-slate-800' : 'bg-emerald-50 border-emerald-100'}`}>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" /> AI-Generated Fix
              </span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-emerald-600/50' : 'text-emerald-500'}`}>PRODUCTION READY</span>
            </div>
            <div className={`flex-grow overflow-auto p-4 font-mono text-sm leading-relaxed whitespace-pre transition-colors duration-300 ${codeGreenBg}`}>
              {log.updatedCode || 'Agent provided review only. No code changes applied.'}
            </div>
          </div>
        </div>

        {/* Patch diff */}
        {log.patch && (
          <div className={`mb-12 rounded-xl border overflow-hidden border-l-4 border-l-amber-500 transition-colors duration-300 ${cardBg}`}>
            <div className={`p-4 border-b flex items-center gap-2 ${headerBg}`}>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Line-by-Line Changes (Patch)</span>
            </div>
            <div className={`p-4 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre transition-colors duration-300 ${patchBg}`}>
              {log.patch.split('\n').map((line, idx) => {
                let cls = textSecondary;
                let bg = '';
                if (line.startsWith('+') && !line.startsWith('+++')) { cls = 'text-emerald-500'; bg = isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'; }
                else if (line.startsWith('-') && !line.startsWith('---')) { cls = 'text-rose-400'; bg = isDark ? 'bg-rose-500/10' : 'bg-rose-50'; }
                else if (line.startsWith('@@')) { cls = isDark ? 'text-blue-400 opacity-50' : 'text-blue-500 opacity-70'; }
                return (
                  <div key={idx} className={`${bg} ${cls} px-2 py-0.5 rounded-sm`}>{line}</div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className={`rounded-xl border border-l-4 border-l-blue-500 p-8 transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-3 ${textPrimary}`}>
            <Info className="w-5 h-5 text-blue-400" />
            Analysis Summary &amp; Insights
          </h2>
          <div className={`leading-relaxed font-medium text-lg whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {log.summary}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogDetail;
