// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ffb648',
        'primary-dark': '#ff8f2e',
        'bg-dark': '#090d10',
        'bg-panel': 'rgba(15, 20, 24, 0.94)',
        'text-muted': 'rgba(244, 247, 245, 0.58)',
        'text-light': '#f4f7f5',
        'green-bright': '#74dfa2',
        'blue-bright': '#62c7ee',
        'red-bright': '#ff7068',
        'purple-bright': '#b48eed',
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-ready': 'readyPulse 2.2s ease-out 1',
        'toast-in': 'toastIn 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        'lock-banner': 'lockBannerIn 0.2s ease both',
        'formation-pulse': 'formationPulse 0.7s ease-out',
        'pop-in': 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'label-in': 'labelIn 0.3s ease both',
        'dd-open': 'ddOpen 0.18s cubic-bezier(0.22, 1, 0.36, 1) both',
        'dd-close': 'ddClose 0.16s cubic-bezier(0.4, 0, 1, 1) both',
        'arm-pulse': 'armPulse 1.6s ease-in-out infinite',
      },
      keyframes: {
        readyPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(116,223,162,0.35)' },
          '50%': { boxShadow: '0 0 0 6px rgba(116,223,162,0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(-12px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        lockBannerIn: {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        formationPulse: {
          '0%': { opacity: '0.85', transform: 'scale(0.86)' },
          '100%': { opacity: '0', transform: 'scale(1.18)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0.2' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        labelIn: {
          '0%': { opacity: '0', transform: 'translateY(-3px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ddOpen: {
          '0%': { opacity: '0', transform: 'translateY(-6px) scaleY(0.92)' },
          '100%': { opacity: '1', transform: 'translateY(0) scaleY(1)' },
        },
        ddClose: {
          '0%': { opacity: '1', transform: 'translateY(0) scaleY(1)' },
          '100%': { opacity: '0', transform: 'translateY(-6px) scaleY(0.96)' },
        },
        armPulse: {
          '0%, 100%': { boxShadow: '0 0 0 7px rgba(255,182,72,0.16)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,182,72,0.16)' },
        },
      },
    },
  },
  plugins: [],
};