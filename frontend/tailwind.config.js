/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '72': '18rem',
      },
      colors: {
        'custom-brown': '#8C592B',
        'custom-bg': '#FDF7F2',
        'custom-light': '#FBE9D7',
      },
    },
  },
  plugins: [],
}
