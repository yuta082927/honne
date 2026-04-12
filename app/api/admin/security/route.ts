import { NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/api-guards";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function countRows(table: string): Promise<number | null> {
  const result = await supabaseAdmin.from(table).select("*", { count: "exact", head: true });
  if (result.error) {
    console.error(`countRows failed: ${table}`, result.error);
    return null;
  }
  return result.count ?? 0;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const admin = await requireAdminAccess(request);
  if ("response" in admin) {
    return admin.response;
  }

  const [users, usageLogs, anonymousSessions, fortuneLogs] = await Promise.all([
    countRows("users"),
    countRows("usage_logs"),
    countRows("anonymous_sessions"),
    countRows("fortune_logs")
  ]);

  return NextResponse.json(
    {
      message: "Admin security summary",
      adminUserId: admin.userId,
      counts: {
        users,
        usageLogs,
        anonymousSessions,
        fortuneLogs
      }
    },
    { status: 200 }
  );
}
