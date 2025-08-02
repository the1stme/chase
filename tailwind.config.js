/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bank of America brand colors
        'boa-blue': {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da7ff',
          400: '#1a8eff',
          500: '#0065B3', // Primary Bank of America blue
          600: '#005299',
          700: '#003f80',
          800: '#002c66',
          900: '#00194d',
        },
        'boa-red': {
          50: '#fef2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f87171',
          500: '#E61030', // Bank of America red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Override default blue with Bank of America blue
        blue: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da7ff',
          400: '#1a8eff',
          500: '#0065B3',
          600: '#005299',
          700: '#003f80',
          800: '#002c66',
          900: '#00194d',
        },
        // Keep red as Bank of America red
        red: {
          50: '#fef2f2',
          100: '#fde8e8',
          200: '#fbd5d5',
          300: '#f8b4b4',
          400: '#f87171',
          500: '#E61030',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
    },
  },
  plugins: [],
};
