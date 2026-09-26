export type TransitMode = 'bus' | 'coach' | 'tram' | 'metro' | 'suburban' | 'rail' | 'ferry' | 'cable' | 'other';

export interface Agency {
  name: string;
  url?: string;
}

export interface Line {
  id?: string;
  shortName?: string;
  longName?: string;
  mode: TransitMode;
  color?: string;
  textColor?: string;
  agency?: Agency;
}
