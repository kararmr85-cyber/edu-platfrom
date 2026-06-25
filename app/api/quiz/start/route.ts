import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/quiz/start
// body: { subjectId: string, unitId?: string, questionCount?: number, timeLimitSeconds?: number, ministerialOnly?: boolean }
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  }

  const body = await req.json();
  const {
    subjectId,
    unitId,
    questionCount = 10,
    timeLimitSeconds = 600,
    ministerialOnly = false
  } = body;

  if (!subjectId) {
    return NextResponse.json({ error: "المادة الدراسية مطلوبة" }, { status: 400 });
  }

  // جلب أسئلة عشوائية للمادة المطلوبة
  let query = supabase.from("questions").select("*").eq("subject_id", subjectId);
  if (unitId) query = query.eq("unit_id", unitId);
  if (ministerialOnly) query = query.eq("is_ministerial", true);

  const { data: pool, error: poolError } = await query;

  if (poolError) {
    return NextResponse.json({ error: "تعذّر جلب الأسئلة" }, { status: 500 });
  }

  if (!pool || pool.length === 0) {
    return NextResponse.json({ error: "لا توجد أسئلة متاحة لهذه المادة حالياً" }, { status: 404 });
  }

  // اختيار عشوائي لعدد الأسئلة المطلوب
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  const totalPoints = selected.reduce((sum, q) => sum + (q.points ?? 1), 0);

  // إنشاء سجل الاختبار
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      student_id: user.id,
      subject_id: subjectId,
      unit_id: unitId ?? null,
      question_count: selected.length,
      time_limit_seconds: timeLimitSeconds,
      total_points: totalPoints,
      status: "in_progress"
    })
    .select()
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: "تعذّر إنشاء الاختبار" }, { status: 500 });
  }

  // إنشاء سجلات الأسئلة المرتبطة بالاختبار
  const quizQuestionsPayload = selected.map((q, idx) => ({
    quiz_id: quiz.id,
    question_id: q.id,
    order_index: idx
  }));

  const { error: qqError } = await supabase.from("quiz_questions").insert(quizQuestionsPayload);

  if (qqError) {
    return NextResponse.json({ error: "تعذّر تجهيز أسئلة الاختبار" }, { status: 500 });
  }

  // إخفاء الإجابة الصحيحة قبل إرسالها للطالب
  const sanitizedQuestions = selected.map((q) => ({
    id: q.id,
    type: q.type,
    question_text: q.question_text,
    options: q.options,
    points: q.points,
    is_ministerial: q.is_ministerial,
    ministerial_year: q.ministerial_year
  }));

  return NextResponse.json({
    quiz: { id: quiz.id, time_limit_seconds: quiz.time_limit_seconds, total_points: quiz.total_points },
    questions: sanitizedQuestions
  });
}
