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
  Activity,
  Layers,
  Sparkles,
  Stethoscope,
  Scale,
  Zap,
  GraduationCap
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
    <div className="relative overflow-hidden">
      {/* Telemetry Status Bar */}
      <div className="border-y border-slate-800 bg-[#0d131f]/90 backdrop-blur-md py-2.5 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">EPISTEMIC CORE:</span>
            <span className="text-slate-300">ONLINE & VERIFIED</span>
          </div>

          <div className="flex items-center space-x-2 text-indigo-400">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">SECURITY:</span>
            <span className="text-slate-300">RFC 9106 ARGON2ID + SSRF DNS SHIELD</span>
          </div>

          <div className="flex items-center space-x-2 text-amber-400">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">PROVENANCE:</span>
            <span className="text-slate-300">100% SHA-256 EVIDENCE CITATIONS</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-sky-400">
            <span className="font-bold">LATENCY:</span>
            <span className="text-slate-300">0.03s FAST API ENGINE</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Multi-Chromatic Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Next-Gen Epistemic Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              Don't Just Find Answers. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                Discover What's Missing.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Standard AI summarizes what it finds. <strong className="text-white font-semibold">BLINDSPOT AI</strong> audits what is left unsaid: identifying critical information gaps, contradictory stipulations, outdated guidelines, and unsubstantiated claims across official portals and PDFs.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={handleLaunchClick}
                className="flex items-center space-x-3 px-6 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
              >
                <span>Launch Research Demo</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={handleSecondaryClick}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              >
                <span>Sign In / Register</span>
              </button>
            </div>

            {/* Multi-Domain Coverage Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1 font-medium">Auditing 4 Critical Sectors:</span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education Grants</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Clinical Protocols</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <Scale className="w-3.5 h-3.5" />
                <span>EU AI Regulation</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <Zap className="w-3.5 h-3.5" />
                <span>Clean Energy Tax</span>
              </span>
            </div>

            {/* Trust Telemetry Grid */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-emerald-400 font-sans">100%</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Traceable Citations</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-indigo-400 font-sans">SSRF</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Immune Ingestion</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-amber-400 font-sans">0.03s</div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Verification Speed</div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Celestial Mesh */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-5 relative"
          >
            <div className="panel-card p-5 bg-[#121827]/90 border border-slate-800 overflow-hidden shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-Time Intelligence Mesh</span>
                </div>
                <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                  ACTIVE NODES: 1,420+
                </span>
              </div>
              
              <ThreeEvidenceGlobe className="h-[360px] w-full" />

              {/* Realistic Telemetry Insight Cards */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                    <FileQuestion className="w-4 h-4 shrink-0" />
                    <span>Identified Gap:</span>
                  </div>
                  <span className="text-[11px] text-slate-300">Renewal GPA condition omitted in 2026 portal</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Factual Conflict:</span>
                  </div>
                  <span className="text-[11px] text-slate-300">$65k Portal vs $50k Advisory Guide</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Six Pillars of Blindspot Intelligence */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-block text-indigo-400 font-mono text-xs uppercase tracking-widest font-bold">
            EPISTEMIC CAPABILITIES
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            The Six Pillars of Blindspot Intelligence
          </h2>
          <p className="text-slate-400 text-sm">
            Engineered specifically to overcome the silent omissions of traditional LLMs and prevent costly research misjudgments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Goal Decomposer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deconstructs broad inquiries into atomic, structured verification criteria with explicit importance ratings.
            </p>
          </div>

          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Epistemic Gap Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Differentiates between verified proof, partial coverage, and unaddressed stipulations without hallucinating omissions.
            </p>
          </div>

          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Contradiction Intelligence</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies direct factual divergences between sources while discerning scope, eligibility differences, and temporal changes.
            </p>
          </div>

          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Temporal Decay Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discovers missing publication dates, expired deadlines, and superseded policy editions published in prior fiscal years.
            </p>
          </div>

          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cryptographic Traceability</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single finding links directly to SHA-256 fingerprinted source passages via an interactive React Flow DAG.
            </p>
          </div>

          <div className="interactive-card p-6 bg-[#121827]/80 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Decision Readiness Index</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes an explainable 0–100 score breaking down coverage, source reliability, and penalty deductions mathematically.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture Highlight */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="panel-card p-8 bg-[#121827]/90 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono font-bold uppercase">
                <Lock className="w-4 h-4" />
                <span>Defense-in-Depth Security Architecture</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Hardened Backend & Zero-Trust Isolation</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Zero plain-text credentials, memory-hard Argon2id key derivation, pre-flight DNS validation against SSRF & cloud metadata endpoints (169.254.169.254), magic-byte file screening (%PDF-), and object-level multi-tenancy.
              </p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-semibold">
                Argon2id (RFC 9106)
              </div>
              <div className="px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400 font-semibold">
                DNS SSRF Shield
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
