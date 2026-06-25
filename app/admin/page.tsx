import { Users, FileQuestion, BookOpen, ClipboardCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverview() {
  const supabase = createClient();

  const [{ count: usersCount }, { count: questionsCount }, { count: subjectsCount }, { count: quizzesCount }] =
    await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("questions").select("id", { count: "exact", head: true }),
      supabase.from("subjects").select("id", { count: "exact", head: true }),
      supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("status", "completed")
    ]);

  const stats = [
    { label: "إجمالي الطلاب", value: usersCount ?? 0, icon: Users },
    { label: "الأسئلة في البنك", value: questionsCount ?? 0, icon: FileQuestion },
    { label: "المواد الدراسية", value: subjectsCount ?? 0, icon: BookOpen },
    { label: "اختبارات مكتملة", value: quizzesCount ?? 0, icon: ClipboardCheck }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">نظرة عامة</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card text-center">
            <Icon className="mx-auto mb-2 text-brand-600" size={22} />
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
