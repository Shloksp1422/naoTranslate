/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}', // Including the 'app' directory
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      // If using a 'src' directory:
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }
  