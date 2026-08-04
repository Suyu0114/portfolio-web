import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  createSessionCookie,
  passwordMatches,
} from "@/lib/adminAuth";
import { MissingEnvError, requireAdminEnv } from "@/lib/env";

/** Admin login — SPEC-CHATBOT §2 (allowed surface), §8 (auth). */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({ password: z.string().min(1).max(512) }).strict();

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "A password is required." }, { status: 400 });
  }

  let env;
  try {
    env = requireAdminEnv();
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error("[api/admin/login] env misconfigured:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }
    throw error;
  }

  const ok = await passwordMatches(
    parsed.data.password,
    env.ADMIN_PASSWORD,
    env.ADMIN_COOKIE_SECRET,
  );

  if (!ok) {
    // One operator, so there is no account to enumerate — but say nothing
    // about which part was wrong regardless.
    return Response.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [
      `${ADMIN_COOKIE_NAME}=${await createSessionCookie(env.ADMIN_COOKIE_SECRET)}`,
      "Path=/",
      "HttpOnly",
      "Secure",
      "SameSite=Lax",
      `Max-Age=${Math.floor(ADMIN_SESSION_TTL_MS / 1000)}`,
    ].join("; "),
  );
  return response;
}
