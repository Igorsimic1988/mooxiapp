
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "node_modules/@premieroctet/next-admin/dist/**/*.{js,ts,jsx,tsx}",
    "./nextAdminOptions.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {},
  presets: [require("@premieroctet/next-admin/preset")],
};
  