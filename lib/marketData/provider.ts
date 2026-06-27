/**
 * Contrato comun de un proveedor de datos de mercado.
 * Permite intercambiar el feed simulado por el backend PyRofex sin tocar la UI.
 */

import type { ConnectionState, DataSource, RawMarketFrame } from "../types";

export type FrameListener = (frame: RawMarketFrame) => void;
export type StateListener = (patch: Partial<ConnectionState>) => void;

export interface MarketDataProvider {
  readonly source: DataSource;
  start(): void;
  stop(): void;
  onFrame(cb: FrameListener): () => void;
  onState(cb: StateListener): () => void;
}

/** Base con manejo de suscriptores; las subclases solo implementan start/stop. */
export abstract class BaseProvider implements MarketDataProvider {
  abstract readonly source: DataSource;

  private frameCbs = new Set<FrameListener>();
  private stateCbs = new Set<StateListener>();

  onFrame(cb: FrameListener): () => void {
    this.frameCbs.add(cb);
    return () => {
      this.frameCbs.delete(cb);
    };
  }

  onState(cb: StateListener): () => void {
    this.stateCbs.add(cb);
    return () => {
      this.stateCbs.delete(cb);
    };
  }

  protected emitFrame(frame: RawMarketFrame): void {
    this.frameCbs.forEach((cb) => cb(frame));
  }

  protected emitState(patch: Partial<ConnectionState>): void {
    this.stateCbs.forEach((cb) => cb(patch));
  }

  abstract start(): void;
  abstract stop(): void;
}
