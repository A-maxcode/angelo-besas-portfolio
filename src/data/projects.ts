import type { Project } from "./types";

// Sample/demo projects — clearly labeled in the UI. Repository and live links
// are intentionally empty (private during development).
export const projects: Project[] = [
  {
  id: "mash-social",
  title: "MASH Social",
  description: "A social networking platform for connecting and sharing.",
  category: "Web Application",
  technologies: ["PHP", "MySQL", "JavaScript", "CSS"],
  liveUrl: "https://mash-app.freedev.app",
  status: "live",
},
{
  id: "date-schedule",
  title: "Date Schedule",
  description: "An online invitation and date scheduling website.",
  category: "Web Application",
  technologies: ["PHP", "MySQL", "JavaScript", "CSS"],
  liveUrl: "https://dating-schedule.infinityfreeapp.com/create_invitation.php",
  status: "live",
},
