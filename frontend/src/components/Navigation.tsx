import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cyberAudio } from '../utils/soundEffects';
import { 
  Eye, 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  Shield,
  Layers,
  Database
} from 'lucide-react';

interface NavigationProps {
  currentView: 'landing' | 'dashboard' | 'investigation' | 'admin';
  setCurrentView: (view: 'landing' | 'dashboard' | 'investigation' | 'admin') => void;
  hasActiveInvestigation: boolean;
  onSeedAllDemos?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  setCurrentView,
  hasActiveInvestigation,
  onSeedAllDemos
}) => {
  const { user, logout, quickDemoLogin } = useAuth();
  const [isMuted, setIsMuted] = useState(cyberAudio.getIsMuted());

  const handleAudioToggle = () => {
    const muted = cyberAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleNavClick = (view: 'landing' | 'dashboard' | 'investigation' | 'admin') => {
    cyberAudio.playClick();
    setCurrentView(view);
  };

  return (
    <nav className="border-b border-slate-800/80 bg-[#0c111d]/90 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div 
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')} 
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-950/50 group-hover:scale-105 transition-transform">
            <Eye className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-tight text-lg text-white font-sans">
                BLINDSPOT<span className="text-indigo-400 ml-1">AI</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                v1.0 ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              Don't Just Find Answers. Discover What's Missing.
            </p>
          </div>
        </div>

        {/* Live Multi-Chromatic Telemetry Indicators */}
        <div className="hidden lg:flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">SSRF SHIELD:</span>
            <span>DNS ISOLATED</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-amber-400 font-bold">AUTH:</span>
            <span>ARGON2ID</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-indigo-400 font-bold">HASH:</span>
            <span>SHA-256 PASSAGES</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <div className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => handleNavClick('investigation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentView === 'investigation'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{hasActiveInvestigation ? 'Active Investigation' : 'New Investigation'}</span>
            </button>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-rose-600/90 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}
          </div>
        )}

        {/* User Status, Audio Toggle & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Seed Full Intelligence Suite Button */}
          {onSeedAllDemos && user && (
            <button
              onClick={() => {
                cyberAudio.playScan();
                onSeedAllDemos();
              }}
              title="Load full suite of 4 realistic investigations across Healthcare, Legal, Energy, and Education"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Seed 4 Domains</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleAudioToggle}
            title={isMuted ? "Enable Sound Feedback" : "Mute Sound Feedback"}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {!user ? (
            <button
              onClick={() => {
                cyberAudio.playScan();
                quickDemoLogin();
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Platform (Demo)</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  {user.role} ACCESS
                </span>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                <UserCheck className="w-4 h-4" />
              </div>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  logout();
                }}
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
