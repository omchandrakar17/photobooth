/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sketch: ['var(--font-sketch)', 'cursive'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'flash': 'flash 0.3s ease-out',
        'countdown': 'countdown 1s ease-in-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'wiggle': 'wiggle 0.4s ease-in-out',
        'stamp': 'stamp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'confetti-fall': 'confettiFall 1s ease-out forwards',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0' },
          '30%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        countdown: {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '30%': { transform: 'scale(1)', opacity: '1' },
          '80%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.5)', opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '60%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
