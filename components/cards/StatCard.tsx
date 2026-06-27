"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/Tooltip";

interface StatCardProps {
  label: string;
  tip?: string;
  value: string;
  /** Valor numerico que dispara el flash al cambiar. */
  flashKey?: number | null;
  delta?: ReactNode;
  sub?: ReactNode;
  accent?: boolean;
}

/** Tarjeta de metrica con flash verde/rojo cuando el precio cambia. */
export function StatCard({
  label,
  tip,
  value,
  flashKey,
  delta,
  sub,
  accent,
}: StatCardProps) {
  const prev = useRef<number | null>(null);
  const [flash, setFlash] = useState<"" | "up" | "down">("");

  useEffect(() => {
    if (flashKey == null) return;
    if (prev.current != null && flashKey !== prev.current) {
      setFlash(flashKey > prev.current ? "up" : "down");
      const t = setTimeout(() => setFlash(""), 700);
      prev.current = flashKey;
      return () => clearTimeout(t);
    }
    prev.current = flashKey;
  }, [flashKey]);

  return (
    <div
      className={clsx(
        "panel relative overflow-hidden p-4 transition-colors",
        accent && "ring-1 ring-inset ring-brand/30",
      )}
    >
      {accent ? (
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand via-sky to-transparent" />
      ) : null}

      <div className="flex items-center text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
        {tip ? <InfoTip tip={tip} /> : null}
      </div>

      <div
        className={clsx(
          "mt-2 rounded-md px-1 text-2xl font-semibold tracking-tight text-ink tnum",
          flash === "up" && "animate-flash-up",
          flash === "down" && "animate-flash-down",
        )}
      >
        {value}
      </div>

      <div className="mt-1.5 flex min-h-[18px] items-center justify-between gap-2 text-xs">
        <span>{delta}</span>
        {sub ? <span className="truncate text-ink-faint">{sub}</span> : null}
      </div>
    </div>
  );
}
