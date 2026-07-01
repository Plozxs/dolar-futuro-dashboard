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
import { isMarketOpen } from "@/lib/marketHours";
import type { TableFilters } from "@/lib/types";

const INITIAL_FILTERS: TableFilters = {
  ticker: null,
  minVolume: 0,
  minOpenInterest: 0,
};

export function Dashboard() {
  const { snapshot, stats, conn } = useMarketData();
  const [filters, setFilters] = useState<TableFilters>(INITIAL_FILTERS);
  const marketOpen = isMarketOpen();

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
        {!marketOpen && <OutOfHoursBanner lastUpdate={conn.lastUpdate} />}

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
          <LoadingState marketOpen={marketOpen} offline={conn.status === "offline"} />
        )}
      </main>

      <Footer source={conn.source} />
    </div>
  );
}

function OutOfHoursBanner({ lastUpdate }: { lastUpdate: number | null }) {
  const fechaCierre = lastUpdate
    ? new Date(lastUpdate).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-4 py-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
      <span className="text-sm font-medium text-amber-300">
        Mercado cerrado · Rueda Lun–Vie 10:00–15:00 ART
      </span>
      {fechaCierre && (
        <span className="ml-auto text-xs text-ink-muted">
          Último cierre: {fechaCierre}
        </span>
      )}
    </div>
  );
}

function LoadingState({
  marketOpen,
  offline,
}: {
  marketOpen: boolean;
  offline: boolean;
}) {
  if (!marketOpen && offline) {
    return (
      <div className="panel flex h-64 flex-col items-center justify-center gap-2 text-ink-muted">
        <p className="text-sm font-medium">Sin datos de cierre guardados.</p>
        <p className="text-xs">
          Conectate durante la rueda (Lun–Vie 10:00–15:00 ART) para cargar los precios.
        </p>
      </div>
    );
  }
  return (
    <div className="panel flex h-64 flex-col items-center justify-center gap-3 text-ink-muted">
      <Loader2 className="h-6 w-6 animate-spin text-sky" />
      <p className="text-sm">Conectando con el feed de mercado…</p>
    </div>
  );
}

function Footer({ source }: { source: string }) {
  const label =
    source === "backend"
      ? "PyRofex (A3 Mercados)"
      : source === "closing"
        ? "Datos de cierre guardados"
        : "Feed simulado · demo";

  return (
    <footer className="mt-4 border-t border-[#1c2c5c] bg-[linear-gradient(180deg,#0a1430_0%,#0c1838_100%)]">
      <div className="mx-auto flex w-full max-w-[1840px] flex-col gap-1 px-4 py-4 text-[11px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>Monitor Dólar Futuro · Fuente: {label}</span>
        <span>Next.js + TypeScript</span>
      </div>
    </footer>
  );
}
