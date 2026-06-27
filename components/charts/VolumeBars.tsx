"use client";

import { Panel } from "@/components/ui/Panel";
import { fmtInt, fmtPct } from "@/lib/format";
import type { ComputedContract } from "@/lib/types";

/** Distribucion de volumen: barras horizontales ordenadas de mayor a menor. */
export function VolumeBars({ contracts }: { contracts: ComputedContract[] }) {
  const total = contracts.reduce((acc, c) => acc + c.volume, 0) || 1;
  const ranked = [...contracts].sort((a, b) => b.volume - a.volume);
  const max = ranked[0]?.volume || 1;

  return (
    <Panel
      title="Distribucion de Volumen"
      tip="Volumen operado por contrato como porcentaje del total. Ordenado de mayor a menor."
    >
      <ul className="space-y-2">
        {ranked.map((c) => {
          const widthPct = Math.max(2, (c.volume / max) * 100);
          const sharePct = c.volume / total;
          const dim = sharePct < 0.01;
          return (
            <li key={c.ticker} className="flex items-center gap-3 text-xs">
              <span
                className={`w-16 shrink-0 font-semibold ${
                  dim ? "text-ink-faint" : "text-ink"
                }`}
              >
                {c.label}
              </span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-700 to-sky"
                  style={{ width: `${widthPct}%` }}
                />
              </span>
              <span
                className="tnum w-10 shrink-0 text-right font-semibold text-ink-muted"
                title={`${fmtInt(c.volume)} contratos`}
              >
                {fmtPct(sharePct, 0)}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
