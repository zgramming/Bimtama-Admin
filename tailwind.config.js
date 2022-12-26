/** @type {import('tailwindcss').Config} */

console.log({
  message: "Tailwind.config.js loaded configuration",
  config: {
    primary: "#277BC0",
    accent: "#f58b4f",
    success: "#00D8AC",
    info: "#5CB8E4",
    warning: "#ffb200",
    error: "#FF4A4A",
  },
});

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "nunito-sans": ["Nunito", "sans-serif"],
      },
      colors: {
        primary: "#277BC0",
        accent: "#f58b4f",
        success: "#00D8AC",
        info: "#5CB8E4",
        warning: "#ffb200",
        error: "#FF4A4A",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
