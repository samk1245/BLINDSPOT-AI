import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Activity, 
  Lock, 
  Database, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { User } from '../types';
import { apiClient } from '../api/client';

export const AdminPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [dashRes, usersRes, logsRes] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get<User[]>('/admin/users'),
        apiClient.get<any[]>('/admin/audit-logs'),
      ]);
      setMetrics(dashRes.data.metrics);
      setUsers(usersRes.data);
      setAuditLogs(logsRes.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Administrative access rejected.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (errorMessage) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-rose-800 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">403 Forbidden</h3>
        <p className="text-xs text-rose-300">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-violet-800/40 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-violet-400 font-mono text-xs uppercase font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Security Control Center</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Administrative Telemetry & Audit Logs</h2>
          <p className="text-xs text-slate-400">
            Tenant isolation monitoring, role authorizations, and tamper-evident audit records.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Admin Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Users</span>
            <div className="text-2xl font-bold font-mono text-white">{metrics.total_users}</div>
          </div>
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Dossiers</span>
            <div className="text-2xl font-bold font-mono text-cyan-400">{metrics.total_investigations}</div>
          </div>
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Sources</span>
            <div className="text-2xl font-bold font-mono text-sky-400">{metrics.total_sources_analyzed}</div>
          </div>
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Gaps</span>
            <div className="text-2xl font-bold font-mono text-amber-400">{metrics.total_information_gaps}</div>
          </div>
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Conflicts</span>
            <div className="text-2xl font-bold font-mono text-rose-400">{metrics.total_contradictions}</div>
          </div>
          <div className="p-4 rounded-xl glass-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Tasks</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.total_verification_tasks}</div>
          </div>
        </div>
      )}

      {/* User Accounts Management */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Active Users ({users.length})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-slate-400 border-b border-slate-800 bg-slate-900/50">
              <tr>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-200">{u.email}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.full_name || 'N/A'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-violet-950 text-violet-400 border border-violet-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400">ACTIVE</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{u.created_at.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamper-Evident Audit Trail */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Activity className="w-4 h-4 text-violet-400" />
          <span>Audit Log Stream (Recent Events)</span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-slate-400 border-b border-slate-800 bg-slate-900/50 sticky top-0">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Resource</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-400">{log.created_at.replace('T', ' ').substring(0, 19)}</td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{log.action}</td>
                  <td className="py-2 px-3 text-slate-300">{log.resource_type}</td>
                  <td className="py-2 px-3 text-slate-400">{log.ip_address}</td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
