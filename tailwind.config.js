/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			primary: {
  				DEFAULT: '#6366F1',
  				light: '#818CF8',
  				dark: '#4F46E5'
  			},
  			'background-light': '#F9FAFB',
  			'background-dark': '#111827',
  			'text-light': '#1F2937',
  			'text-dark': '#F9FAFB',
  			'card-light': '#FFFFFF',
  			'card-dark': '#1F2937',
  			'border-light': '#E5E7EB',
  			'border-dark': '#374151',
  			maize: '#FBBF24',
  			ivory: '#FFFFF0',
  			'sandy-brown': '#F4A460',
  			'dark-purple': '#3B0066',
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			display: ['Inter', 'sans-serif'],
  			sans: ['Inter', 'sans-serif']
  		},
  		borderRadius: {
  			lg: '0.75rem',
  			xl: '1rem',
  			'2xl': '1.5rem'
  		}
  	}
  },
  plugins: [],
}