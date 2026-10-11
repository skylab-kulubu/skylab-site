import type { Metadata } from "next";
import { Badge, Card, DescriptionList, StatusPage, type DescriptionItem } from "@skylab-kulubu/skylcn-ui";
import { BadgeCheck, BadgeX, Download, House } from "lucide-react";
import LinkButton from "@/components/skylcn/LinkButton";
import { certificateLookupUrl } from "@/lib/certificate-lookup";

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

async function findCertificate(serial: string): Promise<LookupResult> {
  if (!SERIAL_PATTERN.test(serial)) return { kind: "not-found" };

  try {
    // CORE_API_ORIGIN is API_BASE_URL, written into the build by next.config.ts.
    const response = await fetch(
      certificateLookupUrl(process.env.CORE_API_ORIGIN, serial),
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

function HomeButton({ label }: { label: string }) {
  return (
    <LinkButton href="/">
      <House aria-hidden="true" />
      {label}
    </LinkButton>
  );
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
    <StatusPage
      as="div"
      className="min-h-0 flex-1 bg-transparent px-5 pt-10 pb-12"
      title={unavailable ? "Doğrulama şu anda kullanılamıyor" : "Sertifika bulunamadı"}
      description={
        unavailable
          ? "Sertifika servisine şu anda ulaşılamıyor. Lütfen biraz sonra yeniden deneyin."
          : "Bu kod SKY LAB sertifika kayıtlarında bulunmuyor. Bağlantının tamamını kullandığınızdan emin olun."
      }
    >
      <p className="w-full rounded-lg border border-border bg-muted px-4 py-3 font-mono text-xs break-all text-muted-foreground">
        {serial}
      </p>
      <HomeButton label="Ana sayfaya dön" />
    </StatusPage>
  );
}

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const result = await findCertificate(serial);

  return result.kind !== "found" ? (
    <EmptyState result={result} serial={serial} />
  ) : (
    <CertificateDetails certificate={result.certificate} />
  );
}

function CertificateDetails({ certificate }: { certificate: PublicCertificate }) {
  const valid = certificate.status === "valid";
  const pdfUrl = valid ? safeHttpsUrl(certificate.pdfUrl) : null;
  const StatusIcon = valid ? BadgeCheck : BadgeX;
  const details: DescriptionItem[] = [
    { label: "Düzenleyen", value: displayTeam(certificate.ownerTeam) },
    { label: "Verilme tarihi", value: formattedDate(certificate.issuedAt) },
    ...(!valid && certificate.revokedAt
      ? [{ label: "İptal tarihi", value: formattedDate(certificate.revokedAt) }]
      : []),
    {
      label: "Sertifika kodu",
      value: <span className="font-mono text-xs break-all text-secondary-foreground">{certificate.serial}</span>,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pt-10 pb-12">
      <Badge tone={valid ? "success" : "danger"} size="md" className="self-start">
        <StatusIcon aria-hidden="true" />
        {valid ? "Geçerli sertifika" : "İptal edilmiş sertifika"}
      </Badge>
      <p className="mt-6 text-2xs font-medium tracking-label text-subtle-foreground uppercase">Sertifika sahibi</p>
      <h1 className="mt-2 text-3xl leading-tight font-semibold text-balance text-foreground-strong">
        {certificate.recipientName}
      </h1>
      <p className="mt-2 text-lg text-secondary-foreground">{certificate.eventName}</p>
      <p className="mt-3 text-sm leading-relaxed text-pretty text-muted-foreground">
        {valid
          ? "Bu sertifika SKY LAB kayıtlarıyla eşleşmektedir ve geçerlidir."
          : "Bu sertifika iptal edilmiştir ve artık geçerli bir belge olarak kullanılamaz."}
      </p>

      <Card className="mt-8 p-5">
        <DescriptionList items={details} />
      </Card>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {pdfUrl ? (
          <LinkButton href={pdfUrl} variant="primary">
            <Download aria-hidden="true" />
            PDF sertifikayı indir
          </LinkButton>
        ) : null}
        <HomeButton label="SKY LAB ana sayfası" />
      </div>
    </section>
  );
}
