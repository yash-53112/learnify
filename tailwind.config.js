/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Sora', 'sans-serif'],
      },
      colors: {
        background: '#0c0c0f',
        surface: '#13131a',
        'surface-2': '#1a1a24',
        border: '#1f1f2e',
        'border-2': '#2a2a3d',
        'text-primary': '#f0efe8',
        'text-secondary': '#8b8b9e',
        'text-muted': '#55556a',
        accent: '#c9a84c',
        'accent-dim': '#c9a84c20',
        'accent-hover': '#d4b563',
        success: '#4caf7d',
        error: '#e05c5c',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
      },
    },
  },
  plugins: [],
};
