import type { DiagnosticReport, DiagnosticScoreBand } from "#/diagnostic/types";
import { cn } from "#/lib/utils";

type DiagnosticReportPanelProps = {
  status: "waiting" | "ready" | "failed";
  report: DiagnosticReport | null;
  errorMessage: string | null;
  canRetry?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  onReset: () => void;
};

function bandToneClass(band: DiagnosticScoreBand) {
  if (band === "HIGH") {
    return "border-emerald-300/40 bg-emerald-400/10 text-emerald-300";
  }

  if (band === "LOW") {
    return "border-amber-300/40 bg-amber-400/10 text-amber-300";
  }

  return "border-rose-300/40 bg-rose-400/10 text-rose-300";
}

function segmentToneClass(segment: "min" | "low" | "high") {
  if (segment === "high") {
    return "bg-emerald-400/30";
  }

  if (segment === "low") {
    return "bg-amber-400/28";
  }

  return "bg-rose-400/30";
}

function scoreMarkerPosition(score: number) {
  return `${Math.max(0, Math.min(100, score))}%`;
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const sweep = Math.round((clamped / 100) * 360);

  return (
    <div className="relative grid size-24 place-items-center rounded-full border border-slate-800 bg-slate-950">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#f7b32b ${sweep}deg, rgba(51,65,85,0.45) ${sweep}deg)`,
        }}
      />
      <div className="absolute inset-[8px] rounded-full bg-[#0b1226]" />
      <div className="relative z-10 text-center">
        <div className="text-base leading-none font-semibold text-amber-300">{clamped}</div>
        <div className="mt-1 text-xs text-slate-400">/100</div>
      </div>
    </div>
  );
}

function DimensionRow(props: {
  icon: string;
  label: string;
  score: number;
  band: DiagnosticScoreBand;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <div className="text-base">{props.icon}</div>
        <div className="ml-2.5 flex-1 text-[14px] font-semibold text-slate-100">{props.label}</div>
        <div className="text-[14px] font-semibold text-amber-300">{props.score}</div>
        <div
          className={cn(
            "ml-3 rounded-full border px-3 py-1 text-xs font-semibold",
            bandToneClass(props.band),
          )}
        >
          {props.band}
        </div>
      </div>

      <div className="relative mt-2.5 h-4 overflow-hidden rounded-full border border-slate-700 bg-slate-900">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-rose-400/35" />
        <div className="absolute inset-y-0 left-1/2 w-[30%] bg-amber-400/35" />
        <div className="absolute inset-y-0 right-0 w-[20%] bg-emerald-400/35" />
        <div
          className="absolute top-0 h-full w-1 bg-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.85)]"
          style={{ left: scoreMarkerPosition(props.score) }}
        />
      </div>
    </div>
  );
}

export function DiagnosticReportPanel(props: DiagnosticReportPanelProps) {
  if (props.status === "waiting") {
    return (
      <section className="rounded-3xl border border-slate-800/90 bg-slate-950/85 p-4 shadow-[0_28px_60px_rgba(2,6,23,0.55)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-amber-200">
          <span className="size-2 animate-pulse rounded-full bg-amber-300" />
          Generating Report
        </div>
        <h2 className="mt-3 text-base font-semibold text-slate-50">Generating report...</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Please wait while we analyze your interview and prepare your scorecard.
        </p>
      </section>
    );
  }

  if (props.status === "failed" || !props.report) {
    return (
      <section className="rounded-3xl border border-red-400/25 bg-red-500/10 p-4 shadow-[0_28px_60px_rgba(2,6,23,0.55)]">
        <h2 className="text-base font-semibold text-red-100">Diagnostic report is not ready yet</h2>
        <p className="mt-2 text-sm leading-6 text-red-100/95">
          {props.errorMessage ?? "Evaluation failed. Please retry the session once."}
        </p>
        {props.canRetry && props.onRetry ? (
          <button
            className="mt-3 inline-flex h-10 items-center justify-center rounded-full border border-red-300/60 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={props.isRetrying}
            type="button"
            onClick={props.onRetry}
          >
            {props.isRetrying ? "Retrying..." : "Retry evaluation"}
          </button>
        ) : null}
        <button
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-red-300/60 px-5 text-sm font-semibold text-red-100 transition hover:bg-red-400/15"
          type="button"
          onClick={props.onReset}
        >
          Back to Diagnostic Intro
        </button>
      </section>
    );
  }

  const report = props.report;

  return (
    <section className="rounded-[28px] border border-slate-800/90 bg-[linear-gradient(180deg,#060b18,#0d152b)] p-4 shadow-[0_28px_60px_rgba(2,6,23,0.55)]">
      <div className="inline-flex rounded-full border border-emerald-300/35 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-emerald-300">
        ✅ Diagnostic Interview Complete
      </div>

      <h1 className="mt-3 text-base leading-tight font-semibold text-slate-50">
        Your <em className="not-italic text-amber-300">Interview Performance</em> Report
      </h1>

      <div className="mt-3 rounded-2xl border border-indigo-300/20 bg-indigo-950/35 p-4">
        <div className="text-xs font-semibold tracking-[0.08em] text-slate-400">
          OVERALL SCORE · MIN OF ALL 3
        </div>
        <div className="mt-3 flex items-center gap-3">
          <ScoreRing score={report.overallScore} />
          <div className="flex-1">
            <div className="rounded-2xl border border-blue-300/30 bg-blue-500/10 px-3 py-2.5">
              <div className="text-base font-semibold text-sky-300">{report.cefrLevel}</div>
              <div className="text-[14px] font-semibold text-slate-200">
                CEFR Level {report.cefrLevel}
              </div>
              <div className="text-sm text-slate-400">{report.cefrLabel}</div>
            </div>
            <div
              className={cn(
                "mt-2.5 inline-flex rounded-full border px-3 py-1 text-sm font-semibold",
                bandToneClass(report.overallBand),
              )}
            >
              ● {report.rangeLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 text-xs font-semibold tracking-[0.09em] text-slate-400">
        WHERE YOU STAND · EACH DIMENSION
      </div>

      <div className="mt-2.5 rounded-2xl border border-indigo-300/20 bg-indigo-950/30 p-3">
        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-700 text-xs font-semibold uppercase tracking-[0.08em]">
          <div className={cn("px-2 py-2 text-center text-rose-200", segmentToneClass("min"))}>
            MIN · Rejected→OK
          </div>
          <div className={cn("px-2 py-2 text-center text-amber-200", segmentToneClass("low"))}>
            LOW · OK→Good
          </div>
          <div className={cn("px-2 py-2 text-center text-emerald-200", segmentToneClass("high"))}>
            HIGH · Good→Great
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs font-semibold text-slate-500">
          <span>0</span>
          <span>50</span>
          <span>80</span>
          <span>100</span>
        </div>

        <DimensionRow
          icon="🧠"
          label="Thinking"
          score={report.thinking.score}
          band={report.thinking.band}
        />
        <DimensionRow
          icon="💪"
          label="Confidence"
          score={report.confidence.score}
          band={report.confidence.band}
        />
        <DimensionRow
          icon="🗣️"
          label="Language"
          score={report.language.score}
          band={report.language.band}
        />
      </div>

      <button
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full border border-amber-300/50 bg-amber-400 px-4 text-sm font-semibold text-slate-950 opacity-90"
        type="button"
      >
        See Your Job Radar →
      </button>
    </section>
  );
}
