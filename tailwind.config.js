/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // thêm ts/tsx cho tương thích nếu dùng TS
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "2px", // giữ như cũ
        sm: "4px", // thêm tùy chọn mờ nhỏ
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
