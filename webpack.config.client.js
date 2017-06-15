const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
// const { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const pkg = require('./package.json');

const isDebug = !process.argv.includes('--release');
const isVerbose = process.argv.includes('--verbose');
const isAnalyze = process.argv.includes('--analyze') || process.argv.includes('--analyse');

const ExtractTextPlugin = require("extract-text-webpack-plugin");




//
// Configuration for the client-side bundle (client.js)
// -----------------------------------------------------------------------------

const clientConfig = {
    name: 'client',
    target: 'web',

    entry: {
        client: ['babel-polyfill', './src/client.js'],
    },

    output: {
        path: path.resolve(__dirname, './build/public/dist'),
        publicPath: '/public/dist/',
        pathinfo: isVerbose,
        // filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
        filename: '[name].[chunkhash:8].js',
        // chunkFilename: isDebug ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
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
                            targets: {browsers: pkg.browserslist},
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
                        // ...isDebug ? ['transform-react-jsx-source'] : [],
                        // ...isDebug ? ['transform-react-jsx-self'] : [],

                        isDebug ? 'transform-react-jsx-source': null,
                        isDebug ? 'transform-react-jsx-self': null,
                    ],
                },
            },
            {
                //this one works actually
                //Fonts and various assets
                test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
                loader: 'file-loader',
                query: {
                    name: isDebug ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
                },
            },
            isDebug ? {
                test: path.resolve(__dirname, './node_modules/redbox-react/lib/index.js'),
                use: 'null-loader',
            } : null,

            isDebug ? {
                test: path.resolve(__dirname, './node_modules/react-deep-force-update/lib/index.js'),
                use: 'null-loader',
            } : null,
        ],

        // loaders: [
        //     // Extract css files
        //     {
        //         test: /\.css$/,
        //         loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
        //     },
        // ]
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

    plugins: [
        new ExtractTextPlugin("[name].css"),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': isDebug ? '"development"' : '"production"',
            'process.env.BROWSER': true,
            __DEV__: isDebug,
        }),
        // Emit a file with assets paths
        // https://github.com/sporto/assets-webpack-plugin#options
        new AssetsPlugin({
            path: path.resolve(__dirname, './build'),
            filename: 'assets.json',
            update: true,
            prettyPrint: true,
        }),

        // ...isDebug ? [] : [
        //     // Minimize all JavaScript output of chunks
        //     // https://github.com/mishoo/UglifyJS2#compressor-options
        //     new webpack.optimize.UglifyJsPlugin({
        //         sourceMap: true,
        //         compress: {
        //             screw_ie8: true, // React doesn't support IE8
        //             warnings: isVerbose,
        //             unused: true,
        //             dead_code: true,
        //         },
        //         mangle: {
        //             screw_ie8: true,
        //         },
        //         output: {
        //             comments: false,
        //             screw_ie8: true,
        //         },
        //     }),
        // ],

        // Webpack Bundle Analyzer
        // https://github.com/th0r/webpack-bundle-analyzer
        // ...isAnalyze ? [new BundleAnalyzerPlugin()] : [],
        // isAnalyze ? new BundleAnalyzerPlugin() : null,
    ],

    // Choose a developer tool to enhance debugging
    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: isDebug ? 'cheap-module-source-map' : false,

    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    // https://webpack.github.io/docs/configuration.html#node
    // https://github.com/webpack/node-libs-browser/tree/master/mock
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};


module.exports = clientConfig;