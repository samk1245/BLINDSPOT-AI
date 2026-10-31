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
  Activity
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
      setStatusMessage('URL successfully screened against SSRF and ingested!');
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
      setStatusMessage('PDF validated (%PDF- header confirmed) and parsed.');
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
        <div className="hud-corner p-4 rounded-xl bg-[#00d2ff]/10 border border-[#00d2ff]/40 text-[#00d2ff] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-[#00d2ff] hover:text-white font-bold">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="hud-corner p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white font-bold">×</button>
        </div>
      )}

      {!investigation ? (
        /* Create New Investigation Form */
        <div className="hud-corner p-8 rounded-2xl glass-panel border border-cyan-500/30 max-w-3xl mx-auto space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#00d2ff] uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-4 h-4" />
                <span>INITIATE RESEARCH SPECIFICATION</span>
              </span>
              <button
                type="button"
                onClick={handleLoadDemo}
                className="hud-corner-gold flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#140e06] hover:bg-[#1f1709] text-[#e2b65c] border border-[#e2b65c]/40 text-xs font-mono font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e2b65c]" />
                <span>LOAD SCHOLARSHIP DEMO</span>
              </button>
            </div>
            <h2 className="text-2xl font-black text-white font-mono">DEFINE RESEARCH OBJECTIVE</h2>
            <p className="text-xs text-slate-400 font-mono">
              The AI goal decomposer will automatically break down your inquiry into structured verification requirements.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-5 font-mono">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Investigation Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2026 Government STEM Scholarship Verification"
                className="w-full px-4 py-2.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white placeholder-slate-600 focus:outline-none focus:border-[#00d2ff] text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Central Research Question
              </label>
              <textarea
                required
                rows={2}
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                placeholder="e.g. What should I verify before applying for the state STEM scholarship?"
                className="w-full px-4 py-2.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white placeholder-slate-600 focus:outline-none focus:border-[#00d2ff] text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Objective & Scope
              </label>
              <textarea
                required
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Identify income thresholds, renewal GPA requirements, application deadlines, and exceptions."
                className="w-full px-4 py-2.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white placeholder-slate-600 focus:outline-none focus:border-[#00d2ff] text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Research Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white text-xs focus:outline-none focus:border-[#00d2ff]"
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
              className="hud-corner animate-shimmer w-full py-3.5 rounded-xl font-mono font-black text-xs uppercase bg-gradient-to-r from-[#00d2ff] to-[#0088ff] text-black shadow-lg shadow-[#00d2ff]/25 transition-all flex items-center justify-center space-x-2"
            >
              {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isCreating ? 'DECOMPOSING GOAL...' : 'START INVESTIGATION & DECOMPOSE GOALS'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Active Investigation Studio View */
        <div className="space-y-6">
          {/* Header Card */}
          <div className="hud-corner p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30">
                  {investigation.domain}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  STATUS: <strong className="text-white uppercase">{investigation.status}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-mono">{investigation.title}</h2>
              <p className="text-xs text-[#00d2ff] font-mono">Q: {investigation.research_question}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleLoadDemo}
                className="hud-corner-gold flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold bg-[#140e06] hover:bg-[#1f1709] text-[#e2b65c] border border-[#e2b65c]/40 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e2b65c]" />
                <span>RELOAD DEMO DATA</span>
              </button>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || investigation.sources_count === 0}
                className={`hud-corner flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-mono font-black uppercase shadow-lg transition-all ${
                  investigation.sources_count === 0
                    ? 'bg-slate-900 text-slate-500 cursor-not-allowed border border-slate-800'
                    : 'animate-shimmer bg-gradient-to-r from-[#00d2ff] to-[#0088ff] text-black shadow-[#00d2ff]/25 hover:scale-105'
                }`}
              >
                {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />}
                <span>{isAnalyzing ? 'AUDITING EVIDENCE...' : 'RUN INTELLIGENCE AUDIT'}</span>
              </button>
            </div>
          </div>

          {/* Source Ingestion Workbench */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingest Web URL */}
            <div className="hud-corner p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center space-x-2 text-[#00d2ff]">
                <Globe className="w-5 h-5" />
                <h3 className="text-sm font-mono font-bold text-white">INGEST PUBLIC WEB PORTAL / URL</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                All URLs pass pre-flight DNS filtering to block SSRF, loopback, and cloud metadata (169.254.169.254).
              </p>

              <form onSubmit={handleIngestUrl} className="space-y-3 font-mono">
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://portal.ed.gov/grants/stem2026"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#00d2ff]"
                />
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Source Label (Optional)"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#060a17] border border-cyan-500/20 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-[#00d2ff]"
                />
                <button
                  type="submit"
                  disabled={isIngestingUrl}
                  className="hud-corner w-full py-2.5 rounded-lg bg-[#00d2ff]/20 hover:bg-[#00d2ff]/30 text-[#00d2ff] border border-[#00d2ff]/40 font-mono font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  {isIngestingUrl ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isIngestingUrl ? 'SCRAPING & VERIFYING...' : 'ADD VERIFIED URL'}</span>
                </button>
              </form>
            </div>

            {/* Upload PDF Document */}
            <div className="hud-corner-gold p-6 rounded-2xl glass-card space-y-4">
              <div className="flex items-center space-x-2 text-[#e2b65c]">
                <Upload className="w-5 h-5" />
                <h3 className="text-sm font-mono font-bold text-white">UPLOAD RESEARCH PDF / DOCUMENT</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Guarded via magic-byte header inspection (%PDF-), 15MB size ceiling, and UUID file isolation.
              </p>

              <div className="border border-dashed border-[#e2b65c]/40 hover:border-[#e2b65c] rounded-xl p-6 text-center transition-colors bg-[#060a17]/50">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  disabled={isUploadingPdf}
                  id="pdf-upload"
                  className="hidden"
                />
                <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-[#e2b65c] mx-auto" />
                  <div className="text-xs font-mono font-bold text-slate-200">
                    {isUploadingPdf ? 'Parsing Document...' : 'CLICK OR DROP PDF HERE TO UPLOAD'}
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
