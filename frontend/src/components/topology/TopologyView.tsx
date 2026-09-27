'use client';

import React, { useState } from 'react';
import { 
  GitFork, 
  ChevronRight, 
  ChevronDown, 
  Server, 
  Cpu, 
  Sliders, 
  Layers, 
  ShieldCheck,
  Activity
} from 'lucide-react';

interface TopologyNode {
  id: string;
  name: string;
  type: string;
  status: string;
  ip_address?: string;
  scan_rate_ms?: number;
  frequency_hz?: number;
  airflow_cfm?: number;
  active_stages?: number;
  children?: TopologyNode[];
}

interface TopologyViewProps {
  tree: TopologyNode | null;
}

export function TopologyView({ tree }: TopologyViewProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (id: string) => {
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
      case 'WARNING': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'CRITICAL': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      case 'OFFLINE': return 'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/30';
      default: return 'text-[#64748B] bg-[#64748B]/10 border-[#64748B]/30';
    }
  };

  const renderNode = (node: TopologyNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];

    return (
      <div key={node.id} className="space-y-1">
        <div 
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          className={`flex items-center justify-between p-2.5 rounded bg-[#031427] hover:bg-[#102034] border border-[#1B2B3F] transition-colors cursor-pointer group`}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center space-x-2.5">
            {hasChildren ? (
              isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#06B6D4]" />
            ) : (
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1B2B3F]" />
              </div>
            )}

            <div className="text-xs font-mono-numbers">
              <span className="font-bold text-[#D3E4FE]">{node.name}</span>
              <span className="text-[#64748B] ml-2 text-[10px] uppercase">[{node.type}]</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono-numbers">
            {node.ip_address && (
              <span className="text-[#64748B] text-[11px]">IP: {node.ip_address}</span>
            )}
            {node.scan_rate_ms !== undefined && (
              <span className="text-[#06B6D4] text-[11px]">{node.scan_rate_ms.toFixed(1)}ms</span>
            )}
            {node.frequency_hz !== undefined && (
              <span className="text-[#22C55E] text-[11px]">{node.frequency_hz} Hz</span>
            )}
            {node.active_stages !== undefined && (
              <span className="text-[#F97316] text-[11px]">{node.active_stages}/9 Stages</span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(node.status)}`}>
              {node.status}
            </span>
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!tree) {
    return (
      <div className="p-8 text-center text-[#64748B]">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-[#06B6D4]" />
        <span className="text-xs font-mono-numbers">Loading relational topology graph...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] border border-[#1B2B3F] rounded-lg p-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#D3E4FE] tracking-wide">Automation & Network Topology Tree</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Hierarchical structural breakdown: Site → Building → Gateway → PLC → Panels → Mechanical Assets</p>
        </div>
        <div className="text-xs font-mono-numbers text-[#06B6D4]">
          TOPOLOGY_STANDARD: ASHRAE Guideline 36
        </div>
      </div>

      <div className="bg-[#0F172A] border border-[#1B2B3F] rounded-lg p-3 space-y-1">
        {renderNode(tree)}
      </div>
    </div>
  );
}
