export const CONTACT_EMAIL = "ximluo@upenn.edu"

export type AboutTextPart =
  | string
  | {
      text: string
      href: string
      analyticsId?: string
    }

export type AboutRow = {
  title: string
  detail?: string
  year: string
  href?: string
}

export const aboutContent = {
  title: "Hi, I'm Ximing!",
  intro: [
    "I'm at UPenn, studying Computer Science (",
    {
      text: "Digital Media Design",
      href: "http://cg.cis.upenn.edu/dmd.html",
    },
    ") and Economics. I build software, interfaces, and immersive tools across mobile, graphics, XR, and visual systems.",
  ] satisfies AboutTextPart[],
  contact: [
    "Say hello at ",
    {
      text: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      analyticsId: "email",
    },
  ] satisfies AboutTextPart[],
  experience: [
    {
      title: "Apple",
      detail: "Software Engineer Intern",
      year: "2026",
      href: "https://www.apple.com/",
    },
    {
      title: "Apollo Global Management",
      detail: "Software Engineer Intern",
      year: "2025",
      href: "https://www.apollo.com/",
    },
    {
      title: "CIS 1951",
      detail: "iOS Programming Instructor",
      year: "Present",
      href: "https://www.seas.upenn.edu/~cis1951/",
    },
  ] satisfies AboutRow[],
  activities: [
    {
      title: "Women in Computer Science",
      detail: "President (Awarded ESAC Club of the Year)",
      year: "",
      href: "https://wics.cis.upenn.edu/",
    },
    { title: "FemmeHacks", detail: "President", year: "", href: "https://www.femmehacks.io/" },
    {
      title: "Google Developer Group",
      detail: "Technical Lead",
      year: "",
      href: "https://gdg.community.dev/gdg-on-campus-university-of-pennsylvania-philadelphia-united-states/",
    },
    { title: "Penn Labs", detail: "Developer", year: "", href: "https://pennlabs.org/" },
    { title: "Penn Spark", detail: "Developer", year: "", href: "https://pennspark.org/" },
    { title: "Notion", detail: "Campus Ambassador", year: "", href: "https://www.notion.com" },
    {
      title: "CIS 5120 and CIS 5600",
      detail: "Previous TA for HCI and Computer Graphics",
      year: "",
      href: "",
    },
  ] satisfies AboutRow[],
}
