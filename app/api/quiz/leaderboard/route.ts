import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/quiz/leaderboard?subjectId=optional&limit=20
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 20);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, xp, level, avatar_url")
    .order("xp", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "تعذّر جلب لوحة الصدارة" }, { status: 500 });
  }

  const ranked = (data ?? []).map((p, idx) => ({ ...p, rank: idx + 1 }));
  return NextResponse.json({ leaderboard: ranked });
}
