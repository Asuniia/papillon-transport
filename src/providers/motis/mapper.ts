import { TransportError } from '../../errors/TransportError';
import type { Coordinates, Itinerary, Leg, Line, Place, TransitLeg, WalkLeg } from '../../model';
import { finiteNumber, isRecord, optionalString, type UnknownRecord } from '../../utils/guards';
import { decodePolyline } from '../../utils/polyline';
import { parseIsoDate, secondsBetween } from '../../utils/time';
import { toTransitMode } from './modes';

export interface MapOptions {
  arriveBy: boolean;
  maxItineraries: number;
}

const STREET_MODES: ReadonlySet<string> = new Set([
  'BIKE',
  'RENTAL',
  'CAR',
  'HGV',
  'CAR_PARKING',
  'CAR_DROPOFF',
  'FLEX',
]);

const COLOR_PATTERN = /^#?([0-9a-fA-F]{6})$/;

export function mapPlanResponse(raw: unknown, options: MapOptions): Itinerary[] {
  if (!isRecord(raw) || !Array.isArray(raw.itineraries)) {
    throw new TransportError('INVALID_RESPONSE', 'MOTIS response has no itineraries array');
  }
  const candidates: unknown[] = [
    ...(raw.itineraries as unknown[]),
    ...(Array.isArray(raw.direct) ? (raw.direct as unknown[]) : []),
  ];

  const itineraries: Itinerary[] = [];
  for (const candidate of candidates) {
    const itinerary = mapItinerary(candidate);
    if (itinerary) {
      itineraries.push(itinerary);
    }
  }

  itineraries.sort(
    (a, b) => a.departure.getTime() - b.departure.getTime() || a.arrival.getTime() - b.arrival.getTime(),
  );

  return options.arriveBy ? itineraries.slice(-options.maxItineraries) : itineraries.slice(0, options.maxItineraries);
}

export function mapItinerary(raw: unknown): Itinerary | undefined {
  if (!isRecord(raw) || !Array.isArray(raw.legs) || raw.legs.length === 0) {
    return undefined;
  }
  const departure = parseIsoDate(raw.startTime);
  const arrival = parseIsoDate(raw.endTime);
  if (!departure || !arrival) {
    return undefined;
  }

  const legs: Leg[] = [];
  for (const rawLeg of raw.legs as unknown[]) {
    const leg = mapLeg(rawLeg);
    if (!leg) {
      return undefined;
    }
    legs.push(leg);
  }

  const transitLegs = legs.filter((leg): leg is TransitLeg => leg.type === 'transit');
  const transfers = finiteNumber(raw.transfers);

  return {
    id: optionalString(raw.id) ?? `generated:${departure.toISOString()}:${arrival.toISOString()}`,
    departure,
    arrival,
    durationSeconds: finiteNumber(raw.duration) ?? secondsBetween(departure, arrival),
    transfers: transfers !== undefined && transfers >= 0 ? transfers : Math.max(0, transitLegs.length - 1),
    walkingSeconds: legs.filter((leg) => leg.type === 'walk').reduce((total, leg) => total + leg.durationSeconds, 0),
    realtime: transitLegs.some((leg) => leg.realtime),
    cancelled: transitLegs.some((leg) => leg.cancelled),
    legs,
  };
}

function mapLeg(raw: unknown): Leg | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  const mode = optionalString(raw.mode);
  if (!mode || STREET_MODES.has(mode)) {
    return undefined;
  }
  const departure = parseIsoDate(raw.startTime);
  const arrival = parseIsoDate(raw.endTime);
  const from = mapPlace(raw.from);
  const to = mapPlace(raw.to);
  if (!departure || !arrival || !from || !to) {
    return undefined;
  }

  const base = {
    from,
    to,
    departure,
    arrival,
    scheduledDeparture: parseIsoDate(raw.scheduledStartTime) ?? departure,
    scheduledArrival: parseIsoDate(raw.scheduledEndTime) ?? arrival,
    durationSeconds: finiteNumber(raw.duration) ?? secondsBetween(departure, arrival),
    geometry: mapGeometry(raw.legGeometry),
  };

  if (mode === 'WALK') {
    const walk: WalkLeg = { type: 'walk', ...base };
    return walk;
  }

  const transit: TransitLeg = {
    type: 'transit',
    ...base,
    line: mapLine(raw, mode),
    headsign: optionalString(raw.headsign),
    realtime: raw.realTime === true,
    cancelled: raw.cancelled === true,
    intermediateStopCount: Array.isArray(raw.intermediateStops) ? raw.intermediateStops.length : 0,
  };
  return transit;
}

function mapGeometry(raw: unknown): Coordinates[] | undefined {
  if (!isRecord(raw) || typeof raw.points !== 'string') {
    return undefined;
  }
  const precision = finiteNumber(raw.precision);
  return precision === undefined ? undefined : decodePolyline(raw.points, precision);
}

function mapPlace(raw: unknown): Place | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  const lat = finiteNumber(raw.lat);
  const lon = finiteNumber(raw.lon);
  if (lat === undefined || lon === undefined) {
    return undefined;
  }
  const coordinates = { lat, lon };
  const name = optionalString(raw.name);
  if (name === 'START') {
    return { kind: 'origin', coordinates };
  }
  if (name === 'END') {
    return { kind: 'destination', coordinates };
  }
  return { kind: 'stop', name, stopId: optionalString(raw.stopId), coordinates };
}

function mapLine(raw: UnknownRecord, mode: string): Line {
  const agencyName = optionalString(raw.agencyName);
  return {
    id: optionalString(raw.routeId),
    shortName: optionalString(raw.routeShortName) ?? optionalString(raw.displayName),
    longName: optionalString(raw.routeLongName),
    mode: toTransitMode(mode),
    color: normalizeColor(raw.routeColor),
    textColor: normalizeColor(raw.routeTextColor),
    agency: agencyName ? { name: agencyName, url: optionalString(raw.agencyUrl) } : undefined,
  };
}

function normalizeColor(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const match = COLOR_PATTERN.exec(value);
  return match?.[1] ? `#${match[1].toUpperCase()}` : undefined;
}
