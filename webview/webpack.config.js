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
            },
            {
                test: /leader\-line\.js$/,
                use: 'exports-loader?type=commonjs&exports=LeaderLine'
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         LeaderLine: 'leader-line'
    //     })
    // ],
    output: {
        filename: './yarnspinner.js',
        path: path.resolve(__dirname, '..', 'media'),
    },
    optimization: {
        minimize: false
    },
};