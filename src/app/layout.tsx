import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/ui/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";
import MotionPrefs from "@/components/providers/MotionPrefs";
import { CmsPage } from "@/lib/cms";
import { robotsFor } from "@/lib/search-index";

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope-sans',
  display: 'swap',
  preload: true,
});

export function generateMetadata(): Metadata {
  return {
    title: "SKY LAB Bilgisayar Bilimleri Kulübü",
    description: "SKY LAB Bilgisayar Bilimleri Kulübü, Yıldız Teknik Üniversitesi bünyesinde bilişim alanında gelişimi hedefleyen en aktif öğrenci topluluğu.",
    robots: robotsFor(),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning> 
      <body
        className={`${manrope.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <MotionPrefs>
          <ScrollProgress/>
          <CursorGlow />
          <CmsPage>
            <main>{children}</main>
          </CmsPage>
        </MotionPrefs>
      </body>
    </html>
  );
}
