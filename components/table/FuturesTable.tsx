"use client";

import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import {
  fmtExpiry,
  fmtInt,
  fmtPrice,
  fmtSigned,
  fmtSignedPct,
} from "@/lib/format";
import type { ComputedContract } from "@/lib/types";

type Align = "left" | "right";

interface Column {
  key: string;
  header: string;
  tip?: string;
  align: Align;
  sortValue: (c: ComputedContract) => number | string;
  render: (c: ComputedContract) => ReactNode;
  className?: string;
}

const sortable = (c: ComputedContract, get: (c: ComputedContract) => number | null) =>
  get(c) ?? -Infinity;

/** Pill de variacion con color segun signo (verde sube / rojo baja). */
function DeltaPill({ value, text }: { value: number | null; text: string }) {
  const v = value ?? 0;
  return (
    <span
      className={clsx(
        "tnum inline-block rounded px-1.5 py-0.5 text-xs font-semibold",
        v > 0 ? "bg-up-soft text-up" : v < 0 ? "bg-down-soft text-down" : "text-flat",
      )}
    >
      {text}
    </span>
  );
}

/** Columnas alineadas al monitor de mercado (cierre A3). */
const COLUMNS: Column[] = [
  {
    key: "ticker",
    header: "Posición",
    align: "left",
    sortValue: (c) => c.expiry,
    render: (c) => <span className="capsule">{c.ticker}</span>,
  },
  {
    key: "expiry",
    header: "Vto.",
    align: "left",
    sortValue: (c) => c.expiry,
    render: (c) => <span className="text-ink-muted">{fmtExpiry(c.expiry)}</span>,
  },
  {
    key: "open",
    header: "Apertura",
    tip: "Precio de apertura de la rueda.",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.open),
    render: (c) => <span className="text-ink-muted">{fmtPrice(c.open)}</span>,
  },
  {
    key: "low",
    header: "Mín.",
    tip: "Precio mínimo operado en la rueda.",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.low),
    render: (c) => <span className="text-ink-muted">{fmtPrice(c.low)}</span>,
  },
  {
    key: "high",
    header: "Máx.",
    tip: "Precio máximo operado en la rueda.",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.high),
    render: (c) => <span className="text-ink-muted">{fmtPrice(c.high)}</span>,
  },
  {
    key: "last",
    header: "Último",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.last),
    render: (c) => (
      <span
        key={c.last ?? "na"}
        className={clsx(
          "inline-block rounded px-1 font-semibold text-ink",
          c.priceDir > 0 && "animate-flash-up",
          c.priceDir < 0 && "animate-flash-down",
        )}
      >
        {fmtPrice(c.last)}
      </span>
    ),
  },
  {
    key: "settlement",
    header: "Ajuste",
    tip: "Precio de ajuste (settlement) de la rueda. Referencia oficial para mark-to-market.",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.settlement),
    render: (c) => <span className="font-semibold text-sky">{fmtPrice(c.settlement)}</span>,
  },
  {
    key: "changePct",
    header: "Var. %",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.changePct),
    render: (c) => <DeltaPill value={c.changePct} text={fmtSignedPct(c.changePct)} />,
  },
  {
    key: "volume",
    header: "Volumen",
    align: "right",
    sortValue: (c) => c.volume,
    render: (c) => <span className="text-ink">{fmtInt(c.volume)}</span>,
  },
  {
    key: "openInterest",
    header: "I.A.",
    tip: "Interés abierto: contratos abiertos (posiciones vivas) en el vencimiento.",
    align: "right",
    sortValue: (c) => c.openInterest,
    render: (c) => <span className="text-ink">{fmtInt(c.openInterest)}</span>,
  },
  {
    key: "oiChange",
    header: "Var. I.A.",
    tip: "Variación del interés abierto respecto del cierre anterior. Sube = nuevas posiciones.",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.oiChange),
    render: (c) => <DeltaPill value={c.oiChange} text={fmtSigned(c.oiChange)} />,
  },
  {
    key: "tna",
    header: "TNA",
    tip: "Tasa Nominal Anual implícita: ((Futuro/Spot) − 1) × (365/Días).",
    align: "right",
    sortValue: (c) => sortable(c, (x) => x.tna),
    render: (c) => (
      <span className="font-bold text-ink">
        {c.tna != null ? fmtSignedPct(c.tna).replace("+", "") : "—"}
      </span>
    ),
  },
];

type SortDir = "asc" | "desc";

export function FuturesTable({ contracts }: { contracts: ComputedContract[] }) {
  const [sortKey, setSortKey] = useState<string>("expiry");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    const col = COLUMNS.find((c) => c.key === sortKey);
    if (!col) return contracts;
    const factor = sortDir === "asc" ? 1 : -1;
    return [...contracts].sort((a, b) => {
      const va = col.sortValue(a);
      const vb = col.sortValue(b);
      if (typeof va === "string" || typeof vb === "string") {
        return String(va).localeCompare(String(vb)) * factor;
      }
      return (va - vb) * factor;
    });
  }, [contracts, sortKey, sortDir]);

  const onSort = (key: string) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "ticker" || key === "expiry" ? "asc" : "desc");
    }
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h2 className="panel-head">Contratos Dólar Futuro · Cierre A3 Mercados</h2>
        <span className="text-[11px] text-ink-faint">{contracts.length} vencimientos</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              {COLUMNS.map((col) => {
                const active = col.key === sortKey;
                return (
                  <th
                    key={col.key}
                    onClick={() => onSort(col.key)}
                    className={clsx(
                      "cursor-pointer select-none px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors hover:text-sky",
                      col.align === "right" ? "text-right" : "text-left",
                      active ? "text-sky" : "text-ink-muted",
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.tip ? <Tooltip tip={col.tip}>{col.header}</Tooltip> : col.header}
                      {active ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )
                      ) : null}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.ticker}
                className="tnum border-b border-line-soft transition-colors hover:bg-surface-2/70"
              >
                {COLUMNS.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "px-3 py-2.5",
                      col.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {col.render(c)}
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-3 py-10 text-center text-sm text-ink-faint"
                >
                  No hay contratos que cumplan los filtros.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
