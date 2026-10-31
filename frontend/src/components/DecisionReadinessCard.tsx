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
    return 'text-rose-500 stroke-rose-500';
  };

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'HIGH_READINESS':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">HIGH READINESS</span>;
      case 'MODERATE_READINESS':
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">MODERATE READINESS</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">INSUFFICIENT READINESS</span>;
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Decision Readiness Index</span>
          </h3>
          <p className="text-xs text-slate-400">
            Explainable mathematical formula measuring verifiable evidence completeness before taking action.
          </p>
        </div>
        {breakdown && getBandBadge(breakdown.band)}
      </div>

      {/* Main Score Dial and Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Score Radial Indicator */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-slate-800"
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
          <span className="text-xs font-semibold text-slate-300">
            {score >= 75 ? 'Strong Evidence' : score >= 50 ? 'Cautious Action' : 'Action Premature'}
          </span>
        </div>

        {/* Recommendation & Breakdown Summary */}
        <div className="md:col-span-8 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5" />
              <span>Epistemic Guidance:</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {breakdown?.recommendation || 'Run analysis to compute readiness recommendation.'}
            </p>
          </div>

          {/* Component Scores */}
          {breakdown && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold text-[10px] uppercase block">Coverage Component</span>
                <div className="text-cyan-400 font-bold font-mono text-base">
                  {breakdown.components.requirement_coverage.score} / {breakdown.components.requirement_coverage.max}
                </div>
                <div className="text-[10px] text-slate-400">{breakdown.components.requirement_coverage.details}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold text-[10px] uppercase block">Source Reliability</span>
                <div className="text-violet-400 font-bold font-mono text-base">
                  {breakdown.components.source_reliability.score} / {breakdown.components.source_reliability.max}
                </div>
                <div className="text-[10px] text-slate-400">{breakdown.components.source_reliability.details}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold text-[10px] uppercase block">Freshness Component</span>
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
        <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="font-semibold text-slate-300">Applied Formula Deductions:</span>
            <span className="text-rose-400 font-mono">
              -{breakdown.penalties.unresolved_conflicts.deduction} pts ({breakdown.penalties.unresolved_conflicts.count} conflicts)
            </span>
            <span className="text-amber-400 font-mono">
              -{breakdown.penalties.critical_gaps.deduction} pts ({breakdown.penalties.critical_gaps.count} critical gaps)
            </span>
            <span className="text-sky-400 font-mono">
              -{breakdown.penalties.unverified_tasks.deduction} pts ({breakdown.penalties.unverified_tasks.count} unverified tasks)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
            <div className="font-semibold text-slate-300">Important Methodological Limitations:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {breakdown.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
