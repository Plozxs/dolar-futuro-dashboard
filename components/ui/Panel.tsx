import clsx from "clsx";
import type { ReactNode } from "react";
import { InfoTip } from "./Tooltip";

interface PanelProps {
  title: string;
  tip?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Contenedor estandar de panel con encabezado. */
export function Panel({
  title,
  tip,
  action,
  children,
  className,
  bodyClassName,
}: PanelProps) {
  return (
    <section className={clsx("panel p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="panel-head flex items-center">
          {title}
          {tip ? <InfoTip tip={tip} /> : null}
        </h3>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
