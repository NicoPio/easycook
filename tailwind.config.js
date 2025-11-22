/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      // Minimum touch target size for mobile accessibility
      minHeight: {
        'touch': '44px'
      },
      minWidth: {
        'touch': '44px'
      }
    }
  },
  plugins: []
}
