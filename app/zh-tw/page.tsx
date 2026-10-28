import HomePage from "@/components/HomePage";
import { homeMetadata } from "@/lib/pageMetadata";

export const metadata = homeMetadata("zh-tw");

export default function Page() {
  return <HomePage locale="zh-tw" />;
}
