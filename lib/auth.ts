import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/lib/types";

const COOKIE_NAME = "resume_checker_session";

function getSecret() {
  return process.env.SESSION_SECRET || "local-dev-insecure-secret";
}

function signEmail(email: string) {
  return createHmac("sha256", getSecret()).update(email).digest("base64url");
}

export function encodeSession(email: string) {
  const payload = Buffer.from(email, "utf8").toString("base64url");
  const signature = signEmail(email);
  return `${payload}.${signature}`;
}

export function decodeSession(value?: string): SessionUser | null {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature) {
    return null;
  }

  const email = Buffer.from(payload, "base64url").toString("utf8");
  const expected = signEmail(email);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);

  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  return { email };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function setSessionCookie(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
