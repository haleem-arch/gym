// ============================================================
// SIMULATION ENGINE — The core deterministic state machine
// ============================================================

import {
  Agent, AgentState, DataWell, Hub, QuantumFissure,
  SimulationState, SimulationConfig, MacroMetrics,
  SystemLog, Vec2
} from './types';
import { vec, clamp, lerpNum, randomBetween, generateId, formatTime } from './vecMath';

// ─── Constants ──────────────────────────────────────────────
const AGENT_NAMES = [
  'ALPHA', 'BETA', 'GAMMA', 'DELTA', 'EPSILON', 'ZETA',
  'ETA', 'THETA', 'IOTA', 'KAPPA', 'LAMBDA', 'MU'
];
const AGENT_COLORS = [
  '#00F5D4', '#00F5D4', '#7B2CBF', '#F59E0B',
  '#00F5D4', '#7B2CBF', '#F59E0B', '#00F5D4',
  '#7B2CBF', '#00F5D4', '#F59E0B', '#7B2CBF',
];

const DEFAULT_CONFIG: SimulationConfig = {
  worldWidth: 2000,
  worldHeight: 2000,
  agentCount: 12,
  maxSpeed: 1.8,
  maxForce: 0.08,
  separationRadius: 50,
  communicationRadius: 150,
  tokenDecayRate: 1.5,    // per second
  tokenDecayIdle: 0.3,    // per second
  fissureDecayMultiplier: 5,
};

// ─── Initial State Factory ───────────────────────────────────
function createInitialDataWells(): DataWell[] {
  return [
    { id: 'DW1', pos: { x: 300, y: 300 },   radius: 40, pulsePhase: 0,    energy: 1000, maxEnergy: 1000, rechargeRate: 20 },
    { id: 'DW2', pos: { x: 1700, y: 350 },  radius: 40, pulsePhase: 1.2,  energy: 800,  maxEnergy: 1000, rechargeRate: 15 },
    { id: 'DW3', pos: { x: 1000, y: 1000 }, radius: 50, pulsePhase: 2.4,  energy: 1000, maxEnergy: 1000, rechargeRate: 25 },
    { id: 'DW4', pos: { x: 250, y: 1700 },  radius: 40, pulsePhase: 0.8,  energy: 700,  maxEnergy: 1000, rechargeRate: 18 },
    { id: 'DW5', pos: { x: 1750, y: 1700 }, radius: 40, pulsePhase: 3.6,  energy: 900,  maxEnergy: 1000, rechargeRate: 22 },
  ];
}

function createInitialHubs(): Hub[] {
  return [
    { id: 'HUB1', name: 'HUB_ALPHA', pos: { x: 700,  y: 600 },  radius: 35, dockingCapacity: 4, currentDockedCount: 0 },
    { id: 'HUB2', name: 'HUB_BETA',  pos: { x: 1300, y: 600 },  radius: 35, dockingCapacity: 4, currentDockedCount: 0 },
    { id: 'HUB3', name: 'HUB_GAMMA', pos: { x: 1000, y: 1400 }, radius: 35, dockingCapacity: 4, currentDockedCount: 0 },
  ];
}

function createInitialFissures(): QuantumFissure[] {
  return [
    { id: 'QF1', pos: { x: 500,  y: 1200 }, eventHorizonRadius: 60,  pullRadius: 200, strength: 0.12, phase: 0 },
    { id: 'QF2', pos: { x: 1500, y: 900 },  eventHorizonRadius: 70,  pullRadius: 220, strength: 0.14, phase: 1.5 },
  ];
}

function createInitialAgents(config: SimulationConfig): Agent[] {
  return AGENT_NAMES.map((name, i) => {
    const angle = (i / AGENT_NAMES.length) * Math.PI * 2;
    const radius = 350 + Math.random() * 200;
    const pos: Vec2 = {
      x: config.worldWidth / 2 + Math.cos(angle) * radius,
      y: config.worldHeight / 2 + Math.sin(angle) * radius,
    };
    return {
      id: `AG_${generateId()}`,
      name: `AGENT_${name}`,
      pos,
      vel: vec.random(randomBetween(0.5, 1.5)),
      acc: vec.zero(),
      state: 'Routing' as AgentState,
      tokens: randomBetween(300, 900),
      maxTokens: 1000,
      memoryLogs: [
        { timestamp: 0, message: `Boot sequence complete. Initializing navigation.` },
      ],
      biasResource: randomBetween(0.3, 0.9),
      biasHub: randomBetween(0.2, 0.8),
      biasAvoid: randomBetween(0.4, 1.0),
      biasSwarm: randomBetween(0.1, 0.6),
      color: AGENT_COLORS[i],
      targetId: null,
      stuckTimer: 0,
      trailPositions: [],
      tokenHistory: Array.from({ length: 30 }, (_, k) => randomBetween(400, 900) - k * 2),
    };
  });
}

function createInitialMetrics(): MacroMetrics {
  return {
    totalTokenVelocity: 0,
    crossEntropy: 0.5,
    allocationEfficiency: 75,
    activeAgentCount: 12,
    deadAgentCount: 0,
    stalledAgentCount: 0,
    tokenBurnRateHistory: Array(60).fill(18),
    stateDistribution: {
      Idle: 0, Routing: 12, Harvesting: 0, Stalled: 0, Dead: 0, Docking: 0
    },
  };
}

// ─── The Engine Class ────────────────────────────────────────
export class SimulationEngine {
  state: SimulationState;
  config: SimulationConfig;
  private logIdCounter = 0;
  private tokenVelocityAccum = 0;
  private lastMetricUpdateTime = 0;
  private burnAccum = 0;
  private burnSampleTimer = 0;

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    const agents = createInitialAgents(this.config);
    this.state = {
      agents,
      dataWells: createInitialDataWells(),
      hubs: createInitialHubs(),
      fissures: createInitialFissures(),
      systemLogs: [
        { id: 'init0', timestamp: 0, message: 'SYSTEM ONLINE. Agentic Intelligence Grid initialized.', level: 'success' },
        { id: 'init1', timestamp: 0, message: `${agents.length} autonomous nodes activated. Matrix topology loaded.`, level: 'info' },
        { id: 'init2', timestamp: 0, message: 'Quantum Fissures QF1 and QF2 detected. Proximity warnings active.', level: 'warn' },
      ],
      metrics: createInitialMetrics(),
      camera: { x: 1000, y: 1000, zoom: 0.45, targetX: 1000, targetY: 1000, targetZoom: 0.45 },
      timeScale: 1,
      tick: 0,
      elapsed: 0,
      selectedAgentId: null,
    };
  }

  // ─── Main Update Tick ────────────────────────────────────────
  update(deltaSeconds: number): void {
    const dt = deltaSeconds * this.state.timeScale;
    if (dt <= 0) return;

    this.state.tick++;
    this.state.elapsed += dt;

    // Update environment
    this.updateDataWells(dt);
    this.updateFissures(dt);

    // Reset hub docking counts each frame
    for (const hub of this.state.hubs) {
      hub.currentDockedCount = 0;
    }

    // Update each agent
    for (const agent of this.state.agents) {
      if (agent.state === 'Dead') continue;
      this.updateAgent(agent, dt);
    }

    // Update macro metrics periodically
    this.burnAccum += this.calculateInstantBurnRate();
    this.burnSampleTimer += dt;
    if (this.burnSampleTimer >= 0.5) {
      const avgBurn = this.burnAccum / (this.burnSampleTimer / deltaSeconds);
      this.updateMetrics(avgBurn);
      this.burnAccum = 0;
      this.burnSampleTimer = 0;
    }

    // Smooth camera interpolation
    this.updateCamera(deltaSeconds);
  }

  // ─── Environment Updates ─────────────────────────────────────
  private updateDataWells(dt: number): void {
    for (const well of this.state.dataWells) {
      well.pulsePhase += dt * 1.5;
      if (well.energy < well.maxEnergy) {
        well.energy = Math.min(well.maxEnergy, well.energy + well.rechargeRate * dt);
      }
    }
  }

  private updateFissures(dt: number): void {
    for (const f of this.state.fissures) {
      f.phase += dt * 0.8;
    }
  }

  // ─── Agent AI Brain ──────────────────────────────────────────
  private updateAgent(agent: Agent, dt: number): void {
    agent.acc = vec.zero();

    // Determine best target
    const closestWell = this.findClosestDataWell(agent);
    const closestHub = this.findClosestHub(agent);
    const closestFissure = this.findClosestFissure(agent);

    // --- State machine transitions ---
    if (agent.tokens <= 0) {
      if (agent.state !== 'Dead') {
        agent.state = 'Dead';
        this.addLog(`[${this.getTimeString()}] ${agent.name} has expired. Token budget exhausted. Node decommissioned.`, 'error');
        agent.vel = vec.zero();
        agent.trailPositions = [];
      }
      return;
    }

    // Force routing to hub if critically low on tokens
    if (agent.tokens < 150 && agent.state !== 'Docking' && agent.state !== 'Dead') {
      agent.state = 'Routing';
      agent.targetId = closestHub?.id ?? null;
    }

    // Check for docking at hub
    let isDockingAtHub = false;
    if (closestHub && vec.dist(agent.pos, closestHub.pos) < closestHub.radius + 20) {
      if (closestHub.currentDockedCount < closestHub.dockingCapacity) {
        closestHub.currentDockedCount++;
        isDockingAtHub = true;

        if (agent.state !== 'Docking') {
          agent.state = 'Docking';
          this.addLog(`[${this.getTimeString()}] ${agent.name} docked at ${closestHub.name}. Data offload initiated.`, 'success');
          agent.targetId = null;
        }

        // Replenish tokens at hub
        const replenish = Math.min(50 * dt, agent.maxTokens - agent.tokens);
        agent.tokens += replenish;
        this.tokenVelocityAccum += replenish;

        if (agent.tokens >= agent.maxTokens * 0.9) {
          agent.state = 'Routing';
          this.addLog(`[${this.getTimeString()}] ${agent.name} departed ${closestHub.name}. Budget: ${Math.floor(agent.tokens)} tokens.`, 'info');
          agent.targetId = null;
        }
      }
    }

    // Check for harvesting at data well
    let isHarvesting = false;
    if (!isDockingAtHub && closestWell && vec.dist(agent.pos, closestWell.pos) < closestWell.radius + 15) {
      if (closestWell.energy > 0 && agent.tokens < agent.maxTokens * 0.85) {
        isHarvesting = true;
        const harvestAmount = Math.min(40 * dt, closestWell.energy, agent.maxTokens - agent.tokens);
        closestWell.energy -= harvestAmount;
        agent.tokens += harvestAmount * 0.5; // harvesting gives back some tokens
        this.tokenVelocityAccum += harvestAmount * 0.5;

        if (agent.state !== 'Harvesting') {
          agent.state = 'Harvesting';
          this.addLog(`[${this.getTimeString()}] ${agent.name} acquiring data from ${closestWell.id}. Harvesting high-density packet.`, 'info');
        }
      }
    }

    // Set state if no special action
    if (!isDockingAtHub && !isHarvesting && agent.state !== 'Routing') {
      agent.state = agent.tokens < 200 ? 'Routing' : 'Routing';
    }

    // ─── Steering forces ─────────────────────────────────────
    let steerTarget: Vec2 | null = null;

    // Decide what to target
    if (agent.tokens < 300 && closestHub) {
      steerTarget = closestHub.pos;
    } else if (agent.tokens < agent.maxTokens * 0.8 && closestWell && closestWell.energy > 50) {
      steerTarget = closestWell.pos;
    } else if (closestHub) {
      steerTarget = closestHub.pos;
    }

    // Seek target
    if (steerTarget) {
      const seek = this.seek(agent, steerTarget);
      agent.acc = vec.add(agent.acc, vec.scale(seek, agent.biasHub + agent.biasResource));
    }

    // Fissure avoidance (overrides other forces if close)
    if (closestFissure) {
      const distToFissure = vec.dist(agent.pos, closestFissure.pos);
      if (distToFissure < closestFissure.pullRadius) {
        // Gravitational pull toward fissure
        const pullDir = vec.normalize(vec.sub(closestFissure.pos, agent.pos));
        const pullStrength = closestFissure.strength * (1 - distToFissure / closestFissure.pullRadius);
        const pullForce = vec.scale(pullDir, pullStrength);

        // Avoidance counter-force
        const avoidForce = vec.scale(vec.normalize(vec.sub(agent.pos, closestFissure.pos)), agent.biasAvoid * 0.15);

        // Net: pull wins at close range unless bias is very high
        agent.acc = vec.add(agent.acc, pullForce);
        agent.acc = vec.add(agent.acc, avoidForce);

        // Extra token drain in event horizon
        if (distToFissure < closestFissure.eventHorizonRadius) {
          agent.tokens -= this.config.tokenDecayRate * this.config.fissureDecayMultiplier * dt;
          if (agent.state !== 'Stalled') {
            agent.state = 'Stalled';
            this.addLog(`[${this.getTimeString()}] WARNING: ${agent.name} trapped in fissure ${closestFissure.id} event horizon! Critical token drain.`, 'error');
          }
        }
      }
    }

    // Separation from other agents
    const separation = this.computeSeparation(agent);
    agent.acc = vec.add(agent.acc, vec.scale(separation, 0.6));

    // Flocking cohesion + alignment (based on biasSwarm)
    if (agent.biasSwarm > 0.3) {
      const { cohesion, alignment } = this.computeFlocking(agent);
      agent.acc = vec.add(agent.acc, vec.scale(cohesion, agent.biasSwarm * 0.15));
      agent.acc = vec.add(agent.acc, vec.scale(alignment, agent.biasSwarm * 0.1));
    }

    // Limit acceleration
    agent.acc = vec.limit(agent.acc, this.config.maxForce);

    // Integrate velocity
    agent.vel = vec.add(agent.vel, agent.acc);
    agent.vel = vec.limit(agent.vel, this.config.maxSpeed * (agent.state === 'Docking' ? 0.2 : 1));

    // Integrate position
    const speed = vec.mag(agent.vel);

    if (!isDockingAtHub) {
      agent.pos = vec.add(agent.pos, vec.scale(agent.vel, 60 * dt)); // scale for 60fps-relative movement
    }

    // Boundary bounce
    const margin = 30;
    const { worldWidth: W, worldHeight: H } = this.config;
    if (agent.pos.x < margin) { agent.pos.x = margin; agent.vel.x = Math.abs(agent.vel.x); }
    if (agent.pos.x > W - margin) { agent.pos.x = W - margin; agent.vel.x = -Math.abs(agent.vel.x); }
    if (agent.pos.y < margin) { agent.pos.y = margin; agent.vel.y = Math.abs(agent.vel.y); }
    if (agent.pos.y > H - margin) { agent.pos.y = H - margin; agent.vel.y = -Math.abs(agent.vel.y); }

    // Token decay by movement
    const movementDecay = speed > 0.01
      ? this.config.tokenDecayRate * dt
      : this.config.tokenDecayIdle * dt;
    agent.tokens = Math.max(0, agent.tokens - movementDecay);

    // Trail update
    agent.trailPositions.unshift({ x: agent.pos.x, y: agent.pos.y, age: 0 });
    for (const p of agent.trailPositions) p.age += dt;
    agent.trailPositions = agent.trailPositions.filter(p => p.age < 1.5).slice(0, 60);

    // Token history for sparkline
    agent.tokenHistory.push(agent.tokens);
    if (agent.tokenHistory.length > 60) agent.tokenHistory.shift();

    // Memory log: periodic random events
    if (Math.random() < 0.001 * dt * 60) {
      const eventMessages = [
        `Routing vector recalculated. New heading: ${Math.floor(Math.random() * 360)}°`,
        `Packet integrity check passed. ${Math.floor(Math.random() * 50) + 10}Kb buffer cleared.`,
        `Proximity alert: ${this.state.agents.filter(a => a.id !== agent.id && vec.dist(a.pos, agent.pos) < 150 && a.state !== 'Dead').length} nodes in communication range.`,
        `Energy reserve at ${Math.floor(agent.tokens / agent.maxTokens * 100)}%. Continuing mission.`,
        `Cognitive bias updated: resource=${agent.biasResource.toFixed(2)}, hub=${agent.biasHub.toFixed(2)}.`,
      ];
      const msg = eventMessages[Math.floor(Math.random() * eventMessages.length)];
      agent.memoryLogs.unshift({ timestamp: this.state.elapsed, message: msg });
      if (agent.memoryLogs.length > 5) agent.memoryLogs.pop();
    }
  }

  // ─── Steering Behaviors ──────────────────────────────────────
  private seek(agent: Agent, target: Vec2): Vec2 {
    const desired = vec.sub(target, agent.pos);
    const desired_norm = vec.setMag(desired, this.config.maxSpeed);
    return vec.sub(desired_norm, agent.vel);
  }

  private computeSeparation(agent: Agent): Vec2 {
    let steer = vec.zero();
    let count = 0;
    for (const other of this.state.agents) {
      if (other.id === agent.id || other.state === 'Dead') continue;
      const d = vec.dist(agent.pos, other.pos);
      if (d < this.config.separationRadius && d > 0) {
        const diff = vec.normalize(vec.sub(agent.pos, other.pos));
        steer = vec.add(steer, vec.scale(diff, 1 / d));
        count++;
      }
    }
    if (count > 0) {
      steer = vec.scale(steer, 1 / count);
      steer = vec.setMag(steer, this.config.maxSpeed);
      steer = vec.sub(steer, agent.vel);
      steer = vec.limit(steer, this.config.maxForce);
    }
    return steer;
  }

  private computeFlocking(agent: Agent): { cohesion: Vec2; alignment: Vec2 } {
    let sumPos = vec.zero();
    let sumVel = vec.zero();
    let count = 0;
    for (const other of this.state.agents) {
      if (other.id === agent.id || other.state === 'Dead') continue;
      const d = vec.dist(agent.pos, other.pos);
      if (d < 200) {
        sumPos = vec.add(sumPos, other.pos);
        sumVel = vec.add(sumVel, other.vel);
        count++;
      }
    }
    if (count === 0) return { cohesion: vec.zero(), alignment: vec.zero() };
    const avgPos = vec.scale(sumPos, 1 / count);
    const avgVel = vec.scale(sumVel, 1 / count);
    const cohesion = this.seek(agent, avgPos);
    const alignment = vec.sub(vec.setMag(avgVel, this.config.maxSpeed), agent.vel);
    return { cohesion, alignment };
  }

  // ─── Target Finding ──────────────────────────────────────────
  private findClosestDataWell(agent: Agent): DataWell | null {
    let closest: DataWell | null = null;
    let minDist = Infinity;
    for (const well of this.state.dataWells) {
      const d = vec.dist(agent.pos, well.pos);
      if (d < minDist) { minDist = d; closest = well; }
    }
    return closest;
  }

  private findClosestHub(agent: Agent): Hub | null {
    let closest: Hub | null = null;
    let minDist = Infinity;
    for (const hub of this.state.hubs) {
      const d = vec.dist(agent.pos, hub.pos);
      if (d < minDist) { minDist = d; closest = hub; }
    }
    return closest;
  }

  private findClosestFissure(agent: Agent): QuantumFissure | null {
    let closest: QuantumFissure | null = null;
    let minDist = Infinity;
    for (const f of this.state.fissures) {
      const d = vec.dist(agent.pos, f.pos);
      if (d < minDist) { minDist = d; closest = f; }
    }
    return closest;
  }

  // ─── Metrics ─────────────────────────────────────────────────
  private calculateInstantBurnRate(): number {
    let total = 0;
    for (const a of this.state.agents) {
      if (a.state === 'Dead') continue;
      total += this.config.tokenDecayRate;
    }
    return total;
  }

  private updateMetrics(avgBurnRate: number): void {
    const { agents } = this.state;
    const { worldWidth: W, worldHeight: H } = this.config;

    // Cross-entropy: measure how uniformly distributed agents are
    const gridSize = 5;
    const cellCounts = Array(gridSize * gridSize).fill(0);
    const liveAgents = agents.filter(a => a.state !== 'Dead');

    for (const a of liveAgents) {
      const cx = Math.min(gridSize - 1, Math.floor((a.pos.x / W) * gridSize));
      const cy = Math.min(gridSize - 1, Math.floor((a.pos.y / H) * gridSize));
      cellCounts[cy * gridSize + cx]++;
    }

    const n = liveAgents.length;
    let entropy = 0;
    const cells = gridSize * gridSize;
    if (n > 0) {
      for (const count of cellCounts) {
        if (count > 0) {
          const p = count / n;
          entropy -= p * Math.log2(p);
        }
      }
      entropy = entropy / Math.log2(cells); // normalize 0–1
    }

    // Efficiency: avg token level across live agents
    const avgTokens = n > 0 ? liveAgents.reduce((s, a) => s + a.tokens, 0) / n : 0;
    const efficiency = (avgTokens / 1000) * 100;

    // State distribution
    const dist: Record<string, number> = { Idle: 0, Routing: 0, Harvesting: 0, Stalled: 0, Dead: 0, Docking: 0 };
    for (const a of agents) { dist[a.state] = (dist[a.state] || 0) + 1; }

    // Token velocity (accumulator)
    const tokenVel = this.tokenVelocityAccum;
    this.tokenVelocityAccum = 0;

    // Update burn rate history
    const newHistory = [...this.state.metrics.tokenBurnRateHistory, avgBurnRate];
    if (newHistory.length > 60) newHistory.shift();

    this.state.metrics = {
      totalTokenVelocity: tokenVel,
      crossEntropy: parseFloat(entropy.toFixed(3)),
      allocationEfficiency: parseFloat(efficiency.toFixed(1)),
      activeAgentCount: n,
      deadAgentCount: dist['Dead'],
      stalledAgentCount: dist['Stalled'],
      tokenBurnRateHistory: newHistory,
      stateDistribution: dist as Record<import('./types').AgentState, number>,
    };
  }

  // ─── Camera ──────────────────────────────────────────────────
  private updateCamera(dt: number): void {
    const cam = this.state.camera;
    cam.x = lerpNum(cam.x, cam.targetX, dt * 5);
    cam.y = lerpNum(cam.y, cam.targetY, dt * 5);
    cam.zoom = lerpNum(cam.zoom, cam.targetZoom, dt * 5);
  }

  public focusAgent(agentId: string): void {
    const agent = this.state.agents.find(a => a.id === agentId);
    if (!agent) return;
    this.state.camera.targetX = agent.pos.x;
    this.state.camera.targetY = agent.pos.y;
    this.state.camera.targetZoom = 1.2;
    this.state.selectedAgentId = agentId;
  }

  public resetCamera(): void {
    this.state.camera.targetX = 1000;
    this.state.camera.targetY = 1000;
    this.state.camera.targetZoom = 0.45;
    this.state.selectedAgentId = null;
  }

  // ─── Command Execution ───────────────────────────────────────
  public executeCommand(cmd: string): string {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0]?.toLowerCase();

    switch (command) {
      case '/kill': {
        const name = parts[1]?.toUpperCase();
        const agent = this.state.agents.find(a => a.name.includes(name || ''));
        if (!agent) return `ERROR: Agent '${name}' not found.`;
        agent.state = 'Dead';
        agent.tokens = 0;
        agent.vel = vec.zero();
        this.addLog(`[${this.getTimeString()}] COMMAND: ${agent.name} forcibly terminated by operator override.`, 'error');
        return `OK: ${agent.name} terminated.`;
      }
      case '/inject-resource': {
        for (const well of this.state.dataWells) {
          well.energy = well.maxEnergy;
        }
        this.addLog(`[${this.getTimeString()}] COMMAND: Emergency resource injection. All Data Wells recharged to maximum capacity.`, 'success');
        return `OK: All Data Wells recharged.`;
      }
      case '/boost-all': {
        for (const agent of this.state.agents) {
          if (agent.state !== 'Dead') {
            agent.tokens = Math.min(agent.maxTokens, agent.tokens + 300);
          }
        }
        this.addLog(`[${this.getTimeString()}] COMMAND: Token boost applied to all active agents. +300 tokens injected.`, 'success');
        return `OK: All active agents boosted by 300 tokens.`;
      }
      case '/spawn': {
        // Track agent count before push (unused but kept for clarity)
        void this.state.agents.length;
        const newAgent: Agent = {
          id: `AG_${generateId()}`,
          name: `AGENT_${generateId()}`,
          pos: { x: 1000 + randomBetween(-100, 100), y: 1000 + randomBetween(-100, 100) },
          vel: vec.random(1),
          acc: vec.zero(),
          state: 'Routing',
          tokens: 800,
          maxTokens: 1000,
          memoryLogs: [{ timestamp: this.state.elapsed, message: 'Emergency spawn. Volatile agent online.' }],
          biasResource: randomBetween(0.5, 1.0),
          biasHub: randomBetween(0.3, 0.8),
          biasAvoid: randomBetween(0.2, 0.6),
          biasSwarm: randomBetween(0.1, 0.5),
          color: '#FF0055',
          targetId: null,
          stuckTimer: 0,
          trailPositions: [],
          tokenHistory: Array(30).fill(800),
        };
        this.state.agents.push(newAgent);
        this.addLog(`[${this.getTimeString()}] COMMAND: Volatile agent ${newAgent.name} spawned at grid center.`, 'warn');
        return `OK: ${newAgent.name} spawned.`;
      }
      case '/shock': {
        const shockPos = { x: randomBetween(400, 1600), y: randomBetween(400, 1600) };
        const newFissure: QuantumFissure = {
          id: `QF_${generateId()}`,
          pos: shockPos,
          eventHorizonRadius: 80,
          pullRadius: 250,
          strength: 0.18,
          phase: 0,
        };
        this.state.fissures.push(newFissure);
        this.addLog(`[${this.getTimeString()}] COMMAND: System shock triggered. New Quantum Fissure materialized at [${Math.floor(shockPos.x)}, ${Math.floor(shockPos.y)}].`, 'error');
        return `OK: New Quantum Fissure created.`;
      }
      case '/timescale': {
        const scale = parseFloat(parts[1]);
        if (isNaN(scale) || scale <= 0) return `ERROR: Invalid timescale. Usage: /timescale <value>`;
        this.state.timeScale = clamp(scale, 0.1, 10);
        return `OK: Timescale set to ${this.state.timeScale}x`;
      }
      case '/revive': {
        const dead = this.state.agents.filter(a => a.state === 'Dead');
        for (const a of dead) {
          a.state = 'Routing';
          a.tokens = 500;
          a.vel = vec.random(1);
          a.trailPositions = [];
        }
        if (dead.length === 0) return `INFO: No dead agents to revive.`;
        this.addLog(`[${this.getTimeString()}] COMMAND: ${dead.length} dead agents revived via emergency reboot protocol.`, 'success');
        return `OK: ${dead.length} agents revived.`;
      }
      case '/help': {
        return [
          '/kill <name>       — Terminate a specific agent',
          '/inject-resource   — Recharge all data wells',
          '/boost-all         — Give all agents +300 tokens',
          '/spawn             — Spawn a volatile agent',
          '/shock             — Create a new Quantum Fissure',
          '/timescale <n>     — Set simulation speed',
          '/revive            — Revive all dead agents',
        ].join('\n');
      }
      default:
        return `ERROR: Unknown command '${command}'. Type /help for command list.`;
    }
  }

  // ─── Utility ─────────────────────────────────────────────────
  private addLog(message: string, level: SystemLog['level']): void {
    this.logIdCounter++;
    const log: SystemLog = {
      id: `log_${this.logIdCounter}`,
      timestamp: this.state.elapsed,
      message,
      level,
    };
    this.state.systemLogs.unshift(log);
    if (this.state.systemLogs.length > 120) {
      this.state.systemLogs = this.state.systemLogs.slice(0, 120);
    }
  }

  private getTimeString(): string {
    return formatTime(this.state.elapsed);
  }

  public getState(): SimulationState {
    return this.state;
  }

  public setTimeScale(scale: number): void {
    this.state.timeScale = clamp(scale, 0.1, 10);
  }

  public triggerSystemShock(): void {
    this.executeCommand('/shock');
  }

  public spawnVolatileAgent(): void {
    this.executeCommand('/spawn');
  }
}
