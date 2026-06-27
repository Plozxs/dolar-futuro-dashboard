/**
 * Feed contra el backend PyRofex (FastAPI).
 *
 * Flujo:
 *   1. snapshot REST inicial  -> GET {backendUrl}/api/snapshot
 *   2. streaming en tiempo real -> WebSocket {backendWsUrl}
 *
 * El backend ya envia frames con la forma `RawMarketFrame` (ver backend/app.py),
 * por eso aqui solo se normaliza/valida minimamente y se mide la latencia.
 */

import { settings } from "@/config/settings";
import type { FutureContract, RawMarketFrame, SpotRef } from "../types";
import { BaseProvider } from "./provider";

function wsUrl(): string {
  if (settings.backendWsUrl) return settings.backendWsUrl;
  return `${settings.backendUrl.replace(/^http/, "ws")}/ws`;
}

function asNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeSpot(raw: any, fallbackLabel: string): SpotRef {
  return {
    label: typeof raw?.label === "string" ? raw.label : fallbackLabel,
    value: asNumberOrNull(raw?.value) ?? 0,
    changePct: asNumberOrNull(raw?.changePct) ?? 0,
  };
}

function normalizeContract(raw: any): FutureContract | null {
  if (!raw || typeof raw.ticker !== "string") return null;
  return {
    ticker: raw.ticker,
    label: typeof raw.label === "string" ? raw.label : raw.ticker.split("/")[1] ?? raw.ticker,
    expiry: typeof raw.expiry === "string" ? raw.expiry : "",
    open: asNumberOrNull(raw.open),
    high: asNumberOrNull(raw.high),
    low: asNumberOrNull(raw.low),
    last: asNumberOrNull(raw.last),
    settlement: asNumberOrNull(raw.settlement),
    referenceClose: asNumberOrNull(raw.referenceClose),
    bid: asNumberOrNull(raw.bid),
    ask: asNumberOrNull(raw.ask),
    volume: asNumberOrNull(raw.volume) ?? 0,
    openInterest: asNumberOrNull(raw.openInterest) ?? 0,
    prevOpenInterest: asNumberOrNull(raw.prevOpenInterest),
  };
}

function normalizeFrame(raw: any): RawMarketFrame | null {
  if (!raw || !Array.isArray(raw.contracts)) return null;
  const contracts = raw.contracts
    .map(normalizeContract)
    .filter((c: FutureContract | null): c is FutureContract => c !== null);
  if (!contracts.length) return null;
  return {
    timestamp: asNumberOrNull(raw.timestamp) ?? Date.now(),
    a3500: normalizeSpot(raw.a3500, "Dolar BCRA A3500"),
    spot: normalizeSpot(raw.spot, "Dolar Spot"),
    contracts,
    source: "backend",
  };
}

export class BackendFeed extends BaseProvider {
  readonly source = "backend" as const;

  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;

  start(): void {
    this.stopped = false;
    void this.bootstrap();
    this.connect();
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.closeSocket();
  }

  /** Snapshot REST inicial para pintar la grilla al instante. */
  private async bootstrap(): Promise<void> {
    if (!settings.backendUrl) return;
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), settings.backendProbeTimeoutMs);
      const res = await fetch(`${settings.backendUrl}/api/snapshot`, {
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(t);
      if (res.ok) this.handlePayload(await res.json());
    } catch {
      /* el WebSocket reintentara igual */
    }
  }

  private connect(): void {
    if (this.stopped) return;
    this.emitState({ status: "connecting", source: "backend" });
    try {
      const ws = new WebSocket(wsUrl());
      this.ws = ws;
      ws.onopen = () => this.emitState({ status: "live", source: "backend" });
      ws.onmessage = (ev) => {
        try {
          this.handlePayload(JSON.parse(ev.data as string));
        } catch {
          /* frame malformado: se ignora */
        }
      };
      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };
      ws.onclose = () => {
        this.ws = null;
        this.emitState({ status: "offline" });
        this.scheduleReconnect();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private handlePayload(raw: unknown): void {
    const frame = normalizeFrame(raw);
    if (!frame) return;
    const latency = Date.now() - frame.timestamp;
    this.emitState({ latencyMs: latency >= 0 && latency < 60_000 ? latency : null });
    this.emitFrame(frame);
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, settings.reconnectMs);
  }

  private closeSocket(): void {
    if (!this.ws) return;
    this.ws.onclose = null;
    this.ws.onerror = null;
    this.ws.onmessage = null;
    try {
      this.ws.close();
    } catch {
      /* noop */
    }
    this.ws = null;
  }
}
