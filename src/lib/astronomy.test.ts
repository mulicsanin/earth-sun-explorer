import { describe, expect, it } from 'vitest';
import { computeSolarSnapshot, computeSubsolarPoint, SARAJEVO_LOCATION } from './astronomy';
import { vectorLength } from './geo';

describe('astronomy helpers', () => {
  it('returns a daylight Sun position for Sarajevo near the June solstice midday', () => {
    const snapshot = computeSolarSnapshot(SARAJEVO_LOCATION, new Date('2026-06-21T11:00:00.000Z'));

    expect(snapshot.daylight).toBe(true);
    expect(snapshot.altitude).toBeGreaterThan(60);
    expect(snapshot.azimuth).toBeGreaterThanOrEqual(0);
    expect(snapshot.azimuth).toBeLessThan(360);
  });

  it('keeps the subsolar latitude near the Tropic of Capricorn in December', () => {
    const subsolar = computeSubsolarPoint(new Date('2026-12-21T12:00:00.000Z'));

    expect(subsolar.latitude).toBeLessThan(-22);
    expect(subsolar.latitude).toBeGreaterThan(-24.5);
  });

  it('normalizes the Sun render vector', () => {
    const snapshot = computeSolarSnapshot(SARAJEVO_LOCATION, new Date('2026-03-20T12:00:00.000Z'));

    expect(vectorLength(snapshot.sunVector)).toBeCloseTo(1, 5);
  });
});
