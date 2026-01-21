import React, { useState } from 'react';
import { ChevronRight, Brain } from 'lucide-react';
import { MindmapNode } from '../../../types';

interface MindmapViewProps {
  data: MindmapNode;
}

const MindmapView: React.FC<MindmapViewProps> = ({ data }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      root: 'bg-accent text-white border-accent',
      main: 'bg-blue-500 text-white border-blue-500',
      genre: 'bg-purple-500 text-white border-purple-500',
      skill: 'bg-green-500 text-white border-green-500',
      sub: 'bg-stone-600 dark:bg-stone-700 text-white border-stone-600'
    };
    return colors[category] || 'bg-stone-400 text-white border-stone-400';
  };

  const renderNode = (node: MindmapNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className={`flex flex-col ${level > 0 ? 'ml-8 mt-4' : ''}`}>
        <div className="flex items-start gap-3">
          {/* Node */}
          <div
            onClick={() => {
              if (hasChildren) toggleNode(node.id);
              setSelectedNode(node);
            }}
            className={`
              relative px-4 py-3 rounded-xl shadow-md border-2 font-medium cursor-pointer
              transition-all hover:scale-105 hover:shadow-lg
              ${getCategoryColor(node.category)}
              ${level === 0 ? 'text-xl' : level === 1 ? 'text-lg' : 'text-base'}
            `}
          >
            <div className="flex items-center gap-2">
              {hasChildren && (
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              )}
              <span>{node.label}</span>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col mt-2 border-l-2 border-stone-300 dark:border-stone-600 pl-4">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mindmap Tree */}
      <div className="flex-1 overflow-x-auto">
        {renderNode(data)}
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="lg:w-80 bg-stone-50 dark:bg-stone-900 rounded-xl p-6 border-2 border-accent/30">
          <h4 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent" />
            {selectedNode.label}
          </h4>
          {selectedNode.description && (
            <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
              {selectedNode.description}
            </p>
          )}
          {selectedNode.examples && selectedNode.examples.length > 0 && (
            <div>
              <h5 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-2 uppercase tracking-wider">
                Ví dụ:
              </h5>
              <ul className="space-y-2">
                {selectedNode.examples.map((example, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2"
                  >
                    <span className="text-accent font-bold">•</span>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MindmapView;
