import type { Line } from './line';
import type { Coordinates, Place } from './place';

export interface BaseLeg {
  from: Place;
  to: Place;
  departure: Date;
  arrival: Date;
  scheduledDeparture: Date;
  scheduledArrival: Date;
  durationSeconds: number;
  geometry?: Coordinates[];
}

export interface WalkLeg extends BaseLeg {
  type: 'walk';
}

export interface TransitLeg extends BaseLeg {
  type: 'transit';
  line: Line;
  headsign?: string;
  realtime: boolean;
  cancelled: boolean;
  intermediateStopCount: number;
}

export type Leg = WalkLeg | TransitLeg;
