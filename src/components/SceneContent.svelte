<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import * as THREE from 'three';
  import { EARTH_RADIUS, geoToVector } from '../lib/geo';
  import type { ObserverLocation, SolarSnapshot } from '../lib/types';

  export let location: ObserverLocation;
  export let snapshot: SolarSnapshot;

  const loader = new THREE.TextureLoader();
  const dayTexture = loader.load('/textures/land-ocean-ice-cloud-2048.jpg');
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 8;

  const nightTexture = createNightTexture();
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.anisotropy = 4;

  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 96);
  const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 96, 64);
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.045, 96, 64);
  const markerGeometry = new THREE.SphereGeometry(0.035, 24, 16);
  const sunMarkerGeometry = new THREE.SphereGeometry(0.055, 24, 16);
  const starGeometry = createStarGeometry(900);

  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: {
        value: new THREE.Vector3(snapshot.sunVector.x, snapshot.sunVector.y, snapshot.sunVector.z)
      }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        float light = dot(normalize(vNormal), normalize(sunDirection));
        float dayMix = smoothstep(-0.08, 0.18, light);
        float twilight = 1.0 - smoothstep(0.02, 0.18, abs(light));
        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        vec3 color = mix(nightColor, dayColor * 1.08, dayMix);
        color += vec3(0.95, 0.40, 0.16) * twilight * 0.22;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const cloudMaterial = new THREE.MeshBasicMaterial({
    color: '#dceeff',
    opacity: 0.12,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;

      void main() {
        float intensity = pow(0.64 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        gl_FragColor = vec4(0.34, 0.74, 0.92, intensity * 0.42);
      }
    `
  });

  const markerMaterial = new THREE.MeshBasicMaterial({ color: '#9ff2da' });
  const sunMarkerMaterial = new THREE.MeshBasicMaterial({ color: '#ffd89c' });
  const starMaterial = new THREE.PointsMaterial({
    color: '#d9e7ff',
    size: 0.018,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  });
  const sunLineMaterial = new THREE.LineBasicMaterial({
    color: '#ffd89c',
    transparent: true,
    opacity: 0.34
  });
  const sunLineGeometry = new THREE.BufferGeometry();

  let cloudMesh: THREE.Mesh | undefined;
  let markerPosition = vectorToArray(geoToVector(location.latitude, location.longitude, EARTH_RADIUS * 1.04));
  let sunPosition = vectorToArray(scaleVector(snapshot.sunVector, EARTH_RADIUS * 1.68));
  let sunLightPosition = vectorToArray(scaleVector(snapshot.sunVector, 7));

  $: markerPosition = vectorToArray(geoToVector(location.latitude, location.longitude, EARTH_RADIUS * 1.04));
  $: sunPosition = vectorToArray(scaleVector(snapshot.sunVector, EARTH_RADIUS * 1.68));
  $: sunLightPosition = vectorToArray(scaleVector(snapshot.sunVector, 7));
  $: earthMaterial.uniforms.sunDirection.value.set(
    snapshot.sunVector.x,
    snapshot.sunVector.y,
    snapshot.sunVector.z
  );
  $: sunLineGeometry.setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(snapshot.sunVector.x, snapshot.sunVector.y, snapshot.sunVector.z).multiplyScalar(
      EARTH_RADIUS * 1.55
    )
  ]);

  useTask((delta) => {
    if (cloudMesh) {
      cloudMesh.rotation.y += delta * 0.012;
    }
  });

  function scaleVector(vector: { x: number; y: number; z: number }, scale: number) {
    return {
      x: vector.x * scale,
      y: vector.y * scale,
      z: vector.z * scale
    };
  }

  function vectorToArray(vector: { x: number; y: number; z: number }): [number, number, number] {
    return [vector.x, vector.y, vector.z];
  }

  function createStarGeometry(count: number): THREE.BufferGeometry {
    const positions = new Float32Array(count * 3);
    let seed = 17;

    for (let index = 0; index < count; index += 1) {
      seed = (seed * 16807) % 2147483647;
      const u = seed / 2147483647;
      seed = (seed * 16807) % 2147483647;
      const v = seed / 2147483647;
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const radius = 9 + (index % 7) * 0.18;

      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi);
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }

  function createNightTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const context = canvas.getContext('2d');

    if (!context) {
      return new THREE.CanvasTexture(canvas);
    }

    context.fillStyle = '#02050b';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cities = [
      [40.7, -74.0, 20],
      [34.0, -118.2, 18],
      [51.5, -0.1, 20],
      [48.8, 2.3, 18],
      [52.5, 13.4, 16],
      [41.9, 12.5, 13],
      [30.0, 31.2, 16],
      [25.2, 55.3, 15],
      [28.6, 77.2, 19],
      [19.0, 72.8, 17],
      [35.7, 139.7, 22],
      [37.5, 127.0, 16],
      [31.2, 121.5, 18],
      [1.3, 103.8, 13],
      [-23.5, -46.6, 17],
      [-34.6, -58.4, 14],
      [-33.9, 151.2, 14],
      [43.9, 18.4, 9]
    ];

    for (const [latitude, longitude, size] of cities) {
      drawLight(context, latitude, longitude, size);
    }

    return new THREE.CanvasTexture(canvas);
  }

  function drawLight(context: CanvasRenderingContext2D, latitude: number, longitude: number, size: number) {
    const x = ((longitude + 180) / 360) * context.canvas.width;
    const y = ((90 - latitude) / 180) * context.canvas.height;
    const gradient = context.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(255, 229, 166, 0.95)');
    gradient.addColorStop(0.24, 'rgba(255, 193, 98, 0.52)');
    gradient.addColorStop(1, 'rgba(255, 193, 98, 0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }
</script>

<T.PerspectiveCamera makeDefault position={[0.2, 0.35, 4.75]} fov={40} near={0.1} far={80} />
<OrbitControls enableDamping dampingFactor={0.06} enablePan={false} minDistance={2.7} maxDistance={7.2} />

<T.Color attach="background" args={['#050711']} />
<T.AmbientLight intensity={0.38} />
<T.DirectionalLight position={sunLightPosition} intensity={2.6} color="#fff4dc" />
<T.Points geometry={starGeometry} material={starMaterial} />

<T.Mesh geometry={earthGeometry} material={earthMaterial} />
<T.Mesh bind:ref={cloudMesh} geometry={cloudGeometry} material={cloudMaterial} />
<T.Mesh geometry={atmosphereGeometry} material={atmosphereMaterial} />
<T.Line geometry={sunLineGeometry} material={sunLineMaterial} />
<T.Mesh position={markerPosition} geometry={markerGeometry} material={markerMaterial} />
<T.Mesh position={sunPosition} geometry={sunMarkerGeometry} material={sunMarkerMaterial} />
