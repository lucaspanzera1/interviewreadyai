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
          50: 'rgb(var(--color-primary-50) / <alpha-value>)',
          100: 'rgb(var(--color-primary-100) / <alpha-value>)',
          200: 'rgb(var(--color-primary-200) / <alpha-value>)',
          300: 'rgb(var(--color-primary-300) / <alpha-value>)',
          400: 'rgb(var(--color-primary-400) / <alpha-value>)',
          500: 'rgb(var(--color-primary-500) / <alpha-value>)', // Light Mode Hero
          600: 'rgb(var(--color-primary-600) / <alpha-value>)', // Vivid Purple
          700: 'rgb(var(--color-primary-700) / <alpha-value>)', // Dark Mode Deep
          800: 'rgb(var(--color-primary-800) / <alpha-value>)',
          900: 'rgb(var(--color-primary-900) / <alpha-value>)',
          950: 'rgb(var(--color-primary-950) / <alpha-value>)',
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
          800: 'rgb(var(--color-slate-800) / <alpha-value>)', // Dark Mode Background
          900: 'rgb(var(--color-slate-900) / <alpha-value>)', // Deeper Background
          950: 'rgb(var(--color-slate-950) / <alpha-value>)',
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