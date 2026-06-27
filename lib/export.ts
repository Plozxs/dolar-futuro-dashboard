/**
 * Exportacion de la grilla a CSV / Excel.
 * Usa SheetJS (xlsx) cargado de forma diferida para no pesar en el bundle inicial
 * ni en el render del servidor.
 */

import type { ComputedContract } from "./types";

function round(value: number | null, decimals = 2): number | null {
  if (value == null) return null;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

function buildRows(contracts: ComputedContract[]) {
  return contracts.map((c) => ({
    Ticker: c.ticker,
    Vencimiento: c.expiry,
    Ultimo: c.last,
    Ajuste: c.settlement,
    "Var %": round(c.changePct != null ? c.changePct * 100 : null),
    Bid: c.bid,
    Ask: c.ask,
    Spread: round(c.spread),
    Volumen: c.volume,
    "Interes Abierto": c.openInterest,
    "Var OI": c.oiChange,
    "TNA %": round(c.tna != null ? c.tna * 100 : null),
    Dias: c.daysToExpiry,
    "Base vs Spot": round(c.base),
  }));
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

async function writeBook(
  contracts: ComputedContract[],
  ext: "xlsx" | "csv",
): Promise<void> {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(buildRows(contracts));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Futuros");
  XLSX.writeFile(wb, `dolar-futuro-${stamp()}.${ext}`, { bookType: ext });
}

export function exportToExcel(contracts: ComputedContract[]): Promise<void> {
  return writeBook(contracts, "xlsx");
}

export function exportToCsv(contracts: ComputedContract[]): Promise<void> {
  return writeBook(contracts, "csv");
}
