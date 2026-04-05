import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard';
import LogDetail from './components/LogDetail';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import CodeCorrector from './pages/CodeCorrector';
import CodeExplainer from './pages/CodeExplainer';
import CodeConverter from './pages/CodeConverter';
import CodeComplexity from './pages/CodeComplexity';
import CodeGenerator from './pages/CodeGenerator';
import { useTheme } from './context/ThemeContext';
import { LayoutGrid, Github, Sun, Moon, Code, HelpCircle, Repeat, BarChart2, Wand2 } from 'lucide-react';
import './App.css';

/* ── Theme Toggle Button ── */
const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();
  return (
    <button
      id="theme-toggle-btn"
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
};

/* ── App Navbar — only on protected routes ── */
const AppNavbar = () => {
  const { pathname } = useLocation();
  const { isDark } = useTheme();
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/log/') || pathname.startsWith('/corrector') || pathname.startsWith('/explainer') || pathname.startsWith('/converter') || pathname.startsWith('/complexity') || pathname.startsWith('/generator');
  if (!isAppRoute) return null;

  return (
    <>
      {/* Absolute Logo in Top-Left Corner (scrolls with page) */}
      <div className="absolute top-8 left-10 z-[60] pointer-events-auto flex items-center transition-all duration-500 hover:opacity-80 scale-110 md:scale-125 origin-left">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/30 group-hover:rotate-12 transition-all duration-500">
            <img src="/logo.png" alt="CodeSage Logo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tighter block leading-none bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              CodeSage
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest block mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Autonomous AI Agent
            </span>
          </div>
        </Link>
      </div>

      {/* Absolute Actions in Top-Right Corner (scrolls with page) */}
      <div className="absolute top-8 right-10 z-[60] pointer-events-auto flex items-center gap-6 transition-all">
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/samithspalan/AI-Agent"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors ${isDark ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'}`}
          >
            <Github className="w-4 h-4" />
          </a>
          <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <ThemeToggle />
        </div>
        <div className={`w-px h-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-7 h-7 ring-2 ring-emerald-500/40 hover:ring-emerald-400/60 transition-all',
            },
          }}
          afterSignOutUrl="/"
        />
      </div>

      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
        <header
          className={`pointer-events-auto backdrop-blur-3xl border rounded-full shadow-2xl px-6 py-2 flex items-center transition-all duration-500 ${
            isDark
              ? 'bg-black/20 border-white/10'
              : 'bg-white/90 border-slate-200'
          }`}
        >
          {/* Nav links only */}
          <nav className="flex items-center gap-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Dashboard
          </NavLink>
          <NavLink
            to="/corrector"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Code className="w-3.5 h-3.5" /> Corrector
          </NavLink>
          <NavLink
            to="/explainer"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <HelpCircle className="w-3.5 h-3.5" /> Explainer
          </NavLink>
          <NavLink
            to="/converter"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Repeat className="w-3.5 h-3.5" /> Converter
          </NavLink>
          <NavLink
            to="/complexity"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <BarChart2 className="w-3.5 h-3.5" /> Complexity
          </NavLink>
          <NavLink
            to="/generator"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                isActive
                  ? 'bg-emerald-600/80 text-white shadow-lg shadow-emerald-500/20'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Wand2 className="w-3.5 h-3.5" /> Generator
          </NavLink>
        </nav>

        </header>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/log/:id"
          element={
            <ProtectedRoute>
              <LogDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corrector"
          element={
            <ProtectedRoute>
              <CodeCorrector />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explainer"
          element={
            <ProtectedRoute>
              <CodeExplainer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/converter"
          element={
            <ProtectedRoute>
              <CodeConverter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complexity"
          element={
            <ProtectedRoute>
              <CodeComplexity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <CodeGenerator />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
