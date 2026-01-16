import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Outfit', sans-serif" },
        body: { value: "'Outfit', sans-serif" },
        mono: { value: "'Fira Code', monospace" },
      },
      colors: {
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          200: { value: "#bfdbfe" },
          300: { value: "#93c5fd" },
          400: { value: "#60a5fa" },
          500: { value: "#3b82f6" }, // Secondary
          600: { value: "#2563eb" }, // Primary
          700: { value: "#1d4ed8" },
          800: { value: "#1e40af" },
          900: { value: "#1e3a8a" },
        },
        accent: {
          50: { value: "#fff7ed" },
          100: { value: "#ffedd5" },
          200: { value: "#fed7aa" },
          300: { value: "#fdba74" },
          400: { value: "#fb923c" },
          500: { value: "#f97316" }, // CTA
          600: { value: "#ea580c" },
          700: { value: "#c2410c" },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
            DEFAULT: { value: { base: "transparent", _dark: "transparent" } }, // Let body gradient show details
            subtle: { value: { base: "whiteAlpha.500", _dark: "blackAlpha.500" } },
            panel: { value: { base: "whiteAlpha.800", _dark: "rgba(30, 41, 59, 0.7)" } }, // Frosted glass
            input: { value: { base: "whiteAlpha.600", _dark: "rgba(15, 23, 42, 0.6)" } },
        },
        fg: {
            DEFAULT: { value: { base: "#1E293B", _dark: "#F8FAFC" } }, // Slate 800 / Slate 50
            muted: { value: { base: "#64748B", _dark: "#94A3B8" } }, // Slate 500 / Slate 400
        },
        border: {
            DEFAULT: { value: { base: "#E2E8F0", _dark: "#334155" } }, // Slate 200 / Slate 700
            subtle: { value: { base: "#F1F5F9", _dark: "#1E293B" } },
        }
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
