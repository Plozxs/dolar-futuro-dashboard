/**
 * Helpers de formato con locale es-AR (separador de miles "." y decimal ",").
 * Todas las funciones son puras y tolerantes a `null`.
 */

const LOCALE = "es-AR";

const numberFmt = (min: number, max: number) =>
  new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

const DASH = "—"; // em dash para valores ausentes

/** Precio: 1.479,00 */
export function fmtPrice(value: number | null, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return DASH;
  return numberFmt(decimals, decimals).format(value);
}

/** Entero con miles: 3.042.838 */
export function fmtInt(value: number | null): string {
  if (value == null || Number.isNaN(value)) return DASH;
  return numberFmt(0, 0).format(value);
}

/** Numero generico con hasta `decimals` decimales. */
export function fmtNum(value: number | null, decimals = 2): string {
  if (value == null || Number.isNaN(value)) return DASH;
  return numberFmt(0, decimals).format(value);
}

/** Porcentaje desde fraccion: 0.0988 -> "9,88%". */
export function fmtPct(fraction: number | null, decimals = 2): string {
  if (fraction == null || Number.isNaN(fraction)) return DASH;
  return `${numberFmt(decimals, decimals).format(fraction * 100)}%`;
}

/** Porcentaje con signo explicito: +0,09% / -0,30%. */
export function fmtSignedPct(fraction: number | null, decimals = 2): string {
  if (fraction == null || Number.isNaN(fraction)) return DASH;
  const sign = fraction > 0 ? "+" : "";
  return `${sign}${numberFmt(decimals, decimals).format(fraction * 100)}%`;
}

/** Numero con signo explicito (variaciones de OI, bases, etc.). */
export function fmtSigned(value: number | null, decimals = 0): string {
  if (value == null || Number.isNaN(value)) return DASH;
  const sign = value > 0 ? "+" : "";
  return `${sign}${numberFmt(decimals, decimals).format(value)}`;
}

/** Compacta volumenes grandes: 1.583.206 -> "1,58 M". */
export function fmtCompact(value: number | null): string {
  if (value == null || Number.isNaN(value)) return DASH;
  if (Math.abs(value) >= 1_000_000)
    return `${numberFmt(2, 2).format(value / 1_000_000)} M`;
  if (Math.abs(value) >= 1_000)
    return `${numberFmt(1, 1).format(value / 1_000)} k`;
  return numberFmt(0, 0).format(value);
}

/** Hora HH:MM:SS */
export function fmtTime(epochMs: number | null): string {
  if (epochMs == null) return "--:--:--";
  return new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(epochMs);
}

/** Fecha larga: "26 de junio de 2026" */
export function fmtLongDate(epochMs: number): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(epochMs);
}

/** Fecha larga con mes capitalizado: "26 de Junio de 2026". */
export function fmtLongDateTitle(epochMs: number): string {
  const day = new Intl.DateTimeFormat(LOCALE, { day: "numeric" }).format(epochMs);
  const month = new Intl.DateTimeFormat(LOCALE, { month: "long" }).format(epochMs);
  const year = new Intl.DateTimeFormat(LOCALE, { year: "numeric" }).format(epochMs);
  return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)} de ${year}`;
}

/** Vencimiento corto: "30/06/26" desde ISO. */
export function fmtExpiry(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(d);
}

/** Latencia legible: 18 ms / 1,2 s. */
export function fmtLatency(ms: number | null): string {
  if (ms == null) return DASH;
  if (ms >= 1000) return `${numberFmt(1, 1).format(ms / 1000)} s`;
  return `${Math.round(ms)} ms`;
}

export const PLACEHOLDER = DASH;
