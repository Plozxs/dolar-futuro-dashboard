"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "./Header";
import { SummaryCards } from "./cards/SummaryCards";
import { Filters } from "./Filters";
import { ExportButtons } from "./ExportButtons";
import { FuturesTable } from "./table/FuturesTable";
import { StatsPanel } from "./stats/StatsPanel";
import { YieldCurve } from "./charts/YieldCurve";
import { LiquidityDonut } from "./charts/LiquidityDonut";
import { VolumeBars } from "./charts/VolumeBars";
import { OpenInterestHeatmap } from "./charts/OpenInterestHeatmap";
import { useMarketData } from "@/hooks/useMarketData";
import type { TableFilters } from "@/lib/types";

const INITIAL_FILTERS: TableFilters = {
  ticker: null,
  minVolume: 0,
  minOpenInterest: 0,
};

export function Dashboard() {
  const { snapshot, stats, conn } = useMarketData();
  const [filters, setFilters] = useState<TableFilters>(INITIAL_FILTERS);

  const contracts = snapshot?.contracts ?? [];
  const tickers = useMemo(() => contracts.map((c) => c.ticker), [contracts]);

  const filtered = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (!filters.ticker || c.ticker === filters.ticker) &&
          c.volume >= filters.minVolume &&
          c.openInterest >= filters.minOpenInterest,
      ),
    [contracts, filters],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header conn={conn} />

      <main className="mx-auto w-full max-w-[1840px] flex-1 space-y-4 px-4 py-5 sm:px-6 lg:px-8">
        {snapshot && stats ? (
          <>
            <SummaryCards snapshot={snapshot} stats={stats} />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
              {/* Columna izquierda ~70%: contratos */}
              <div id="panel-dolar-futuro" className="min-w-0 scroll-mt-28 space-y-4">
                <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                  <Filters filters={filters} tickers={tickers} onChange={setFilters} />
                  <ExportButtons contracts={filtered} />
                </div>
                <FuturesTable contracts={filtered} />
                <StatsPanel stats={stats} />
              </div>

              {/* Columna derecha ~30%: curva, liquidez, volumen, OI */}
              <aside className="min-w-0 space-y-4">
                <div id="panel-curva-tasas" className="scroll-mt-28">
                  <YieldCurve contracts={contracts} />
                </div>
                <div className="scroll-mt-28">
                  <LiquidityDonut contracts={contracts} />
                </div>
                <div id="panel-volumen" className="scroll-mt-28">
                  <VolumeBars contracts={contracts} />
                </div>
                <div id="panel-interes-abierto" className="scroll-mt-28">
                  <OpenInterestHeatmap contracts={contracts} />
                </div>
              </aside>
            </div>
          </>
        ) : (
          <LoadingState />
        )}
      </main>

      <Footer source={conn.source} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="panel flex h-64 flex-col items-center justify-center gap-3 text-ink-muted">
      <Loader2 className="h-6 w-6 animate-spin text-sky" />
      <p className="text-sm">Conectando con el feed de mercado…</p>
    </div>
  );
}

/** Lun–Vie 10:00–17:00 ART (UTC-3). */
function isMarketOpen(): boolean {
  const now = new Date();
  const art = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
  const day = art.getDay(); // 0=Dom, 6=Sáb
  const h = art.getHours();
  const m = art.getMinutes();
  const time = h * 60 + m;
  return day >= 1 && day <= 5 && time >= 10 * 60 && time < 17 * 60;
}

function Footer({ source }: { source: "backend" | "simulated" }) {
  const open = isMarketOpen();
  return (
    <footer className="mt-4 border-t border-[#1c2c5c] bg-[linear-gradient(180deg,#0a1430_0%,#0c1838_100%)]">
      <div className="mx-auto flex w-full max-w-[1840px] flex-col gap-1 px-4 py-4 text-[11px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>
          Monitor Dólar Futuro · Fuente:{" "}
          {source === "backend" ? "PyRofex (A3 Mercados)" : "Feed simulado · demo"} · Datos
          indicativos · Solo para uso informativo.
        </span>
        <span>No constituye recomendación de inversión · Next.js + TypeScript</span>
      </div>
    </footer>
  );
}
