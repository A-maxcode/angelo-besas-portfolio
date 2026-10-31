import type { SkillGroup } from "./types";

// Grouped skills with no proficiency scores. Marked as placeholders until confirmed.
export const skillGroups: SkillGroup[] = [
  {
    id: "sk-1",
    title: "Frontend",
    description: "Building the visible parts of the web.",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS"],
    status: "placeholder",
  },
  {
    id: "sk-2",
    title: "Backend & Data",
    description: "Storing and serving data.",
    skills: ["SQL basics", "REST APIs"],
    status: "placeholder",
  },
  {
    id: "sk-3",
    title: "Tools & Workflow",
    description: "Everyday development tools.",
    skills: ["Git", "VS Code", "Browser DevTools"],
    status: "placeholder",
  },
  {
    id: "sk-4",
    title: "Professional",
    description: "Skills beyond code.",
    skills: ["Teamwork", "Communication", "Problem solving"],
    status: "placeholder",
  },
];
