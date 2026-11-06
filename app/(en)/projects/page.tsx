import ProjectsPage from "@/components/ProjectsPage";
import { projectsMetadata } from "@/lib/pageMetadata";

export const metadata = projectsMetadata("en");

export default function Page() {
  return <ProjectsPage locale="en" />;
}
