# Backend PyRofex (FastAPI)

Servicio Python que conecta a **A3 Mercados** vía `pyRofex` y expone el market
data de los futuros de dólar al frontend (REST + WebSocket).

## Requisitos

- Python 3.12+
- Credenciales de A3 Mercados (usuario, password, cuenta) provistas por tu ALyC.

## Instalación

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # completar credenciales
```

## Ejecución

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
# o simplemente:  python app.py
```

## Endpoints

| Método | Ruta             | Descripción                                   |
| ------ | ---------------- | --------------------------------------------- |
| GET    | `/api/health`    | Estado de la conexión e instrumentos cargados |
| GET    | `/api/snapshot`  | Último frame de mercado (`RawMarketFrame`)    |
| GET    | `/api/analytics` | Curva de TNA + estadísticas (cálculo Python)  |
| WS     | `/ws`            | Streaming de frames en tiempo real            |

## Conectar el frontend

En `.env.local` del frontend:

```env
NEXT_PUBLIC_DATA_MODE=backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws
```

## Módulos

- `config/settings.py` — carga y tipa las variables de entorno.
- `data/pyrofex_client.py` — login, snapshot REST, subscripción y WebSocket. **Toda** la conexión vive acá.
- `data/market_store.py` — mergea las actualizaciones parciales y arma el frame.
- `data/calculations.py` — TNA, TEA, base, spread y vencimientos (espejo del cálculo del frontend).
- `app.py` — API FastAPI (REST + WebSocket) y ciclo de vida de la conexión.

> El backend **no** se despliega en Vercel: corré este servicio en una máquina
> siempre encendida (VPS, Railway, Render, etc.) o en tu localhost para datos reales.
