import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';

function stubNextAssetImport() {
    return {
        name: 'stub-next-asset-import',
        transform(_code: string, id: string) {
            if (/(jpg|jpeg|png|webp|gif|svg)$/.test(id)) {
                const imgSrc = path.relative(process.cwd(), id);
                return {
                    code: `export default { src: '${imgSrc}', height: 1, width: 1 }`,
                };
            }
        },
    };
}
// https://vitejs.dev/config/
export default defineConfig({
    root: '.',
    plugins: [react(), stubNextAssetImport()],
    test: {
        testTimeout: 30000,
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        // the widget has its own standalone suite (npm run test:widget)
        exclude: [...configDefaults.exclude, 'widget/**', '**/.claude/**'],
        env: loadEnv('', process.cwd(), ''),
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
});
