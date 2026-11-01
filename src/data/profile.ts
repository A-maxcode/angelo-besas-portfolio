import type { Education, Interest, Profile } from "./types";

export const profile: Profile = {
  name: "Angelo Besas",
  headline: "IT Student",
  course: "Bachelor of Science in Information Technology",
  school: "Holy Name University",
  mainInterest: "Web Development",
  intro:
    "I'm an IT student who enjoys turning ideas into clear, useful web experiences. I'm learning by building, experimenting, and improving one project at a time.",
  about: [
    "I'm Angelo Besas, a Bachelor of Science in Information Technology student at Holy Name University. I'm especially interested in web development and creating websites that are responsive, accessible, and straightforward to use.",
    "This portfolio brings together my projects, certificates, and the technologies I'm exploring as I continue developing my skills.",
  ],
};

export const education: Education[] = [
  {
    id: "edu-1",
    degree: profile.course,
    school: profile.school,
    period: "Dates to be added",
    description:
      "Currently pursuing a Bachelor of Science in Information Technology.",
    status: "placeholder",
  },
];

export const interests: Interest[] = [
  {
    id: "int-1",
    title: "Web Development",
    description:
      "Exploring how to build responsive, accessible websites and web applications.",
  },
  {
    id: "int-2",
    title: "Learning by Building",
    description:
      "Practicing new concepts through personal projects and hands-on experimentation.",
  },
];
