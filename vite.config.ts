import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styleImport from 'vite-plugin-style-import';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    react(),
    styleImport({
      libs: [
        {
          libraryName: 'antd',
          esModule: true,
          resolveStyle: name => `antd/es/${name}/style/index`,
        },
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          '@primary-color': '#1FB860',
          '@border-radius-base': '4px',
        },
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
    port: 4001,
    proxy: {
      '/xxx-api': {
        target: 'http://xxxx',
        secure: false,
        changeOrigin: true,
      },
    },
  },
});
