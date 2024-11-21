/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: '#78B3CE',
        primary: '#78B3CE',
        secondary: '#C9E6F0',
        destructive:  '#FBF8EF',
        orange: "#F96E2A"
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      keyframes: {
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromBottom: {
          '0%': {transform: 'translateY(100%)', opacity:'0'},
          '100%': {transform: 'translateY(0)', opacity:'1'}
        }
      },
      animation: {
        'slideInFromLeft': 'slideInFromLeft 1s ease-out',
        'slideInFromBottom': 'slideInFromBottom 1s ease-out'
      },
      fontFamily: {
        rounded: [
          'ui-rounded',
          'Hiragino Maru Gothic ProN',
          'Quicksand',
          'Comfortaa',
          'Manjari',
          'Arial Rounded MT',
          'Arial Rounded MT Bold',
          'Calibri',
          'source-sans-pro',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
