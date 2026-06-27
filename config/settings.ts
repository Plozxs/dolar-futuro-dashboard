/**
 * Configuracion central del frontend.
 * Lee variables NEXT_PUBLIC_* en build/runtime y expone valores tipados.
 */

export type DataMode = "auto" | "backend" | "simulated";

function readMode(): DataMode {
  const raw = (process.env.NEXT_PUBLIC_DATA_MODE || "auto").toLowerCase();
  if (raw === "backend" || raw === "simulated") return raw;
  return "auto";
}

export const settings = {
  /** Nombre de la mesa / branding propio (no se copian marcas). */
  appName: "Monitor de Dolar Futuro",
  deskName: "A3 Mercados",
  org: "Trading Desk",

  /** Modo de datos. */
  dataMode: readMode(),

  /** Backend PyRofex (FastAPI). Vacio => modo simulado. */
  backendUrl: (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, ""),
  backendWsUrl: process.env.NEXT_PUBLIC_BACKEND_WS_URL || "",

  /** Cadencia del feed simulado (ms). */
  simTickMs: 1100,
  /** Timeout del probe de salud del backend (ms). */
  backendProbeTimeoutMs: 2500,
  /** Reintentos de reconexion del WebSocket (ms). */
  reconnectMs: 4000,

  /** Convencion de dias para tasas. */
  dayCount: 365,

  /** Prefijo de los tickers de dolar futuro. */
  tickerPrefix: "DLR/",

  locale: "es-AR",
} as const;

export type Settings = typeof settings;
