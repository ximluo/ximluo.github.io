import type { Project } from "../types"

const interactiveProjects: Project[] = [
  {
    id: "rewind",
    name: "Rewind",
    image: "/images/rewind.png",
    description:
      "Rewind is an AR memory recall app that won the InterSystems Challenge at HackMIT 2024, integrated with the Apple Vision Pro. It uses Gaussian splatting for 3D scene generation and a LangChain based RAG pipeline with InterSystems IRIS Vector Search for natural language memory queries.",
    languages: ["React", "WebXR", "Python", "LangChain", "IRIS Vector Search"],
    categories: ["software", "AR", "AI", "healthtech"],
    sections: [
      {
        text: "Gaussian Splatting 3D Scene Generation: We convert user video clips into point cloud environments using a custom Python pipeline and render them in real time with Three.js and WebXR. Users can navigate their memories in 360 degree AR.",
      },
      {
        text: "Backend Architecture: The Flask API manages user sessions, stores memory metadata in a relational SQL database, and coordinates scene jobs. Each memory record includes timestamps, tags, and AR scene links.",
      },
      {
        text: "RAG with Vector Search: We embed memory metadata and textual notes into vectors using LangChain embedding models. These vectors are indexed in InterSystems IRIS Vector Search. At query time, user questions are embedded, top K matching memories are retrieved, and the app surfaces exact moments, for example, “Show my graduation day”.",
      },
    ],
  },
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
        image: "/images/web-zoom.gif",
      },
      {
        text: "The main interface is a 3D TV rendered with React Three Fiber. Hovering circles indicate demos. Click to zoom into each screen. Screen content textures drive camera positioning calculations for smooth transitions.",
      },
      {
        text: "Dive into the demos on the live site: [Web Exploratorium Live](https://artofthewebxl.github.io)",
      },
      {
        image: "/images/web-maze.gif",
      },
      {
        text: "Maze Generation leverages recursive backtracking in p5.js to carve perfect mazes on a grid. Real time animation shows the algorithm exploring and backtracking.",
      },
      {
        image: "/images/web-tree.gif",
      },
      {
        text: "Procedural Tree Generation uses p5.js and recursion to draw branching fractals. Adjustable parameters let users explore infinitely varied tree structures.",
      },
      {
        image: "/images/web-gallery.gif",
      },
      {
        text: "The CSS Image Gallery features smooth transitions and hover effects. Thumbnails expand and slide fluidly using CSS variables and keyframe animations.",
      },
      {
        image: "/images/web-clock.gif",
      },
      {
        text: "Pixel Clock is a canvas based timepiece built in p5.js.",
      },
      {
        image: "/images/web-ascii.gif",
      },
      {
        text: "Using the characters in the Chinese phrase, 冰山一角 (bīng shān yī jiǎo), which means “The tip of an iceberg”, to create an image of an iceberg. Part of the image should be hidden, which reflects the meaning of the phrase.",
      },
      {
        image: "/images/web-still.gif",
      },
      {
        text: "The CSS still life showcases an animated still life composition created using CSS.",
      },
    ],
  },
  {
    id: "lost-at-penn",
    name: "Lost@Penn",
    image: "/images/lost.png",
    description:
      "Lost@Penn is a web platform that helps the Penn community report and find lost items across campus. Built with React.js, Firebase, and Tailwind, it offers a centralized, easy to use solution to a common student problem. Through user research and iterative design, we created a trustworthy and intuitive platform focused on usability and real needs.",
    languages: ["React.js", "Tailwind", "Firebase"],
    categories: ["software", "web", "ux", "community"],
    sections: [
      {
        video: "https://www.youtube.com/embed/DxMMO6Qa638?si=4tPosHJ_6WKeH1kH",
      },
      {
        text: "Lost@Penn was inspired by the shared frustration of losing items on campus without knowing where to turn. There was no centralized system to report or search for missing belongings, so we set out to build one. We started by interviewing Penn students to understand the pain points and features they needed most.",
      },
      {
        text: "Lost@Penn was built with React.js for its component based architecture, Firebase for backend services and real time syncing, Tailwind and Bootstrap for responsive design, and Figma for prototyping and iteration. We focused on building a fast, usable interface with strong visual hierarchy and minimal friction. From the user interviews to the final prototype, every step of the process was grounded in solving a real problem for a real community.",
      },
      {
        text: "Read more at: [Lost@Penn Case Study](https://medium.com/@ximingluo/lost-penn-863d1706a193)",
      },
      {
        video: "/images/lost.pdf",
      },
    ],
  },
  {
    id: "neuroscent",
    name: "NeuroScent",
    image: "/images/neuroscent.jpg",
    description:
      "NeuroScent is an XR biofeedback system that promotes mental wellbeing, combining olfaction, vision, and biosensing. Built for MIT Reality Hack 2025, it won the Hardware: Smart Sensing prize and Best Use of OpenBCI.",
    languages: ["C#", "Unity", "Arduino", "Fusion 360"],
    categories: ["graphics", "XR", "hardware", "biosensing"],
    sections: [
      {
        text: "NeuroScent integrates scent delivery and physiological sensing to extend XR immersion beyond vision and sound. We used the Varjo headset for visual feedback and OpenBCI Galea for EEG, PPG, and EMG biosignals, creating a holistic biofeedback loop.",
      },
      {
        text: "The system captures EEG, EMG, and heart rate data from Galea, analyzes real time mental state, and triggers adaptive scent releases and visual effects to guide users toward calm or focus.",
      },
      {
        text: "Harvested ultrasonic atomizers from consumer diffusers, controlled them with relays on an ESP32, and designed a Fusion 360 airflow chamber. Inspired by [Nebula: An Affordable Open Source and Autonomous Olfactory Display for VR Headsets](https://hal.science/hal-03838757v1/file/Nebula_VRST_2022%20%281%29.pdf), built a compact olfactory module.",
      },
      {
        text: "In Unity, C# scripts stream Galea biosignals over USB serial. Shader Graph, particle systems, and animation scripts map biofeedback thresholds to scent and visual triggers in real time.",
      },
      {
        video: "https://player.vimeo.com/video/1059625069",
      },
      {
        text: "Optimized performance by reducing draw calls, enabling occlusion culling, and using Unity URP with baked lighting. Simplified geometry and LOD management maximizing FPS on Varjo Aero.",
      },
      {
        text: "Next steps include expanding immersive sequences, adding more scent channel permutations, and exploring clinical applications like patient relaxation during anesthesia with targeted biofeedback driven scent delivery.",
      },
    ],
  },
  {
    id: "vr-meta-quest-experiences",
    name: "Portals & DreamScape VR",
    image: "/images/vr.png",
    description:
      "Two immersive 360 degree VR experiences for Meta Quest 3 built in Unreal Engine 5.5. Both feature spatial audio, interactive elements, and NavMesh based locomotion: “Portals through the Season” with seamless level streaming portals; “DreamScape” with grabbable crystals in a mushroom forest.",
    languages: ["Unreal Engine", "Blueprints", "C++"],
    categories: ["graphics", "VR", "Unreal", "Quest"],
    sections: [
      {
        text: "Portals through the Season presents a pair of themed levels connected by interactive portals. Entering a portal uses level streaming to load and unload environments instantly. UI widgets built in Blueprints animate activation rings and transition effects. NavMesh enables smooth player movement and teleportation.",
      },
      { video: "https://www.youtube.com/embed/putNy1s3eL8?si=04OUckwGQPan_b4M" },
      { video: "/images/Portals.pdf" },
      {
        text: "DreamScape transports users to a 360 degree mushroom forest. Players can grab and place a crystalline artifact to trigger environmental changes. Spatialized ambient sounds and sound effects respond to proximity, and NavMesh driven locomotion ensures comfort during exploration.",
      },
      { video: "https://drive.google.com/file/d/1vo85unb33cchrQF0wL8lFlqO5VpXHhL6/preview" },
      { video: "/images/DreamScape.pdf" },
    ],
  },
  {
    id: "glsl-shaders",
    name: "GLSL Shaders",
    image: "/images/glsl-mosaic.png",
    description:
      "A collection of real time GLSL shaders written in C++ and OpenGL. Each shader demonstrates a different visual effect or lighting model, including vertex displacement, lighting, and post processing filters.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["graphics", "shaders"],
    sections: [
      {
        image: "/images/glsl-inflate.gif",
      },
      {
        text: "Vertex Inflation: A custom vertex shader that offsets each vertex along its normal, creating an expanding puffed effect. The degree of inflation is adjustable in real time.",
      },
      {
        image: "/images/glsl-mosaic.png",
      },
      {
        text: "Mosaic Filter: A fragment shader that divides the screen into a grid of tiles. Each tile samples the center pixel color and applies it uniformly across the tile area, creating a pixelated mosaic effect. The tile size is adjustable in real time.",
      },
      {
        image: "/images/glsl-blinn.png",
      },
      {
        text: "Blinn Phong: Per fragment lighting using ambient, diffuse, and specular components. The half vector is used for more efficient specular reflection.",
      },
      {
        image: "/images/glsl-blur.png",
      },
      {
        text: "Gaussian Blur: A separable 2 pass blur filter implemented in screen space, using a weighted kernel to smooth the scene.",
      },
      {
        image: "/images/glsl-sobel.png",
      },
      {
        text: "Sobel: Edge detection filter that computes the gradient magnitude across screen space color values, highlighting high frequency detail.",
      },
      {
        image: "/images/glsl-lambert.png",
      },
      {
        text: "Lambert: Basic diffuse lighting using the cosine of the angle between light and surface normal. Simple and efficient per fragment shading.",
      },
      {
        image: "/images/glsl-chrome.png",
      },
      {
        text: "Matcap Chrome: Uses a normal based matcap texture lookup to create a reflective metallic appearance with no dynamic lighting.",
      },
      {
        image: "/images/glsl-red.png",
      },
      {
        text: "Matcap Red Plastic: Simulates plastic like material using a matcap texture with strong specular highlights and soft shading transitions.",
      },
    ],
  },
]

export default interactiveProjects
