/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cuvva: {
          bg:      '#050224',
          card:    '#0D0B2B',
          purple:  '#6B35CF',
          violet:  '#7C3AED',
          cyan:    '#00C8FF',
          green:   '#00E096',
          amber:   '#FFB800',
          red:     '#FF4B4B',
          border:  'rgba(255,255,255,0.08)',
          muted:   '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cuvva': 'linear-gradient(135deg, #6B35CF 0%, #00C8FF 100%)',
        'gradient-card':  'linear-gradient(145deg, #0D0B2B 0%, #110E3A 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(107, 53, 207, 0.4)',
        'glow-cyan':   '0 0 20px rgba(0, 200, 255, 0.3)',
        'card':        '0 4px 24px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}