import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

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
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        env: loadEnv('', process.cwd(), ''),
        reporters: ['default', ['junit', { suiteName: 'ORKG Frontend Tests', classnameTemplate: '{filename}' }]],
        outputFile: 'junit.xml',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            app: path.resolve(__dirname, './src/app'),
            testUtils: path.resolve(__dirname, './src/testUtils.tsx'),
            services: path.resolve(__dirname, './src/services'),
            slices: path.resolve(__dirname, './src/slices'),
            store: path.resolve(__dirname, './src/store'),
            utils: path.resolve(__dirname, './src/utils'),
            assets: path.resolve(__dirname, './src/assets'),
            constants: path.resolve(__dirname, './src/constants'),
            components: path.resolve(__dirname, './src/components'),
            helpers: path.resolve(__dirname, './src/helpers'),
            libs: path.resolve(__dirname, './src/libs'),
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
});
