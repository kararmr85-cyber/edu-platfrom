-- =========================================================
-- منصة الطالب العراقي - السادس الإعدادي
-- قاعدة البيانات الكاملة (PostgreSQL / Supabase)
-- =========================================================

create extension if not exists "uuid-ossp";

-- ============== المستخدمون والملفات الشخصية ==============
create type user_role as enum ('student', 'admin', 'teacher');
create type branch_type as enum ('scientific', 'literary');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  avatar_url text,
  role user_role not null default 'student',
  branch branch_type,                      -- علمي / أدبي
  governorate text,                        -- المحافظة
  school_name text,
  phone text,
  xp integer not null default 0,
  level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============== المواد الدراسية ==============
create table public.subjects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                      -- اسم المادة بالعربي
  slug text not null unique,
  branch branch_type not null,
  icon text,                               -- اسم أيقونة (lucide)
  color text default '#22a86b',
  description text,
  order_index integer default 0,
  created_at timestamptz not null default now()
);

-- ============== الوحدات / الفصول داخل كل مادة ==============
create table public.units (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  order_index integer default 0,
  created_at timestamptz not null default now()
);

-- ============== بنك الأسئلة ==============
create type question_type as enum (
  'multiple_choice',
  'fill_blank',
  'explain',
  'definition',
  'true_false',
  'ministerial'
);

create table public.questions (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unit_id uuid references public.units(id) on delete set null,
  type question_type not null,
  question_text text not null,
  options jsonb,                 -- للاختيارات المتعددة: ["خيار1","خيار2",...]
  correct_answer text,           -- للإجابة الصحيحة (نص أو مفتاح الخيار)
  correct_answer_array jsonb,    -- لإجابات متعددة محتملة (مرادفات)
  explanation text,              -- شرح الإجابة
  difficulty smallint default 2 check (difficulty between 1 and 3), -- 1 سهل 2 متوسط 3 صعب
  is_ministerial boolean default false,   -- سؤال وزاري سابق
  ministerial_year integer,
  points integer not null default 1,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_questions_subject on public.questions(subject_id);
create index idx_questions_type on public.questions(type);

-- ============== الاختبارات (Quizzes) ==============
create type quiz_status as enum ('in_progress', 'completed', 'abandoned');

create table public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unit_id uuid references public.units(id),
  status quiz_status not null default 'in_progress',
  question_count integer not null default 10,
  time_limit_seconds integer not null default 600,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_points integer default 0,
  earned_points integer default 0,
  score_percent numeric(5,2),
  xp_earned integer default 0
);

create table public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  order_index integer not null,
  student_answer text,
  is_correct boolean,
  answered_at timestamptz,
  time_spent_seconds integer
);

create index idx_quiz_questions_quiz on public.quiz_questions(quiz_id);

-- ============== لوحة الصدارة ==============
create table public.leaderboard_snapshots (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id),
  period text not null default 'all_time', -- weekly / monthly / all_time
  rank integer,
  score integer,
  snapshot_date date not null default current_date
);

-- ============== الموارد التعليمية ==============
create table public.resources (
  id uuid primary key default uuid_generate_v4(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unit_id uuid references public.units(id),
  title text not null,
  description text,
  file_url text not null,         -- رابط ملف PDF في Supabase Storage
  file_type text default 'pdf',
  resource_kind text default 'note', -- note | summary | study_material
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============== نظام التحفيز (Gamification) ==============
create table public.achievements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  icon text,
  xp_reward integer default 0,
  condition_type text not null,   -- e.g. 'quiz_count','perfect_score','streak'
  condition_value integer not null
);

create table public.student_achievements (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(student_id, achievement_id)
);

create table public.xp_log (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ============== سجل النشاط الأخير ==============
create table public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null,   -- quiz_completed | resource_viewed | level_up | achievement_earned
  details jsonb,
  created_at timestamptz not null default now()
);

-- =========================================================
-- دوال ومحفزات (Functions & Triggers)
-- =========================================================

-- تحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- إنشاء profile تلقائياً عند تسجيل مستخدم جديد في auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'طالب جديد'),
    new.email,
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- حساب المستوى تلقائياً بناءً على XP (كل 100 نقطة = مستوى)
create or replace function public.recalc_level()
returns trigger as $$
begin
  new.level := floor(new.xp / 100) + 1;
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_level
before update of xp on public.profiles
for each row execute function public.recalc_level();

-- =========================================================
-- صلاحيات الأمان على مستوى الصفوف (Row Level Security)
-- =========================================================

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.units enable row level security;
alter table public.questions enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.resources enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;
alter table public.xp_log enable row level security;
alter table public.activity_log enable row level security;
alter table public.leaderboard_snapshots enable row level security;

-- مساعد: هل المستخدم الحالي أدمن؟
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: كل مستخدم يرى ويعدل بياناته فقط، الأدمن يرى الكل
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- subjects/units/questions/resources/achievements: قراءة عامة للجميع المسجلين، كتابة للأدمن فقط
create policy "subjects_read_all" on public.subjects for select using (true);
create policy "subjects_admin_write" on public.subjects for all using (public.is_admin());

create policy "units_read_all" on public.units for select using (true);
create policy "units_admin_write" on public.units for all using (public.is_admin());

create policy "questions_read_all" on public.questions for select using (auth.uid() is not null);
create policy "questions_admin_write" on public.questions for all using (public.is_admin());

create policy "resources_read_all" on public.resources for select using (auth.uid() is not null);
create policy "resources_admin_write" on public.resources for all using (public.is_admin());

create policy "achievements_read_all" on public.achievements for select using (true);
create policy "achievements_admin_write" on public.achievements for all using (public.is_admin());

-- quizzes/quiz_questions: الطالب يرى ويعدل اختباراته فقط
create policy "quizzes_owner" on public.quizzes
  for all using (student_id = auth.uid() or public.is_admin());

create policy "quiz_questions_owner" on public.quiz_questions
  for all using (
    exists (select 1 from public.quizzes q where q.id = quiz_id and (q.student_id = auth.uid() or public.is_admin()))
  );

-- student_achievements / xp_log / activity_log: الطالب يرى سجله فقط
create policy "student_achievements_owner" on public.student_achievements
  for select using (student_id = auth.uid() or public.is_admin());
create policy "xp_log_owner" on public.xp_log
  for select using (student_id = auth.uid() or public.is_admin());
create policy "activity_log_owner" on public.activity_log
  for select using (student_id = auth.uid() or public.is_admin());

-- leaderboard: قراءة عامة لكل المسجلين
create policy "leaderboard_read_all" on public.leaderboard_snapshots
  for select using (auth.uid() is not null);

-- =========================================================
-- بيانات أولية: المواد الدراسية
-- =========================================================

insert into public.subjects (name, slug, branch, icon, order_index) values
  ('الرياضيات', 'math', 'scientific', 'Calculator', 1),
  ('الفيزياء', 'physics', 'scientific', 'Atom', 2),
  ('الكيمياء', 'chemistry', 'scientific', 'FlaskConical', 3),
  ('الأحياء', 'biology', 'scientific', 'Dna', 4),
  ('اللغة العربية', 'arabic-sci', 'scientific', 'BookOpen', 5),
  ('اللغة الإنكليزية', 'english-sci', 'scientific', 'Languages', 6),
  ('التربية الإسلامية', 'islamic-sci', 'scientific', 'Moon', 7),
  ('اللغة العربية', 'arabic-lit', 'literary', 'BookOpen', 1),
  ('اللغة الإنكليزية', 'english-lit', 'literary', 'Languages', 2),
  ('التاريخ', 'history', 'literary', 'Landmark', 3),
  ('الجغرافية', 'geography', 'literary', 'Globe', 4),
  ('الاقتصاد', 'economics', 'literary', 'TrendingUp', 5),
  ('التربية الإسلامية', 'islamic-lit', 'literary', 'Moon', 6);

-- إنجازات أولية
insert into public.achievements (title, description, icon, xp_reward, condition_type, condition_value) values
  ('أول خطوة', 'أكمل أول اختبار لك', 'Footprints', 20, 'quiz_count', 1),
  ('علامة كاملة', 'حقق 100% في اختبار', 'Star', 50, 'perfect_score', 100),
  ('مثابر', 'أكمل 10 اختبارات', 'Flame', 100, 'quiz_count', 10),
  ('نجم الوزاريات', 'أكمل 5 اختبارات وزارية', 'Award', 80, 'ministerial_count', 5);
