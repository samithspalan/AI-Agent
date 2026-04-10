import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Activity, 
  Brain, 
  CheckCircle, 
  Loader2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Github
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'https://ai-agent-apnv.onrender.com'}/api/analytics`);
        setData(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Syncing Neural Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
          <p className="text-sm font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Audits', value: data.totalAudits, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Avg Confidence', value: `${data.averageConfidence}%`, icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Success Fixes', value: data.totalFixes, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className={`min-h-screen pt-24 pb-12 px-6 transition-colors duration-500 ${isDark ? 'bg-[#050A14]' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Compact Header with Normal Text */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              Agent Intelligence
            </h1>
            <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Real-time Audit Dashboard</p>
          </div>
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white border-slate-200 text-slate-500'}`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Active</span>
          </div>
        </header>

        {/* Compact Grid with Normal Text */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpis.map((kpi, i) => (
            <div key={i} className={`p-6 rounded-[2rem] border backdrop-blur-md transition-all hover:scale-[1.01] ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500/30" />
              </div>
              <h3 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{kpi.value}</h3>
              <p className={`text-xs font-black uppercase tracking-widest mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className={`lg:col-span-8 p-8 rounded-[2rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Activity Timeline (7D)</h3>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.activityTimeline}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF', 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '10px'
                    }} 
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`lg:col-span-4 p-8 rounded-[2rem] border transition-all ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-white shadow-xl'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Agent Focus</h3>
            </div>
            <p className={`text-sm leading-relaxed font-medium mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The CodeSage agent is auditing PRs with security labels. Auto-fixes require <span className="text-emerald-500 font-bold">75%</span> confidence.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Capacity</span>
                <span className="text-emerald-500">85%</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <div className="h-full w-[85%] bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Section */}
        <div className={`p-8 rounded-[2rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Recent Audit Activity</h3>
            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last 5 entries</span>
          </div>

          <div className="space-y-4">
            {data.recentActivity.map((log) => (
              <div key={log._id} className={`group p-4 px-6 rounded-3xl border transition-all flex items-center justify-between gap-6 ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-white/5`}>
                    <Github className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{log.repo} <span className="text-emerald-500 opacity-60">#{log.prNumber}</span></h4>
                    <p className={`text-xs truncate font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{log.summary || `AI audit complete.`}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 shrink-0">
                  <div className={`text-xs font-black uppercase tracking-widest ${log.confidence >= 75 ? 'text-emerald-500' : 'text-blue-400'}`}>
                    {log.confidence}%
                  </div>
                  <Link 
                    to={`/log/${log._id}`}
                    className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border border-slate-200 text-slate-500 hover:text-emerald-600'}`}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
