"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState<"scientific" | "literary">("scientific");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });

    if (signUpError) {
      setError(translateError(signUpError.message));
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").update({ branch }).eq("id", data.user.id);
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (<Suspense fallback={null}>
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-center text-2xl font-extrabold">إنشاء حساب جديد</h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          انضم إلى منصة الطالب العراقي وابدأ التحضير للوزاريات
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">الاسم الكامل</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="مثال: علي حسين محمد"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">البريد الإلكتروني</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">كلمة المرور</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="6 أحرف على الأقل"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">الفرع الدراسي</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBranch("scientific")}
                className={`rounded-xl border-2 py-3 text-sm font-bold transition ${
                  branch === "scientific"
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30"
                    : "border-gray-200 text-gray-500 dark:border-gray-700"
                }`}
              >
                الفرع العلمي
              </button>
              <button
                type="button"
                onClick={() => setBranch("literary")}
                className={`rounded-xl border-2 py-3 text-sm font-bold transition ${
                  branch === "literary"
                    ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30"
                    : "border-gray-200 text-gray-500 dark:border-gray-700"
                }`}
              >
                الفرع الأدبي
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-900/20">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="font-bold text-brand-600">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
    </Suspense>
  );
}

function translateError(message: string): string {
  if (message.includes("already registered")) return "هذا البريد الإلكتروني مسجل مسبقاً";
  if (message.includes("Password")) return "كلمة المرور ضعيفة جداً، يجب أن تكون 6 أحرف على الأقل";
  return "حدث خطأ، يرجى المحاولة مرة أخرى";
          }
