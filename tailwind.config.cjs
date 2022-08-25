module.exports = {
    content: ['./index.html', './src/**/*.{html,vue,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            spacing: {
                13: '130px',
                15: '60px',
            },
            fontFamily: {
                Outfit: ['Outfit'],
            },
            backgroundImage: {
                'wavy-pattern': "url('./src/assets/images/26669.jpg')",
                'wavy-bg': "url('./src/assets/images/cool-background.svg')",
            },
        },
    },
    plugins: [require('daisyui')],
    daisyui: {
        styled: true,
        themes: true,
        base: true,
        utils: true,
        logs: true,
        rtl: false,
        prefix: '',
        darkTheme: 'dark',
    },
};