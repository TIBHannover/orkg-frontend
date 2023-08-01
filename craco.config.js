/*
    Use craco to overwrite webpack config to fix this issue:
    https://github.com/facebook/create-react-app/issues/11865
    which occurs when using Reagraph: https://github.com/reaviz/reagraph
*/
module.exports = {
    webpack: {
        configure: {
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        resolve: {
                            fullySpecified: false,
                        },
                    },
                ],
            },
        },
    },
};
