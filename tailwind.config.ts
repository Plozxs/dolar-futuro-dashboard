import type { Config } from "tailwindcss";

/**
 * Paleta "trading desk": azul profundo, blancos, grises frios y detalles celestes.
 * Inspirada en terminales institucionales (Bloomberg / Refinitiv / CQG) sin replicar marcas.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fondos
        base: "#070b16",
        surface: "#0c1322",
        "surface-2": "#111a2e",
        "surface-3": "#16223b",
        // Bordes / lineas
        line: "#1c2942",
        "line-soft": "#172132",
        // Acentos
        brand: {
          DEFAULT: "#2f6bff",
          600: "#2457e6",
          700: "#1d49c7",
        },
        sky: {
          soft: "#7dd3fc",
          DEFAULT: "#38bdf8",
          deep: "#0ea5e9",
        },
        // Texto
        ink: "#eef3fb",
        "ink-muted": "#9fb0c9",
        "ink-faint": "#64748b",
        // Semaforo
        up: "#22c55e",
        "up-soft": "rgba(34,197,94,0.12)",
        down: "#ef4444",
        "down-soft": "rgba(239,68,68,0.12)",
        flat: "#94a3b8",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xl: "0.85rem",
        "2xl": "1.1rem",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 18px 40px -24px rgba(0,0,0,0.8)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -18px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(47,107,255,0.25), 0 8px 28px -10px rgba(47,107,255,0.35)",
      },
      keyframes: {
        "flash-up": {
          "0%": { backgroundColor: "rgba(34,197,94,0.28)" },
          "100%": { backgroundColor: "transparent" },
        },
        "flash-down": {
          "0%": { backgroundColor: "rgba(239,68,68,0.28)" },
          "100%": { backgroundColor: "transparent" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.82)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flash-up": "flash-up 0.7s ease-out",
        "flash-down": "flash-down 0.7s ease-out",
        "pulse-live": "pulse-live 1.6s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
