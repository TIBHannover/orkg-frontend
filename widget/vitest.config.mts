import { defineConfig } from 'vitest/config';

// Standalone test setup for the widget: own MSW server (see src/setupTests.ts),
// no coupling to the app suite. The __*_URL__ constants that esbuild injects at
// build time (widget/build.mjs) are provided here with fixed values so test URLs
// are deterministic regardless of the local environment.
export default defineConfig({
    root: import.meta.dirname,
    define: {
        __BACKEND_URL__: JSON.stringify('https://orkg.org/api/'),
        __FRONTEND_URL__: JSON.stringify('https://orkg.org/'),
    },
    test: {
        environment: 'jsdom',
        globals: true,
        // without this, vitest stubs .css modules to '' even with a ?raw query
        css: true,
        include: ['src/**/*.test.ts'],
        setupFiles: ['./src/setupTests.ts'],
    },
});
