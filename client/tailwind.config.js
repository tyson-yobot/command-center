/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        background: "#000000",
        card: "#1a1a1a", // charcoal card background
        electric: "#0d82da", // electric blue
        silver: "#c3c3c3",
        white: "#ffffff",
      },
      boxShadow: {
        blue: "0 0 8px #0d82da",
        silver: "0 0 8px #c3c3c3",
      },
      borderRadius: {
        xl: "1rem",
        '2xl': "1.5rem",
      }
    }
  },
  plugins: []
}
