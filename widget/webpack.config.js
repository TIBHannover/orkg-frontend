const path = require('path');
const webpack = require('webpack');
const copyWebpackPlugin = require('copy-webpack-plugin');
const bundleOutputDir = './dist';

module.exports = env => {
    const isDevBuild = !(env && env.prod);

    return [
        {
            entry: './src/main.js',
            output: {
                filename: 'widget.js',
                path: path.resolve(bundleOutputDir)
            },
            devServer: {
                contentBase: bundleOutputDir
            },
            plugins: [
                new webpack.DefinePlugin({
                    'process.env.SERVER_URL': JSON.stringify('http://localhost:8000/'),
                    'process.env.FRONTEND_SERVER_URL': JSON.stringify('http://localhost:3000/')
                }),
                ...(isDevBuild
                    ? [new webpack.SourceMapDevToolPlugin(), new copyWebpackPlugin([{ from: 'demo/' }])]
                    : [new webpack.optimize.UglifyJsPlugin()])
            ],
            module: {
                rules: [
                    { test: /\.html$/i, use: 'html-loader' },
                    { test: /\.css$/i, use: ['style-loader', 'css-loader'] },
                    {
                        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                        loader: 'url-loader?limit=100000'
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
                                                browsers: ['ie 6', 'safari 7']
                                            }
                                        }
                                    ]
                                ]
                            }
                        }
                    }
                ]
            }
        }
    ];
};
