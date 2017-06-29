const path = require('path');
const fs = require('fs');
const resolve = require('app-root-path').resolve;
const readdir = fs.readdirSync;
const lstat = fs.lstatSync;
const exists = fs.existsSync;

function LoadRoutes(app, target) {
    if (!(this instanceof LoadRoutes)) {
        return new LoadRoutes(app, target);
    }
    this.watch(app, target);
}

/**
 * Inject the routes and routers into the express instance
 * @param  {Express} app
 * @param  {String} target
 */
LoadRoutes.prototype.init = function(app, target) {
    target = resolve(typeof target === 'string' ? target : 'routes');
    this.readdir(target).forEach(function(file) {
        const route = this.pathToRoute(file, target);
        const router = require(file);
        if (typeof router !== 'function') return;
        app.use(route, router);
    }, this);
};

LoadRoutes.prototype.watch = function(app, target) {
    target = resolve(typeof target === 'string' ? target : 'routes');
    this.readdir(target).forEach(function(file) {
        const route = this.pathToRoute(file, target);
        app.use(route, function (req, res, next) {
            const router = require(file);
            if (typeof router !== 'function') return;
            router(req, res, next);
        });
    }, this);
}

/**
 * Reads all the files and folder within a given target
 * @param  {String} target
 * @return {Array}
 */
LoadRoutes.prototype.readdir = function(target) {
    const files = [];
    const dirs = [];

    if (typeof target !== 'string') {
        throw new TypeError('Expecting target path to be a string');
    }

    if (target.charAt(0) === '.') {
        // resolve the target path
        target = path.resolve(path.dirname(module.parent.filename), target);
    }

    // return an empty array if target does not exists
    if (!exists(target)) return files;

    // look for files recursively
    readdir(target).forEach(function(file) {
        const filePath = path.join(target, file);

        if (isFile(filePath)) {
            files.push(filePath);
        } else {
            dirs.push(filePath);
        }

    }, this);

    files.sort(function(a, b) {
        if (a.indexOf('index.js') != -1) {
            return -1;
        }
        if (b.indexOf('index.js') != -1) {
            return 1;
        }
        return 0;
    });

    dirs.forEach(function(dir){
        files.push.apply(files, this.readdir(dir));
    }, this);

    return files;
};

/**
 * Convert a file path into an express route
 * @param  {String} path
 * @param  {String} base
 * @return {String}
 */
LoadRoutes.prototype.pathToRoute = function(target, base) {

    // remove file extension and normalize slashes
    target = path.normalize(target);
    target = target.replace(path.extname(target), '');

    if (base && typeof base === 'string') {
        const segments = [];
        let segment;

        target = target.split(path.sep);
        base   = path.normalize(base).split(path.sep);
        base   = base[base.length - 1];

        for (let i = target.length - 1; i >= 0; i--) {
            segment = target[i];
            if (segment === base) break;
            if (i === target.length - 1 && segment === 'index') continue;
            if (segment !== '') segments.push(segment);
        }

        return '/' + segments.reverse().join('/');
    }

    // without a base, use the last segment
    target = path.basename(target);
    return '/' + (target !== 'index' ? target : '');
};

function isFile(target) {
    return lstat(target).isFile();
}

function isDir(target) {
    return lstat(target).isDirectory();
}

module.exports = LoadRoutes;
