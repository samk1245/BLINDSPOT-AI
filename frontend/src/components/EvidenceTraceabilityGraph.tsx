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
import { Network, X, Fingerprint, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
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
        
        // Style nodes according to their node type
        const styledNodes = (res.data.nodes || []).map((node: any) => {
          let bg = '#0f172a';
          let border = '#334155';
          let text = '#f8fafc';

          switch (node.data?.type) {
            case 'OBJECTIVE':
              bg = 'rgba(6, 182, 212, 0.15)';
              border = '#06b6d4';
              break;
            case 'REQUIREMENT':
              bg = 'rgba(56, 189, 248, 0.12)';
              border = '#38bdf8';
              break;
            case 'SOURCE':
              bg = 'rgba(168, 85, 247, 0.15)';
              border = '#a855f7';
              break;
            case 'GAP':
              bg = 'rgba(245, 158, 11, 0.15)';
              border = '#f59e0b';
              break;
            case 'CONFLICT':
              bg = 'rgba(239, 68, 68, 0.15)';
              border = '#ef4444';
              break;
          }

          return {
            ...node,
            style: {
              background: bg,
              border: `1.5px solid ${border}`,
              color: text,
              borderRadius: '12px',
              padding: '12px',
              fontSize: '12px',
              width: 220,
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              cursor: 'pointer',
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
    <div className="p-6 rounded-2xl glass-panel space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Interactive Evidence Traceability Graph</span>
          </h3>
          <p className="text-xs text-slate-400">
            Directed acyclic graph linking objectives, decomposed criteria, fingerprinted sources, gaps, and contradictions.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400">Click any node to inspect provenance</span>
      </div>

      <div className="relative h-[540px] w-full rounded-xl overflow-hidden border border-slate-800 bg-[#060910]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
            Loading DAG Evidence Mesh...
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
            <Background color="#1e293b" gap={16} />
            <Controls className="bg-slate-900 border-slate-700 text-white" />
            <MiniMap 
              nodeColor={(n: any) => {
                if (n.data?.type === 'OBJECTIVE') return '#06b6d4';
                if (n.data?.type === 'SOURCE') return '#a855f7';
                if (n.data?.type === 'GAP') return '#f59e0b';
                if (n.data?.type === 'CONFLICT') return '#ef4444';
                return '#38bdf8';
              }} 
              className="bg-slate-900 border-slate-800 rounded-lg"
            />
          </ReactFlow>
        )}

        {/* Node Detail Inspector Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-5 space-y-3 backdrop-blur-md animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-mono font-bold uppercase text-cyan-400">
                Node Inspector: {selectedNode.type}
              </span>
              <button 
                onClick={() => setSelectedNode(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
              
              {selectedNode.subtitle && (
                <p className="text-xs text-slate-300 font-mono italic">{selectedNode.subtitle}</p>
              )}

              {selectedNode.description && (
                <p className="text-xs text-slate-300">{selectedNode.description}</p>
              )}

              {/* Source Evidence Snippet */}
              {selectedNode.evidenceSnippet && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="flex items-center space-x-1 text-cyan-400 font-bold uppercase">
                      <Fingerprint className="w-3 h-3" />
                      <span>Verbatim Evidence Passage:</span>
                    </span>
                    <span className="font-mono">{selectedNode.fingerprint}</span>
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
                  <p className="text-slate-300 italic text-[11px]">{selectedNode.epistemicNote}</p>
                </div>
              )}

              {/* Conflict Dual Claims */}
              {selectedNode.claimA && selectedNode.claimB && (
                <div className="space-y-2 text-xs pt-1">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-cyan-400 text-[10px] uppercase font-bold block">{selectedNode.sourceA}:</span>
                    <p className="text-slate-200 text-[11px]">"{selectedNode.claimA}"</p>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-violet-400 text-[10px] uppercase font-bold block">{selectedNode.sourceB}:</span>
                    <p className="text-slate-200 text-[11px]">"{selectedNode.claimB}"</p>
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
