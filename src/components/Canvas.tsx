'use client';

import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
  OnConnect
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
  service: CustomNode,
  database: CustomNode,
  'api-gateway': CustomNode,
  queue: CustomNode,
  client: CustomNode,
  cache: CustomNode,
  'cloud-service': CustomNode,
};

const initialEdges: Edge[] = [];

export default function Canvas({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  onNodeClick,
  onPaneClick
}: {
  nodes: Node[],
  edges: Edge[],
  onNodesChange: OnNodesChange,
  onEdgesChange: OnEdgesChange,
  onConnect: OnConnect,
  onNodeClick: (_: any, node: Node) => void,
  onPaneClick: () => void
}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#333" gap={20} />
        <Controls />
        <MiniMap 
          style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
          nodeColor={(n) => n.style?.background as string || '#333'}
          maskColor="rgba(0,0,0,0.3)"
        />
      </ReactFlow>
    </div>
  );
}
