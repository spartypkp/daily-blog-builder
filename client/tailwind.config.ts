/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "media",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				archivenarrow: ["Archivo Narrow", "sans-serif"],
				barlow: ["Barlow", "sans-serif"],
				cardo: ["Cardo", "serif"],
				cinzel: ["Cinzel", "serif"],
				courierp: ["Courier Prime", "monospace"],
				cutivemono: ["Cutive Mono", "monospace"],
				dmsans: ["DM Sans", "sans-serif"],
				fauna: ["Fauna One", "serif"],
				gotu: ["Gotu", "sans-serif"],
				header: ["IM Fell Great Primer", "serif"],
				imfellgreat: ["IM Fell Great Primer SC", "serif"],
				italiana: ["Italiana", "sans-serif"],
				josefinsans: ["Josefin Sans", "sans-serif"],
				montserrat: ["Montserrat", "sans-serif"],
				opensans: ["Open Sans", "sans-serif"],
				oswald: ["Oswald", "sans-serif"],
				quicksand: ["Quicksand", "sans-serif"],
				body: ["Raleway", "sans-serif"],
				robotoslab: ["Roboto Slab", "serif"],
			},

			colors: {
				mainbg: "#FAF5E6",
				lightbg: "#FCF9F0",
				extralightbg: "#FDFCFD",
				darkgreen: "#2F3F3D",
				olivebrown: "#4A4643",
				bonewhite: "E4E0D2",
				seasaltwhite: "#F8F8FA",
				lightblue: "#B2D2DA",
				"user-color": "#B2d2da",
				"response-color": "#ECECEC",
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				gridTemplateColumns: {
					sidebar: "300px auto", //for sidebar layout
					"sidebar-collapsed": "64px auto", //for collapsed sidebar layout
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
