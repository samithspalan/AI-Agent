import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import Dashboard from './components/Dashboard';
import LogDetail from './components/LogDetail';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import CodeCorrector from './pages/CodeCorrector';
import CodeExplainer from './pages/CodeExplainer';
import { useTheme } from './context/ThemeContext';
import { LayoutGrid, Github, Sun, Moon, Code, HelpCircle } from 'lucide-react';
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
  const isAppRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/log/') || pathname.startsWith('/corrector') || pathname.startsWith('/explainer');
  if (!isAppRoute) return null;

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <header
        className={`pointer-events-auto backdrop-blur-xl border rounded-full shadow-[0_8px_32px_var(--shadow-color)] px-6 py-3 flex items-center gap-8 transition-colors duration-300 ${
          isDark
            ? 'bg-white/[0.04] border-white/10'
            : 'bg-white/90 border-slate-200'
        }`}
      >
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform ring-2 ring-emerald-500/30">
            <img src="/logo.png" alt="CodeSage Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight block leading-none bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              CodeSage
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-widest block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Autonomous PR Agent
            </span>
          </div>
        </Link>

        {/* Nav links */}
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
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          <a
            href="https://github.com/samithspalan"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
          >
            <Github className="w-5 h-5" />
          </a>
          <ThemeToggle />
          <div className={`w-px h-5 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 ring-2 ring-emerald-500/40 hover:ring-emerald-400/60 transition-all',
              },
            }}
            afterSignOutUrl="/"
          />
        </div>
      </header>
    </div>
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
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
