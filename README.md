# Monitor Profesional de Futuros de Dólar · A3 Mercados

> Dashboard de mesa de dinero para el monitoreo en tiempo real del mercado de
> **futuros de dólar** (A3 Mercados / Matba Rofex). Calcula **TNA implícita**,
> **bases**, **spreads**, **open interest**, **curvas forward** y métricas de
> **liquidez**, con visualización interactiva estilo terminal financiera.

<p align="center">
  <img src="assets/preview.png" alt="Monitor de Dólar Futuro" width="100%">
</p>

<p align="center">
  <em>Next.js 14 · TypeScript · Tailwind · Recharts &nbsp;|&nbsp; Backend Python · FastAPI · PyRofex</em>
</p>

---

## 📌 Descripción

Herramienta full‑stack que replica el flujo de trabajo de una **mesa institucional**:
una capa de datos en Python (`PyRofex`) que se conecta al mercado vía REST +
WebSocket, y un frontend en **Next.js** desplegable en Vercel que renderiza una
grilla profesional, tarjetas de mercado y un set de gráficos analíticos que se
actualizan **en vivo, sin recargar la página**.

El proyecto está diseñado para **portfolio Quant**: arquitectura modular, tipado
estricto, cálculo financiero centralizado y una estética propia inspirada en
Bloomberg / Refinitiv / CQG (sin replicar marcas).

## ✨ Características

- 🟢 **Streaming en tiempo real** — una sola conexión WebSocket; sólo se
  actualizan los componentes necesarios.
- 🧮 **Cálculo financiero** — TNA y TEA implícitas, base / forward points,
  spread, días al vencimiento, variación de open interest.
- 🃏 **5 tarjetas de mercado** — A3500, Spot, contrato *front* (detectado
  automáticamente), volumen total y open interest total, con flecha ▲/▼ y flash.
- 📊 **Tabla profesional** — 14 columnas, ordenables, con cápsula de ticker,
  coloreado por variación y números tabulares alineados.
- 📈 **4 paneles analíticos** — curva de tasas implícitas, concentración de
  liquidez (top 3), distribución de volumen y heatmap de open interest.
- 🔎 **Filtros** — por contrato, volumen mínimo y open interest mínimo.
- 📤 **Exportación** — CSV y Excel de la grilla visible.
- 🛰️ **Barra de estado técnica** — última actualización, latencia WS, mensajes
  recibidos, fuente de datos y estado `LIVE`.
- 💡 **Tooltips** — cada métrica explica su significado al pasar el mouse.
- 🖥️ **Responsive de escritorio** — optimizado para 1920×1080 y 2560×1440.

## 🛠️ Tecnologías

**Frontend (Vercel)**

| Tech         | Uso                                       |
| ------------ | ----------------------------------------- |
| Next.js 14   | App Router, render híbrido                |
| TypeScript   | Tipado estricto de todo el dominio        |
| Tailwind CSS | Theming "trading desk", animaciones       |
| Recharts     | Curva de tasas y donut de liquidez        |
| SheetJS      | Exportación a CSV / Excel                 |
| lucide-react | Iconografía                               |

**Backend (servicio aparte)**

| Tech            | Uso                                          |
| --------------- | -------------------------------------------- |
| Python 3.12+    | Capa de datos                                |
| PyRofex         | Login, subscripción y WebSocket a A3         |
| FastAPI         | API REST + WebSocket hacia el frontend       |
| Pandas / NumPy  | Soporte de cálculo                           |
| python-dotenv   | Configuración por variables de entorno       |

## 🏛️ Arquitectura

```
┌──────────────────────────┐     WS / REST      ┌───────────────────────────┐
│      A3 Mercados          │  ◄──────────────►  │   backend/ (Python)        │
│   (PyRofex - Primary)     │                    │   FastAPI + PyRofexClient  │
└──────────────────────────┘                    │   /api/snapshot  /ws       │
                                                 └─────────────┬─────────────┘
                                                  JSON (RawMarketFrame) │ WS
                                                                        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Frontend Next.js (Vercel)                                                 │
│                                                                            │
│  MarketDataProvider ──► useMarketData ──► buildSnapshot (calculations.ts)  │
│        │  simulado / backend / auto              │                         │
│        └─────────────────────────────────────────┴──► UI (cards, tabla,    │
│                                                        charts, stats)       │
└──────────────────────────────────────────────────────────────────────────┘
```

**Modos de datos** (`NEXT_PUBLIC_DATA_MODE`):

- `simulated` — feed simulado de alta fidelidad sembrado con valores reales de
  cierre. Ideal para la demo pública de Vercel (sin credenciales).
- `backend` — exige el backend PyRofex en vivo.
- `auto` *(default)* — arranca simulado al instante y **asciende** a backend si
  responde; si el backend cae, vuelve a simulado sin cortar el stream.

> PyRofex es Python y necesita un WebSocket persistente: **no corre en Vercel
> serverless**. Por eso el backend se ejecuta como servicio aparte y el frontend
> lo consume cuando está disponible.

## 📂 Estructura del proyecto

```
dolar-futuro-dashboard/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # fuentes, metadata, theming
│   ├── page.tsx              # entrada -> <Dashboard/>
│   └── globals.css           # estilos base + utilidades
├── components/
│   ├── Header.tsx            # título, fecha/hora, estado de conexión
│   ├── StatusBar.tsx         # latencia, mensajes, fuente, LIVE
│   ├── Dashboard.tsx         # orquestador (layout 70/30, filtros)
│   ├── Filters.tsx           # filtros de la tabla
│   ├── ExportButtons.tsx     # exportación CSV / Excel
│   ├── ConnectionBadge.tsx   # indicador LIVE / OFFLINE
│   ├── cards/                # SummaryCards + StatCard (con flash)
│   ├── table/                # FuturesTable (ordenable, coloreada)
│   ├── charts/               # YieldCurve, LiquidityDonut, VolumeBars, Heatmap
│   ├── stats/                # StatsPanel (estadísticas de la rueda)
│   └── ui/                   # Delta, Tooltip, Panel
├── hooks/
│   ├── useMarketData.ts      # suscripción al feed + estado de conexión
│   └── useClock.ts           # reloj en vivo
├── lib/
│   ├── types.ts              # modelo de dominio
│   ├── calculations.ts       # TNA, base, spread, stats (única fuente)
│   ├── format.ts             # formato es-AR
│   ├── export.ts             # CSV / Excel
│   └── marketData/           # provider, simulatedFeed, backendFeed, factory, seed
├── config/
│   └── settings.ts           # configuración central del frontend
├── backend/                  # servicio PyRofex (ver backend/README.md)
│   ├── app.py
│   ├── config/settings.py
│   └── data/{pyrofex_client,market_store,calculations}.py
├── assets/                   # capturas / imágenes del README
└── README.md
```

## 🖼️ Capturas esperadas

Colocá las imágenes en `assets/` y se mostrarán en este README:

- `assets/preview.png` — vista general del dashboard.
- `assets/table.png` — detalle de la grilla de contratos.
- `assets/charts.png` — paneles analíticos (curva, liquidez, heatmap).

## 🚀 Instalación y ejecución

### Frontend

```bash
# requiere Node 18.17+
npm install
cp .env.local.example .env.local     # opcional: por defecto corre en modo simulado
npm run dev                          # http://localhost:3000
```

Build de producción:

```bash
npm run build && npm start
```

### Backend (datos reales con PyRofex)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # completar credenciales A3
uvicorn app:app --port 8000
```

Luego, en `.env.local` del frontend:

```env
NEXT_PUBLIC_DATA_MODE=backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8000/ws
```

## ☁️ Deploy en Vercel

El frontend está listo para Vercel (framework detectado automáticamente: Next.js).
El backend `backend/` se ignora en el deploy (`.vercelignore`).

1. Importá el repo en Vercel.
2. (Opcional) Configurá `NEXT_PUBLIC_BACKEND_URL` / `NEXT_PUBLIC_BACKEND_WS_URL`
   si tenés el backend hosteado; si no, la demo corre en modo simulado.
3. Deploy. ✅

## ⚙️ Variables de entorno

### Frontend (`.env.local`)

| Variable                      | Descripción                                    | Default                 |
| ----------------------------- | ---------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_DATA_MODE`       | `auto` \| `backend` \| `simulated`             | `auto`                  |
| `NEXT_PUBLIC_BACKEND_URL`     | URL REST del backend PyRofex                   | `http://localhost:8000` |
| `NEXT_PUBLIC_BACKEND_WS_URL`  | URL WebSocket del backend                      | `ws://localhost:8000/ws`|

### Backend (`backend/.env`)

| Variable            | Descripción                                   |
| ------------------- | --------------------------------------------- |
| `ROFEX_USER`        | Usuario de A3 Mercados                         |
| `ROFEX_PASSWORD`    | Contraseña                                     |
| `ROFEX_ACCOUNT`     | Cuenta comitente                               |
| `ROFEX_API_URL`     | Endpoint REST                                  |
| `ROFEX_WS_URL`      | Endpoint WebSocket                             |
| `ROFEX_ENVIRONMENT` | `LIVE` o `REMARKET`                            |
| `ROFEX_TICKERS`     | Lista de tickers (vacío = autodescubre `DLR/`) |
| `ALLOWED_ORIGINS`   | Orígenes CORS permitidos                       |

## 🧠 Explicación de cada módulo

| Módulo                          | Responsabilidad                                                      |
| ------------------------------- | ------------------------------------------------------------------- |
| `lib/types.ts`                  | Modelo de dominio (contratos, frames, snapshot, stats).             |
| `lib/calculations.ts`           | **Única** fuente de cálculo: TNA, TEA, base, spread, días, stats.   |
| `lib/format.ts`                 | Formato `es-AR` (miles, decimales, %, fechas, latencia).            |
| `lib/marketData/provider.ts`    | Interfaz común de proveedor + base con suscriptores.                |
| `lib/marketData/simulatedFeed.ts` | Feed simulado (random-walk acotado sobre el seed).                |
| `lib/marketData/backendFeed.ts` | Cliente del backend PyRofex (REST + WebSocket).                     |
| `lib/marketData/index.ts`       | Factory + `ResilientProvider` (auto fallback).                      |
| `hooks/useMarketData.ts`        | Suscripción única, arma snapshot y estado de conexión.             |
| `components/*`                  | UI desacoplada de la fuente de datos.                               |
| `backend/data/pyrofex_client.py`| **Toda** la conexión a A3 (login, subscripción, WebSocket).        |
| `backend/data/market_store.py`  | Merge thread-safe + armado del frame.                               |

## 📝 Notas

- **Datos indicativos**, sólo para uso informativo. No constituye recomendación de inversión.
- Estética propia; no se utilizan logos ni marcas registradas de terceros.
- Proyecto de portfolio.

## 📄 Licencia

MIT.
