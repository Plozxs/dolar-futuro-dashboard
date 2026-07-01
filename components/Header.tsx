"use client";

import clsx from "clsx";
import { useState } from "react";
import { ConnectionBadge } from "./ConnectionBadge";
import { useClock } from "@/hooks/useClock";
import { fmtLongDateTitle, fmtTime } from "@/lib/format";
import { settings } from "@/config/settings";
import type { ConnectionState } from "@/lib/types";

/** Tabs de la banda superior. Cada uno scrollea a su seccion en el dashboard. */
const TABS = [
  { id: "panel-dolar-futuro", label: "Dólar Futuro" },
  { id: "panel-volumen", label: "Volumen" },
  { id: "panel-interes-abierto", label: "Interés Abierto" },
  { id: "panel-curva-tasas", label: "Curva de Tasas" },
] as const;

function NavTabs() {
  const [active, setActive] = useState<string>(TABS[0].id);

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="-mb-px flex gap-1 overflow-x-auto">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => go(t.id)}
          className={clsx(
            "whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-semibold tracking-tight transition-colors sm:px-4",
            active === t.id
              ? "border-sky text-white"
              : "border-transparent text-ink-muted hover:text-ink",
          )}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Banda superior estilo monitor de mercado: marca, titulo, fecha,
 * estado de conexion (live) y cartel de fuente; con la fila de tabs.
 */
export function Header({ conn }: { conn: ConnectionState }) {
  const now = useClock(1000);

  return (
    <header className="sticky top-0 z-30 border-b border-[#1c2c5c] bg-[linear-gradient(180deg,#0e2150_0%,#0a1430_100%)] shadow-[0_6px_24px_-14px_rgba(0,0,0,0.85)]">
      <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-start sm:justify-between">
          {/* Marca + titulo + fecha */}
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand to-sky-deep shadow-glow">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7">
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
                  fill="white" fontSize="22" fontWeight="700" fontFamily="ui-monospace,monospace"
                  letterSpacing="-1">$</text>
                <line x1="16" y1="4" x2="16" y2="8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="16" y1="24" x2="16" y2="28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
                Monitor Dólar Futuro
              </h1>
              <p className="text-xs font-medium capitalize text-sky">
                {now != null ? fmtLongDateTitle(now) : "—"}
              </p>
            </div>
          </div>

          {/* Estado live + cartel de fuente */}
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div className="flex items-center gap-3">
              <span className="tnum text-xs font-medium text-ink-muted">
                {now != null ? fmtTime(now) : "--:--:--"} · ART
              </span>
              <ConnectionBadge status={conn.status} source={conn.source} />
            </div>
          </div>
        </div>

        <NavTabs />
      </div>
    </header>
  );
}
