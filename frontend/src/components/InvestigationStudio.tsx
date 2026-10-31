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
  Clock
} from 'lucide-react';
import { Investigation, Source } from '../types';
import { apiClient } from '../api/client';

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
      setErrorMessage(err.response?.data?.detail || 'Failed to create investigation');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle URL Ingestion
  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigation || !urlInput) return;
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
      setStatusMessage('URL successfully screened against SSRF and ingested!');
      // Refresh investigation
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'URL ingestion rejected by security filter.');
    } finally {
      setIsIngestingUrl(false);
    }
  };

  // Handle PDF Upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !investigation) return;

    setIsUploadingPdf(true);
    setErrorMessage(null);
    const formData = new FormData();
    formData.append('investigation_id', investigation.id);
    formData.append('file', file);

    try {
      await apiClient.post('/sources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage('PDF validated (%PDF- header confirmed) and parsed.');
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'PDF upload failed validation.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Run Intelligence Analysis
  const handleRunAnalysis = async () => {
    if (!investigation) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      await apiClient.post(`/investigations/${investigation.id}/analyze`);
      const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
      onInvestigationUpdated(updated.data);
      onAnalysisCompleted();
      setStatusMessage('Intelligence audit completed. Gaps and contradictions identified!');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Analysis pipeline encountered an error.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load Scholarship Demo Preset
  const handleLoadDemo = async () => {
    if (!investigation) {
      // Create draft first then load demo
      try {
        const draft = await apiClient.post<Investigation>('/investigations', {
          title: 'National STEM Fellowship (Demo)',
          research_question: 'What should I verify before applying for the 2026 STEM Fellowship?',
          objective: 'Identify eligibility limits, renewal clauses, conflicting documents, and deadlines.',
          domain: 'Education & Grants',
        });
        await apiClient.post(`/investigations/${draft.data.id}/load-demo-data`);
        const updated = await apiClient.get<Investigation>(`/investigations/${draft.data.id}`);
        onInvestigationUpdated(updated.data);
        onAnalysisCompleted();
      } catch (err: any) {
        setErrorMessage(err.response?.data?.detail || 'Demo loading failed');
      }
    } else {
      try {
        await apiClient.post(`/investigations/${investigation.id}/load-demo-data`);
        const updated = await apiClient.get<Investigation>(`/investigations/${investigation.id}`);
        onInvestigationUpdated(updated.data);
        onAnalysisCompleted();
      } catch (err: any) {
        setErrorMessage(err.response?.data?.detail || 'Demo loading failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-cyan-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {!investigation ? (
        /* Create New Investigation Form */
        <div className="p-8 rounded-2xl glass-panel border border-slate-800 max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Initiate New Investigation
              </span>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Load 1-Click Scholarship Demo</span>
              </button>
            </div>
            <h2 className="text-2xl font-extrabold text-white">Define Research Objective</h2>
            <p className="text-sm text-slate-400">
              The AI goal decomposer will automatically break down your inquiry into structured verification requirements.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Investigation Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Government STEM Scholarship Verification"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Central Research Question
              </label>
              <textarea
                required
                rows={2}
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="e.g. What should I verify before applying for the state STEM scholarship?"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Objective & Scope
              </label>
              <textarea
                required
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Identify income thresholds, renewal GPA requirements, application deadlines, and exceptions."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400"
              >
                <option value="Education & Grants">Education & Government Grants</option>
                <option value="Legal & Regulatory">Legal, Compliance & Policy</option>
                <option value="Healthcare & Clinical">Healthcare & Medical Protocols</option>
                <option value="Financial & Investment">Finance & Investment Disclosures</option>
                <option value="Technology & Defense">Technology & Defense Patents</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isCreating ? 'Decomposing Goal...' : 'Start Investigation & Decompose Goals'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Investigation Studio View */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  {investigation.domain}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Status: <strong className="text-white uppercase">{investigation.status}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{investigation.title}</h2>
              <p className="text-sm text-cyan-300 font-mono">Q: {investigation.research_question}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleLoadDemo}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all"
              >
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Reload Demo Data</span>
              </button>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || investigation.sources_count === 0}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all ${
                  investigation.sources_count === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-white shadow-cyan-500/20 hover:scale-102'
                }`}
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isAnalyzing ? 'Auditing Evidence...' : 'Run Intelligence Audit'}</span>
              </button>
            </div>
          </div>

          {/* Source Ingestion Workbench */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingest Web URL */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Ingest Public Web Portal / URL</h3>
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
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Source Label (Optional)"
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={isIngestingUrl}
                  className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  {isIngestingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isIngestingUrl ? 'Scraping & Verifying...' : 'Add Verified URL'}</span>
                </button>
              </form>
            </div>

            {/* Upload PDF Document */}
            <div className="p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center space-x-2 text-violet-400">
                <Upload className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Upload Research PDF / Document</h3>
              </div>
              <p className="text-xs text-slate-400">
                Guarded via magic-byte header inspection (%PDF-), 15MB size ceiling, and UUID file isolation.
              </p>

              <div className="border-2 border-dashed border-slate-700 hover:border-violet-400/60 rounded-xl p-6 text-center transition-colors">
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
                  <div className="text-[10px] text-slate-500 font-mono">Max 15MB • Official Bulletins & Guides</div>
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
