/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Chase brand colors
        'chase-blue': {
          50: '#e7f2fc',
          100: '#cfe5f9',
          200: '#a0cbf3',
          300: '#72b0ec',
          400: '#4396e6',
          500: '#117ACA', // Primary Chase blue
          600: '#0f6db6',
          700: '#0d5ba0',
          800: '#0b4b86',
          900: '#08365f',
        },
        // Override default blue with Chase blue scale
        blue: {
          50: '#e7f2fc',
          100: '#cfe5f9',
          200: '#a0cbf3',
          300: '#72b0ec',
          400: '#4396e6',
          500: '#117ACA',
          600: '#0f6db6',
          700: '#0d5ba0',
          800: '#0b4b86',
          900: '#08365f',
        },
      },
    },
  },
  plugins: [],
};
