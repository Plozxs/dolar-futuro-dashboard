/**
 * Modelo de dominio del monitor de futuros de dolar.
 *
 * - `FutureContract`  -> datos "crudos" provenientes del feed (PyRofex o simulado).
 * - `ComputedContract`-> agrega las metricas derivadas (TNA, base, spread, dias...).
 * - `RawMarketFrame`  -> lo que emite un proveedor de datos en cada actualizacion.
 * - `MarketSnapshot`  -> frame ya enriquecido, listo para la UI.
 */

export type DataSource = "backend" | "simulated";

export type PriceDirection = 1 | -1 | 0;

/** Referencia de tipo de cambio (A3500 / spot mayorista). */
export interface SpotRef {
  label: string;
  value: number;
  /** Variacion diaria expresada como fraccion (-0.0014 = -0.14%). */
  changePct: number;
}

/** Datos crudos de un contrato, tal como llegan del mercado. */
export interface FutureContract {
  ticker: string; // "DLR/JUN26"
  label: string; // "JUN26"
  expiry: string; // ISO date "2026-06-30"
  open: number | null;
  high: number | null;
  low: number | null;
  last: number | null;
  settlement: number | null; // ajuste
  /** Cierre/ajuste de la rueda anterior, base para la variacion diaria. */
  referenceClose: number | null;
  bid: number | null;
  ask: number | null;
  volume: number; // contratos operados en la rueda
  openInterest: number;
  prevOpenInterest: number | null;
}

/** Contrato enriquecido con metricas calculadas. */
export interface ComputedContract extends FutureContract {
  /** Variacion diaria como fraccion. */
  changePct: number | null;
  change: number | null;
  spread: number | null; // ask - bid
  base: number | null; // futuro - spot
  daysToExpiry: number;
  tna: number | null; // tasa nominal anual implicita (fraccion)
  tea: number | null; // tasa efectiva anual implicita (fraccion)
  forwardPoints: number | null; // futuro - spot, en puntos
  oiChange: number | null; // variacion de interes abierto
  priceDir: PriceDirection; // direccion del ultimo cambio (para el flash)
}

/** Frame crudo emitido por un proveedor de datos. */
export interface RawMarketFrame {
  timestamp: number; // epoch ms
  a3500: SpotRef;
  spot: SpotRef;
  contracts: FutureContract[];
  source: DataSource;
}

/** Frame ya calculado y listo para renderizar. */
export interface MarketSnapshot {
  timestamp: number;
  a3500: SpotRef;
  spot: SpotRef;
  contracts: ComputedContract[];
  source: DataSource;
}

/** Estado de la conexion / barra de estado. */
export interface ConnectionState {
  status: "connecting" | "live" | "offline";
  source: DataSource;
  latencyMs: number | null;
  messages: number;
  lastUpdate: number | null;
}

/** Estadisticas agregadas de la rueda. */
export interface MarketStats {
  totalVolume: number;
  totalOpenInterest: number;
  oiChangeTotal: number | null;
  avgVolume: number;
  avgOpenInterest: number;
  avgSpread: number | null;
  mostLiquid: ComputedContract | null;
  frontContract: ComputedContract | null;
  maxTna: ComputedContract | null;
  minTna: ComputedContract | null;
}

/** Filtros aplicables a la tabla. */
export interface TableFilters {
  ticker: string | null;
  minVolume: number;
  minOpenInterest: number;
}
