import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/admin/questions - إضافة سؤال جديد (للأدمن فقط، RLS تتحقق من ذلك أيضاً)
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "هذا الإجراء مخصص للمشرفين فقط" }, { status: 403 });
  }

  const body = await req.json();
  const {
    subjectId,
    unitId,
    type,
    questionText,
    options,
    correctAnswer,
    explanation,
    difficulty = 2,
    isMinisterial = false,
    ministerialYear,
    points = 1
  } = body;

  if (!subjectId || !type || !questionText || !correctAnswer) {
    return NextResponse.json({ error: "الحقول المطلوبة غير مكتملة" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      subject_id: subjectId,
      unit_id: unitId ?? null,
      type,
      question_text: questionText,
      options: options ?? null,
      correct_answer: correctAnswer,
      explanation: explanation ?? null,
      difficulty,
      is_ministerial: isMinisterial,
      ministerial_year: ministerialYear ?? null,
      points,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "تعذّر إضافة السؤال" }, { status: 500 });
  }

  return NextResponse.json({ question: data });
}

// GET /api/admin/questions?subjectId=... - استعراض الأسئلة
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  let query = supabase.from("questions").select("*").order("created_at", { ascending: false });
  if (subjectId) query = query.eq("subject_id", subjectId);

  const { data, error } = await query.limit(100);
  if (error) return NextResponse.json({ error: "تعذّر جلب الأسئلة" }, { status: 500 });

  return NextResponse.json({ questions: data });
}
