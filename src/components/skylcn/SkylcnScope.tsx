import { Space_Grotesk, Space_Mono } from "next/font/google";
import { SkylabMark, SkylcnProvider } from "@skylab-kulubu/skylcn-ui";
import "./skylcn-scope.css";

const sans = Space_Grotesk({
  variable: "--skylcn-font-sans",
  subsets: ["latin", "latin-ext"],
});

const mono = Space_Mono({
  variable: "--skylcn-font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
});

// The frame of the pages drawn with skylcn-ui (ADR 0055): /kapi and /sertifika.
// Their route layouts render it, so skylcn-scope.css and the Space fonts load with
// those routes only. These pages carry no next/link: a stylesheet stays in the
// document after a client-side navigation, so leaving them is a full page load and
// skylcn-ui's theme never reaches another page of the site.
// They are always dark, like the rest of the site, which has no theme switch:
// data-theme is fixed on the wrapper and no script reads a remembered choice.
// `wide` lines the header up with a page wider than the door's single form.
export default function SkylcnScope({ wide = false, children }: { wide?: boolean; children: React.ReactNode }) {
  return (
    <>
      <SkylcnProvider locale="tr">
        <div
          data-theme="dark"
          className={`${sans.variable} ${mono.variable} skylcn-scope flex min-h-svh flex-col bg-background font-sans text-foreground antialiased`}
        >
          <header
            className={`mx-auto flex w-full items-center gap-2 px-5 pt-6 text-foreground-strong ${wide ? "max-w-xl" : "max-w-md"}`}
          >
            <SkylabMark size={22} />
            <span className="text-sm font-semibold tracking-tight">SKY LAB</span>
          </header>
          {children}
        </div>
      </SkylcnProvider>
    </>
  );
}
