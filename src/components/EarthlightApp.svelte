<script lang="ts">
  import {
    Clock3,
    Crosshair,
    LocateFixed,
    MapPin,
    Pause,
    Play,
    RotateCcw,
    Search,
    SunMedium
  } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import EarthScene from './EarthScene.svelte';
  import { computeSolarSnapshot, PRESET_LOCATIONS, SARAJEVO_LOCATION } from '../lib/astronomy';
  import { clampLatitude, formatCoordinate, normalizeLongitude } from '../lib/geo';
  import {
    formatDateTime,
    formatDegrees,
    formatTime,
    fromDateTimeLocalValue,
    toDateTimeLocalValue
  } from '../lib/format';
  import type { ObserverLocation } from '../lib/types';

  type GeoStatus = 'idle' | 'locating' | 'allowed' | 'denied' | 'unsupported';

  let location: ObserverLocation = { ...SARAJEVO_LOCATION };
  let simulationDate = new Date();
  let mode: 'live' | 'manual' = 'live';
  let playbackSpeed = 0;
  let geolocationStatus: GeoStatus = 'idle';
  let manualLabel = 'Custom observer';
  let manualLatitude = location.latitude.toFixed(4);
  let manualLongitude = location.longitude.toFixed(4);
  let errorMessage = '';
  let showPanel = true;

  $: snapshot = computeSolarSnapshot(location, simulationDate);
  $: localTimeValue = toDateTimeLocalValue(simulationDate);
  $: dayMinute = simulationDate.getHours() * 60 + simulationDate.getMinutes();

  onMount(() => {
    requestBrowserLocation();

    const timer = window.setInterval(() => {
      if (mode === 'live') {
        simulationDate = new Date();
        return;
      }

      if (playbackSpeed > 0) {
        simulationDate = new Date(simulationDate.getTime() + playbackSpeed * 1000);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  });

  function requestBrowserLocation() {
    if (!('geolocation' in navigator)) {
      geolocationStatus = 'unsupported';
      return;
    }

    geolocationStatus = 'locating';
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          label: 'Your current location',
          source: 'browser',
          timezone
        };
        manualLatitude = location.latitude.toFixed(4);
        manualLongitude = location.longitude.toFixed(4);
        geolocationStatus = 'allowed';
        errorMessage = '';
      },
      () => {
        geolocationStatus = 'denied';
        location = { ...SARAJEVO_LOCATION };
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300_000,
        timeout: 10_000
      }
    );
  }

  function setPreset(preset: ObserverLocation) {
    location = { ...preset };
    manualLatitude = location.latitude.toFixed(4);
    manualLongitude = location.longitude.toFixed(4);
    manualLabel = preset.label;
    errorMessage = '';
  }

  function applyManualLocation() {
    const latitude = Number.parseFloat(manualLatitude);
    const longitude = Number.parseFloat(manualLongitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      errorMessage = 'Enter numeric latitude and longitude values.';
      return;
    }

    location = {
      latitude: clampLatitude(latitude),
      longitude: normalizeLongitude(longitude),
      label: manualLabel.trim() || 'Custom observer',
      source: 'manual',
      timezone: 'Manual location'
    };
    manualLatitude = location.latitude.toFixed(4);
    manualLongitude = location.longitude.toFixed(4);
    errorMessage = '';
  }

  function setDateFromInput(value: string) {
    mode = 'manual';
    simulationDate = fromDateTimeLocalValue(value);
  }

  function setDayMinute(value: number) {
    const next = new Date(simulationDate);
    next.setHours(Math.floor(value / 60), value % 60, 0, 0);
    simulationDate = next;
    mode = 'manual';
  }

  function useLiveTime() {
    mode = 'live';
    playbackSpeed = 0;
    simulationDate = new Date();
  }

  function pauseTime() {
    mode = 'manual';
    playbackSpeed = 0;
  }

  function togglePlayback() {
    mode = 'manual';
    playbackSpeed = playbackSpeed > 0 ? 0 : 60;
  }
</script>

<main class="relative min-h-[100dvh] overflow-hidden">
  <EarthScene {location} {snapshot} />

  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,transparent_0,transparent_22rem,rgba(3,5,14,0.46)_74%)]"
  ></div>

  <header class="pointer-events-none absolute left-0 right-0 top-0 z-20 px-4 pt-4 sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-[1500px] items-start justify-between gap-4">
      <div class="glass-panel pointer-events-auto max-w-[34rem] rounded-lg px-4 py-3 sm:px-5">
        <p class="mono mb-2 text-[0.68rem] uppercase tracking-[0.24em] text-emerald-100/70">
          Earth / Sun position
        </p>
        <h1 class="text-3xl font-semibold leading-none tracking-tight text-white sm:text-5xl">
          Earthlight Observatory
        </h1>
        <p class="mt-3 hidden max-w-[38rem] text-sm leading-6 text-slate-200/76 sm:block sm:text-base">
          Explore where sunlight touches Earth right now, or scrub time and location to see the daylight line
          move.
        </p>
      </div>

      <button
        class="glass-panel pointer-events-auto rounded-lg p-3 text-slate-100 transition hover:border-emerald-200/40 hover:text-white active:translate-y-px"
        type="button"
        aria-label={showPanel ? 'Hide control panel' : 'Show control panel'}
        on:click={() => (showPanel = !showPanel)}
      >
        <Crosshair size={20} strokeWidth={1.8} />
      </button>
    </div>
  </header>

  {#if showPanel}
    <section
      class="control-panel absolute bottom-3 left-3 right-3 z-20 grid max-h-[58dvh] min-w-0 gap-3 overflow-y-auto pr-1 sm:bottom-4 sm:left-4 sm:right-4 md:max-h-[62dvh] lg:bottom-6 lg:left-6 lg:right-6 lg:max-h-none lg:grid-cols-[minmax(21rem,25rem)_1fr_minmax(19rem,23rem)] lg:overflow-visible lg:pr-0"
    >
      <div class="glass-panel min-w-0 rounded-lg p-4">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-300/70">Observer</p>
            <h2 class="mt-1 text-lg font-semibold text-white">{location.label}</h2>
          </div>
          <button
            class="min-h-11 min-w-11 rounded-md border border-white/12 bg-white/7 p-2.5 text-emerald-100 transition hover:bg-white/12 active:translate-y-px"
            type="button"
            aria-label="Use browser location"
            on:click={requestBrowserLocation}
          >
            <LocateFixed size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p class="text-slate-400">Latitude</p>
            <p class="mono mt-1 text-white">{formatCoordinate(location.latitude, 'lat')}</p>
          </div>
          <div class="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p class="text-slate-400">Longitude</p>
            <p class="mono mt-1 text-white">{formatCoordinate(location.longitude, 'lon')}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_5.75rem_5.75rem]">
          <label class="col-span-2 grid min-w-0 gap-1 text-xs text-slate-300 sm:col-span-1">
            Label
            <input
              class="min-h-10 w-full min-w-0 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-200/60"
              bind:value={manualLabel}
            />
          </label>
          <label class="grid min-w-0 gap-1 text-xs text-slate-300">
            Lat
            <input
              class="min-h-10 w-full min-w-0 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-200/60"
              bind:value={manualLatitude}
              inputmode="decimal"
            />
          </label>
          <label class="grid min-w-0 gap-1 text-xs text-slate-300">
            Lon
            <input
              class="min-h-10 w-full min-w-0 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-200/60"
              bind:value={manualLongitude}
              inputmode="decimal"
            />
          </label>
        </div>

        <button
          class="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-200 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100 active:translate-y-px"
          type="button"
          on:click={applyManualLocation}
        >
          <Search size={16} strokeWidth={2} />
          Set observer
        </button>

        {#if errorMessage}
          <p class="mt-2 text-sm text-rose-200">{errorMessage}</p>
        {:else}
          <p class="mt-2 text-xs text-slate-400">
            {geolocationStatus === 'locating'
              ? 'Asking browser permission for your location.'
              : geolocationStatus === 'denied'
                ? 'Browser location was denied, using Sarajevo fallback.'
                : 'Manual coordinates stay in the browser only.'}
          </p>
        {/if}

        <div class="mt-4 flex flex-wrap gap-2">
          {#each PRESET_LOCATIONS as preset (preset.label)}
            <button
              class="min-h-10 rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-200 transition hover:border-emerald-200/40 hover:text-white active:translate-y-px"
              type="button"
              on:click={() => setPreset(preset)}
            >
              {preset.label.split(',')[0]}
            </button>
          {/each}
        </div>
      </div>

      <div class="glass-panel min-w-0 rounded-lg p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-300/70">Simulation time</p>
            <h2 class="mt-1 text-lg font-semibold text-white">{formatDateTime(simulationDate)}</h2>
          </div>
          <div class="flex gap-2">
            <button
              class="min-h-11 min-w-11 rounded-md border border-white/10 bg-white/7 p-2.5 text-slate-100 transition hover:bg-white/12 active:translate-y-px"
              type="button"
              aria-label="Use live time"
              on:click={useLiveTime}
            >
              <RotateCcw size={18} strokeWidth={1.8} />
            </button>
            <button
              class="min-h-11 min-w-11 rounded-md border border-white/10 bg-white/7 p-2.5 text-slate-100 transition hover:bg-white/12 active:translate-y-px"
              type="button"
              aria-label={playbackSpeed > 0 ? 'Pause playback' : 'Play time'}
              on:click={togglePlayback}
            >
              {#if playbackSpeed > 0}
                <Pause size={18} strokeWidth={1.8} />
              {:else}
                <Play size={18} strokeWidth={1.8} />
              {/if}
            </button>
          </div>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-[minmax(14rem,1fr)_minmax(12rem,18rem)]">
          <label class="grid gap-2 text-xs text-slate-300">
            Chosen date and time
            <input
              class="min-h-10 w-full min-w-0 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-200/60"
              type="datetime-local"
              value={localTimeValue}
              on:input={(event) => setDateFromInput(event.currentTarget.value)}
            />
          </label>
          <label class="grid gap-2 text-xs text-slate-300">
            Playback speed
            <select
              class="min-h-10 w-full min-w-0 rounded-md border border-white/10 bg-slate-950/55 px-3 py-2.5 text-sm text-white outline-none transition focus:border-emerald-200/60"
              bind:value={playbackSpeed}
              on:change={() => (mode = 'manual')}
            >
              <option value={0}>Paused</option>
              <option value={60}>1 min / sec</option>
              <option value={900}>15 min / sec</option>
              <option value={3600}>1 hour / sec</option>
            </select>
          </label>
        </div>

        <label class="mt-5 block text-xs text-slate-300">
          Time of day
          <input
            class="mt-3 h-2 w-full accent-emerald-200"
            type="range"
            min="0"
            max="1439"
            value={dayMinute}
            on:input={(event) => setDayMinute(Number(event.currentTarget.value))}
          />
        </label>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-emerald-200/40 active:translate-y-px"
            type="button"
            on:click={pauseTime}
          >
            Freeze current view
          </button>
          <span class="rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300">
            Mode: <span class="text-white">{mode === 'live' ? 'live now' : 'chosen time'}</span>
          </span>
        </div>
      </div>

      <aside class="glass-panel min-w-0 rounded-lg p-4">
        <div class="mb-4 flex items-center gap-3">
          <div class="rounded-md border border-emerald-100/20 bg-emerald-100/10 p-2 text-emerald-100">
            <SunMedium size={18} strokeWidth={1.8} />
          </div>
          <div>
            <p class="mono text-[0.68rem] uppercase tracking-[0.22em] text-slate-300/70">Solar readout</p>
            <h2 class="text-lg font-semibold text-white">{snapshot.daylightLabel}</h2>
          </div>
        </div>

        <dl class="grid gap-2 text-sm">
          <div class="flex items-center justify-between gap-3 border-b border-white/10 py-2">
            <dt class="flex min-w-0 items-center gap-2 text-slate-300"><SunMedium size={15} /> Altitude</dt>
            <dd class="mono shrink-0 text-right text-white">{formatDegrees(snapshot.altitude)}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-white/10 py-2">
            <dt class="flex min-w-0 items-center gap-2 text-slate-300"><Crosshair size={15} /> Azimuth</dt>
            <dd class="mono shrink-0 text-right text-white">{formatDegrees(snapshot.azimuth)}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-white/10 py-2">
            <dt class="flex min-w-0 items-center gap-2 text-slate-300">
              <MapPin size={15} /> Subsolar point
            </dt>
            <dd class="mono shrink-0 text-right text-white">
              {formatCoordinate(snapshot.subsolarLatitude, 'lat')}<br />
              {formatCoordinate(snapshot.subsolarLongitude, 'lon')}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3 border-b border-white/10 py-2">
            <dt class="flex min-w-0 items-center gap-2 text-slate-300"><Clock3 size={15} /> Sunrise</dt>
            <dd class="mono shrink-0 text-right text-white">{formatTime(snapshot.sunrise)}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2">
            <dt class="flex min-w-0 items-center gap-2 text-slate-300"><Clock3 size={15} /> Sunset</dt>
            <dd class="mono shrink-0 text-right text-white">{formatTime(snapshot.sunset)}</dd>
          </div>
        </dl>

        <p class="mt-4 text-xs leading-5 text-slate-400">
          Educational visualization based on astronomy calculations. It is not intended for navigation,
          surveying, or scientific operations.
        </p>
      </aside>
    </section>
  {/if}
</main>
