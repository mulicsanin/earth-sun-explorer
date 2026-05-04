<script lang="ts">
  /* global HTMLDivElement, HTMLImageElement */
  import { onDestroy, onMount } from 'svelte';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';
  import { Globe2, Layers3 } from 'lucide-svelte';
  import { formatCoordinate } from '../lib/geo';
  import type { SurfaceFocus } from '../lib/types';

  type LoadStatus = 'loading' | 'ready' | 'error';

  export let focus: SurfaceFocus;
  export let onBack: () => void;

  const tileTemplate =
    (import.meta.env.PUBLIC_MAP_TILE_TEMPLATE as string | undefined) ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution =
    (import.meta.env.PUBLIC_MAP_TILE_ATTRIBUTION as string | undefined) ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const tileMaxZoom = Number(import.meta.env.PUBLIC_MAP_TILE_MAX_ZOOM || 19);

  let mapElement: HTMLDivElement | undefined;
  let map: L.Map | undefined;
  let tileLayer: L.TileLayer | undefined;
  let status: LoadStatus = 'loading';
  let errorMessage = '';
  let lastFocusSignature = '';

  $: focusSignature = `${focus.latitude.toFixed(5)}:${focus.longitude.toFixed(5)}:${focus.suggestedZoom}`;
  $: if (map && status === 'ready' && focusSignature !== lastFocusSignature) {
    lastFocusSignature = focusSignature;
    map.flyTo([focus.latitude, focus.longitude], focus.suggestedZoom, {
      animate: true,
      duration: 0.68,
      easeLinearity: 0.22
    });
  }

  onMount(() => {
    if (!mapElement) {
      return;
    }

    map = L.map(mapElement, {
      center: [focus.latitude, focus.longitude],
      zoom: focus.suggestedZoom,
      minZoom: 2,
      maxZoom: Math.max(tileMaxZoom, focus.suggestedZoom),
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
      preferCanvas: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    tileLayer = L.tileLayer(tileTemplate, {
      attribution: tileAttribution,
      maxZoom: tileMaxZoom,
      updateWhenIdle: true,
      keepBuffer: 3,
      crossOrigin: true
    });

    tileLayer.on('load', () => {
      status = 'ready';
      lastFocusSignature = focusSignature;
    });

    tileLayer.on('tileerror', (event) => {
      status = 'error';
      const target = event.tile as HTMLImageElement | undefined;
      errorMessage = target?.src
        ? `The map tile layer could not load ${target.src}.`
        : 'The map tile layer could not be loaded.';
    });

    tileLayer.addTo(map);
    map.on('zoomend', handleZoomEnd);
    window.setTimeout(() => map?.invalidateSize(), 50);
  });

  onDestroy(() => {
    if (map) {
      map.off('zoomend', handleZoomEnd);
      map.remove();
    }
  });

  function handleZoomEnd() {
    const zoom = map?.getZoom();

    if (typeof zoom === 'number' && zoom <= 3) {
      onBack();
    }
  }
</script>

<section class="map-mode fixed inset-0 bg-slate-950" aria-label="Real map close view">
  <div bind:this={mapElement} class="absolute inset-0 h-full w-full min-h-[100dvh]"></div>
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0,transparent_34rem,rgba(3,5,14,0.38)_100%)]"
  ></div>

  <div
    class="map-ui pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-3 sm:left-6 sm:right-6 sm:top-6"
  >
    <div class="glass-panel pointer-events-auto max-w-[24rem] rounded-lg px-4 py-3">
      <p class="mono text-[0.64rem] uppercase tracking-[0.2em] text-emerald-100/70">Map descent</p>
      <h2 class="mt-1 text-lg font-semibold text-white">Real map close view</h2>
      <p class="mono mt-2 text-xs leading-5 text-slate-300">
        {formatCoordinate(focus.latitude, 'lat')} / {formatCoordinate(focus.longitude, 'lon')}
      </p>
    </div>

    <button
      class="glass-panel pointer-events-auto flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-100 transition-[background,color,transform,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-emerald-200/40 hover:text-white active:scale-[0.98]"
      type="button"
      on:click={onBack}
    >
      <Globe2 size={17} strokeWidth={1.8} />
      Globe
    </button>
  </div>

  {#if status === 'loading'}
    <div class="absolute inset-0 z-10 flex items-center justify-center px-6">
      <div class="glass-panel w-full max-w-[20rem] rounded-lg px-4 py-3">
        <p class="mono mb-3 text-[0.64rem] uppercase tracking-[0.2em] text-slate-300/76">Loading map tiles</p>
        <div class="scene-loader-line overflow-hidden rounded-full bg-white/10">
          <span></span>
        </div>
      </div>
    </div>
  {:else if status === 'error'}
    <div class="absolute inset-0 z-10 flex items-center justify-center px-6">
      <div class="glass-panel max-w-md rounded-lg p-6">
        <div class="mb-4 flex items-center gap-3">
          <div class="rounded-md border border-emerald-100/20 bg-emerald-100/10 p-2 text-emerald-100">
            <Layers3 size={18} strokeWidth={1.8} />
          </div>
          <h2 class="text-xl font-semibold text-white">Map could not load</h2>
        </div>
        <p class="text-sm leading-6 text-slate-300">{errorMessage}</p>
      </div>
    </div>
  {/if}

  <div
    class="map-reticle pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/45"
  ></div>
</section>
