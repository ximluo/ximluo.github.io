/* The facts the About page and the HUD share. */
export const AB = {
  email: "ximluo@upenn.edu",
  bio: "Graphics, machine learning and software. Also an artist, mostly ink, digital and fire.",
  based: "Philadelphia",
  education: [
    {
      org: "M.S.E. Computer Science",
      role: "University of Pennsylvania · Accelerated Program",
      year: "2025-2027",
    },
    {
      org: "B.S.E. Computer Science (Computer Graphics) and Economics",
      role: "University of Pennsylvania",
      year: "2023-2027",
    },
  ],
  links: [
    ["Email", "mailto:ximluo@upenn.edu"],
    ["GitHub", "https://github.com/ximluo"],
    ["LinkedIn", "https://www.linkedin.com/in/ximingluo/"],
  ] as const,
}
