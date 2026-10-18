/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Marka renkleri (Electric Forge paleti)
        brand: {
          DEFAULT: '#00D9A3',
          light: '#00F0B8',
          dark: '#00B887',
        },
        accent: {
          DEFAULT: '#FFB800',
          light: '#FFC933',
          dark: '#FF8A00',
        },
        // Koyu tema (birincil)
        background: {
          DEFAULT: '#0A0E1A',
          surface: '#131826',
          elevated: '#1C2333',
          hover: '#252D3F',
        },
        // Açık tema
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#F8FAFC',
          muted: '#F1F5F9',
        },
        // Border
        border: {
          DEFAULT: '#2A3349',
          light: '#E2E8F0',
        },
        // Metin
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          inverse: '#0A0E1A',
        },
        // Durum
        success: '#00D9A3',
        warning: '#FFB800',
        error: '#FF3D71',
        info: '#3B82F6',
        // shadcn uyumluluğu
        foreground: '#F8FAFC',
        primary: {
          DEFAULT: '#00D9A3',
          foreground: '#0A0E1A',
        },
        secondary: {
          DEFAULT: '#1C2333',
          foreground: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#1C2333',
          foreground: '#94A3B8',
        },
        destructive: {
          DEFAULT: '#FF3D71',
          foreground: '#F8FAFC',
        },
        card: {
          DEFAULT: '#131826',
          foreground: '#F8FAFC',
        },
        popover: {
          DEFAULT: '#1C2333',
          foreground: '#F8FAFC',
        },
        input: '#1C2333',
        ring: '#00D9A3',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 217, 163, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0, 217, 163, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00D9A3 0%, #00F0B8 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0A0E1A 0%, #1C2333 100%)',
        'gradient-radial': 'radial-gradient(ellipse at top, #1C2333 0%, #0A0E1A 100%)',
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(0, 217, 163, 0.3)',
        'glow-accent': '0 0 20px rgba(255, 184, 0, 0.3)',
        'card': '0 4px 24px -1px rgba(0, 0, 0, 0.3), 0 2px 8px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 32px -2px rgba(0, 0, 0, 0.4), 0 4px 16px -2px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
