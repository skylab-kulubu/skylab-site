// A certificate's serial as core writes it: 32 hex characters (128 bits);
// certificates issued before that have 16 (64 bits).
export const SERIAL_PATTERN = /^(?:[A-Fa-f0-9]{16}|[A-Fa-f0-9]{32})$/;

// The serial in what someone typed or pasted into /sertifika: the serial
// itself, or a link that ends in it (skyl.app/c/…, …/sertifika/…). Spaces
// and dashes are dropped. null when it is not a serial.
export function serialFromInput(input: string): string | null {
  let value = input.trim().split(/[?#]/)[0];
  const slash = value.replace(/\/+$/, "").lastIndexOf("/");
  if (slash >= 0) value = value.replace(/\/+$/, "").slice(slash + 1);
  value = value.replace(/[\s-]/g, "");
  return SERIAL_PATTERN.test(value) ? value.toUpperCase() : null;
}
