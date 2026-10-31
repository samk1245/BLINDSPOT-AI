import React from 'react';
import { 
  ShieldCheck, 
  HelpCircle, 
  AlertTriangle, 
  TrendingUp, 
  MinusCircle, 
  CheckCircle2, 
  Info,
  Scale
} from 'lucide-react';
import { ReadinessBreakdown } from '../types';

interface DecisionReadinessCardProps {
  score: number;
  breakdownRaw: string;
}

export const DecisionReadinessCard: React.FC<DecisionReadinessCardProps> = ({ score, breakdownRaw }) => {
  let breakdown: ReadinessBreakdown | null = null;
  try {
    breakdown = JSON.parse(breakdownRaw);
  } catch {
    breakdown = null;
  }

  const getScoreColor = (s: number) => {
    if (s >= 75) return 'text-emerald-400 stroke-emerald-400';
    if (s >= 50) return 'text-amber-400 stroke-amber-400';
    return 'text-rose-400 stroke-rose-400';
  };

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'HIGH_READINESS':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">HIGH READINESS</span>;
      case 'MODERATE_READINESS':
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">MODERATE READINESS</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">INSUFFICIENT READINESS</span>;
    }
  };

  return (
    <div className="p-6 rounded-2xl panel-card space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Decision Readiness Index</span>
          </h3>
          <p className="text-xs text-slate-400">
            Explainable mathematical evaluation of evidence completeness before taking mission-critical actions.
          </p>
        </div>
        {breakdown && getBandBadge(breakdown.band)}
      </div>

      {/* Main Score Dial and Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Score Radial Indicator */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-[#0e1422] border border-[#1e2638] text-center space-y-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-slate-800/60"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                className={`${getScoreColor(score)} transition-all duration-1000`}
                strokeWidth="10"
                strokeDasharray="326.7"
                strokeDashoffset={326.7 - (326.7 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-white font-mono">{score}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">/ 100</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-200">
            {score >= 75 ? 'Strong Evidence' : score >= 50 ? 'Cautious Action Warranted' : 'Action Premature / High Blindspots'}
          </span>
        </div>

        {/* Recommendation & Breakdown Summary */}
        <div className="md:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-[#0e1422] border border-[#222f46] space-y-1.5">
            <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Epistemic Guidance & Executive Takeaway:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {breakdown?.recommendation || 'Run analysis to compute readiness recommendation.'}
            </p>
          </div>

          {/* Component Scores */}
          {breakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1e293b] space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Coverage Component</span>
                <div className="text-sky-400 font-bold font-mono text-base">
                  {breakdown.components.requirement_coverage.score} / {breakdown.components.requirement_coverage.max}
                </div>
                <div className="text-[10px] text-slate-400">{breakdown.components.requirement_coverage.details}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1e293b] space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Source Reliability</span>
                <div className="text-violet-400 font-bold font-mono text-base">
                  {breakdown.components.source_reliability.score} / {breakdown.components.source_reliability.max}
                </div>
                <div className="text-[10px] text-slate-400">{breakdown.components.source_reliability.details}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0e17] border border-[#1e293b] space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase block">Freshness Component</span>
                <div className="text-emerald-400 font-bold font-mono text-base">
                  {breakdown.components.temporal_freshness.score} / {breakdown.components.temporal_freshness.max}
                </div>
                <div className="text-[10px] text-slate-400">{breakdown.components.temporal_freshness.details}</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Penalties & Explicit Limitations */}
      {breakdown && (
        <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="font-semibold text-slate-300">Applied Formula Deductions:</span>
            <span className="text-rose-400 font-mono bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
              -{breakdown.penalties.unresolved_conflicts.deduction} pts ({breakdown.penalties.unresolved_conflicts.count} conflicts)
            </span>
            <span className="text-amber-400 font-mono bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40">
              -{breakdown.penalties.critical_gaps.deduction} pts ({breakdown.penalties.critical_gaps.count} critical gaps)
            </span>
            <span className="text-sky-400 font-mono bg-sky-950/40 px-2 py-0.5 rounded border border-sky-900/40">
              -{breakdown.penalties.unverified_tasks.deduction} pts ({breakdown.penalties.unverified_tasks.count} unverified tasks)
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#0a0e17] border border-[#1e293b] text-[11px] space-y-1.5 text-slate-400">
            <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Important Methodological Limitations:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {breakdown.limitations.map((lim, idx) => (
                <li key={idx} className="leading-relaxed">{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
