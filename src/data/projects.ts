// data/projects.ts
export interface Section {
  text?: string;
  image?: string;
  video?: string;
}

export interface Project {
  id: string;
  name: string;
  image: string;
  description: string;
  languages: string[];
  categories: string[];
  sections: Section[];
}

const projects: Project[] = [
  // petsteps $$$
  {
    id: "petsteps",
    name: "PetSteps",
    image: "/images/petsteps.png",
    description:
      "PetSteps is a mobile app that motivates users to stay active by caring for a virtual pet. Users walk in real life to keep their pet happy and healthy. The app won the Adobe Digital Edge Standout Prize and was featured at Adobe MAX 2024 for its creative and impactful use of AI and AR to make fitness more engaging.",
    languages: ["Swift", "SwiftUI"],
    categories: ["software", "mobile", "AI", "AR"],
    sections: [
      {
        text:
          "PetSteps was recognized at Adobe MAX 2024 with the Digital Edge Standout Prize. The judges praised it as an original, well-executed project that successfully blends emerging technology with real-world health goals. They highlighted its data-driven design and thoughtful use of augmented reality and artificial intelligence to create a fun and effective fitness experience.",
      },
      {
        image: "/images/adobe-max-2024.jpeg"
      },
      {
        text:
          "PetSteps includes a range of interactive features. Users can walk to earn coins, buy new pets and food, interact with their pet in AR, and chat with an AI fitness coach for personalized support. Real-time stats like distance, pace, and duration are tracked using CoreMotion and HealthKit. Visual graphs help users track progress over time. The in-app coach, Coach Fluff, uses the Gemini API to provide contextual advice and motivation based on user history and goals. Weather updates are personalized based on current location using Open Meteo and Nominatim APIs.",
      },
      {
        text:
          "Built in Xcode using Swift and SwiftUI, the app follows the MVVM architecture pattern for clean separation of logic and UI. Augmented reality interactions were implemented using Apple’s RealityKit framework, allowing pets to appear naturally in the user’s environment. The AI coaching experience was developed using Google's Gemini API and dynamically responds to user behavior using custom prompts and goal-tracking logic. All motion and health data is pulled from CoreMotion and HealthKit, while CoreLocation and Open Meteo power real-time weather personalization. Persistent storage and user state are managed through CoreData. Extensive use of asynchronous data flows and reactive UI updates ensures performance stays smooth even with real-time sensor and API inputs.",
      },
      {
        video: "/images/petsteps-slides.pdf"
      },
      {
        text:
          "The app encourages physical activity by turning it into a game. Users care for a virtual pet that reacts in real time to how active they are. If they walk, the pet is energized and happy. If they stop, the pet becomes tired and hungry. This simple mechanic creates emotional accountability and builds positive habits.",
      },

      {
        text:
          "PetSteps was designed to make staying active feel rewarding, especially for users who struggle with motivation. By combining emotional engagement with gamified movement and smart technology, it turns everyday exercise into something playful, personal, and consistent."
      },
      {
        text:
          "Adobe spotlighted PetSteps in one of its marketing campaigns. Watch it below!"
      },
      {
        video: "https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7306349381673197569?compact=1"
      },
    ]
  },

  // mini minecraft
  {
    id: "mini-minecraft",
    name: "Mini Minecraft",
    image: "/images/mini-minecraft.gif",
    description:
      "Custom-built 3D voxel game engine inspired by Minecraft, featuring procedural terrain, day-night cycles, dynamic lighting, instanced rendering, and a post-processing pipeline. I implemented the player physics, raycast-based block interaction, and immersive visual effects such as a time-interpolated sky with sun arcs, distance fog blending, and a post-process system for water/lava overlays.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics"],
    sections: [
      {
        video:
          "https://www.youtube.com/embed/kr7ze2p7Tx8?si=f6Pqu8gN6oUHypdi",
      },
      {
        text:
          "A 3D voxel game engine inspired by Minecraft, built with C++ and OpenGL. It features procedural terrain generation, efficient chunk streaming, day-night lighting, and a custom shader pipeline.",
      },
      {
        text:
          "My physics system supports flying and grounded movement, with gravity, acceleration, and collision detection. Collisions are handled per-axis for smooth sliding. I also implemented precise block interaction using ray casting from the camera, enabling players to mine and place blocks with pixel accuracy.",
      },
      {
        text:
          "For the day-night cycle, I procedurally animated the sun’s arc and sky color using GLSL, interpolating between time intervals to simulate realistic transitions. Lighting was synced with the sun’s direction and color. I also implemented distance-based fog that adjusts dynamically to sky hues using smoothstep blending, creating a seamless atmospheric fade at horizon level.",
      },
      {
        text:
          "I designed a cave generation system using 3D Perlin noise, populating underground layers with air pockets, lava pools, and bedrock. To support this, I optimized sampling by bounding height ranges during development. I also added a post-processing pipeline to tint the screen when entering water or lava, using framebuffer textures and fullscreen shaders.",
      },
    ],
  },

  // penn labs
  {
    id: "penn-mobile",
    name: "Penn Mobile",
    image: "/images/mobile.png",
    description:
      "Penn Mobile is the University of Pennsylvania’s official student life app, serving 20,000+ users. Developed by Penn Labs, it brings campus essentials—like dining hours, GSR reservations, laundry availability, and student resources—directly to students’ phones.",
    languages: ["Swift", "SwiftUI"],
    categories: ["software", "mobile", "iOS", "student tools"],
    sections: [
      {
        text:
          "As part of the iOS team at Penn Labs, I contribute to maintaining and shipping new features on the Penn Mobile app. We work in Swift and SwiftUI, using modern development practices to build a fast and reliable experience for Penn students. Learn more at [pennlabs.org/products/penn-mobile](https://pennlabs.org/products/penn-mobile)."
      },
      {
        text:
          "With Penn Mobile, students can reserve study rooms (GSRs) across campus, view dining hall menus and hours, check real-time laundry availability, and access essential university resources—all from one centralized app."
      },
      {
        text:
          "Features include push notifications for upcoming reservations, daily laundry activity graphs, campus-wide contact info, access to the Daily Pennsylvanian feed, and more. It’s designed to make campus life easier, faster, and more mobile-friendly."
      }
    ]
  },

  // monte carlo path tracer
  {
    id: "cpu-path-tracer",
    name: "CPU-Based Monte Carlo Path Tracer",
    image: "/images/monte-carlo.png",
    description:
      "An offline Monte Carlo path tracer implemented in C++. Supports multiple integrators, area and point lights, BxDF models, depth of field, and a custom ray intersection engine.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics", "rendering"],
    sections: [
      {
        text:
          "This path tracer solves the light transport equation on the CPU using Monte Carlo integration, with a flexible framework for different sampling strategies and material models."
      },
      {
        text:
          "Global Illumination Integrator: The full integrator combines the MIS direct integrator with indirect bounces at each path vertex. By adding environment and interreflection contributions, it converges to a physically accurate result faster than the naive approach."
      },
      {
        image: "/images/pathtracer-cornell-area.png"
      },
      {
        text:
          "Cornell Box with Area Light: Uniformly sampling the ceiling light produces soft, realistic shadows and subtle red-green light bleeding on the walls and floor."
      },
      {
        image: "/images/pathtracer-cornell-env.png"
      },
      {
        text:
          "Cornell Box with Environment Lighting: Without explicit lights, the environment map alone illuminates the scene. Multiple importance sampling ensures smooth, low-variance results."
      },
      {
        image: "/images/pathtracer-cornell-spotlight.png"
      },

      {
        text:
          "Cornell Box with Spotlight: A cone-shaped light source uses importance sampling within its solid angle for focused illumination and natural falloff."
      },
      {
        image: "/images/monte-carlo.png"
      },
      {
        text:
          "Earth Scene: An Earth and a moon lit by a distant environment map, rendered with the full integrator. Soft shadows, realistic color bleeding, and ambient illumination demonstrate the combined direct and indirect lighting."
      },
      {
        image: "/images/pathtracer-cornell-glass.png"
      },
      {
        text:
          "Cornell Box with Glass Ball: This scene adds a refractive glass sphere. Fresnel reflectance and transmission are computed per Schlick’s approximation, resulting in realistic caustics and subtle light bending."
      },
      {
        image: "/images/pathtracer-global.png"
      },
      {
        text:
          "The tracer supports Lambertian diffuse, microfacet specular with GGX distribution, and refractive BxDFs. Glass-like materials simulate both reflection and refraction via Fresnel equations."
      },
      {
        text:
          "Depth of field implemented with a thin lens camera model. Rays originate from a disk aperture and converge on the focal plane, producing natural focus blur. Built atop a custom ray intersection framework with Camera, Shape, and Primitive classes. Russian roulette termination and configurable bounce limits prevent runaway computation. Below are some more integrator examples:"
      },
      {
        text:
          "Naive Integrator: The simplest integrator casts random hemisphere samples at each bounce and returns lighting only when a ray directly hits a light source. Renders converge very slowly and show noticeable grain at low sample counts."
      },
      {
        image: "/images/pathtracer-naive.png"
      },
      {
        text:
          "Direct Lighting Integrator: This version samples scene lights explicitly, choosing random points on area or point lights to compute direct contributions. Shadows and highlights are crisp, but indirect bounces are not accounted for."
      },
      {
        image: "/images/pathtracer-direct.png"
      },
      {
        text:
          "Multiple Importance Sampling Integrator: To reduce variance across lights and materials, this integrator blends BSDF sampling with light sampling via the power heuristic. It produces cleaner direct lighting and fewer noise artifacts on glossy surfaces. Compare the results of MIS (left) with Naive Integrator only (center) and with Direct Integrator only (right)."
      },
      {
        image: "/images/pathtracer-mis.png"
      },
    ]
  },

  // real-time pbr renderer
  {
    id: "pbr-renderer",
    name: "Real-time Physically-Based Renderer",
    image: "/images/pbr.png",
    description:
      "A real-time shading project from Penn’s Advanced Rendering course. Implements the energy-conserving Cook-Torrance microfacet BRDF using the Trowbridge-Reitz GGX distribution, Schlick’s Fresnel approximation, and the Smith Schlick-GGX geometry term.",
    languages: ["C++", "GLSL", "OpenGL"],
    categories: ["graphics", "rendering"],
    sections: [
      {
        text:
          "The PBR shader screenshot shows the microfacet model in action. Metallicness is toggled between zero and one via GUI sliders, and roughness is held around 0 to illustrate reflectiveness."
      },
      {
        image: "/images/pbr-gui.png"
      },
      {
        text:
          "All lighting and material calculations run in the fragment shader. Material properties like albedo, metallicness, and roughness are sampled from textures when available or controlled with GUI sliders otherwise."
      },
      {
        text:
          "Image-based lighting uses two precomputed cubemaps: one for diffuse irradiance and one for glossy irradiance. The shader samples the diffuse map using surface normals and the glossy map using the reflected view vector."
      },
      {
        image: "/images/pbr-displacement.png"
      },
      {
        text:
          "Vertex displacement is driven by a height map in the vertex shader. Vertices are offset along interpolated normals before tangent-space normal mapping adds fine surface detail."
      },
      {
        image: "/images/pbr-albedo.png"
      },
      {
        text:
          "When a model provides its own albedo texture, the shader samples its base color and feeds it into both the Lambertian diffuse irradiance and Cook-Torrance specular equations for accurate material appearance."
      },
      {
        text:
          "The renderer maintains full refresh rates without dropped frames, demonstrating that even with PBR and displacement, real-time performance is achievable."
      },
      {
        text:
          "For full implementation details, see [Real Shading in Unreal Engine 4](https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf)."
      },
      {
        text:
          "Beyond the core PBR pipeline, two advanced rendering features were developed as course extensions."
      },
      {
        text:
          "Deferred Rendering & Screen-Space Reflection: A multi-pass deferred pipeline first renders scene attributes into a G-buffer with attachments for albedo, world-space normals, specular, and depth. The SSR pass reconstructs view-space positions and normals, reflects view vectors, and performs iterative ray marching in screen-space to sample G-buffer data. A binary search refines intersection points before separable Gaussian blur applies glossy falloff. The final composite blends these reflections with direct Cook-Torrance lighting."
      },
      {
        image: "/images/pbr-ssr.png"
      },
      {
        text:
          "Signed Distance Fields & Subsurface Scattering: A ray-marched SDF shader steps along view rays using the sceneSDF composed of primitive SDF operations. Upon hit detection, the Cook-Torrance BSDF calculates local lighting. Subsurface scattering uses a thinness metric—computed via opposite-direction SDF queries—to attenuate light transmitted through the material, blended with diffuse irradiance for translucent effects. Scene repetition applies SDF repetition functions to clone the building elements across the environment."
      },
      {
        image: "/images/sdf-sub.png"
      },
      {
        image: "/images/sdf-cottage.png"
      },
      {
        image: "/images/sdf-cottages.png"
      },
    ]
  },

  // time capsule
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
        text:
          "On the frontend, React Three Fiber renders the 3D capsules. Capsules animate open, revealing embedded photos arranged chronologically around the interior. Users interact via orbit controls in an immersive 3D view."
      },
      {
        text:
          "On the backend, handle file uploads server-side to AWS S3 via the AWS SDK (images, videos, text, etc.), define MongoDB collections for Users and Time Capsules using the native driver, secure routes with JWT, and enable Google OAuth single-sign-on."
      },
      {
        image: "/images/capsule-login.gif"
      },
      {
        text:
          "Log in with email or Google OAuth to access your personal dashboard. Auth tokens persist in secure HTTP-only cookies for seamless reconnection."
      },
      {
        image: "/images/capsule-upload.gif"
      },
      {
        text:
          "Upload memories into a capsule by drag-and-drop or file picker. Each upload is handled on the server and streamed directly to S3 before metadata is recorded."
      },
      {
        image: "/images/capsule-create.gif"
      },
      {
        text:
          "Toggle view switches between traditional list layout and 3D capsule gallery. Real-time previews animate in WebGL using Spline-imported scenes."
      },
      {
        text:
          "Create a new capsule by specifying a name, unlock date, and visual theme. The API returns capsule data which the UI immediately renders via React state."
      },
      {
        image: "/images/capsule-customize.gif"
      },
      {
        text:
          "Customize appearance with a decorator service. Color filters are applied to capsule textures."
      },
      {
        image: "/images/capsule-open.gif"
      },
      {
        text:
          "Open a capsule to see all memories."
      },
      {
        video: "/images/PennCapsule.pdf"
      },
    ]
  },

  // rewind
  {
    id: "rewind",
    name: "Rewind",
    image: "/images/rewind.png",
    description:
      "Rewind is an AR memory-recall app that won the InterSystems Challenge at HackMIT 2024, integrated with the Apple Vision Pro. It uses Gaussian splatting for 3D scene generation and a Langchain-based RAG pipeline with InterSystems IRIS Vector Search for natural-language memory queries.",
    languages: [
      "React", "WebXR",
      "Python",
      "LangChain", "IRIS Vector Search"
    ],
    categories: ["software", "AR", "AI", "healthtech"],
    sections: [
      {
        text:
          "Gaussian Splatting 3D Scene Generation We convert user video clips into point-cloud environments using a custom Python pipeline and render them in real time with Three.js and WebXR. Users can navigate their memories in 360° AR."
      },
      {
        text:
          "Backend Architecture The Flask API manages user sessions, stores memory metadata in a relational SQL database, and coordinates scene jobs. Each memory record includes timestamps, tags, and AR scene links."
      },
      {
        text:
          "RAG with Vector Search We embed memory metadata and textual notes into vectors using Langchain’s embedding models. These vectors are indexed in InterSystems IRIS Vector Search. At query time, user questions are embedded, top-K matching memories are retrieved, and the app surfaces exact moments—e.g. “Show my graduation day”."
      },
      {
        text:
          "Frontend Interaction The React.js client provides a simple navigable UI."
      },
      {
        video: "/images/Rewind.pdf"
      },
      {
        text:
          "Rewind’s combination of immersive AR, Gaussian splatting, and a Langchain-powered RAG search pipeline creates a novel tool for accessible memory care."
      }
    ]
  },

  //CIS 1951
  {
    id: "cis-1951",
    name: "iOS Programming Course (CIS 1951)",
    image: "/images/cis1951.png",
    description:
      "A hands-on iOS development course at the University of Pennsylvania covering Swift, SwiftUI, UIKit, and Apple frameworks. Includes weekly lectures, assignments, and a final team project.",
    languages: ["Swift", "SwiftUI"],
    categories: ["software", "course", "iOS", "education"],
    sections: [
      {
        text:
          "I will be teaching the CIS 1951 course in Fall 2025. I previously TA’d the course in Fall 2024, where I hosted office hours, debugged student projects, and reviewed SwiftUI assignments."
      },
      {
        text:
          "The course introduces core iOS concepts like MVVM architecture, app navigation, data persistence, sensor integration, and UI design using Swift and SwiftUI."
      },
      {
        text:
          "Course materials and starter code are available at [cis1951 GitHub](https://github.com/orgs/cis1951/repositories)."
      }
    ]
  },

  //HCI research 
  {
    "id": "hci-research-jhu",
    "name": "Human–AI Interaction Projects at Johns Hopkins University",
    "image": "/images/hci.png",
    "description": "Conducted research in the Intuitive Computing Laboratory under Dr. Chien-Ming Huang, contributed to projects examining two aspects of human-AI interaction: end-to-end co-creation of visual stories with generative models, and apology strategies to mitigate errors in voice assistants.",
    "languages": ["Python", "React.js"],
    "categories": ["software", "HCI", "Generative AI", "User Studies"],
    "sections": [
      {
        "text": "Contributed to two projects carried out in the Intuitive Computing Lab at Johns Hopkins University, collaborating with PhD students Victor Nikhil Antony and Amama Mahmood. The first introduces an integrated authoring system (ID.8) for visual story creation, leveraging LLMs and multimodal generative AI. The second investigates how varying apology sincerity and blame assignment affects user perceptions of voice-based assistants after recognition errors."
      },
      {
        "text": "ID.8: Co-Creating Visual Stories with Generative AI—An open-source ReactJS system supports a multi-stage workflow for visual story authoring: collaborative script generation with ChatGPT, automated scene parsing into a storyboard, and asset creation via Stable Diffusion, AudioGen, and MusicGen. A “human-in-control, AI-in-the-loop” design balances user autonomy with AI assistance. Two user studies (in-lab, N=11; in-the-field, N=6) yielded strong SUS scores (77.25 and 63.33), high enjoyment, exploration, and expressiveness ratings, and surfaced design guidelines for prompt templates, iterative co-creation, and unified AI identity management. For full implementation details, see [ID.8: Co-Creating Visual Stories with Generative AI](https://doi.org/10.1145/3672277). ACM Transactions on Interactive Intelligent Systems, Volume 14, Issue 3, Article 20, Pages 1–29 (2024)."
      },
      {
        "text": "Owning Mistakes Sincerely: Strategies for Mitigating AI Errors—An online study (N=37) with a voice-based shopping assistant manipulated apology style (serious vs. casual) and blame attribution (internal vs. external). Recovery from homonym recognition errors was followed by one of five agent responses. Results show that a serious apology accepting blame maximizes service recovery satisfaction, perceived intelligence, and likeability, whereas blaming others can be worse than no apology at all. Findings inform design of error mitigation in conversational AI. For full study details, see [Owning Mistakes Sincerely: Strategies for Mitigating AI Errors](https://doi.org/10.1145/3491102.3517565). Proceedings of the 2022 ACM Conference on Human Factors in Computing Systems (CHI ’22), Article 578, Pages 1–11."
      }
    ]
  },

  // AR research
  {
    "id": "ar-mri-point-cloud",
    "name": "AR MRI Point-Cloud Generation and Visualization",
    "image": "/images/ar-mri.png",
    "description": "A fully integrated web-based pipeline automates the conversion of patient brain MRIs into high-quality 3D point-cloud models and enables collaborative visualization and annotation on Microsoft HoloLens head-mounted displays.",
    "languages": ["Python", "C#"],
    "categories": ["software", "Augmented Reality", "Medical Imaging", "Web Development"],
    "sections": [
      {
        "text": "This project streamlines the manual multi‐tool workflow of medical-scan segmentation, mesh cleanup, and file conversion into a single web application. Physicians can upload DICOM MRI sequences, automatically generate refined 3D point-cloud (.ply) models, and view or annotate them in real time on multiple AR headsets."
      },
      {
        "text": "First, intensity-threshold segmentation isolates soft and hard tissue regions in 2D MRI slices. Next, outlier-removal filters the point cloud by discarding points beyond 2.5 standard deviations from each anatomical centroid. Finally, the processed point cloud is streamed via a REST API into a Unity-powered Microsoft HoloLens app for immersive visualization, collaborative annotation, and interactive manipulation."
      },
      {
        "text": "From brain MRI datasets, two complete point-cloud models were generated and successfully rendered in AR, highlighting challenges in handling high-complexity neuroanatomy. Ongoing work focuses on robustifying segmentation algorithms, enhancing color-coded segment visualization, and expanding to multi-contrast MRI modalities."
      },
      {
        "text": "Worked with Dr. Chamith Rajapakse (Departments of Radiology & Orthopedics) to optimize machine learning–based MRI segmentation workflows in Python and C++ for 3D point-cloud generation, and integrated real-time AR visualization and annotation on Microsoft HoloLens 2 using Unity and C# for enhanced clinical diagnostics."
      }
    ]
  },

  // Art of the Web
  {
    id: "web-experiments",
    name: "Web Exploratorium",
    image: "/images/web-tv.gif",
    description:
      "Web Exploratorium is a playground of mini interactive experiments built with React Three Fiber and Vite. Explore a 3D TV model with clickable hotspots that launch creative demos powered by p5.js and smooth CSS animations.",
    languages: ["JavaScript", "Vite", "React Three Fiber"],
    categories: ["software", "web", "interactive", "3D"],
    sections: [
      {
        image: "/images/web-zoom.gif"
      },
      {
        text:
          "The main interface is a 3D TV rendered with React Three Fiber. Hovering circles indicate demos—click to zoom into each screen. Screen content textures drive camera positioning calculations for smooth transitions."
      },
      {
        text:
          "Dive into the demos on the live site: [Web Exploratorium Live](https://artofthewebxl.github.io)"
      },
      {
        image: "/images/web-maze.gif"
      },
      {
        text:
          "Maze Generation leverages recursive backtracking in p5.js to carve perfect mazes on a grid. Real-time animation shows the algorithm exploring and backtracking."
      },
      {
        image: "/images/web-tree.gif"
      },
      {
        text:
          "Procedural Tree Generation uses p5.js and recursion to draw branching fractals. Adjustable parameters let users explore infinitely varied tree structures."
      },
      {
        image: "/images/web-gallery.gif"
      },
      {
        text:
          "The CSS Image Gallery features smooth transitions and hover effects. Thumbnails expand and slide fluidly using CSS variables and keyframe animations."
      },
      {
        image: "/images/web-clock.gif"
      },
      {
        text:
          "Pixel Clock is a canvas-based timepiece built in p5.js."
      },
      {
        image: "/images/web-ascii.gif"
      },
      {
        text:
          " Using the characters in the Chinese phrase, 冰山一角 (bīng shān yī jiǎo), which means 'The tip of an iceberg' to create an image of an iceberg. Part of the image should be hidden, which reflects the meaning of the phrase."
      },
      {
        image: "/images/web-still.gif"
      },
      {
        text:
          "The CSS still life showcases an animated still life composition creating using CSS."
      }
    ]
  },

  // lost at penn
  {
    id: "lost-at-penn",
    name: "Lost@Penn",
    image: "/images/lost.png",
    description:
      "Lost@Penn is a web platform that helps the Penn community report and find lost items across campus. Built with React.js, Firebase, and Tailwind, it offers a centralized, easy-to-use solution to a common student problem. Through user research and iterative design, we created a trustworthy and intuitive platform focused on usability and real needs.",
    languages: ["React.js", "Tailwind", "Firebase"],
    categories: ["software", "web", "ux", "community"],
    sections: [
      {
        video: "https://www.youtube.com/embed/DxMMO6Qa638?si=4tPosHJ_6WKeH1kH"
      },
      {
        text:
          "Lost@Penn was inspired by the shared frustration of losing items on campus without knowing where to turn. There was no centralized system to report or search for missing belongings, so we set out to build one. We started by interviewing Penn students to understand the pain points and features they needed most."
      },
      {
        text:
          "Lost@Penn was built with React.js for its component-based architecture, Firebase for backend services and real-time syncing, Tailwind and Bootstrap for responsive design, and Figma for prototyping and iteration. We focused on building a fast, usable interface with strong visual hierarchy and minimal friction. From the user interviews to the final prototype, every step of the process was grounded in solving a real problem for a real community."
      },
      {
        text: "Read more at: [Lost@Penn Case Study](https://medium.com/@ximingluo/lost-penn-863d1706a193)"
      },
      {
        video: "/images/lost.pdf"
      },
    ]
  },

  // neuroscent
  {
    id: "neuroscent",
    name: "NeuroScent",
    image: "/images/neuroscent.jpg",
    description:
      "NeuroScent is an XR biofeedback system that promotes mental well-being by combining olfaction, vision, and biosensing. Built for MIT Reality Hack 2025, it won the Hardware: Smart Sensing prize and Best Use of OpenBCI.",
    languages: ["C#", "Unity", "Arduino", "Fusion 360"],
    categories: ["graphics", "XR", "hardware", "biosensing"],
    sections: [
      {
        text:
          "NeuroScent integrates scent delivery and physiological sensing to extend XR immersion beyond vision and sound. We used the Varjo headset for visual feedback and OpenBCI Galea for EEG, PPG, and EMG biosignals, creating a holistic biofeedback loop."
      },
      {
        text:
          "The system captures EEG, EMG, and heart-rate data from Galea, analyzes real-time mental state, and triggers adaptive scent releases and visual effects to guide users toward calm or focus."
      },
      {
        text:
          "Harvested ultrasonic atomizers from consumer diffusers, controlled them with relays on an ESP32, and designed a Fusion 360 airflow chamber. Inspired by [Nebula: An Affordable Open-Source and Autonomous Olfactory Display for VR Headsets](https://hal.science/hal-03838757v1/file/Nebula_VRST_2022%20%281%29.pdf), built a compact olfactory module."
      },
      {
        text:
          "In Unity, C# scripts stream Galea’s biosignals over USB serial. Shader Graph, particle systems, and animation scripts map biofeedback thresholds to scent and visual triggers in real time."
      },
      {
        video: "https://player.vimeo.com/video/1059625069"
      },
      {
        text:
          "The pitch slides detail hardware architecture, biosignal-to-scent mapping, and user experience flows."
      },
      {
        video: "/images/NeuroScent.pdf"
      },
      {
        text:
          "Optimized performance by reducing draw calls, enabling occlusion culling, and using Unity URP with baked lighting. Simplified geometry and LOD management maximizing FPS on Varjo Aero."
      },
      {
        text:
          "Next steps include expanding immersive sequences, adding more scent channel permutations, and exploring clinical applications like patient relaxation during anesthesia with targeted biofeedback-driven scent delivery."
      }
    ]
  },

  //VR
  {
    id: "vr-meta-quest-experiences",
    name: "Portals & DreamScape VR",
    image: "/images/vr.png",
    description:
      "Two immersive 360° VR experiences for Meta Quest 3 built in Unreal Engine 5.5. Both feature spatial audio, interactive elements, and NavMesh-based locomotion: 'Portals through the Season' with seamless level-streaming portals; 'DreamScape' with grabbable crystals in a mushroom forest.",
    languages: ["Unreal Engine 5.5", "Blueprints", "C++"],
    categories: ["graphics", "VR", "Unreal", "Quest"],
    sections: [
      {
        text:
          "Portals through the Season presents a pair of themed levels connected by interactive portals. Entering a portal uses level streaming to load and unload environments instantly. UI widgets built in Blueprints animate activation rings and transition effects. NavMesh enables smooth player movement and teleportation."
      },
      { video: "https://www.youtube.com/embed/putNy1s3eL8?si=04OUckwGQPan_b4M" },
      { video: "/images/Portals.pdf" },
      {
        text:
          "DreamScape transports users to a 360° mushroom forest. Players can grab and place a crystalline artifact to trigger environmental changes. Spatialized ambient sounds and sound effects respond to proximity, and NavMesh-driven locomotion ensures comfort during exploration."
      },
      { video: "https://drive.google.com/file/d/1vo85unb33cchrQF0wL8lFlqO5VpXHhL6/preview" },
      { video: "/images/DreamScape.pdf" },
    ]
  },

  //mini maya
  {
    id: "mini-maya",
    name: "Mini Maya",
    image: "/images/mini-maya.gif",
    description:
      "Mini Maya is a lightweight 3D modeling tool built with C++ and OpenGL. It supports mesh editing, file import, and interactive viewing, inspired by Autodesk Maya.",
    languages: ["C++", "OpenGL"],
    categories: ["graphics", "modeling"],
    sections: [
      {
        text:
          "Built a full Qt interface with spinboxes, component lists, and function buttons for controlling mesh transformations. Users can directly manipulate mesh elements like vertices and edges."
      },
      {
        text:
          "The program supports importing geometry from OBJ files. Imported meshes are displayed in the OpenGL viewport with support for component selection and basic interaction."
      },
      {
        text:
          "Editing features include translating vertices and edges, splitting edges by inserting midpoints, triangulating polygonal faces, and applying Catmull-Clark subdivision for smooth surfaces."
      },
      {
        text:
          "A custom polar camera was implemented to allow intuitive scene navigation with orbit, zoom, and pan controls."
      },
      {
        text:
          "This project focused on building a simple but functional modeling interface from scratch, including mesh topology editing and real-time feedback through OpenGL rendering."
      }
    ]
  },

  //GLSL
  {
    id: "glsl-shaders",
    name: "GLSL Shaders",
    image: "/images/glsl-mosaic.png",
    description:
      "A collection of real-time GLSL shaders written in C++ and OpenGL. Each shader demonstrates a different visual effect or lighting model, including vertex displacement, lighting, and post-processing filters.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics", "shaders"],
    sections: [
      {
        image: "/images/glsl-inflate.gif"
      },
      {
        text:
          "Vertex Inflation: A custom vertex shader that offsets each vertex along its normal, creating an expanding 'puffed' effect. The degree of inflation is adjustable in real time."
      },
      {
        image: "/images/glsl-mosaic.png"
      },
      {
        text:
          "Mosaic Filter: A fragment shader that divides the screen into a grid of tiles. Each tile samples the center pixel color and applies it uniformly across the tile area, creating a pixelated mosaic effect. The tile size is adjustable in real-time."
      },
      {
        image: "/images/glsl-blinn.png"
      },
      {
        text:
          "Blinn-Phong: Per-fragment lighting using ambient, diffuse, and specular components. The half-vector is used for more efficient specular reflection."
      },
      {
        image: "/images/glsl-blur.png"
      },
      {
        text:
          "Gaussian Blur: A separable 2-pass blur filter implemented in screen space, using a weighted kernel to smooth the scene."
      },
      {
        image: "/images/glsl-sobel.png"
      },
      {
        text:
          "Sobel: Edge-detection filter that computes the gradient magnitude across screen-space color values, highlighting high-frequency detail."
      },
      {
        image: "/images/glsl-lambert.png"
      },
      {
        text:
          "Lambert: Basic diffuse lighting using the cosine of the angle between light and surface normal. Simple and efficient per-fragment shading."
      },
      {
        image: "/images/glsl-chrome.png"
      },
      {
        text:
          "Matcap: Chrome: Uses a normal-based matcap texture lookup to create a reflective metallic appearance with no dynamic lighting."
      },
      {
        image: "/images/glsl-outline.png"
      },
      {
        text:
          "Matcap: Outline: Combines matcap lookup with inverted face normals and edge detection for a stylized outline effect."
      },
      {
        image: "/images/glsl-red.png"
      },
      {
        text:
          "Matcap: Red Plastic: Simulates plastic-like material using a matcap texture with strong specular highlights and soft shading transitions."
      }
    ]
  },

  // machine learning
  {
    id: "statistical-learning-returns",
    name: "Machine Learning in Asset Pricing",
    image: "/images/wdrp.png",
    description:
      "This Wharton Directed Reading Program project investigates whether asset returns can be predicted using modern statistical learning methods. The research evaluates the efficiency of financial markets by applying both classical econometrics and advanced machine learning models to historical stock data.",
    languages: ["Python", "R"],
    categories: ["software", "finance", "machine learning", "research"],
    sections: [
      {
        "image": "/images/wdrp.jpg"
      },
      {
        "text": "Wharton Directed Reading Program, April 24, 2025: MACHINE LEARNING IN ASSET PRICING – Exploring Predictability in Stock Returns. Lead student: Ximing Luo (CS (DMD) & Economics ’27). Mentor: Yiwen Lu (Finance PhD, 2nd Year)."
      },
      {
        "text": "Introduction: Challenge – Despite the efficient market hypothesis (EMH) asserting that prices fully reflect all available information, subtle, persistent anomalies in returns elude traditional models. Motivation – Asset prices are dynamic predictions built on vast, evolving data; machine learning offers the flexibility to uncover weak, nonlinear signals without strict functional assumptions."
      },
      {
        "text": "Background & Methodology: Reviewed EMH in its weak, semi-strong, and strong forms. Revisited the fundamental asset pricing equation and CAPM as a benchmark. Designed a hybrid workflow combining classical econometric models (linear regression, ARIMA, factor models) with modern ML techniques—penalized regressions, tree-based methods, feed-forward and recurrent neural networks, and CNNs for chart-image feature extraction."
      },
      {
        "text": "Data, Analysis & Empirical Findings: Employed traditional data (historical prices, technical/fundamental signals) and alternative sources (news-article sentiment, OHLC chart images). Features were extracted via PCA, NLP topic models, and CNN-based image embeddings. Models were trained and validated with pseudo-out-of-sample cross-validation. Modern ML models achieved higher out-of-sample R² and improved trading metrics, revealing double-descent behavior in overparameterized regimes."
      },
      {
        "video": "/images/wdrp.pdf"
      },
      {
        "text": "Implications & Future Directions: Modern ML enhances return predictability and informs adaptive long/short strategies, more accurate risk forecasts, and real-time integration of alternative data. Future work will deepen sentiment and image-based features, and develop hybrid frameworks that fuse economic theory with data-driven predictions to better capture evolving market dynamics."
      }
    ]
  },

  // Removed projects for now, can be added back later if needed

  // // price predictor
  // {
  //   id: "price-predictor",
  //   name: "Automobile Price Predictor",
  //   image: "/images/price-scatter-horsepower.png",
  //   description:
  //     "Predicting car prices on the UCI Automobile dataset using multiple linear regression. Two approaches: (1) Numeric-only model with continuous inputs; (2) Combined model adding categorical features. Includes full EDA, feature engineering, and model evaluation.",
  //   languages: ["Python", "scikit-learn", "matplotlib", "pandas"],
  //   categories: ["software", "data science", "machine learning"],
  //   sections: [
  //     {
  //       text:
  //         "Method 1: Continuous Features Only—selected numeric predictors (engine-size, horsepower, curb-weight, city-mpg). Missing values imputed with medians and data standardized."
  //     },
  //     {
  //       image: "/images/price-corr-heatmap.png"
  //     },
  //     {
  //       text:
  //         "Feature Correlation Heatmap: reveals strong correlations between price and engine-size/horsepower, guiding feature selection."
  //     },
  //     {
  //       image: "/images/price-scatter-horsepower.png"
  //     },
  //     {
  //       text:
  //         "Scatter Plot of Horsepower vs. Price: shows near-linear relationship, justifying linear regression assumption."
  //     },
  //     {
  //       text:
  //         "Method 2: Add Categorical Features—one-hot encoded body-style, drive-wheels, and fuel-type alongside continuous inputs. Improves capture of group-specific price effects."
  //     },
  //     {
  //       image: "/images/price-bodystyle-boxplot.png"
  //     },
  //     {
  //       text:
  //         "Boxplot of Price by Body Style: highlights significant price differences, motivating inclusion of categorical encodings."
  //     },
  //     {
  //       text:
  //         "Model Evaluation: both models evaluated with train/test split (80/20). Numeric-only model achieved R²=0.72, RMSE=2900. Adding categorical features improved to R²=0.84, RMSE=2200 on test data."
  //     },
  //     {
  //       image: "/images/price-linear-fit.png"
  //     },
  //     {
  //       text:
  //         "Actual vs. Predicted Prices: scatter of test-set predictions shows tighter fit when categories included."
  //     }
  //   ]
  // },

  // // faces
  // {
  //   id: "face-generator",
  //   name: "Face Generator",
  //   image: "/images/face.png",
  //   description:
  //     "Two deep-learning methods for synthesizing realistic human faces from the CelebA dataset: a Generative Adversarial Network and a Variational Autoencoder.",
  //   languages: ["Python", "Jupyter Notebook", "Keras", "TensorFlow"],
  //   categories: ["software", "machine learning", "AI", "research"],
  //   sections: [
  //     {
  //       text:
  //         "Overview: Both models train on 200K+ aligned 128×128 CelebA images. The GAN uses a minimax framework with a transposed-conv generator and conv-based discriminator. The VAE encodes inputs into a 64-d latent distribution and decodes samples back to images with reconstruction + KL losses."
  //     },
  //     {
  //       image: "/images/vae.png"
  //     },
  //     {
  //       text:
  //         "VAE Approach: The encoder downsamples via conv layers to predict mean and log-variance of a 64‑d Gaussian. The decoder mirrors this with conv-transpose layers and ReLU to reconstruct 128×128 outputs. Loss combines MSE reconstruction + KL divergence (β=1). Trained 100 epochs with Adam (lr=1e-3) for smooth, blur-leaning reconstructions."
  //     },
  //     {
  //       text:
  //         "Latent Space Interpolation: Smoothly morph between two face vectors by linearly interpolating in the 64‑d latent space and decoding each step. Demonstrates continuity and disentanglement of learned features."
  //     },
  //     {
  //       image: "/images/gan.png"
  //     },
  //     {
  //       text:
  //         "GAN Approach: A 100‑dim noise vector passes through 4×4 transposed conv layers (stride=2), batch normalization, and ReLU to produce 128×128 RGB outputs. The discriminator uses 4×4 conv + LeakyReLU to classify real vs. fake. Trained 200 epochs with Adam (lr=2e-4, β1=0.5) for high-fidelity, sharp faces."
  //     },
  //   ]
  // },

];

export default projects;