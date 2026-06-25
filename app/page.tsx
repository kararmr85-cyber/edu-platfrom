import Link from "next/link";
import {
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  BookOpen,
  Languages,
  Moon as MoonIcon,
  Landmark,
  Globe,
  TrendingUp,
  Trophy,
  Timer,
  FileText,
  BarChart3
} from "lucide-react";
import Navbar from "@/components/Navbar";

const scientificSubjects = [
  { name: "الرياضيات", icon: Calculator },
  { name: "الفيزياء", icon: Atom },
  { name: "الكيمياء", icon: FlaskConical },
  { name: "الأحياء", icon: Dna },
  { name: "اللغة العربية", icon: BookOpen },
  { name: "اللغة الإنكليزية", icon: Languages },
  { name: "التربية الإسلامية", icon: MoonIcon }
];

const literarySubjects = [
  { name: "اللغة العربية", icon: BookOpen },
  { name: "اللغة الإنكليزية", icon: Languages },
  { name: "التاريخ", icon: Landmark },
  { name: "الجغرافية", icon: Globe },
  { name: "الاقتصاد", icon: TrendingUp },
  { name: "التربية الإسلامية", icon: MoonIcon }
];

const features = [
  { title: "بنك أسئلة شامل", desc: "اختيارات متعددة، إكمال فراغ، صح وخطأ، أسئلة وزارية سابقة، وأسئلة شرح وتعريف.", icon: FileText },
  { title: "اختبارات بمؤقّت", desc: "اختبارات عشوائية مع تصحيح آلي فوري ونتائج تفصيلية لكل سؤال.", icon: Timer },
  { title: "لوحة صدارة", desc: "نافس زملاءك على أعلى الدرجات ضمن مدرستك أو محافظتك أو العراق كله.", icon: Trophy },
  { title: "تتبع التقدم", desc: "إحصائيات دقيقة لأدائك في كل مادة، نقاط الخبرة (XP) والمستويات والإنجازات.", icon: BarChart3 }
];

export default function LandingPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white px-4 py-20 text-center dark:from-gray-900 dark:to-gray-950 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-bold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            خاص بطلاب السادس الإعدادي في العراق
          </span>
          <h1 className="text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl">
            استعد للامتحانات الوزارية
            <br />
            <span className="text-brand-600">بثقة وذكاء</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            منصة تعليمية متكاملة للفرعين العلمي والأدبي، تضم آلاف الأسئلة، اختبارات تفاعلية،
            ملخصات ومصادر دراسية، ونظام نقاط وتحفيز يجعل المذاكرة أكثر تشويقاً.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-primary w-full sm:w-auto">
              ابدأ مجاناً الآن
            </Link>
            <Link href="/#subjects" className="btn-secondary w-full sm:w-auto">
              استعرض المواد الدراسية
            </Link>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="subjects" className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-2xl font-extrabold sm:text-3xl">المواد الدراسية</h2>
          <p className="mb-10 text-center text-gray-500 dark:text-gray-400">
            اختر فرعك وابدأ المذاكرة في كل مادة
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="card">
              <h3 className="mb-4 text-lg font-bold text-brand-600">الفرع العلمي</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {scientificSubjects.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center text-sm font-semibold dark:border-gray-800"
                  >
                    <Icon className="text-brand-600" size={24} />
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="mb-4 text-lg font-bold text-brand-600">الفرع الأدبي</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {literarySubjects.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 p-4 text-center text-sm font-semibold dark:border-gray-800"
                  >
                    <Icon className="text-brand-600" size={24} />
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-100 px-4 py-16 dark:bg-gray-900/40 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-extrabold sm:text-3xl">مزايا المنصة</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="card text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/40">
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 font-bold">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center sm:px-6">
        <h2 className="mb-4 text-2xl font-extrabold sm:text-3xl">جاهز تبدأ رحلتك نحو التفوق؟</h2>
        <p className="mx-auto mb-8 max-w-md text-gray-500 dark:text-gray-400">
          سجّل الآن مجاناً واحصل على أول اختبار تجريبي خلال دقائق.
        </p>
        <Link href="/signup" className="btn-primary">
          إنشاء حساب جديد
        </Link>
      </section>

      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
        © {new Date().getFullYear()} منصة الطالب العراقي. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
}
