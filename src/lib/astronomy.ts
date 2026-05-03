import { Body, Equator, Horizon, Observer, SearchRiseSet } from 'astronomy-engine';
import { geoToVector, normalizeLongitude, normalizeVector } from './geo';
import type { ObserverLocation, SolarSnapshot } from './types';

export const SARAJEVO_LOCATION: ObserverLocation = {
  latitude: 43.8563,
  longitude: 18.4131,
  label: 'Sarajevo, Bosnia and Herzegovina',
  source: 'fallback',
  timezone: 'Europe/Sarajevo'
};

export const PRESET_LOCATIONS: ObserverLocation[] = [
  SARAJEVO_LOCATION,
  {
    latitude: 40.7128,
    longitude: -74.006,
    label: 'New York, United States',
    source: 'preset',
    timezone: 'America/New_York'
  },
  {
    latitude: 35.6762,
    longitude: 139.6503,
    label: 'Tokyo, Japan',
    source: 'preset',
    timezone: 'Asia/Tokyo'
  },
  {
    latitude: -33.8688,
    longitude: 151.2093,
    label: 'Sydney, Australia',
    source: 'preset',
    timezone: 'Australia/Sydney'
  },
  {
    latitude: 64.1466,
    longitude: -21.9426,
    label: 'Reykjavik, Iceland',
    source: 'preset',
    timezone: 'Atlantic/Reykjavik'
  }
];

export function computeSolarSnapshot(location: ObserverLocation, date: Date): SolarSnapshot {
  const observer = new Observer(location.latitude, location.longitude, 0);
  const equatorial = Equator(Body.Sun, date, observer, true, true);
  const horizontal = Horizon(date, observer, equatorial.ra, equatorial.dec, 'normal');
  const subsolar = computeSubsolarPoint(date);
  const sunVector = normalizeVector(geoToVector(subsolar.latitude, subsolar.longitude));

  return {
    altitude: horizontal.altitude,
    azimuth: normalizeAzimuth(horizontal.azimuth),
    declination: equatorial.dec,
    rightAscension: equatorial.ra,
    daylight: horizontal.altitude >= 0,
    daylightLabel: getDaylightLabel(horizontal.altitude),
    subsolarLatitude: subsolar.latitude,
    subsolarLongitude: subsolar.longitude,
    sunVector,
    sunrise: SearchRiseSet(Body.Sun, observer, 1, date, 2)?.date ?? null,
    sunset: SearchRiseSet(Body.Sun, observer, -1, date, 2)?.date ?? null
  };
}

export function computeSubsolarPoint(date: Date): { latitude: number; longitude: number } {
  const dayStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - dayStart) / 86_400_000);
  const utcMinutes =
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60 +
    date.getUTCMilliseconds() / 60_000;
  const gamma = (2 * Math.PI * (dayOfYear - 1 + (utcMinutes / 60 - 12) / 24)) / 365;

  const equationOfTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);

  return {
    latitude: (declination * 180) / Math.PI,
    longitude: normalizeLongitude((720 - utcMinutes - equationOfTime) / 4)
  };
}

function normalizeAzimuth(value: number): number {
  return ((value % 360) + 360) % 360;
}

function getDaylightLabel(altitude: number): string {
  if (altitude >= 6) return 'Daylight';
  if (altitude >= 0) return 'Sun on horizon';
  if (altitude >= -6) return 'Civil twilight';
  if (altitude >= -12) return 'Nautical twilight';
  if (altitude >= -18) return 'Astronomical twilight';
  return 'Night side';
}
