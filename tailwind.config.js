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
        primary: '#78B3CE',
        secondary: '#C9E6F0',
        destructive:  '#FBF8EF',
        orange: "#F96E2A"
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
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
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
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
      dropShadow: {
        title: '.25vw .25vw 0 rgb(252 165 165 / var(--tw-text-opacity))',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
}
