import type { NormalizedPlanQuery, PlanResult } from '../model';

export interface Provider {
  plan(query: NormalizedPlanQuery): Promise<PlanResult>;
}
