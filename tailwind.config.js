/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false, // keep Bootstrap/Paragon safe
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
