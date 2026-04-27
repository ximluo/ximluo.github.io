export interface AwardItem {
  title: string
  year: string
  description?: string
  link?: string
}

export type AwardsBySection = Record<string, AwardItem[]>

const awardsData: AwardsBySection = {
  HIGHLIGHTS: [
    {
      title: "Adobe Digital Edge Awards Winner",
      year: "2024",
      description: "Selected from 2,400+ entries; Featured at Adobe MAX 2024 Conference",
      link: "https://www.adobe.com/max.html",
    },
    {
      title: "Stavros Niarchos Foundation Paideia Fellow",
      year: "2024",
      description: "Interdisciplinary fellowship, 1 of 26 selected",
      link: "https://snfpaideia.upenn.edu/fellowships/fellowship-information/",
    },
    {
      title: "Wharton Directed Reading Program",
      year: "2025",
      description: "1 of 5 projects selected",
      link: "https://sites.google.com/view/wharton-drp/about?authuser=0",
    },
    {
      title: "MIT Reality Hacks 2025 Winner",
      year: "2025",
      description: "Best Hardware Hack, Best Use of OpenBCI",
      link: "",
    },
    {
      title: "HackMIT 2024 Winner",
      year: "2024",
      description: "Intersystems Challenge Winner",
      link: "",
    },
  ],
  SCHOLARSHIPS: [
    {
      title: "Catalent Global Scholarship",
      year: "2024",
      description: "",
      link: "",
    },
    {
      title: "National Merit Scholar",
      year: "2023",
      description: "",
      link: "https://patch.com/maryland/columbia/14-more-national-merit-scholars-howard-county-named-2023",
    },
    {
      title: "Howard County Arts Council's Arts Scholarship",
      year: "2023",
      description: "",
    },
    {
      title: "National Society of High School Scholars Scholarship",
      year: "2022",
      description: "",
      link: "https://www.nshss.org/scholarships/current-winners/ximing-luo/",
    },
    {
      title: "American Visionary Art Museum Compassion in Action Scholarship",
      year: "2022",
      description: "",
    },
    {
      title: "Rho Psi Art Scholarship",
      year: "2022",
      description: "",
    },
  ],
  EXHIBITIONS: [
    {
      title: "SIGGRAPH Conference SpaceTime Gallery",
      year: "2022",
      description: "International Competition",
      link: "",
    },
    {
      title: "The World Art Institute of Youth – Centre for UNESCO",
      year: "2020",
      description: "",
    },
    {
      title: "Museum of Howard County History Exhibition",
      year: "2022",
      description: "",
    },
    {
      title: "32nd Annual HCPSS Senior Show Exhibition",
      year: "2022",
      description: "",
    },
  ],
  AWARDS: [
    {
      title: "Scholastic Art and Writing Awards",
      year: "2023",
      description: "2 Gold Medals, 3 Gold Keys, 8 Silver Key, 8 Honorable Mentions",
      link: "",
    },
    {
      title: "NCWIT Aspirations for Computing Award Winner",
      year: "2023",
      description: "",
      link: "https://www.aspirations.org/people/ximing-l/129010",
    },
    {
      title: "American Computer Science League State 1st Place",
      year: "2022",
      description: "",
    },
    {
      title: "Winner, Illustrators of the Future",
      year: "2022",
      description: "",
      link: "",
    },
    {
      title: "1st place, Reflections Visual Arts Outstanding Interpretation",
      year: "2023",
      description: "",
      link: "",
    },
    {
      title: "2nd place, Purdue University National Juried Art Competition",
      year: "2022",
      description: "",
    },
    {
      title: "1st place, Project Bridge Share Your Story Multimedia Contest",
      year: "2022",
      description: "",
    },
    {
      title: "1st place, Space Foundation International Art Contest",
      year: "2021",
      description: "",
      link: "",
    },
    {
      title: "Winner, International Creative Karuta Award",
      year: "2020",
      description: "",
    },
    {
      title: "Celebrating Art National Art Anthologies",
      year: "2020-2022",
      description: "",
      link: "",
    },
  ],
}

export default awardsData
