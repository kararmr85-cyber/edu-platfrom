import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic"
});

export const metadata: Metadata = {
  title: "منصة الطالب العراقي | السادس الإعدادي",
  description:
    "منصة تعليمية شاملة لطلاب السادس الإعدادي في العراق - الفرع العلمي والأدبي. اختبارات، بنك أسئلة، ملخصات، ونظام نقاط وتحفيز."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        {/* تطبيق الوضع الليلي قبل أي رسم لمنع الوميض */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className="bg-gray-50 font-arabic text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
