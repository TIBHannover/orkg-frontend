import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gets a list of environment variables that start with `NEXT_PUBLIC_`.
 */
export function getPublicEnv(config: string) {
    const publicEnv = Object.keys(JSON.parse(config))
        .filter((key) => /^NEXT_PUBLIC_/i.test(key))
        .reduce(
            (env, key) => ({
                ...env,
                [key]: process.env[key],
            }),
            {},
        );

    return JSON.stringify(publicEnv);
}

const config: StorybookConfig = {
    stories: ['./**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/nextjs-vite',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    docs: {
        defaultName: 'Docs',
    },
    env: (envConfig) => ({
        ...envConfig,
        STORYBOOK_ENVS: getPublicEnv(JSON.stringify(envConfig)),
    }),
    /*
     * `jsonwebtoken` is Node-only (uses util.inherits via jws) and breaks Vite's
     * browser bundle. Alias it to a tiny browser-safe stub for Storybook only —
     * the real package is still used in production via Next.js.
     */
    viteFinal: async (viteConfig) => ({
        ...viteConfig,
        resolve: {
            ...(viteConfig.resolve ?? {}),
            alias: {
                ...(viteConfig.resolve?.alias ?? {}),
                jsonwebtoken: path.resolve(dirname, './jsonwebtoken-stub.ts'),
            },
        },
    }),
};

export default config;
