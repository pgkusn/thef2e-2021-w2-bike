import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const { resolve } = require('path');

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    base: './',
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    },
    server: {
        host: '0.0.0.0',
        // https: {
        //     key: '/Users/kenge/.ssh/localhost-key.pem',
        //     cert: '/Users/kenge/.ssh/localhost.pem'
        // }
    }
});
