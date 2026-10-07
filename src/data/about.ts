/* The facts the About page and the HUD share. */
export const AB = {
  email: "ximluo@upenn.edu",
  bio: "Graphics, machine learning, and software. Also an artist.",
  /* The claim under the name on the title card. */
  claim: "make it real",
  study: "CS & Computer Graphics @ UPenn",
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

/** The claim on its own, as the title card says it under the name. */
export const CLAIM = AB.claim.charAt(0).toUpperCase() + AB.claim.slice(1) + "."
