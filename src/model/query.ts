import type { Coordinates } from './place';

export interface PlanQuery {
  from: Coordinates;
  to: Coordinates;
  time: Date;
  arriveBy?: boolean;
  maxItineraries?: number;
  includeGeometry?: boolean;
  signal?: AbortSignal;
}

export interface NormalizedPlanQuery {
  from: Coordinates;
  to: Coordinates;
  time: Date;
  arriveBy: boolean;
  maxItineraries: number;
  includeGeometry: boolean;
  signal?: AbortSignal;
}
