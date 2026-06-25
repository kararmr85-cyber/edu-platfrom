import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Clock, TrendingUp, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BRANCH_LABELS } from "@/lib/types";

export default async function DashboardHome() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, branch, xp, level")
    .eq("id", user.id)
    .single();

  const { data: quizzes } = await supabase
    .from("quizzes")
    .select("id, score_percent, status, finished_at, subject_id, subjects(name)")
    .eq("student_id", user.id)
    .eq("status", "completed")
    .order("finished_at", { ascending: false })
    .limit(5);

  const { count: completedCount } = await supabase
    .from("quizzes")
    .select("id", { count: "exact", head: true })
    .eq("student_id", user.id)
    .eq("status", "completed");

  const avgScore =
    quizzes && quizzes.length > 0
      ? Math.round(
          quizzes.reduce((sum, q) => sum + (q.score_percent ?? 0), 0) / quizzes.length
        )
      : 0;

  const stats = [
    { label: "الاختبارات المكتملة", value: completedCount ?? 0, icon: CheckCircle2 },
    { label: "متوسط الدرجات", value: `${avgScore}%`, icon: TrendingUp },
    { label: "نقاط الخبرة", value: profile?.xp ?? 0, icon: Target },
    { label: "المستوى", value: profile?.level ?? 1, icon: Clock }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">أهلاً، {profile?.full_name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">
          الفرع: {profile?.branch ? BRANCH_LABELS[profile.branch as "scientific" | "literary"] : "غير محدد"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon className="mx-auto mb-2 text-brand-600" size={22} />
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">آخر النشاطات</h2>
          <Link href="/dashboard/subjects" className="text-sm font-bold text-brand-600">
            بدء اختبار جديد
          </Link>
        </div>

        {!quizzes || quizzes.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            لم تقم بأي اختبار بعد. ابدأ أول اختبار لك الآن!
          </p>
        ) : (
          <div className="space-y-3">
            {quizzes.map((q: any) => (
              <div
                key={q.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <div>
                  <p className="font-semibold">{q.subjects?.name ?? "مادة"}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {q.finished_at ? new Date(q.finished_at).toLocaleDateString("ar-IQ") : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    (q.score_percent ?? 0) >= 50
                      ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {q.score_percent ?? 0}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
