/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: "#ea580c",
                primaryLight: "#fb923c",
                dark: "#0f172a",
                light: "#f8fafc",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
                'wave': 'wave 2s infinite ease-out', // Add wave animation
            },
            keyframes: {
                wave: {
                    '0%': { transform: 'scale(1)', opacity: '0.6' },
                    '100%': { transform: 'scale(1.5)', opacity: '0' },
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            }
        },
    },
    plugins: [],
}
