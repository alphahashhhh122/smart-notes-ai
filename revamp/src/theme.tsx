import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  globalCss: {
    "@import": [
      "url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap')",
    ],
    html: {
      fontSize: "16px",
    },
    body: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      margin: 0,
      padding: 0,
      bg: "#0A0B0F",
      color: "#E8E8F0",
      WebkitFontSmoothing: "antialiased",
    },
    "h1, h2, h3, h4": {
      fontFamily: "'Syne', sans-serif",
    },
    "::-webkit-scrollbar": {
      width: "5px",
    },
    "::-webkit-scrollbar-track": {
      background: "#0A0B0F",
    },
    "::-webkit-scrollbar-thumb": {
      background: "#2A2B3D",
      borderRadius: "10px",
    },
    ".main-link": {
      color: "#7C6AF7",
      fontWeight: "bold",
    },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#7C6AF7" },
          bg: { value: "#0A0B0F" },
          surface: { value: "#111218" },
          raised: { value: "#1A1B26" },
          border: { value: "#22232E" },
          accent: { value: "#7C6AF7" },
          accentMuted: { value: "#3D3580" },
          text: { value: "#E8E8F0" },
          textMuted: { value: "#7878A0" },
          success: { value: "#34D399" },
          warning: { value: "#FBBF24" },
          danger: { value: "#F87171" },
        },
      },
      fonts: {
        heading: { value: "'Syne', sans-serif" },
        body: { value: "'DM Sans', sans-serif" },
        mono: { value: "'JetBrains Mono', monospace" },
      },
    },
  },
})
