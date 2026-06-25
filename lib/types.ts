export type Branch = "scientific" | "literary";
export type UserRole = "student" | "admin" | "teacher";
export type QuestionType =
  | "multiple_choice"
  | "fill_blank"
  | "explain"
  | "definition"
  | "true_false"
  | "ministerial";
export type QuizStatus = "in_progress" | "completed" | "abandoned";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  branch: Branch | null;
  governorate: string | null;
  school_name: string | null;
  phone: string | null;
  xp: number;
  level: number;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  slug: string;
  branch: Branch;
  icon: string | null;
  color: string;
  description: string | null;
  order_index: number;
}

export interface Question {
  id: string;
  subject_id: string;
  unit_id: string | null;
  type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: string | null;
  explanation: string | null;
  difficulty: 1 | 2 | 3;
  is_ministerial: boolean;
  ministerial_year: number | null;
  points: number;
}

export interface Quiz {
  id: string;
  student_id: string;
  subject_id: string;
  unit_id: string | null;
  status: QuizStatus;
  question_count: number;
  time_limit_seconds: number;
  started_at: string;
  finished_at: string | null;
  total_points: number;
  earned_points: number;
  score_percent: number | null;
  xp_earned: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_id: string;
  order_index: number;
  student_answer: string | null;
  is_correct: boolean | null;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "اختيار من متعدد",
  fill_blank: "إكمال الفراغ",
  explain: "سؤال شرح",
  definition: "تعريف",
  true_false: "صح أو خطأ",
  ministerial: "سؤال وزاري"
};

export const BRANCH_LABELS: Record<Branch, string> = {
  scientific: "علمي",
  literary: "أدبي"
};
