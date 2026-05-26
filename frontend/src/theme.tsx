import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  globalCss: {
    body: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      margin: 0,
      padding: 0,
      backgroundColor: "#0A0B0F",
      color: "#E8E8F0",
    },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#7C6AF7" },
        },
      },
    },
  },
})
