import { Tooltip } from "@/components/ui/Tooltip";
import { fmtInt, fmtNum, fmtPct } from "@/lib/format";
import type { MarketStats } from "@/lib/types";

interface StatItemProps {
  label: string;
  tip: string;
  value: string;
  sub?: string;
}

function StatItem({ label, tip, value, sub }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-line-soft bg-surface-2/40 px-3 py-2.5">
      <Tooltip tip={tip}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </span>
      </Tooltip>
      <span className="tnum text-base font-bold text-ink">{value}</span>
      {sub ? <span className="text-[11px] text-sky">{sub}</span> : null}
    </div>
  );
}

/** Estadisticas agregadas de la rueda (debajo de la tabla). */
export function StatsPanel({ stats }: { stats: MarketStats }) {
  return (
    <div className="panel p-4">
      <h3 className="panel-head mb-3">Estadisticas de la rueda</h3>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <StatItem
          label="Volumen prom."
          tip="Volumen promedio operado por contrato en la rueda."
          value={fmtInt(stats.avgVolume)}
        />
        <StatItem
          label="OI promedio"
          tip="Interes abierto promedio por contrato."
          value={fmtInt(stats.avgOpenInterest)}
        />
        <StatItem
          label="Mas liquido"
          tip="Contrato con mayor volumen operado."
          value={stats.mostLiquid?.label ?? "—"}
          sub={stats.mostLiquid ? `${fmtInt(stats.mostLiquid.volume)} ctr` : undefined}
        />
        <StatItem
          label="Mayor TNA"
          tip="Contrato con la tasa nominal anual implicita mas alta."
          value={stats.maxTna?.label ?? "—"}
          sub={stats.maxTna ? fmtPct(stats.maxTna.tna) : undefined}
        />
        <StatItem
          label="Menor TNA"
          tip="Contrato con la tasa nominal anual implicita mas baja (suele ser el front)."
          value={stats.minTna?.label ?? "—"}
          sub={stats.minTna ? fmtPct(stats.minTna.tna) : undefined}
        />
        <StatItem
          label="Spread prom."
          tip="Spread (Ask - Bid) promedio de los contratos con dos puntas."
          value={fmtNum(stats.avgSpread, 2)}
        />
      </div>
    </div>
  );
}
