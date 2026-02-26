/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(42, 80%, 45%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
        secondary: {
          DEFAULT: 'hsl(220, 16%, 93%)',
          foreground: 'hsl(220, 20%, 15%)',
        },
        background: 'hsl(220, 20%, 97%)',
        foreground: 'hsl(220, 20%, 10%)',
        muted: {
          DEFAULT: 'hsl(220, 14%, 94%)',
          foreground: 'hsl(220, 10%, 45%)',
        },
        border: 'hsl(220, 14%, 88%)',
        sidebar: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          foreground: 'hsl(220, 20%, 15%)',
          border: 'hsl(220, 14%, 90%)',
          accent: 'hsl(220, 16%, 95%)',
        },
        success: 'hsl(150, 60%, 40%)',
        warning: 'hsl(35, 90%, 50%)',
      },
    },
  },
  plugins: [],
};
