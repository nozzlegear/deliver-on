"use strict";

const webpack       = require("webpack");
const precss        = require('precss');
const autoprefixer  = require('autoprefixer');
const pkg           = require("./package.json");
const lodashPack    = require("lodash-webpack-plugin");
const nodeExternals = require('webpack-node-externals');

function buildConfig(target) {
    const config = {
        resolve: {
            root:  process.cwd(),
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
        },
        entry: undefined,
        target: undefined,
        output: {
            path: undefined,
            filename: "[name].js",
        },
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

    if (target === "node") {
        config.target = "node";
        config.entry = {
            "server" : "server.ts"
        };
        config.output.path = "bin";
        config.externals = [nodeExternals()];
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

module.exports = [buildConfig("web"), buildConfig("node")];