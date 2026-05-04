# Earthlight Observatory

[![CI](https://github.com/mulicsanin/earth-sun-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/mulicsanin/earth-sun-explorer/actions/workflows/ci.yml)

Earthlight Observatory is a cinematic 3D Earth and Sun-position explorer. It lets visitors inspect where sunlight is falling on Earth, move through time, change observer location, and descend from the globe into a real interactive map view.

The project is built as a static Astro site with a Svelte island for the interactive experience. It does not need a backend for the current version.

## Features

- Full-screen 3D Earth rendered with Three.js and Threlte.
- Real Sun-position calculations using Astronomy Engine.
- Day/night shading with a visible terminator line.
- Procedural night-side city lights.
- Observer marker for the chosen location.
- Sun vector marker and solar readout.
- Live time, manual time, and playback controls.
- Browser geolocation with Sarajevo fallback.
- Manual latitude/longitude input and preset cities.
- Camera modes for orbit, observer, Sun direction, and day/night edge.
- Zoom controls that can transition from globe view into real map view.
- Leaflet map mode with OpenStreetMap raster tiles by default.
- Responsive glass-style UI for desktop and mobile.
- WebGL unsupported state and reduced-motion handling.

## Demo

Live demo: coming soon.

Local development runs at:

```sh
http://127.0.0.1:4321/
```

## Tech Stack

- [Astro](https://astro.build/) for the static site shell
- [Svelte](https://svelte.dev/) for the interactive island
- [Threlte](https://threlte.xyz/) and [Three.js](https://threejs.org/) for the 3D globe
- [Astronomy Engine](https://www.npmjs.com/package/astronomy-engine) for Sun calculations
- [Leaflet](https://leafletjs.com/) for real map tile mode
- [Tailwind CSS 4](https://tailwindcss.com/) for UI styling
- [Vitest](https://vitest.dev/), Astro check, ESLint, and Prettier for quality checks

## Requirements

- Node.js `22.12.0` or newer
- pnpm `10` or newer

## Getting Started

Install dependencies:

```sh
pnpm install
```

Start the dev server:

```sh
pnpm dev
```

Open:

```sh
http://127.0.0.1:4321/
```

Build for production:

```sh
pnpm build
```

Preview the production build:

```sh
pnpm preview
```

## Available Scripts

```sh
pnpm dev      # Start Astro dev server
pnpm build    # Build static production output
pnpm preview  # Preview the production build
pnpm check    # Run Astro/Svelte type checks
pnpm lint     # Run ESLint
pnpm format   # Check Prettier formatting
pnpm test     # Run Vitest tests
```

## Configuration

The app works without local environment variables. By default, map mode uses OpenStreetMap raster tiles.

To customize the map tile provider, copy `.env.example` to `.env.local`:

```sh
PUBLIC_MAP_TILE_TEMPLATE=https://tile.openstreetmap.org/{z}/{x}/{y}.png
PUBLIC_MAP_TILE_ATTRIBUTION=&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors
PUBLIC_MAP_TILE_MAX_ZOOM=19
```

For production traffic, use a tile provider that explicitly allows your expected usage. Keep attribution visible and follow the provider's tile usage policy.

## How It Works

The experience has two visual layers:

1. The 3D globe renders Earth, sunlight, atmosphere, clouds, observer marker, stars, and Sun direction.
2. When the user zooms close enough, the app can enter map mode and center a Leaflet map on the globe surface point.

The astronomy layer calculates:

- Sun altitude and azimuth for the observer.
- Daylight status.
- Subsolar latitude and longitude.
- Sunrise and sunset estimates.
- A normalized Sun vector for 3D lighting.

The scene is educational-accurate, not professional-grade navigation software.

## Accuracy Note

Earthlight Observatory uses real astronomy calculations for visualization, learning, and exploration. It is not intended for navigation, surveying, safety decisions, scientific operations, or legal determinations.

## Assets and Attribution

The Earth day texture is based on NASA Blue Marble / Visible Earth imagery:

- Source: https://visibleearth.nasa.gov/images/57735/the-blue-marble-land-surface-ocean-color-sea-ice-and-clouds
- Local file: `public/textures/land-ocean-ice-cloud-2048.jpg`
- Credit: NASA Goddard Space Flight Center, Reto Stockli, Robert Simmon, MODIS and supporting data teams

Map mode uses OpenStreetMap tiles by default:

- OpenStreetMap copyright: https://www.openstreetmap.org/copyright
- Tile usage policy: https://operations.osmfoundation.org/policies/tiles/

The night lights texture is generated procedurally in the browser for the current version.

## Deployment

The project is a static Astro app and is ready for Vercel.

Recommended Vercel settings:

```txt
Framework Preset: Astro
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
Node.js Version: 22.x
```

After deployment, add the Vercel URL to the GitHub repository About section.

## Quality Checks

The GitHub Actions workflow runs on pushes and pull requests to `main`:

- `pnpm check`
- `pnpm test`
- `pnpm build`

Before opening a pull request or deploying, run:

```sh
pnpm format
pnpm lint
pnpm check
pnpm test
pnpm build
```

## Project Structure

```txt
src/
  components/
    EarthlightApp.svelte   # Main UI shell and app state
    EarthScene.svelte      # WebGL availability and canvas wrapper
    SceneContent.svelte    # Three.js/Threlte globe scene
    MapTileView.svelte     # Leaflet close map mode
  lib/
    astronomy.ts           # Solar calculations
    format.ts              # Date, time, degree formatting
    geo.ts                 # Coordinate and vector helpers
    types.ts               # Shared TypeScript interfaces
  pages/
    index.astro            # Static Astro page shell
  styles/
    global.css             # Global styles and UI polish
public/
  textures/
    land-ocean-ice-cloud-2048.jpg
```

## Roadmap

- Add location search with a geocoder.
- Add place search inside map mode.
- Add synchronized sun overlays on the map.
- Improve close-zoom transition choreography.
- Add higher-resolution globe texture variants.
- Add screenshots and a short demo video to the README.
- Add educational annotations for seasons, solstices, equinoxes, and twilight bands.
- Add Playwright smoke tests for globe load and map mode.

## License

MIT. See [LICENSE](./LICENSE).
