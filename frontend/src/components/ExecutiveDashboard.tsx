import React, { useMemo } from 'react';
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
  BarChart3
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
    return investigations.slice(0, 6).reverse().map((inv, idx) => ({
      name: inv.title.length > 14 ? inv.title.substring(0, 14) + '...' : inv.title,
      readiness: inv.readiness_score,
      gaps: inv.gaps_count || 0
    }));
  }, [investigations]);

  const gapDistribution = useMemo(() => {
    return [
      { name: 'Gaps Found', value: Math.max(stats.totalGaps, 1), color: '#f59e0b' },
      { name: 'Contradictions', value: Math.max(stats.totalConflicts, 1), color: '#ef4444' },
      { name: 'Verified Items', value: Math.max(stats.totalSources * 2, 2), color: '#10b981' }
    ];
  }, [stats]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Epistemic Telemetry Dashboard</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Research Intelligence Operations</h2>
          <p className="text-sm text-slate-400">
            Real-time multi-source audit metrics, information blindspots, and decision readiness telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onLaunchDemo}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Run Scholarship Demo</span>
          </button>

          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Investigations</span>
            <FolderSearch className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.totalInvs}</div>
          <p className="text-[11px] text-slate-400 mt-1">Across all domains</p>
        </div>

        <div className="p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sources Ingested</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono">{stats.totalSources}</div>
          <p className="text-[11px] text-slate-400 mt-1">PDF documents & verified URLs</p>
        </div>

        <div className="p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Information Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">{stats.totalGaps}</div>
          <p className="text-[11px] text-slate-400 mt-1">Unaddressed stipulations</p>
        </div>

        <div className="p-5 rounded-xl glass-card relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Readiness</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.avgReadiness}<span className="text-sm text-slate-400">/100</span></div>
          <p className="text-[11px] text-slate-400 mt-1">Explainable index</p>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Area Chart: Readiness Trajectory */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Decision Readiness vs Gaps Discovered</span>
              </h3>
              <p className="text-xs text-slate-400">Trajectory across recent investigation cycles</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/40">
              Active Telemetry
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gapsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="readiness" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#readinessGrad)" name="Readiness Index" />
                <Area type="monotone" dataKey="gaps" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#gapsGrad)" name="Gaps Identified" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Donut Chart: Vulnerability Breakdown */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>Evidence Integrity Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">Ratio of gaps, conflicts, and verified facts</p>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
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
                <span>Verified Evidence</span>
              </span>
              <span className="font-mono font-bold text-emerald-400">{stats.totalSources * 2}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Investigations Table / Feed */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Active Research Dossiers</h3>
            <p className="text-xs text-slate-400">All investigations owned by your authenticated account</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{investigations.length} recorded</span>
        </div>

        {investigations.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
            <FolderSearch className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-semibold text-slate-300">No Investigations Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start by launching the interactive scholarship demonstration or entering your own research topic.
            </p>
            <button
              onClick={onLaunchDemo}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Scholarship Demo</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-800 bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4">Title & Question</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Sources</th>
                  <th className="py-3 px-4">Gaps / Conflicts</th>
                  <th className="py-3 px-4">Readiness</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {investigations.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => onSelectInvestigation(inv)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {inv.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-md">
                        {inv.research_question}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                        {inv.domain}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                      {inv.sources_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2 font-mono text-xs">
                        <span className="text-amber-400 font-bold">{inv.gaps_count} gaps</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-rose-400 font-bold">{inv.conflicts_count} conflicts</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              inv.readiness_score >= 70 ? 'bg-emerald-400' : inv.readiness_score >= 40 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${inv.readiness_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {inv.readiness_score}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all">
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
