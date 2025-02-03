/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(0, 0%, 100%)',
        foreground: 'rgb(222.2, 84%, 4.9%)',
        primary: {
          DEFAULT: 'rgb(221.2, 83.2%, 53.3%)',
          foreground: 'rgb(210, 40%, 98%)',
        },
        secondary: {
          DEFAULT: 'rgb(210, 40%, 96.1%)',
          foreground: 'rgb(222.2, 47.4%, 11.2%)',
        },
        border: 'rgb(214.3, 31.8%, 91.4%)',
        input: 'rgb(214.3, 31.8%, 91.4%)',
        ring: 'rgb(221.2, 83.2%, 53.3%)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [],
}