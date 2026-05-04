<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { onMount } from 'svelte';
  import SceneContent from './SceneContent.svelte';
  import type { ObserverLocation, SceneMode, SolarSnapshot, SurfaceFocus, ZoomIntent } from '../lib/types';

  export let location: ObserverLocation;
  export let snapshot: SolarSnapshot;
  export let sceneMode: SceneMode;
  export let zoomIntent: ZoomIntent;
  export let onSurfaceFocus: (focus: SurfaceFocus) => void;

  let webglAvailable = true;
  let sceneReady = false;

  onMount(() => {
    const canvas = document.createElement('canvas');
    webglAvailable = Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );

    const readyTimer = window.setTimeout(() => {
      sceneReady = true;
    }, 900);

    return () => window.clearTimeout(readyTimer);
  });
</script>

<div class="earth-canvas absolute inset-0">
  {#if webglAvailable}
    <Canvas>
      <SceneContent {location} {snapshot} {sceneMode} {zoomIntent} {onSurfaceFocus} />
    </Canvas>
    {#if !sceneReady}
      <div
        class="scene-loader pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6"
      >
        <div class="glass-panel w-full max-w-[18rem] rounded-lg px-4 py-3">
          <div class="mb-3 flex items-center justify-between gap-3">
            <span class="mono text-[0.64rem] uppercase tracking-[0.2em] text-slate-300/76">
              Rendering orbit
            </span>
            <span class="h-2 w-2 rounded-full bg-emerald-200"></span>
          </div>
          <div class="scene-loader-line overflow-hidden rounded-full bg-white/10">
            <span></span>
          </div>
        </div>
      </div>
    {/if}
  {:else}
    <div class="flex min-h-[100dvh] items-center justify-center px-6 text-center">
      <div class="glass-panel max-w-md rounded-lg p-6">
        <h2 class="text-xl font-semibold text-white">WebGL is unavailable</h2>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          Earthlight Observatory needs WebGL to render the interactive globe. Try a modern browser with
          hardware acceleration enabled.
        </p>
      </div>
    </div>
  {/if}
</div>
