const path = require('path');
const webpack = require('webpack');
// const AssetsPlugin = require('assets-webpack-plugin');
// const { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const pkg = require('./package.json');

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze = process.argv.includes('--analyze') || process.argv.includes('--analyse');

const serverConfig = {
    name: 'server',
    target: 'node',

    entry: {
        server: ['babel-polyfill', './src/server.js'],
    },

    output: {
        filename: './server.js',
        libraryTarget: 'commonjs2',
        path: path.resolve(__dirname, './build/'),
        publicPath: '/public/dist/',
        pathinfo: isVerbose,

    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname, './src'),
                ],
                query: {
                    cacheDirectory: isDebug,
                    babelrc: false,
                    presets: [
                        ['env', {
                            targets: {
                                node: pkg.engines.node.match(/(\d+\.?)+/)[0],
                            },
                            modules: false,
                            useBuiltIns: false,
                            debug: false,
                        }],
                        'stage-2',
                        'react',
                        isDebug ? 'react-optimize' : null,
                        // ...isDebug ? [] : ['react-optimize'],
                    ],
                    plugins: [
                        // Adds component stack to warning messages
                        // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-jsx-source
                        isDebug ? 'transform-react-jsx-source': null,
                        isDebug ? 'transform-react-jsx-self': null,
                    ],
                },
            },
            // {
            //     // Internal Styles
            //     test: /\.css$/,
            //     include: [
            //         path.resolve(__dirname, '.'),
            //     ],
            //     use: [
            //         // {
            //         //     loader: 'isomorphic-style-loader',
            //         // },
            //         {
            //             loader: 'css-loader?camelCase',
            //             options: {
            //                 // CSS Loader https://github.com/webpack/css-loader
            //                 importLoaders: 1,
            //                 sourceMap: isDebug,
            //                 // CSS Modules https://github.com/css-modules/css-modules
            //                 modules: true,
            //                 localIdentName: isDebug ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
            //                 // CSS Nano http://cssnano.co/options/
            //                 minimize: !isDebug,
            //                 discardComments: { removeAll: true },
            //             },
            //         },
            //         {
            //             loader: 'postcss-loader',
            //             options: {
            //                 config: {
            //                     path: './tools/postcss.config.js',
            //                 },
            //             },
            //         },
            //     ],
            // },
            {
                // External Styles
                test: /\.css$/,
                exclude: [
                    path.resolve(__dirname, './src'),
                ],
                use: [
                    {
                        loader: 'isomorphic-style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: isDebug,
                            // CSS Modules Disabled
                            modules: false,
                            minimize: !isDebug,
                            discardComments: { removeAll: true },
                        },
                    },
                ],
            },
            {
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                loader: 'file-loader',
                query: {
                    name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
                },
            },

            // Exclude dev modules from production build
            isDebug ? {
                test: path.resolve(__dirname, './node_modules/redbox-react/lib/index.js'),
                use: 'null-loader',
            } : null,

            isDebug ? {
                test: path.resolve(__dirname, './node_modules/react-deep-force-update/lib/index.js'),
                use: 'null-loader',
            } : null,
        ],
    },

    // Don't attempt to continue if there are any errors.
    bail: !isDebug,

    cache: isDebug,

    stats: {
        colors: true,
        reasons: isDebug,
        hash: isVerbose,
        version: isVerbose,
        timings: true,
        chunks: isVerbose,
        chunkModules: isVerbose,
        cached: isVerbose,
        cachedAssets: isVerbose,
    },
    externals: [
        /^\.\/assets\.json$/,
        (context, request, callback) => {
            const isExternal =
                request.match(/^[@a-z][a-z/.\-0-9]*$/i) &&
                !request.match(/\.(css|less|scss|sss)$/i);
            callback(null, Boolean(isExternal));
        },
    ],

    plugins: [
        // Define free variables
        // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            'process.env.BROWSER': false,
            __DEV__: isDebug,
        }),

        // Do not create separate chunks of the server bundle
        // https://webpack.github.io/docs/list-of-plugins.html#limitchunkcountplugin
        new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),

        // Adds a banner to the top of each generated chunk
        // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
        new webpack.BannerPlugin({
            banner: 'require("source-map-support").install();',
            raw: true,
            entryOnly: false,
        }),
    ],

    node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
    },

    devtool: isDebug ? 'cheap-module-source-map' : 'source-map',
};
// export default [clientConfig, serverConfig];

module.exports = serverConfig;