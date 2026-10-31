import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  FileCode
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl glass-panel border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Executive Intelligence Report</h3>
              <p className="text-xs text-slate-400 font-mono">{investigation.title}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {report && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print to PDF</span>
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!report ? (
            <div className="text-center py-16 space-y-4 max-w-md mx-auto">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
              <h4 className="text-lg font-bold text-white">Compile Formal Intelligence Audit</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Synthesizes verified requirements, epistemic gaps, cross-source contradictions, and verification next-steps into an executive printable dossier.
              </p>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 shadow-lg shadow-cyan-500/25 transition-all text-sm"
              >
                {isGenerating ? 'Compiling Dossier...' : 'Generate Executive Report'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab Switcher */}
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'preview'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Styled Document Preview
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeTab === 'json'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Structured JSON
                </button>
              </div>

              {activeTab === 'preview' ? (
                <div 
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-6 text-sm"
                  dangerouslySetInnerHTML={{ __html: report.html_content }}
                />
              ) : (
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[500px]">
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
