// function injectEnv(definitions) {
//     const env = 'process.env';

//     if (!definitions[env]) {
//         return {
//             ...definitions,
//             [env]: JSON.stringify(
//                 Object.fromEntries(
//                     Object.entries(definitions)
//                         .filter(([key]) => key.startsWith(env))
//                         .map(([key, value]) => [key.substring(env.length + 1), JSON.parse(value)]),
//                 ),
//             ),
//         };
//     }
//     return definitions;
// }

module.exports = {
    stories: ['./**/*.mdx', '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-mdx-gfm'],
    framework: {
        name: '@storybook/nextjs',
        options: {},
    },
    core: {
        disableTelemetry: true,
    },
    docs: {
        autodocs: true,
        defaultName: 'Docs',
    },
    // fixes an issue where process.env is empty: https://github.com/storybookjs/storybook/issues/17336
    // webpackFinal: async (config) => {
    //     const definePlugin = config.plugins.find(({ constructor }) => constructor && constructor.name === 'DefinePlugin');
    //     if (definePlugin) {
    //         definePlugin.definitions = injectEnv(definePlugin.definitions);
    //     }

    //     return config;
    // },
    // fixes an issue with nextjs, can be removed when updating to storybook 8 https://github.com/storybookjs/storybook/issues/25649
    webpack(baseConfig) {
        baseConfig.resolve = {
            ...(baseConfig.resolve ?? {}),
            alias: {
                ...(baseConfig.resolve?.alias ?? {}),
                '@opentelemetry/api': 'next/dist/compiled/@opentelemetry/api',
                '@testing-library/react': '@storybook/test', // see: https://github.com/vercel/next.js/issues/55620#issuecomment-1758276652
            },
        };
        return baseConfig;
    },
};
