import React, { useState } from 'react';
import { 
  Search, 
  Globe, 
  Upload, 
  FileText, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Terminal,
  Activity,
  Layers,
  Database,
  Eye,
  Key,
  Calendar
} from 'lucide-react';
import { Investigation, Source } from '../types';
import { apiClient } from '../api/client';
import { cyberAudio } from '../utils/soundEffects';

interface InvestigationStudioProps {
  investigation: Investigation | null;
  onInvestigationUpdated: (inv: Investigation) => void;
  onAnalysisCompleted: () => void;
}

export const InvestigationStudio: React.FC<InvestigationStudioProps> = ({
  investigation,
  onInvestigationUpdated,
  onAnalysisCompleted,
}) => {
  // New Investigation Form State
  const [title, setTitle] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [objective, setObjective] = useState('');
  const [domain, setDomain] = useState('Education & Grants');
  const [isCreating, setIsCreating] = useState(false);

  // Ingestion State
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [isIngestingUrl, setIsIngestingUrl] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Create Investigation
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !researchQuestion || !objective) return;
    cyberAudio.playScan();
    setIsCreating(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post<Investigation>('/investigations', {
        title,
        research_question: researchQuestion,
        objective,
        domain,
      });
      onInvestigationUpdated(res.data);
      setStatusMessage('Investigation created and goals decomposed into requirements!');
    } catch (err: any) {
      cyberAudio.playAlert();
      setErrorMessage(err.response?.data?.detail || 'Failed to create investigation');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle URL Ingestion
  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigation || !urlInput) return;
    cyberAudio.playScan();
    setIsIngestingUrl(true);
    setErrorMessage(null);

    try {
      await apiClient.post('/sources/url', {
        investigation_id: investigation.id,
        url: urlInput,
        title: urlTitle || undefined,
      });
      setUrlInput('');
      setUrlTitle('');
      setStatusMessage('URL successfully screened against SSRF and ingested into evidence vault!');
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
    } catch (err: any) {
      cyberAudio.playAlert();
      setErrorMessage(err.response?.data?.detail || 'URL ingestion rejected by security filter.');
    } finally {
      setIsIngestingUrl(false);
    }
  };

  // Handle PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !investigation) return;

    cyberAudio.playScan();
    setIsUploadingPdf(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.append('investigation_id', investigation.id);
    formData.append('file', file);

    try {
      await apiClient.post('/sources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage('PDF validated (%PDF- header verified) and segmented into passages.');
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
    } catch (err: any) {
      cyberAudio.playAlert();
      setErrorMessage(err.response?.data?.detail || 'PDF upload failed validation.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Run Intelligence Analysis
  const handleRunAnalysis = async () => {
    if (!investigation) return;
    cyberAudio.playScan();
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      await apiClient.post(`/investigations/${investigation.id}/analyze`);
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
      onAnalysisCompleted();
      setStatusMessage('Intelligence audit completed. Gaps and contradictions identified!');
    } catch (err: any) {
      cyberAudio.playAlert();
      setErrorMessage(err.response?.data?.detail || 'Analysis pipeline encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Scholarship Demo Preset
  const handleLoadDemo = async () => {
    cyberAudio.playScan();
    if (!investigation) {
      try {
        const draft = await apiClient.post<Investigation>('/investigations', {
          title: 'National Merit & STEM Excellence Scholarship (2026)',
          research_question: 'What should I verify before applying for the 2026 STEM Fellowship?',
          objective: 'Identify eligibility limits, renewal clauses, conflicting documents, and deadlines.',
          domain: 'Education & Grants',
        });
        await apiClient.post(`/investigations/${draft.data.id}/load-demo-data`);
        const updated = await apiClient.get<Investigation>(`/investigations/${draft.data.id}`);
        onInvestigationUpdated(updated.data);
        onAnalysisCompleted();
      } catch (err: any) {
        cyberAudio.playAlert();
        setErrorMessage(err.response?.data?.detail || 'Demo loading failed');
      }
    } else {
      try {
        await apiClient.post(`/investigations/${investigation.id}/load-demo-data`);
        const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
        onInvestigationUpdated(updated.data);
        onAnalysisCompleted();
      } catch (err: any) {
        cyberAudio.playAlert();
        setErrorMessage(err.response?.data?.detail || 'Demo loading failed');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Alert Banners */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {!investigation ? (
        /* Create New Investigation Form */
        <div className="panel-card p-8 bg-[#121827]/90 border border-slate-800 max-w-3xl mx-auto space-y-6">
          <div className="space-y-1.5 border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4" />
                <span>Initiate Research Investigation</span>
              </span>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Load STEM Grant Demo</span>
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Define Research Objective</h2>
            <p className="text-xs text-slate-400">
              The AI goal decomposer automatically analyzes your inquiry into structured verification criteria across official documentation.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Investigation Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 State STEM Scholarship Verification or Clinical Trial Protocol"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Central Research Question
              </label>
              <textarea
                required
                rows={2}
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="e.g. What should I verify before applying for the 2026 fellowship?"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Objective & Scope
              </label>
              <textarea
                required
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Identify income thresholds, renewal GPA requirements, application deadlines, and exceptions."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Education & Grants">Education & Government Grants</option>
                <option value="Healthcare & Clinical">Healthcare & Medical Protocols</option>
                <option value="Legal & Regulatory">Legal, Compliance & Policy</option>
                <option value="Financial & Investment">Finance & Clean Energy Disclosures</option>
                <option value="Technology & Defense">Technology & Defense Patents</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isCreating ? 'Decomposing Research Goal...' : 'Start Investigation & Decompose Goals'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Investigation Studio View */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="panel-card p-6 bg-[#121827]/90 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                  {investigation.domain}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  STATUS: <strong className="text-emerald-400 uppercase">{investigation.status}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{investigation.title}</h2>
              <p className="text-xs text-indigo-300 font-mono">Q: {investigation.research_question}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleLoadDemo}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reload Demo Sources</span>
              </button>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || investigation.sources_count === 0}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
                  investigation.sources_count === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-102'
                }`}
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isAnalyzing ? 'Auditing Evidence...' : 'Run Intelligence Audit'}</span>
              </button>
            </div>
          </div>

          {/* Source Ingestion Workbench */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingest Web URL (Sky Blue Theme) */}
            <div className="panel-card p-6 bg-[#121827]/80 space-y-4 border border-sky-500/20">
              <div className="flex items-center space-x-2 text-sky-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Ingest Public Web Portal / URL</h3>
              </div>
              <p className="text-xs text-slate-400">
                All URLs pass pre-flight DNS filtering to block SSRF, loopback, and cloud metadata (169.254.169.254).
              </p>

              <form onSubmit={handleIngestUrl} className="space-y-3">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://portal.ed.gov/grants/stem2026"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500 font-mono"
                />
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Source Label (e.g. Official Gazette Bulletin)"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  disabled={isIngestingUrl}
                  className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-sky-600/20"
                >
                  {isIngestingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isIngestingUrl ? 'Screening & Ingesting...' : 'Add Verified URL'}</span>
                </button>
              </form>
            </div>

            {/* Upload PDF Document (Royal Violet Theme) */}
            <div className="panel-card p-6 bg-[#121827]/80 space-y-4 border border-violet-500/20">
              <div className="flex items-center space-x-2 text-violet-400">
                <Upload className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Upload Research PDF / Document</h3>
              </div>
              <p className="text-xs text-slate-400">
                Guarded via magic-byte header inspection (%PDF-), 15MB size ceiling, and SHA-256 fingerprinting.
              </p>

              <div className="border border-dashed border-violet-500/30 hover:border-violet-500/60 rounded-xl p-6 text-center transition-colors bg-slate-900/50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isUploadingPdf}
                  id="pdf-upload"
                  className="hidden"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-violet-400 mx-auto" />
                  <div className="text-xs font-semibold text-slate-200">
                    {isUploadingPdf ? 'Parsing Document...' : 'Click or drop PDF here to upload'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">Max 15MB • Official Bulletins & Guides</div>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
