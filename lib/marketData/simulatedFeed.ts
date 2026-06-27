/**
 * Feed simulado de alta fidelidad.
 *
 * Arranca exactamente con los valores del cierre de referencia (ver seed.ts) y
 * luego aplica un random-walk acotado sobre el ajuste/ultimo para dar sensacion
 * de mercado en vivo. Permite que la demo de Vercel funcione sin credenciales
 * ni backend, manteniendo coherencia (TNA, base, spreads) en cada tick.
 */

import { settings } from "@/config/settings";
import type { FutureContract, RawMarketFrame, SpotRef } from "../types";
import { BaseProvider } from "./provider";
import { SEED_A3500, SEED_CONTRACTS, SEED_SPOT, type SeedContract } from "./seed";

const TICK = 0.5; // tick minimo del contrato

interface ContractState {
  seed: SeedContract;
  settlement: number;
  last: number;
  volume: number;
  openInterest: number;
  referenceClose: number;
  halfSpread: number;
}

function roundTick(value: number): number {
  return Math.round(value / TICK) * TICK;
}

/** Ruido gaussiano estandar (Box-Muller). */
function gaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export class SimulatedFeed extends BaseProvider {
  readonly source = "simulated" as const;

  private states: ContractState[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private firstEmit = true;

  start(): void {
    this.initState();
    this.firstEmit = true;
    this.emitState({ status: "live", source: "simulated", latencyMs: 16 });
    this.tick(); // snapshot inicial inmediato (= valores de referencia)
    this.timer = setInterval(() => this.tick(), settings.simTickMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private initState(): void {
    this.states = SEED_CONTRACTS.map((seed) => {
      // spread sintetico inverso a la liquidez (mas volumen => mas ajustado)
      const liquidity = Math.min(1, seed.volume / 200_000);
      const halfSpread = roundTick(0.5 + (1 - liquidity) * 3.5);
      return {
        seed,
        settlement: seed.settlement,
        last: seed.last,
        volume: seed.volume,
        openInterest: seed.openInterest,
        referenceClose: seed.settlement / (1 + seed.changePct),
        halfSpread,
      };
    });
  }

  private tick(): void {
    const first = this.firstEmit;
    this.firstEmit = false;

    const contracts: FutureContract[] = this.states.map((s) => {
      if (!first) {
        // Random-walk acotado del ajuste.
        const sigma = Math.max(0.1, s.settlement * 0.00018);
        let next = roundTick(s.settlement + gaussian() * sigma);
        const lo = s.referenceClose * 0.9;
        const hi = s.referenceClose * 1.1;
        next = Math.min(hi, Math.max(lo, next));
        s.settlement = next;
        s.last = roundTick(next + gaussian() * 0.3);

        // El volumen de la rueda acumula de a poco; el OI deriva lentamente.
        if (Math.random() < 0.35) {
          s.volume += Math.round(Math.random() * (s.seed.volume * 0.0006 + 1));
        }
        if (Math.random() < 0.12) {
          s.openInterest += Math.round((Math.random() - 0.5) * 40);
        }
      }

      const bid = roundTick(s.last - s.halfSpread);
      const ask = roundTick(s.last + s.halfSpread);

      return {
        ticker: s.seed.ticker,
        label: s.seed.label,
        expiry: s.seed.expiry,
        open: s.seed.open,
        high: Math.max(s.seed.high, s.last),
        low: Math.min(s.seed.low, s.last),
        last: s.last,
        settlement: s.settlement,
        referenceClose: s.referenceClose,
        bid,
        ask,
        volume: s.volume,
        openInterest: s.openInterest,
        prevOpenInterest: s.seed.prevOpenInterest,
      };
    });

    const frame: RawMarketFrame = {
      timestamp: Date.now(),
      a3500: this.spotRef(SEED_A3500, first),
      spot: this.spotRef(SEED_SPOT, first),
      contracts,
      source: "simulated",
    };

    this.emitState({ latencyMs: 14 + Math.round(Math.random() * 9) });
    this.emitFrame(frame);
  }

  private spotRef(
    base: { label: string; value: number; changePct: number },
    first: boolean,
  ): SpotRef {
    if (first) return { ...base };
    const ref = base.value / (1 + base.changePct);
    const value = roundTick(base.value + gaussian() * 0.25 * TICK * 2);
    return { label: base.label, value, changePct: value / ref - 1 };
  }
}
