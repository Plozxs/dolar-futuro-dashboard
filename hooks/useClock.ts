"use client";

import { useEffect, useState } from "react";

/**
 * Reloj que tickea cada `intervalMs`. Devuelve `null` hasta montar en el cliente
 * para evitar mismatch de hidratacion con el render del servidor.
 */
export function useClock(intervalMs = 1000): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
