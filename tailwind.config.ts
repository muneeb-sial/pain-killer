import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#101828",
        muted: "#667085",
        line: "#E4E7EC",
        surface: "#FFFFFF",
        canvas: "#F8FAFC",
        brand: "#0F766E",
        accent: "#D97706",
        success: "#16A34A",
        danger: "#DC2626"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
