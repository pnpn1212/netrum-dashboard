/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px", 
        sm: "4px", 
      },
      colors: {
        "gradient-start": "#1e3a8a",
        "gradient-middle": "#4f46e5",
        "gradient-end": "#000000",
      },
    },
  },
  plugins: [],
};
