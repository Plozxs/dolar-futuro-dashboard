/**
 * Feed estático que emite una sola vez los datos del último cierre guardados en
 * localStorage. Se usa fuera del horario de rueda para no mostrar datos mock.
 */

import type { RawMarketFrame } from "../types";
import { BaseProvider } from "./provider";

const STORAGE_KEY = "dolar-futuro-cierre-v1";

export function saveClosingFrame(frame: RawMarketFrame): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(frame));
    }
  } catch {
    /* storage lleno o en contexto sin acceso */
  }
}

export function loadClosingFrame(): RawMarketFrame | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RawMarketFrame) : null;
  } catch {
    return null;
  }
}

export class ClosingDataFeed extends BaseProvider {
  readonly source = "closing" as const;

  start(): void {
    const frame = loadClosingFrame();
    if (frame) {
      this.emitState({ status: "live", source: "closing", latencyMs: null });
      this.emitFrame({ ...frame, source: "closing" });
    } else {
      this.emitState({ status: "offline", source: "closing", latencyMs: null });
    }
  }

  stop(): void {}
}
