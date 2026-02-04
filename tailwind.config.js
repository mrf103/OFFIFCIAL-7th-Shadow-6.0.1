export default {
  darkMode: ["class"],
  content: [
    './Pages/**/*.{js,jsx}',
    './Components/**/*.{js,jsx}',
    './index.html',
    './*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Arabic palette
        primary: {
          DEFAULT: '#7a4b2a',
          50: '#f7f1e3',
          500: '#7a4b2a',
          600: '#5f331a',
        },
        secondary: {
          DEFAULT: '#b88b4a',
          500: '#b88b4a',
        },
        accent: {
          DEFAULT: '#2f6b5f',
          500: '#2f6b5f',
        },
        shadow: {
          bg: '#f7f1e3',
          surface: '#f0e6d8',
          card: '#e6dbc8',
          primary: '#7a4b2a',
          secondary: '#b88b4a',
          accent: '#2f6b5f',
          text: '#2f2416',
          muted: '#6f6254',
          border: '#d8c7b2',
          hover: '#efe3d3',
        },
        glow: {
          green: 'rgba(122, 75, 42, 0.18)',
          pink: 'rgba(184, 139, 74, 0.18)',
          blue: 'rgba(47, 107, 95, 0.14)',
          purple: 'rgba(120, 90, 60, 0.14)',
        },
      },
      fontFamily: {
        sans: ['Noto Naskh Arabic', 'Cairo', 'Playfair Display', 'serif'],
        arabic: ['Noto Naskh Arabic', 'Cairo', 'serif'],
        vintage: ['Playfair Display', 'Noto Naskh Arabic', 'serif'],
        cyber: ['Orbitron', 'Rajdhani', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 255, 136, 0.5)',
        'neon-pink': '0 0 20px rgba(255, 0, 128, 0.5)',
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(138, 43, 226, 0.5)',
        'cyber': '0 4px 20px rgba(0, 255, 136, 0.2)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "glow": {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.8', filter: 'brightness(1.2)' },
        },
        "scan": {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        "pulse-neon": {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' },
        },
        "slide-in": {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow": "glow 2s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite",
        "slide-in": "slide-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
