/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
        },
        sidebar: {
          DEFAULT: '#111827',
          hover: '#1F2937',
        },
        surface: '#F3F4F6',
        card: '#FFFFFF',
        muted: '#6B7280',
        border: '#E5E7EB',
        accent: '#7C3AED',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        info: '#0891B2',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.75rem',
        input: '0.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
