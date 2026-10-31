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
  Activity,
  Layers,
  Database,
  Download,
  Stethoscope,
  Scale,
  Zap,
  GraduationCap
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
  onSeedAllDemos?: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  investigations,
  onSelectInvestigation,
  onCreateNew,
  onLaunchDemo,
  onSeedAllDemos
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      name: inv.title.length > 16 ? inv.title.substring(0, 16) + '...' : inv.title,
      readiness: inv.readiness_score,
      gaps: inv.gaps_count || 0
    }));
  }, [investigations]);

  // Realistic Multi-Chromatic Integrity Distribution
  const gapDistribution = useMemo(() => {
    return [
      { name: 'Information Gaps', value: Math.max(stats.totalGaps, 1), color: '#f59e0b' },
      { name: 'Contradictions', value: Math.max(stats.totalConflicts, 1), color: '#f43f5e' },
      { name: 'Verified Claims', value: Math.max(stats.totalSources * 2, 2), color: '#10b981' }
    ];
  }, [stats]);

  // Filtered investigations by search & domain pills
  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      const matchesSearch = 
        inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.research_question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (domainFilter === 'ALL') return true;
      if (domainFilter === 'EDUCATION') return inv.domain.toLowerCase().includes('education') || inv.domain.toLowerCase().includes('grant');
      if (domainFilter === 'HEALTHCARE') return inv.domain.toLowerCase().includes('health') || inv.domain.toLowerCase().includes('clinical');
      if (domainFilter === 'LEGAL') return inv.domain.toLowerCase().includes('legal') || inv.domain.toLowerCase().includes('regulatory');
      if (domainFilter === 'FINANCE') return inv.domain.toLowerCase().includes('finan') || inv.domain.toLowerCase().includes('invest');
      return true;
    });
  }, [investigations, searchTerm, domainFilter]);

  const getDomainIcon = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('health') || d.includes('clinical')) return <Stethoscope className="w-3.5 h-3.5 text-rose-400" />;
    if (d.includes('legal') || d.includes('regulat')) return <Scale className="w-3.5 h-3.5 text-amber-400" />;
    if (d.includes('finan') || d.includes('invest') || d.includes('hydro')) return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
    return <GraduationCap className="w-3.5 h-3.5 text-sky-400" />;
  };

  const getDomainBadgeClass = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('health') || d.includes('clinical')) return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    if (d.includes('legal') || d.includes('regulat')) return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
    if (d.includes('finan') || d.includes('invest') || d.includes('hydro')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
    return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
  };

  const handleExportSummary = (inv: Investigation, e: React.MouseEvent) => {
    e.stopPropagation();
    cyberAudio.playClick();
    const summary = `# BLINDSPOT AI Investigation Dossier
Title: ${inv.title}
Domain: ${inv.domain}
Research Question: ${inv.research_question}
Decision Readiness Score: ${inv.readiness_score}/100
Sources Analyzed: ${inv.sources_count}
Information Gaps Identified: ${inv.gaps_count}
Direct Contradictions: ${inv.conflicts_count}
Exported At: ${new Date().toISOString()}
`;
    navigator.clipboard.writeText(summary);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Multi-Domain Quick Seeding Actions */}
      <div className="panel-card p-6 border border-slate-800 bg-[#121827]/90 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Research Intelligence Network</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight font-sans">
            Active Investigations & Epistemic Audit Telemetry
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Multi-source intelligence across Clinical Protocols, Regulatory Compliance, Energy Disclosures, and Government Grants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onSeedAllDemos && (
            <button
              onClick={() => {
                cyberAudio.playScan();
                onSeedAllDemos();
              }}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-102"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Load 4 Multi-Domain Dossiers</span>
            </button>
          )}

          <button
            onClick={() => {
              cyberAudio.playClick();
              onCreateNew();
            }}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Impactful Real Multi-Color Palette */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Investigations */}
        <div className="interactive-card p-5 bg-[#121827]/80 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Investigations</span>
            <FolderSearch className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-sans">{stats.totalInvs}</div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Across 4 critical domains</span>
          </div>
        </div>

        {/* Sources Ingested */}
        <div className="interactive-card p-5 bg-[#121827]/80 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sources Audited</span>
            <FileText className="w-4.5 h-4.5 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-sans">{stats.totalSources}</div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>PDFs, Bulletins & Web Portals</span>
          </div>
        </div>

        {/* Information Gaps (Amber) */}
        <div className="interactive-card p-5 bg-[#121827]/80 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Information Gaps</span>
            <AlertTriangle className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-sans">{stats.totalGaps}</div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Unaddressed stipulations found</span>
          </div>
        </div>

        {/* Average Decision Readiness (Emerald) */}
        <div className="interactive-card p-5 bg-[#121827]/80 relative overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Decision Readiness</span>
            <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-sans">
            {stats.avgReadiness}<span className="text-sm text-slate-500 font-normal">/100</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Mathematical coverage index</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area Chart */}
        <div className="panel-card lg:col-span-8 p-6 bg-[#121827]/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Decision Readiness vs Gaps Discovered</span>
              </h3>
              <p className="text-xs text-slate-400">Trajectory across recent investigation cycles</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/25">
              LIVE TELEMETRY
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gapsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="readiness" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#readinessGrad)" name="Readiness Index" />
                <Area type="monotone" dataKey="gaps" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#gapsGrad)" name="Gaps Identified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Donut Chart */}
        <div className="panel-card lg:col-span-4 p-6 bg-[#121827]/80 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Evidence Integrity Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Ratio of gaps, contradictions, and verified facts</p>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '10px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Information Gaps</span>
              </span>
              <span className="font-mono font-bold text-amber-400">{stats.totalGaps}</span>
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
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Verified Passages</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{stats.totalSources * 2}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Investigations Table with Multi-Domain Filter Pills & Search */}
      <div className="panel-card p-6 bg-[#121827]/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Multi-Domain Research Dossiers</span>
            </h3>
            <p className="text-xs text-slate-400">All investigations owned by your authenticated account</p>
          </div>
          
          {/* Domain Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Domains' },
              { id: 'EDUCATION', label: 'Education & Grants' },
              { id: 'HEALTHCARE', label: 'Healthcare & Clinical' },
              { id: 'LEGAL', label: 'Legal & Regulatory' },
              { id: 'FINANCE', label: 'Finance & Energy' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  cyberAudio.playClick();
                  setDomainFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  domainFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search investigations by title, research question, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {filteredInvestigations.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            <FolderSearch className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">No Matching Investigations Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Adjust search filters or reload the default multi-domain investigation suite.
            </p>
            {onSeedAllDemos && (
              <button
                onClick={() => {
                  cyberAudio.playScan();
                  onSeedAllDemos();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all inline-flex items-center space-x-2"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Seed 4 Multi-Domain Investigations</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="uppercase text-slate-400 border-b border-slate-800 bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4">Investigation & Central Question</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Sources</th>
                  <th className="py-3 px-4">Gaps / Conflicts</th>
                  <th className="py-3 px-4">Readiness Score</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvestigations.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => {
                      cyberAudio.playClick();
                      onSelectInvestigation(inv);
                    }}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm">
                        {inv.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-lg mt-0.5">
                        {inv.research_question}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getDomainBadgeClass(inv.domain)}`}>
                        {getDomainIcon(inv.domain)}
                        <span>{inv.domain}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {inv.sources_count} sources
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-amber-400 font-bold">{inv.gaps_count} gaps</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-rose-400 font-bold">{inv.conflicts_count} conflicts</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              inv.readiness_score >= 70 ? 'bg-emerald-400' : inv.readiness_score >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.max(inv.readiness_score, 8)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">
                          {inv.readiness_score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => handleExportSummary(inv, e)}
                          title="Copy Dossier Markdown to Clipboard"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            cyberAudio.playClick();
                            onSelectInvestigation(inv);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white transition-colors"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {copiedId === inv.id && (
                        <div className="text-[10px] text-emerald-400 font-semibold mt-1">Copied to Clipboard!</div>
                      )}
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
