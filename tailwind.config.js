/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        github: {
          bg: '#010409',
          'bg-gradient': '#010409', // Default background
          card: '#161b22',
          border: '#30363d',
          'border-light': '#444c56',
          'border-lighter': '#555e6a',
          text: '#c9d1d9',
          green: '#238636',
          'green-hover': '#2ea043',
          blue: '#58a6ff',
          input: '#0d1117',
          'input-dark': '#080b10', // Darker input background
        },
        google: {
          blue: '#4285F4',
          red: '#DB4437',
          yellow: '#F4B400',
          green: '#0F9D58',
        },
        'google-gradient': 'linear-gradient(90deg, #4285F4 30%, #DB4437 60%, #F4B400 80%, #0F9D58 95%)',
        'github-gradient': 'linear-gradient(90deg, #333333 30%, #6e5494 95%)',
        'linkedin-gradient': 'linear-gradient(90deg, #0077B5 95%, #0a66c2 30%)',
        'github-header': '#161b22',
        'github-active-nav': '#0d1117',
        'github-avatar-bg': '#40464e',
        'github-header-secondary': '#0d1017', // Add this new color
        'github-tag': {
          DEFAULT: 'rgb(36, 41, 47)',
          'text': 'rgb(201, 209, 217)',
          'border': 'rgba(201, 209, 217, 0.2)'
        },
        'github-blue': '#58a6ff',
      },
      backgroundSize: {
        'google-auth-gradient': '400% 400%',
        'github-auth-gradient': '400% 400%',
        'linkedin-auth-gradient': '400% 400%',
      },
      animation: {
        'google-auth-gradient': 'google-gradient 8s linear infinite alternate',
        'github-auth-gradient': 'github-gradient 8s linear infinite alternate',
        'linkedin-auth-gradient': 'linkedin-gradient 8s linear infinite alternate',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'google-gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '100%': {
            backgroundPosition: '100% 50%',
          },
        },
        'github-gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '100%': {
            backgroundPosition: '100% 50%',
          },
        },
        'linkedin-gradient': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '100%': {
            backgroundPosition: '100% 50%',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
