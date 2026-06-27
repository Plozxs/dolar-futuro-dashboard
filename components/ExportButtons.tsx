"use client";

import { Download, FileSpreadsheet } from "lucide-react";
import { exportToCsv, exportToExcel } from "@/lib/export";
import type { ComputedContract } from "@/lib/types";

/** Botones de exportacion CSV / Excel de la grilla visible. */
export function ExportButtons({ contracts }: { contracts: ComputedContract[] }) {
  const disabled = contracts.length === 0;

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:border-brand/40 hover:text-sky disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={btn}
        disabled={disabled}
        onClick={() => void exportToCsv(contracts)}
      >
        <Download size={14} />
        CSV
      </button>
      <button
        type="button"
        className={btn}
        disabled={disabled}
        onClick={() => void exportToExcel(contracts)}
      >
        <FileSpreadsheet size={14} />
        Excel
      </button>
    </div>
  );
}
