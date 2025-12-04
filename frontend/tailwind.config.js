/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './contexts/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f8ff',
          100: '#dbeffd',
          200: '#b8defb',
          300: '#86c7f7',
          400: '#4faaf2',
          500: '#1c8cec',
          600: '#0d6cd6',
          700: '#0c55ac',
          800: '#0e4789',
          900: '#113e70'
        }
      }
    }
  },
  plugins: []
}
