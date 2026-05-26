'use client';

import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { SimulationEngine } from '@/lib/SimulationEngine';
import { SimulationState } from '@/lib/types';

interface SimContextValue {
  engine: SimulationEngine;
  displayState: SimulationState;
  focusAgent: (id: string) => void;
  resetCamera: () => void;
  executeCommand: (cmd: string) => string;
  setTimeScale: (s: number) => void;
  triggerShock: () => void;
  spawnAgent: () => void;
}

const SimContext = createContext<SimContextValue | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  // Store engine in useState so it is stable and NEVER accessed via .current during render
  const [engine] = useState<SimulationEngine>(() => new SimulationEngine());
  const [displayState, setDisplayState] = useState<SimulationState>(() => engine.getState());
  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const uiUpdateCounterRef = useRef(0);

  useEffect(() => {
    function tick(timestamp: number) {
      const dt = lastTimeRef.current === 0
        ? 1 / 60
        : Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      engine.update(dt);

      // Push state to React only every 6 frames (~10fps) to avoid render bottleneck
      uiUpdateCounterRef.current++;
      if (uiUpdateCounterRef.current >= 6) {
        uiUpdateCounterRef.current = 0;
        setDisplayState({ ...engine.getState() });
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [engine]);

  const focusAgent = useCallback((id: string) => {
    engine.focusAgent(id);
  }, [engine]);

  const resetCamera = useCallback(() => {
    engine.resetCamera();
  }, [engine]);

  const executeCommand = useCallback((cmd: string): string => {
    return engine.executeCommand(cmd);
  }, [engine]);

  const setTimeScale = useCallback((s: number) => {
    engine.setTimeScale(s);
  }, [engine]);

  const triggerShock = useCallback(() => {
    engine.triggerSystemShock();
  }, [engine]);

  const spawnAgent = useCallback(() => {
    engine.spawnVolatileAgent();
  }, [engine]);

  return (
    <SimContext.Provider value={{
      engine,
      displayState,
      focusAgent,
      resetCamera,
      executeCommand,
      setTimeScale,
      triggerShock,
      spawnAgent,
    }}>
      {children}
    </SimContext.Provider>
  );
}

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSim must be used within SimulationProvider');
  return ctx;
}
