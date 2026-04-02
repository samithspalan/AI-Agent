import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, GitBranch, Github, Code, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';

const LogDetail = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/logs/${id}`);
        setLog(data);
      } catch (err) {
        console.error('Failed to fetch log details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!log) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
      <h2 className="text-2xl font-bold">Log not found</h2>
      <Link to="/" className="text-blue-500 mt-4 flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors mb-8 group font-medium uppercase tracking-widest text-xs">
         <ArrowLeft className="w-4 h-4" /> Back to Logs Dashboard
      </Link>

      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
               <Code className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-slate-100 flex items-center gap-3">
                  Log Entry <span className="text-blue-500">#{id.slice(-6)}</span>
               </h1>
               <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                  <div className="flex items-center gap-1"><Github className="w-3 h-3" /> {log.repo}</div>
                  <div className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> {log.branch}</div>
                  <div className="flex items-center gap-1"><Star className="w-3 h-3" /> PR #{log.prNumber}</div>
               </div>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1 italic">
               Processed on {new Date(log.createdAt).toLocaleString()}
            </span>
            <div className={`px-4 py-1.5 rounded-lg border font-bold flex items-center gap-2 shadow-xl ${log.confidence >= 75 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-amber-500/10 border-amber-500 text-amber-400'}`}>
               {log.confidence >= 75 ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
               Confidence: {log.confidence}%
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="glass-card flex flex-col h-[600px]">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500/50 blink" /> Original Codebase
              </span>
              <span className="text-[10px] text-slate-600 font-mono">READ-ONLY</span>
           </div>
           <div className="flex-grow overflow-auto p-4 bg-slate-950/80 font-mono text-sm leading-relaxed text-slate-500 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {log.previousCode || "No previous code recorded (Review-only event)"}
           </div>
        </div>

        <div className="glass-card flex flex-col h-[600px] border-emerald-500/20 shadow-2xl shadow-emerald-500/5">
           <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shadow-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-400" /> AI-Generated Fix
              </span>
              <span className="text-[10px] text-emerald-600/50 font-mono">PRODUCTION READY</span>
           </div>
           <div className="flex-grow overflow-auto p-4 bg-slate-950 font-mono text-sm leading-relaxed text-emerald-400/90 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {log.updatedCode || "Agent provided review only. No code changes applied."}
           </div>
        </div>
      </div>

      {log.patch && (
        <div className="glass-card mb-12 border-l-4 border-l-amber-500 overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-amber-500" />
             <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Line-by-Line Changes (Patch)</span>
          </div>
          <div className="p-4 bg-slate-950 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre">
            {log.patch.split('\n').map((line, idx) => {
              let bgColor = "";
              let textColor = "text-slate-400";
              if (line.startsWith('+') && !line.startsWith('+++')) {
                bgColor = "bg-emerald-500/10";
                textColor = "text-emerald-400";
              } else if (line.startsWith('-') && !line.startsWith('---')) {
                bgColor = "bg-rose-500/10";
                textColor = "text-rose-400";
              } else if (line.startsWith('@@')) {
                textColor = "text-blue-400 opacity-50";
              }
              return (
                <div key={idx} className={`${bgColor} ${textColor} px-2 py-0.5 rounded-sm`}>
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="glass-card p-8 border-l-4 border-l-blue-500 bg-gradient-to-br from-slate-900 to-slate-950">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
           <Info className="w-5 h-5 text-blue-400" /> 
           Analysis Summary & Insights
        </h2>
        <div className="text-slate-300 leading-relaxed font-medium text-lg whitespace-pre-wrap">
           {log.summary}
        </div>
      </div>
    </div>
  );
};

export default LogDetail;
