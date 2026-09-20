import { z } from "zod";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  createSessionCookie,
  passwordMatches,
} from "@/lib/adminAuth";
import { MissingEnvError, requireAdminEnv, requireSupabaseEnv } from "@/lib/env";
import {
  ADMIN_LOGIN_WINDOW_MS,
  clientIpFrom,
  createChatClient,
  hashIp,
  isLoginThrottled,
  recordLoginAttempt,
} from "@/lib/chatStore";

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

  // §8 (v2.13) — throttle before the password is even compared, so an
  // exhausted window costs an attacker a round trip and nothing else.
  //
  // Fails closed: a throttle we cannot read refuses the login rather than
  // waving it through. This is the route that guards /study and every admin
  // API, so it is the last place to trade safety for availability.
  const ipHash = hashIp(clientIpFrom(request.headers), env.ADMIN_COOKIE_SECRET);
  try {
    const db = createChatClient(requireSupabaseEnv());
    if (await isLoginThrottled(db, ipHash)) {
      const minutes = Math.round(ADMIN_LOGIN_WINDOW_MS / 60_000);
      return Response.json(
        { error: `Too many attempts. Wait ${minutes} minutes, then try again.` },
        { status: 429 },
      );
    }
    await recordLoginAttempt(db, ipHash);
  } catch (error) {
    if (error instanceof MissingEnvError) {
      console.error("[api/admin/login] env misconfigured:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }
    console.error("[api/admin/login] throttle unavailable:", error);
    return Response.json(
      { error: "Login is temporarily unavailable. Try again shortly." },
      { status: 503 },
    );
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
