/** @type {import('tailwindcss').Config} */
    export default {
      content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
      theme: {
        extend: {
          colors: {
            github: {
              bg: '#010409',
              card: '#161b22',
              border: '#30363d',
              'border-light': '#444c56',
              'border-lighter': '#555e6a',
              text: '#c9d1d9',
              green: '#238636',
              'green-hover': '#2ea043',
              blue: '#58a6ff',
              input: '#0d1117',
            },
          },
        },
      },
      plugins: [],
      darkMode: 'class',
    };
