"""Calculo de metricas derivadas (espejo de lib/calculations.ts del frontend).

Se mantiene en el backend para poder servir analytics calculados en Python
(curva de TNA y estadisticas) y para validar la logica del lado servidor.
"""

from __future__ import annotations

import calendar
from datetime import date, datetime
from typing import Dict, List, Optional

DAY_COUNT = 365

_MONTHS = {
    "ENE": 1, "FEB": 2, "MAR": 3, "ABR": 4, "MAY": 5, "JUN": 6,
    "JUL": 7, "AGO": 8, "SEP": 9, "OCT": 10, "NOV": 11, "DIC": 12,
}


def month_expiry(label: str) -> str:
    """Convierte 'JUN26' -> ISO del ultimo dia del mes ('2026-06-30').

    Heuristica usada como fallback cuando el mercado no informa maturityDate.
    """
    code, year_suffix = label[:3].upper(), label[3:]
    month = _MONTHS.get(code)
    if month is None or not year_suffix.isdigit():
        return ""
    year = 2000 + int(year_suffix)
    last_day = calendar.monthrange(year, month)[1]
    return date(year, month, last_day).isoformat()


def days_to_expiry(expiry_iso: str, as_of: Optional[date] = None) -> int:
    """Dias calendario hasta el vencimiento (>= 0)."""
    if not expiry_iso:
        return 0
    as_of = as_of or date.today()
    expiry = datetime.fromisoformat(expiry_iso).date()
    return max(0, (expiry - as_of).days)


def implied_tna(futuro: Optional[float], spot: float, days: int) -> Optional[float]:
    """TNA implicita: ((Futuro / Spot) - 1) * (365 / Dias)."""
    if futuro is None or not spot or days <= 0:
        return None
    return (futuro / spot - 1) * (DAY_COUNT / days)


def implied_tea(futuro: Optional[float], spot: float, days: int) -> Optional[float]:
    """TEA implicita: (Futuro / Spot) ^ (365 / Dias) - 1."""
    if futuro is None or not spot or days <= 0:
        return None
    return (futuro / spot) ** (DAY_COUNT / days) - 1


def spread(bid: Optional[float], ask: Optional[float]) -> Optional[float]:
    """Spread = Ask - Bid."""
    if bid is None or ask is None:
        return None
    return ask - bid


def base(futuro: Optional[float], spot: float) -> Optional[float]:
    """Base / forward points = Futuro - Spot."""
    if futuro is None:
        return None
    return futuro - spot


def build_analytics(frame: Dict) -> Dict:
    """Calcula la curva de TNA y estadisticas agregadas a partir de un frame.

    Demuestra el calculo quant del lado servidor (consumible en /api/analytics).
    """
    spot = float(frame.get("spot", {}).get("value") or 0)
    curve: List[Dict] = []
    tnas: List[float] = []
    spreads: List[float] = []
    volumes: List[float] = []
    ois: List[float] = []

    for c in frame.get("contracts", []):
        mark = c.get("settlement") if c.get("settlement") is not None else c.get("last")
        days = days_to_expiry(c.get("expiry", ""))
        tna = implied_tna(mark, spot, days)
        if tna is not None:
            curve.append({"ticker": c["ticker"], "tna": tna, "days": days})
            tnas.append(tna)
        sp = spread(c.get("bid"), c.get("ask"))
        if sp is not None:
            spreads.append(sp)
        volumes.append(float(c.get("volume") or 0))
        ois.append(float(c.get("openInterest") or 0))

    def avg(values: List[float]) -> Optional[float]:
        return sum(values) / len(values) if values else None

    return {
        "curve": curve,
        "stats": {
            "totalVolume": sum(volumes),
            "totalOpenInterest": sum(ois),
            "avgVolume": avg(volumes),
            "avgOpenInterest": avg(ois),
            "avgSpread": avg(spreads),
            "maxTna": max(tnas) if tnas else None,
            "minTna": min(tnas) if tnas else None,
        },
    }
