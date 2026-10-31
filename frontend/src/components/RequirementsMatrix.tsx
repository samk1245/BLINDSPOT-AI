import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  GitCompare, 
  ShieldAlert,
  Layers,
  Search
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
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>SUPPORTED</span>
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#e2b65c]/10 text-[#e2b65c] border border-[#e2b65c]/30">
            <AlertCircle className="w-3 h-3" />
            <span>PARTIALLY SUPPORTED</span>
          </span>
        );
      case 'MISSING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" />
            <span>MISSING</span>
          </span>
        );
      case 'CONFLICTING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <GitCompare className="w-3 h-3" />
            <span>CONFLICTING</span>
          </span>
        );
      case 'POTENTIALLY_OUTDATED':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <Clock className="w-3 h-3" />
            <span>STALE DATE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <HelpCircle className="w-3 h-3" />
            <span>UNVERIFIED</span>
          </span>
        );
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'CRITICAL':
        return <span className="text-[9px] font-mono font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[9px] font-mono font-bold text-[#e2b65c] px-1.5 py-0.5 rounded bg-[#e2b65c]/10 border border-[#e2b65c]/30">HIGH</span>;
      default:
        return <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">MEDIUM</span>;
    }
  };

  return (
    <div className="hud-corner p-6 rounded-2xl glass-panel space-y-4 border border-cyan-500/30 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-mono font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#00d2ff]" />
            <span>DECOMPOSED RESEARCH REQUIREMENTS MATRIX ({filteredRequirements.length}/{requirements.length})</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Atomic requirements evaluated against ingested evidence and categorized by importance.
          </p>
        </div>

        {/* Search & Coverage Status Filter */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter criteria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 bg-[#060a17] p-1 rounded-lg border border-cyan-500/20 text-[10px] font-mono">
            {['ALL', 'SUPPORTED', 'MISSING', 'CONFLICTING'].map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => {
                  cyberAudio.playClick();
                  setFilterStatus(statusKey);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  filterStatus === statusKey
                    ? 'bg-[#00d2ff]/20 text-[#00d2ff] font-bold border border-[#00d2ff]/40'
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
            className="hud-corner p-4 rounded-xl glass-card space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#00d2ff]">
                  [{req.category}]
                </span>
                {getImportanceBadge(req.importance)}
              </div>
              <h4 className="text-sm font-semibold text-slate-200 leading-snug font-sans">
                {req.description}
              </h4>
            </div>

            <div className="space-y-2 pt-2 border-t border-cyan-500/10 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 font-semibold uppercase text-[9px] block">EXPECTED EVIDENCE:</span>
                <p className="text-slate-400 line-clamp-2 font-sans">{req.expected_evidence}</p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold uppercase text-[9px] block">VERIFICATION CRITERIA:</span>
                <p className="text-slate-400 line-clamp-2 font-sans">{req.verification_criteria}</p>
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-slate-500 text-[9px] uppercase font-semibold">COVERAGE:</span>
                {getStatusBadge(req.coverage_status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
