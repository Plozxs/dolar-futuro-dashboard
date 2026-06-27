import clsx from "clsx";
import type { ConnectionState } from "@/lib/types";

function isMarketOpen(): boolean {
  const art = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const day = art.getDay();
  const mins = art.getHours() * 60 + art.getMinutes();
  return day >= 1 && day <= 5 && mins >= 10 * 60 && mins < 17 * 60;
}

const MAP = {
  live: { label: "LIVE", dot: "bg-up", text: "text-up", ring: "ring-up/30" },
  closed: { label: "FUERA DE RUEDA", dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/30" },
  connecting: { label: "CONECTANDO", dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/30" },
  offline: { label: "OFFLINE", dot: "bg-down", text: "text-down", ring: "ring-down/30" },
} as const;

/** Indicador de estado de conexion con punto pulsante. */
export function ConnectionBadge({ status }: { status: ConnectionState["status"] }) {
  const key = status === "live" && !isMarketOpen() ? "closed" : status;
  const cfg = MAP[key];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ring-1 ring-inset",
        cfg.text,
        cfg.ring,
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" ? (
          <span
            className={clsx(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-live",
              cfg.dot,
            )}
          />
        ) : null}
        <span className={clsx("relative inline-flex h-2 w-2 rounded-full", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
}
