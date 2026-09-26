import type { Settings } from '../../client/config';
import { getJson } from '../../client/http';
import type { Attribution, NormalizedPlanQuery, PlanResult } from '../../model';
import type { Provider } from '../Provider';
import { mapPlanResponse } from './mapper';
import { buildPlanUrl } from './query';

export function transitousAttribution(): Attribution[] {
  return [
    { text: 'Transitous', url: 'https://transitous.org/sources/' },
    { text: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' },
  ];
}

export class MotisProvider implements Provider {
  constructor(private readonly config: Settings) {}

  async plan(query: NormalizedPlanQuery): Promise<PlanResult> {
    const raw = await getJson({
      url: buildPlanUrl(this.config.baseUrl, query),
      userAgent: this.config.userAgent,
      referer: this.config.referer,
      timeoutMs: this.config.timeoutMs,
      signal: query.signal,
      fetch: this.config.fetch,
    });
    return {
      itineraries: mapPlanResponse(raw, {
        arriveBy: query.arriveBy,
        maxItineraries: query.maxItineraries,
      }),
      attribution: transitousAttribution(),
    };
  }
}
