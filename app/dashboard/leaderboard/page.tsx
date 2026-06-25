import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("profiles")
    .select("id, full_name, xp, level")
    .order("xp", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">لوحة الصدارة</h1>
      <div className="card">
        <div className="space-y-2">
          {(students ?? []).map((s, idx) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-xl p-3 ${
                s.id === user.id ? "bg-brand-50 dark:bg-brand-900/20" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-extrabold ${
                    idx < 3 ? "bg-yellow-400 text-white" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="font-semibold">{s.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-600">
                <Trophy size={16} />
                {s.xp} نقطة · مستوى {s.level}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
