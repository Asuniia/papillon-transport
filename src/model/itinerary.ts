import type { Attribution } from './attribution';
import type { Leg } from './leg';

export interface Itinerary {
  id: string;
  departure: Date;
  arrival: Date;
  durationSeconds: number;
  transfers: number;
  walkingSeconds: number;
  realtime: boolean;
  cancelled: boolean;
  legs: Leg[];
}

export interface PlanResult {
  itineraries: Itinerary[];
  attribution: Attribution[];
}
