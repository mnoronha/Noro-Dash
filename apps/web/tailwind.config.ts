import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        sea: "#14B8A6",
        coral: "#F97316",
        mist: "#F4F7F9",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
