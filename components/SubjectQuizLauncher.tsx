"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

export default function SubjectQuizLauncher({ subject }: { subject: { id: string; name: string; color: string } }) {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [ministerialOnly, setMinisterialOnly] = useState(false);
  const [open, setOpen] = useState(false);

  function start() {
    router.push(`/quiz/${subject.id}?count=${count}&ministerial=${ministerialOnly ? "1" : "0"}`);
  }

  return (
    <div className="card">
      <h3 className="mb-3 text-lg font-bold">{subject.name}</h3>

      {!open ? (
        <button onClick={() => setOpen(true)} className="btn-primary w-full">
          <Play size={18} />
          بدء اختبار
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-semibold">عدد الأسئلة</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="input-field"
            >
              {[5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n} أسئلة</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={ministerialOnly}
              onChange={(e) => setMinisterialOnly(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            أسئلة وزارية سابقة فقط
          </label>

          <button onClick={start} className="btn-primary w-full">
            <Play size={18} />
            ابدأ الآن
          </button>
        </div>
      )}
    </div>
  );
}
