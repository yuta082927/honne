import { NextRequest, NextResponse } from "next/server";
import { POST as createFortune } from "@/app/api/fortune/route";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return createFortune(request);
}

