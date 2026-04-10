import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeft, 
  Github, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Calendar,
  Layers,
  Code2,
  Cpu,
  Zap,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://ai-agent-apnv.onrender.com'}/api/logs/${id}`);
        setLog(response.data);
      } catch (err) {
        console.error("Log error:", err);
        setError("Failed to locate target audit log history.");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full p-10 rounded-[2rem] border border-red-500/20 bg-red-500/5 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-6" />
          <h2 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Audit Missing</h2>
          <p className="text-slate-500 text-xs mb-8 font-medium">{error || "The requested log record could not be retrieved from persistence."}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-700 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isHighConfidence = log.confidence >= 75;

  return (
    <div className={`min-h-screen pt-24 pb-20 px-6 transition-colors duration-500 ${isDark ? 'bg-[#050A14]' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Compact Navigation & Status */}
        <div className="flex items-center justify-between">
          <Link 
            to="/dashboard" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {new Date(log.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Ultra-Compact Header Card */}
        <div className={`p-4 md:px-6 md:py-3 rounded-[1.5rem] border relative overflow-hidden transition-all ${isDark ? 'bg-white/5 border-white/10 shadow-lg' : 'bg-white border-slate-200 shadow-md'}`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className={`text-base md:text-lg font-black truncate tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {log.repo}
                  </h1>
                  <span className="text-emerald-500 font-bold text-sm">#{log.prNumber}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                    <Layers className="w-2.5 h-2.5" /> {log.branch}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <Check className="w-2.5 h-2.5" /> Auto-Fix
                  </div>
                </div>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-xl flex items-center gap-3 border transition-all ${isHighConfidence ? 'bg-emerald-500/[0.03] border-emerald-500/20' : 'bg-blue-500/[0.03] border-blue-500/20'}`}>
              <div className="shrink-0">
                {isHighConfidence ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="text-left leading-none">
                <p className={`text-xl font-black tracking-tighter ${isHighConfidence ? 'text-emerald-400' : 'text-blue-400'}`}>{log.confidence}%</p>
                <p className={`text-[7px] font-black uppercase tracking-[0.2em] mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>AI Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Inspection Grid (Side by Side) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Previous Code (Patch) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <h3 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Original Patch Context</h3>
            </div>
            <div className={`p-6 rounded-[1.5rem] border font-mono text-[11px] overflow-hidden relative ${isDark ? 'bg-black/50 border-white/10 text-blue-300' : 'bg-slate-900 border-slate-800 text-blue-100'}`}>
              <pre className="max-h-[400px] overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre pr-2">
                {log.patch || "No patch data available."}
              </pre>
            </div>
          </div>

          {/* Corrected Code */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <h3 className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Final AI Correction</h3>
            </div>
            <div className={`p-6 rounded-[1.5rem] border font-mono text-[11px] overflow-hidden relative ${isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300' : 'bg-slate-50 border-slate-200 text-emerald-800'}`}>
              <pre className="max-h-[400px] overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre pr-2">
                {log.updatedCode || "No updated code data available."}
              </pre>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary (Below Code) */}
        <div className={`p-8 md:p-10 rounded-[2rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Audit Reasoning</h3>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Heuristic Breakdown</p>
            </div>
          </div>
          <div className={`prose prose-xs max-w-none ${isDark ? 'prose-invert' : 'prose-slate'}`}>
            <ReactMarkdown>{log.summary}</ReactMarkdown>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LogDetail;
