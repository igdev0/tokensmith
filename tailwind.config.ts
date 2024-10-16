import type {Config} from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        overlay: {
          light: "rgba(255,255,255,.5)",
          dark: "rgba(0,0,0,.5)"
        }
        // primary: {
        //   light: '#3B82F6',  // Light mode primary color
        //   dark: '#1E40AF',   // Dark mode primary color
        // },
      },
    },
  },
  plugins: [],
};
export default config;
