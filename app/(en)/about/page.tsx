import AboutPage from "@/components/AboutPage";
import { aboutMetadata } from "@/lib/pageMetadata";

export const metadata = aboutMetadata("en");

export default function Page() {
  return <AboutPage locale="en" />;
}
