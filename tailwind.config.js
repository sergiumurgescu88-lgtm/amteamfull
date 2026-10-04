/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.3' }],
        'xs': ['12px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.4' }],
        'xl': ['20px', { lineHeight: '1.3' }],
        '2xl': ['24px', { lineHeight: '1.2' }],
      },
      lineHeight: {
        'body': '1.6',
        'heading': '1.2',
        'tight': '1.1',
      },
      letterSpacing: {
        'normal': '0em',
        'mobile-track': '0.01em',
        'desktop-track': '0.04em',
      },
      fontWeight: {
        regular: '400',
        semibold: '600',
        extrabold: '800',
      },
    },
  },
  plugins: [],
};
