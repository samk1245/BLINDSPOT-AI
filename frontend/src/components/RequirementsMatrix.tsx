import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  GitCompare, 
  ShieldAlert,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import { ResearchRequirement, CoverageStatus } from '../types';
import { cyberAudio } from '../utils/soundEffects';

interface RequirementsMatrixProps {
  requirements: ResearchRequirement[];
}

export const RequirementsMatrix: React.FC<RequirementsMatrixProps> = ({ requirements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      const matchesSearch = 
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.expected_evidence.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus !== 'ALL' && req.coverage_status !== filterStatus) return false;
      return true;
    });
  }, [requirements, searchTerm, filterStatus]);

  const getStatusBadge = (status: CoverageStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>SUPPORTED</span>
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PARTIAL</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>MISSING</span>
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <GitCompare className="w-3.5 h-3.5" />
            <span>CONFLICTING</span>
          </span>
        );
      case 'POTENTIALLY_OUTDATED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Clock className="w-3.5 h-3.5" />
            <span>STALE DATE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">HIGH</span>;
      default:
        return <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">MEDIUM</span>;
    }
  };

  return (
    <div className="panel-card p-6 bg-[#121827]/80 space-y-4 border border-slate-800 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-4.5 h-4.5 text-indigo-400" />
            <span>Decomposed Research Requirements Matrix ({filteredRequirements.length}/{requirements.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Atomic requirements evaluated against ingested evidence and categorized by importance.
          </p>
        </div>

        {/* Search & Coverage Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter criteria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            {['ALL', 'SUPPORTED', 'MISSING', 'CONFLICTING'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => {
                  cyberAudio.playClick();
                  setFilterStatus(statusKey);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterStatus === statusKey
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {statusKey}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequirements.map((req) => (
          <div 
            key={req.id} 
            className="interactive-card p-4.5 bg-[#0f172a]/90 border border-slate-800 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase text-indigo-400">
                  [{req.category}]
                </span>
                {getImportanceBadge(req.importance)}
              </div>
              <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                {req.description}
              </h4>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">EXPECTED EVIDENCE:</span>
                <p className="text-slate-300 line-clamp-2">{req.expected_evidence}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase text-[10px] block">VERIFICATION CRITERIA:</span>
                <p className="text-slate-300 line-clamp-2">{req.verification_criteria}</p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">COVERAGE:</span>
                {getStatusBadge(req.coverage_status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
