import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    '#1A2B49',
        saffron: '#FF9933',
        'india-green': '#138808',
        border:  '#D1D5DB',
        'border-dark': '#9CA3AF',
        'fail':       '#DC2626',
        'fail-bg':    '#FEF2F2',
        'fail-text':  '#991B1B',
        'pass':       '#15803D',
        'pass-bg':    '#F0FDF4',
        'pass-text':  '#14532D',
        'warn':       '#B45309',
        'warn-bg':    '#FFFBEB',
        'warn-text':  '#92400E',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0px', // Government portals use sharp corners
      },
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
}

export default config
