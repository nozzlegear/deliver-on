"use strict";

const gulp            = require("gulp");
const ngrok           = require("ngrok");
const chokidar        = require("chokidar");
const sass            = require("gulp-sass");
const shell           = require("gulp-shell");
const rename          = require("gulp-rename");
const minify          = require("gulp-clean-css");
const autoprefix      = require("gulp-autoprefixer");
const server          = require("gulp-develop-server");
const gearworksConfig = require("./gearworks.private.json");

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
    const ngrokConfig = {
        addr: gearworksConfig["gearworks-port"] || 3000,
        subdomain: gearworksConfig["gearworks-ngrokSubdomain"],
    }

    ngrok.connect(ngrokConfig, (err, url) =>
    {
        if (err) throw err;

        console.log("Started ngrok on", url);

        gearworksConfig["gearworks-ngrokDomain"] = url.replace(/^.*:\/\//i, "");

        server.listen({path: "bin/server.js", env: gearworksConfig});
    })
    
    // Gulp.watch in 3.x is broken, watching more files than it should. Using chokidar instead.
    // https://github.com/gulpjs/gulp/issues/651
    chokidar.watch(["bin/**/*.js"], {ignoreInitial: true}).on("all", (event, path) =>
    {
        server.restart();
    });

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
    
    shell.task("pouchdb-server -n --dir pouchdb --port 5984")();
})