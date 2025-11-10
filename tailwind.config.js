/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'rocket-liftoff': 'rocket-liftoff 0.8s ease-in-out',
        'rocket-landing': 'rocket-landing 0.6s ease-in-out',
      },
      keyframes: {
        'rocket-liftoff': {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-30px) scale(1.2)' },
          '100%': { transform: 'translateY(-60px) scale(0.5) rotate(45deg)', opacity: '0' },
        },
        'rocket-landing': {
          '0%': { transform: 'translateY(-60px) scale(0.5) rotate(-45deg)', opacity: '0' },
          '50%': { transform: 'translateY(-30px) scale(1.2)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

