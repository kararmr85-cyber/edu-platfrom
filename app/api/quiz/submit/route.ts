import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/quiz/submit
// body: { quizId: string, answers: { questionId: string, answer: string, timeSpentSeconds?: number }[] }
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
  }

  const { quizId, answers } = await req.json();

  if (!quizId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "بيانات الإجابات غير صحيحة" }, { status: 400 });
  }

  // التحقق أن الاختبار يخص هذا الطالب
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("student_id", user.id)
    .single();

  if (quizError || !quiz) {
    return NextResponse.json({ error: "الاختبار غير موجود" }, { status: 404 });
  }

  if (quiz.status === "completed") {
    return NextResponse.json({ error: "تم تصحيح هذا الاختبار مسبقاً" }, { status: 400 });
  }

  // جلب الأسئلة الصحيحة لمقارنتها
  const questionIds = answers.map((a: any) => a.questionId);
  const { data: questions } = await supabase
    .from("questions")
    .select("id, type, correct_answer, points, explanation, is_ministerial")
    .in("id", questionIds);

  const questionMap = new Map((questions ?? []).map((q) => [q.id, q]));

  let earnedPoints = 0;
  let correctCount = 0;
  let ministerialCorrect = 0;
  const detailedResults: any[] = [];

  for (const ans of answers) {
    const question = questionMap.get(ans.questionId);
    if (!question) continue;

    const isCorrect = checkAnswer(question.type, question.correct_answer, ans.answer);
    if (isCorrect) {
      earnedPoints += question.points ?? 1;
      correctCount += 1;
      if (question.is_ministerial) ministerialCorrect += 1;
    }

    await supabase
      .from("quiz_questions")
      .update({
        student_answer: ans.answer ?? null,
        is_correct: isCorrect,
        answered_at: new Date().toISOString(),
        time_spent_seconds: ans.timeSpentSeconds ?? null
      })
      .eq("quiz_id", quizId)
      .eq("question_id", ans.questionId);

    detailedResults.push({
      questionId: ans.questionId,
      isCorrect,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      studentAnswer: ans.answer
    });
  }

  const scorePercent = quiz.total_points > 0 ? Math.round((earnedPoints / quiz.total_points) * 100) : 0;
  const xpEarned = Math.round(earnedPoints * 5 + (scorePercent === 100 ? 25 : 0));

  await supabase
    .from("quizzes")
    .update({
      status: "completed",
      finished_at: new Date().toISOString(),
      earned_points: earnedPoints,
      score_percent: scorePercent,
      xp_earned: xpEarned
    })
    .eq("id", quizId);

  // تحديث نقاط الخبرة للطالب
  const { data: profile } = await supabase.from("profiles").select("xp").eq("id", user.id).single();
  const newXp = (profile?.xp ?? 0) + xpEarned;
  await supabase.from("profiles").update({ xp: newXp }).eq("id", user.id);

  await supabase.from("xp_log").insert({
    student_id: user.id,
    amount: xpEarned,
    reason: "إكمال اختبار"
  });

  await supabase.from("activity_log").insert({
    student_id: user.id,
    activity_type: "quiz_completed",
    details: { quiz_id: quizId, score_percent: scorePercent, xp_earned: xpEarned }
  });

  // فحص الإنجازات الأساسية (مبسّط - يمكن توسيعه بدالة محفزات SQL لاحقاً)
  await checkAndAwardAchievements(supabase, user.id, scorePercent);

  return NextResponse.json({
    scorePercent,
    earnedPoints,
    totalPoints: quiz.total_points,
    correctCount,
    totalQuestions: answers.length,
    xpEarned,
    newXp,
    results: detailedResults
  });
}

function checkAnswer(type: string, correctAnswer: string | null, studentAnswer: string | null): boolean {
  if (!correctAnswer || !studentAnswer) return false;
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[\u064B-\u0652]/g, ""); // إزالة التشكيل

  if (type === "explain" || type === "definition") {
    // تصحيح تقريبي: تطابق جزئي للنص (يمكن تطويره لاحقاً بمراجعة المعلم)
    return normalize(studentAnswer).includes(normalize(correctAnswer).slice(0, 10));
  }

  return normalize(studentAnswer) === normalize(correctAnswer);
}

async function checkAndAwardAchievements(supabase: any, studentId: string, scorePercent: number) {
  const { count: completedCount } = await supabase
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("status", "completed");

  const { data: achievements } = await supabase.from("achievements").select("*");
  if (!achievements) return;

  for (const ach of achievements) {
    let earned = false;
    if (ach.condition_type === "quiz_count" && (completedCount ?? 0) >= ach.condition_value) earned = true;
    if (ach.condition_type === "perfect_score" && scorePercent >= ach.condition_value) earned = true;

    if (earned) {
      const { error } = await supabase
        .from("student_achievements")
        .insert({ student_id: studentId, achievement_id: ach.id })
        .select();
      // يتجاهل خطأ التكرار (unique constraint) لأن الإنجاز ربما مُنح مسبقاً
      if (!error) {
        await supabase.from("activity_log").insert({
          student_id: studentId,
          activity_type: "achievement_earned",
          details: { achievement_id: ach.id, title: ach.title }
        });
      }
    }
  }
}
