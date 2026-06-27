"use client";

import clsx from "clsx";
import { Gauge, MessageSquare, RadioTower, Clock, Database } from "lucide-react";
import type { ReactNode } from "react";
import type { ConnectionState } from "@/lib/types";
import { fmtInt, fmtLatency, fmtTime } from "@/lib/format";

interface StatusBarProps {
  conn: ConnectionState;
}

function Item({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-ink-faint">{icon}</span>
      <span className="text-[11px] uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </span>
      <span className={clsx("tnum text-xs font-semibold text-ink", tone)}>
        {value}
      </span>
    </div>
  );
}

/** Barra superior tecnica: ultima actualizacion, latencia, mensajes y fuente. */
export function StatusBar({ conn }: StatusBarProps) {
  const latencyTone =
    conn.latencyMs == null
      ? ""
      : conn.latencyMs < 120
        ? "text-up"
        : conn.latencyMs < 400
          ? "text-amber-300"
          : "text-down";

  const sourceLabel = conn.source === "backend" ? "PyRofex · A3" : "Simulado";

  return (
    <div className="panel flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
      <Item
        icon={<Clock size={14} />}
        label="Ult. act."
        value={fmtTime(conn.lastUpdate)}
      />
      <Item
        icon={<Gauge size={14} />}
        label="Latencia WS"
        value={fmtLatency(conn.latencyMs)}
        tone={latencyTone}
      />
      <Item
        icon={<MessageSquare size={14} />}
        label="Mensajes"
        value={fmtInt(conn.messages)}
      />
      <Item
        icon={<Database size={14} />}
        label="Fuente"
        value={sourceLabel}
        tone={conn.source === "backend" ? "text-sky" : "text-ink-muted"}
      />
      <div className="ml-auto flex items-center gap-2 whitespace-nowrap">
        <RadioTower
          size={14}
          className={conn.status === "live" ? "text-up" : "text-ink-faint"}
        />
        <span
          className={clsx(
            "text-[11px] font-bold uppercase tracking-[0.14em]",
            conn.status === "live"
              ? "text-up"
              : conn.status === "connecting"
                ? "text-amber-300"
                : "text-down",
          )}
        >
          {conn.status === "live"
            ? "Streaming en vivo"
            : conn.status === "connecting"
              ? "Conectando…"
              : "Sin conexion"}
        </span>
      </div>
    </div>
  );
}
