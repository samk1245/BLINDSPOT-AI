import React, { useMemo, useState } from 'react';
import { 
  FolderSearch, 
  FileText, 
  AlertTriangle, 
  GitCompare, 
  CheckCircle2, 
  ShieldAlert, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Plus, 
  Sparkles,
  BarChart3,
  Search,
  Filter,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Investigation } from '../types';
import { cyberAudio } from '../utils/soundEffects';

interface ExecutiveDashboardProps {
  investigations: Investigation[];
  onSelectInvestigation: (inv: Investigation) => void;
  onCreateNew: () => void;
  onLaunchDemo: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  investigations,
  onSelectInvestigation,
  onCreateNew,
  onLaunchDemo,
}) => {
  // New interactive search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'CONFLICTS' | 'GAPS'>('ALL');

  // Aggregate real statistics strictly from application data
  const stats = useMemo(() => {
    const totalInvs = investigations.length;
    const totalSources = investigations.reduce((acc, curr) => acc + (curr.sources_count || 0), 0);
    const totalGaps = investigations.reduce((acc, curr) => acc + (curr.gaps_count || 0), 0);
    const totalConflicts = investigations.reduce((acc, curr) => acc + (curr.conflicts_count || 0), 0);
    const totalTasks = investigations.reduce((acc, curr) => acc + (curr.tasks_count || 0), 0);
    const avgReadiness = totalInvs > 0
      ? Math.round(investigations.reduce((acc, curr) => acc + curr.readiness_score, 0) / totalInvs)
      : 0;

    return {
      totalInvs,
      totalSources,
      totalGaps,
      totalConflicts,
      totalTasks,
      avgReadiness
    };
  }, [investigations]);

  // Chart data reflecting actual investigations
  const chartData = useMemo(() => {
    if (investigations.length === 0) {
      return [
        { name: 'Cycle 1', readiness: 0, gaps: 0 },
        { name: 'Cycle 2', readiness: 0, gaps: 0 },
      ];
    }
    return investigations.slice(0, 6).reverse().map((inv) => ({
      name: inv.title.length > 14 ? inv.title.substring(0, 14) + '...' : inv.title,
      readiness: inv.readiness_score,
      gaps: inv.gaps_count || 0
    }));
  }, [investigations]);

  const gapDistribution = useMemo(() => {
    return [
      { name: 'Gaps Found', value: Math.max(stats.totalGaps, 1), color: '#e2b65c' },
      { name: 'Contradictions', value: Math.max(stats.totalConflicts, 1), color: '#ff4d4d' },
      { name: 'Verified Items', value: Math.max(stats.totalSources * 2, 2), color: '#00d2ff' }
    ];
  }, [stats]);

  // Filtered investigations based on user search and filter tabs
  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      const matchesSearch = 
        inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.research_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (statusFilter === 'READY') return inv.readiness_score >= 70;
      if (statusFilter === 'CONFLICTS') return (inv.conflicts_count || 0) > 0;
      if (statusFilter === 'GAPS') return (inv.gaps_count || 0) > 0;
      return true;
    });
  }, [investigations, searchTerm, statusFilter]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="hud-corner flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/30">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[#00d2ff] font-mono text-xs uppercase font-bold">
            <Activity className="w-4 h-4 text-[#00d2ff] animate-pulse" />
            <span>EPISTEMIC AUDIT TELEMETRY</span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight">RESEARCH INTELLIGENCE OPERATIONS</h2>
          <p className="text-xs text-slate-400 font-mono">
            Multi-source audit metrics, information blindspots, and mathematical decision readiness telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              cyberAudio.playScan();
              onLaunchDemo();
            }}
            className="hud-corner-gold flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#140e06] hover:bg-[#1f1709] text-[#e2b65c] border border-[#e2b65c]/40 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-[#e2b65c]" />
            <span>RUN SCHOLARSHIP DEMO</span>
          </button>

          <button
            onClick={() => {
              cyberAudio.playClick();
              onCreateNew();
            }}
            className="hud-corner animate-shimmer flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-mono font-black uppercase bg-gradient-to-r from-[#00d2ff] to-[#0088ff] text-black shadow-lg shadow-[#00d2ff]/25 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>NEW INVESTIGATION</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="hud-corner p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Investigations</span>
            <FolderSearch className="w-4 h-4 text-[#00d2ff]" />
          </div>
          <div className="text-3xl font-black text-white font-mono text-glow-cyan">{stats.totalInvs}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Across all domains</p>
        </div>

        <div className="hud-corner p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Sources Ingested</span>
            <FileText className="w-4 h-4 text-[#00d2ff]" />
          </div>
          <div className="text-3xl font-black text-[#00d2ff] font-mono">{stats.totalSources}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">PDF docs & verified URLs</p>
        </div>

        <div className="hud-corner-gold p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Information Gaps</span>
            <AlertTriangle className="w-4 h-4 text-[#e2b65c]" />
          </div>
          <div className="text-3xl font-black text-[#e2b65c] font-mono text-glow-gold">{stats.totalGaps}</div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Unaddressed stipulations</p>
        </div>

        <div className="hud-corner p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Avg Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{stats.avgReadiness}<span className="text-xs text-slate-400 font-normal">/100</span></div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Mathematical Index</p>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area Chart: Readiness Trajectory */}
        <div className="hud-corner lg:col-span-8 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#00d2ff]" />
                <span>DECISION READINESS VS GAPS DISCOVERED</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Trajectory across recent investigation cycles</p>
            </div>
            <span className="text-[10px] font-mono text-[#00d2ff] px-2.5 py-1 rounded bg-[#00d2ff]/10 border border-[#00d2ff]/30">
              ACTIVE TELEMETRY
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gapsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e2b65c" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#e2b65c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#060a17', borderColor: '#00d2ff33', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="readiness" stroke="#00d2ff" strokeWidth={2} fillOpacity={1} fill="url(#readinessGrad)" name="Readiness Index" />
                <Area type="monotone" dataKey="gaps" stroke="#e2b65c" strokeWidth={2} fillOpacity={1} fill="url(#gapsGrad)" name="Gaps Identified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Donut Chart: Vulnerability Breakdown */}
        <div className="hud-corner-gold lg:col-span-4 p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-mono font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#e2b65c]" />
              <span>EVIDENCE INTEGRITY RATIO</span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">Gaps, conflicts, and verified facts</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gapDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gapDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#060a17', borderColor: '#e2b65c33', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-cyan-500/20 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e2b65c]" />
                <span>Information Gaps</span>
              </span>
              <span className="font-mono font-bold text-[#e2b65c]">{stats.totalGaps}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Contradictions</span>
              </span>
              <span className="font-mono font-bold text-rose-400">{stats.totalConflicts}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff]" />
                <span>Verified Evidence</span>
              </span>
              <span className="font-mono font-bold text-[#00d2ff]">{stats.totalSources * 2}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Investigations Table / Feed with Search & Filter Features */}
      <div className="hud-corner p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-mono font-bold text-white">ACTIVE RESEARCH DOSSIERS</h3>
            <p className="text-xs text-slate-400 font-mono">All investigations owned by your authenticated account</p>
          </div>
          
          {/* Interactive Search & Severity Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dossiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00d2ff] font-mono"
              />
            </div>

            <div className="flex items-center space-x-1 bg-[#060a17] p-1 rounded-lg border border-cyan-500/20 text-[10px] font-mono">
              {(['ALL', 'READY', 'CONFLICTS', 'GAPS'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => {
                    cyberAudio.playClick();
                    setStatusFilter(filterKey);
                  }}
                  className={`px-2 py-1 rounded transition-colors ${
                    statusFilter === filterKey
                      ? 'bg-[#00d2ff]/20 text-[#00d2ff] font-bold border border-[#00d2ff]/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filterKey}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredInvestigations.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-[#060a17]/40 rounded-xl border border-dashed border-cyan-500/20">
            <FolderSearch className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-mono font-semibold text-slate-300">No Matching Dossiers Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
              Adjust search keywords or launch the interactive scholarship demonstration.
            </p>
            <button
              onClick={() => {
                cyberAudio.playScan();
                onLaunchDemo();
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-[#00d2ff] hover:bg-[#00b0d9] text-black transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>LOAD SCHOLARSHIP DEMO</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="uppercase text-slate-400 border-b border-cyan-500/20 bg-[#060a17]/60">
                <tr>
                  <th className="py-3 px-4">Title & Question</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Sources</th>
                  <th className="py-3 px-4">Gaps / Conflicts</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-500/10">
                {filteredInvestigations.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => {
                      cyberAudio.playClick();
                      onSelectInvestigation(inv);
                    }}
                    className="hover:bg-[#00d2ff]/5 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200 group-hover:text-[#00d2ff] transition-colors font-sans text-sm">
                        {inv.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                        {inv.research_question}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] px-2.5 py-1 rounded bg-[#060a17] text-[#00d2ff] border border-cyan-500/20">
                        {inv.domain}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {inv.sources_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#e2b65c] font-bold">{inv.gaps_count} gaps</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-rose-400 font-bold">{inv.conflicts_count} conflicts</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-[#060a17] border border-cyan-500/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              inv.readiness_score >= 70 ? 'bg-[#00d2ff]' : inv.readiness_score >= 40 ? 'bg-[#e2b65c]' : 'bg-rose-500'
                            }`}
                            style={{ width: `${inv.readiness_score}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-200">
                          {inv.readiness_score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-[#060a17] border border-cyan-500/20 group-hover:border-[#00d2ff] text-slate-400 group-hover:text-[#00d2ff] transition-all">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
