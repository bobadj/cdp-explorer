/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'body': ['"DM Sans"']
      },
      backgroundImage: {
        decorative: 'linear-gradient(216.56deg, #383FDE 5.32%, #8444D5 94.32%);'
      },
      colors: {
        primary: '#3772FF',
        secondary: '#777E90',
        surface: '#F7F7F7',
        info: '#2E72D2',
        critical: '#D33535',
        warning: '#FABE3C',
        success: '#58BD7D'
      }
    },
  },
  plugins: [],
}

