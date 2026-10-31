import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  ExternalLink, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ListTodo,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { VerificationTask } from '../types';
import { apiClient } from '../api/client';

interface VerificationCopilotProps {
  investigationId: string;
}

export const VerificationCopilot: React.FC<VerificationCopilotProps> = ({ investigationId }) => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<VerificationTask[]>(`/tasks/${investigationId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [investigationId]);

  const toggleTask = async (task: VerificationTask) => {
    const nextCompleted = !task.is_completed;
    try {
      const res = await apiClient.patch<VerificationTask>(`/tasks/${task.id}`, {
        is_completed: nextCompleted,
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">HIGH PRIORITY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">ROUTINE</span>;
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'PENDING') return !t.is_completed;
    if (filterMode === 'COMPLETED') return t.is_completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6 rounded-2xl panel-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <ListTodo className="w-4 h-4 text-emerald-400" />
            <span>Verification Copilot Action Plan</span>
          </h3>
          <p className="text-xs text-slate-400">
            Prioritized human verification action items generated to resolve epistemic blindspots.
          </p>
        </div>

        {/* Progress Pill & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 bg-[#121824] border border-[#222f46] px-3 py-1 rounded-lg text-xs">
            <span className="text-slate-400">Progress:</span>
            <span className="font-mono font-bold text-emerald-400">{completedCount}/{tasks.length}</span>
            <span className="text-[10px] font-mono text-slate-400">({progressPct}%)</span>
          </div>

          <div className="flex rounded-lg bg-[#121824] border border-[#222f46] p-0.5 text-[11px] font-medium">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({tasks.length})
            </button>
            <button
              onClick={() => setFilterMode('PENDING')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending ({tasks.length - completedCount})
            </button>
            <button
              onClick={() => setFilterMode('COMPLETED')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterMode === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Done ({completedCount})
            </button>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-[#0e1422] border border-[#1e2638] text-slate-400 text-xs">
          No verification tasks generated yet. Run the intelligence audit to populate.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                task.is_completed
                  ? 'bg-[#0a0e17]/80 border-[#1a2333] opacity-65'
                  : 'bg-[#121824] hover:bg-[#161f30] border-[#222f46] hover:border-indigo-500/50 shadow-sm'
              }`}
            >
              <button 
                type="button"
                className="mt-0.5 text-indigo-400 hover:text-indigo-300 focus:outline-none shrink-0"
              >
                {task.is_completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500 hover:text-indigo-400 transition-colors" />
                )}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold transition-colors ${
                    task.is_completed ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}>
                    {task.title}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-400 font-medium">Why It Matters: </strong>
                  {task.reason_it_matters}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5 text-sky-400">
                    <ExternalLink className="w-3 h-3" />
                    <span>Target: <strong className="text-sky-300">{task.suggested_official_source}</strong></span>
                  </div>

                  {task.is_completed && (
                    <span className="text-emerald-400 font-mono text-[10px] font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified & Resolved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
