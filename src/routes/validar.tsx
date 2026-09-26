import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/validar")({
  head: () => ({
    meta: [
      { title: "Validar entrada — Landing Fuentes" },
      { name: "description", content: "Valida una entrada mediante su código QR." },
    ],
  }),
  component: ValidatePage,
});

type ValidationResult = "valid" | "used" | "invalid" | null;

type StoredOrder = {
  ticketCode?: string;
  ticketUsed?: boolean;
};

const extractCode = (value: string) => {
  try {
    const url = new URL(value);
    return url.searchParams.get("codigo") ?? value.trim();
  } catch {
    return value.trim();
  }
};

function ValidatePage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ValidationResult>(null);
  const [scannerError, setScannerError] = useState("");

  const validateCode = (value: string) => {
    const normalizedCode = extractCode(value);
    setCode(normalizedCode);
    setResult(null);

    if (!normalizedCode) return;

    try {
      const rawOrder = localStorage.getItem("viamarket.order");
      const order = rawOrder ? (JSON.parse(rawOrder) as StoredOrder) : null;

      if (!order || order.ticketCode !== normalizedCode) {
        setResult("invalid");
        return;
      }

      if (order.ticketUsed) {
        setResult("used");
        return;
      }

      localStorage.setItem(
        "viamarket.order",
        JSON.stringify({ ...order, ticketUsed: true }),
      );
      setResult("valid");
    } catch {
      setResult("invalid");
    }
  };

  useEffect(() => {
    const queryCode = new URLSearchParams(window.location.search).get("codigo");
    if (queryCode) validateCode(queryCode);
  }, []);

  useEffect(() => {
    let scanner: { stop: () => Promise<void> } | null = null;
    let cancelled = false;

    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (cancelled) return;
        scanner = new Html5Qrcode("qr-reader");
        return scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => validateCode(decodedText),
          () => undefined,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setScannerError("No se pudo acceder a la cámara. Ingresa el código manualmente.");
        }
      });

    return () => {
      cancelled = true;
      scanner?.stop().catch(() => undefined);
    };
  }, []);

  return (
    <SiteLayout>
      <section className="pb-8 pt-8 sm:pt-12">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Validar entrada
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          Escanea el código QR o ingresa el código de la entrada.
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-7">
          <div id="qr-reader" className="overflow-hidden rounded-2xl bg-black/20" />
          {scannerError ? <p className="mt-3 text-sm text-amber-200">{scannerError}</p> : null}

          <label className="mt-6 block text-sm text-white/65" htmlFor="ticket-code">
            Código de entrada
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="ticket-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-accent-cyan"
              placeholder="Pega el código aquí"
            />
            <button
              type="button"
              onClick={() => validateCode(code)}
              className="rounded-xl bg-gradient-to-r from-brand to-accent-cyan px-5 py-3 font-semibold text-ink transition hover:opacity-90"
            >
              Validar
            </button>
          </div>
        </div>

        <div
          className={`rounded-3xl border p-6 backdrop-blur-xl ${
            result === "valid"
              ? "border-emerald-300/40 bg-emerald-400/10"
              : result
                ? "border-red-300/40 bg-red-400/10"
                : "border-white/15 bg-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-white/50">Resultado</p>
          <p className="mt-4 font-display text-2xl font-bold">
            {result === "valid"
              ? "Entrada válida"
              : result === "used"
                ? "Entrada ya utilizada"
                : result === "invalid"
                  ? "Entrada no válida"
                  : "Esperando código"}
          </p>
          <p className="mt-3 text-sm text-white/65">
            {result === "valid"
              ? "La entrada fue registrada como utilizada."
              : result === "used"
                ? "Este código ya fue validado anteriormente."
                : result === "invalid"
                  ? "No existe una entrada válida para este código."
                  : "El resultado aparecerá después de escanear o ingresar un código."}
          </p>
          <Link to="/" className="mt-6 inline-block text-sm text-accent-cyan hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
