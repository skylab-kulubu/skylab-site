import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
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

// Every route renders per request (the pages say so too). The layout wraps CmsPage, so this also
// keeps the built-in 404 (/_not-found) from being prerendered with one task's CMS blocks.
export const dynamic = "force-dynamic";

const SITE_TITLE = "SKY LAB Bilgisayar Bilimleri Kulübü";
const SITE_DESCRIPTION =
  "SKY LAB, Yıldız Teknik Üniversitesi Bilgisayar Bilimleri Kulübü. Ekiplerimizde proje geliştiriyor; ARTLAB, SKYDAYS ve YILDIZJAM'i düzenliyoruz.";

export function generateMetadata(): Metadata {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: { title: SITE_TITLE, description: SITE_DESCRIPTION },
    twitter: { title: SITE_TITLE, description: SITE_DESCRIPTION },
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
          <CmsPage>
            <main>{children}</main>
          </CmsPage>
        </MotionPrefs>
      </body>
    </html>
  );
}
