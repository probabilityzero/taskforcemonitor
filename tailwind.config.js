/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        github: {
          bg: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          text: '#c9d1d9',
          green: '#238636',
          'green-hover': '#2ea043',
          blue: '#58a6ff',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
