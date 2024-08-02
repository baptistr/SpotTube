const colors = require('tailwindcss/colors');

const config = {
    content: [
        "./src/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/**/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
        colors: {
            ...colors
        }
    },
    plugins: []
};

export default config;
