import HomePage from "@/components/HomePage";
import { homeMetadata } from "@/lib/pageMetadata";

export const metadata = homeMetadata("en");

export default function Page() {
  return <HomePage locale="en" />;
}
