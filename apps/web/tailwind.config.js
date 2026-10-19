/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'], // dark mode devre dışı bırakıldı (light only)
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
        // === MARKA RENKLERİ (Değişmedi, tüm temalarda aynı) ===
        brand: {
          DEFAULT: '#059669',  // Yeşil - elektrik enerjisi
          light: '#10B981',
          dark: '#047857',
          soft: '#D1FAE5',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
          soft: '#FEF3C7',
        },

        // === LIGHT MODE RENKLERİ (varsayılan) ===
        background: {
          DEFAULT: '#FFFFFF',  // Beyaz
          surface: '#F9FAFB',  // Çok açık gri (kart)
          elevated: '#FFFFFF',  // Yükseltilmiş (dropdown)
          hover: '#F3F4F6',    // Hover
        },
        surface: {
          light: '#FFFFFF',
          DEFAULT: '#F9FAFB',
          muted: '#F3F4F6',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
        },
        text: {
          primary: '#111827',   // Koyu gri / siyah
          secondary: '#6B7280', // Orta gri
          muted: '#9CA3AF',      // Açık gri
        },

        // === DURUM RENKLERİ ===
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',

        // === shadcn uyumluluğu ===
        foreground: '#111827',
        primary: {
          DEFAULT: '#059669',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          foreground: '#111827',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        input: '#E5E7EB',
        ring: '#059669',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(5, 150, 105, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(5, 150, 105, 0)' },
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
        'gradient-brand': 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
        'gradient-radial': 'radial-gradient(ellipse at top, #F9FAFB 0%, #FFFFFF 100%)',
        // Kraft paper texture - subtle warm noise
        'kraft-paper':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0.08 0' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' /%3E%3C/svg%3E\"), linear-gradient(180deg, #FAF7F2 0%, #F5EFE3 100%)",
        'kraft-paper-light':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0.04 0' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' /%3E%3C/svg%3E\"), linear-gradient(180deg, #FFFFFF 0%, #FAF7F2 100%)",
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(5, 150, 105, 0.25)',
        'glow-accent': '0 0 20px rgba(245, 158, 11, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px 0 rgba(0, 0, 0, 0.1), 0 2px 6px 0 rgba(0, 0, 0, 0.06)',
        // Yeni — özgün derinlik gölgeleri
        'kraft': '0 1px 1px rgba(60, 40, 20, 0.04), 0 2px 4px rgba(60, 40, 20, 0.06), 0 8px 16px -4px rgba(60, 40, 20, 0.08)',
        'kraft-hover': '0 2px 4px rgba(60, 40, 20, 0.06), 0 8px 16px rgba(60, 40, 20, 0.1), 0 20px 40px -8px rgba(60, 40, 20, 0.14)',
        'pop': '0 4px 12px rgba(0, 0, 0, 0.08), 0 24px 48px -12px rgba(0, 0, 0, 0.15)',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(5, 150, 105, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(5, 150, 105, 0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Yeni — texture'lar için
        'blob-float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(2%, -2%) scale(1.03)' },
          '66%': { transform: 'translate(-2%, 1%) scale(0.97)' },
        },
        'tilt': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(0.5deg)' },
        },
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.4) rotate(-12deg)' },
          '60%': { opacity: '1', transform: 'scale(0.95) rotate(-3deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-6deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite',
        shimmer: 'shimmer 2s linear infinite',
        // Yeni
        'blob-float': 'blob-float 8s ease-in-out infinite',
        tilt: 'tilt 4s ease-in-out infinite',
        'stamp-in': 'stamp-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
