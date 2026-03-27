import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/lib/api-guards";
import { ensureDbUser, getDbUserById, upsertDbUserProfile } from "@/lib/users";

const updateSchema = z.object({
  displayName: z.string().trim().max(40).nullable().optional()
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    await ensureDbUser({ id: auth.user.id, email: auth.user.email });
    const dbUser = await getDbUserById(auth.user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "Failed to fetch user profile." }, { status: 500 });
    }

    return NextResponse.json(
      {
        profile: {
          id: dbUser.id,
          displayName: dbUser.display_name,
          createdAt: dbUser.created_at,
          updatedAt: dbUser.updated_at,
          role: dbUser.role,
          plan: dbUser.plan
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/me/profile failed", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAuthenticatedUser(request);
    if ("response" in auth) {
      return auth.response;
    }

    const json = await request.json();
    const parsed = updateSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const dbUser = await upsertDbUserProfile({
      id: auth.user.id,
      email: auth.user.email,
      displayName: parsed.data.displayName ?? null
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Failed to update user profile." }, { status: 500 });
    }

    return NextResponse.json(
      {
        profile: {
          id: dbUser.id,
          displayName: dbUser.display_name,
          createdAt: dbUser.created_at,
          updatedAt: dbUser.updated_at,
          role: dbUser.role,
          plan: dbUser.plan
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/me/profile failed", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

