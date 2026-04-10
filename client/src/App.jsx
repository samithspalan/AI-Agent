import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { LayoutGrid, Github, Sun, Moon, Code, HelpCircle, Repeat, BarChart2, Wand2, Search } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import './App.css';

// Lazy loaded components
const Dashboard = lazy(() => import('./components/Dashboard'));
const LogDetail = lazy(() => import('./components/LogDetail'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const CodeCorrector = lazy(() => import('./pages/CodeCorrector'));
const CodeExplainer = lazy(() => import('./pages/CodeExplainer'));
const CodeConverter = lazy(() => import('./pages/CodeConverter'));
const CodeComplexity = lazy(() => import('./pages/CodeComplexity'));
const CodeGenerator = lazy(() => import('./pages/CodeGenerator'));
const RepoSearcher = lazy(() => import('./pages/RepoSearcher'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
          <div>
            <h2 className="text-3xl font-bold text-emerald-500 mb-4">Something went wrong.</h2>
            <p className="text-slate-400 mb-6">The module failed to load or encountered a critical error.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-emerald-600 rounded-full font-bold hover:bg-emerald-500 transition-all">
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
  </div>
);

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/scout", label: "Repo Scout", icon: Search },
  { to: "/corrector", label: "Corrector", icon: Code },
  { to: "/explainer", label: "Explainer", icon: HelpCircle },
  { to: "/converter", label: "Converter", icon: Repeat },
  { to: "/complexity", label: "Complexity", icon: BarChart2 },
  { to: "/generator", label: "Generator", icon: Wand2 },
  
];

const ThemeToggle = () => {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
        isDark ? 'bg-white/10 border-white/20 text-yellow-300' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

const AppNavbar = () => {
  const { pathname } = useLocation();
  const { isDark } = useTheme();
  
  const isAppRoute = navLinks.some(link => pathname.startsWith(link.to)) || pathname.startsWith('/log/');
  if (!isAppRoute) return null;

  return (
    <>
      <div className="absolute top-8 left-10 z-[60] flex items-center scale-110 md:scale-125 origin-left">
        <Link to="/dashboard" className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-emerald-500/30 group-hover:rotate-12 transition-all">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-black tracking-tighter block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">CodeSage</span>
          </div>
        </Link>
      </div>

      <div className="absolute top-8 right-10 z-[60] flex items-center gap-6">
        <ThemeToggle />
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="fixed top-8 left-0 right-0 z-50 flex justify-center px-4">
        <header className={`backdrop-blur-3xl border rounded-full shadow-2xl px-6 py-2 flex items-center ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/90 border-slate-200'}`}>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full transition-all font-bold text-[10px] uppercase tracking-widest ${
                    isActive ? 'bg-emerald-600/80 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`
                }
              >
                <link.icon className="w-3 h-3" /> {link.label}
              </NavLink>
            ))}
          </nav>
        </header>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <AppNavbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/log/:id" element={<ProtectedRoute><LogDetail /></ProtectedRoute>} />
            <Route path="/corrector" element={<ProtectedRoute><CodeCorrector /></ProtectedRoute>} />
            <Route path="/explainer" element={<ProtectedRoute><CodeExplainer /></ProtectedRoute>} />
            <Route path="/converter" element={<ProtectedRoute><CodeConverter /></ProtectedRoute>} />
            <Route path="/complexity" element={<ProtectedRoute><CodeComplexity /></ProtectedRoute>} />
            <Route path="/generator" element={<ProtectedRoute><CodeGenerator /></ProtectedRoute>} />
            <Route path="/scout" element={<ProtectedRoute><RepoSearcher /></ProtectedRoute>} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
