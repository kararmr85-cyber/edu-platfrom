"use client";

import { useEffect, useState } from "react";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/types";

export default function AdminQuestionsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [type, setType] = useState<QuestionType>("multiple_choice");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [isMinisterial, setIsMinisterial] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/questions").then(async (r) => {
      const d = await r.json();
      setQuestions(d.questions ?? []);
    });
    // جلب المواد من نقطة عامة بسيطة عبر supabase client كان أفضل، هنا تبسيط بجلب مباشر
    fetch("/api/admin/subjects-list").then(async (r) => {
      if (r.ok) {
        const d = await r.json();
        setSubjects(d.subjects ?? []);
      }
    }).catch(() => {});
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId,
        type,
        questionText,
        options: type === "multiple_choice" ? options.filter(Boolean) : null,
        correctAnswer,
        isMinisterial
      })
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error ?? "حدث خطأ");
      return;
    }

    setQuestions((prev) => [data.question, ...prev]);
    setQuestionText("");
    setCorrectAnswer("");
    setOptions(["", "", "", ""]);
    setMessage("تمت إضافة السؤال بنجاح ✅");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">بنك الأسئلة</h1>

      <form onSubmit={handleAdd} className="card space-y-4">
        <h2 className="font-bold">إضافة سؤال جديد</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold">المادة الدراسية (المعرّف)</label>
            <input
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="UUID المادة من جدول subjects"
              className="input-field"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">نوع السؤال</label>
            <select value={type} onChange={(e) => setType(e.target.value as QuestionType)} className="input-field">
              {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold">نص السؤال</label>
          <textarea
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="input-field"
            rows={3}
          />
        </div>

        {type === "multiple_choice" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((opt, idx) => (
              <input
                key={idx}
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[idx] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`الخيار ${idx + 1}`}
                className="input-field"
              />
            ))}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-semibold">الإجابة الصحيحة</label>
          <input
            required
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="input-field"
          />
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={isMinisterial}
            onChange={(e) => setIsMinisterial(e.target.checked)}
            className="h-4 w-4 accent-brand-600"
          />
          سؤال وزاري سابق
        </label>

        {message && <p className="text-sm font-semibold text-brand-600">{message}</p>}

        <button type="submit" className="btn-primary">إضافة السؤال</button>
      </form>

      <div className="card">
        <h2 className="mb-4 font-bold">آخر الأسئلة المضافة</h2>
        <div className="space-y-2">
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl border border-gray-100 p-3 text-sm dark:border-gray-800">
              <p className="font-semibold">{q.question_text}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {QUESTION_TYPE_LABELS[q.type as QuestionType]} · الإجابة: {q.correct_answer}
              </p>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">لا توجد أسئلة بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
