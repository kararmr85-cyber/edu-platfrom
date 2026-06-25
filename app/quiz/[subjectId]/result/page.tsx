"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface ResultData {
  scorePercent: number;
  earnedPoints: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  xpEarned: number;
  newXp: number;
  results: {
    questionId: string;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string | null;
    studentAnswer: string;
  }[];
}

export default function QuizResultPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const quizId = search.get("quizId");
  const [data, setData] = useState<ResultData | null>(null);

  useEffect(() => {
    if (!quizId) return;
    const stored = sessionStorage.getItem(`quiz_result_${quizId}`);
    if (stored) setData(JSON.parse(stored));
  }, [quizId]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div>
          <p className="mb-4 text-gray-500 dark:text-gray-400">لا توجد نتيجة متاحة لهذا الاختبار.</p>
          <Link href="/dashboard" className="btn-primary">العودة إلى لوحة التحكم</Link>
        </div>
      </div>
    );
  }

  const passed = data.scorePercent >= 50;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="card text-center">
          <div
            className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              passed ? "bg-brand-100 dark:bg-brand-900/30" : "bg-red-100 dark:bg-red-900/30"
            }`}
          >
            <Trophy className={passed ? "text-brand-600" : "text-red-600"} size={36} />
          </div>
          <h1 className="text-3xl font-extrabold">{data.scorePercent}%</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            أجبت بشكل صحيح على {data.correctCount} من {data.totalQuestions} سؤال
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <p className="text-lg font-bold">{data.earnedPoints}/{data.totalPoints}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">النقاط</p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <p className="text-lg font-bold text-brand-600">+{data.xpEarned}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">خبرة مكتسبة</p>
            </div>
            <div className="rounded-xl bg-gray-100 p-3 dark:bg-gray-800">
              <p className="text-lg font-bold">{data.newXp}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">إجمالي الخبرة</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => router.push(`/quiz/${subjectId}`)} className="btn-secondary flex-1">
              <RotateCcw size={18} />
              اختبار آخر
            </button>
            <Link href="/dashboard" className="btn-primary flex-1">
              العودة إلى لوحة التحكم
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-bold">تفاصيل الإجابات</h2>
          <div className="space-y-3">
            {data.results.map((r, idx) => (
              <div
                key={r.questionId}
                className="rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="mb-1 flex items-center gap-2">
                  {r.isCorrect ? (
                    <CheckCircle2 className="text-brand-600" size={18} />
                  ) : (
                    <XCircle className="text-red-500" size={18} />
                  )}
                  <span className="text-sm font-bold">السؤال {idx + 1}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  إجابتك: {r.studentAnswer || "بدون إجابة"}
                </p>
                {!r.isCorrect && (
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
                    الإجابة الصحيحة: {r.correctAnswer}
                  </p>
                )}
                {r.explanation && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{r.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
