/* Projects, in the order they appear within their sections. Media paths are relative to /media. */
import type { WorkEntry } from "./types"

export const WORK: readonly WorkEntry[] = [
  {
    id: "cuda-path-tracer",
    kind: "work",
    section: "selected",
    label: "CUDA",
    meta: "2026",
    group: "GPU",
    title: "CUDA Path Tracer",
    sub: "A path tracer that runs entirely on the GPU",
    year: "2026",
    tags: ["CUDA", "C++", "Thrust", "OpenGL", "Open Image Denoise"],
    tagline: "A path tracer that runs entirely on the GPU",
    links: [["GitHub", "https://github.com/ximluo/Project3-CUDA-Path-Tracer"]],
    summary:
      "Each iteration shoots one path per pixel, bounces every path through the scene in parallel, and adds the paths that reach a light to the image. Glass, subsurface scattering, textures, procedural shapes, depth of field, motion blur, glTF meshes with a BVH, Russian roulette, denoising and resumable renders, each one measured on and off.",
    hero: "img/cuda/cover_lantern_rain.jpg",
    thumb: "cat/cuda.jpg",
    blocks: [
      {
        p: "The cover scene: 1200 × 800, 2,500 iterations, denoised. 423 objects and 54,718 triangles: four glTF lanterns lit by their own emissive textures, a glTF barrel, bump mapped brick and cobblestone, glass puddles, depth of field, and rain drawn as motion blurred spheres.",
      },
      {
        h: "How a frame is made",
      },
      {
        p: "One kernel handles one bounce for every live path. A path that misses the scene stops. A path that hits a light multiplies its color by the emission, adds the result to its pixel, and stops. Any other hit picks the next direction: a cosine weighted random direction for diffuse surfaces, the mirror direction for specular ones.",
      },
      {
        row: ["img/cuda/cornell.jpg", "img/cuda/cornell_closed.jpg"],
        cap: "Open Cornell box at 5,000 iterations, and the closed box",
      },
      {
        p: "After each bounce, thrust::copy_if copies the paths that are still alive into a second buffer and the two buffers swap, so the next bounce only launches threads for live paths. In the open box, rays leave through the missing front wall or hit the light, so only 19% of the paths are still alive at the eighth bounce. In the closed box nothing can escape and 92% are.",
      },
      {
        img: "img/cuda/chart_paths.png",
      },
      {
        p: "Compaction pays for itself only when paths terminate: 29% faster in the open scene, 4% slower in the closed one. The first version used thrust::partition in place, which copies every 64 byte path to a temporary buffer and back and was the most expensive stage in every scene. Adding a path’s color to the image the moment it reaches a light means finished paths carry nothing worth keeping, so compaction became a one way copy. The compaction stage dropped from 22.3 ms to 2.0 ms and the images stayed byte identical.",
      },
      {
        img: "img/cuda/chart_compaction.png",
      },
      {
        p: "Sorting paths by material before shading, so neighboring threads run the same branch, is a net loss here: the sort costs about 55 ms per iteration to save a third of a millisecond of shading. The materials differ by a few branches and texture reads, so there is little divergence to remove, and sorting moves two large structs per path.",
      },
      {
        h: "Materials and camera",
      },
      {
        p: "Glass uses Snell’s law and Schlick’s approximation: the Fresnel reflectance is the probability that a ray reflects instead of passing through, and total internal reflection always reflects. A CPU tracer would follow reflection and refraction recursively; here each path picks one of the two at random, which keeps one path per pixel and fits the wavefront loop.",
      },
      {
        row: ["img/cuda/refraction_off.jpg", "img/cuda/refraction.jpg"],
        cap: "Diffuse, then glass with an index of refraction of 1.5",
      },
      {
        p: "A subsurface material lets light enter the object and scatter inside it. Inside, the shading kernel draws a random travel distance; if that is shorter than the distance to the boundary the path scatters in a random direction and is tinted by the material color, otherwise it leaves. Every scatter uses one bounce of the main loop, so these scenes run to a depth of 48.",
      },
      {
        row: ["img/cuda/subsurface_off.jpg", "img/cuda/subsurface_on.jpg"],
        cap: "Diffuse, then subsurface with two scatter distances",
      },
      {
        p: "Image textures are loaded into one float buffer on the GPU and sampled with bilinear filtering. Color textures multiply the material color, bump maps tilt the normal from height differences, normal maps from glTF files go through the same tangent frame, and emissive textures turn the bright texels of a mesh into light sources, which is how the lantern panes on the cover glow. A procedural checker costs a few arithmetic operations; the file version costs four memory reads per lookup, which shows up as 0.26 ms more shading time.",
      },
      {
        row: ["img/cuda/bump_off.jpg", "img/cuda/bump_on.jpg"],
        cap: "Bump mapping off and on",
      },
      {
        img: "img/cuda/textures.jpg",
        cap: "File textures with bump maps on the wall, floor and sphere, and the glTF helmet with its own color, normal and emissive textures",
      },
      {
        p: "Two shapes are defined by signed distance functions and found by sphere tracing inside the object’s unit cube: a Mandelbulb and a Menger sponge. Two solid textures come from the hit position, a 3D checker and a marble made from sine stripes bent by four octaves of value noise. Sphere tracing is all arithmetic with no memory traffic, which suits the GPU, but the step count varies a lot between neighboring rays, so many threads in a warp wait on the slowest one.",
      },
      {
        img: "img/cuda/procedural.jpg",
        cap: "Mandelbulb and Menger sponge with the marble and checker textures",
      },
      {
        p: "Depth of field is a thin lens camera: each ray starts from a random point on a lens disk and is aimed at the point where the pinhole ray crosses the focal plane. Motion blur gives objects a velocity and each path a random time; a moving object is intersected by shifting the ray origin, which is the same as moving the object without rebuilding its matrices. The rain on the cover is 300 small spheres with a downward velocity.",
      },
      {
        row: ["img/cuda/dof_off.jpg", "img/cuda/dof_on.jpg"],
        cap: "Pinhole, then a lens focused on the mirror sphere",
      },
      {
        row: ["img/cuda/motion_blur_off.jpg", "img/cuda/motion_blur_on.jpg"],
        cap: "Static, then moving",
      },
      {
        p: "With direct lighting on, the last ray of a path on a diffuse surface is aimed at a random point on a random light instead of a random direction, weighted by the light’s area, the distance and both angles. At depth 3 and 64 iterations, error against a 2,000 iteration reference drops from 16.4 to 13.9. Halton sampling replaces the random engine for the first 32 dimensions and lowers the error by 3.5% at 64 iterations and 4.3% at 256.",
      },
      {
        row: ["img/cuda/direct_off_64.jpg", "img/cuda/direct_on_64.jpg"],
        cap: "Depth 3, 64 iterations: direct lighting off and on",
      },
      {
        img: "img/cuda/chart_error.png",
        cap: "Error against the reference for random and Halton sampling",
      },
      {
        h: "Geometry",
      },
      {
        p: "tinygltf reads .gltf and .glb files. The loader walks the node tree, applies each node’s transform, and stores world space triangles with positions, normals, UVs and a material. A mesh with no material of its own uses the file’s: base color, color texture, normal texture, emissive texture, and glass for transmission materials.",
      },
      {
        row: ["img/cuda/duck.jpg", "img/cuda/dragon.jpg"],
        cap: "Duck, 4,212 triangles. Stanford dragon in glass, 134,995 triangles with its cloth",
      },
      {
        p: "The BVH is a tree of boxes built on the CPU, each node splitting its triangles in half along the longest axis of their centroids. Nodes live in one flat array and the GPU walks them with a loop and a 64 entry stack, skipping boxes farther than the closest hit so far. For the duck it brings intersection from 281.5 ms to 16.2 ms, 17 times faster. The bounding box alone only reaches 200.6 ms, because most rays that reach the duck still test all 4,212 triangles.",
      },
      {
        img: "img/cuda/chart_mesh.png",
      },
      {
        h: "Speed and workflow",
      },
      {
        p: "From the fourth bounce on, Russian roulette lets a path survive with probability equal to its brightest color channel and divides survivors by that probability. Dim paths stop early and the expected image is unchanged: 10% faster in the open scene and 23% in the closed one, where roulette is the only thing that ends paths and it works together with compaction.",
      },
      {
        p: "The renderer accumulates surface color and normal buffers from the first hit of every path and hands them to Open Image Denoise, which runs on the first iteration, every 50 after that, and on the last. Sixteen denoised iterations are closer to the reference than 256 raw ones. Every saved image also writes a checkpoint with the camera and the accumulated buffers, and a resumed render continues the same random sequence, so 100 iterations plus a resumed 100 give a byte identical image to 200 straight.",
      },
      {
        row: ["img/cuda/random_16.jpg", "img/cuda/denoise_16.jpg", "img/cuda/cornell.jpg"],
        cap: "16 iterations, 16 iterations denoised, 5,000 iterations",
      },
      {
        h: "Bloopers",
      },
      {
        row: ["img/cuda/blooper_glass_cube_nan.jpg", "img/cuda/blooper_direct_light_fireflies.jpg"],
        cap: "A glass cube with black edges, and speckles from direct lighting",
      },
      {
        p: "The bundled GLM returns NaN from glm::refract on total internal reflection, not a zero vector, so every ray that should have bounced around inside the cube went black. The direct lighting weight divides by the squared distance to the light, so points on the ceiling right next to the light got enormous values; capping the weight removed them.",
      },
      {
        h: "Built on",
      },
      {
        p: "The compaction step comes from the project before this one, a CUDA scan and stream compaction library: a shared memory scan that matches Thrust at 2^24 elements (1.20 ms against 1.22 ms) and runs five times faster than the global memory version, plus a radix sort that beats std::sort by 5.3× at 2^26 elements.",
      },
      {
        link: "https://github.com/ximluo/Project3-CUDA-Path-Tracer",
        cap: "Code and the full write-up on GitHub",
      },
    ],
  },
  {
    id: "apple",
    kind: "work",
    section: "selected",
    label: "Apple",
    meta: "2026",
    group: "Internship",
    title: "Apple",
    sub: "",
    year: "2026",
    tags: [],
    tagline: "Summer 2026",
    hero: "",
    thumb: "cat/apple.jpg",
    blocks: [
      {
        p: "If you would like to learn about what I did over the summer, reach out to [ximluo@upenn.edu](mailto:ximluo@upenn.edu)!",
      },
    ],
    minimal: true,
    fx: "code-apple",
  },
  {
    id: "petsteps",
    kind: "work",
    section: "selected",
    label: "Adobe",
    meta: "2024",
    group: "iOS",
    title: "Adobe Digital Edge Awards",
    sub: "PetSteps",
    year: "2024 · revamp 2026",
    tags: ["Swift", "HealthKit", "Apple Foundation Models", "SwiftUI", "SwiftData"],
    tagline: "PetSteps",
    links: [
      ["Code available upon request", "mailto:ximluo@upenn.edu?subject=PetSteps%20code%20request"],
    ],
    summary:
      "PetSteps is an iOS app that turns your daily steps into taking care of a virtual pet. You walk, your pet eats, levels up, and gets new outfits. It won Adobe's Digital Edge Standout Prize out of 2,400+ entries and was shown at Adobe MAX 2024.",
    hero: "img/petsteps/adobe-max-2024.webp",
    thumb: "cat/petsteps.jpg",
    blocks: [
      {
        p: "Adobe also features PetSteps on its Creative Cloud student page: Amber Xiao and I turned our own illustrations into the app’s icons.",
      },
      {
        img: "img/petsteps/adobe-feature.jpg",
        w: 1600,
        h: 875,
        cap: "[PetSteps on adobe.com](https://www.adobe.com/education/students/creativecloud/features.html)",
      },
    ],
  },
  {
    id: "procedural",
    kind: "work",
    section: "selected",
    label: "Procedural",
    meta: "2026",
    group: "Procedural",
    title: "Procedural Graphics",
    sub: "Noise, toolbox functions and stylized rendering",
    year: "2026",
    tags: ["WebGL", "GLSL", "TypeScript", "Unity", "HLSL"],
    tagline: "Noise, toolbox functions and stylized rendering",
    links: [
      ["Cherry Tree", "https://github.com/ximluo/hw02-stylization"],
      ["Fireball", "https://github.com/ximluo/hw01-fireball"],
      ["Water", "https://github.com/ximluo/hw00-intro-base"],
    ],
    summary:
      "A growing set of procedural pieces from CIS 5660: a watercolor and ink cherry tree shrine in Unity, a cel shaded WebGL fireball built from noise and toolbox functions, and smaller shader sketches.",
    hero: "img/procedural/tree-turnaround.webp",
    thumb: "cat/procedural.jpg",
    blocks: [
      {
        h: "Sakuya’s Cherry Tree",
      },
      {
        p: "A watercolor and ink cherry tree shrine in Unity URP, styled after the concept art of Sakuya, the cherry tree spirit in Ōkami (Capcom and Clover Studio). Space switches between the tree in bloom and the withered tree, and the sky runs through a full day and night on its own.",
      },
      {
        img: "img/procedural/tree-turnaround.webp",
        cap: "One orbit: bloom to withered and back, then sunset and nightfall",
      },
      {
        p: "The surface shader starts from a three tone toon ramp and adds multiple lights, a stepped specular highlight, a rim that only appears on the lit side, and a shadow texture: my own seamless dry brush strokes, painted by an editor script with 560 tapered strokes, sampled in the object’s UV space so the strokes follow the trunk, the rocks and the grass. It nudges the lighting value before the tone pick, so band edges and shadows break into strokes while fully lit areas stay clean.",
      },
      {
        row: ["img/procedural/tree-brush-shadow.png", "img/procedural/tree-detail-shadow.jpg"],
        cap: "The brush shadow texture, and its strokes following the UVs of the rocks, roots and ground",
      },
      {
        p: "The blossoms and the lantern flame use a variant that bobs each blossom around its own pivot with a phase from its world position, drifts bands of a second color across the surface at eight updates a second so it reads as redrawn frames, and keeps the flame bright at night. Outlines come from a Sobel on eye depth, divided by the center depth and relaxed at grazing angles, plus a Roberts cross on the normal buffer for interior edges. Depth edges are sampled through a noise warped UV that is re rolled a few times a second, so the silhouette shakes like redrawn frames, while normal edges stay still so the drawing keeps its structure.",
      },
      {
        img: "img/procedural/tree-detail-outline.jpg",
        cap: "Ink outlines: wobbling silhouettes, steady interior lines, dry brush breakup",
      },
      {
        p: "A second full screen pass turns the frame into watercolor on paper: wobbly wash edges from sampling the frame through low frequency noise, pigment pooling where the color changes quickly, paper grain that shows more in the darker areas, uneven wash density, a warm paper tint and a rough unpainted border in place of a vignette.",
      },
      {
        row: [
          "img/procedural/tree-breakdown-1-surface.jpg",
          "img/procedural/tree-breakdown-2-paper.jpg",
          "img/procedural/tree-bloom.jpg",
        ],
        cap: "Surface shaders, plus the paper wash, plus the ink outlines",
      },
      {
        p: "The tree is generated by an editor script: the spiral trunk, branches, roots, moss skirt and rope are tubes swept along curves, with V following the path length so the shadow texture keeps one scale, and 273 blossoms are squashed spheres scattered along the branches. Everything else is Unity primitives, one directional light and two point lights.",
      },
      {
        img: "img/procedural/tree-bloom-back.jpg",
      },
      {
        p: "Space fades a global wither value from 0 to 1 over a second and a half. Nineteen objects swap to an ink wash shader whose brightness picks a value between an ink color and a paper color, so the three toon tones become three ink values; the blossoms close one by one in the vertex shader, the clouds turn into heavy ink blots, the paper pass drains the remaining color, and the outline gets thicker and shakier.",
      },
      {
        row: [
          "img/procedural/tree-bloom.jpg",
          "img/procedural/tree-withering-halfway.jpg",
          "img/procedural/tree-withered.jpg",
        ],
        cap: "Bloom, halfway, withered",
      },
      {
        p: "The sky is a watercolor painted on the view direction: wash clouds with a darker pigment rim drifting on 3D noise so there is no seam, a horizon glow that leans toward the sun or moon, a soft disc where the main light is, and splattered stars that fade in at night. One day lasts 36 seconds; the directional light follows the sun’s arc, becomes the moon below the horizon, and dims while it sits on the horizon, which hides the switch and gives a silhouette at sunset.",
      },
      {
        img: "img/procedural/tree-day-night.webp",
        cap: "Night, dawn and back to day",
      },
      {
        row: [
          "img/procedural/tree-day-sun.jpg",
          "img/procedural/tree-dusk.jpg",
          "img/procedural/tree-sunset.jpg",
        ],
        cap: "Day, dusk, sunset",
      },
      {
        row: ["img/procedural/tree-night.jpg", "img/procedural/tree-night-back.jpg"],
        cap: "Night, and midnight from behind",
      },
      {
        h: "Fireball",
      },
      {
        p: "A stylized fireball made from an icosphere. The vertex shader pushes the mesh around with noise and pulls it into a teardrop with a trailing tail, the fragment shader colors it by how far each vertex moved, and everything is driven by a time uniform. The look is cel shaded, flat bands of color.",
      },
      {
        live: "https://ximluo.github.io/hw01-fireball/",
        poster: "img/procedural/fireball.jpg",
        cap: "Fireball, live. Drag to orbit; the panel changes the noise, loads music or listens to the microphone.",
      },
      {
        p: "Two layers of displacement run along the normal. The first is a low frequency, high amplitude wobble from a product of three sine waves over position and time. The second is fbm over 3D Perlin noise at a higher frequency and lower amplitude; on the tail side it runs through a ridged version, one minus the absolute value, which turns round bumps into sharp flame shapes.",
      },
      {
        p: "The tail comes from two steps. Vertices on the back half get pulled toward the tail axis, with the pull growing quadratically the further back they sit, so the sphere becomes a teardrop. Then vertices facing the tail direction get stretched along it, scaled by the squared ridged noise, so only some parts of the tail shoot out far and the trailing edge ends up jagged. A pulse mode feeds a sawtooth on time into an impulse function, so the whole ball swells and settles every few seconds.",
      },
      {
        p: "The fragment shader combines the displacement and the tail stretch into one heat value: more displacement means hotter, more tail means cooler, so the head stays white and the trailing flames fade toward black. Heat runs through a ramp of near black, maroon, red, orange, the hot color from the GUI, and white, quantized into six bands with scrolling 3D noise added first so the band edges stay ragged. Every color is the hot color times a fixed multiplier, so picking a blue hot color turns the whole scene blue, background and sparks included.",
      },
      {
        p: "Around it: a full screen background shader of domain warped fbm stretched into streaks, a small OBJ loader so any model can be the ball, a mouse dent that unprojects the cursor into a ray and softens the surface near it, Web Audio and microphone input that swell the displacement and lengthen the tail on the bass, and 1,500 GPU only ember and spark particles whose spawn, velocity and lifetime come from four random seeds and time.",
      },
      {
        h: "Shader sketches",
      },
      {
        p: "Water: a 3D Worley noise fragment shader on a subdivided cube. The nearest feature distance sets the depth and the gap between the two nearest distances draws the bright caustic lines, while a vertex shader rocks the cube with a few sine waves of position and time.",
      },
      {
        live: "https://ximluo.github.io/hw00-intro-base/",
        poster: "img/procedural/water.jpg",
        cap: "Water caustics, live",
      },
      {
        p: "Sakura: a Shadertoy flower drawn from toolbox functions, with watercolor edges and petals that pulse and turn.",
      },
      {
        img: "img/procedural/sakura.webp",
        w: 480,
        h: 270,
      },
    ],
  },
  {
    id: "mini-minecraft",
    kind: "work",
    section: "graphics",
    label: "Minecraft",
    meta: "C++ voxel engine · 2024",
    group: "Graphics",
    title: "Mini Minecraft",
    sub: "C++ voxel game engine",
    year: "2024",
    tags: ["C++", "OpenGL", "GLSL"],
    tagline: "C++ voxel game engine",
    summary:
      "Custom built 3D voxel game engine inspired by Minecraft, featuring procedural terrain, day night cycles, dynamic lighting, instanced rendering, and a post processing pipeline. I implemented the player physics, raycast based block interaction, and immersive visual effects such as a time interpolated sky with sun arcs, distance fog blending, and a post process system for water and lava overlays.",
    hero: "img/mini-minecraft.png",
    thumb: "cat/mini-minecraft.jpg",
    blocks: [
      {
        embed: "https://www.youtube.com/embed/kr7ze2p7Tx8?si=f6Pqu8gN6oUHypdi",
      },
      {
        p: "A 3D voxel game engine inspired by Minecraft, built with C++ and OpenGL. It features procedural terrain generation, efficient chunk streaming, day night lighting, and a custom shader pipeline.",
      },
      {
        p: "Physics system supports flying and grounded movement, with gravity, acceleration, and collision detection. Collisions are handled per axis for smooth sliding. Precise block interaction using ray casting from the camera, enabling players to mine and place blocks with pixel accuracy.",
      },
      {
        p: "For the day night cycle, procedurally animated the sun’s arc and sky color using GLSL, interpolating between time intervals to simulate realistic transitions. Lighting was synced with the sun’s direction and color. Distance based fog adjusts dynamically to sky hues using smoothstep blending, creating a seamless atmospheric fade at horizon level.",
      },
      {
        p: "Cave generation system using 3D Perlin noise, populating underground layers with air pockets, lava pools, and bedrock. Optimized sampling by bounding height ranges during development. Post processing pipeline to tint the screen when entering water or lava, using framebuffer textures and fullscreen shaders.",
      },
    ],
  },
  {
    id: "cuda-flocking",
    kind: "work",
    section: "graphics",
    label: "Flocking",
    meta: "CUDA boids · 2026",
    group: "GPU",
    title: "CUDA Flocking",
    sub: "One million boids on a coherent uniform grid",
    year: "2026",
    tags: ["CUDA", "C++", "Thrust", "OpenGL"],
    tagline: "One million boids on a coherent uniform grid",
    links: [["GitHub", "https://github.com/ximluo/Project1-CUDA-Flocking"]],
    summary:
      "A boids simulation on the GPU with three neighbor searches: naive, a scattered uniform grid, and a coherent uniform grid. The coherent grid runs 1,000,000 boids at 78 fps, about 490 times faster than checking every pair.",
    hero: "img/flocking/boids.webp",
    thumb: "cat/flocking.jpg",
    blocks: [
      {
        img: "img/flocking/boids.jpg",
        cap: "50,000 boids on the coherent uniform grid",
      },
      {
        h: "Three ways to find neighbors",
      },
      {
        p: "Naive: every boid checks every other boid and applies the three flocking rules, cohesion toward the average position of nearby boids, separation from boids that are too close, and alignment with their average velocity. The new velocity is written to a second buffer and the buffers swap after the step, so boids only see velocities from the previous step.",
      },
      {
        p: "Scattered uniform grid: each boid is tagged with the index of its grid cell, the tags are sorted with Thrust so boids in the same cell sit next to each other, and a kernel records where each cell starts and ends. The velocity kernel then only checks boids in cells that can overlap the neighborhood sphere, but still reads them through the sorted index array, so those reads are scattered in memory.",
      },
      {
        p: "Coherent uniform grid: the same, but the position and velocity arrays are also reordered into cell order before the velocity kernel runs, so neighbor data is read directly with no index lookup in between. The reordered position array simply becomes the position array for the next step. The neighbor search loops over a computed range of cells rather than a fixed 8 or 27, going z, then y, then x so consecutive cells are consecutive in memory.",
      },
      {
        h: "What the numbers say",
      },
      {
        img: "img/flocking/fps_vs_boids_novis.svg",
        cap: "Framerate against boid count, visualization off",
      },
      {
        p: "Below about 20k boids all three modes hit the frame loop overhead, so the framerate sits near 2,500 fps regardless of mode. Above that, naive is O(N²): 2.5× the boids from 20k to 50k costs 6.3× the step time, and it is unusable past 50k. The scattered grid falls off faster than linear because the volume is fixed, so more boids means more neighbors per boid, and each neighbor read is an indirect random access. The coherent grid has the same neighbor counts but reads them in order, holds above 1,600 fps up to 100k, and is still at 78 fps with a million.",
      },
      {
        p: "The coherent grid beats the scattered grid by far more than contiguous reads alone would explain: 2.8× at 50k boids, 4.7× at 100k, about 9× at 500k and 1M. After sorting, the 32 threads of a warp are boids in the same or nearby cells, so they walk the same cells, hit the same cache lines, and finish together. In the scattered version a warp holds 32 random boids reading unrelated memory.",
      },
      {
        img: "img/flocking/fps_vs_blocksize.svg",
        cap: "Framerate against block size at 50,000 boids",
      },
      {
        p: "Block size barely matters, about 15% between the best and worst, because at 50k boids there are hundreds of blocks at every size and the kernels are bound by memory reads in the neighbor loop, not by how threads are grouped. Whether 27 small cells beat 8 large ones depends on density: 27 cells of width d cover 27 d³ against 64 d³, so they test fewer than half the candidates but do more lookups, many of them empty. At 200k boids fewer candidates wins clearly; at 50k the coherent grid actually loses, because its neighbor reads are so cheap that 19 extra cell lookups cost more than the boids they skip.",
      },
      {
        link: "https://github.com/ximluo/Project1-CUDA-Flocking",
        cap: "Code and the full write-up on GitHub",
      },
    ],
  },
  {
    id: "pbr-renderer",
    kind: "work",
    section: "graphics",
    label: "PBR",
    meta: "Real time renderer · 2025",
    group: "Graphics",
    title: "Physically Based Renderer",
    sub: "Real time PBR renderer",
    year: "2025",
    tags: ["C++", "GLSL", "OpenGL"],
    tagline: "Real time PBR renderer",
    summary:
      "A real time shading project from Penn’s Advanced Rendering course. Implements the energy conserving Cook Torrance microfacet BRDF using the Trowbridge Reitz GGX distribution, Schlick’s Fresnel approximation, and the Smith Schlick GGX geometry term.",
    hero: "img/pbr-renderer/sdf-sub.webp",
    thumb: "cat/pbr-renderer.jpg",
    blocks: [
      {
        p: "The PBR shader screenshot shows the microfacet model in action. Metallicness is toggled between zero and one via GUI sliders, and roughness is held around 0 to illustrate reflectiveness.",
      },
      {
        img: "img/pbr-renderer/pbr-gui.webp",
        w: 696,
        h: 443,
      },
      {
        p: "All lighting and material calculations run in the fragment shader. Material properties like albedo, metallicness, and roughness are sampled from textures when available or controlled with GUI sliders otherwise.",
      },
      {
        p: "Image based lighting uses two precomputed cubemaps: one for diffuse irradiance and one for glossy irradiance. The shader samples the diffuse map using surface normals and the glossy map using the reflected view vector.",
      },
      {
        img: "img/pbr-renderer/pbr-displacement.webp",
        w: 734,
        h: 328,
      },
      {
        p: "Vertex displacement is driven by a height map in the vertex shader. Vertices are offset along interpolated normals before tangent space normal mapping adds fine surface detail.",
      },
      {
        img: "img/pbr-renderer/pbr-albedo.webp",
        w: 888,
        h: 556,
      },
      {
        p: "When a model provides its own albedo texture, the shader samples its base color and feeds it into both the Lambertian diffuse irradiance and Cook Torrance specular equations for accurate material appearance.",
      },
      {
        p: "The renderer maintains full refresh rates without dropped frames, demonstrating that even with PBR and displacement, real time performance is achievable.",
      },
      {
        p: "For full implementation details, see [Real Shading in Unreal Engine 4](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf).",
      },
      {
        p: "Beyond the core PBR pipeline, two advanced rendering features were developed as course extensions.",
      },
      {
        p: "Deferred Rendering and Screen Space Reflection: A multi pass deferred pipeline first renders scene attributes into a G buffer with attachments for albedo, world space normals, specular, and depth. The SSR pass reconstructs view space positions and normals, reflects view vectors, and performs iterative ray marching in screen space to sample G buffer data. A binary search refines intersection points before separable Gaussian blur applies glossy falloff. The final composite blends these reflections with direct Cook Torrance lighting.",
      },
      {
        img: "img/pbr-renderer/pbr-ssr.webp",
        w: 593,
        h: 404,
      },
      {
        p: "Signed Distance Fields and Subsurface Scattering: A ray marched SDF shader steps along view rays using the sceneSDF composed of primitive SDF operations. Upon hit detection, the Cook Torrance BSDF calculates local lighting. Subsurface scattering uses a thinness metric computed via opposite direction SDF queries to attenuate light transmitted through the material, blended with diffuse irradiance for translucent effects. Scene repetition applies SDF repetition functions to clone the building elements across the environment.",
      },
      {
        img: "img/pbr-renderer/sdf-sub.webp",
        w: 1280,
        h: 636,
      },
    ],
  },
  {
    id: "penn-mobile",
    kind: "work",
    section: "software",
    label: "Penn Labs",
    meta: "Penn Mobile · 2025",
    group: "iOS",
    title: "Penn Mobile",
    sub: "Official Penn student app",
    year: "2025-Present",
    tags: ["Swift", "SwiftUI"],
    tagline: "Official Penn student app",
    summary:
      "Penn Mobile is the University of Pennsylvania’s official student life app, serving 20,000+ users. Developed by Penn Labs, it brings campus essentials like dining hours, GSR reservations, laundry availability, and student resources directly to students’ phones.",
    hero: "img/mobile.jpg",
    thumb: "cat/penn-mobile.jpg",
    blocks: [
      {
        p: "Learn more at [pennlabs.org/products/penn-mobile](https://pennlabs.org/products/penn-mobile).",
      },
      {
        p: "With Penn Mobile, students can reserve study rooms across campus, view dining hall menus and hours, check real time laundry availability, and access essential university resources, all from one centralized app.",
      },
      {
        p: "Features include push notifications for upcoming reservations, daily laundry activity graphs, campus wide contact info, access to the Daily Pennsylvanian feed, and more. It’s designed to make campus life easier, faster, and more mobile friendly.",
      },
    ],
  },
  {
    id: "rewind",
    kind: "work",
    section: "software",
    label: "Rewind",
    meta: "HackMIT winner · 2024",
    group: "XR",
    title: "Rewind",
    sub: "HackMIT Winner - AR memory",
    year: "2024",
    tags: ["WebXR", "LangChain", "IRIS Vector Search"],
    tagline: "HackMIT Winner - AR memory",
    summary:
      "Rewind is an AR memory recall app that won the InterSystems Challenge at HackMIT 2024, integrated with the Apple Vision Pro. It uses Gaussian splatting for 3D scene generation and a LangChain based RAG pipeline with InterSystems IRIS Vector Search for natural language memory queries.",
    hero: "img/rewind-grade.jpg",
    thumb: "cat/rewind.jpg",
    blocks: [
      {
        p: "Gaussian Splatting 3D Scene Generation: We convert user video clips into point cloud environments using a custom Python pipeline and render them in real time with Three.js and WebXR. Users can navigate their memories in 360 degree AR.",
      },
      {
        p: "Backend Architecture: The Flask API manages user sessions, stores memory metadata in a relational SQL database, and coordinates scene jobs. Each memory record includes timestamps, tags, and AR scene links.",
      },
      {
        p: "RAG with Vector Search: We embed memory metadata and textual notes into vectors using LangChain embedding models. These vectors are indexed in InterSystems IRIS Vector Search. At query time, user questions are embedded, top K matching memories are retrieved, and the app surfaces exact moments, for example, “Show my graduation day”.",
      },
    ],
  },
  {
    id: "neuroscent",
    kind: "work",
    section: "software",
    label: "NeuroScent",
    meta: "MIT Reality Hack winner · 2025",
    group: "XR",
    title: "NeuroScent",
    sub: "MIT Reality Hack Winner - XR biosensing",
    year: "2025",
    tags: ["C#", "Unity", "Arduino", "Fusion 360"],
    tagline: "MIT Reality Hack Winner - XR biosensing",
    summary:
      "NeuroScent is an XR biofeedback system that promotes mental wellbeing, combining olfaction, vision, and biosensing. Built for MIT Reality Hack 2025, it won the Hardware: Smart Sensing prize and Best Use of OpenBCI.",
    hero: "img/neuroscent-grade.jpg",
    thumb: "cat/neuroscent.jpg",
    blocks: [
      {
        p: "NeuroScent integrates scent delivery and physiological sensing to extend XR immersion beyond vision and sound. We used the Varjo headset for visual feedback and OpenBCI Galea for EEG, PPG, and EMG biosignals, creating a holistic biofeedback loop.",
      },
      {
        p: "The system captures EEG, EMG, and heart rate data from Galea, analyzes real time mental state, and triggers adaptive scent releases and visual effects to guide users toward calm or focus.",
      },
      {
        p: "Harvested ultrasonic atomizers from consumer diffusers, controlled them with relays on an ESP32, and designed a Fusion 360 airflow chamber. Inspired by [Nebula: An Affordable Open Source and Autonomous Olfactory Display for VR Headsets](https://hal.science/hal-03838757v1/file/Nebula_VRST_2022%20%281%29.pdf), built a compact olfactory module.",
      },
      {
        p: "In Unity, C# scripts stream Galea biosignals over USB serial. Shader Graph, particle systems, and animation scripts map biofeedback thresholds to scent and visual triggers in real time.",
      },
      {
        embed: "https://player.vimeo.com/video/1059625069",
      },
      {
        p: "Optimized performance by reducing draw calls, enabling occlusion culling, and using Unity URP with baked lighting. Simplified geometry and LOD management maximizing FPS on Varjo Aero.",
      },
      {
        p: "Next steps include expanding immersive sequences, adding more scent channel permutations, and exploring clinical applications like patient relaxation during anesthesia with targeted biofeedback driven scent delivery.",
      },
    ],
  },
  {
    id: "pennos",
    kind: "work",
    section: "software",
    label: "PennOS",
    meta: "UNIX-like OS in C · 2026",
    group: "Systems",
    title: "PennOS",
    sub: "UNIX-like OS from scratch in C",
    year: "2026",
    tags: ["C", "POSIX signals", "ucontext"],
    tagline: "UNIX-like OS from scratch in C",
    summary:
      "PennOS is a UNIX-like operating system written from scratch in C. The entire OS runs inside a single Linux process: a kernel that context switches its own threads with ucontext, a weighted priority scheduler driven by a 100ms SIGALRM tick, a FAT filesystem that lives inside one disk image file, and a shell with bash-style job control on top. User land never touches the host: everything goes through our own syscall layer, s_spawn, s_waitpid, s_kill, s_open and friends, and the kernel logs every scheduling and lifecycle event it makes.",
    hero: "img/pennos-hero.gif",
    thumb: "cat/pennos.jpg",
    blocks: [
      {
        p: "This is a real session, not a mockup. Left side is the PennOS shell: create a file on the PennFAT disk, redirect into it, read it back, put a sleep and a busy loop in the background, list processes and jobs, kill one. Right side is the kernel's own log of the same moments: every CREATE, SCHEDULE, BLOCKED, ZOMBIE and WAITED transition as it happens.",
      },
      {
        img: "img/pennos/pennos-session.webp",
        w: 800,
        h: 493,
      },
      {
        p: "The scheduler keeps three round-robin queues and steps them on a 100ms SIGALRM tick, weighted so queue 0 runs 1.5x as often as queue 1 and 2.25x as often as queue 2. When nothing is runnable it parks in sigsuspend, so an idle OS costs nothing. Spawn three busy loops at the three priorities and the schedule trace shows the weighting directly:",
      },
      {
        img: "img/pennos/pennos-scheduler.webp",
        w: 800,
        h: 373,
      },
      {
        p: "Processes get the full UNIX lifecycle. Parents block in s_waitpid, exited children hang around as zombies until someone reaps them, orphans get reparented to init, and init loops reaping whatever lands on it. Our own signals, P_SIGSTOP, P_SIGCONT and P_SIGTERM, drive stop and continue, and the shell traps the host's Ctrl+C and Ctrl+Z and forwards them to the foreground PennOS job, so jobs, fg, bg and nice behave the way bash trained your hands to expect.",
      },
      {
        p: "The filesystem is PennFAT, a FAT-style filesystem that lives inside an ordinary host file. A standalone tool formats and inspects images, and the kernel mounts one at boot. On top of it sit per-process file descriptor tables, s_open, s_read, s_write and s_lseek, permissions, shell redirection, and script files that live on the PennFAT disk and execute like programs.",
      },
    ],
  },
  {
    id: "lost-at-penn",
    kind: "work",
    section: "software",
    label: "Lost@Penn",
    meta: "Lost item platform · 2024",
    group: "Web",
    title: "Lost@Penn",
    sub: "Penn lost item platform",
    year: "2024",
    tags: ["React.js", "Tailwind", "Firebase"],
    tagline: "Penn lost item platform",
    summary:
      "Lost@Penn is a web platform that helps the Penn community report and find lost items across campus. Built with React.js, Firebase, and Tailwind, it offers a centralized, easy to use solution to a common student problem. Through user research and iterative design, we created a trustworthy and intuitive platform focused on usability and real needs.",
    hero: "img/lost-dark.jpg",
    thumb: "cat/lost-at-penn.jpg",
    blocks: [
      {
        embed: "https://www.youtube.com/embed/DxMMO6Qa638?si=4tPosHJ_6WKeH1kH",
      },
      {
        p: "Lost@Penn was inspired by the shared frustration of losing items on campus without knowing where to turn. There was no centralized system to report or search for missing belongings, so we set out to build one. We started by interviewing Penn students to understand the pain points and features they needed most.",
      },
      {
        p: "Lost@Penn was built with React.js for its component based architecture, Firebase for backend services and real time syncing, Tailwind and Bootstrap for responsive design, and Figma for prototyping and iteration. We focused on building a fast, usable interface with strong visual hierarchy and minimal friction. From the user interviews to the final prototype, every step of the process was grounded in solving a real problem for a real community.",
      },
      {
        p: "Read more at: [Lost@Penn Case Study](https://medium.com/@ximingluo/lost-penn-863d1706a193)",
      },
      {
        link: "doc/Lost-at-Penn.pdf",
        cap: "Slides (PDF)",
      },
    ],
  },
  {
    id: "penn-capsule",
    kind: "work",
    section: "software",
    label: "Capsule",
    meta: "3D photo capsules · 2025",
    group: "iOS",
    title: "Capsule",
    sub: "3D photo capsule app",
    year: "2025",
    tags: ["AWS S3", "Node.js", "TypeScript", "MongoDB"],
    tagline: "3D photo capsule app",
    summary:
      "Penn Capsule transforms photo collections into interactive 3D time capsules that unlock on a specified date. Users customize capsule appearance, upload memories, and later experience a dynamic timelapse of their photos in a 3D environment.",
    hero: "img/capsule-open.jpg",
    thumb: "cat/penn-capsule.jpg",
    blocks: [
      {
        p: "On the frontend, React Three Fiber renders the 3D capsules. Capsules animate open, revealing embedded photos arranged chronologically around the interior. Users interact via orbit controls in an immersive 3D view.",
      },
      {
        p: "On the backend, handle file uploads server side to AWS S3 via the AWS SDK, define MongoDB collections for Users and Time Capsules using the native driver, secure routes with JWT, and enable Google OAuth single sign on.",
      },
      {
        img: "img/penn-capsule/capsule-upload-a.webp",
        w: 640,
        h: 402,
      },
      {
        p: "Upload memories into a capsule by drag and drop or file picker. Each upload is handled on the server and streamed directly to S3 before metadata is recorded.",
      },
      {
        p: "Toggle view switches between traditional list layout and 3D capsule gallery. Real time previews animate in WebGL using Spline imported scenes.",
      },
      {
        p: "Create a new capsule by specifying a name, unlock date, and visual theme. The API returns capsule data which the UI immediately renders via React state.",
      },
      {
        img: "img/penn-capsule/capsule-customize-a.webp",
        w: 640,
        h: 402,
      },
      {
        p: "Customize appearance with a decorator service. Color filters are applied to capsule textures.",
      },
      {
        img: "img/penn-capsule/capsule-open-a.webp",
        w: 720,
        h: 453,
      },
      {
        p: "Open a capsule to see all memories.",
      },
    ],
  },
  {
    id: "undertone",
    kind: "work",
    section: "experiments",
    label: "Undertone",
    meta: "Beat synced Metal wallpaper · 2026",
    group: "Graphics",
    title: "Undertone",
    sub: "Beat synced Metal wallpaper for macOS",
    year: "2026",
    tags: ["Swift", "Metal", "Core Audio", "Accelerate"],
    tagline: "Beat synced Metal wallpaper for macOS",
    links: [
      [
        "Full source code available upon request",
        "mailto:ximluo@upenn.edu?subject=Undertone%20code%20request",
      ],
      ["AudioFeatureKit", "https://github.com/ximluo/AudioFeatureKit"],
      ["ProcessTapKit", "https://github.com/ximluo/ProcessTapKit"],
      ["DesktopWindowKit", "https://github.com/ximluo/DesktopWindowKit"],
    ],
    summary:
      "Undertone is a Mac menu bar app I wrote to make my wallpaper move with whatever I'm listening to. It taps the system audio, pulls a palette off the album cover, and runs a single Metal shader that pulses on the beat. Paused, it idles at zero percent CPU. Playing, it costs about a millisecond of GPU a frame.",
    hero: "img/undertone-birds.jpg",
    thumb: "cat/undertone.jpg",
    blocks: [
      {
        p: "Every palette comes out of the album cover. I cluster the artwork's pixels in Oklab, which keeps the colors true as they merge, and I weight each one by how vivid it is, so a small burst of saturated color can outrank a big flat background. A Billie Eilish track lands in deep blue. Skyfall comes out gunbarrel teal. Same field, two songs:",
      },
      {
        row: [
          {
            src: "img/undertone/undertone-birds-a.webp",
            w: 600,
            h: 380,
          },
          {
            src: "img/undertone/undertone-skyfall-a.webp",
            w: 600,
            h: 380,
          },
        ],
      },
      {
        p: "There are two modes. Static sets one still image per track and leaves it there. Dynamic is the live one above. Three styles ship with it, Aurora, Mesh, and Deep, and it all runs from a menu bar panel with an intensity slider, a flow slider that spans a slow drift up to about twenty times that speed, and a live CPU readout. The three styles on one song, plus the panel:",
      },
      {
        row: [
          {
            src: "img/undertone/undertone-aurora-a.webp",
            w: 520,
            h: 329,
          },
          {
            src: "img/undertone/undertone-mesh-a.webp",
            w: 520,
            h: 329,
          },
          {
            src: "img/undertone/undertone-deep-a.webp",
            w: 520,
            h: 329,
          },
          {
            src: "img/undertone/undertone-ui.jpg",
            w: 1200,
            h: 759,
          },
        ],
      },
      {
        p: "Hearing the music took the longest. Spotify closed their audio analysis API to new apps in late 2024, and the good open source audio libraries are all GPL, so I wrote the DSP myself. A Core Audio process tap picks the audio up straight from the OS, which keeps the install to dragging one app over, and from there it's an FFT, spectral flux for onsets, autocorrelation for tempo, and a phase locked loop on top. The loop predicts where the next beat will land, which matters because reacting to a beat lands about 60ms late and reads as sloppy. It also shifts for speaker latency, since the tap hears the audio a moment before your ears do.",
      },
      {
        p: "All the motion runs on springs. Every beat kicks one, so the field contracts, overshoots into an expansion, and rings down in time with the tempo. Bigger hits add a lean that alternates direction each time, so the whole thing rocks back and forth. A momentum value builds through a long section and folds in a slow kneading distortion, so a chorus keeps escalating the longer it runs. How dramatic all of it gets follows a danceability number I compute from how clear and steady the beat is, measured so loudness stays out of it: an orchestral swell stays ambient, club music goes off.",
      },
      {
        p: "The shader is a single full screen pass at half resolution, and the compositor scales it back up for free. The app suspends itself the moment the desktop gets covered, the screen locks, or you unplug and drop to battery, and it sits at a true zero percent CPU once the music stops. Quit it and your original wallpaper comes back. Running live, it costs around five percent CPU.",
      },
      {
        p: "I pulled three reusable pieces out into their own MIT licensed Swift packages. [AudioFeatureKit](https://github.com/ximluo/AudioFeatureKit) is the real time beat and feature extractor, with a synthetic signal test suite. [ProcessTapKit](https://github.com/ximluo/ProcessTapKit) wraps the Core Audio tap and writes down every way I found it to fail silently. [DesktopWindowKit](https://github.com/ximluo/DesktopWindowKit) manages the window that lives behind your desktop icons across displays. The app itself stays private, and I'm happy to send the source on request.",
      },
      {
        p: "Built in Swift with one Metal fragment shader, Core Audio process taps for capture, Accelerate for the FFT, and SwiftUI for the menu bar panel. It runs unsandboxed, so it ships as a notarized download outside the Mac App Store.",
      },
    ],
  },
  {
    id: "painterly",
    kind: "work",
    section: "experiments",
    label: "Painterly",
    meta: "Photo to painting · 2026",
    group: "Graphics",
    title: "Painterly",
    sub: "Photo to painting with computer vision",
    year: "2026",
    tags: ["Python", "OpenCV", "PyTorch"],
    tagline: "Photo to painting with computer vision",
    links: [["GitHub", "https://github.com/ximluo/painterly"]],
    summary:
      "Painterly is a stroke based renderer that turns a photo into a painting the way an artist would make one. It plans about ten thousand brush strokes with classical graphics techniques, understands the scene with computer vision models for depth and saliency, then paints in a human order: a light construction sketch, a wash, the subject before the background, faces coarse to fine with the eyes sharpest. The output is a finished painting plus a build up timelapse of every stroke.",
    hero: "img/painterly/painterly-swan-wide.webp",
    thumb: "cat/painterly.jpg",
    blocks: [
      {
        row: [
          {
            src: "img/painterly/painterly-bridge-a.webp",
            w: 720,
            h: 720,
          },
          {
            src: "img/painterly/painterly-input-bridge.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Every frame is real strokes landing on a canvas. There is no neural style transfer and no video model: the timelapse on the left is painted from the photo on the right, and the same photo and seed always reproduce the same painting, byte for byte. Below is how one painting comes together, step by step.",
      },
      {
        p: "Step 1: see the scene. Computer vision decides where detail will go before a single stroke is planned. [Depth Anything V2](https://arxiv.org/abs/2406.09414) estimates monocular depth (left) and a [BiRefNet](https://arxiv.org/abs/2401.03407) matte isolates the subject (right). Depth is quantile bucketed into paint groups, saliency promotes the subject to the top group, and YuNet face detection with eye landmarks marks where the finest brushes will work.",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-step-depth.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/painterly/painterly-step-matte.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Step 2: sketch, wash, block in. A light gray construction sketch of long straight rough lines opens the painting (left), restated with hand wobble and mocked pen pressure, including the occasional wrong line that gets undone — guided by how process datasets like [Paints-UNDO](https://github.com/lllyasviel/Paints-UNDO) and [Time-Map](https://cragl.cs.gmu.edu/timemap/) show artists actually start. It lives on an overlay and disappears only where paint physically covers it, tracked by a per pixel cover map rather than a timer. A thin wash then tones the paper under the drawing and the block in begins (right): the engine modernizes Hertzmann's [Painterly Rendering with Curved Brush Strokes of Multiple Sizes](https://www.dgp.toronto.edu/papers/aherzmann_SIGGRAPH1998.pdf) (SIGGRAPH 1998), five brush radii painting coarse to fine, each layer seeding strokes only where the canvas still differs from the photo blurred at brush scale. The subject base coat goes down before the background gets anything.",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-step-sketch.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/painterly/painterly-step-blockin.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Step 3: faces first, detail in patches. Faces render coarse to fine with the eyes leading while loose block in strokes keep the rest of the canvas growing (left), so the face is always the most detailed region at any moment of the timelapse. Bodies refine through anatomical zones instead of concentric rings, small brushes finish one patch before moving to the next, finished faces are protected by per face masks so no later stroke can smear them, and a few bright accents close the painting (right).",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-step-face.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/painterly/painterly-painting-bridge.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Step 4: the strokes themselves. Raw Hertzmann strokes meander like worms, so each one is rebuilt: its spine grows along an Edge Tangent Flow field ([Kang, Lee and Chui, Coherent Line Drawing, NPAR 2007](https://dl.acm.org/doi/10.1145/1274871.1274878)) so neighbors stay locally parallel, gets collapsed to a single quadratic Bezier with a 60 degree turn budget — the stroke parameterization used by neural painters like [Paint Transformer](https://arxiv.org/abs/2108.03798) (ICCV 2021) and [Stylized Neural Painting](https://arxiv.org/abs/2011.08114) (CVPR 2021) — and renders as a tapered bristle textured ribbon, wet mixed with the paint underneath. Width and opacity taper on Plamondon's lognormal velocity profile, and width trades against curvature per the [two thirds power law](https://pubmed.ncbi.nlm.nih.gov/6666128/).",
      },
      {
        p: "It took 23 versions to get the process right. Below, the first working version next to the final one, same engine skeleton and same photo: strokes wandered, the sketch was machine perfect, detail rained in randomly, and every region got the same treatment. The flow field, the Bezier turn budget, pressure tapered ribbons, the painter's ordering, and the depth masks are the difference.",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-v1-a.webp",
            w: 720,
            h: 963,
          },
          {
            src: "img/painterly/painterly-cat-a.webp",
            w: 720,
            h: 963,
          },
        ],
      },
      {
        p: "And in stills, the before and after: the photo it was given, and the painting it left behind.",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-input-cat.webp",
            w: 960,
            h: 1282,
          },
          {
            src: "img/painterly/painterly-painting-cat.webp",
            w: 960,
            h: 1283,
          },
        ],
      },
      {
        p: "It generalizes past portraits, since subject first ordering and depth grouping come from the models rather than hand tuning. The swan below is painted from the photo beside it.",
      },
      {
        row: [
          {
            src: "img/painterly/painterly-swan-a.webp",
            w: 720,
            h: 961,
          },
          {
            src: "img/painterly/painterly-input-swan.webp",
            w: 960,
            h: 1280,
          },
        ],
      },
      {
        p: "Built in Python with OpenCV for all stroke planning and rendering, PyTorch for Depth Anything V2, and ONNX Runtime for BiRefNet and YuNet. Cross platform: GPU acceleration uses Apple Silicon MPS or CUDA when available, with a CPU fallback. A 1080p painting renders with its timelapse in about a minute.",
      },
    ],
  },
  {
    id: "portals",
    kind: "work",
    section: "experiments",
    label: "Portals",
    meta: "Unreal VR for Quest · 2025",
    group: "XR",
    title: "Portals Through the Seasons",
    sub: "Unreal Engine VR for Meta Quest 3",
    year: "2025",
    tags: ["Unreal Engine", "Blueprints", "C++"],
    tagline: "Unreal Engine VR for Meta Quest 3",
    summary:
      "A VR journey through Winter and Spring for Meta Quest 3, built in Unreal Engine 5.5. Stepping through a glowing portal streams the next season in around you.",
    hero: "img/portals/spring.jpg",
    thumb: "cat/portals.jpg",
    blocks: [
      {
        p: "Portals through the Season presents a pair of themed levels connected by interactive portals. Entering a portal uses level streaming to load and unload environments instantly. UI widgets built in Blueprints animate activation rings and transition effects. NavMesh enables smooth player movement and teleportation.",
      },
      {
        row: ["img/portals/winter.jpg", "img/portals/spring.jpg"],
        cap: "Winter and Spring, each with its portal",
      },
      {
        embed: "https://www.youtube.com/embed/putNy1s3eL8?si=04OUckwGQPan_b4M",
      },
      {
        link: "doc/Portals.pdf",
        cap: "Slides (PDF)",
      },
    ],
  },
  {
    id: "web-experiments",
    kind: "work",
    section: "experiments",
    label: "Exploratorium",
    meta: "Interactive experiments",
    group: "Web",
    title: "Exploratorium",
    sub: "Interactive web experiments",
    year: "",
    tags: ["JavaScript", "Vite", "React Three Fiber"],
    tagline: "Interactive web experiments",
    summary:
      "Exploratorium is a playground of mini interactive experiments built with React Three Fiber and Vite. Explore a 3D TV model with clickable hotspots that launch creative demos powered by p5.js and smooth CSS animations.",
    hero: "img/web-tv.gif",
    thumb: "cat/web-experiments.jpg",
    blocks: [
      {
        img: "img/web-experiments/web-zoom-a.webp",
        w: 640,
        h: 415,
      },
      {
        p: "The main interface is a 3D TV rendered with React Three Fiber. Hovering circles indicate demos. Click to zoom into each screen. Screen content textures drive camera positioning calculations for smooth transitions.",
      },
      {
        p: "Dive into the demos on the live site: [Exploratorium Live](https://artofthewebxl.github.io)",
      },
      {
        img: "img/web-experiments/web-maze-a.webp",
        w: 360,
        h: 236,
      },
      {
        p: "Maze Generation leverages recursive backtracking in p5.js to carve perfect mazes on a grid. Real time animation shows the algorithm exploring and backtracking.",
      },
      {
        img: "img/web-experiments/web-tree-a.webp",
        w: 640,
        h: 414,
      },
      {
        p: "Procedural Tree Generation uses p5.js and recursion to draw branching fractals. Adjustable parameters let users explore infinitely varied tree structures.",
      },
      {
        img: "img/web-experiments/web-gallery-a.webp",
        w: 640,
        h: 414,
      },
      {
        p: "The CSS Image Gallery features smooth transitions and hover effects. Thumbnails expand and slide fluidly using CSS variables and keyframe animations.",
      },
      {
        img: "img/web-experiments/web-clock-a.webp",
        w: 480,
        h: 357,
      },
      {
        p: "Pixel Clock is a canvas based timepiece built in p5.js.",
      },
      {
        img: "img/web-experiments/web-ascii-a.webp",
        w: 480,
        h: 294,
      },
      {
        p: "Using the characters in the Chinese phrase, 冰山一角 (bīng shān yī jiǎo), which means “The tip of an iceberg”, to create an image of an iceberg. Part of the image should be hidden, which reflects the meaning of the phrase.",
      },
      {
        img: "img/web-experiments/web-still-a.webp",
        w: 480,
        h: 358,
      },
      {
        p: "The CSS still life showcases an animated still life composition created using CSS.",
      },
    ],
  },
  {
    id: "relight",
    kind: "work",
    section: "experiments",
    label: "Relight",
    meta: "Diffusion relighting · 2026",
    group: "ML",
    title: "Relight",
    sub: "Diffusion relighting for art reference",
    year: "2026",
    tags: ["Python", "PyTorch", "TypeScript", "WebGL"],
    tagline: "Diffusion relighting for art reference",
    links: [
      ["Source code upon request", "mailto:ximluo@upenn.edu?subject=Relight%20code%20request"],
    ],
    summary:
      "Relight is a local web app that turns one photo into a relightable art reference. It cuts out the subject, estimates depth and surface normals, and splits color from shading, then lets you drag lights around the subject in real time in the browser. When the lighting feels right, a diffusion pass makes it photoreal. I built it because finding a reference photo with the exact lighting you want is basically impossible, so now I make it instead.",
    hero: "img/relight/relight-window.jpg",
    thumb: "cat/relight.jpg",
    blocks: [
      {
        row: [
          {
            src: "img/relight/relight-final-koala2.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/relight/relight-input-koala.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "One flat photo goes in. The app rebuilds enough of the scene to light it again: what the subject is, how far away everything sits, which way each surface faces, and what color things are before light touches them. The koala above was shot in flat daylight and relit by moonlight. Here is the whole pipeline, step by step.",
      },
      {
        p: "Step 1: understand the photo. [BiRefNet](https://arxiv.org/abs/2401.03407) cuts out the subject, [Depth Anything V2](https://arxiv.org/abs/2406.09414) estimates depth, [DSINE](https://arxiv.org/abs/2403.00712) estimates surface normals, and an intrinsic decomposition separates albedo from shading. Four maps, and the photo stops being flat:",
      },
      {
        row: [
          {
            src: "img/relight/relight-step-mask.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/relight/relight-step-depth.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/relight/relight-step-normals.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/relight/relight-step-albedo.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Step 2: light it live. The browser relights everything at 60 fps in one WebGL fragment shader: up to four draggable lights, HDRI ambient, and a posterize mode that collapses the image into a 2 or 3 value study. Moving a cool key light around the koala:",
      },
      {
        row: [
          {
            src: "img/relight/relight-ui-final.webp",
            w: 960,
            h: 600,
          },
          {
            src: "img/relight/relight-sweep-a.webp",
            w: 720,
            h: 450,
          },
        ],
      },
      {
        p: "Step 3: make it real. The viewport is a fast approximation, so the final pass hands everything to [IC-Light](https://github.com/lllyasviel/IC-Light), a diffusion model that relights from the cutout. Diffusion drifts if you let it, and my early renders came back as a different subject entirely, so I keep it honest: the exact preview on screen becomes its starting image, that image gets biased toward the key light direction so the light lands where I put it, and the prompt matches the mood of the scene so a dark viewport stays dark. A second pass upscales and sharpens the details. The shaded preview on the left becomes the render on the right:",
      },
      {
        row: [
          {
            src: "img/relight/relight-preview-koala.webp",
            w: 960,
            h: 960,
          },
          {
            src: "img/relight/relight-final-koala2.webp",
            w: 960,
            h: 960,
          },
        ],
      },
      {
        p: "Here is the process on another image:",
      },
      {
        row: [
          {
            src: "img/relight/relight-input-lion.webp",
            w: 960,
            h: 1270,
          },
          {
            src: "img/relight/relight-lion-cutout.webp",
            w: 960,
            h: 1270,
          },
          {
            src: "img/relight/relight-lion-depth.webp",
            w: 960,
            h: 1270,
          },
          {
            src: "img/relight/relight-lion-normals.webp",
            w: 960,
            h: 1270,
          },
        ],
      },
      {
        row: [
          {
            src: "img/relight/relight-lion-sweep-a.webp",
            w: 720,
            h: 953,
          },
          {
            src: "img/relight/relight-final-lion.webp",
            w: 960,
            h: 1270,
          },
        ],
      },
      {
        p: "It does more than one subject too: pull a cutout in from a second photo, click to add or refine masks with SAM 2, drop in a background that relights to match, and steer the final render with pieces of your own artwork.",
      },
      {
        p: "Built in Python and TypeScript: a FastAPI backend runs BiRefNet, Depth Anything V2, DSINE, SAM 2 and IC-Light through PyTorch on Apple Silicon, and the frontend is Three.js with a single GLSL shader. A photo processes in about 10 seconds and a final render takes about a minute on an M2.",
      },
    ],
  },
  {
    id: "statistical-learning-returns",
    kind: "work",
    section: "research",
    label: "WDRP",
    meta: "ML in asset pricing · 2025",
    group: "Research",
    title: "Machine Learning in Asset Pricing",
    sub: "Wharton Directed Reading Program project",
    year: "2025",
    tags: ["Python", "R"],
    tagline: "Wharton Directed Reading Program project",
    summary:
      "This Wharton Directed Reading Program project investigates whether asset returns can be predicted using modern statistical learning methods. The research evaluates the efficiency of financial markets by applying both classical econometrics and advanced machine learning models to historical stock data.",
    hero: "img/code/wharton.jpg",
    thumb: "cat/statistical-learning-returns.jpg",
    blocks: [
      {
        p: "Wharton Directed Reading Program, April 24, 2025: MACHINE LEARNING IN ASSET PRICING. Exploring predictability in stock returns. Lead student: Ximing Luo (CS (DMD) and Economics ’27). Mentor: Yiwen Lu (Finance PhD, 2nd Year).",
      },
      {
        p: "Introduction: Challenge. Despite the efficient market hypothesis asserting that prices reflect all available information, subtle anomalies persist. Motivation. Asset prices are dynamic predictions built on evolving data, and machine learning can uncover weak nonlinear signals without strict functional assumptions.",
      },
      {
        p: "Background and Methodology: Reviewed efficient market hypothesis in weak, semi strong, and strong forms. Revisited the fundamental asset pricing equation and CAPM as a benchmark. Designed a hybrid workflow exploring econometric models such as linear regression, ARIMA, and factor models with modern ML such as penalized regression, tree based methods, feed forward and recurrent neural networks, and CNNs for chart image feature extraction.",
      },
      {
        p: "Data, Analysis and Empirical Findings: Used historical prices, technical and fundamental signals, and alternative sources such as news sentiment and OHLC chart images. Extracted features via PCA, NLP topic models, and CNN embeddings. Trained and validated with pseudo out of sample cross validation. Modern ML models achieved higher out of sample R squared and improved trading metrics, revealing double descent behavior in overparameterized regimes.",
      },
      {
        p: "Implications and Future Directions: Modern ML improves return predictability and informs adaptive long short strategies, risk forecasts, and real time integration of alternative data. Future work will deepen sentiment and image based features and develop hybrid frameworks that fuse economic theory with data driven predictions to better capture evolving market dynamics.",
      },
    ],
  },
  {
    id: "ar-mri-point-cloud",
    kind: "work",
    section: "research",
    label: "Penn",
    meta: "AR MRI point clouds · 2023 to 2025",
    group: "XR",
    title: "AR MRI Point Cloud Visualization",
    sub: "AR MRI visualization pipeline",
    year: "2023-2025",
    tags: ["Python", "C#"],
    tagline: "AR MRI visualization pipeline",
    summary:
      "Integrated pipeline automating conversion of patient brain MRIs into high quality 3D point cloud models for augmented reality. Enables collaborative visualization and annotation on Microsoft HoloLens head mounted displays.",
    hero: "img/code/penn-medicine.jpg",
    thumb: "cat/ar-mri-point-cloud.jpg",
    blocks: [
      {
        p: "This project streamlines a manual workflow of medical scan segmentation, mesh cleanup, and file conversion into a single web application. Physicians upload DICOM MRI sequences, automatically generate refined 3D point cloud models, and view or annotate them in real time on multiple AR headsets.",
      },
      {
        p: "Pipeline steps include intensity threshold segmentation on 2D slices, outlier removal that drops points beyond 2.5 standard deviations from each anatomical centroid, and streaming the processed point cloud through a REST API into a Unity based Microsoft HoloLens app for immersive visualization, annotation, and manipulation.",
      },
      {
        p: "Generated two complete point cloud models from brain MRI datasets and rendered them in AR, highlighting challenges with complex neuroanatomy. Ongoing work improves segmentation robustness, adds color coded segment views, and expands support for multi contrast MRI.",
      },
      {
        p: "Worked with Dr. Chamith Rajapakse in Radiology and Orthopedics to optimize machine learning based MRI segmentation workflows in Python and C++ for 3D point cloud generation, and integrated real time AR visualization and annotation on Microsoft HoloLens 2 using Unity and C# for clinical diagnostics.",
      },
    ],
  },
  {
    id: "hci-research-jhu",
    kind: "work",
    section: "research",
    label: "JHU",
    meta: "Human AI interaction · 2022 to 2023",
    group: "Research",
    title: "Human AI Interaction at JHU",
    sub: "Human AI interaction research",
    year: "2022-2023",
    tags: ["Python", "React.js"],
    tagline: "Human AI interaction research",
    summary:
      "Conducted research in the Intuitive Computing Laboratory under Dr Chien Ming Huang. Contributed to projects on two areas of human AI interaction: end to end co creation of visual stories with generative models, and apology strategies to mitigate errors in voice assistants.",
    hero: "img/code/jhu.jpg",
    thumb: "cat/hci-research-jhu.jpg",
    blocks: [
      {
        p: "Contributed to two projects in the Intuitive Computing Lab at Johns Hopkins University, collaborating with PhD students Victor Nikhil Antony and Amama Mahmood. One project introduces an integrated authoring system for visual story creation using LLMs and multimodal generation. The other studies how apology tone and blame assignment affect user perceptions of voice assistants after recognition errors.",
      },
      {
        p: "ID.8: Co Creating Visual Stories with Generative AI. Built an open source React system for a multi stage authoring workflow: collaborative script generation, automated scene parsing into storyboards, and asset creation with generative models. A human in control design keeps users in charge while AI accelerates iteration. User studies found strong usability and enjoyment and produced design guidance for prompt templates, iterative co creation, and consistent AI identity management. For details, see [ID.8: Co Creating Visual Stories with Generative AI](https://doi.org/10.1145/3672277).",
      },
      {
        p: "Owning Mistakes Sincerely: Strategies for Mitigating AI Errors. Ran an online study with a voice based shopping assistant that varied apology style and blame attribution after homonym recognition errors. A serious apology that accepts blame improved recovery satisfaction, perceived intelligence, and likeability, while blaming others could be worse than no apology. For details, see [Owning Mistakes Sincerely: Strategies for Mitigating AI Errors](https://doi.org/10.1145/3491102.3517565).",
      },
    ],
  },
]
