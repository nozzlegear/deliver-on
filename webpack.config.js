"use strict";

const path          = require("path");
const glob          = require("glob");
const webpack       = require("webpack");
const precss        = require('precss');
const autoprefixer  = require('autoprefixer');
const pkg           = require("./package.json");
const some          = require("lodash/some");
const lodashPack    = require("lodash-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

function buildConfig(target) {
    const config = {
        resolve: {
            root:  process.cwd(),
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        },
        watchOptions: {
            // Set to true until Windows Subsystem for Linux supports filewatching: 
            // https://github.com/Microsoft/BashOnWindows/issues/216
            poll: true,
        },
        entry: undefined,
        target: undefined,
        output: {
            path: undefined,
            filename: "[name].js",
        },
        node: undefined,
        externals: [],
        devtool: "source-map",
        plugins: [
            new lodashPack,
            new webpack.optimize.OccurenceOrderPlugin,
            new webpack.DefinePlugin({
                "_VERSION": `"${pkg.version}"`,
            }),
        ],
        module: {
            loaders: [
                { 
                    test: /\.tsx?$/i, 
                    loader: 'awesome-typescript-loader' 
                },
                {
                    loader: 'babel-loader',
                    test: /\.js$/i,
                    // Exclude node_modules from babel loader unless it's react-flexifit.
                    exclude: /node_modules(\/|\\)(?!react-flexifit)/i,
                    query: {
                        presets: ['es2015'],
                    },
                },
                {
                    test: /\.css$/i,
                    loaders: ["style", "css"]
                },
                {
                    test: /\.scss$/i,
                    loaders: ["style", "css", "postcss-loader", "sass"]
                },
                {
                    test: /\.json$/i,
                    loaders: ["json"],
                }
            ],
            preLoaders: [
                // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
                { test: /\.js$/, loader: "source-map-loader" }
            ]
        },
        postcss: () => [precss, autoprefixer],
    }

    if (target === "node" || target === "node-views") 
    {
        config.target = "node";
        config.entry = {
            "server" : "server.ts"
        };
        config.output.path = "bin";
        config.externals = [nodeExternals()];
        config.node = {
            // Set these to false or webpack will polyfill __dirname to '/' rather than the actual directory.
            __filename: false,
            __dirname: false,
        }

        if (target === "node-views")
        {
            config.entry = {};
            config.output.libraryTarget = "commonjs2";

            // Hapi does not allow requiring view files, instead they all need to be separately compiled.
            const views = glob.sync("./views/*/*.tsx");

            views.forEach((file) => {
                const fp = path.parse(file);
                config.entry[path.join(fp.dir, fp.name)] = path.join(fp.dir, fp.base);
            })
        }
    } else {
        config.entry = {
            "js/home/home": "js/home/home.tsx"
        };
        config.output.path = "wwwroot";

        config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
            filename: "js/shared.js",
            name: "shared",
            minChunks: 2,
        }))

        if (process.env.NODE_ENV === "production")
        {
            config.plugins.push(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                }
            }))
        }
    }

    return config;
}

module.exports = [buildConfig("web"), buildConfig("node-views"), buildConfig("node")];