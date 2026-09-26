export interface Coordinates {
  lat: number;
  lon: number;
}

export type PlaceKind = 'origin' | 'destination' | 'stop';

export interface Place {
  kind: PlaceKind;
  name?: string;
  stopId?: string;
  coordinates: Coordinates;
}
