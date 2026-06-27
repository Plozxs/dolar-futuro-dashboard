"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Panel } from "@/components/ui/Panel";
import { fmtPct } from "@/lib/format";
import type { ComputedContract } from "@/lib/types";

const SLICE_COLORS = ["#1d49c7", "#2f6bff", "#38bdf8"];
const REST_COLOR = "#22304d";

export function LiquidityDonut({ contracts }: { contracts: ComputedContract[] }) {
  const total = contracts.reduce((acc, c) => acc + c.volume, 0) || 1;
  const ranked = [...contracts].sort((a, b) => b.volume - a.volume);
  const top3 = ranked.slice(0, 3);
  const top3Volume = top3.reduce((acc, c) => acc + c.volume, 0);
  const rest = Math.max(0, total - top3Volume);
  const share = top3Volume / total;

  const data = [
    ...top3.map((c, i) => ({ name: c.label, value: c.volume, color: SLICE_COLORS[i] })),
    { name: "Resto", value: rest, color: REST_COLOR },
  ];

  return (
    <Panel
      title="Concentracion de Liquidez"
      tip="Participacion de los 3 contratos mas operados sobre el volumen total de la rueda."
    >
      <div className="flex items-center gap-4">
        <div className="relative h-[132px] w-[132px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={46}
                outerRadius={64}
                paddingAngle={2}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-ink tnum">{fmtPct(share, 0)}</span>
            <span className="text-[10px] uppercase tracking-wide text-ink-faint">Top 3</span>
          </div>
        </div>

        <ul className="flex-1 space-y-2 text-xs">
          {top3.map((c, i) => (
            <li key={c.ticker} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: SLICE_COLORS[i] }}
                />
                <span className="font-semibold text-ink">{c.label}</span>
              </span>
              <span className="tnum font-semibold text-ink-muted">
                {fmtPct(c.volume / total, 0)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-2 border-t border-line-soft pt-2">
            <span className="flex items-center gap-2 text-ink-faint">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: REST_COLOR }} />
              Resto
            </span>
            <span className="tnum font-semibold text-ink-faint">
              {fmtPct(rest / total, 0)}
            </span>
          </li>
        </ul>
      </div>
    </Panel>
  );
}
