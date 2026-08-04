import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

/** Admin logout — SPEC-CHATBOT §2, §8. Clears the session cookie. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${ADMIN_COOKIE_NAME}=`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      "Max-Age=0",
    ].join("; "),
  );
  return response;
}
