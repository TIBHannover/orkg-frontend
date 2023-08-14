function injectEnv(definitions) {
    const env = 'process.env';

    if (!definitions[env]) {
        return {
            ...definitions,
            [env]: JSON.stringify(
                Object.fromEntries(
                    Object.entries(definitions)
                        .filter(([key]) => key.startsWith(env))
                        .map(([key, value]) => [key.substring(env.length + 1), JSON.parse(value)]),
                ),
            ),
        };
    }
    return definitions;
}

module.exports = {
    stories: ['../docs/**/*.stories.mdx', '../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        '@storybook/addon-essentials',
        '@storybook/addon-interactions',
        '@storybook/preset-create-react-app',
        '@storybook/addon-mdx-gfm',
    ],
    framework: {
        name: '@storybook/react-webpack5',
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
    webpackFinal: async config => {
        const definePlugin = config.plugins.find(({ constructor }) => constructor && constructor.name === 'DefinePlugin');
        if (definePlugin) {
            definePlugin.definitions = injectEnv(definePlugin.definitions);
        }

        return config;
    },
};
