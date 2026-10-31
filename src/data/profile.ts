import type { Education, Interest, Profile } from "./types";

// Confirmed profile content. Edit here until the CMS profile editor is wired up.
export const profile: Profile = {
  name: "Angelo Besas",
  headline: "Young IT",
  course: "Bachelor of Science in Information Technology",
  school: "Holy Name University",
  mainInterest: "Web Development",
  intro:
    "An Information Technology student focused on web development — learning to build clean, accessible, and responsive experiences for the web.",
  about: [
    "I'm Angelo Besas, a BS Information Technology student at Holy Name University. My main interest is web development: turning ideas into interfaces that are fast, accessible, and easy to use.",
    "This portfolio collects my coursework, projects, certificates, and milestones as I grow as a developer. Content marked as placeholder will be replaced with verified details.",
  ],
};

export const education: Education[] = [
  {
    id: "edu-1",
    degree: profile.course,
    school: profile.school,
    period: "Dates to be added",
    description:
      "Current program. Coursework highlights, organizations, and academic honors will be listed here once confirmed.",
    status: "placeholder",
  },
];

export const interests: Interest[] = [
  {
    id: "int-1",
    title: "Web Development",
    description: "Main focus — building responsive, accessible websites and web apps.",
  },
  {
    id: "int-2",
    title: "Interface Design",
    description: "Placeholder — confirm or replace with another interest.",
  },
  {
    id: "int-3",
    title: "Continuous Learning",
    description: "Placeholder — confirm or replace with another interest.",
  },
];
