import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Edit3, Database, Layers, Layout, Archive, Cpu, Cloud, Zap } from 'lucide-react';

const icons: Record<string, any> = {
  service: Layers,
  database: Database,
  'api-gateway': Layout,
  queue: Archive,
  client: Cpu,
  cache: Zap,
  'cloud-service': Cloud,
};

const CustomNode = ({ data, type, selected }: NodeProps) => {
  const Icon = icons[type || 'service'] || Layers;

  return (
    <div className={`custom-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} />
      
      <div className="node-inner">
        <div className="node-icon">
          <Icon size={18} />
        </div>
        <div className="node-content">
          <div className="type-badge">{type?.replace(/-/g, ' ')}</div>
          <div className="node-label">{data.label}</div>
        </div>
        <div className="edit-action">
          <Edit3 size={12} />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />

      <style jsx>{`
        .custom-node {
          padding: 10px;
          border-radius: 14px;
          background: rgba(15, 15, 20, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          min-width: 190px;
          transition: all 0.2s ease;
          color: white;
          position: relative;
        }

        .custom-node.selected {
          border-color: var(--primary-color);
          background: rgba(139, 92, 246, 0.05);
          box-shadow: 0 0 20px var(--primary-glow);
        }

        .node-inner {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .node-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(139, 92, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .node-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .type-badge {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--primary-color);
          font-weight: 700;
          opacity: 0.8;
        }

        .node-label {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .edit-action {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }

        .custom-node:hover .edit-action {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        :global(.react-flow__handle) {
          width: 8px !important;
          height: 8px !important;
          background: var(--primary-color) !important;
          border: 2px solid #050505 !important;
        }
      `}</style>
    </div>
  );
};

export default memo(CustomNode);
