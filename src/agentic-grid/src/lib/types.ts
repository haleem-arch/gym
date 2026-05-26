// ============================================================
// CORE TYPE DEFINITIONS
// ============================================================

export type AgentState = 'Idle' | 'Routing' | 'Harvesting' | 'Stalled' | 'Dead' | 'Docking';

export interface Vec2 {
  x: number;
  y: number;
}

export interface MemoryLog {
  timestamp: number;
  message: string;
}

export interface Agent {
  id: string;
  name: string;
  pos: Vec2;
  vel: Vec2;
  acc: Vec2;
  state: AgentState;
  tokens: number;
  maxTokens: number;
  memoryLogs: MemoryLog[];
  // Cognitive biases: 0–1 for each
  biasResource: number;   // how strongly it seeks data wells
  biasHub: number;        // how strongly it seeks hubs
  biasAvoid: number;      // how strongly it avoids fissures
  biasSwarm: number;      // flocking tendency
  color: string;
  targetId: string | null;
  stuckTimer: number;
  trailPositions: Array<{ x: number; y: number; age: number }>;
  tokenHistory: number[]; // last N token values for graph
}

export interface DataWell {
  id: string;
  pos: Vec2;
  radius: number;
  pulsePhase: number;
  energy: number;       // 0–1000
  maxEnergy: number;
  rechargeRate: number; // energy per second
}

export interface Hub {
  id: string;
  name: string;
  pos: Vec2;
  radius: number;
  dockingCapacity: number;
  currentDockedCount: number;
}

export interface QuantumFissure {
  id: string;
  pos: Vec2;
  eventHorizonRadius: number;
  pullRadius: number;
  strength: number;   // gravitational constant
  phase: number;      // for animation
}

export interface SystemLog {
  id: string;
  timestamp: number;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface MacroMetrics {
  totalTokenVelocity: number;    // tokens exchanged per second across grid
  crossEntropy: number;          // 0–1 disorder metric
  allocationEfficiency: number;  // 0–100%
  activeAgentCount: number;
  deadAgentCount: number;
  stalledAgentCount: number;
  tokenBurnRateHistory: number[]; // rolling window for chart
  stateDistribution: Record<AgentState, number>;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetX: number;
  targetY: number;
  targetZoom: number;
}

export interface SimulationState {
  agents: Agent[];
  dataWells: DataWell[];
  hubs: Hub[];
  fissures: QuantumFissure[];
  systemLogs: SystemLog[];
  metrics: MacroMetrics;
  camera: CameraState;
  timeScale: number;
  tick: number;
  elapsed: number; // seconds
  selectedAgentId: string | null;
}

export interface SimulationConfig {
  worldWidth: number;
  worldHeight: number;
  agentCount: number;
  maxSpeed: number;
  maxForce: number;
  separationRadius: number;
  communicationRadius: number;
  tokenDecayRate: number;      // tokens per second while moving
  tokenDecayIdle: number;      // tokens per second while idle
  fissureDecayMultiplier: number;
}
