/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#6D3FD6',
          'purple-dark': '#4C2A96',
          pink: '#E14BA1',
          orange: '#F5924B',
          'navy-footer': '#0F1024',
        },
        surface: {
          lavender: '#F3EEFC',
          peach: '#FDEFE6',
          mint: '#EAF7EF',
          rose: '#FDECEF',
          blue: '#EAF1FD',
          amber: '#FDF3E3',
          gray: '#F7F7FA',
          white: '#FFFFFF',
        },
        text: {
          primary: '#14121F',
          secondary: '#6B7280',
          muted: '#9CA3AF',
        },
        border: {
          light: '#EAEAF0',
        },
        status: {
          success: { DEFAULT: '#22A559', bg: '#E7F7EC' },
          warning: { DEFAULT: '#E88A2E', bg: '#FDEEDD' },
          info: { DEFAULT: '#3B6FE0', bg: '#E8F0FE' },
          danger: { DEFAULT: '#E5484D', bg: '#FDECEF' },
        },
        star: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.06)',
        'md': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'lg': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        '2xl': '16px',
        'xl': '12px',
      }
    },
  },
  plugins: [],
}
