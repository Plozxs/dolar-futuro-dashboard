/**
 * Datos semilla tomados del cierre de referencia (A3 Mercados, 25/06/2026).
 * Reproducen exactamente la rueda del monitor: el feed simulado parte de aqui
 * y evoluciona los precios con un random-walk para dar sensacion "en vivo".
 *
 * Totales que deben coincidir con la referencia:
 *   - Volumen total .......... 3.042.838 contratos
 *   - Interes abierto total .. 3.709.405 contratos
 */

export interface SeedContract {
  ticker: string;
  label: string;
  expiry: string; // ISO
  open: number;
  high: number;
  low: number;
  last: number;
  settlement: number; // ajuste de la rueda
  changePct: number; // fraccion (var. diaria de referencia)
  volume: number;
  openInterest: number;
  prevOpenInterest: number | null; // null => sin dato (variacion "—")
}

export const SEED_SPOT = {
  label: "Dolar Spot (Mayorista)",
  value: 1477.0,
  changePct: -0.0014,
};

export const SEED_A3500 = {
  label: "Dolar BCRA A3500",
  value: 1477.3,
  changePct: -0.0005,
};

export const SEED_CONTRACTS: SeedContract[] = [
  { ticker: "DLR/JUN26", label: "JUN26", expiry: "2026-06-30", open: 1480.0, high: 1483.5, low: 1476.0, last: 1478.5, settlement: 1479.0, changePct: -0.003, volume: 1_583_206, openInterest: 1_018_806, prevOpenInterest: 1_217_455 },
  { ticker: "DLR/JUL26", label: "JUL26", expiry: "2026-07-31", open: 1509.0, high: 1509.0, low: 1501.5, last: 1504.5, settlement: 1505.0, changePct: -0.0036, volume: 1_305_090, openInterest: 1_233_448, prevOpenInterest: 949_517 },
  { ticker: "DLR/AGO26", label: "AGO26", expiry: "2026-08-31", open: 1536.0, high: 1536.0, low: 1529.0, last: 1532.5, settlement: 1533.5, changePct: -0.0026, volume: 89_571, openInterest: 335_611, prevOpenInterest: 314_068 },
  { ticker: "DLR/SEP26", label: "SEP26", expiry: "2026-09-30", open: 1562.0, high: 1564.0, low: 1557.0, last: 1562.5, settlement: 1562.0, changePct: -0.0022, volume: 31_967, openInterest: 254_364, prevOpenInterest: 254_788 },
  { ticker: "DLR/OCT26", label: "OCT26", expiry: "2026-10-30", open: 1587.0, high: 1595.0, low: 1587.0, last: 1591.0, settlement: 1591.0, changePct: -0.0025, volume: 768, openInterest: 156_931, prevOpenInterest: 157_118 },
  { ticker: "DLR/NOV26", label: "NOV26", expiry: "2026-11-30", open: 1623.0, high: 1628.0, low: 1617.5, last: 1625.0, settlement: 1623.0, changePct: -0.0006, volume: 823, openInterest: 137_169, prevOpenInterest: 137_075 },
  { ticker: "DLR/DIC26", label: "DIC26", expiry: "2026-12-30", open: 1648.5, high: 1655.0, low: 1641.0, last: 1651.5, settlement: 1652.0, changePct: -0.0006, volume: 22_149, openInterest: 222_010, prevOpenInterest: 222_150 },
  { ticker: "DLR/ENE27", label: "ENE27", expiry: "2027-01-29", open: 1678.0, high: 1691.0, low: 1677.0, last: 1690.0, settlement: 1686.0, changePct: 0.0009, volume: 119, openInterest: 47_338, prevOpenInterest: 47_235 },
  { ticker: "DLR/FEB27", label: "FEB27", expiry: "2027-02-26", open: 1710.0, high: 1715.0, low: 1710.0, last: 1714.5, settlement: 1714.5, changePct: -0.002, volume: 1_026, openInterest: 81_038, prevOpenInterest: 80_014 },
  { ticker: "DLR/MAR27", label: "MAR27", expiry: "2027-03-31", open: 1748.0, high: 1752.5, low: 1740.5, last: 1752.5, settlement: 1748.5, changePct: -0.002, volume: 7_014, openInterest: 144_381, prevOpenInterest: null },
  { ticker: "DLR/ABR27", label: "ABR27", expiry: "2027-04-30", open: 1785.0, high: 1785.0, low: 1785.0, last: 1785.0, settlement: 1780.5, changePct: -0.002, volume: 2, openInterest: 39_565, prevOpenInterest: null },
  { ticker: "DLR/MAY27", label: "MAY27", expiry: "2027-05-31", open: 1815.0, high: 1818.0, low: 1810.0, last: 1818.0, settlement: 1815.0, changePct: -0.0022, volume: 1_103, openInterest: 38_744, prevOpenInterest: 37_646 },
];
