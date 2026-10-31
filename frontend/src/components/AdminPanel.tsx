import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Activity, 
  Lock, 
  Database, 
  AlertTriangle,
  RefreshCw,
  Server,
  Layers
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
      <div className="p-8 rounded-2xl panel-card border border-rose-800/80 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">403 Forbidden</h3>
        <p className="text-xs text-rose-300">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="p-6 rounded-2xl panel-card border border-[#222f46] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Security Control Center</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Administrative Telemetry & Audit Logs</h2>
          <p className="text-xs text-slate-400">
            Multi-tenant isolation status, RBAC permissions, and tamper-evident audit records.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#121824] border border-[#222f46] hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Admin Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Total Users</span>
            <div className="text-2xl font-bold font-mono text-white">{metrics.total_users}</div>
          </div>
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Dossiers</span>
            <div className="text-2xl font-bold font-mono text-indigo-400">{metrics.total_investigations}</div>
          </div>
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Sources Ingested</span>
            <div className="text-2xl font-bold font-mono text-sky-400">{metrics.total_sources_analyzed}</div>
          </div>
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Gaps Discovered</span>
            <div className="text-2xl font-bold font-mono text-amber-400">{metrics.total_information_gaps}</div>
          </div>
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Conflicts Detected</span>
            <div className="text-2xl font-bold font-mono text-rose-400">{metrics.total_contradictions}</div>
          </div>
          <div className="p-4 rounded-xl panel-card space-y-1">
            <span className="text-[10px] font-semibold uppercase text-slate-400">Verification Tasks</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.total_verification_tasks}</div>
          </div>
        </div>
      )}

      {/* User Accounts Management */}
      <div className="p-6 rounded-2xl panel-card space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Active Users ({users.length})</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1e2638]">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-slate-400 border-b border-[#1e2638] bg-[#0c101c]">
              <tr>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182030] font-mono bg-[#090d16]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#121824] transition-colors">
                  <td className="py-2.5 px-3 text-slate-200">{u.email}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.full_name || 'N/A'}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-emerald-400 font-semibold">ACTIVE</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{u.created_at.substring(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tamper-Evident Audit Trail */}
      <div className="p-6 rounded-2xl panel-card space-y-4">
        <div className="flex items-center space-x-2 text-white font-bold text-base">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Tamper-Evident Audit Trail</span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-[#1e2638]">
          <table className="w-full text-left text-xs">
            <thead className="uppercase text-slate-400 border-b border-[#1e2638] bg-[#0c101c] sticky top-0">
              <tr>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Resource</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182030] font-mono text-[11px] bg-[#090d16]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#121824] transition-colors">
                  <td className="py-2 px-3 text-slate-400">{log.created_at.replace('T', ' ').substring(0, 19)}</td>
                  <td className="py-2 px-3 font-bold text-indigo-400">{log.action}</td>
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
