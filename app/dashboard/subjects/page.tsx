import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SubjectQuizLauncher from "@/components/SubjectQuizLauncher";

export default async function SubjectsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("branch").eq("id", user.id).single();
  const branch = profile?.branch ?? "scientific";

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("branch", branch)
    .order("order_index");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">المواد الدراسية</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(subjects ?? []).map((s) => (
          <SubjectQuizLauncher key={s.id} subject={s} />
        ))}
      </div>
    </div>
  );
}
