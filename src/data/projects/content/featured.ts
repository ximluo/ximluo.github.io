import type { Project } from "../types"

const featuredProjects: Project[] = [
  {
    id: "petsteps",
    name: "PetSteps",
    image: "/images/petsteps-app.png",
    description:
      "PetSteps is a mobile app that keeps users active by caring for a virtual pet. Real world walking boosts your pet’s mood and health. It won the Adobe Digital Edge Standout Prize and was featured at Adobe MAX 2024 for its use of AI and AR in fitness. Adobe also featured PetSteps in a marketing campaign.",
    languages: ["Swift", "SwiftUI"],
    categories: ["software", "mobile", "AI", "AR"],
    sections: [
      {
        text: "PetSteps won the Digital Edge Standout Prize at Adobe MAX 2024. Adobe highlighted its originality, strong execution, and smart use of AI and AR to support real health goals.",
      },
      {
        image: "/images/adobe-max-2024.jpeg",
      },
      {
        text: "Users walk to earn coins, unlock pets and items, and interact with pets in augmented reality. The app tracks distance, pace, and duration with CoreMotion and HealthKit, and shows progress with simple charts. Coach Fluff gives personalized tips using the Gemini API. Weather updates use Open Meteo and Nominatim with CoreLocation.",
      },
      {
        text: "Built in Swift and SwiftUI with MVVM. AR uses RealityKit. Coaching uses Gemini with goal tracking and custom prompts. Data comes from CoreMotion, HealthKit, and CoreLocation. Storage uses CoreData. Async data handling keeps the UI smooth with live sensors and API calls.",
      },
      {
        text: "The core loop is simple: move more and your pet is happy and energized. Slow down and your pet gets tired and hungry. That emotional feedback helps build habits. Bringing your pet into the real world also adds another layer of emotional bonding.",
      },
      {
        text: "PetSteps was built for people who struggle with motivation. It makes exercise feel playful, personal, and easy to stick with.",
      },
    ],
  },
  {
    id: "mini-minecraft",
    name: "Mini Minecraft",
    image: "/images/mini-minecraft.gif",
    description:
      "Custom built 3D voxel game engine inspired by Minecraft, featuring procedural terrain, day night cycles, dynamic lighting, instanced rendering, and a post processing pipeline. I implemented the player physics, raycast based block interaction, and immersive visual effects such as a time interpolated sky with sun arcs, distance fog blending, and a post process system for water and lava overlays.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics"],
    sections: [
      {
        video: "https://www.youtube.com/embed/kr7ze2p7Tx8?si=f6Pqu8gN6oUHypdi",
      },
      {
        text: "A 3D voxel game engine inspired by Minecraft, built with C++ and OpenGL. It features procedural terrain generation, efficient chunk streaming, day night lighting, and a custom shader pipeline.",
      },
      {
        text: "Physics system supports flying and grounded movement, with gravity, acceleration, and collision detection. Collisions are handled per axis for smooth sliding. Precise block interaction using ray casting from the camera, enabling players to mine and place blocks with pixel accuracy.",
      },
      {
        text: "For the day night cycle, procedurally animated the sun’s arc and sky color using GLSL, interpolating between time intervals to simulate realistic transitions. Lighting was synced with the sun’s direction and color. Distance based fog adjusts dynamically to sky hues using smoothstep blending, creating a seamless atmospheric fade at horizon level.",
      },
      {
        text: "Cave generation system using 3D Perlin noise, populating underground layers with air pockets, lava pools, and bedrock. Optimized sampling by bounding height ranges during development. Post processing pipeline to tint the screen when entering water or lava, using framebuffer textures and fullscreen shaders.",
      },
    ],
  },
  {
    id: "penn-mobile",
    name: "Penn Mobile",
    image: "/images/mobile.png",
    description:
      "Penn Mobile is the University of Pennsylvania’s official student life app, serving 20,000+ users. Developed by Penn Labs, it brings campus essentials like dining hours, GSR reservations, laundry availability, and student resources directly to students’ phones.",
    languages: ["Swift", "SwiftUI"],
    categories: ["software", "mobile", "iOS", "student tools"],
    sections: [
      {
        text: "Learn more at [pennlabs.org/products/penn-mobile](https://pennlabs.org/products/penn-mobile).",
      },
      {
        text: "With Penn Mobile, students can reserve study rooms across campus, view dining hall menus and hours, check real time laundry availability, and access essential university resources, all from one centralized app.",
      },
      {
        text: "Features include push notifications for upcoming reservations, daily laundry activity graphs, campus wide contact info, access to the Daily Pennsylvanian feed, and more. It’s designed to make campus life easier, faster, and more mobile friendly.",
      },
    ],
  },
  {
    id: "penn-capsule",
    name: "Capsule",
    image: "/images/capsule-open.gif",
    description:
      "Penn Capsule transforms photo collections into interactive 3D time capsules that unlock on a specified date. Users customize capsule appearance, upload memories, and later experience a dynamic timelapse of their photos in a 3D environment.",
    languages: ["TypeScript", "Node.js", "AWS S3", "MongoDB", "React Three Fiber"],
    categories: ["software", "web", "3D", "fullstack"],
    sections: [
      {
        text: "On the frontend, React Three Fiber renders the 3D capsules. Capsules animate open, revealing embedded photos arranged chronologically around the interior. Users interact via orbit controls in an immersive 3D view.",
      },
      {
        text: "On the backend, handle file uploads server side to AWS S3 via the AWS SDK, define MongoDB collections for Users and Time Capsules using the native driver, secure routes with JWT, and enable Google OAuth single sign on.",
      },
      {
        image: "/images/capsule-upload.gif",
      },
      {
        text: "Upload memories into a capsule by drag and drop or file picker. Each upload is handled on the server and streamed directly to S3 before metadata is recorded.",
      },
      {
        text: "Toggle view switches between traditional list layout and 3D capsule gallery. Real time previews animate in WebGL using Spline imported scenes.",
      },
      {
        text: "Create a new capsule by specifying a name, unlock date, and visual theme. The API returns capsule data which the UI immediately renders via React state.",
      },
      {
        image: "/images/capsule-customize.gif",
      },
      {
        text: "Customize appearance with a decorator service. Color filters are applied to capsule textures.",
      },
      {
        image: "/images/capsule-open.gif",
      },
      {
        text: "Open a capsule to see all memories.",
      },
      {
        video: "/images/PennCapsule.pdf",
      },
    ],
  },
  {
    id: "pbr-renderer",
    name: "Real time Physically Based Renderer",
    image: "/images/pbr.png",
    description:
      "A real time shading project from Penn’s Advanced Rendering course. Implements the energy conserving Cook Torrance microfacet BRDF using the Trowbridge Reitz GGX distribution, Schlick’s Fresnel approximation, and the Smith Schlick GGX geometry term.",
    languages: ["C++", "GLSL", "OpenGL"],
    categories: ["graphics", "rendering"],
    sections: [
      {
        text: "The PBR shader screenshot shows the microfacet model in action. Metallicness is toggled between zero and one via GUI sliders, and roughness is held around 0 to illustrate reflectiveness.",
      },
      {
        image: "/images/pbr-gui.png",
      },
      {
        text: "All lighting and material calculations run in the fragment shader. Material properties like albedo, metallicness, and roughness are sampled from textures when available or controlled with GUI sliders otherwise.",
      },
      {
        text: "Image based lighting uses two precomputed cubemaps: one for diffuse irradiance and one for glossy irradiance. The shader samples the diffuse map using surface normals and the glossy map using the reflected view vector.",
      },
      {
        image: "/images/pbr-displacement.png",
      },
      {
        text: "Vertex displacement is driven by a height map in the vertex shader. Vertices are offset along interpolated normals before tangent space normal mapping adds fine surface detail.",
      },
      {
        image: "/images/pbr-albedo.png",
      },
      {
        text: "When a model provides its own albedo texture, the shader samples its base color and feeds it into both the Lambertian diffuse irradiance and Cook Torrance specular equations for accurate material appearance.",
      },
      {
        text: "The renderer maintains full refresh rates without dropped frames, demonstrating that even with PBR and displacement, real time performance is achievable.",
      },
      {
        text: "For full implementation details, see [Real Shading in Unreal Engine 4](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf).",
      },
      {
        text: "Beyond the core PBR pipeline, two advanced rendering features were developed as course extensions.",
      },
      {
        text: "Deferred Rendering and Screen Space Reflection: A multi pass deferred pipeline first renders scene attributes into a G buffer with attachments for albedo, world space normals, specular, and depth. The SSR pass reconstructs view space positions and normals, reflects view vectors, and performs iterative ray marching in screen space to sample G buffer data. A binary search refines intersection points before separable Gaussian blur applies glossy falloff. The final composite blends these reflections with direct Cook Torrance lighting.",
      },
      {
        image: "/images/pbr-ssr.png",
      },
      {
        text: "Signed Distance Fields and Subsurface Scattering: A ray marched SDF shader steps along view rays using the sceneSDF composed of primitive SDF operations. Upon hit detection, the Cook Torrance BSDF calculates local lighting. Subsurface scattering uses a thinness metric computed via opposite direction SDF queries to attenuate light transmitted through the material, blended with diffuse irradiance for translucent effects. Scene repetition applies SDF repetition functions to clone the building elements across the environment.",
      },
      {
        image: "/images/sdf-sub.png",
      },
    ],
  },
  {
    id: "gpu-path-tracer",
    name: "Monte Carlo Path Tracer",
    image: "/images/monte-carlo.png",
    description:
      "An offline Monte Carlo path tracer implemented in C++. Supports multiple integrators, area and point lights, BxDF models, depth of field, and a custom ray intersection engine.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics", "rendering"],
    sections: [
      {
        text: "This path tracer solves the light transport equation on the GPU using Monte Carlo integration, with a flexible framework for different sampling strategies and material models.",
      },
      {
        text: "Global Illumination Integrator: The full integrator combines the MIS direct integrator with indirect bounces at each path vertex. By adding environment and interreflection contributions, it converges to a physically accurate result faster than the naive approach.",
      },
      {
        image: "/images/pathtracer-cornell-area.png",
      },
      {
        text: "Cornell Box with Area Light: Uniformly sampling the ceiling light produces soft, realistic shadows and subtle red green light bleeding on the walls and floor.",
      },
      {
        image: "/images/pathtracer-cornell-env.png",
      },
      {
        text: "Cornell Box with Environment Lighting: Without explicit lights, the environment map alone illuminates the scene. Multiple importance sampling ensures smooth, low variance results.",
      },
      {
        image: "/images/pathtracer-cornell-spotlight.png",
      },
      {
        text: "Cornell Box with Spotlight: A cone shaped light source uses importance sampling within its solid angle for focused illumination and natural falloff.",
      },
      {
        image: "/images/monte-carlo.png",
      },
      {
        text: "Earth Scene: An Earth and a moon lit by a distant environment map, rendered with the full integrator. Soft shadows, realistic color bleeding, and ambient illumination demonstrate the combined direct and indirect lighting.",
      },
      {
        image: "/images/pathtracer-cornell-glass.png",
      },
      {
        text: "Cornell Box with Glass Ball: This scene adds a refractive glass sphere. Fresnel reflectance and transmission are computed per Schlick’s approximation, resulting in realistic caustics and subtle light bending.",
      },
      {
        image: "/images/pathtracer-global.png",
      },
      {
        text: "The tracer supports Lambertian diffuse, microfacet specular with GGX distribution, and refractive BxDFs. Glass like materials simulate both reflection and refraction via Fresnel equations.",
      },
      {
        text: "Depth of field implemented with a thin lens camera model. Rays originate from a disk aperture and converge on the focal plane, producing natural focus blur. Built atop a custom ray intersection framework with Camera, Shape, and Primitive classes. Russian roulette termination and configurable bounce limits prevent runaway computation. Below are some more integrator examples:",
      },
      {
        text: "Naive Integrator: The simplest integrator casts random hemisphere samples at each bounce and returns lighting only when a ray directly hits a light source. Renders converge very slowly and show noticeable grain at low sample counts.",
      },
      {
        image: "/images/pathtracer-naive.png",
      },
      {
        text: "Direct Lighting Integrator: This version samples scene lights explicitly, choosing random points on area or point lights to compute direct contributions. Shadows and highlights are crisp, but indirect bounces are not accounted for.",
      },
      {
        image: "/images/pathtracer-direct.png",
      },
      {
        text: "Multiple Importance Sampling Integrator: To reduce variance across lights and materials, this integrator blends BSDF sampling with light sampling via the power heuristic. It produces cleaner direct lighting and fewer noise artifacts on glossy surfaces. Compare the results of MIS (left) with Naive Integrator only (center) and with Direct Integrator only (right).",
      },
      {
        image: "/images/pathtracer-mis.png",
      },
    ],
  },
]

export default featuredProjects
