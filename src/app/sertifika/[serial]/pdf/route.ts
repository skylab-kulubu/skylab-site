import { fetchCertificatePdf } from "@/lib/certificate-pdf";
import { visitorAddress } from "@/lib/ticket-page";

// The certificate's PDF on the club's address: /sertifika/{serial}.pdf, which
// the middleware rewrites here (src/lib/certificate-pdf.ts). This server asks
// core and streams the PDF on, so the browser never calls core for it and
// core counts each visitor by the address passed along.
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params;
  const visitor = visitorAddress(request.headers.get("x-forwarded-for"), request.headers.get("x-real-ip"));
  return fetchCertificatePdf(serial, process.env.CORE_API_ORIGIN, {
    visitor,
    coreInternalUrl: process.env.CORE_INTERNAL_URL,
  });
}
