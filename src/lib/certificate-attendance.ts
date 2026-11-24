// The verification page's attendance line (/sertifika/[serial]): core's
// public certificate carries the attendance it was issued on, and the page
// reads it as "8 oturumdan 6'sı · 9 saat". An older certificate, or an older
// core, has no attendance and the page shows no line.

export type CertificateAttendance = {
  attended: number;
  total: number;
  programMinutes: number;
};

// The possessive suffix of a number, with its apostrophe, by how the number
// is read aloud: the suffix follows the last word's last vowel (6 altı → 6'sı,
// 40 kırk → 40'ı, 100 yüz → 100'ü, 1000 bin → 1000'i).
const ONES = ["", "'i", "'si", "'ü", "'ü", "'i", "'sı", "'si", "'i", "'u"];
const TENS = ["", "'u", "'si", "'u", "'ı", "'si", "'ı", "'i", "'i", "'ı"];

export function ordinalSuffix(n: number): string {
  if (!Number.isSafeInteger(n) || n < 0) return "";
  if (n === 0) return "'ı"; // sıfır
  if (n % 10) return ONES[n % 10];
  if (n % 100) return TENS[(n % 100) / 10];
  if (n % 1000) return "'ü"; // yüz
  if (n % 1_000_000) return "'i"; // bin
  if (n % 1_000_000_000) return "'u"; // milyon
  return "'ı"; // milyar
}

// The program length: empty for 0 (the Sessions had no times), minutes
// under an hour, else hours to the nearest half hour (a tie rounds up) with
// a Turkish decimal comma: "45 dakika", "9 saat", "7,5 saat".
export function programDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "";
  const whole = Math.round(minutes);
  if (whole < 60) return `${whole} dakika`;
  const halves = Math.floor((whole + 15) / 30);
  const hours = Math.floor(halves / 2);
  return halves % 2 ? `${hours},5 saat` : `${hours} saat`;
}

function count(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

// The line, or null when the certificate carries no attendance (or one the
// page cannot read).
export function attendanceLine(attendance: Partial<CertificateAttendance> | null | undefined): string | null {
  if (!attendance || !count(attendance.attended) || !count(attendance.total)) return null;
  const line = `${attendance.total} oturumdan ${attendance.attended}${ordinalSuffix(attendance.attended)}`;
  const duration = count(attendance.programMinutes) ? programDuration(attendance.programMinutes) : "";
  return duration ? `${line} · ${duration}` : line;
}
