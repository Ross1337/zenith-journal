/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,js,jsx}', './components/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          void: '#080910',
          raised: '#0e1018',
          high: '#12151f',
          overlay: '#161a28',
        },
        border: {
          subtle: '#1e2338',
          default: '#232a44',
          strong: '#2a3050',
        },
        text: {
          primary: '#eef1fa',
          secondary: '#9ba5be',
          muted: '#6e7790',
        },
        arctic: {
          teal: '#42E2B8',
          sky: '#5B8EFF',
          'teal-glow': 'rgba(66,226,184,0.15)',
          'sky-glow': 'rgba(91,142,255,0.15)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
    },
  },
  plugins: [],
};
