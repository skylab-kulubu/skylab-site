import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import CursorGlow from "@/components/ui/CursorGlow";
import ScrollProgress from "@/components/ui/ScrollProgress";

const manrope = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope-sans',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "SKY LAB Bilgisayar Bilimleri Kulübü",
  description: "SKY LAB Bilgisayar Bilimleri Kulübü, Yıldız Teknik Üniversitesi bünyesinde bilişim alanında gelişimi hedefleyen en aktif öğrenci topluluğu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${manrope.variable} font-sans antialiased`}
      >
        <ScrollProgress/>
        <CursorGlow />
        <main>{children}</main>
      </body>
    </html>
  );
}
