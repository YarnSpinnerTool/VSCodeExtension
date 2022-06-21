//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
    // vscode extensions run in webworker context for VS Code web 📖 ->
    // https://webpack.js.org/configuration/target/#target
    target: 'node',

    // the entry point of this extension, 📖 ->
    // https://webpack.js.org/configuration/entry-context/
    entry: './src/extension.ts',
    output: {
        // the bundle is stored in the 'out' folder (check package.json), 📖 ->
        // https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'out'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
        // the vscode-module is created on-the-fly and must be excluded. Add other
        // modules that cannot be webpack'ed, 📖 ->
        // https://webpack.js.org/configuration/externals/
        vscode: 'commonjs vscode'
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 ->
        // https://github.com/TypeStrong/ts-loader

        // look for `browser` entry point in imported node modules
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js'],
        alias: {
            // provides alternate implementation for node module and source files
        },
        fallback: {
            // Webpack 5 no longer polyfills Node.js core modules automatically. see
            // https://webpack.js.org/configuration/resolve/#resolvefallback for the
            // list of Node.js core module polyfills.
            // "path": require.resolve("path-browserify")
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            }
        ]
    }
};
module.exports = config;