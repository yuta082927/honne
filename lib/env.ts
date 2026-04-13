import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    },
    z.string().min(1).default("gpt-4o-mini")
  ),
  SESSION_COOKIE_NAME: z.string().default("ai_uranai_sid"),
  SESSION_COOKIE_SECRET: z.string().min(32, "SESSION_COOKIE_SECRET must be at least 32 characters").optional(),
  FREE_USAGE_LIMIT: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().min(1).max(200).default(3)
  )
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Environment variable error:\n${messages.join("\n")}`);
}

if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SERVICE_ROLE_KEY) {
  throw new Error("Security error: service_role key must never be exposed via NEXT_PUBLIC_ environment variables.");
}

const cookieSecret =
  parsed.data.SESSION_COOKIE_SECRET ??
  (process.env.NODE_ENV === "production" ? "" : "dev-only-change-this-secret");

if (!cookieSecret) {
  throw new Error("SESSION_COOKIE_SECRET is required in production.");
}

const KNOWN_PLACEHOLDER_SECRETS = ["replace-with-long-random-secret", "dev-only-change-this-secret"];
if (process.env.NODE_ENV === "production" && KNOWN_PLACEHOLDER_SECRETS.includes(cookieSecret)) {
  throw new Error("SESSION_COOKIE_SECRET is set to a placeholder value. Generate a secure secret before deploying.");
}

export const env = {
  ...parsed.data,
  SESSION_COOKIE_SECRET: cookieSecret
};
