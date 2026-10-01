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
      case 'NORMAL': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'WARNING': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'CRITICAL': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'OFFLINE': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const renderNode = (node: TopologyNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];

    return (
      <div key={node.id} className="space-y-1">
        <div 
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          className={`flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-colors cursor-pointer group shadow-2xs`}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          <div className="flex items-center space-x-2.5">
            {hasChildren ? (
              isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <div className="w-3.5 h-3.5 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            )}

            <div className="text-xs font-mono">
              <span className="font-bold text-slate-900">{node.name}</span>
              <span className="text-slate-400 ml-2 text-[10px] uppercase font-medium">[{node.type}]</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            {node.ip_address && (
              <span className="text-slate-500 text-[11px]">IP: {node.ip_address}</span>
            )}
            {node.scan_rate_ms !== undefined && (
              <span className="text-blue-600 text-[11px] font-semibold">{node.scan_rate_ms.toFixed(1)}ms</span>
            )}
            {node.frequency_hz !== undefined && (
              <span className="text-emerald-600 text-[11px] font-semibold">{node.frequency_hz} Hz</span>
            )}
            {node.active_stages !== undefined && (
              <span className="text-amber-600 text-[11px] font-semibold">{node.active_stages}/9 Stages</span>
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
      <div className="p-8 text-center text-slate-500">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <span className="text-xs font-mono">Loading relational topology graph...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-sans">Automation &amp; Network Topology Tree</h2>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Hierarchical structural breakdown: Site → Building → Gateway → PLC → Panels → Mechanical Assets</p>
        </div>
        <div className="text-xs font-mono text-blue-700 font-semibold px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200">
          TOPOLOGY_STANDARD: ASHRAE Guideline 36
        </div>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-1 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]">
        {renderNode(tree)}
      </div>
    </div>
  );
}
