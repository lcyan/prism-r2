/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#007AFF', // iOS Blue
                    hover: '#0062CC',
                },
                ios: {
                    bg: '#F2F2F7',
                    card: 'rgba(255, 255, 255, 0.7)',
                    darkBg: '#1C1C1E',
                    darkCard: 'rgba(28, 28, 30, 0.7)',
                }
            },
            backdropBlur: {
                ios: '20px',
            },
            borderRadius: {
                ios: '12px',
            }
        },
    },
    plugins: [],
}
