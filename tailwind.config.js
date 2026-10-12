/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './main.js', './src/**/*.{js,html}'],
  theme: {
    extend: {
      colors: {
        botanical: {
          cream: '#FAF8F5',
          surface: '#F5F3ED',
          card: '#FFFFFF',
          dark: '#1C3323',
          hunter: '#24422E',
          forest: '#2C5237',
          sage: '#5F7A65',
          sageLight: '#E2EAE0',
          sageBorder: '#CAD5C6',
          borderLight: '#E7ECE4',
          mint: '#86EFAC',
          lcdBg: '#15291C',
          lcdDigit: '#8CF59B',
          lcdDim: '#20432E',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Epilogue', 'sans-serif'],
        casio: ['"Share Tech Mono"', 'monospace'],
        vt: ['"VT323"', 'monospace'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'botanical-sm':
          '0 2px 8px -2px rgba(36, 66, 46, 0.06), 0 1px 3px 0 rgba(36, 66, 46, 0.04)',
        botanical:
          '0 12px 30px -8px rgba(36, 66, 46, 0.09), 0 4px 12px -2px rgba(36, 66, 46, 0.04)',
        'botanical-lg': '0 20px 40px -12px rgba(36, 66, 46, 0.14)',
        lcd: 'inset 0 3px 12px rgba(0, 0, 0, 0.6), 0 4px 14px rgba(36, 66, 46, 0.15)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/container-queries')],
}
