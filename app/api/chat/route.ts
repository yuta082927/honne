import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { POST: createFortune } = await import("@/app/api/fortune/route");
  return createFortune(request);
}
