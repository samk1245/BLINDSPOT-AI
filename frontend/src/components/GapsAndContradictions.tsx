import React from 'react';
import { 
  FileQuestion, 
  GitCompare, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { InformationGap, Conflict } from '../types';

interface GapsAndContradictionsProps {
  gaps: InformationGap[];
  conflicts: Conflict[];
}

export const GapsAndContradictions: React.FC<GapsAndContradictionsProps> = ({ gaps, conflicts }) => {
  return (
    <div className="space-y-8">
      {/* Information Gaps Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileQuestion className="w-4 h-4 text-amber-400" />
              <span>Epistemic Gaps & Information Blindspots ({gaps.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stipulations unaddressed or partially documented across all reviewed sources.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/60">
            Action Required
          </span>
        </div>

        {gaps.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No critical gaps identified in the current investigation.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap) => (
              <div 
                key={gap.id}
                className="p-5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800">
                      {gap.category}
                    </span>
                    <span className="text-[10px] font-mono text-rose-400 font-bold">
                      {gap.impact_level} IMPACT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {gap.classification}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{gap.gap_title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>

                {/* Explicit Epistemic Distinction Callout */}
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Epistemic Trace:</span>
                  </div>
                  <p className="text-slate-400 italic">{gap.epistemic_note}</p>
                </div>

                <div className="text-[11px] pt-1">
                  <span className="text-amber-400 font-semibold uppercase text-[10px] block mb-0.5">
                    Recommended Resolution Action:
                  </span>
                  <p className="text-slate-300 font-medium">{gap.suggested_action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Source Contradiction Intelligence Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-rose-400" />
              <span>Cross-Source Contradiction Intelligence ({conflicts.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct factual divergences detected by comparing assertions across distinct sources.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/60">
            Audit Priority
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No contradictory claims discovered between reviewed sources.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conf) => (
              <div 
                key={conf.id}
                className="p-5 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide">
                      {conf.conflict_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-mono text-slate-400">
                      Priority: <strong className="text-white">{conf.priority}</strong>
                    </span>
                  </div>
                </div>

                {/* Side by Side Divergent Claims */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Claim A */}
                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-cyan-400">Source A: {conf.source_a_title}</span>
                      <span className="flex items-center space-x-1 font-mono text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{conf.source_a_date || 'Undated'}</span>
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200">
                      "{conf.claim_a_text}"
                    </div>
                  </div>

                  {/* Claim B */}
                  <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-violet-400">Source B: {conf.source_b_title}</span>
                      <span className="flex items-center space-x-1 font-mono text-slate-500">
                        <Calendar className="w-3 h-3" />
                        <span>{conf.source_b_date || 'Undated'}</span>
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200">
                      "{conf.claim_b_text}"
                    </div>
                  </div>

                </div>

                {/* Divergence Analysis & Resolution Guidance */}
                <div className="space-y-2 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                      Epistemic Difference Explanation:
                    </span>
                    <p className="text-slate-200 mt-0.5">{conf.difference_explanation}</p>
                  </div>

                  <div>
                    <span className="text-cyan-400 font-semibold uppercase text-[10px] block">
                      Resolution Guidance:
                    </span>
                    <p className="text-slate-300 mt-0.5">{conf.resolution_guidance}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
