"use client";

import { Filter, X } from "lucide-react";
import type { TableFilters } from "@/lib/types";

interface FiltersProps {
  filters: TableFilters;
  tickers: string[];
  onChange: (next: TableFilters) => void;
}

const inputCls =
  "rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-ink outline-none transition-colors focus:border-brand/50 placeholder:text-ink-faint";

/** Barra de filtros de la tabla: contrato, volumen minimo, OI minimo. */
export function Filters({ filters, tickers, onChange }: FiltersProps) {
  const dirty =
    filters.ticker !== null || filters.minVolume > 0 || filters.minOpenInterest > 0;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        <Filter size={13} />
        Filtros
      </span>

      <select
        className={inputCls}
        value={filters.ticker ?? ""}
        onChange={(e) =>
          onChange({ ...filters, ticker: e.target.value || null })
        }
      >
        <option value="">Todos los contratos</option>
        {tickers.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        Vol. min
        <input
          type="number"
          min={0}
          step={1000}
          className={`${inputCls} w-24`}
          value={filters.minVolume || ""}
          placeholder="0"
          onChange={(e) =>
            onChange({ ...filters, minVolume: Number(e.target.value) || 0 })
          }
        />
      </label>

      <label className="flex items-center gap-1.5 text-[11px] text-ink-faint">
        OI min
        <input
          type="number"
          min={0}
          step={1000}
          className={`${inputCls} w-24`}
          value={filters.minOpenInterest || ""}
          placeholder="0"
          onChange={(e) =>
            onChange({
              ...filters,
              minOpenInterest: Number(e.target.value) || 0,
            })
          }
        />
      </label>

      {dirty ? (
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-ink-faint transition-colors hover:text-down"
          onClick={() =>
            onChange({ ticker: null, minVolume: 0, minOpenInterest: 0 })
          }
        >
          <X size={12} />
          Limpiar
        </button>
      ) : null}
    </div>
  );
}
