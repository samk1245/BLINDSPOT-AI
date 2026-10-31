import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navigation } from './components/Navigation';
import { LandingHero } from './components/LandingHero';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { InvestigationStudio } from './components/InvestigationStudio';
import { RequirementsMatrix } from './components/RequirementsMatrix';
import { GapsAndContradictions } from './components/GapsAndContradictions';
import { EvidenceTraceabilityGraph } from './components/EvidenceTraceabilityGraph';
import { VerificationCopilot } from './components/VerificationCopilot';
import { DecisionReadinessCard } from './components/DecisionReadinessCard';
import { ReportViewer } from './components/ReportViewer';
import { AdminPanel } from './components/AdminPanel';
import { Investigation, ResearchRequirement, InformationGap, Conflict } from './types';
import { apiClient } from './api/client';
import { 
  FileText, 
  Layers, 
  AlertTriangle, 
  Network, 
  ListTodo, 
  Scale, 
  Plus, 
  Sparkles 
} from 'lucide-react';

export const App: React.FC = () => {
  const { user, token, quickDemoLogin } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'investigation' | 'admin'>('landing');
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  
  // Investigation sub-tab
  const [invTab, setInvTab] = useState<'studio' | 'requirements' | 'gaps' | 'graph' | 'copilot' | 'readiness'>('studio');
  
  // Detailed data for active investigation
  const [requirements, setRequirements] = useState<ResearchRequirement[]>([]);
  const [gaps, setGaps] = useState<InformationGap[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Sync view when user logs in/out
  useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView('dashboard');
    } else if (!user) {
      setCurrentView('landing');
      setActiveInvestigation(null);
    }
  }, [user]);

  // Fetch user's investigations
  const fetchInvestigations = async () => {
    if (!token) return;
    try {
      const res = await apiClient.get<Investigation[]>('/investigations');
      setInvestigations(res.data);
      if (res.data.length > 0 && !activeInvestigation) {
        setActiveInvestigation(res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching investigations', err);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, [token]);

  // Fetch active investigation details
  const fetchActiveDetails = async (invId: string) => {
    try {
      const [reqsRes, gapsRes, confsRes] = await Promise.all([
        apiClient.get<ResearchRequirement[]>(`/intelligence/${invId}/requirements`),
        apiClient.get<InformationGap[]>(`/intelligence/${invId}/gaps`),
        apiClient.get<Conflict[]>(`/intelligence/${invId}/conflicts`),
      ]);
      setRequirements(reqsRes.data);
      setGaps(gapsRes.data);
      setConflicts(confsRes.data);
    } catch (err) {
      console.error('Error fetching details', err);
    }
  };

  useEffect(() => {
    if (activeInvestigation) {
      fetchActiveDetails(activeInvestigation.id);
    }
  }, [activeInvestigation]);

  const handleSelectInvestigation = (inv: Investigation) => {
    setActiveInvestigation(inv);
    setCurrentView('investigation');
    setInvTab('studio');
  };

  const handleLaunchScholarshipDemo = async () => {
    if (!user) {
      await quickDemoLogin();
    }
    try {
      // 1. Create scholarship draft
      const draft = await apiClient.post<Investigation>('/investigations', {
        title: 'National STEM Excellence Fellowship (Demo)',
        research_question: 'What should I verify before applying for the 2026 STEM Fellowship?',
        objective: 'Identify eligibility limits, renewal clauses, conflicting documents, and deadlines.',
        domain: 'Education & Grants',
      });
      // 2. Load demo dataset & trigger analysis
      await apiClient.post(`/investigations/${draft.data.id}/load-demo-data`);
      const updated = await apiClient.get<Investigation>(`/investigations/${draft.data.id}`);
      
      await fetchInvestigations();
      setActiveInvestigation(updated.data);
      setCurrentView('investigation');
      setInvTab('gaps'); // Directly showcase the detected gaps & contradictions
    } catch (err) {
      console.error('Failed to launch demo', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <Navigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        hasActiveInvestigation={Boolean(activeInvestigation)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* VIEW: LANDING */}
        {currentView === 'landing' && (
          <LandingHero 
            onGetStarted={() => {
              if (user) setCurrentView('dashboard');
              else quickDemoLogin();
            }} 
          />
        )}

        {/* VIEW: EXECUTIVE DASHBOARD */}
        {currentView === 'dashboard' && (
          <ExecutiveDashboard
            investigations={investigations}
            onSelectInvestigation={handleSelectInvestigation}
            onCreateNew={() => {
              setActiveInvestigation(null);
              setCurrentView('investigation');
            }}
            onLaunchDemo={handleLaunchScholarshipDemo}
          />
        )}

        {/* VIEW: INVESTIGATION STUDIO */}
        {currentView === 'investigation' && (
          <div className="space-y-6">
            {activeInvestigation && (
              /* Sub-Navigation for Active Investigation */
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                <div className="flex flex-wrap items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setInvTab('studio')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'studio' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Overview & Sources</span>
                  </button>

                  <button
                    onClick={() => setInvTab('requirements')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'requirements' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Requirements Matrix</span>
                  </button>

                  <button
                    onClick={() => setInvTab('gaps')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'gaps' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gaps & Conflicts</span>
                  </button>

                  <button
                    onClick={() => setInvTab('graph')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'graph' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Evidence Graph</span>
                  </button>

                  <button
                    onClick={() => setInvTab('copilot')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'copilot' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Verification Copilot</span>
                  </button>

                  <button
                    onClick={() => setInvTab('readiness')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      invTab === 'readiness' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Decision Readiness</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-semibold transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Report Dossier</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveInvestigation(null);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sub-Views */}
            {invTab === 'studio' && (
              <InvestigationStudio
                investigation={activeInvestigation}
                onInvestigationUpdated={(updated) => {
                  setActiveInvestigation(updated);
                  fetchInvestigations();
                  fetchActiveDetails(updated.id);
                }}
                onAnalysisCompleted={() => {
                  if (activeInvestigation) {
                    fetchActiveDetails(activeInvestigation.id);
                  }
                }}
              />
            )}

            {invTab === 'requirements' && (
              <RequirementsMatrix requirements={requirements} />
            )}

            {invTab === 'gaps' && (
              <GapsAndContradictions gaps={gaps} conflicts={conflicts} />
            )}

            {invTab === 'graph' && activeInvestigation && (
              <EvidenceTraceabilityGraph investigationId={activeInvestigation.id} />
            )}

            {invTab === 'copilot' && activeInvestigation && (
              <VerificationCopilot investigationId={activeInvestigation.id} />
            )}

            {invTab === 'readiness' && activeInvestigation && (
              <DecisionReadinessCard
                score={activeInvestigation.readiness_score}
                breakdownRaw={activeInvestigation.readiness_breakdown}
              />
            )}

            {/* Modal for Report Viewing & Export */}
            {showReportModal && activeInvestigation && (
              <ReportViewer
                investigation={activeInvestigation}
                onClose={() => setShowReportModal(false)}
              />
            )}
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {currentView === 'admin' && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060910] py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>BLINDSPOT AI • Epistemic Research Intelligence Platform</span>
          <span className="font-mono text-cyan-500">Argon2id • SSRF Immunity • 100% Traceability</span>
        </div>
      </footer>
    </div>
  );
};
