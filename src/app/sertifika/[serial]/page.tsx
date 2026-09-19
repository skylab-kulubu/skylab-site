import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, BadgeX, Download, House, ShieldCheck } from "lucide-react";
import Header from "@/components/layouts/Header";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sertifika Doğrulama | SKY LAB",
  description:
    "SKY LAB tarafından verilen bir sertifikanın geçerliliğini doğrulayın.",
  robots: {
    index: false,
    follow: false,
  },
};

type PublicCertificate = {
  serial: string;
  recipientName: string;
  eventName: string;
  ownerTeam: string;
  status: "valid" | "revoked";
  verifyUrl: string;
  pdfUrl?: string;
  issuedAt: string;
  revokedAt?: string;
};

type LookupResult =
  | { kind: "found"; certificate: PublicCertificate }
  | { kind: "not-found" }
  | { kind: "unavailable" };

// Existing certificates used 64-bit serials; new certificates use 128-bit serials.
const SERIAL_PATTERN = /^(?:[A-Fa-f0-9]{16}|[A-Fa-f0-9]{32})$/;
const coreApi = (
  process.env.CORE_API_URL ?? "https://api.yildizskylab.com"
).replace(/\/+$/, "");

async function findCertificate(serial: string): Promise<LookupResult> {
  if (!SERIAL_PATTERN.test(serial)) return { kind: "not-found" };

  try {
    const response = await fetch(
      `${coreApi}/v1/public/certificates/${serial.toUpperCase()}`,
      { cache: "no-store" },
    );
    if (response.status === 404) return { kind: "not-found" };
    if (!response.ok) return { kind: "unavailable" };
    return {
      kind: "found",
      certificate: (await response.json()) as PublicCertificate,
    };
  } catch {
    return { kind: "unavailable" };
  }
}

function safeHttpsUrl(value?: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function displayTeam(ownerTeam: string) {
  const team = ownerTeam.trim();
  return !team || team === "YK" || team === "DK" ? "SKY LAB" : team;
}

function formattedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date);
}

function EmptyState({
  result,
  serial,
}: {
  result: Exclude<LookupResult, { kind: "found" }>;
  serial: string;
}) {
  const unavailable = result.kind === "unavailable";

  return (
    <section className="glass-panel-dark relative w-full max-w-2xl overflow-hidden rounded-[2rem] px-6 py-10 text-center sm:px-12 sm:py-14">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-rose-300/20 bg-rose-400/10 text-rose-200 shadow-[0_0_40px_rgba(251,113,133,0.12)]">
        <BadgeX aria-hidden="true" className="h-8 w-8" />
      </div>
      <p className="mt-8 text-xs font-bold tracking-[0.28em] text-indigo-300">
        SERTİFİKA DOĞRULAMA
      </p>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
        {unavailable
          ? "Doğrulama şu anda kullanılamıyor"
          : "Sertifika bulunamadı"}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
        {unavailable
          ? "Sertifika servisine şu anda ulaşılamıyor. Lütfen biraz sonra yeniden deneyin."
          : "Bu kod SKY LAB sertifika kayıtlarında bulunmuyor. Bağlantının tamamını kullandığınızdan emin olun."}
      </p>
      <p className="mt-7 break-all rounded-xl border border-white/5 bg-black/20 px-4 py-3 font-mono text-xs text-slate-500">
        {serial}
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-indigo-300/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <House aria-hidden="true" className="h-4 w-4" />
        Ana sayfaya dön
      </Link>
    </section>
  );
}

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const result = await findCertificate(serial);

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#04030e] text-white">
      <Header />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.24),transparent_68%)]" />
        <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 pb-14 pt-28 sm:px-6 sm:pt-32">
        {result.kind !== "found" ? (
          <EmptyState result={result} serial={serial} />
        ) : (
          <CertificateCard certificate={result.certificate} />
        )}
      </div>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: PublicCertificate }) {
  const valid = certificate.status === "valid";
  const pdfUrl = valid ? safeHttpsUrl(certificate.pdfUrl) : null;
  const StatusIcon = valid ? BadgeCheck : BadgeX;

  return (
    <section className="glass-panel-dark relative w-full max-w-3xl overflow-hidden rounded-[2rem]">
      <div className="border-b border-white/10 px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-200">
          <ShieldCheck aria-hidden="true" className="h-5 w-5" />
          SKY LAB doğrulama kaydı
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-11">
        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold ${
            valid
              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
              : "border-rose-300/20 bg-rose-400/10 text-rose-200"
          }`}
        >
          <StatusIcon aria-hidden="true" className="h-5 w-5" />
          {valid ? "Geçerli sertifika" : "İptal edilmiş sertifika"}
        </div>

        <p className="mt-8 text-xs font-bold tracking-[0.28em] text-indigo-300">
          SERTİFİKA SAHİBİ
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-balance text-white sm:text-6xl">
          {certificate.recipientName}
        </h1>
        <p className="mt-4 text-lg font-medium text-slate-200 sm:text-2xl">
          {certificate.eventName}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
          {valid
            ? "Bu sertifika SKY LAB kayıtlarıyla eşleşmektedir ve geçerlidir."
            : "Bu sertifika iptal edilmiştir ve artık geçerli bir belge olarak kullanılamaz."}
        </p>

        <dl className="mt-9 grid gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
              Düzenleyen
            </dt>
            <dd className="mt-2 font-semibold text-slate-100">
              {displayTeam(certificate.ownerTeam)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
              Verilme tarihi
            </dt>
            <dd className="mt-2 font-semibold text-slate-100">
              {formattedDate(certificate.issuedAt)}
            </dd>
          </div>
          {!valid && certificate.revokedAt ? (
            <div>
              <dt className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
                İptal tarihi
              </dt>
              <dd className="mt-2 font-semibold text-slate-100">
                {formattedDate(certificate.revokedAt)}
              </dd>
            </div>
          ) : null}
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
              Sertifika kodu
            </dt>
            <dd className="mt-2 break-all font-mono text-sm text-slate-300">
              {certificate.serial}
            </dd>
          </div>
        </dl>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#0b0920] transition hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              PDF sertifikayı indir
            </a>
          ) : null}
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-white transition hover:border-indigo-300/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <House aria-hidden="true" className="h-4 w-4" />
            SKY LAB ana sayfası
          </Link>
        </div>
      </div>
    </section>
  );
}
