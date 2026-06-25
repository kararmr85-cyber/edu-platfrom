"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/types";

interface QuizQuestionView {
  id: string;
  type: QuestionType;
  question_text: string;
  options: string[] | null;
  points: number;
  is_ministerial: boolean;
}

export default function QuizPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const router = useRouter();
  const search = useSearchParams();

  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionView[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionCount = Number(search.get("count") ?? 10);
  const ministerialOnly = search.get("ministerial") === "1";

  useEffect(() => {
    async function startQuiz() {
      setLoading(true);
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId, questionCount, ministerialOnly })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "تعذّر بدء الاختبار");
        setLoading(false);
        return;
      }

      setQuizId(data.quiz.id);
      setQuestions(data.questions);
      setTimeLeft(data.quiz.time_limit_seconds);
      setLoading(false);
    }
    startQuiz();
  }, [subjectId, questionCount, ministerialOnly]);

  const handleSubmit = useCallback(async () => {
    if (!quizId || submitting) return;
    setSubmitting(true);

    const payload = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? ""
    }));

    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers: payload })
    });
    const data = await res.json();
    setSubmitting(false);

    if (res.ok) {
      sessionStorage.setItem(`quiz_result_${quizId}`, JSON.stringify(data));
      router.push(`/quiz/${subjectId}/result?quizId=${quizId}`);
    } else {
      setError(data.error ?? "تعذّر إرسال الإجابات");
    }
  }, [quizId, questions, answers, submitting, router, subjectId]);

  // المؤقّت
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, timeLeft, handleSubmit]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">جارٍ تجهيز الاختبار...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <p className="font-bold text-red-600">{error}</p>
          <button onClick={() => router.back()} className="btn-secondary mt-4">رجوع</button>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            السؤال {currentIndex + 1} من {questions.length} · تمت الإجابة على {answeredCount}
          </span>
          <div className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
            <Clock size={16} />
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
        <div className="mx-auto mt-2 h-1.5 max-w-3xl overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {QUESTION_TYPE_LABELS[q.type]}
            </span>
            {q.is_ministerial && (
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                سؤال وزاري
              </span>
            )}
          </div>

          <h2 className="mb-6 text-lg font-bold leading-relaxed">{q.question_text}</h2>

          <QuestionInput
            question={q}
            value={answers[q.id] ?? ""}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="btn-secondary"
          >
            <ChevronRight size={18} />
            السابق
          </button>

          {currentIndex === questions.length - 1 ? (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              <Send size={18} />
              {submitting ? "جارٍ التصحيح..." : "إنهاء الاختبار وإرسال الإجابات"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="btn-primary"
            >
              التالي
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {questions.map((qq, idx) => (
            <button
              key={qq.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition ${
                idx === currentIndex
                  ? "bg-brand-600 text-white"
                  : answers[qq.id]
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function QuestionInput({
  question,
  value,
  onChange
}: {
  question: QuizQuestionView;
  value: string;
  onChange: (v: string) => void;
}) {
  if (question.type === "multiple_choice" || question.type === "ministerial") {
    return (
      <div className="space-y-2">
        {(question.options ?? []).map((opt, idx) => (
          <label
            key={idx}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition ${
              value === opt
                ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="h-4 w-4 accent-brand-600"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "true_false") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {["صحيح", "خاطئ"].map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-xl border-2 py-4 font-bold transition ${
              value === opt
                ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/20"
                : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  // fill_blank | explain | definition
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={question.type === "explain" ? 6 : 2}
      placeholder="اكتب إجابتك هنا..."
      className="input-field"
    />
  );
}
