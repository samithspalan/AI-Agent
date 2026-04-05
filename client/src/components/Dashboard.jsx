import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { Terminal, GitBranch, Github, ChevronRight, Clock, Activity, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs`);
        setLogs(data);
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return (
    <div className={`flex items-center justify-center min-h-[60vh] transition-colors duration-300 ${isDark ? 'bg-[#050A14]' : 'bg-slate-50'}`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-emerald-500 animate-[spin_1s_linear_infinite]" />
        <div className="absolute inset-2 rounded-full border-l-2 border-r-2 border-blue-500 animate-[spin_1.5s_linear_infinite_reverse]" />
      </div>
    </div>
  );

  const totalLogs = logs.length;
  const latestPR = logs[0] ? `#${logs[0].prNumber}` : '-';
  const avgConfidence = logs.length > 0
    ? Math.round(logs.reduce((acc, log) => acc + log.confidence, 0) / logs.length)
    : 0;

  // Theme helpers
  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200';
  const cardHover = isDark ? 'hover:border-white/20' : 'hover:border-slate-300 hover:shadow-lg';
  const statCard = isDark ? 'bg-white/5 border-white/10 hover:border-blue-500/30' : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm';

  return (
    <div className={`relative min-h-screen ${bg} overflow-hidden pb-20 transition-colors duration-300`}>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.6); }
        }
        @keyframes pulseBorder {
          0%, 100% { border-color: rgba(16, 185, 129, 0.2); }
          50% { border-color: rgba(16, 185, 129, 0.6); }
        }
        .animate-shimmer { background-size: 200% auto; animation: shimmer 4s linear infinite; }
        .animate-fade-slide-up { animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .hover-glow:hover { animation: pulseGlow 2s infinite; }
        .pulse-border { animation: pulseBorder 3s infinite; }
      `}</style>

      {/* Decorative orbs — dark only */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-emerald-300 to-blue-400 text-transparent bg-clip-text animate-shimmer tracking-tight mb-2">
              AI Agent Logs
            </h1>
            <p className={`font-medium tracking-wide ${textSecondary}`}>Track and audit your autonomous AI's decisions</p>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className={`flex items-center gap-3 backdrop-blur-md border rounded-2xl px-5 py-3 transition-colors shadow-sm ${statCard}`}>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Total Logs</div>
                <div className={`text-xl font-black ${textPrimary}`}>{totalLogs}</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 backdrop-blur-md border rounded-2xl px-5 py-3 transition-colors shadow-sm ${isDark ? 'bg-white/5 border-white/10 hover:border-emerald-500/30' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'}`}>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Latest PR</div>
                <div className={`text-xl font-black ${textPrimary}`}>{latestPR}</div>
              </div>
            </div>

            <div className={`flex items-center gap-3 backdrop-blur-md border rounded-2xl px-5 py-3 transition-colors shadow-sm ${isDark ? 'bg-white/5 border-white/10 hover:border-indigo-500/30' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>Avg Confidence</div>
                <div className={`text-xl font-black ${textPrimary}`}>{avgConfidence}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logs.map((log, index) => {
            const isHighConfidence = log.confidence >= 75;
            return (
              <Link
                key={log._id}
                to={`/log/${log._id}`}
                className="group animate-fade-slide-up block h-full outline-none"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`relative h-full flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 hover-glow backdrop-blur-sm ${cardBg} ${cardHover}`}>

                  {/* Card Header */}
                  <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`flex items-center gap-2 px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <Github className="w-3 h-3" />
                        {log.repo.split('/')[1] || log.repo}
                      </div>
                      <div className={`text-[10px] uppercase font-bold flex items-center gap-1 ${textMuted}`}>
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <h3 className={`text-xl font-bold group-hover:text-blue-400 transition-colors line-clamp-1 mb-2 ${textPrimary}`}>
                      PR #{log.prNumber} Analysis
                    </h3>

                    <div className={`flex items-center gap-2 text-xs font-medium mb-5 ${textSecondary}`}>
                      <GitBranch className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{log.branch}</span>
                    </div>

                    <p className={`text-sm line-clamp-3 leading-relaxed mb-6 font-medium ${isDark ? 'text-slate-400/90' : 'text-slate-500'}`}>
                      {log.summary || 'No summary available.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-auto p-6 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isHighConfidence
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                        }`}>
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Conf {log.confidence}%</span>
                      </div>
                      <div className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300 font-bold text-xs uppercase tracking-widest flex items-center">
                        View <ChevronRight className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Bottom progress bar */}
                  <div className={`absolute bottom-0 left-0 h-1 w-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${isHighConfidence ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
                      style={{ width: `${log.confidence}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {logs.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl pulse-border mt-8 ${isDark ? 'bg-white/5 backdrop-blur-sm' : 'bg-white border-slate-200'}`}>
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <Terminal className="w-20 h-20 text-blue-400/80 relative z-10" />
            </div>
            <p className={`text-2xl font-bold mb-2 ${textPrimary}`}>No intelligence logged yet</p>
            <p className={textSecondary}>Awaiting next PR merge or webhook event from GitHub...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
