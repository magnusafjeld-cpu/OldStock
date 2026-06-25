"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { ParseError } from "@/lib/parse/xlsx";
import { formatCompactShort, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";

type Phase = "idle" | "dragover" | "parsing" | "success" | "error";

const PARSE_STEPS = [
  "Leser arbeidsbok…",
  "Klassifiserer produkter…",
  "Beregner avskrivning…",
  "Bygger oversikt…",
];

export function UploadExperience() {
  const router = useRouter();
  const { importFile, recentFiles, setActiveStore } = useWorkspace();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [successInfo, setSuccessInfo] = useState<{ obsolete: number; store: string } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
        setPhase("error");
        setError("Filtype støttes ikke. Last opp en .xlsx-, .xls- eller .csv-eksport.");
        return;
      }
      setPhase("parsing");
      setError("");
      setProgress(8);

      let step = 0;
      const timer = setInterval(() => {
        step = Math.min(step + 1, PARSE_STEPS.length - 1);
        setStepIdx(step);
        setProgress((p) => Math.min(p + 22, 92));
      }, 180);

      try {
        const snapshot = await importFile(file);
        clearInterval(timer);
        setProgress(100);
        setStepIdx(PARSE_STEPS.length - 1);
        setSuccessInfo({ obsolete: snapshot.aggregates.obsoleteNow, store: snapshot.store });
        setPhase("success");
        setTimeout(() => router.push("/dashboard"), 1100);
      } catch (e) {
        clearInterval(timer);
        setPhase("error");
        setError(
          e instanceof ParseError
            ? e.message
            : "Noe gikk galt under lesing. Sjekk filen og prøv igjen."
        );
      }
    },
    [importFile, router]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="dot-grid flex min-h-screen flex-col items-center justify-center px-s6 py-s12">
      {/* brand lockup */}
      <div className="mb-s10 flex flex-col items-center text-center">
        <div className="flex items-center gap-s3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-brand-green">
            <span className="text-[24px] font-extrabold text-white">E</span>
          </div>
          <div className="text-left">
            <div className="text-h2 leading-none text-ink-primary">Old Stock Cockpit</div>
            <div className="overline mt-1">Elkjøp · Old stock-oversikt</div>
          </div>
        </div>
        <p className="mt-s5 text-body text-ink-secondary">
          Se hva som er og hva som blir old stock. Vit hva du skal gjøre.
        </p>
      </div>

      {/* dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (phase === "idle" || phase === "error") setPhase("dragover");
        }}
        onDragLeave={() => phase === "dragover" && setPhase("idle")}
        onDrop={onDrop}
        onClick={() => (phase === "idle" || phase === "error") && inputRef.current?.click()}
        className={cn(
          "relative flex h-[280px] w-full max-w-[520px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-all duration-150 ease-out-soft",
          phase === "idle" && "border-hairline bg-surface-1 hover:border-brand-green/50 hover:bg-brand-green-soft/40",
          phase === "dragover" && "border-brand-green bg-brand-green-soft/60",
          phase === "parsing" && "cursor-default border-brand-green/40 bg-surface-1",
          phase === "success" && "cursor-default border-brand-green bg-brand-green-soft/60",
          phase === "error" && "animate-shake border-risk-critical/60 bg-risk-critical/5"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {phase === "parsing" ? (
          <div className="w-[80%]">
            <Loader2 className="mx-auto mb-s4 h-8 w-8 animate-spin text-brand-green" />
            <div className="mb-s2 text-label text-ink-secondary">{PARSE_STEPS[stepIdx]}</div>
            <div className="h-[6px] w-full overflow-hidden rounded-pill bg-surface-3">
              <div
                className="h-full rounded-pill bg-brand-green transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="tnum mt-s2 text-[11px] text-ink-tertiary">{progress}%</div>
          </div>
        ) : phase === "success" && successInfo ? (
          <div className="animate-fade-in">
            <div className="mx-auto mb-s3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white">
              <ArrowRight size={22} />
            </div>
            <div className="text-h3 text-ink-primary">
              ✓ {formatCompactShort(successInfo.obsolete)} NOK old stock · {successInfo.store}
            </div>
            <div className="mt-1 text-label text-ink-secondary">Åpner oversikt…</div>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "mb-s4 flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                phase === "dragover" ? "bg-brand-green text-white" : "bg-surface-2 text-brand-green"
              )}
            >
              <UploadCloud size={26} />
            </div>
            <div className="text-h3 text-ink-primary">Dra Excel-eksporten hit</div>
            <div className="my-s2 text-label text-ink-tertiary">eller</div>
            <span className="inline-flex h-[38px] items-center gap-s2 rounded-md bg-brand-green px-s4 text-label font-semibold text-white">
              <FileSpreadsheet size={16} /> Velg fil
            </span>
            <div className="mt-s4 text-[11px] text-ink-tertiary">.xlsx · .xls · maks 50 MB</div>
          </>
        )}
      </div>

      {phase === "error" && (
        <div className="mt-s4 flex items-center gap-s2 text-label text-risk-critical">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="mt-s5 flex items-center gap-s2 text-label text-ink-tertiary">
        <ShieldCheck size={15} className="text-brand-green" />
        Dataene forlater aldri denne maskinen. Alt behandles lokalt i nettleseren.
      </div>

      {recentFiles.length > 0 && (
        <div className="mt-s10 w-full max-w-[520px]">
          <div className="overline mb-s3">Nylige opplastinger</div>
          <ul className="space-y-s2">
            {recentFiles.slice(0, 5).map((f) => (
              <li key={f.id}>
                <button
                  onClick={() => {
                    setActiveStore(f.store);
                    router.push("/dashboard");
                  }}
                  className="flex w-full items-center justify-between gap-s3 rounded-md border border-hairline-subtle bg-surface-1 px-s4 py-s3 text-left transition-colors hover:border-hairline-strong hover:bg-surface-2"
                >
                  <div className="flex items-center gap-s3">
                    <FileSpreadsheet size={18} className="text-ink-tertiary" />
                    <div>
                      <div className="text-label font-medium text-ink-primary">{f.store}</div>
                      <div className="tnum text-[11px] text-ink-tertiary">
                        {f.date} · {formatRelativeTime(f.uploadedAt)} · {formatCompactShort(f.obsoleteNow)} NOK old stock
                      </div>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-label text-brand-green">
                    Åpne <ArrowRight size={14} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
