"""API del Monitor de Dolar Futuro sobre PyRofex (A3 Mercados).

Expone el market data en tiempo real al frontend Next.js:
    - GET  /api/health    -> estado de la conexion
    - GET  /api/snapshot  -> ultimo frame (RawMarketFrame)
    - GET  /api/analytics -> curva de TNA y estadisticas (calculo server-side)
    - WS   /ws            -> streaming de frames

Ejecutar:
    uvicorn app:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from data.calculations import build_analytics
from data.market_store import MarketStore
from data.pyrofex_client import PyRofexClient

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(name)s | %(message)s",
)
logger = logging.getLogger("monitor")

store = MarketStore(settings)
client: PyRofexClient | None = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    """Conecta a PyRofex al iniciar y cierra la sesion al apagar."""
    global client
    client = PyRofexClient(settings, on_update=store.update)
    try:
        client.login()
        tickers = client.discover_tickers()
        client.snapshot(tickers)
        client.connect_websocket()
        client.subscribe(tickers)
        logger.info("Streaming PyRofex activo para %d instrumentos", len(tickers))
    except Exception as exc:  # noqa: BLE001 - el servicio arranca igual
        logger.error("No se pudo conectar a PyRofex: %s", exc)
        logger.error("El backend respondera vacio hasta resolver la conexion.")
    yield
    if client:
        client.close()


app = FastAPI(
    title="Monitor Dolar Futuro - PyRofex API",
    description="Streaming de futuros de dolar (A3 Mercados) para el dashboard.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    """Estado de la conexion y cantidad de instrumentos cargados."""
    return {
        "status": "ok",
        "connected": bool(client and client.connected),
        "instruments": store.size(),
        "environment": settings.environment,
    }


@app.get("/api/snapshot")
def snapshot() -> dict:
    """Ultimo frame de mercado (RawMarketFrame)."""
    return store.build_frame()


@app.get("/api/analytics")
def analytics() -> dict:
    """Curva de TNA y estadisticas calculadas en el servidor."""
    return build_analytics(store.build_frame())


@app.websocket("/ws")
async def stream(websocket: WebSocket) -> None:
    """Empuja un frame de mercado cada `broadcast_interval` segundos."""
    await websocket.accept()
    logger.info("Cliente WebSocket conectado")
    try:
        await websocket.send_json(store.build_frame())
        while True:
            await asyncio.sleep(settings.broadcast_interval)
            await websocket.send_json(store.build_frame())
    except WebSocketDisconnect:
        logger.info("Cliente WebSocket desconectado")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host=settings.host,
        port=settings.port,
        reload=False,
    )
