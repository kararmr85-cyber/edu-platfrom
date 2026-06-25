import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, Trophy, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, xp, level, role")
    .eq("id", user.id)
    .single();

  const navItems = [
    { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/dashboard/subjects", label: "المواد الدراسية", icon: BookOpen },
    { href: "/dashboard/resources", label: "الملخصات والمصادر", icon: FileText },
    { href: "/dashboard/leaderboard", label: "لوحة الصدارة", icon: Trophy }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden w-64 flex-col border-l border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:flex">
        <div className="mb-6 px-2">
          <p className="font-extrabold text-brand-600">منصة السادس الإعدادي</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            مرحباً، {profile?.full_name ?? "طالب"} 👋
          </p>
        </div>

        <nav className="flex-1 space-y-1">
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
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-gray-800"
            >
              <LayoutDashboard size={18} />
              لوحة تحكم الأدمن
            </Link>
          )}
        </nav>

        <div className="mt-4 rounded-xl bg-brand-50 p-3 text-center dark:bg-brand-900/20">
          <p className="text-xs text-gray-500 dark:text-gray-400">المستوى الحالي</p>
          <p className="text-xl font-extrabold text-brand-700 dark:text-brand-300">
            {profile?.level ?? 1}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.xp ?? 0} نقطة خبرة</p>
        </div>

        <form action="/auth/signout" method="post" className="mt-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 md:hidden">
          <p className="font-extrabold text-brand-600">منصة السادس الإعدادي</p>
          <ThemeToggle />
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
