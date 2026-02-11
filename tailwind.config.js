/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0f172a",
          dark: "#020617",
          light: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular"],
      },
      borderRadius: {
        xl: "12px",
      },
    },
  },
  plugins: [],
};
