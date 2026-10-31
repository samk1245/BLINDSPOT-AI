import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  GitCompare, 
  History, 
  FileCheck2, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileQuestion,
  Fingerprint,
  Terminal,
  Activity,
  Cpu,
  Sparkles
} from 'lucide-react';
import { ThreeEvidenceGlobe } from './ThreeEvidenceGlobe';
import { useAuth } from '../context/AuthContext';
import { cyberAudio } from '../utils/soundEffects';

export const LandingHero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { quickDemoLogin } = useAuth();

  const handleLaunchClick = () => {
    cyberAudio.playScan();
    quickDemoLogin();
    onGetStarted();
  };

  const handleSecondaryClick = () => {
    cyberAudio.playClick();
    onGetStarted();
  };

  return (
    <div className="relative overflow-hidden bg-cyber-grid bg-radial-nebula">
      {/* Laser Scanline Beam Effect */}
      <div className="scanline" />

      {/* SPHINX LIVE TELEMETRY MARQUEE TICKER */}
      <div className="border-y border-cyan-500/20 bg-[#030611]/80 backdrop-blur-md overflow-hidden py-2 select-none">
        <div className="animate-marquee flex items-center space-x-8 text-xs font-mono tracking-wider">
          <span className="flex items-center space-x-2 text-[#00d2ff]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
            <span className="font-bold">CORE_SYS:</span>
            <span>BLINDSPOT REASONING ENGINE ONLINE</span>
          </span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center space-x-2 text-[#e2b65c]">
            <Lock className="w-3.5 h-3.5 text-[#e2b65c]" />
            <span className="font-bold">SECURITY:</span>
            <span>RFC-9106 ARGON2ID + SSRF DNS SHIELD (0.0.0.0/8 FILTERED)</span>
          </span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">EPISTEMIC AUDIT:</span>
            <span>100% EVIDENCE TRACEABILITY TO SHA-256 PASSAGES</span>
          </span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center space-x-2 text-violet-400">
            <Activity className="w-3.5 h-3.5 text-violet-400" />
            <span className="font-bold">CONTRADICTION DETECTOR:</span>
            <span>ACTIVE (DIFFERENTIAL CLAIMS ENGINE)</span>
          </span>
          <span className="text-slate-600">✦</span>
          <span className="flex items-center space-x-2 text-[#00d2ff]">
            <Cpu className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span className="font-bold">LATENCY:</span>
            <span>0.03s FAST API ENGINE</span>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Sphinx Tech Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#060a1a] border border-[#00d2ff]/40 text-[#00d2ff] text-xs font-mono tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-pulse" />
              <span>SPHINX EDITION • EPISTEMIC INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-mono">
              DON'T JUST FIND ANSWERS. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00d2ff] via-[#e2b65c] to-[#9a6cff] text-glow-cyan">
                DISCOVER WHAT'S MISSING.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Standard AI summarizes what it finds. <strong className="text-[#00d2ff] font-semibold">BLINDSPOT AI</strong> audits what's left unsaid: identifying critical information gaps, contradictory stipulations, outdated guidelines, and unsubstantiated claims across official portals and PDFs.
            </p>

            {/* Futuristic Sphinx CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunchClick}
                className="hud-corner animate-shimmer relative flex items-center space-x-3 px-7 py-4 rounded-xl text-sm font-mono font-black uppercase tracking-wider bg-gradient-to-r from-[#00d2ff] via-[#00a8ff] to-[#e2b65c] text-black shadow-xl shadow-[#00d2ff]/30 hover:shadow-[#00d2ff]/50 transition-all hover:scale-105 active:scale-95"
              >
                <span>LAUNCH SCHOLARSHIP DEMO</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                onClick={handleSecondaryClick}
                className="hud-corner-gold flex items-center space-x-2 px-6 py-4 rounded-xl text-sm font-mono font-bold bg-[#060a1a] hover:bg-[#091129] border border-[#e2b65c]/40 text-[#e2b65c] hover:border-[#e2b65c] transition-all hover:scale-102"
              >
                <Terminal className="w-4 h-4" />
                <span>SIGN IN / REGISTER</span>
              </button>
            </div>

            {/* Trust Telemetry Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-cyan-500/20">
              <div className="hud-corner bg-[#060a1a]/60 p-3 rounded-lg border border-cyan-500/20">
                <div className="text-2xl font-black text-[#00d2ff] font-mono text-glow-cyan">100%</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Traceable Citations</div>
              </div>
              <div className="hud-corner-gold bg-[#060a1a]/60 p-3 rounded-lg border border-[#e2b65c]/20">
                <div className="text-2xl font-black text-[#e2b65c] font-mono text-glow-gold">SSRF</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Immune Ingestion</div>
              </div>
              <div className="hud-corner bg-[#060a1a]/60 p-3 rounded-lg border border-emerald-500/20">
                <div className="text-2xl font-black text-emerald-400 font-mono">0.03s</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Verification Speed</div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Celestial Hologram */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="hud-corner relative rounded-2xl glass-panel p-4 glow-cyan overflow-hidden">
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1 rounded-md bg-[#02040a]/90 border border-cyan-500/40 text-[10px] font-mono text-[#00d2ff]">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping" />
                <span>CYBER ORBITAL MESH</span>
              </div>
              
              <ThreeEvidenceGlobe className="h-[380px] w-full" />

              {/* Live Epistemic Telemetry Cards */}
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#060a1a]/90 border border-amber-500/40 text-xs">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono font-bold">
                    <FileQuestion className="w-4 h-4 shrink-0" />
                    <span>GAP IDENTIFIED:</span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-mono">Renewal GPA omitted in 2026 portal</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#060a1a]/90 border border-rose-500/40 text-xs">
                  <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>CONFLICT:</span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-mono">$65,000 Portal vs $50,000 Advisory</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Six Pillars of Blindspot Intelligence */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-cyan-500/20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block text-[#e2b65c] font-mono text-xs uppercase tracking-widest font-bold">
            ARCHITECTURE MATRIX
          </div>
          <h2 className="text-3xl font-black text-white font-mono tracking-tight">
            THE SIX PILLARS OF BLINDSPOT INTELLIGENCE
          </h2>
          <p className="text-slate-400 text-sm">
            Built specifically to solve the dangerous limitations of standard LLM research and prevent costly misjudgments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="hud-corner p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00d2ff]">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">AI Goal Decomposer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs broad research inquiries into atomic, structured verification criteria with explicit importance ratings.
            </p>
          </div>

          <div className="hud-corner-gold p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-[#e2b65c]/40 flex items-center justify-center text-[#e2b65c]">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Epistemic Gap Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Differentiates between verified proof, partial coverage, and unaddressed stipulations without hallucinating false negatives.
            </p>
          </div>

          <div className="hud-corner p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Contradiction Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies direct factual divergences between sources while discerning scope, eligibility differences, and temporal supersessions.
            </p>
          </div>

          <div className="hud-corner p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Temporal Decay Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discovers missing publication dates, expired deadlines, and superseded policy editions published in prior fiscal years.
            </p>
          </div>

          <div className="hud-corner-gold p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Cryptographic Traceability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single finding links directly to SHA-256 fingerprinted source passages via an interactive React Flow DAG.
            </p>
          </div>

          <div className="hud-corner p-6 rounded-xl glass-card space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-mono">Decision Readiness Index</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes an explainable 0–100 score breaking down coverage, source reliability, and penalty deductions mathematically.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture Highlight */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-cyan-500/20">
        <div className="hud-corner rounded-2xl bg-gradient-to-r from-[#030611] via-[#060a1a] to-[#0d1326] p-8 border border-cyan-500/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-[#e2b65c] text-xs font-mono font-bold uppercase">
                <Lock className="w-4 h-4" />
                <span>DEFENSE-IN-DEPTH SECURITY ARCHITECTURE</span>
              </div>
              <h3 className="text-2xl font-black text-white font-mono">HARDENED BACKEND & ZERO TRUST</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Zero plain-text credentials, memory-hard Argon2id key derivation, pre-flight DNS validation against SSRF & cloud metadata endpoints (169.254.169.254), magic-byte file screening (%PDF-), and object-level multi-tenancy.
              </p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <div className="px-4 py-2 rounded-lg bg-[#02040a] border border-cyan-500/40 text-xs font-mono text-[#00d2ff]">
                Argon2id (RFC 9106)
              </div>
              <div className="px-4 py-2 rounded-lg bg-[#02040a] border border-[#e2b65c]/40 text-xs font-mono text-[#e2b65c]">
                DNS SSRF Shield
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
