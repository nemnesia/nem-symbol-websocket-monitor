import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NemSymbolWebSocketMonitor',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) => `nem-symbol-websocket-monitor.${format}.js`,
    },
    outDir: 'dist/umd',
    rollupOptions: {
      // 外部依存は必要に応じて調整
      external: ['@stomp/stompjs', 'isomorphic-ws', 'ws'],
      output: {
        globals: {
          '@stomp/stompjs': 'StompJs',
          'isomorphic-ws': 'WebSocket',
          ws: 'Ws',
        },
      },
    },
    target: 'es2018',
    emptyOutDir: false,
  },
  plugins: [
    dts({
      tsconfigPath: './tsconfig.umd.json',
      outDir: 'dist/umd/types',
    }),
  ],
});
