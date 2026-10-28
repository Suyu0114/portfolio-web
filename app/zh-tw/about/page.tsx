import AboutPage from "@/components/AboutPage";
import { aboutMetadata } from "@/lib/pageMetadata";

export const metadata = aboutMetadata("zh-tw");

export default function Page() {
  return <AboutPage locale="zh-tw" />;
}
