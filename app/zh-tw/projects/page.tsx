import ProjectsPage from "@/components/ProjectsPage";
import { projectsMetadata } from "@/lib/pageMetadata";

export const metadata = projectsMetadata("zh-tw");

export default function Page() {
  return <ProjectsPage locale="zh-tw" />;
}
