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
  Fingerprint
} from 'lucide-react';
import { ThreeEvidenceGlobe } from './ThreeEvidenceGlobe';
import { useAuth } from '../context/AuthContext';

export const LandingHero: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { quickDemoLogin } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Next-Gen Epistemic AI Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Don't Just Find Answers. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
                Discover What's Missing.
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
              Standard AI summarizes what it finds. <strong className="text-cyan-400 font-semibold">BLINDSPOT AI</strong> audits what's left unsaid: identifying critical information gaps, contradictory stipulations, outdated guidelines, and unsubstantiated claims across official portals and PDFs.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-3">
              <button
                onClick={() => {
                  quickDemoLogin();
                  onGetStarted();
                }}
                className="flex items-center space-x-3 px-6 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-102 active:scale-98"
              >
                <span>Launch Scholarship Demo</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onGetStarted}
                className="flex items-center space-x-2 px-6 py-3.5 rounded-xl text-base font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all"
              >
                <span>Sign In / Register</span>
              </button>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-800/80">
              <div>
                <div className="text-2xl font-extrabold text-cyan-400 font-mono">100%</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Traceable Citations</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-violet-400 font-mono">SSRF</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Immune Ingestion</div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">0.03s</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verification Speed</div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Globe & Intelligence Node Simulation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-2xl glass-panel p-4 glow-blue overflow-hidden">
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1 rounded-md bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Live Intelligence Mesh</span>
              </div>
              
              <ThreeEvidenceGlobe className="h-[360px] w-full" />

              {/* Floating Epistemic Insight Cards */}
              <div className="space-y-2 mt-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-amber-400">
                    <FileQuestion className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Detected Information Gap:</span>
                  </div>
                  <span className="text-[11px] text-slate-300">Renewal GPA condition omitted in 2026 portal</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-rose-500/30 text-xs">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Conflict Detected:</span>
                  </div>
                  <span className="text-[11px] text-slate-300">$65,000 Portal vs $50,000 Advisory Guide</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Feature Pillar Showcase */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-white">The Six Pillars of Blindspot Intelligence</h2>
          <p className="text-slate-400 text-sm">
            Built specifically to solve the dangerous limitations of standard LLM research and prevent costly misjudgments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Goal Decomposer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Deconstructs broad research inquiries into atomic, structured verification criteria with explicit importance ratings.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-amber-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Epistemic Gap Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Differentiates between verified proof, partial coverage, and unaddressed stipulations without hallucinating false negatives.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-rose-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Contradiction Intelligence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Identifies direct factual divergences between sources while discerning scope, eligibility differences, and temporal supersessions.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-violet-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Temporal Decay Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discovers missing publication dates, expired deadlines, and superseded policy editions published in prior fiscal years.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Cryptographic Traceability</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every single finding links directly to SHA-256 fingerprinted source passages via an interactive React Flow DAG.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card space-y-4 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Decision Readiness Index</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Computes an explainable 0–100 score breaking down coverage, source reliability, and penalty deductions mathematically.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture Highlight */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 border-t border-slate-800">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-8 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-violet-400 text-xs font-mono font-bold uppercase">
                <Lock className="w-4 h-4" />
                <span>Enterprise Security Hardening</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Engineered with Defense-in-Depth</h3>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                Zero plain-text credentials, memory-hard Argon2id key derivation, pre-flight DNS validation against SSRF & cloud metadata endpoints (169.254.169.254), magic-byte file screening (%PDF-), and object-level multi-tenancy.
              </p>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <div className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400">
                Argon2id (RFC 9106)
              </div>
              <div className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
                DNS SSRF Shield
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
