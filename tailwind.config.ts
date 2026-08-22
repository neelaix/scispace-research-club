/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#75C1D9",
          "blue-dark": "#4E9FBC",
          orange: "#FD802C",
          "orange-dark": "#E2671A",
          dark: "#2A2A34",
          "dark-deep": "#1C1C24",
          "dark-soft": "#23232D",
          mist: "#EAF4F8",
          canvas: "#F6F8FA",
          ink: "#17171D",
        },
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk Variable", "Space Grotesk", "Inter", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        card: "0 1px 2px rgba(23, 23, 29, 0.04), 0 8px 24px rgba(23, 23, 29, 0.06)",
        "card-hover": "0 2px 4px rgba(23, 23, 29, 0.05), 0 20px 48px rgba(23, 23, 29, 0.12)",
        glow: "0 0 0 1px rgba(117, 193, 217, 0.35), 0 12px 40px -8px rgba(117, 193, 217, 0.45)",
        "glow-orange": "0 0 0 1px rgba(253, 128, 44, 0.35), 0 12px 40px -8px rgba(253, 128, 44, 0.45)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg, #75C1D9 0%, #8FD4E6 42%, #FD802C 100%)",
        "brand-soft":
          "radial-gradient(1200px 600px at 20% -10%, rgba(117,193,217,0.14), transparent 60%), radial-gradient(1000px 520px at 90% 10%, rgba(253,128,44,0.10), transparent 55%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out both",
        "float-slow": "floatSlow 9s ease-in-out infinite",
        "pulse-soft": "pulseSoft 4s ease-in-out infinite",
        marquee: "marquee 32s linear infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      maxWidth: {
        container: "76rem",
      },
    },
  },
  plugins: [],
};
