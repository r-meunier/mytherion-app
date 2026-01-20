import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'starfield': "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 80%), url('https://www.transparenttextures.com/patterns/stardust.png')",
      },
    },
  },
  plugins: [],
};

export default config;
