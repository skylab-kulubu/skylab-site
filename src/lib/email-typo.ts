// A likely slip in an e-mail address's domain (gmial.com, hotmail.con), for a
// "did you mean …?" hint next to a refused check-in. Only a suggestion: the
// page never changes what the guest typed by itself.
//
// The list is the common providers' misspellings plus the university's student
// domain. A domain not listed is left alone, so a real but unusual address is
// never flagged.

const TYPOS: Record<string, string[]> = {
  "gmail.com": [
    "gmial.com",
    "gmal.com",
    "gmai.com",
    "gamil.com",
    "gmil.com",
    "gmali.com",
    "gnail.com",
    "gmaill.com",
    "gmail.co",
    "gmail.cm",
    "gmail.om",
    "gmail.con",
    "gmail.cmo",
    "gmail.comm",
    "gmail.com.tr",
    "gmail",
  ],
  "hotmail.com": [
    "hotmial.com",
    "hotmal.com",
    "hotmai.com",
    "hotmil.com",
    "hotamil.com",
    "homail.com",
    "hotmali.com",
    "hotmaill.com",
    "hotmail.co",
    "hotmail.cm",
    "hotmail.con",
    "hotmail.cmo",
    "hotmail.comm",
    "hotmail",
  ],
  "outlook.com": [
    "outlok.com",
    "outllok.com",
    "otlook.com",
    "oulook.com",
    "outloo.com",
    "outlookk.com",
    "outlook.co",
    "outlook.con",
    "outlook.cmo",
    "outlook.comm",
    "outlook",
  ],
  "yahoo.com": ["yaho.com", "yhoo.com", "yahooo.com", "yahoo.con", "yahoo.cmo", "yahoo.comm"],
  "icloud.com": ["iclod.com", "icoud.com", "iclould.com", "icloud.co", "icloud.con", "icloud.cmo"],
  "std.yildiz.edu.tr": [
    "std.yildz.edu.tr",
    "std.yldiz.edu.tr",
    "std.yiildiz.edu.tr",
    "std.yildiz.edu",
    "std.yildiz.edu.com",
    "std.yildiz.com",
    "std.yildiz.com.tr",
    "std.yildiz.tr",
    "stdyildiz.edu.tr",
  ],
};

const FIXES = new Map(Object.entries(TYPOS).flatMap(([right, wrongs]) => wrongs.map((wrong) => [wrong, right])));

// "Any domain .con" is a slip for .com whatever comes before it.
const TLD_FIXES: Record<string, string> = { con: "com", cmo: "com", comm: "com", vom: "com", xom: "com" };

// The address with its domain put right, or null when nothing looks wrong.
// The part before @ is kept exactly as typed.
export function suggestEmailFix(address: string): string | null {
  const value = address.trim();
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return null;
  const local = value.slice(0, at);
  // A Turkish keyboard puts ı where i was meant: gmaıl.com, yıldız.
  const domain = value.slice(at + 1).toLowerCase().replace(/ı/g, "i");
  const fixed = FIXES.get(domain) ?? fixTld(domain) ?? (domain !== value.slice(at + 1).toLowerCase() ? domain : null);
  if (!fixed || fixed === value.slice(at + 1)) return null;
  return `${local}@${fixed}`;
}

function fixTld(domain: string): string | null {
  const dot = domain.lastIndexOf(".");
  if (dot <= 0) return null;
  const tld = TLD_FIXES[domain.slice(dot + 1)];
  if (!tld) return null;
  const fixed = `${domain.slice(0, dot)}.${tld}`;
  return FIXES.get(fixed) ?? fixed;
}
