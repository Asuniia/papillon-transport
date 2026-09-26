import type { PlanQuery, PlanResult } from '../model';
import { MotisProvider } from '../providers/motis/MotisProvider';
import type { Provider } from '../providers/Provider';
import { type ClientConfig, resolveConfig } from './config';
import { validatePlanQuery } from './validateQuery';

export interface TransportClient {
  plan(query: PlanQuery): Promise<PlanResult>;
}

export function createTransportClient(config: ClientConfig): TransportClient {
  const provider: Provider = new MotisProvider(resolveConfig(config));
  return {
    plan: async (query) => provider.plan(validatePlanQuery(query)),
  };
}
