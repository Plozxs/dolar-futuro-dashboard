"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel } from "@/components/ui/Panel";
import { fmtPct } from "@/lib/format";
import type { ComputedContract } from "@/lib/types";

interface Point {
  label: string;
  ticker: string;
  tna: number;
  tnaLabel: string;
  days: number;
}

function CurveTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: Point = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-surface-3 px-3 py-2 text-xs shadow-panel">
      <div className="mb-0.5 font-semibold text-ink">{p.ticker}</div>
      <div className="text-ink-muted">
        TNA <span className="font-semibold text-sky">{p.tnaLabel}</span>
      </div>
      <div className="text-ink-faint">{p.days} dias al vto.</div>
    </div>
  );
}

export function YieldCurve({ contracts }: { contracts: ComputedContract[] }) {
  const data: Point[] = [...contracts]
    .filter((c) => c.tna != null)
    .sort((a, b) => a.expiry.localeCompare(b.expiry))
    .map((c) => ({
      label: c.label,
      ticker: c.ticker,
      tna: Number((c.tna! * 100).toFixed(2)),
      tnaLabel: fmtPct(c.tna),
      days: c.daysToExpiry,
    }));

  return (
    <Panel
      title="Curva de Tasas Implicitas (TNA)"
      tip="TNA implicita por vencimiento. La pendiente refleja las expectativas de devaluacion y tasa en pesos."
    >
      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="#16223b" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#9fb0c9", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "#1c2942" }}
              interval="preserveStartEnd"
              minTickGap={8}
            />
            <YAxis
              tick={{ fill: "#9fb0c9", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v) => `${v}%`}
              domain={["auto", "auto"]}
            />
            <Tooltip content={<CurveTooltip />} cursor={{ stroke: "#2f6bff", strokeDasharray: "3 3" }} />
            <Line
              type="monotone"
              dataKey="tna"
              stroke="#38bdf8"
              strokeWidth={2.4}
              dot={{ r: 3, fill: "#ffffff", stroke: "#38bdf8", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#ffffff", stroke: "#2f6bff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
