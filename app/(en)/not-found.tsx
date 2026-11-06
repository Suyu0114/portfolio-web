import NotFoundNote from "@/components/NotFoundNote";

// notFound() inside the English routes; unmatched URLs go to
// app/global-not-found.tsx instead.
export default function NotFound() {
  return <NotFoundNote />;
}
