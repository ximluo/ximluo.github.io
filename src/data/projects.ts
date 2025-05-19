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
  {
    id: "mini-minecraft",
    name: "Mini Minecraft",
    image: "/images/mini-minecraft.gif",
    description:
      "Custom-built 3D voxel game engine inspired by Minecraft, featuring procedural terrain, day-night cycles, dynamic lighting, instanced rendering, and a post-processing pipeline. I implemented the player physics, raycast-based block interaction, and immersive visual effects such as a time-interpolated sky with sun arcs, distance fog blending, and a post-process system for water/lava overlays.",
    languages: ["C++", "OpenGL", "GLSL"],
    categories: ["software", "graphics"],
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
];

export default projects;