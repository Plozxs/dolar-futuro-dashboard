/**
 * Factory de proveedores de datos.
 *
 *   - dataMode "simulated"  -> SimulatedFeed
 *   - dataMode "backend"    -> BackendFeed (estricto)
 *   - dataMode "auto"       -> ResilientProvider: arranca simulado al instante y
 *                              "asciende" a backend si responde; si el backend cae,
 *                              vuelve a simulado sin cortar el stream.
 */

import { settings } from "@/config/settings";
import { isMarketOpen } from "@/lib/marketHours";
import { BackendFeed } from "./backendFeed";
import { ClosingDataFeed } from "./closingDataFeed";
import { BaseProvider, type MarketDataProvider } from "./provider";
import { SimulatedFeed } from "./simulatedFeed";

class ResilientProvider extends BaseProvider {
  readonly source = "simulated" as const; // nominal; la fuente real viaja en el estado

  private sim = new SimulatedFeed();
  private backend = new BackendFeed();
  private backendLive = false;
  private offs: Array<() => void> = [];

  start(): void {
    this.offs.push(
      this.sim.onFrame((f) => {
        if (!this.backendLive) this.emitFrame(f);
      }),
      this.sim.onState((p) => {
        if (!this.backendLive) this.emitState({ ...p, source: "simulated" });
      }),
      this.backend.onFrame((f) => this.emitFrame(f)),
      this.backend.onState((p) => {
        if (p.status === "live") {
          this.backendLive = true;
          this.emitState({ ...p, source: "backend" });
        } else if (p.status === "offline") {
          this.backendLive = false;
          this.emitState({ status: "live", source: "simulated" });
        } else if (this.backendLive) {
          this.emitState(p);
        }
      }),
    );
    this.sim.start();
    this.backend.start();
  }

  stop(): void {
    this.offs.forEach((off) => off());
    this.offs = [];
    this.sim.stop();
    this.backend.stop();
  }
}

export function createProvider(): MarketDataProvider {
  if (!isMarketOpen()) {
    return new ClosingDataFeed();
  }
  switch (settings.dataMode) {
    case "simulated":
      return new SimulatedFeed();
    case "backend":
      return new BackendFeed();
    case "auto":
    default:
      return settings.backendUrl ? new ResilientProvider() : new SimulatedFeed();
  }
}

export type { MarketDataProvider } from "./provider";
