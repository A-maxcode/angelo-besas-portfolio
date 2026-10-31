import type { Project } from "./types";

// Sample/demo projects — clearly labeled in the UI. Repository and live links
// are intentionally empty (private during development).
export const projects: Project[] = [
  {
    id: "proj-1",
    title: "Personal Portfolio",
    summary:
      "This site — a responsive portfolio with a public showcase and an admin UI prototype for a future CMS.",
    tech: ["React", "TypeScript", "Tailwind CSS"],
    featured: true,
    status: "sample",
  },
  {
    id: "proj-2",
    title: "Campus Event Board (sample)",
    summary:
      "Demo concept: a simple board where student organizations post upcoming events with filters by date and category.",
    tech: ["HTML", "CSS", "JavaScript"],
    featured: true,
    status: "sample",
  },
  {
    id: "proj-3",
    title: "Library Catalog UI (sample)",
    summary:
      "Demo concept: a searchable catalog interface with accessible forms and responsive result cards.",
    tech: ["React", "CSS"],
    status: "sample",
  },
];
