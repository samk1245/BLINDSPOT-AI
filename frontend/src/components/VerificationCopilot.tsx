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
  ListTodo
} from 'lucide-react';
import { VerificationTask } from '../types';
import { apiClient } from '../api/client';

interface VerificationCopilotProps {
  investigationId: string;
}

export const VerificationCopilot: React.FC<VerificationCopilotProps> = ({ investigationId }) => {
  const [tasks, setTasks] = useState<VerificationTask[]>([]);
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
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-800">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">HIGH PRIORITY</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">NORMAL</span>;
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ListTodo className="w-4 h-4 text-cyan-400" />
            <span>Verification Copilot Action Plan</span>
          </h3>
          <p className="text-xs text-slate-400">
            Prioritized human verification action items generated to resolve epistemic blindspots.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400">
          {tasks.filter((t) => t.is_completed).length}/{tasks.length} Completed
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          No verification tasks generated yet. Run the intelligence audit to populate.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                task.is_completed
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-700 hover:border-cyan-500/40 shadow-sm'
              }`}
            >
              <button 
                type="button"
                className="mt-0.5 text-cyan-400 hover:text-cyan-300 focus:outline-none shrink-0"
              >
                {task.is_completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {task.title}
                  </span>
                  {getPriorityBadge(task.priority)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-slate-400 font-semibold">Why It Matters: </strong>
                  {task.reason_it_matters}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <ExternalLink className="w-3 h-3" />
                    <span>Target: <strong>{task.suggested_official_source}</strong></span>
                  </div>

                  {task.is_completed && (
                    <span className="text-emerald-400 font-mono text-[10px] font-semibold">
                      ✓ Completed & Resolved
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
