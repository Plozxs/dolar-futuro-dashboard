import clsx from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import { fmtSigned, fmtSignedPct } from "@/lib/format";

interface DeltaProps {
  value: number | null;
  format?: "pct" | "num";
  decimals?: number;
  size?: "sm" | "md" | "lg";
  arrow?: boolean;
  className?: string;
}

const ICON_SIZE = { sm: 12, md: 14, lg: 16 } as const;
const TEXT_SIZE = { sm: "text-xs", md: "text-sm", lg: "text-base" } as const;

/** Variacion coloreada con flecha (▲ verde / ▼ rojo). */
export function Delta({
  value,
  format = "pct",
  decimals,
  size = "md",
  arrow = true,
  className,
}: DeltaProps) {
  const positive = value != null && value > 0;
  const negative = value != null && value < 0;
  const color = positive ? "text-up" : negative ? "text-down" : "text-flat";
  const Icon = positive ? ArrowUp : negative ? ArrowDown : null;
  const text =
    format === "pct"
      ? fmtSignedPct(value, decimals ?? 2)
      : fmtSigned(value, decimals ?? 0);

  return (
    <span
      className={clsx(
        "tnum inline-flex items-center gap-0.5 font-semibold",
        TEXT_SIZE[size],
        color,
        className,
      )}
    >
      {arrow && Icon ? <Icon size={ICON_SIZE[size]} strokeWidth={2.5} /> : null}
      {text}
    </span>
  );
}
