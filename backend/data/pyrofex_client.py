"""Cliente PyRofex: autenticacion, snapshot REST y streaming por WebSocket.

Encapsula TODA la conexion al mercado (A3 Mercados). No contiene logica de
presentacion ni de API HTTP: solo habla con el mercado y notifica cada
actualizacion de market data mediante un callback `on_update(symbol, market_data)`.
"""

from __future__ import annotations

import logging
import threading
from typing import Callable, List

import pyRofex

logger = logging.getLogger(__name__)

# Entradas de market data solicitadas al mercado.
ENTRIES = [
    pyRofex.MarketDataEntry.LAST,
    pyRofex.MarketDataEntry.BIDS,
    pyRofex.MarketDataEntry.OFFERS,
    pyRofex.MarketDataEntry.OPENING_PRICE,
    pyRofex.MarketDataEntry.HIGH_PRICE,
    pyRofex.MarketDataEntry.LOW_PRICE,
    pyRofex.MarketDataEntry.CLOSING_PRICE,
    pyRofex.MarketDataEntry.SETTLEMENT_PRICE,
    pyRofex.MarketDataEntry.OPEN_INTEREST,
    pyRofex.MarketDataEntry.NOMINAL_VOLUME,
    pyRofex.MarketDataEntry.TRADE_VOLUME,
]

UpdateCallback = Callable[[str, dict], None]


class PyRofexClient:
    """Wrapper de pyRofex con login, subscripcion y manejo de WebSocket."""

    def __init__(self, settings, on_update: UpdateCallback) -> None:
        self._settings = settings
        self._on_update = on_update
        self._connected = False
        self._lock = threading.Lock()
        self._environment = pyRofex.Environment.LIVE

    @property
    def connected(self) -> bool:
        return self._connected

    # ------------------------------------------------------------------ login
    def login(self) -> None:
        """Inicializa la sesion REST/WS de pyRofex con las credenciales del .env."""
        s = self._settings
        if not s.has_credentials:
            raise RuntimeError(
                "Faltan credenciales ROFEX_USER / ROFEX_PASSWORD / ROFEX_ACCOUNT",
            )

        self._environment = (
            pyRofex.Environment.LIVE
            if s.environment == "LIVE"
            else pyRofex.Environment.REMARKET
        )

        # URLs custom de A3 (si se proveen) antes de inicializar.
        if s.api_url:
            pyRofex._set_environment_parameter("url", s.api_url, self._environment)
        if s.ws_url:
            pyRofex._set_environment_parameter("ws", s.ws_url, self._environment)

        pyRofex.initialize(
            user=s.user,
            password=s.password,
            account=s.account,
            environment=self._environment,
        )
        logger.info("PyRofex inicializado (environment=%s)", s.environment)

    # ----------------------------------------------------------- instrumentos
    def discover_tickers(self) -> List[str]:
        """Devuelve los tickers configurados o autodescubre los DLR/."""
        if self._settings.tickers:
            return self._settings.tickers
        try:
            data = pyRofex.get_all_instruments()
            symbols = [
                inst["instrumentId"]["symbol"]
                for inst in data.get("instruments", [])
            ]
            dollar = sorted(s for s in symbols if s.startswith("DLR/"))
            logger.info("Autodescubiertos %d futuros de dolar", len(dollar))
            return dollar
        except Exception as exc:  # noqa: BLE001 - log y seguimos
            logger.warning("No se pudieron descubrir instrumentos: %s", exc)
            return []

    # ------------------------------------------------------------- snapshot
    def snapshot(self, tickers: List[str]) -> None:
        """Snapshot REST inicial: puebla el store antes de abrir el streaming."""
        for ticker in tickers:
            try:
                resp = pyRofex.get_market_data(ticker=ticker, entries=ENTRIES)
                if resp.get("status") == "OK":
                    self._on_update(ticker, resp.get("marketData", {}))
            except Exception as exc:  # noqa: BLE001
                logger.warning("Snapshot REST fallo para %s: %s", ticker, exc)

    # ------------------------------------------------------------- websocket
    def connect_websocket(self) -> None:
        """Abre la conexion WebSocket y registra los handlers."""
        pyRofex.init_websocket_connection(
            market_data_handler=self._handle_market_data,
            error_handler=self._handle_error,
            exception_handler=self._handle_exception,
        )
        self._connected = True
        logger.info("WebSocket PyRofex conectado")

    def subscribe(self, tickers: List[str]) -> None:
        """Suscribe market data en tiempo real para los tickers indicados."""
        if not tickers:
            logger.warning("Sin tickers para suscribir")
            return
        pyRofex.market_data_subscription(tickers=tickers, entries=ENTRIES)
        logger.info("Suscripto a market data de %d instrumentos", len(tickers))

    # --------------------------------------------------------------- handlers
    def _handle_market_data(self, message: dict) -> None:
        try:
            symbol = message["instrumentId"]["symbol"]
            self._on_update(symbol, message.get("marketData", {}))
        except Exception as exc:  # noqa: BLE001
            logger.debug("Mensaje de market data ignorado: %s", exc)

    def _handle_error(self, message: dict) -> None:
        logger.error("PyRofex error: %s", message)

    def _handle_exception(self, exception: Exception) -> None:
        logger.error("PyRofex exception: %s", exception)

    # ------------------------------------------------------------------ close
    def close(self) -> None:
        try:
            pyRofex.close_websocket_connection()
        except Exception:  # noqa: BLE001
            pass
        self._connected = False
        logger.info("Conexion PyRofex cerrada")
