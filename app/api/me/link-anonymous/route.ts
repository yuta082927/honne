import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { linkAnonymousDataToUser } from "@/lib/db";

const bodySchema = z.object({
  sessionId: z.string().trim().min(8).max(200)
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const json = await request.json();
    const parsed = bodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid sessionId." }, { status: 400 });
    }

    const result = await linkAnonymousDataToUser({
      userId: auth.user.id,
      sessionId: parsed.data.sessionId
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/me/link-anonymous failed", error);
    return NextResponse.json({ error: "Failed to link anonymous records." }, { status: 500 });
  }
}

