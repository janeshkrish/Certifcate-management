/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#e6e7ee",
        ink: "#1f2937",
        muted: "#6b7280",
        accent: "#2563eb",
        shadowDark: "#c5c6cc",
        shadowLight: "#ffffff",
        successSoft: "#d8f3e5",
        dangerSoft: "#f8dcdf",
        accentSoft: "#dbe8ff"
      },
      borderRadius: {
        panel: "20px",
        soft: "16px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"]
      },
      boxShadow: {
        neo: "14px 14px 28px #c5c6cc, -14px -14px 28px #ffffff",
        neoSoft: "10px 10px 22px rgba(197, 198, 204, 0.9), -10px -10px 22px rgba(255, 255, 255, 0.95)",
        neoInset: "inset 8px 8px 16px #c5c6cc, inset -8px -8px 16px #ffffff"
      }
    }
  },
  plugins: []
};
