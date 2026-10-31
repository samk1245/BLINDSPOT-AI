import React, { useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, X, Fingerprint, Calendar, ExternalLink, ShieldCheck, ZoomIn, Info } from 'lucide-react';
import { apiClient } from '../api/client';

interface EvidenceTraceabilityGraphProps {
  investigationId: string;
}

export const EvidenceTraceabilityGraph: React.FC<EvidenceTraceabilityGraphProps> = ({ investigationId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/intelligence/${investigationId}/graph`);
        
        // Realistic multi-chromatic node styling
        const styledNodes = (res.data.nodes || []).map((node: any) => {
          let bg = '#121826';
          let border = '#26334d';
          let text = '#f1f5f9';
          let iconColor = '#818cf8';

          switch (node.data?.type) {
            case 'OBJECTIVE':
              bg = '#141c2e';
              border = '#3b82f6';
              iconColor = '#60a5fa';
              break;
            case 'REQUIREMENT':
              bg = '#16192e';
              border = '#6366f1';
              iconColor = '#818cf8';
              break;
            case 'SOURCE':
              bg = '#10221e';
              border = '#10b981';
              iconColor = '#34d399';
              break;
            case 'GAP':
              bg = '#221910';
              border = '#f59e0b';
              iconColor = '#fbbf24';
              break;
            case 'CONFLICT':
              bg = '#251218';
              border = '#f43f5e';
              iconColor = '#fb7185';
              break;
          }

          return {
            ...node,
            style: {
              background: bg,
              border: `1.5px solid ${border}`,
              color: text,
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '12px',
              fontWeight: 500,
              width: 230,
              boxShadow: '0 8px 24px -4px rgba(0,0,0,0.45)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            },
          };
        });

        setNodes(styledNodes);
        setEdges(res.data.edges || []);
      } catch (err) {
        console.error('Error fetching graph', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGraph();
  }, [investigationId]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  };

  return (
    <div className="p-6 rounded-2xl panel-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Network className="w-4 h-4 text-indigo-400" />
            <span>Interactive Evidence Traceability Graph</span>
          </h3>
          <p className="text-xs text-slate-400">
            Directed acyclic graph linking objectives, decomposed criteria, fingerprinted sources, gaps, and contradictions.
          </p>
        </div>
        
        {/* Node Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 text-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Objective</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span>Requirement</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Source</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Gap</span>
          </span>
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/60 text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Conflict</span>
          </span>
        </div>
      </div>

      <div className="relative h-[560px] w-full rounded-xl overflow-hidden border border-[#222f46] bg-[#090d16]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Rendering Directed Evidence Mesh...</span>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            fitView
          >
            <Background color="#1a2438" gap={20} size={1} />
            <Controls className="!bg-[#0e1422] !border-[#222f46] !text-slate-300" />
            <MiniMap 
              nodeColor={(n: any) => {
                if (n.data?.type === 'OBJECTIVE') return '#3b82f6';
                if (n.data?.type === 'SOURCE') return '#10b981';
                if (n.data?.type === 'GAP') return '#f59e0b';
                if (n.data?.type === 'CONFLICT') return '#f43f5e';
                return '#6366f1';
              }} 
              className="!bg-[#0e1422] !border-[#222f46] rounded-lg"
            />
          </ReactFlow>
        )}

        {/* Node Detail Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 rounded-xl bg-[#0e1422]/95 border border-[#26334d] shadow-2xl p-5 space-y-3 backdrop-blur-md animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Node Inspector: {selectedNode.type}</span>
              </span>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
              
              {selectedNode.subtitle && (
                <p className="text-xs text-indigo-300/90 font-mono italic">{selectedNode.subtitle}</p>
              )}

              {selectedNode.description && (
                <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
              )}

              {/* Source Evidence Snippet */}
              {selectedNode.evidenceSnippet && (
                <div className="p-3 rounded-lg bg-[#070b13] border border-[#1e293b] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold uppercase">
                      <Fingerprint className="w-3 h-3" />
                      <span>Verbatim Evidence Passage:</span>
                    </span>
                    <span className="font-mono text-slate-400">{selectedNode.fingerprint}</span>
                  </div>
                  <p className="text-slate-300 italic font-mono text-[11px] leading-relaxed">
                    "{selectedNode.evidenceSnippet}"
                  </p>
                </div>
              )}

              {/* Gap Epistemic Note */}
              {selectedNode.epistemicNote && (
                <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-xs space-y-1">
                  <span className="text-amber-400 font-bold uppercase text-[10px] block">
                    Epistemic Caveat:
                  </span>
                  <p className="text-slate-300 italic text-[11px] leading-relaxed">{selectedNode.epistemicNote}</p>
                </div>
              )}

              {/* Conflict Dual Claims */}
              {selectedNode.claimA && selectedNode.claimB && (
                <div className="space-y-2 text-xs pt-1">
                  <div className="p-2.5 rounded bg-[#070b13] border border-[#1e293b]">
                    <span className="text-sky-400 text-[10px] uppercase font-bold block mb-1">{selectedNode.sourceA}:</span>
                    <p className="text-slate-200 text-[11px] leading-relaxed">"{selectedNode.claimA}"</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#070b13] border border-[#1e293b]">
                    <span className="text-rose-400 text-[10px] uppercase font-bold block mb-1">{selectedNode.sourceB}:</span>
                    <p className="text-slate-200 text-[11px] leading-relaxed">"{selectedNode.claimB}"</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};
