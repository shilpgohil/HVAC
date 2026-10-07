'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { AhuDetailView } from '@/components/views/AhuDetailView';
import { OduDetailView } from '@/components/views/OduDetailView';
import { HeaterDetailView } from '@/components/views/HeaterDetailView';
import { TemperatureGraphView } from '@/components/views/TemperatureGraphView';
import { AlarmsDetailView } from '@/components/views/AlarmsDetailView';
import { SettingsDetailView } from '@/components/views/SettingsDetailView';
import { ElectricalMonitoringView } from '@/components/electrical/ElectricalMonitoringView';
import { HomeIotMonitoringView } from '@/components/home_iot/HomeIotMonitoringView';
import { SystemState } from '@/types/hvac';
import { fetchSystemState } from '@/lib/api';
import { useHvacWebSocket } from '@/hooks/useHvacWebSocket';

export default function DashboardPage() {
  const [activeSystem, setActiveSystem] = useState<SystemMode>('hvac');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const { isConnected: wsConnected, lastTick } = useHvacWebSocket();

  useEffect(() => {
    if (lastTick) {
      setSystemState(lastTick as SystemState);
      setIsLoading(false);
    }
  }, [lastTick]);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchSystemState();
      setSystemState(prev => prev ?? data);
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
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

  const hvacMotionTabs: MotionTabItem[] = useMemo(() => [
    { 
      id: 'dashboard', 
      label: 'Overview', 
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
      label: 'Trends', 
      icon: TrendingUp, 
      category: 'Analytics', 
      description: '24-hour thermal equilibrium curves & relative humidity psychrometric tracking' 
    },
    { 
      id: 'alarms', 
      label: 'Alarms', 
      icon: AlertTriangle, 
      category: 'Safety Feed', 
      description: 'Supervisory fault logging, limit cutouts & alarm acknowledgement console', 
      badge: activeAlarmCount 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      category: 'Configuration', 
      description: 'Engineering thresholds, Modbus gateway configuration & PID tuning parameters' 
    },
  ], [activeAlarmCount]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans antialiased relative selection:bg-blue-600 selection:text-white">
      <div 
        className="fixed inset-0 pointer-events-none -z-10 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={handleTabSelect}
        activeSystem={activeSystem}
        onSelectSystem={handleSystemSelect}
        alarmCount={activeAlarmCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopHeader 
          activeSystem={activeSystem}
          onSelectSystem={handleSystemSelect}
          alarmCount={activeAlarmCount}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          isMobileSidebarOpen={isMobileSidebarOpen}
          systemState={systemState}
          wsConnected={wsConnected}
        />

        <main className="p-4 md:p-6 space-y-6 max-w-[1780px] w-full mx-auto">
          {activeSystem === 'electrical' ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono-numbers uppercase tracking-wider font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
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
          ) : activeSystem === 'home_iot' ? (
            <HomeIotMonitoringView />
          ) : (
            <>
              <MotionTabs
                tabs={hvacMotionTabs}
                activeTab={currentTab}
                onSelectTab={(id) => handleTabSelect(id as NavTab)}
              />

              {currentTab === 'dashboard' && (
                <>
                  <MetricCards systemState={systemState} />

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    <div className="xl:col-span-8 space-y-6">
                      <SystemOverview systemState={systemState} />
                      <ControlTables systemState={systemState} />
                      <TemperatureTrendGraph />
                    </div>

                    <div className="xl:col-span-4">
                      <RightPanel systemState={systemState} />
                    </div>
                  </div>
                </>
              )}

              {currentTab === 'ahu' && (
                <AhuDetailView systemState={systemState} />
              )}

              {currentTab === 'odu' && (
                <OduDetailView systemState={systemState} />
              )}

              {currentTab === 'heater' && (
                <HeaterDetailView systemState={systemState} />
              )}

              {currentTab === 'graph' && (
                <TemperatureGraphView systemState={systemState} />
              )}

              {currentTab === 'alarms' && (
                <AlarmsDetailView systemState={systemState} />
              )}

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
