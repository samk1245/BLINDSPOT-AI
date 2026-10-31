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
  ChevronDown,
  ChevronUp,
  Download,
  Copy,
  Check
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
  const [copied, setCopied] = useState(false);

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

  const copyFindingsToClipboard = () => {
    cyberAudio.playClick();
    const gapList = gaps.map((g, i) => `${i + 1}. [${g.impact_level}] ${g.gap_title}: ${g.description} (Action: ${g.suggested_action})`).join('\n');
    const conflictList = conflicts.map((c, i) => `${i + 1}. [${c.priority}] ${c.conflict_type}: "${c.claim_a_text}" vs "${c.claim_b_text}" (Resolution: ${c.resolution_guidance})`).join('\n');
    const text = `BLINDSPOT AI Epistemic Audit Findings\n\n=== INFORMATION GAPS (${gaps.length}) ===\n${gapList}\n\n=== CONTRADICTIONS (${conflicts.length}) ===\n${conflictList}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Information Gaps Section */}
      <div className="panel-card p-6 bg-[#121827]/80 space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileQuestion className="w-4.5 h-4.5 text-amber-400" />
              <span>Epistemic Gaps & Information Blindspots ({filteredGaps.length}/{gaps.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Stipulations unaddressed or partially documented across all reviewed sources.
            </p>
          </div>
          
          {/* Search, Impact Filter & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copyFindingsToClipboard}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search gaps..."
                value={gapSearch}
                onChange={(e) => setGapSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    cyberAudio.playClick();
                    setSelectedImpact(level);
                  }}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    selectedImpact === level
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No critical gaps matching the current search filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGaps.map((gap) => (
              <div 
                key={gap.id}
                className="interactive-card p-5 bg-[#0f172a]/90 border border-amber-500/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {gap.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      gap.impact_level === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {gap.impact_level} IMPACT
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    {gap.classification}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{gap.gap_title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{gap.description}</p>

                {/* Explicit Epistemic Distinction Callout (Emerald Tint) */}
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/25 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>EPISTEMIC TRACE:</span>
                  </div>
                  <p className="text-slate-300 italic">{gap.epistemic_note}</p>
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
      <div className="panel-card p-6 bg-[#121827]/80 space-y-4 border border-rose-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <GitCompare className="w-4.5 h-4.5 text-rose-400" />
              <span>Cross-Source Contradiction Intelligence ({conflicts.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Direct factual divergences detected by comparing assertions across distinct sources.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
            AUDIT PRIORITY
          </span>
        </div>

        {conflicts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
            No contradictory claims discovered between reviewed sources.
          </div>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conf) => {
              const isDiffExpanded = expandedDiffId === conf.id;

              return (
                <div 
                  key={conf.id}
                  className="interactive-card p-5 bg-[#0f172a]/90 border border-rose-500/30 space-y-4"
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

                    {/* Interactive Side-by-Side Diff Trigger */}
                    <button
                      onClick={() => toggleDiff(conf.id)}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isDiffExpanded ? 'Hide Factual Diff' : 'Inspect Factual Diff'}</span>
                      {isDiffExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </button>
                  </div>

                  {/* Side by Side Divergent Claims */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Claim A (Sky Blue) */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-sky-400">Source A: {conf.source_a_title}</span>
                        <span className="flex items-center space-x-1 font-mono text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{conf.source_a_date || 'Undated'}</span>
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200">
                        "{conf.claim_a_text}"
                      </div>
                    </div>

                    {/* Claim B (Royal Violet) */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-violet-500/30 space-y-2">
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

                  {/* Interactive Factual Diff Analysis (When Expanded) */}
                  {isDiffExpanded && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                      <div className="flex items-center justify-between text-indigo-400 font-bold text-xs">
                        <span>FACTUAL DISCREPANCY COMPARISON MATRIX</span>
                        <span className="text-[10px] text-slate-400 font-mono">Differential Extraction Engine</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/30">
                          <div className="text-sky-400 font-bold mb-1">STIPULATION A (PORTAL / RECORD):</div>
                          <div className="text-slate-200">{conf.claim_a_text}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30">
                          <div className="text-rose-400 font-bold mb-1">STIPULATION B (ADVISORY / MANUAL):</div>
                          <div className="text-slate-200">{conf.claim_b_text}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Divergence Analysis & Resolution Guidance */}
                  <div className="space-y-2 pt-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold uppercase text-[10px] block">
                        Epistemic Difference Explanation:
                      </span>
                      <p className="text-slate-200 mt-0.5">{conf.difference_explanation}</p>
                    </div>

                    <div>
                      <span className="text-indigo-400 font-semibold uppercase text-[10px] block">
                        Resolution Guidance:
                      </span>
                      <p className="text-slate-300 mt-0.5">{conf.resolution_guidance}</p>
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
