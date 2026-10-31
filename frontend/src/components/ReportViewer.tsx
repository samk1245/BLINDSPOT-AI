import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  FileCode,
  Copy,
  Check
} from 'lucide-react';
import { Investigation, InvestigationReport } from '../types';
import { apiClient } from '../api/client';

interface ReportViewerProps {
  investigation: Investigation;
  onClose: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ investigation, onClose }) => {
  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await apiClient.post<InvestigationReport>(`/reports/${investigation.id}/generate`);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadJson = () => {
    if (!report) return;
    const blob = new Blob([report.report_json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Blindspot_Report_${investigation.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.report_json);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!report) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(report.html_content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl panel-card border border-[#26334d] shadow-2xl flex flex-col overflow-hidden bg-[#0c101c]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1e2638] bg-[#0e1424] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Executive Intelligence Dossier</h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-md">{investigation.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {report && (
              <>
                <button
                  onClick={copyJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#222f46] text-slate-300 text-xs font-semibold transition-all"
                  title="Copy JSON to clipboard"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#141b2b] hover:bg-[#1a2338] border border-[#222f46] text-slate-300 text-xs font-semibold transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!report ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 flex items-center justify-center mx-auto text-indigo-400 shadow-lg">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white">Compile Formal Intelligence Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthesizes verified requirements, epistemic gaps, cross-source contradictions, and verification next-steps into an executive printable dossier.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all text-sm disabled:opacity-50"
              >
                {isGenerating ? 'Compiling Dossier...' : 'Generate Executive Report'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex items-center space-x-2 border-b border-[#1e2638] pb-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/80'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Styled Document Preview
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'json'
                      ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/80'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Structured JSON
                </button>
              </div>

              {activeTab === 'preview' ? (
                <div 
                  className="rounded-xl overflow-hidden border border-[#222f46] bg-[#080c16] p-6 text-sm"
                  dangerouslySetInnerHTML={{ __html: report.html_content }}
                />
              ) : (
                <pre className="p-4 rounded-xl bg-[#080c16] border border-[#222f46] text-xs font-mono text-indigo-300/90 overflow-x-auto max-h-[500px]">
                  {report.report_json}
                </pre>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
