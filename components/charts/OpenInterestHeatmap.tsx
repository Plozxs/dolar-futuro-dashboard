"use client";

import { Panel } from "@/components/ui/Panel";
import { fmtCompact } from "@/lib/format";
import type { ComputedContract } from "@/lib/types";

// Escala de color: blanco -> celeste -> azul.
const STOPS: Array<[number, [number, number, number]]> = [
  [0, [233, 243, 255]], // blanco azulado
  [0.5, [56, 189, 248]], // celeste
  [1, [29, 73, 199]], // azul profundo
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function colorFor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < STOPS.length - 1; i += 1) {
    const [p0, c0] = STOPS[i];
    const [p1, c1] = STOPS[i + 1];
    if (clamped >= p0 && clamped <= p1) {
      const local = (clamped - p0) / (p1 - p0 || 1);
      return `rgb(${lerp(c0[0], c1[0], local)}, ${lerp(c0[1], c1[1], local)}, ${lerp(c0[2], c1[2], local)})`;
    }
  }
  return `rgb(${STOPS[STOPS.length - 1][1].join(",")})`;
}

/** Heatmap de interes abierto por contrato. */
export function OpenInterestHeatmap({ contracts }: { contracts: ComputedContract[] }) {
  const values = contracts.map((c) => c.openInterest);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const ranked = [...contracts].sort((a, b) => b.openInterest - a.openInterest);

  return (
    <Panel
      title="Heatmap · Interes Abierto"
      tip="Interes abierto por contrato. Cuanto mas intenso el azul, mayor la cantidad de posiciones vivas."
    >
      <div className="grid grid-cols-3 gap-2">
        {ranked.map((c) => {
          const t = (c.openInterest - min) / range;
          const bg = colorFor(t);
          const dark = t > 0.45;
          return (
            <div
              key={c.ticker}
              className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2"
              style={{ background: bg }}
              title={`${c.ticker} · ${c.openInterest.toLocaleString("es-AR")} contratos`}
            >
              <span
                className="text-[11px] font-bold"
                style={{ color: dark ? "#ffffff" : "#0b1426" }}
              >
                {c.label}
              </span>
              <span
                className="tnum text-xs font-semibold"
                style={{ color: dark ? "rgba(255,255,255,0.85)" : "rgba(11,20,38,0.75)" }}
              >
                {fmtCompact(c.openInterest)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-faint">
        <span>Menor</span>
        <span
          className="h-1.5 flex-1 rounded-full"
          style={{
            background: "linear-gradient(90deg, rgb(233,243,255), rgb(56,189,248), rgb(29,73,199))",
          }}
        />
        <span>Mayor</span>
      </div>
    </Panel>
  );
}
