import { redirect } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ResourcesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, description, file_url, resource_kind, subjects(name)")
    .order("created_at", { ascending: false });

  const kindLabel: Record<string, string> = {
    note: "ملاحظات",
    summary: "ملخص",
    study_material: "مادة دراسية"
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">الملخصات والمصادر الدراسية</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {(resources ?? []).map((r: any) => (
          <div key={r.id} className="card flex items-start gap-3">
            <FileText className="mt-1 text-brand-600" size={22} />
            <div className="flex-1">
              <p className="font-bold">{r.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {r.subjects?.name} · {kindLabel[r.resource_kind] ?? r.resource_kind}
              </p>
              {r.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{r.description}</p>
              )}
              <a
                href={r.file_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-600"
              >
                <Download size={16} />
                تحميل / فتح الملف
              </a>
            </div>
          </div>
        ))}
        {(!resources || resources.length === 0) && (
          <p className="text-gray-500 dark:text-gray-400">لا توجد مصادر متاحة حالياً.</p>
        )}
      </div>
    </div>
  );
}
