import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { listFortunesByUser } from "@/lib/db";

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const logs = await listFortunesByUser(auth.user.id);

    return NextResponse.json(
      {
        logs: logs.map((log) => ({
          id: log.id,
          mode: log.mode,
          depth: log.depth,
          concern: log.user_input,
          concernPreview: clip(log.user_input, 80),
          response: log.ai_response,
          responsePreview: clip(log.ai_response, 120),
          createdAt: log.created_at
        }))
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/me/fortunes failed", error);
    return NextResponse.json({ error: "Failed to fetch histories." }, { status: 500 });
  }
}

