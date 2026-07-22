/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1565c0', light: '#e3f2fd', dark: '#0d47a1' },
        success:  { DEFAULT: '#2e7d32', light: '#e8f5e9' },
        danger:   { DEFAULT: '#c62828', light: '#ffebee' },
        warning:  { DEFAULT: '#e65100', light: '#fff3e0' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    }
  },
  plugins: [],
}