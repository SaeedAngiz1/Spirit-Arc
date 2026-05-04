'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Node, 
  Edge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  addEdge,
  Connection 
} from 'reactflow';
import Canvas from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import { AIConfig } from '@/lib/ai/provider';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Terminal, X, Trash2, Sparkles } from 'lucide-react';
import { getLayoutedElements } from '@/lib/utils/layout';

const initialNodes: Node[] = [
  { 
    id: 'hero', 
    data: { label: '🚀 Spirit Arc' }, 
    position: { x: 250, y: 150 },
    style: { 
      background: 'var(--primary-color)', 
      color: 'white', 
      padding: '20px 40px', 
      borderRadius: '20px',
      fontSize: '18px',
      fontWeight: 'bold',
      boxShadow: '0 0 40px var(--primary-glow)'
    }
  }
];

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    modelName: 'gemini-1.5-flash',
    apiKey: ''
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('spirit-arc-config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load config");
      }
    }
  }, []);

  // Save config to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('spirit-arc-config', JSON.stringify(config));
  }, [config]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleGenerate = async (prompt: string) => {
    try {
      setIsLoading(true);
      console.log("Generating architecture for:", prompt);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, config })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await response.json();
      
      // Process nodes and edges with auto-layout
      const rawNodes = data.nodes.map((n: any) => ({
        ...n,
        style: n.style || { 
          background: 'var(--surface-color)', 
          color: 'white', 
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '10px'
        }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        rawNodes,
        data.edges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNode = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: `New ${type}`,
        code: `// Initial boilerplate for ${type}\nexport const ${type.replace(/-/g, '_')} = () => {\n  console.log("${type} initialized");\n};`,
        filename: `${type}.js`
      },
      style: { 
        background: 'var(--surface-color)', 
        color: 'white', 
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '10px'
      }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleReset = () => {
    if (confirm("Clear the entire canvas?")) {
      setNodes([]);
      setEdges([]);
    }
  };

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleDeleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  return (
    <main style={{ width: '100vw', height: '100vh', background: 'var(--bg-color)', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <Sidebar 
        onGenerate={handleGenerate} 
        onReset={handleReset} 
        config={config} 
        setConfig={setConfig} 
        nodes={nodes}
        edges={edges}
        onAddNode={handleAddNode}
      />
      
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Canvas 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
        />
      </div>

      {/* Global Overlays - Moved to root level and strictly layered */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            className="code-panel glass"
            initial={{ x: 450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 450, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              zIndex: 2000, 
              pointerEvents: 'all',
              position: 'fixed',
              top: '20px',
              right: '20px',
              bottom: '20px'
            }}
          >
            <div className="panel-header">
              <div className="title-area">
                <Terminal size={18} color="var(--primary-color)" />
                <h3>{selectedNode.data.label}</h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedNode(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="panel-content scrollable">
              <div className="edit-group">
                <label className="label">Component Name</label>
                <input 
                  type="text" 
                  className="edit-input"
                  value={selectedNode.data.label}
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, label: newLabel } } : n));
                    setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, label: newLabel } });
                  }}
                />
              </div>

              <div className="meta-row">
                <div className="edit-group" style={{ flex: 1 }}>
                  <label className="label">Type</label>
                  <span className="badge">{selectedNode.type}</span>
                </div>
                <div className="edit-group" style={{ flex: 2 }}>
                  <label className="label">Filename</label>
                  <input 
                    type="text" 
                    className="edit-input mono"
                    value={selectedNode.data.filename || ''}
                    onChange={(e) => {
                      const newFile = e.target.value;
                      setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, filename: newFile } } : n));
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, filename: newFile } });
                    }}
                  />
                </div>
              </div>

              <div className="code-editor-container">
                <label className="label">Source Code</label>
                <div className="code-editor-mock active">
                  <div className="editor-header">
                    <div className="dots">
                      <span style={{ background: '#ff5f56' }} />
                      <span style={{ background: '#ffbd2e' }} />
                      <span style={{ background: '#27c93f' }} />
                    </div>
                    <span className="editor-tab">{selectedNode.data.filename || 'component.js'}</span>
                  </div>
                  <textarea
                    className="code-textarea"
                    value={selectedNode.data.code || ''}
                    spellCheck={false}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, code: newCode } } : n));
                      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, code: newCode } });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="panel-footer">
              <button onClick={() => handleDeleteNode(selectedNode.id)} className="delete-node-btn">
                <Trash2 size={16} />
                Remove Component
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blueprint Suggestions Overlay (Pleasing Error State) */}
      <AnimatePresence>
        {error && (
          <div className="error-overlay-container" onClick={() => setError(null)}>
            <motion.div 
              className="error-card glass"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="error-header">
                <div className="sparkle-icon">
                  <Sparkles size={28} color="var(--primary-color)" />
                </div>
                <h3>Let's Refine Your Vision</h3>
                <button className="close-error" onClick={() => setError(null)}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="error-body">
                <p className="error-description">
                  "{error}"
                </p>
                <p className="guidance-text">
                  Your request is a great start! To build a precise architecture, try adding specific components like <b>"Redis cache," "PostgreSQL,"</b> or <b>"Auth service."</b>
                </p>

                <div className="divider" />
                
                <p className="label">Or try one of our proven blueprints:</p>
                <div className="suggestion-grid">
                  {[
                    "SaaS with Stripe & PostgreSQL",
                    "Real-time Chat with Redis",
                    "Microservices with RabbitMQ",
                    "AI Pipeline with Python & S3"
                  ].map((suggestion) => (
                    <button 
                      key={suggestion}
                      className="suggestion-chip"
                      onClick={() => {
                        setError(null);
                        handleGenerate(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="error-footer">
                <button className="retry-btn glow-hover" onClick={() => setError(null)}>
                  I'll write a better prompt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <div className="loading-overlay-container">
            <motion.div 
              className="loading-overlay glass"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="spinner-wrapper">
                <div className="spinner-glow" />
                <Loader2 className="spinner" size={40} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', marginBottom: '4px' }}>AI Architect is working</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>Designing your system infrastructure...</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .code-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          bottom: 20px;
          width: 420px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: -20px 0 60px rgba(0,0,0,0.5);
          border: 1px solid var(--border-color);
          background: rgba(10, 10, 15, 0.95);
          backdrop-filter: blur(20px);
        }

        .panel-header {
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .title-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .title-area h3 {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }

        .close-btn {
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--surface-accent);
          color: white;
        }

        .panel-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .edit-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .meta-row {
          display: flex;
          gap: 16px;
          align-items: flex-end;
        }

        .edit-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 14px;
          color: white;
          font-size: 14px;
          transition: all 0.2s;
        }

        .edit-input:focus {
          border-color: var(--primary-color);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 15px var(--primary-glow);
        }

        .edit-input.mono {
          font-family: monospace;
          font-size: 13px;
        }

        .label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--surface-accent);
          border-radius: 100px;
          font-size: 12px;
          color: var(--primary-color);
          font-weight: 600;
          border: 1px solid var(--border-color);
          align-self: flex-start;
        }

        .code-editor-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .code-editor-mock {
          background: #0f1117;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 300px;
        }

        .editor-header {
          padding: 12px 16px;
          background: #1e222d;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .editor-tab {
          font-family: monospace;
          font-size: 11px;
          color: var(--text-secondary);
        }

        .dots {
          display: flex;
          gap: 6px;
        }

        .dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .code-textarea {
          width: 100%;
          flex: 1;
          background: transparent;
          border: none;
          padding: 20px;
          color: #d1d5db;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          resize: none;
          outline: none;
        }

        .panel-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
        }

        .delete-node-btn {
          width: 100%;
          padding: 14px;
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.1);
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .delete-node-btn:hover {
          background: #ef4444;
          color: white;
        }

        .loading-overlay-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          pointer-events: all;
        }

        .loading-overlay {
          padding: 40px 60px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          color: white;
          box-shadow: 0 0 100px rgba(0,0,0,0.8);
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid var(--primary-color);
          backdrop-filter: blur(20px);
        }

        .spinner-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--primary-color);
          filter: blur(20px);
          opacity: 0.4;
          animation: pulse 2s infinite;
        }

        :global(.spinner) {
          animation: spin 1s linear infinite;
          color: var(--primary-color);
          filter: drop-shadow(0 0 15px var(--primary-glow));
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.6; }
          100% { transform: scale(0.8); opacity: 0.3; }
        }

        /* Error Suggestions Styles */
        .error-overlay-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 15000;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .error-card {
          width: 100%;
          max-width: 500px;
          background: rgba(20, 20, 30, 0.8);
          border-radius: 32px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
        }

        .error-header {
          padding: 32px 32px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: relative;
        }

        .sparkle-icon {
          width: 56px;
          height: 56px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .close-error {
          position: absolute;
          top: 32px;
          right: 32px;
          color: var(--text-secondary);
          transition: color 0.2s;
        }

        .close-error:hover {
          color: white;
        }

        .error-body {
          padding: 0 32px 32px;
        }

        .error-description {
          font-family: monospace;
          background: rgba(255,255,255,0.03);
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #ef4444;
          margin-bottom: 20px;
          border-left: 3px solid #ef4444;
        }

        .guidance-text {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .suggestion-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 16px;
        }

        .suggestion-chip {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          color: var(--text-primary);
          text-align: left;
          transition: all 0.2s;
          cursor: pointer;
        }

        .suggestion-chip:hover {
          background: var(--surface-accent);
          border-color: var(--primary-color);
          transform: translateY(-2px);
        }

        .error-footer {
          padding: 0 32px 32px;
        }

        .retry-btn {
          width: 100%;
          padding: 16px;
          background: var(--primary-color);
          border-radius: 16px;
          color: white;
          font-weight: 600;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
      `}</style>
    </main>
  );
}
