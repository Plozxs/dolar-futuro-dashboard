/**
 * Motor de calculo del monitor.
 *
 * Centraliza TODA la logica derivada (TNA, TEA, base, spread, forward points,
 * dias al vencimiento y estadisticas agregadas). Tanto el feed simulado como el
 * backend PyRofex producen `RawMarketFrame`; aqui se transforman en
 * `MarketSnapshot` + `MarketStats`. No hay duplicacion de formulas.
 */

import type {
  ComputedContract,
  FutureContract,
  MarketSnapshot,
  MarketStats,
  PriceDirection,
  RawMarketFrame,
} from "./types";

const MS_PER_DAY = 86_400_000;
export const DAY_COUNT = 365;

/** Dias calendario hasta el vencimiento (>= 0). */
export function daysToExpiry(expiryISO: string, from: number): number {
  const expiry = new Date(`${expiryISO}T00:00:00`).getTime();
  return Math.max(0, Math.round((expiry - from) / MS_PER_DAY));
}

/** TNA implicita: ((Futuro / Spot) - 1) * (365 / Dias). */
export function impliedTNA(
  futuro: number | null,
  spot: number,
  days: number,
): number | null {
  if (futuro == null || !spot || days <= 0) return null;
  return (futuro / spot - 1) * (DAY_COUNT / days);
}

/** TEA implicita: (Futuro / Spot) ^ (365 / Dias) - 1. */
export function impliedTEA(
  futuro: number | null,
  spot: number,
  days: number,
): number | null {
  if (futuro == null || !spot || days <= 0) return null;
  return Math.pow(futuro / spot, DAY_COUNT / days) - 1;
}

/** Spread = Ask - Bid. */
export function spread(bid: number | null, ask: number | null): number | null {
  if (bid == null || ask == null) return null;
  return ask - bid;
}

/** Base (forward points) = Futuro - Spot. */
export function base(futuro: number | null, spot: number): number | null {
  if (futuro == null) return null;
  return futuro - spot;
}

/** Precio de referencia para metricas: ajuste, sino ultimo. */
function markPrice(c: FutureContract): number | null {
  return c.settlement ?? c.last ?? null;
}

function direction(current: number | null, previous: number | null): PriceDirection {
  if (current == null || previous == null) return 0;
  if (current > previous) return 1;
  if (current < previous) return -1;
  return 0;
}

/** Calcula un contrato derivado a partir del crudo. */
export function computeContract(
  c: FutureContract,
  spot: number,
  now: number,
  prevLast: number | null,
): ComputedContract {
  const mark = markPrice(c);
  const days = daysToExpiry(c.expiry, now);
  const change =
    mark != null && c.referenceClose != null ? mark - c.referenceClose : null;
  const changePct =
    mark != null && c.referenceClose
      ? mark / c.referenceClose - 1
      : null;

  return {
    ...c,
    daysToExpiry: days,
    change,
    changePct,
    spread: spread(c.bid, c.ask),
    base: base(mark, spot),
    forwardPoints: base(mark, spot),
    tna: impliedTNA(mark, spot, days),
    tea: impliedTEA(mark, spot, days),
    oiChange:
      c.prevOpenInterest != null ? c.openInterest - c.prevOpenInterest : null,
    priceDir: direction(c.last, prevLast),
  };
}

/** Construye el snapshot completo + estadisticas desde un frame crudo. */
export function buildSnapshot(
  frame: RawMarketFrame,
  prev?: MarketSnapshot,
): { snapshot: MarketSnapshot; stats: MarketStats } {
  const prevLast = new Map<string, number | null>();
  prev?.contracts.forEach((c) => prevLast.set(c.ticker, c.last));

  const spotValue = frame.spot.value;
  const contracts = frame.contracts.map((c) =>
    computeContract(c, spotValue, frame.timestamp, prevLast.get(c.ticker) ?? null),
  );

  const snapshot: MarketSnapshot = {
    timestamp: frame.timestamp,
    a3500: frame.a3500,
    spot: frame.spot,
    contracts,
    source: frame.source,
  };

  return { snapshot, stats: computeStats(contracts) };
}

/** Estadisticas agregadas de la rueda. */
export function computeStats(contracts: ComputedContract[]): MarketStats {
  const n = contracts.length || 1;
  const totalVolume = sum(contracts.map((c) => c.volume));
  const totalOpenInterest = sum(contracts.map((c) => c.openInterest));
  const oiChanges = contracts
    .map((c) => c.oiChange)
    .filter((v): v is number => v != null);
  const spreads = contracts
    .map((c) => c.spread)
    .filter((v): v is number => v != null);
  const withTna = contracts.filter((c) => c.tna != null);

  return {
    totalVolume,
    totalOpenInterest,
    oiChangeTotal: oiChanges.length ? sum(oiChanges) : null,
    avgVolume: totalVolume / n,
    avgOpenInterest: totalOpenInterest / n,
    avgSpread: spreads.length ? sum(spreads) / spreads.length : null,
    mostLiquid: argmax(contracts, (c) => c.volume),
    frontContract: argmin(
      contracts.filter((c) => c.daysToExpiry >= 0),
      (c) => c.daysToExpiry,
    ),
    maxTna: argmax(withTna, (c) => c.tna ?? -Infinity),
    minTna: argmin(withTna, (c) => c.tna ?? Infinity),
  };
}

// ----------------------------- utilidades -----------------------------

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function argmax<T>(items: T[], key: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => (key(item) > key(best) ? item : best));
}

function argmin<T>(items: T[], key: (item: T) => number): T | null {
  if (!items.length) return null;
  return items.reduce((best, item) => (key(item) < key(best) ? item : best));
}
