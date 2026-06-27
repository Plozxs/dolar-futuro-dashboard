"""Almacen thread-safe del ultimo market data y armado del frame para la UI.

PyRofex entrega actualizaciones parciales (solo los campos que cambian) desde su
propio hilo. Este store las mergea de forma segura y construye el `RawMarketFrame`
con la misma forma que espera el frontend (lib/types.ts -> RawMarketFrame).
"""

from __future__ import annotations

import threading
import time
from typing import Dict, List, Optional

from .calculations import month_expiry

# Claves cortas de market data que devuelve pyRofex.
LAST = "LA"
BIDS = "BI"
OFFERS = "OF"
OPEN = "OP"
HIGH = "HI"
LOW = "LO"
CLOSE = "CL"
SETTLEMENT = "SE"
OPEN_INTEREST = "OI"
TRADE_VOLUME = "TV"
NOMINAL_VOLUME = "NV"


def _num(value: object) -> Optional[float]:
    """Extrae un numero de un campo que puede ser dict {'price'|'size'} o escalar."""
    if isinstance(value, dict):
        for key in ("price", "size", "value"):
            if value.get(key) is not None:
                return float(value[key])
        return None
    if isinstance(value, (int, float)):
        return float(value)
    return None


def _book_top(value: object) -> Optional[float]:
    """Mejor precio de un libro (lista de niveles)."""
    if isinstance(value, list) and value:
        return _num(value[0])
    return _num(value)


class MarketStore:
    """Estado consolidado del mercado, seguro entre hilos."""

    def __init__(self, settings) -> None:
        self._settings = settings
        self._lock = threading.Lock()
        self._data: Dict[str, dict] = {}

    def update(self, ticker: str, market_data: dict) -> None:
        """Mergea una actualizacion parcial de market data."""
        if not market_data:
            return
        with self._lock:
            current = self._data.setdefault(ticker, {})
            current.update(market_data)

    def size(self) -> int:
        with self._lock:
            return len(self._data)

    # ------------------------------------------------------------- referencias
    def _ref_value(self, ticker: str, fallback: float) -> float:
        if ticker:
            with self._lock:
                md = self._data.get(ticker)
            if md:
                last = _num(md.get(LAST)) or _num(md.get(CLOSE))
                if last:
                    return last
        return fallback

    def _spot_ref(self, contracts: List[dict]) -> dict:
        fallback = self._settings.spot_value
        if not fallback and contracts:
            fallback = contracts[0].get("settlement") or contracts[0].get("last") or 0.0
        value = self._ref_value(self._settings.spot_ticker, fallback)
        return {"label": "Dolar Spot (Mayorista)", "value": value, "changePct": 0.0}

    def _a3500_ref(self) -> dict:
        value = self._ref_value(self._settings.a3500_ticker, self._settings.a3500_value)
        return {"label": "Dolar BCRA A3500", "value": value, "changePct": 0.0}

    # ------------------------------------------------------------------- frame
    def build_frame(self) -> dict:
        """Construye el RawMarketFrame que consume el frontend."""
        with self._lock:
            snapshot = list(self._data.items())

        contracts: List[dict] = []
        for ticker, md in snapshot:
            label = ticker.split("/")[-1]
            volume = _num(md.get(TRADE_VOLUME))
            if volume is None:
                volume = _num(md.get(NOMINAL_VOLUME))
            contracts.append(
                {
                    "ticker": ticker,
                    "label": label,
                    "expiry": month_expiry(label),
                    "open": _num(md.get(OPEN)),
                    "high": _num(md.get(HIGH)),
                    "low": _num(md.get(LOW)),
                    "last": _num(md.get(LAST)),
                    "settlement": _num(md.get(SETTLEMENT)),
                    "referenceClose": _num(md.get(CLOSE)),
                    "bid": _book_top(md.get(BIDS)),
                    "ask": _book_top(md.get(OFFERS)),
                    "volume": volume or 0.0,
                    "openInterest": _num(md.get(OPEN_INTEREST)) or 0.0,
                    "prevOpenInterest": None,
                }
            )

        contracts.sort(key=lambda c: c["expiry"] or "")

        return {
            "timestamp": int(time.time() * 1000),
            "a3500": self._a3500_ref(),
            "spot": self._spot_ref(contracts),
            "contracts": contracts,
            "source": "backend",
        }
