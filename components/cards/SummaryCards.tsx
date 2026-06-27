"use client";

import { StatCard } from "./StatCard";
import { Delta } from "@/components/ui/Delta";
import { fmtInt, fmtPrice } from "@/lib/format";
import type { MarketSnapshot, MarketStats } from "@/lib/types";

interface SummaryCardsProps {
  snapshot: MarketSnapshot | null;
  stats: MarketStats | null;
}

const PLACEHOLDER = "—";

/** Fila de 5 tarjetas resumen (A3500, Spot, Front, Volumen, Interes Abierto). */
export function SummaryCards({ snapshot, stats }: SummaryCardsProps) {
  const a3500 = snapshot?.a3500;
  const spot = snapshot?.spot;
  const front = stats?.frontContract ?? null;
  const frontPrice = front?.settlement ?? front?.last ?? null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-4">
      <StatCard
        label="Dólar BCRA A3500"
        tip="Tipo de cambio de referencia mayorista publicado por el BCRA (Com. A3500). Base para el calculo de bases y TNA."
        value={a3500 ? `$ ${fmtPrice(a3500.value)}` : PLACEHOLDER}
        flashKey={a3500?.value ?? null}
        delta={<Delta value={a3500?.changePct ?? null} />}
        sub="vs cierre ant."
      />

      <StatCard
        label="Contrato Front"
        tip="Contrato de vencimiento mas cercano (detectado automaticamente). Es el mas operado y el de mayor referencia."
        value={frontPrice != null ? `$ ${fmtPrice(frontPrice)}` : PLACEHOLDER}
        flashKey={frontPrice}
        delta={<Delta value={front?.changePct ?? null} />}
        sub={front ? front.ticker : ""}
        accent
      />

      <StatCard
        label="Volumen Total"
        tip="Suma del volumen operado (contratos) en todos los vencimientos de la rueda."
        value={stats ? fmtInt(stats.totalVolume) : PLACEHOLDER}
        flashKey={stats?.totalVolume ?? null}
        delta={
          <span className="text-ink-faint">
            mayor:{" "}
            <span className="font-semibold text-sky">
              {stats?.mostLiquid?.label ?? PLACEHOLDER}
            </span>
          </span>
        }
        sub="contratos"
      />

      <StatCard
        label="Interés Abierto Total"
        tip="Suma del interes abierto (posiciones vivas) en todos los vencimientos, con su variacion respecto del cierre anterior."
        value={stats ? fmtInt(stats.totalOpenInterest) : PLACEHOLDER}
        flashKey={stats?.totalOpenInterest ?? null}
        delta={<Delta value={stats?.oiChangeTotal ?? null} format="num" />}
        sub="contratos"
      />
    </div>
  );
}
