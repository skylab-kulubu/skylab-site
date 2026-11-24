"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@skylab-kulubu/skylcn-ui";
import { serialFromInput } from "@/lib/certificate-serial";

// /sertifika: the serial printed on a certificate opens its verification
// page, /sertifika/{serial}. The format is checked here; whether it exists
// is the verification page's answer.
export default function SerialLookup() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [going, setGoing] = useState(false);

  // Back on this page (the back button, or the page restored from the
  // browser's cache): the button is ready again.
  useEffect(() => {
    const ready = () => setGoing(false);
    window.addEventListener("pageshow", ready);
    window.addEventListener("popstate", ready);
    return () => {
      window.removeEventListener("pageshow", ready);
      window.removeEventListener("popstate", ready);
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const serial = serialFromInput(value);
    if (!serial) {
      setInvalid(true);
      return;
    }
    setGoing(true);
    router.push(`/sertifika/${serial}`);
    // A navigation that does not leave the page (the same serial again)
    // does not unmount this form: let the button go after a moment.
    window.setTimeout(() => setGoing(false), 4000);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Field label="Sertifika numarası" error={invalid ? "Geçerli bir sertifika numarası girin." : undefined}>
        <Input
          name="serial"
          autoComplete="off"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={200}
          className="font-mono"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setInvalid(false);
          }}
          aria-invalid={invalid || undefined}
          placeholder="5E1A9102C0FFEE7B3D44A1F09C2E6B71"
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto sm:self-start" pending={going}>
        Doğrula
      </Button>
    </form>
  );
}
