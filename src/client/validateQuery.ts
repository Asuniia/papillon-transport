import { TransportError } from '../errors/TransportError';
import type { Coordinates, NormalizedPlanQuery, PlanQuery } from '../model';

export const DEFAULT_MAX_ITINERARIES = 5;
export const MAX_ITINERARIES_LIMIT = 10;

export function validatePlanQuery(query: PlanQuery): NormalizedPlanQuery {
  if (typeof query !== 'object' || query === null) {
    throw invalidQuery('query must be an object');
  }

  const from = validateCoordinates(query.from, 'from');
  const to = validateCoordinates(query.to, 'to');

  if (!(query.time instanceof Date) || Number.isNaN(query.time.getTime())) {
    throw invalidQuery('time must be a valid Date');
  }

  if (query.arriveBy !== undefined && typeof query.arriveBy !== 'boolean') {
    throw invalidQuery('arriveBy must be a boolean');
  }

  if (query.includeGeometry !== undefined && typeof query.includeGeometry !== 'boolean') {
    throw invalidQuery('includeGeometry must be a boolean');
  }

  const maxItineraries = query.maxItineraries ?? DEFAULT_MAX_ITINERARIES;
  if (!Number.isInteger(maxItineraries) || maxItineraries < 1 || maxItineraries > MAX_ITINERARIES_LIMIT) {
    throw invalidQuery(`maxItineraries must be an integer between 1 and ${MAX_ITINERARIES_LIMIT}`);
  }

  return {
    from,
    to,
    time: new Date(query.time.getTime()),
    arriveBy: query.arriveBy ?? false,
    maxItineraries,
    includeGeometry: query.includeGeometry ?? false,
    signal: query.signal,
  };
}

function validateCoordinates(value: unknown, field: string): Coordinates {
  if (typeof value !== 'object' || value === null) {
    throw invalidQuery(`${field} must be an object { lat, lon }`);
  }
  const { lat, lon } = value as { lat?: unknown; lon?: unknown };
  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw invalidQuery(`${field}.lat must be a finite number between -90 and 90`);
  }
  if (typeof lon !== 'number' || !Number.isFinite(lon) || lon < -180 || lon > 180) {
    throw invalidQuery(`${field}.lon must be a finite number between -180 and 180`);
  }
  return { lat, lon };
}

function invalidQuery(message: string): TransportError {
  return new TransportError('INVALID_QUERY', message);
}
