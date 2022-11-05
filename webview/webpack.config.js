const path = require('path');
const webpack = require('webpack');
module.exports = {
    entry: './webview/yarnspinner.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    devtool: 'eval-source-map',
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: './yarnspinner.js',
        path: path.resolve(__dirname, '..', 'media'),
    },
    optimization: {
        minimize: false
    },
};