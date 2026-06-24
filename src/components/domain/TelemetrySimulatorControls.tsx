import { useEffect, useRef, useCallback, useState } from 'react';
import { Play, Square, RotateCcw, Activity, Thermometer, Battery, ShieldAlert, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store';
import type { TelemetryScenario, ScenarioConfig, TelemetryReading, Alarm } from '@/types';

// ============================================================
// SCENARIO DEFINITIONS
// ============================================================

const SCENARIOS: ScenarioConfig[] = [
  {
    id: 'normal',
    label: 'Normal Operation',
    description: 'Healthy cycling between 20-90% SoC, stable SoH',
    color: '#34D399',
    parameters: { socRange: [20, 90], sohDecayRate: 0.001, tempRange: [22, 32], alarmProbability: 0, connectivityLossProbability: 0 },
  },
  {
    id: 'warning',
    label: 'Warning Condition',
    description: 'Elevated temperature, occasional connectivity loss',
    color: '#F59E0B',
    parameters: { socRange: [15, 85], sohDecayRate: 0.003, tempRange: [30, 42], alarmProbability: 0.1, connectivityLossProbability: 0.05 },
  },
  {
    id: 'critical',
    label: 'Critical Alarm',
    description: 'High thermal gradient, multiple active alarms',
    color: '#EF4444',
    parameters: { socRange: [10, 70], sohDecayRate: 0.01, tempRange: [38, 55], alarmProbability: 0.4, connectivityLossProbability: 0.15 },
  },
  {
    id: 'degradation',
    label: 'Accelerated Degradation',
    description: 'Rapid SoH decline, efficiency drop',
    color: '#00D4FF',
    parameters: { socRange: [20, 80], sohDecayRate: 0.02, tempRange: [25, 36], alarmProbability: 0.05, connectivityLossProbability: 0 },
  },
];

// ============================================================
// HELPERS
// ============================================================

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateAlarm(scenario: TelemetryScenario): Alarm | null {
  const alarmTypes: Array<{ type: Alarm['type']; severity: Alarm['severity']; message: string }> = [
    { type: 'high_temperature', severity: scenario === 'critical' ? 'critical' : 'warning', message: 'Module temperature exceeds threshold' },
    { type: 'thermal_gradient', severity: 'warning', message: 'Thermal gradient above 5°C detected' },
    { type: 'capacity_degradation', severity: 'warning', message: 'Accelerated capacity loss detected' },
    { type: 'low_soc', severity: scenario === 'critical' ? 'critical' : 'warning', message: 'State of charge critically low' },
    { type: 'efficiency_drop', severity: 'warning', message: 'Round-trip efficiency below threshold' },
  ];

  const selected = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
  return {
    id: `alarm-sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: selected.type,
    severity: selected.severity,
    message: selected.message,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

// ============================================================
// COMPONENT
// ============================================================

export interface TelemetrySimulatorControlsProps {
  assetId: string;
  className?: string;
}

interface SimulatedValues {
  soc: number;
  soh: number;
  temp: number;
  alarms: Alarm[];
}

/**
 * TelemetrySimulatorControls — Start/Stop telemetry simulation with configurable scenarios.
 * Generates TelemetryReading data per scenario parameters on a 2s interval.
 *
 * Validates: Requirements FR-DI-006, FR-DI-014
 */
export function TelemetrySimulatorControls({ assetId, className }: TelemetrySimulatorControlsProps) {
  const simulatorState = useAppStore((s) => s.simulatorStates[assetId]);
  const startSimulator = useAppStore((s) => s.startSimulator);
  const stopSimulator = useAppStore((s) => s.stopSimulator);
  const changeScenario = useAppStore((s) => s.changeScenario);
  const resetSimulator = useAppStore((s) => s.resetSimulator);

  const isRunning = simulatorState?.isRunning ?? false;
  const currentScenario = simulatorState?.scenario ?? 'normal';
  const tickCount = simulatorState?.tickCount ?? 0;
  const lastTick = simulatorState?.lastTick;

  const [currentValues, setCurrentValues] = useState<SimulatedValues>({
    soc: 85,
    soh: 98.5,
    temp: 25,
    alarms: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sohRef = useRef<number>(98.5);

  const getScenarioConfig = useCallback((id: TelemetryScenario) => {
    return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
  }, []);

  const generateReading = useCallback(() => {
    const config = getScenarioConfig(currentScenario);
    const params = config.parameters;

    const soc = randomInRange(params.socRange[0], params.socRange[1]);
    sohRef.current = Math.max(0, sohRef.current - params.sohDecayRate);
    const soh = sohRef.current;
    const avgTemp = randomInRange(params.tempRange[0], params.tempRange[1]);
    const tempVariation = randomInRange(1, 4);

    // Generate alarms based on probability
    const alarms: Alarm[] = [];
    if (Math.random() < params.alarmProbability) {
      const alarm = generateAlarm(currentScenario);
      if (alarm) alarms.push(alarm);
    }
    // Occasionally generate a second alarm in critical scenario
    if (currentScenario === 'critical' && Math.random() < params.alarmProbability * 0.5) {
      const alarm = generateAlarm(currentScenario);
      if (alarm) alarms.push(alarm);
    }

    const connectivityStatus = Math.random() < params.connectivityLossProbability ? 'offline' : 'online';

    const reading: TelemetryReading = {
      assetId,
      timestamp: new Date().toISOString(),
      socPct: Math.round(soc * 10) / 10,
      sohPct: Math.round(soh * 100) / 100,
      equivalentFullCycles: tickCount + 1200,
      energyChargedKWh: randomInRange(20, 60),
      energyDischargedKWh: randomInRange(18, 55),
      avgModuleTempC: Math.round(avgTemp * 10) / 10,
      maxModuleTempC: Math.round((avgTemp + tempVariation) * 10) / 10,
      minModuleTempC: Math.round((avgTemp - tempVariation) * 10) / 10,
      thermalGradientC: Math.round(tempVariation * 2 * 10) / 10,
      rollingRoundTripEfficiencyPct: currentScenario === 'degradation' ? randomInRange(82, 90) : randomInRange(90, 97),
      availabilityPct: connectivityStatus === 'online' ? randomInRange(95, 99.9) : randomInRange(70, 85),
      activeAlarms: alarms,
      connectivityStatus: connectivityStatus as 'online' | 'offline' | 'pending',
    };

    // Update local values display
    setCurrentValues({
      soc: reading.socPct,
      soh: reading.sohPct,
      temp: reading.avgModuleTempC,
      alarms: alarms,
    });

    // Push to telemetry store
    useAppStore.setState((state) => {
      if (!state.readings[assetId]) {
        state.readings[assetId] = [];
      }
      state.readings[assetId].push(reading);
      // Keep only last 200 readings in memory
      if (state.readings[assetId].length > 200) {
        state.readings[assetId] = state.readings[assetId].slice(-200);
      }
      // Update simulator state
      if (state.simulatorStates[assetId]) {
        state.simulatorStates[assetId].tickCount += 1;
        state.simulatorStates[assetId].lastTick = reading.timestamp;
      }
    });
  }, [assetId, currentScenario, getScenarioConfig, tickCount]);

  // Manage interval lifecycle
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(generateReading, 2000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, generateReading]);

  const handleStartStop = () => {
    if (isRunning) {
      stopSimulator(assetId);
    } else {
      startSimulator(assetId, currentScenario);
    }
  };

  const handleScenarioChange = (scenario: TelemetryScenario) => {
    if (isRunning) {
      changeScenario(assetId, scenario);
    } else {
      // Store scenario for when we start
      startSimulator(assetId, scenario);
      stopSimulator(assetId);
    }
  };

  const handleReset = () => {
    stopSimulator(assetId);
    resetSimulator(assetId);
    sohRef.current = 98.5;
    setCurrentValues({ soc: 85, soh: 98.5, temp: 25, alarms: [] });
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={cn('space-y-5', className)}>
      {/* Top row: Start/Stop, tick counter, last tick */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={handleStartStop}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
            isRunning
              ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          )}
          aria-label={isRunning ? 'Stop simulator' : 'Start simulator'}
        >
          {isRunning ? (
            <>
              <Square className="h-4 w-4" aria-hidden="true" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4" aria-hidden="true" />
              Start
            </>
          )}
        </button>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Activity className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
          <span className="font-mono">{tickCount}</span>
          <span className="text-text-tertiary">ticks</span>
        </div>

        {lastTick && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
            <span className="font-mono text-xs">{formatTimestamp(lastTick)}</span>
          </div>
        )}

        {isRunning && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </span>
        )}
      </div>

      {/* Scenario selector cards */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Scenario</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SCENARIOS.map((scenario) => {
            const isActive = currentScenario === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioChange(scenario.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  isActive
                    ? 'bg-background-elevated shadow-lg'
                    : 'bg-background-secondary border-border-default hover:border-border-emphasis hover:bg-background-elevated/50'
                )}
                style={{
                  borderColor: isActive ? scenario.color : undefined,
                  boxShadow: isActive ? `0 0 12px ${scenario.color}33` : undefined,
                }}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-text-primary">{scenario.label}</span>
                </div>
                <p className="text-xs text-text-tertiary leading-relaxed">{scenario.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current values mini cards */}
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Current Values</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniValueCard
            icon={Battery}
            label="SoC"
            value={`${currentValues.soc.toFixed(1)}%`}
            color="cyan"
          />
          <MiniValueCard
            icon={Activity}
            label="SoH"
            value={`${currentValues.soh.toFixed(2)}%`}
            color="emerald"
          />
          <MiniValueCard
            icon={Thermometer}
            label="Temperature"
            value={`${currentValues.temp.toFixed(1)}°C`}
            color="amber"
          />
          <MiniValueCard
            icon={ShieldAlert}
            label="Active Alarms"
            value={`${currentValues.alarms.length}`}
            color={currentValues.alarms.length > 0 ? 'red' : 'emerald'}
          />
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:text-text-primary transition-colors text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset to Healthy
        </button>
      </div>

      {/* Source indicator */}
      <p className="text-xs text-text-tertiary">
        Source: <span className="text-accent-cyan">Telemetry Simulator</span>
      </p>
    </div>
  );
}

// ============================================================
// MINI VALUE CARD
// ============================================================

interface MiniValueCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: 'cyan' | 'emerald' | 'amber' | 'red';
}

const miniCardColors = {
  cyan: { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
  emerald: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', border: 'border-accent-emerald/20' },
  amber: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-amber-400/20' },
  red: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/20' },
} as const;

function MiniValueCard({ icon: Icon, label, value, color }: MiniValueCardProps) {
  const colors = miniCardColors[color];
  return (
    <div className={cn('p-3 rounded-lg border', colors.border, colors.bg)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn('h-3.5 w-3.5', colors.text)} aria-hidden="true" />
        <span className="text-xs text-text-tertiary">{label}</span>
      </div>
      <span className={cn('text-lg font-semibold font-mono', colors.text)}>{value}</span>
    </div>
  );
}

export default TelemetrySimulatorControls;
