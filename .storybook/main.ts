import type { StorybookConfig } from '@storybook/nextjs';

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
        name: '@storybook/nextjs',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    docs: {
        defaultName: 'Docs',
    },
    env: (config) => ({
        ...config,
        STORYBOOK_ENVS: getPublicEnv(JSON.stringify(config)),
    }),
    webpack(baseConfig) {
        baseConfig.resolve = {
            ...(baseConfig.resolve ?? {}),
            alias: {
                ...(baseConfig.resolve?.alias ?? {}),
                '@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
            },
        };
        return baseConfig;
    },
};

export default config;
