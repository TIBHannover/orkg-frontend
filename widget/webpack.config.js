const path = require('path');
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const bundleOutputDir = './dist';
const bundleReleaseOutputDir = './../public';

module.exports = (env, argv) => {
    const isDevBuild = argv.mode === 'development';

    return [
        {
            entry: './src/main.js',
            output: {
                filename: 'widget.js',
                path: isDevBuild ? path.resolve(bundleOutputDir) : path.resolve(bundleReleaseOutputDir),
            },
            devServer: {
                contentBase: bundleOutputDir,
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.BACKEND_URL': isDevBuild
                        ? JSON.stringify('http://localhost:8080/api/')
                        : JSON.stringify('https://www.orkg.org/api/'),
                    'process.env.FRONTEND_SERVER_URL': isDevBuild
                        ? JSON.stringify('http://localhost:3000/')
                        : JSON.stringify('https://www.orkg.org/'),
                }),
                ...(isDevBuild
                    ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin({ patterns: [{ from: 'demo/' }] })]
                    : [new TerserPlugin()]),
            ],
            module: {
                rules: [
                    { test: /\.html$/i, use: 'html-loader' },
                    { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
                    {
                        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                        use: {
                            loader: 'url-loader',
                            options: {
                                limit: 100000,
                            },
                        },
                    },
                    {
                        test: /\.js$/i,
                        exclude: /node_modules/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        '@babel/env',
                                        {
                                            targets: {
                                                browsers: ['ie 6', 'safari 7'],
                                            },
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                ],
            },
        },
    ];
};
