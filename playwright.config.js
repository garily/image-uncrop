// @ts-check
const { defineConfig } = require('@playwright/test');
const path = require('path');

export default defineConfig({
    testDir: './tests',
    timeout: 15000,
    use: {
        browserName: 'chromium',
        baseURL: `file://${path.join(__dirname, 'index.html')}`,
        headless: true,
    },
    reporter: [['list'], ['html', { open: 'never' }]],
});
