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
  Activity
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
    <nav className="border-b border-cyan-500/20 bg-[#02040a]/90 backdrop-blur-xl sticky top-0 z-50 px-4 lg:px-8 py-3 transition-all relative">
      {/* Top micro-line glow in Cyber Cyan */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Cyber Brand */}
        <div 
          onClick={() => handleNavClick(user ? 'dashboard' : 'landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00d2ff]/20 via-[#0e1933] to-[#e2b65c]/20 border border-[#00d2ff]/40 flex items-center justify-center shadow-lg shadow-[#00d2ff]/15 group-hover:border-[#00d2ff] group-hover:shadow-[#00d2ff]/30 transition-all">
            <Eye className="w-5 h-5 text-[#00d2ff] group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black tracking-widest text-lg text-white font-mono flex items-center">
                BLINDSPOT<span className="text-[#00d2ff] ml-1">AI</span>
                <span className="text-[#e2b65c] text-xs ml-1">✦</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30 uppercase tracking-wider">
                EPISTEMIC CORE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight flex items-center space-x-1.5">
              <span>DISCOVER WHAT'S MISSING</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#00d2ff] font-semibold">ENTERPRISE INTELLIGENCE</span>
            </p>
          </div>
        </div>

        {/* Live Telemetry Pill */}
        <div className="hidden xl:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#060a17] border border-cyan-500/20 text-[11px] font-mono text-slate-400">
          <Activity className="w-3.5 h-3.5 text-[#00d2ff] animate-pulse" />
          <span className="text-[#00d2ff] font-bold">TELEMETRY:</span>
          <span>SSRF SHIELD ACTIVE</span>
          <span className="text-slate-600">|</span>
          <span className="text-[#e2b65c]">ARGON2ID</span>
        </div>

        {/* Navigation Tabs */}
        {user && (
          <div className="hidden md:flex items-center space-x-1.5 bg-[#060a17]/90 p-1.5 rounded-xl border border-cyan-500/20">
            <button
              onClick={() => handleNavClick('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-[#00d2ff]/20 to-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>DASHBOARD</span>
            </button>

            <button
              onClick={() => handleNavClick('investigation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                currentView === 'investigation'
                  ? 'bg-gradient-to-r from-[#00d2ff]/20 to-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/40 shadow-[0_0_15px_rgba(0,210,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{hasActiveInvestigation ? 'ACTIVE STUDIO' : 'NEW INVESTIGATION'}</span>
            </button>

            {user.role === 'ADMIN' && (
              <button
                onClick={() => handleNavClick('admin')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  currentView === 'admin'
                    ? 'bg-gradient-to-r from-[#e2b65c]/20 to-[#e2b65c]/10 text-[#e2b65c] border border-[#e2b65c]/40 shadow-[0_0_15px_rgba(226,182,92,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#e2b65c]" />
                <span>SEC ADMIN</span>
              </button>
            )}
          </div>
        )}

        {/* User Status, Audio Toggle & Quick Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Cyber Audio Mute/Unmute Toggle */}
          <button
            onClick={handleAudioToggle}
            title={isMuted ? "Enable Cyber Sound Effects" : "Mute Sound Effects"}
            className="p-2 rounded-lg bg-[#060a17] border border-cyan-500/20 text-slate-400 hover:text-[#00d2ff] hover:border-cyan-500/40 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-[#00d2ff]" />}
          </button>

          {!user ? (
            <button
              onClick={() => {
                cyberAudio.playScan();
                quickDemoLogin();
              }}
              className="hud-corner relative flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-mono font-black uppercase tracking-wider bg-gradient-to-r from-[#00d2ff] via-[#00a6ff] to-[#e2b65c] text-black shadow-lg shadow-[#00d2ff]/25 hover:shadow-[#00d2ff]/50 transition-all hover:scale-105 active:scale-95 animate-shimmer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>ACCESS DEMO</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">
                  {user.full_name || user.email.split('@')[0]}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#00d2ff] font-bold">
                  {user.role} VERIFIED
                </span>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#060a17] border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
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
