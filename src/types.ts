export type Direction = 'UP' | 'DOWN' | 'SKIP';
export type InputMode = 'visual' | 'python';
export type SkillState = 'pass' | 'warn' | 'fail';

export interface EvaluationSkill {
  id: string;
  label: string;
  detail: string;
  state: SkillState;
  evidence: string;
  method: string;
}

export interface CustomIndicator {
  id: string;
  name: string;
  formula: string;
  period: number;
  unit: 'number' | 'percent' | 'probability' | 'boolean';
}

export interface StrategyCondition {
  left: string;
  op: string;
  right: number;
}

export interface StrategyIR {
  version: string;
  name: string;
  universe: { underlying: string; contract_window: string };
  input_mode: InputMode;
  custom_indicators: CustomIndicator[];
  features: Array<{ id: string; type: string; period: number }>;
  decision: { when: { all: StrategyCondition[] }; action: Direction };
  risk: { stake_usdso: number; max_consecutive_losses: number };
  execution: { data_tier: 'RECONSTRUCTED'; fee_bps: number; latency_ms: number };
}
