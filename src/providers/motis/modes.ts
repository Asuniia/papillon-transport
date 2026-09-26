import type { TransitMode } from '../../model';

const MODE_MAP: ReadonlyMap<string, TransitMode> = new Map(
  Object.entries({
    BUS: 'bus',
    COACH: 'coach',
    TRAM: 'tram',
    SUBWAY: 'metro',
    METRO: 'metro',
    SUBURBAN: 'suburban',
    RAIL: 'rail',
    REGIONAL_RAIL: 'rail',
    REGIONAL_FAST_RAIL: 'rail',
    HIGHSPEED_RAIL: 'rail',
    LONG_DISTANCE: 'rail',
    NIGHT_RAIL: 'rail',
    FERRY: 'ferry',
    FUNICULAR: 'cable',
    AERIAL_LIFT: 'cable',
    AREAL_LIFT: 'cable',
    CABLE_CAR: 'cable',
  } satisfies Record<string, TransitMode>),
);

export function toTransitMode(motisMode: string): TransitMode {
  return MODE_MAP.get(motisMode) ?? 'other';
}
