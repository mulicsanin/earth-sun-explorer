<script lang="ts">
  import { Canvas } from '@threlte/core';
  import { onMount } from 'svelte';
  import SceneContent from './SceneContent.svelte';
  import type { ObserverLocation, SolarSnapshot } from '../lib/types';

  export let location: ObserverLocation;
  export let snapshot: SolarSnapshot;

  let webglAvailable = true;

  onMount(() => {
    const canvas = document.createElement('canvas');
    webglAvailable = Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  });
</script>

<div class="earth-canvas absolute inset-0">
  {#if webglAvailable}
    <Canvas>
      <SceneContent {location} {snapshot} />
    </Canvas>
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
