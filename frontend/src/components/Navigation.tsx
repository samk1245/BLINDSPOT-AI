import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  UserCheck
} from 'lucide-react';

interface NavigationProps {
  currentView: 'landing' | 'dashboard' | 'investigation' | 'admin';
  setCurrentView: (view: 'landing' | 'dashboard' | 'investigation' | 'admin') => void;
  hasActiveInvestigation: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  hasActiveInvestigation,
}) => {
  const { user, logout, quickDemoLogin } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-[#080c14]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => setCurrentView(user ? 'dashboard' : 'landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
                BLINDSPOT AI
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Don't Just Find Answers. Discover What's Missing.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('investigation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'investigation'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-sky-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{hasActiveInvestigation ? 'Active Investigation' : 'New Investigation'}</span>
            </button>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-400 border border-violet-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span>Security Admin</span>
              </button>
            )}
          </div>
        )}

        {/* User Status / Quick Actions */}
        <div className="flex items-center space-x-3">
          {!user ? (
            <button
              onClick={() => quickDemoLogin()}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Platform (Demo)</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {user.role} ACCESS
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-4 h-4" />
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};
