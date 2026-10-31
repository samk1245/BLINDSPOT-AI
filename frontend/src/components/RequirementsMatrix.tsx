import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  GitCompare, 
  ShieldAlert,
  Layers
} from 'lucide-react';
import { ResearchRequirement, CoverageStatus } from '../types';

interface RequirementsMatrixProps {
  requirements: ResearchRequirement[];
}

export const RequirementsMatrix: React.FC<RequirementsMatrixProps> = ({ requirements }) => {
  const getStatusBadge = (status: CoverageStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SUPPORTED</span>
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PARTIALLY SUPPORTED</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>MISSING FROM SOURCES</span>
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-800">
            <GitCompare className="w-3.5 h-3.5" />
            <span>CONFLICTING</span>
          </span>
        );
      case 'POTENTIALLY_OUTDATED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-orange-950 text-orange-400 border border-orange-800">
            <Clock className="w-3.5 h-3.5" />
            <span>STALE DATE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="text-[10px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800/40">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">HIGH</span>;
      default:
        return <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">MEDIUM</span>;
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>AI Decomposed Research Requirements Matrix</span>
          </h3>
          <p className="text-xs text-slate-400">
            Atomic requirements evaluated against ingested evidence and categorized by importance.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400">{requirements.length} Criteria</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requirements.map((req) => (
          <div 
            key={req.id} 
            className="p-4 rounded-xl glass-card space-y-3 flex flex-col justify-between hover:border-slate-600 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
                  [{req.category}]
                </span>
                {getImportanceBadge(req.importance)}
              </div>
              <h4 className="text-sm font-semibold text-slate-200 leading-snug">
                {req.description}
              </h4>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Expected Evidence:</span>
                <p className="text-slate-400 line-clamp-2">{req.expected_evidence}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Verification Criteria:</span>
                <p className="text-slate-400 line-clamp-2">{req.verification_criteria}</p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Coverage Status:</span>
                {getStatusBadge(req.coverage_status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
