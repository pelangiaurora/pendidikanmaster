import type { Metadata } from 'next';
import './globals.css';
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PendidikanMaster - Platform Pembelajaran Modern',
  description: 'Masuk ke akun PendidikanMaster untuk mengakses dasbor belajar interaktif, materi kursus berkualitas tinggi, dan melacak perkembangan belajar Anda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans antialiased text-slate-950 min-h-screen", geist.variable, plusJakartaSans.variable)}>
      <body suppressHydrationWarning className="bg-slate-50/30">
        {children}
      </body>
    </html>
  );
}
