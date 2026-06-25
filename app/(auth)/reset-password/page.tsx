"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`
    });

    setLoading(false);
    if (resetError) {
      setError("تعذّر إرسال رابط إعادة التعيين، تحقق من البريد الإلكتروني");
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-center text-2xl font-extrabold">إعادة تعيين كلمة المرور</h1>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
        </p>

        {sent ? (
          <p className="rounded-lg bg-brand-50 p-4 text-center text-sm font-semibold text-brand-700 dark:bg-brand-900/20">
            تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق الوارد.
          </p>
        ) : (
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

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-900/20">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/login" className="font-bold text-brand-600">
            رجوع لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
