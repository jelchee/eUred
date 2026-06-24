import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#070B16',
          secondary: '#0D1321',
          tertiary: '#141B2D',
          surface: '#1A2332',
          elevated: '#1E293B',
        },
        accent: {
          cyan: '#00D4FF',
          emerald: '#34D399',
          amber: '#F59E0B',
          red: '#EF4444',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          tertiary: '#64748B',
        },
        border: {
          DEFAULT: '#1E293B',
          emphasis: '#334155',
          focus: '#00D4FF',
        },
        status: {
          missing: '#EF4444',
          draft: '#F59E0B',
          provided: '#00D4FF',
          verified: '#34D399',
          expired: '#EF4444',
          not_applicable: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'kpi-hero': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'kpi-large': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'kpi-medium': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-1': ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        'badge': ['0.6875rem', { lineHeight: '1', fontWeight: '500' }],
      },
      spacing: {
        'card-padding': '1.5rem',
        'section-gap': '2rem',
        'component-gap': '1rem',
        'sidebar-width': '16rem',
        'sidebar-collapsed': '4rem',
        'topbar-height': '4rem',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4), 0 2px 4px rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'elevated': '0 10px 40px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
        'glow-emerald': '0 0 20px rgba(52, 211, 153, 0.3), 0 0 40px rgba(52, 211, 153, 0.1)',
      },
      borderRadius: {
        'card': '0.75rem',
        'button': '0.5rem',
        'badge': '9999px',
        'input': '0.5rem',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
} satisfies Config
