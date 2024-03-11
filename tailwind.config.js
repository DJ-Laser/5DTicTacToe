import colors from "tailwindcss/colors";
/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},

    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.zinc,
      red: colors.red,
      blue: colors.blue,
    },
  },
  plugins: [],
};
