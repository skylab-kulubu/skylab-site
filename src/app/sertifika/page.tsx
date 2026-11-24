import type { Metadata } from "next";
import SerialLookup from "./SerialLookup";

export const metadata: Metadata = {
  title: "Sertifika Doğrulama | SKY LAB",
  description: "SKY LAB tarafından verilen bir sertifikayı numarasıyla doğrulayın.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CertificateLookupPage() {
  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-10 pb-12">
      <h1 className="text-3xl leading-tight font-semibold text-balance text-foreground-strong">Sertifika doğrula</h1>
      <div className="mt-8">
        <SerialLookup />
      </div>
    </section>
  );
}
