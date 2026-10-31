import React, { useState, useMemo } from 'react';
import { 
  FileQuestion, 
  GitCompare, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Calendar,
  Search,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { InformationGap, Conflict } from '../types';
import { cyberAudio } from '../utils/soundEffects';

interface GapsAndContradictionsProps {
  gaps: InformationGap[];
  conflicts: Conflict[];
}

export const GapsAndContradictions: React.FC<GapsAndContradictionsProps> = ({ gaps, conflicts }) => {
  const [gapSearch, setGapSearch] = useState('');
  const [selectedImpact, setSelectedImpact] = useState<string>('ALL');
  const [expandedDiffId, setExpandedDiffId] = useState<string | null>(null);

  // Filtered gaps
  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      const matchesSearch = 
        gap.gap_title.toLowerCase().includes(gapSearch.toLowerCase()) ||
        gap.description.toLowerCase().includes(gapSearch.toLowerCase()) ||
        gap.category.toLowerCase().includes(gapSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (selectedImpact !== 'ALL' && gap.impact_level !== selectedImpact) return false;
      return true;
    });
  }, [gaps, gapSearch, selectedImpact]);

  const toggleDiff = (id: string) => {
    cyberAudio.playClick();
    setExpandedDiffId(expandedDiffId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Information Gaps Section */}
      <div className="hud-corner p-6 rounded-2xl glass-panel space-y-4 border border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center space-x-2">
              <FileQuestion className="w-4 h-4 text-[#e2b65c]" />
              <span>EPISTEMIC GAPS & INFORMATION BLINDSPOTS ({filteredGaps.length}/{gaps.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Stipulations unaddressed or partially documented across all reviewed sources.
            </p>
          </div>
          
          {/* Search & Impact Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gaps..."
                value={gapSearch}
                onChange={(e) => setGapSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
              />
            </div>

            <div className="flex items-center space-x-1 bg-[#060a17] p-1 rounded-lg border border-cyan-500/20 text-[10px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    cyberAudio.playClick();
                    setSelectedImpact(level);
                  }}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedImpact === level
                      ? 'bg-[#e2b65c]/20 text-[#e2b65c] font-bold border border-[#e2b65c]/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredGaps.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#060a17]/40 border border-cyan-500/20 text-slate-400 text-xs font-mono">
            No critical gaps matching current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGaps.map((gap) => (
              <div 
                key={gap.id}
                className="hud-corner-gold p-5 rounded-xl bg-[#060a17]/90 border border-[#e2b65c]/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#e2b65c] px-2 py-0.5 rounded bg-[#e2b65c]/10 border border-[#e2b65c]/30">
                      {gap.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      gap.impact_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {gap.impact_level} IMPACT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {gap.classification}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100 font-sans">{gap.gap_title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{gap.description}</p>

                {/* Explicit Epistemic Distinction Callout */}
                <div className="p-3 rounded-lg bg-[#02040a] border border-cyan-500/20 text-[11px] font-mono space-y-1">
                  <div className="flex items-center space-x-1.5 text-[#00d2ff] font-semibold">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>EPISTEMIC TRACE:</span>
                  </div>
                  <p className="text-slate-400 italic font-sans">{gap.epistemic_note}</p>
                </div>

                <div className="text-[11px] pt-1 font-mono">
                  <span className="text-[#e2b65c] font-semibold uppercase text-[10px] block mb-0.5">
                    RECOMMENDED RESOLUTION ACTION:
                  </span>
                  <p className="text-slate-300 font-sans">{gap.suggested_action}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Source Contradiction Intelligence Section */}
      <div className="hud-corner p-6 rounded-2xl glass-panel space-y-4 border border-rose-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center space-x-2">
              <GitCompare className="w-4 h-4 text-rose-400" />
              <span>CROSS-SOURCE CONTRADICTION INTELLIGENCE ({conflicts.length})</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Direct factual divergences detected by comparing assertions across distinct sources.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
            AUDIT PRIORITY
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#060a17]/40 border border-rose-500/20 text-slate-400 text-xs font-mono">
            No contradictory claims discovered between reviewed sources.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conf) => {
              const isDiffExpanded = expandedDiffId === conf.id;

              return (
                <div 
                  key={conf.id}
                  className="hud-corner p-5 rounded-xl bg-[#060a17]/90 border border-rose-500/30 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wide">
                        {conf.conflict_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-mono text-slate-400">
                        PRIORITY: <strong className="text-white">{conf.priority}</strong>
                      </span>
                    </div>

                    {/* Interactive Side-by-Side Diff Inspector Trigger */}
                    <button
                      onClick={() => toggleDiff(conf.id)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#02040a] hover:bg-[#00d2ff]/10 text-[#00d2ff] border border-cyan-500/30 text-xs font-mono font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isDiffExpanded ? 'Hide Factual Diff' : 'Inspect Factual Diff'}</span>
                      {isDiffExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                  </div>

                  {/* Side by Side Divergent Claims */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Claim A */}
                    <div className="p-4 rounded-lg bg-[#02040a] border border-cyan-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="font-semibold text-[#00d2ff]">Source A: {conf.source_a_title}</span>
                        <span className="flex items-center space-x-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{conf.source_a_date || 'Undated'}</span>
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 font-sans">
                        "{conf.claim_a_text}"
                      </div>
                    </div>

                    {/* Claim B */}
                    <div className="p-4 rounded-lg bg-[#02040a] border border-purple-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span className="font-semibold text-[#9a6cff]">Source B: {conf.source_b_title}</span>
                        <span className="flex items-center space-x-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{conf.source_b_date || 'Undated'}</span>
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 font-sans">
                        "{conf.claim_b_text}"
                      </div>
                    </div>

                  </div>

                  {/* Interactive Factual Diff Analysis (When Expanded) */}
                  {isDiffExpanded && (
                    <div className="p-4 rounded-xl bg-[#030611] border border-cyan-500/30 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-[#00d2ff] font-bold text-[11px]">
                        <span>FACTUAL DISCREPANCY COMPARISON MATRIX</span>
                        <span className="text-[10px] text-slate-400">Automated NLP Token Contrast</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                        <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30">
                          <div className="text-[#00d2ff] font-bold mb-1">STIPULATION A (ACTIVE PORTAL):</div>
                          <div className="text-slate-300 font-sans">{conf.claim_a_text}</div>
                        </div>
                        <div className="p-2.5 rounded bg-rose-950/30 border border-rose-500/30">
                          <div className="text-rose-400 font-bold mb-1">STIPULATION B (ADVISORY GUIDE):</div>
                          <div className="text-slate-300 font-sans">{conf.claim_b_text}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divergence Analysis & Resolution Guidance */}
                  <div className="space-y-2 pt-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                        EPISTEMIC DIFFERENCE EXPLANATION:
                      </span>
                      <p className="text-slate-200 mt-0.5 font-sans">{conf.difference_explanation}</p>
                    </div>

                    <div>
                      <span className="text-[#00d2ff] font-semibold uppercase text-[10px] block">
                        RESOLUTION GUIDANCE:
                      </span>
                      <p className="text-slate-300 mt-0.5 font-sans">{conf.resolution_guidance}</p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
