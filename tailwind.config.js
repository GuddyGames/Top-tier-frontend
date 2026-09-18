/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0E14',
        surface: '#12161F',
        surfaceAlt: '#171C27',
        border: '#232838',
        gold: {
          DEFAULT: '#C9A24B',
          soft: '#E8D9AE',
        },
        gain: '#2FAE60',
        loss: '#E2574C',
        ink: {
          primary: '#EDEFF3',
          muted: '#8890A0',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
