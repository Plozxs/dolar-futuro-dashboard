"""Configuracion del backend, cargada desde variables de entorno (.env)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List

from dotenv import load_dotenv

load_dotenv()


def _split(value: str | None) -> List[str]:
    """Convierte 'a, b ,c' -> ['a', 'b', 'c']."""
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _float(value: str | None, default: float) -> float:
    try:
        return float(value) if value not in (None, "") else default
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    """Parametros inmutables del servicio."""

    user: str
    password: str
    account: str
    api_url: str
    ws_url: str
    environment: str
    tickers: List[str]
    spot_ticker: str
    a3500_ticker: str
    spot_value: float
    a3500_value: float
    allowed_origins: List[str]
    host: str
    port: int
    broadcast_interval: float
    timeout_seconds: int

    @property
    def has_credentials(self) -> bool:
        return bool(self.user and self.password and self.account)


def get_settings() -> Settings:
    """Construye el objeto Settings desde el entorno."""
    return Settings(
        user=os.getenv("ROFEX_USER", ""),
        password=os.getenv("ROFEX_PASSWORD", ""),
        account=os.getenv("ROFEX_ACCOUNT", ""),
        api_url=os.getenv("ROFEX_API_URL", ""),
        ws_url=os.getenv("ROFEX_WS_URL", ""),
        environment=os.getenv("ROFEX_ENVIRONMENT", "LIVE").upper(),
        tickers=_split(os.getenv("ROFEX_TICKERS")),
        spot_ticker=os.getenv("SPOT_TICKER", ""),
        a3500_ticker=os.getenv("A3500_TICKER", ""),
        spot_value=_float(os.getenv("SPOT_VALUE"), 0.0),
        a3500_value=_float(os.getenv("A3500_VALUE"), 0.0),
        allowed_origins=_split(os.getenv("ALLOWED_ORIGINS")) or ["*"],
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", "8000")),
        broadcast_interval=_float(os.getenv("BROADCAST_INTERVAL"), 1.0),
        timeout_seconds=int(os.getenv("ROFEX_TIMEOUT_SECONDS", "30")),
    )


settings = get_settings()
