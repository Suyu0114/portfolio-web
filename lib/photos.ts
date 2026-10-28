import bluejaysGame1 from "@/public/photos/bluejays-game-1.jpg";
import bluejaysGame2 from "@/public/photos/bluejays-game-2.jpg";
import freediving1 from "@/public/photos/freediving-1.jpg";
import freediving2 from "@/public/photos/freediving-2.jpg";
import hiking1 from "@/public/photos/hiking-1.jpg";
import hiking2 from "@/public/photos/hiking-2.jpg";
import portrait from "@/public/photos/portrait.jpg";
import powerlifting1 from "@/public/photos/powerlifting-1.jpg";
import powerlifting2 from "@/public/photos/powerlifting-2.jpg";

/**
 * The personal photos (SPEC §6.1, §6.4, v1.6), imported once and shared by
 * every locale's copy; only their alt text and captions are per locale.
 */
export const PHOTOS = {
  bluejaysGame1,
  bluejaysGame2,
  freediving1,
  freediving2,
  hiking1,
  hiking2,
  portrait,
  powerlifting1,
  powerlifting2,
} as const;
