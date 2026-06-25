import Link from "next/link";
import { GraduationCap } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-600">
          <GraduationCap size={28} />
          <span className="text-lg">منصة السادس الإعدادي</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-semibold text-gray-700 dark:text-gray-200 md:flex">
          <Link href="/#subjects" className="hover:text-brand-600">المواد</Link>
          <Link href="/#features" className="hover:text-brand-600">المزايا</Link>
          <Link href="/#leaderboard" className="hover:text-brand-600">لوحة الصدارة</Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-secondary !px-4 !py-2 text-sm">تسجيل الدخول</Link>
          <Link href="/signup" className="btn-primary !px-4 !py-2 text-sm">إنشاء حساب</Link>
        </div>
      </nav>
    </header>
  );
}
