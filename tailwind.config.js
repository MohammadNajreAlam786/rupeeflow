/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rf: {
          bg: '#090D16',
          surface: '#0F172A',
          card: '#131D31',
          cardHover: '#18243E',
          border: '#1E293B',
          borderLight: '#334155',
          primary: '#10B981',
          primaryHover: '#059669',
          accent: '#6366F1',
          accentHover: '#4F46E5',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#06B6D4',
          text: '#F8FAFC',
          muted: '#94A3B8',
          dim: '#64748B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.25)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.25)',
        'glow-rose': '0 0 24px -4px rgba(239, 68, 68, 0.25)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
