'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Fan, 
  Snowflake, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  Settings 
} from 'lucide-react';
import { Sidebar, NavTab, SystemMode } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/dashboard/TopHeader';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { SystemOverview } from '@/components/dashboard/SystemOverview';
import { ControlTables } from '@/components/dashboard/ControlTables';
import { TemperatureTrendGraph } from '@/components/dashboard/TemperatureTrendGraph';
import { RightPanel } from '@/components/dashboard/RightPanel';
import { MotionTabs, MotionTabItem } from '@/components/navigation/MotionTabs';

// Dedicated Subsystem Deep-Dive Views (100% Read-Only)
import { AhuDetailView } from '@/components/views/AhuDetailView';
import { OduDetailView } from '@/components/views/OduDetailView';
import { HeaterDetailView } from '@/components/views/HeaterDetailView';
import { TemperatureGraphView } from '@/components/views/TemperatureGraphView';
import { AlarmsDetailView } from '@/components/views/AlarmsDetailView';
import { SettingsDetailView } from '@/components/views/SettingsDetailView';

// Plant Electrical Monitoring System View (Image 2 style, 100% Read-Only, No emojis, SLD Schematic)
import { ElectricalMonitoringView } from '@/components/electrical/ElectricalMonitoringView';

import { SystemState } from '@/types/hvac';
import { fetchSystemState } from '@/lib/api';

export default function DashboardPage() {
  const [activeSystem, setActiveSystem] = useState<SystemMode>('hvac');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchSystemState();
      setSystemState(data);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleTabSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    if (activeSystem !== 'hvac') {
      setActiveSystem('hvac');
    }
  };

  const handleSystemSelect = (sys: SystemMode) => {
    setActiveSystem(sys);
  };

  const activeAlarmCount = systemState?.alarms?.filter(a => a.state !== 'CLEARED').length ?? 0;

  // Staged MotionTabs Configuration (Inspired by Arise UI MotionTabs)
  const hvacMotionTabs: MotionTabItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard Overview', 
      icon: LayoutDashboard, 
      category: 'Master SCADA', 
      description: 'Cleanroom digital twin schematic, multi-equipment telemetry stream & active controls' 
    },
    { 
      id: 'ahu', 
      label: 'AHU Cleanroom', 
      icon: Fan, 
      category: 'Air Handler', 
      description: 'Centrifugal supply blower, closed-loop VFD modulation & HEPA filter bank telemetry' 
    },
    { 
      id: 'odu', 
      label: 'ODU Inverters', 
      icon: Snowflake, 
      category: 'Refrigeration', 
      description: '6-circuit direct expansion inverter scroll condensing units & head pressure diagnostics' 
    },
    { 
      id: 'heater', 
      label: 'Electric Heater', 
      icon: Flame, 
      category: 'Thermal Balance', 
      description: '8-stage silicon reheat bank & SCR modulating psychrometric trim telemetry' 
    },
    { 
      id: 'graph', 
      label: 'Telemetry Trends', 
      icon: TrendingUp, 
      category: 'Analytics', 
      description: '24-hour thermal equilibrium curves & relative humidity psychrometric tracking' 
    },
    { 
      id: 'alarms', 
      label: 'Alarms & Faults', 
      icon: AlertTriangle, 
      category: 'Safety Feed', 
      description: 'Supervisory fault logging, limit cutouts & alarm acknowledgement console', 
      badge: activeAlarmCount 
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: Settings, 
      category: 'Configuration', 
      description: 'Engineering thresholds, Modbus gateway configuration & PID tuning parameters' 
    },
  ];

  return (
    <div className="light min-h-screen bg-[#EEF2F6] text-slate-900 flex font-sans antialiased relative selection:bg-sky-500 selection:text-white">
      {/* Engineering Blueprint Grid Pattern (Subtle & Crisp Contrast) */}
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* 1. Left Sidebar (Responsive: Sticky on Desktop, Drawer on Mobile) */}
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={handleTabSelect}
        activeSystem={activeSystem}
        onSelectSystem={handleSystemSelect}
        alarmCount={activeAlarmCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader 
          activeSystem={activeSystem}
          onSelectSystem={handleSystemSelect}
          alarmCount={activeAlarmCount}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="p-4 md:p-6 space-y-6 max-w-[1780px] w-full mx-auto">
          {/* A. If Electrical System is selected -> Render Plant Electrical Monitoring View */}
          {activeSystem === 'electrical' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono-numbers uppercase tracking-wider font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Electrical Infrastructure
                </span>
                <span className="text-slate-300">/</span>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Plant Electrical Power Grid</h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                11kV Substation incomer, 2.5 MVA distribution transformer &amp; 7-feeder real-time power telemetry
              </p>
              <ElectricalMonitoringView />
            </div>
          ) : (
            /* B. HVAC Subsystems based on currentTab with Arise UI MotionTabs */
            <>
              {/* Arise UI Inspired Fluid MotionTabs Navigation */}
              <MotionTabs
                tabs={hvacMotionTabs}
                activeTab={currentTab}
                onSelectTab={(id) => handleTabSelect(id as NavTab)}
              />

              {/* Sub-View: Master Dashboard Overview */}
              {currentTab === 'dashboard' && (
                <>
                  {/* Top 4 Key Metrics */}
                  <MetricCards systemState={systemState} />

                  {/* Main Grid: Left Flow/Schematic + Right Telemetry Panel */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* Left Column (8 of 12) */}
                    <div className="xl:col-span-8 space-y-6">
                      {/* System Overview: Dual View (Flow + Schematic) */}
                      <SystemOverview systemState={systemState} />

                      {/* Control Tables: AHU, ODU, Heater (100% Read-Only) */}
                      <ControlTables systemState={systemState} />

                      {/* Temperature & RH Trend Graph */}
                      <TemperatureTrendGraph />
                    </div>

                    {/* Right Column (4 of 12) */}
                    <div className="xl:col-span-4">
                      <RightPanel systemState={systemState} />
                    </div>
                  </div>
                </>
              )}

              {/* Dedicated Sub-View: AHU (100% Read-Only) */}
              {currentTab === 'ahu' && (
                <AhuDetailView systemState={systemState} />
              )}

              {/* Dedicated Sub-View: ODU Inverters (100% Read-Only) */}
              {currentTab === 'odu' && (
                <OduDetailView systemState={systemState} />
              )}

              {/* Dedicated Sub-View: Electric Heater Reheat Bank (100% Read-Only, Energized) */}
              {currentTab === 'heater' && (
                <HeaterDetailView systemState={systemState} />
              )}

              {/* Dedicated Sub-View: Temperature & Humidity Trend Analysis */}
              {currentTab === 'graph' && (
                <TemperatureGraphView systemState={systemState} />
              )}

              {/* Dedicated Sub-View: Alarms & Fault Management Console */}
              {currentTab === 'alarms' && (
                <AlarmsDetailView systemState={systemState} />
              )}

              {/* Dedicated Sub-View: Settings & Engineering Thresholds */}
              {currentTab === 'settings' && (
                <SettingsDetailView systemState={systemState} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
