import type { Coordinates } from '../model';

const MAX_PRECISION = 10;

export function decodePolyline(encoded: string, precision: number): Coordinates[] | undefined {
  if (
    typeof encoded !== 'string' ||
    encoded === '' ||
    !Number.isInteger(precision) ||
    precision < 0 ||
    precision > MAX_PRECISION
  ) {
    return undefined;
  }

  const factor = 10 ** precision;
  const points: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  const readValue = (): number | undefined => {
    let result = 0;
    let multiplier = 1;
    let chunk: number;
    do {
      if (index >= encoded.length || multiplier > 2 ** 50) {
        return undefined;
      }
      chunk = encoded.charCodeAt(index++) - 63;
      if (chunk < 0 || chunk > 63) {
        return undefined;
      }
      result += (chunk % 32) * multiplier;
      multiplier *= 32;
    } while (chunk >= 32);
    return result % 2 === 1 ? -(result + 1) / 2 : result / 2;
  };

  while (index < encoded.length) {
    const deltaLat = readValue();
    if (deltaLat === undefined) {
      return undefined;
    }
    const deltaLon = readValue();
    if (deltaLon === undefined) {
      return undefined;
    }
    lat += deltaLat;
    lon += deltaLon;
    points.push({ lat: lat / factor, lon: lon / factor });
  }

  return points;
}
