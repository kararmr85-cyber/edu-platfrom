import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, FileQuestion, Upload, BarChart3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  const navItems = [
    { href: "/admin", label: "نظرة عامة", icon: BarChart3 },
    { href: "/admin/users", label: "المستخدمون", icon: Users },
    { href: "/admin/subjects", label: "المواد الدراسية", icon: BookOpen },
    { href: "/admin/questions", label: "بنك الأسئلة", icon: FileQuestion },
    { href: "/admin/resources", label: "رفع الملفات", icon: Upload }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden w-64 flex-col border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:flex">
        <p className="mb-6 px-2 font-extrabold text-brand-600">لوحة تحكم الأدمن</p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-brand-50 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            رجوع لمنصة الطالب
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6">{children}</main>
    </div>
  );
}
