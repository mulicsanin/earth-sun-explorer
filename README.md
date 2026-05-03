# Earthlight Observatory

A cinematic 3D Earth and Sun position explorer built with Astro, Svelte, Threlte, Three.js, Tailwind CSS, and Astronomy Engine.

The app asks for browser location, falls back to Sarajevo, and lets visitors choose any observer coordinates and time. The globe renders a daylight side, a night side with procedural city lights, the subsolar point, observer marker, Sun vector, and a compact solar readout.

## Tech Stack

- Astro static site with a Svelte island
- Threlte and Three.js for the WebGL scene
- Tailwind CSS 4 for the interface shell
- Astronomy Engine for Sun altitude, azimuth, and rise/set calculations
- Vitest, Astro check, ESLint, and Prettier for project quality

## Commands

```sh
pnpm install
pnpm dev
pnpm check
pnpm test
pnpm build
```

## Accuracy

Earthlight Observatory is an educational visualization. It uses real astronomy calculations for Sun position and rise/set estimates, but it is not intended for navigation, surveying, safety decisions, or scientific operations.

## Assets

The Earth day texture is NASA Blue Marble / Visible Earth imagery:

- Source: https://visibleearth.nasa.gov/images/57735/the-blue-marble-land-surface-ocean-color-sea-ice-and-clouds
- Download used: `public/textures/land-ocean-ice-cloud-2048.jpg`
- Credit: NASA Goddard Space Flight Center, Reto Stockli, Robert Simmon, MODIS and supporting data teams

The night lights texture is generated procedurally in the browser for v1.

## Deployment

The project is a static Astro app and is ready for Vercel.

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Use the default Astro settings:
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Keep Node.js at version 22 or newer.

## Roadmap

- Add location search with a geocoder.
- Add camera presets for observer view, Sun view, and terminator view.
- Add high-resolution texture variants with explicit asset optimization.
- Add educational annotations for seasons, solstices, equinoxes, and twilight bands.
