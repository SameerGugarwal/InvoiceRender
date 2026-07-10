/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        surface: '#F8FAFC',
        heading: '#1E293B',
        muted: '#64748B',
      },
      boxShadow: {
        card: '0 4px 6px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        input: '8px',
      },
    },
  },
  plugins: [],
};
