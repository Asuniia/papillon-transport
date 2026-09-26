export function parseIsoDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || value === '') {
    return undefined;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function secondsBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 1000);
}
