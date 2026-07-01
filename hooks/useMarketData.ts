"use client";

import { useEffect, useRef, useState } from "react";
import { buildSnapshot } from "@/lib/calculations";
import { saveClosingFrame } from "@/lib/marketData/closingDataFeed";
import { createProvider } from "@/lib/marketData";
import type { ConnectionState, MarketSnapshot, MarketStats } from "@/lib/types";

export interface MarketData {
  snapshot: MarketSnapshot | null;
  stats: MarketStats | null;
  conn: ConnectionState;
}

/**
 * Hook unico de datos de mercado. Crea un proveedor (simulado / backend / auto),
 * arma el snapshot enriquecido en cada frame y mantiene el estado de conexion.
 * Una sola suscripcion viva durante todo el ciclo del componente.
 */
export function useMarketData(): MarketData {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [conn, setConn] = useState<ConnectionState>({
    status: "connecting",
    source: "simulated",
    latencyMs: null,
    messages: 0,
    lastUpdate: null,
  });

  const prevSnapshot = useRef<MarketSnapshot | null>(null);

  useEffect(() => {
    const provider = createProvider();

    const offFrame = provider.onFrame((frame) => {
      if (frame.source === "backend") saveClosingFrame(frame);
      const { snapshot: snap, stats: st } = buildSnapshot(
        frame,
        prevSnapshot.current ?? undefined,
      );
      prevSnapshot.current = snap;
      setSnapshot(snap);
      setStats(st);
      setConn((c) => ({
        ...c,
        status: "live",
        source: frame.source,
        lastUpdate: frame.timestamp,
        messages: c.messages + 1,
      }));
    });

    const offState = provider.onState((patch) =>
      setConn((c) => ({ ...c, ...patch })),
    );

    provider.start();

    return () => {
      offFrame();
      offState();
      provider.stop();
    };
  }, []);

  return { snapshot, stats, conn };
}
