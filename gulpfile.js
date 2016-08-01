"use strict";

const gulp            = require("gulp");
const ngrok           = require("ngrok");
const gutil           = require("gutil");
const webpack         = require("webpack");
const chokidar        = require("chokidar");
const sass            = require("gulp-sass");
const lt              = require("localtunnel");
const some            = require("lodash/some");
const rename          = require("gulp-rename");
const minify          = require("gulp-clean-css");
const webpackConfig   = require("./webpack.config");
const autoprefix      = require("gulp-autoprefixer");
const server          = require("gulp-develop-server");

const sassFiles = ["css/**/*.scss"];
const sassTask = (gulpSrc) => {
    const cssMinOptions = {
        processImport: false,
        processImportFrom: ['!fonts.googleapis.com']
    }
    
    return gulpSrc
        .pipe(sass())
        .pipe(autoprefix())
        .pipe(minify(cssMinOptions))
        .pipe(rename((path) => 
        {
            path.extname = ".min.css";
        }))
        .pipe(gulp.dest('wwwroot/css'));
}

gulp.task("sass", () =>
{
    return sassTask(gulp.src(sassFiles));
})

gulp.task("default", ["sass"]);

gulp.task("watch", ["default"], (cb) =>
{
    const gearworksConfig = require("envfile").parseFileSync("./gearworks.private.env");
    const port = gearworksConfig["gearworks-port"] || 3000;
    const subdomain = gearworksConfig["gearworks-ngrokSubdomain"];
    const compiler = webpack(webpackConfig);

    let serverStarted = false;
    let compiles = 0;

    compiler.watch({poll: true}, (err, stats) => {
        if (err) { throw new gutil.PluginError('watch:webpack', err); }

        compiles ++;

        gutil.log(stats.toString({chunks: false, colors: true}));

        // Only start the server after all webpack configs have compiled once.
        if (compiles < webpackConfig.length)
        {
            return;
        }

        if (!serverStarted)
        {
            serverStarted = true;

            server.listen({path: "bin/server.js", env: gearworksConfig});

            return;

            // const tunnel = lt(port, { subdomain: "auntiedots" }, (err, tunnel) => {
            //     if (err) throw err;

            //     console.log("Localtunnel available at", tunnel.url);

            //     server.listen({path: "bin/server.js", env: gearworksConfig});
            // })

            // tunnel.on("close", () => {
            //     console.log("Localtunnel closed.");
            // })
        }

        // Only restart after all configs are packed 
        if (compiles > webpackConfig.length && compiles % webpackConfig.length === 0)
        {
            server.restart();
        }
    })

    chokidar.watch(sassFiles, {ignoreInitial: true}).on("all", (event, path) =>
    {
        console.log(`${event}: Sass file ${path}`);
        
        if (path.indexOf("_variables.scss") > -1)
        {
            //Recompile all sass files with updated variables.
            return sassTask.task(gulp.src(sassFiles));
        }
        
        return sassTask.task(gulp.src(path));
    })
})