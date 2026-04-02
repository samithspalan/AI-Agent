import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LogDetail from './components/LogDetail';
import { LayoutGrid, Github } from 'lucide-react';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans border-t-4 border-emerald-500">
        {/* Navigation Top Bar */}
        <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform ring-2 ring-emerald-500/30">
                <img src="/logo.png" alt="CodeSage Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tighter block leading-none bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  CodeSage
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                  Autonomous PR Agent
                </span>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold text-sm uppercase tracking-widest ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800'}`
                }
              >
                <LayoutGrid className="w-4 h-4" /> Dashboard
              </NavLink>
              <div className="w-px h-6 bg-slate-800 mx-2" />
              <div className="flex items-center gap-4 ml-2">
                <a href="https://github.com/samithspalan" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/log/:id" element={<LogDetail />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950 py-12">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3 opacity-30 grayscale">
              <img src="/logo.png" alt="CodeSage" className="w-5 h-5 object-cover rounded" />
              <span className="font-black tracking-tighter uppercase">CodeSage AI Agent</span>
            </div>
            <div className="flex gap-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">API Status</a>
              <a href="#" className="hover:text-emerald-500 transition-colors">Support</a>
            </div>
            <div className="text-slate-700 text-[10px] font-bold">
              &copy; 2026 CODESAGE. ALL RIGHTS RESERVED.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
