export interface Photo {
  id: string
  title: string
  image: string
  description: string
  categories: string[]
}

const photos: Photo[] = [
  // Art
  {
    id: "photo-1",
    title: "Alive",
    image: "/images/Alive.png",
    description: '14" x 17" ink drawing | Scholastics Art and Writing Awards National Gold Medal',
    categories: ["art"],
  },
  {
    id: "photo-2",
    title: "Crowning",
    image: "/images/Crowning.png",
    description: "Digital Illustration",
    categories: ["art"],
  },
  {
    id: "photo-3",
    title: "Vortex",
    image: "/images/Vortex.png",
    description: "3D sculpture | Inspired by mathematical parabolas using DeCastlejau's algorithm",
    categories: ["art", "photos"],
  },
  {
    id: "photo-4",
    title: "Silver-Spoon",
    image: "/images/Silver-Spoon.png",
    description: '20" x 25" charcoal drawing | Scholastics Art and Writing Awards Silver Key',
    categories: ["art"],
  },
  {
    id: "photo-5",
    title: "Blossom",
    image: "/images/Blossom.png",
    description: "Digital Illustration",
    categories: ["art"],
  },
  {
    id: "photo-6",
    title: "Ashen",
    image: "/images/Ashen.png",
    description: "3D sculpture | toothpicks, repeating form",
    categories: ["art", "photos"],
  },
  {
    id: "photo-7",
    title: "Raptor",
    image: "/images/Raptor.png",
    description: '16" x 24" woodburn engraving',
    categories: ["art"],
  },
  {
    id: "photo-8",
    title: "Checkmate",
    image: "/images/Checkmate.png",
    description: '9" x 12" scratchart engraving',
    categories: ["art"],
  },
  {
    id: "photo-9",
    title: "Pose",
    image: "/images/Pose.png",
    description: '20" x 25" charcoal drawing | Scholastics Art and Writing Awards Silver Key',
    categories: ["art"],
  },
  {
    id: "photo-10",
    title: "Starcatcher",
    image: "/images/Starcatcher.png",
    description: "Book Cover Illustration | Published",
    categories: ["art"],
  },

  // Photos
  {
    id: "photo-11",
    title: "Echoes",
    image: "/images/Echoes.png",
    description: "Australia Travel Memoir | [add link to publication]",
    categories: ["photos"],
  },
  {
    id: "photo-12",
    title: "Resonance",
    image: "/images/Resonance.png",
    description: "Nature photography | Scholastics Art and Writing Awards Silver Key",
    categories: ["photos"],
  },
  {
    id: "photo-13",
    title: "Bewitched",
    image: "/images/Bewitched.png",
    description: "Still life photography | Scholastics Art and Writing Awards Silver Key",
    categories: ["photos"],
  },
  {
    id: "photo-14",
    title: "Crystalline",
    image: "/images/Crystalline.png",
    description: "Still life photography | Scholastics Art and Writing Awards Silver Key",
    categories: ["photos"],
  },
]

export default photos