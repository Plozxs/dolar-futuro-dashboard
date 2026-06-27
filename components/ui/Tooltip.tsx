import { Info } from "lucide-react";
import type { ReactNode } from "react";
import clsx from "clsx";

interface TooltipProps {
  tip: string;
  children: ReactNode;
  className?: string;
}

/** Envuelve contenido y muestra una explicacion al pasar el mouse. */
export function Tooltip({ tip, children, className }: TooltipProps) {
  return (
    <span className={clsx("group/tip relative inline-flex items-center", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-56 -translate-x-1/2 rounded-lg border border-line bg-surface-3 px-3 py-2 text-left text-xs font-normal normal-case leading-snug tracking-normal text-ink-muted opacity-0 shadow-panel transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {tip}
      </span>
    </span>
  );
}

/** Icono "?" con tooltip, para encabezados de metricas. */
export function InfoTip({ tip }: { tip: string }) {
  return (
    <Tooltip tip={tip}>
      <Info
        size={12}
        className="ml-1 cursor-help text-ink-faint transition-colors hover:text-sky"
      />
    </Tooltip>
  );
}
