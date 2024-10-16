import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// New custom colors
  			'dark-bg': '#05060f',
  			'body-normal': 'rgba(200, 212, 234, 0.78)',
  			'body-loud': '#c7d3ea',
  			'body-muted': '#c7d3eaa3',
  			'blue-loud': '#232425',
  			'blue-6': 'rgba(186, 214, 247, 0.06)',
  			'blue-12': 'rgba(186, 215, 247, 0.12)',
  			'blue-24': 'rgba(186, 214, 247, 0.24)',
  			'blue-90': 'rgba(186, 214, 247, 0.9)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backgroundImage: {
  			'gradient-bg-6': 'linear-gradient(0deg, rgba(216, 236, 248, 0.06), rgba(152, 192, 239, 0.06))',
  			'gradient-loud-100': 'linear-gradient(0deg, #d8ecf8, #98c0ef)',
  			'gradient-subdued-12': 'linear-gradient(0deg, rgba(216, 236, 248, 0.12), rgba(152, 192, 239, 0.12))',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
