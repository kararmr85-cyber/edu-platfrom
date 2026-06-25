import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, branch")
    .order("branch")
    .order("order_index");

  if (error) return NextResponse.json({ error: "تعذّر جلب المواد" }, { status: 500 });
  return NextResponse.json({ subjects: data });
}
