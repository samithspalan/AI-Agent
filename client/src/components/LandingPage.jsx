import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import {
  GitPullRequest, ShieldCheck, Zap, BrainCircuit,
  Github, ChevronRight, Terminal, BarChart2, Activity,
  CheckCircle2, ArrowRight, Lock, Sun, Moon
} from 'lucide-react';

/* ── Particle canvas ── */
const ParticleCanvas = ({ isDark }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dotColor = isDark ? '52, 211, 153' : '16, 185, 129';
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor}, ${isDark ? d.alpha : d.alpha * 0.5})`;
        ctx.fill();
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(${dotColor}, ${(isDark ? 0.12 : 0.07) * (1 - dist / 120)})`;
            ctx.lineWidth = 0.7; ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [isDark]);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

/* ── Diff preview card (always dark terminal look) ── */
const DiffCard = () => (
  <div className="relative bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(16,185,129,0.15)] font-mono text-sm">
    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
      <span className="w-3 h-3 rounded-full bg-red-500/80" />
      <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
      <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
      <span className="ml-3 text-slate-500 text-xs">webhook.js — AI Auto-Fix</span>
    </div>
    <div className="p-4 space-y-1 text-xs leading-6">
      <div className="flex gap-3 text-slate-500"><span className="select-none w-5 text-right">1</span><span>const runPRWorkflow = async (owner, repo, pr) =&gt; {'{'}</span></div>
      <div className="flex gap-3 bg-red-500/10 text-red-400 rounded px-1"><span className="select-none w-5 text-right text-red-500/60">2</span><span>-  const result = await fetchAll();</span></div>
      <div className="flex gap-3 bg-red-500/10 text-red-400 rounded px-1"><span className="select-none w-5 text-right text-red-500/60">3</span><span>-  if (result) processData(result)</span></div>
      <div className="flex gap-3 bg-emerald-500/10 text-emerald-400 rounded px-1"><span className="select-none w-5 text-right text-emerald-500/60">4</span><span>+  const result = await fetchAll();</span></div>
      <div className="flex gap-3 bg-emerald-500/10 text-emerald-400 rounded px-1"><span className="select-none w-5 text-right text-emerald-500/60">5</span><span>+  if (!result) return;</span></div>
      <div className="flex gap-3 bg-emerald-500/10 text-emerald-400 rounded px-1"><span className="select-none w-5 text-right text-emerald-500/60">6</span><span>+  await processData(result);</span></div>
      <div className="flex gap-3 text-slate-500"><span className="select-none w-5 text-right">7</span><span>{'}'}</span></div>
    </div>
    <div className="px-4 py-3 bg-emerald-500/5 border-t border-white/10 flex items-center justify-between">
      <span className="text-emerald-400 text-xs font-bold">✅ AI Auto-Fix Committed</span>
      <span className="text-slate-500 text-xs">Confidence: 92%</span>
    </div>
  </div>
);

/* ── Feature card ── */
const FeatureCard = ({ icon: Icon, title, desc, color, isDark }) => (
  <div className={`group relative border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${
    isDark
      ? 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]'
      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-xl shadow-sm'
  }`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
  </div>
);

/* ── Step card ── */
const StepCard = ({ step, title, desc, icon: Icon, isDark }) => (
  <div className="flex gap-5 items-start">
    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
      {step}
    </div>
    <div className="pt-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-emerald-400" />
        <h4 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h4>
      </div>
      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
    </div>
  </div>
);

/* ── Theme Toggle ── */
const ThemeToggle = ({ isDark, toggle }) => (
  <button
    id="landing-theme-toggle"
    onClick={toggle}
    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
      isDark
        ? 'bg-white/10 border-white/20 text-yellow-300 hover:bg-white/20'
        : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
    }`}
  >
    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
  </button>
);

/* ── MAIN LANDING PAGE ── */
const LandingPage = () => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  useEffect(() => {
    if (isSignedIn) navigate('/dashboard');
  }, [isSignedIn, navigate]);

  const bg = isDark ? 'bg-[#050A14]' : 'bg-slate-50';
  const textPrimary = isDark ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderCol = isDark ? 'border-white/10' : 'border-slate-200';
  const navBg = isDark ? 'bg-white/[0.04] border-white/10' : 'bg-white/90 border-slate-200';
  const cardBg = isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-slate-100 shadow-sm';

  return (
    <div className={`relative min-h-screen ${bg} ${textPrimary} overflow-x-hidden transition-colors duration-300`}>
      <ParticleCanvas isDark={isDark} />

      {/* Glow orbs — only visible in dark */}
      {isDark && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-700/10 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-[30%] right-[-15%] w-[45%] h-[45%] bg-blue-700/10 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* ── NAVBAR ── */}
      <nav className="relative z-20 flex justify-center pt-6 px-4">
        <div className={`flex items-center gap-6 backdrop-blur-xl border rounded-full px-6 py-3 shadow-[0_8px_32px_var(--shadow-color)] transition-colors duration-300 ${navBg}`}>
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-emerald-500/30 group-hover:ring-emerald-400/60 transition-all">
              <img src="/logo.png" alt="CodeSage" className="w-full h-full object-cover" />
            </div>
            <span className="font-black tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">CodeSage</span>
          </a>
          <div className={`hidden md:flex items-center gap-1 text-sm font-medium ${textSecondary}`}>
            <a href="#features" className={`px-3 py-1.5 rounded-lg transition-all ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'}`}>Features</a>
            <a href="#how-it-works" className={`px-3 py-1.5 rounded-lg transition-all ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'}`}>How It Works</a>
            <a href="#stats" className={`px-3 py-1.5 rounded-lg transition-all ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-slate-900 hover:bg-slate-100'}`}>Stats</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} toggle={toggle} />
            <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <SignInButton mode="modal">
              <button id="landing-signin-btn" className={`px-4 py-1.5 text-sm font-bold rounded-full border transition-all ${isDark ? 'text-slate-300 border-white/10 hover:border-white/20 hover:text-white' : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'}`}>
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button id="landing-signup-btn" className="px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6">
            <span className={textPrimary}>AI That Reviews</span><br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Your Code.</span><br />
            <span className={textPrimary}>Automatically.</span>
          </h1>
          <p className={`text-lg leading-relaxed mb-10 max-w-lg ${textSecondary}`}>
            CodeSage monitors your GitHub PRs 24/7. It detects real bugs, auto-fixes them with AI, commits the fix, and posts a detailed audit — all without you lifting a finger.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <SignUpButton mode="modal">
              <button id="hero-get-started-btn" className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-full hover:opacity-90 transition-all shadow-xl shadow-emerald-500/25 text-sm">
                Get Started Free <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button id="hero-dashboard-btn" className={`flex items-center gap-2 px-7 py-3.5 border font-bold rounded-full transition-all text-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <BarChart2 className="w-4 h-4" /> View Dashboard
              </button>
            </SignInButton>
          </div>
          <div className={`flex flex-wrap items-center gap-6 mt-10 text-xs font-medium ${textSecondary}`}>
            {['No credit card needed', 'GitHub-native integration', '< 2min setup'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{t}
              </span>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-10 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-2xl" />
          <DiffCard />
          <div className={`absolute -top-4 -right-4 border rounded-xl px-4 py-2.5 backdrop-blur-sm ${isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Engine</div>
            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Groq + Gemini</div>
          </div>
          <div className={`absolute -bottom-4 -left-4 border rounded-xl px-4 py-2.5 backdrop-blur-sm ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Confidence</div>
            <div className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>92% · Auto Committed</div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-emerald-500 text-sm font-bold uppercase tracking-widest mb-3">What CodeSage Does</p>
          <h2 className={`text-4xl font-black tracking-tight ${textPrimary}`}>Built for serious teams</h2>
          <p className={`mt-4 max-w-xl mx-auto ${textSecondary}`}>A full autonomous code review pipeline — from webhook to committed fix — powered by hybrid AI.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: GitPullRequest, title: 'PR Webhook Monitoring', desc: 'Automatically triggers on every PR open or synchronize event. No manual steps required.', color: 'bg-blue-500/10 text-blue-500' },
            { icon: BrainCircuit, title: 'Hybrid AI Engine', desc: 'Groq (Llama-3.3-70B) runs first for speed. Gemini steps in automatically as a fallback.', color: 'bg-emerald-500/10 text-emerald-500' },
            { icon: ShieldCheck, title: 'Analyze Before Acting', desc: 'The AI first checks for real bugs. If code is correct, no changes are made.', color: 'bg-purple-500/10 text-purple-500' },
            { icon: Zap, title: 'Auto-Fix & Commit', desc: 'When confidence ≥ 75%, the AI commits the corrected file directly to your branch.', color: 'bg-yellow-500/10 text-yellow-500' },
            { icon: Activity, title: 'Confidence Scoring', desc: 'Every fix comes with a transparency score 0–100. Low confidence posts review without committing.', color: 'bg-rose-500/10 text-rose-500' },
            { icon: BarChart2, title: 'Full Audit Dashboard', desc: 'Every AI action is logged to MongoDB and displayed in a real-time dashboard.', color: 'bg-cyan-500/10 text-cyan-500' },
          ].map(f => <FeatureCard key={f.title} {...f} isDark={isDark} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-emerald-500 text-sm font-bold uppercase tracking-widest mb-3">The Pipeline</p>
            <h2 className={`text-4xl font-black tracking-tight mb-12 ${textPrimary}`}>How it works</h2>
            <div className="space-y-8">
              <StepCard step="1" icon={Github} title="GitHub Webhook" desc="A PR is opened or pushed. GitHub sends a webhook event to CodeSage instantly." isDark={isDark} />
              <StepCard step="2" icon={BrainCircuit} title="AI Analysis" desc="The AI reads only the diff and checks for logic bugs, syntax errors, and runtime-breaking issues." isDark={isDark} />
              <StepCard step="3" icon={ShieldCheck} title="Decision Engine" desc="Correct code → clean audit post. Bug found with high confidence → commit the fix automatically." isDark={isDark} />
              <StepCard step="4" icon={BarChart2} title="Logged & Visible" desc="Every action is saved to your dashboard with the full diff, AI summary, and confidence score." isDark={isDark} />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'GitHub Webhook', sub: 'PR #42 synchronized', col: isDark ? 'border-blue-500/30 bg-blue-500/5' : 'border-blue-200 bg-blue-50', dot: 'bg-blue-400' },
              { label: 'AI Analysis', sub: 'Groq · Llama-3.3-70B', col: isDark ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50', dot: 'bg-emerald-400' },
              { label: 'Confidence: 92%', sub: 'Threshold passed · Committing', col: isDark ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-yellow-200 bg-yellow-50', dot: 'bg-yellow-400' },
              { label: 'Auto-Fix Committed', sub: 'Branch updated · PR commented', col: isDark ? 'border-purple-500/30 bg-purple-500/5' : 'border-purple-200 bg-purple-50', dot: 'bg-purple-400' },
              { label: 'Dashboard Logged', sub: 'Saved to MongoDB · Live on UI', col: isDark ? 'border-cyan-500/30 bg-cyan-500/5' : 'border-cyan-200 bg-cyan-50', dot: 'bg-cyan-400' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${s.col} backdrop-blur-sm transition-colors duration-300`}>
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${s.dot} animate-pulse`} />
                <div>
                  <div className={`text-sm font-bold ${textPrimary}`}>{s.label}</div>
                  <div className={`text-xs ${textSecondary}`}>{s.sub}</div>
                </div>
                <ArrowRight className={`w-4 h-4 ml-auto ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: '< 5s', label: 'Avg Response Time' },
            { val: '92%', label: 'Avg Confidence Score' },
            { val: '2', label: 'AI Models (Hybrid)' },
            { val: '100%', label: 'Loop-Safe Architecture' },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-white/[0.03] border-white/10 hover:border-white/20' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">{s.val}</div>
              <div className={`text-sm font-medium ${textSecondary}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className={`relative border rounded-3xl p-14 overflow-hidden ${isDark ? 'bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/20' : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'}`}>
          <Lock className="w-10 h-10 text-emerald-500 mx-auto mb-6" />
          <h2 className={`text-4xl font-black mb-4 ${textPrimary}`}>Ready to automate your code reviews?</h2>
          <p className={`mb-10 max-w-lg mx-auto ${textSecondary}`}>Sign in with your account to access the CodeSage dashboard and start monitoring your repositories today.</p>
          <SignUpButton mode="modal">
            <button id="cta-signup-btn" className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-full hover:opacity-90 transition-all shadow-xl shadow-emerald-500/25 text-sm">
              Get Started Free <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </SignUpButton>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`relative z-10 border-t py-10 transition-colors duration-300 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={`flex items-center gap-2 ${isDark ? 'opacity-40' : 'opacity-60'}`}>
            <img src="/logo.png" alt="CodeSage" className="w-5 h-5 rounded object-cover" />
            <span className="font-black tracking-tight uppercase text-sm">CodeSage AI Agent</span>
          </div>
          <div className={`flex gap-8 text-xs font-bold uppercase tracking-widest ${textSecondary}`}>
            <a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">API Status</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
          </div>
          <div className={`text-[10px] font-bold ${isDark ? 'text-slate-700' : 'text-slate-400'}`}>© 2026 CODESAGE. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
