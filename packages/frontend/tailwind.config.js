/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TreinaVaga: Violet Evolution Palette
        primary: {
          50: '#f3e8ff',
          100: '#e9d5ff',
          200: '#d8b4fe',
          300: '#c084fc',
          400: '#a855f7',
          500: '#8a2be2', // Light Mode Hero
          600: '#7f00ff', // Vivid Purple
          700: '#6a0dad', // Dark Mode Deep
          800: '#5d00b8',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Secondary Colors (Feedback & Accents)
        success: {
          DEFAULT: '#00C853',
          light: '#69f0ae',
          dark: '#009624',
        },
        warning: {
          DEFAULT: '#FFD600',
          light: '#ffff52',
          dark: '#c7a500',
        },
        danger: {
          DEFAULT: '#FF5252',
          light: '#ff867f',
          dark: '#c50e29',
        },
        info: {
          DEFAULT: '#00BCD4',
          light: '#62efff',
          dark: '#008ba3',
        },
        // Neutral Palette with Purple Tint for Dark Mode
        slate: {
          50: '#fcfbfd',
          100: '#f6f5f9',
          200: '#edebf3',
          300: '#dbd8e6',
          400: '#b6b0cf',
          500: '#9089b0',
          600: '#70698f',
          700: '#585270',
          800: '#1a1a2e', // Dark Mode Background
          900: '#121217', // Deeper Background
          950: '#0a0a0d',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'Open Sans', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 4px -1px rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.02)',
        'lifted': '0 5px 15px -3px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(0, 0, 0, 0.1)',
        'sharp': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}