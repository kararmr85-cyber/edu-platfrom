"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(params.get("redirect") || "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-center text-2xl font-extrabold">تسجيل الدخول</h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          أهلاً بعودتك، تابع رحلتك التعليمية
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">البريد الإلكتروني</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              dir="ltr"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-semibold">كلمة المرور</label>
              <Link href="/reset-password" className="text-xs font-bold text-brand-600">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-900/20">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="font-bold text-brand-600">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </div>
  );
}
