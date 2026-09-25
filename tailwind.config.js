/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#050B1F',
        surface: '#0B1430',
        surfaceAlt: '#111D3D',
        border: '#1E2C52',
        brand: {
          navy: '#050B1F',
          blue: '#2563EB',
          cyan: '#22D3EE',
          orange: '#FF7A18',
          amber: '#FFC02E',
        },
        gold: {
          DEFAULT: '#FF9D1F',
          soft: '#FFD27A',
        },
        gain: '#2FAE60',
        loss: '#E2574C',
        ink: {
          primary: '#F3F7FF',
          muted: '#93A4C7',
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
