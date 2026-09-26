import type { Coordinates, NormalizedPlanQuery } from '../../model';

const PLAN_PATH = '/api/v6/plan';

export function buildPlanUrl(baseUrl: string, query: NormalizedPlanQuery): string {
  const params: ReadonlyArray<readonly [string, string]> = [
    ['fromPlace', formatPlace(query.from)],
    ['toPlace', formatPlace(query.to)],
    ['time', query.time.toISOString()],
    ['arriveBy', String(query.arriveBy)],
    ['directModes', 'WALK'],
    ['preTransitModes', 'WALK'],
    ['postTransitModes', 'WALK'],
    ['detailedLegs', String(query.includeGeometry)],
  ];
  const search = params.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return `${baseUrl}${PLAN_PATH}?${search}`;
}

function formatPlace({ lat, lon }: Coordinates): string {
  return `${lat.toFixed(6)},${lon.toFixed(6)}`;
}
