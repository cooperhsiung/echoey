"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mime_1 = __importDefault(require("mime"));
const fs = require('mz/fs');
const accepts_1 = __importDefault(require("accepts"));
const resolvePath = require('resolve-path');
const path_1 = require("path");
/**
 * Expose `send()`.
 */
/**
 * Send file at `path` with the
 * given `options` to the koa `ctx`.
 *
 * @param {Context} ctx
 * @param {String} path
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */
async function serveStatic(ctx, path, opts = {}) {
    // options
    const root = opts.root ? path_1.normalize(path_1.resolve(opts.root)) : '';
    const trailingSlash = path[path.length - 1] === '/';
    path = path.substr(path_1.parse(path).root.length);
    const index = opts.index;
    const maxage = opts.maxage || opts.maxAge || 0;
    const immutable = opts.immutable || false;
    const hidden = opts.hidden || false;
    const format = opts.format !== false;
    const extensions = Array.isArray(opts.extensions) ? opts.extensions : false;
    const brotli = opts.brotli !== false;
    const gzip = opts.gzip !== false;
    const setHeaders = opts.setHeaders;
    if (setHeaders && typeof setHeaders !== 'function') {
        throw new TypeError('option setHeaders must be function');
    }
    // normalize path
    path = decode(path);
    if (path === -1)
        return ctx.String(400, 'failed to decode');
    // index file support
    if (index && trailingSlash)
        path += index;
    path = resolvePath(root, path);
    // console.log(path, '======= 2');
    // hidden file support, ignore
    if (!hidden && isHidden(root, path))
        return;
    let encodingExt = '';
    // serve brotli file when possible otherwise gzipped file when possible
    const encoding = accepts_1.default(ctx.request).encodings('br', 'identity');
    const encoding2 = accepts_1.default(ctx.request).encodings('gzip', 'identity');
    if (encoding === 'br' && brotli && (await fs.exists(path + '.br'))) {
        path = path + '.br';
        ctx.response.setHeader('Content-Encoding', 'br');
        ctx.response.removeHeader('Content-Length');
        encodingExt = '.br';
    }
    else if (encoding2 === 'gzip' && gzip && (await fs.exists(path + '.gz'))) {
        path = path + '.gz';
        ctx.response.setHeader('Content-Encoding', 'gzip');
        ctx.response.removeHeader('Content-Length');
        encodingExt = '.gz';
    }
    if (extensions && !/\.[^/]*$/.exec(path)) {
        const list = [].concat(extensions);
        for (let i = 0; i < list.length; i++) {
            let ext = list[i];
            if (typeof ext !== 'string') {
                throw new TypeError('option extensions must be array of strings or false');
            }
            if (!/^\./.exec(ext)) {
                ext = '.' + ext;
            }
            if (await fs.exists(path + ext)) {
                path = path + ext;
                break;
            }
        }
    }
    // stat
    let stats;
    try {
        stats = await fs.stat(path);
        // Format the path to serve static file servers
        // and not require a trailing slash for directories,
        // so that you can do both `/directory` and `/directory/`
        if (stats.isDirectory()) {
            if (format && index) {
                path += '/' + index;
                stats = await fs.stat(path);
            }
            else {
                return;
            }
        }
    }
    catch (err) {
        const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
        if (notfound.includes(err.code)) {
            return ctx.String(404, err.message);
            // throw createError(404, err);
        }
        err.status = 500;
        throw err;
    }
    if (setHeaders)
        setHeaders(ctx.response, path, stats);
    // stream
    ctx.response.setHeader('Content-Length', stats.size);
    if (!ctx.response.getHeader('Last-Modified'))
        ctx.response.setHeader('Last-Modified', stats.mtime.toUTCString());
    if (!ctx.response.getHeader('Cache-Control')) {
        const directives = ['max-age=' + ((maxage / 1000) | 0)];
        if (immutable) {
            directives.push('immutable');
        }
        ctx.response.setHeader('Cache-Control', directives.join(','));
    }
    if (!ctype(ctx)) {
        // ctx.type = type(path, encodingExt);
        var type = mime_1.default.lookup(path);
        if (type) {
            var charset = mime_1.default.charsets.lookup(type);
            ctx.response.setHeader('Content-Type', type + (charset ? '; charset=' + charset.toLowerCase() : ''));
        }
        // ctx.response.setHeader('Content-Type', type(path, encodingExt));
    }
    // ctx.body = fs.createReadStream(path);
    // console.log(path, '===== 1');
    ctx.Stream(200, fs.createReadStream(path));
    return path;
}
exports.serveStatic = serveStatic;
/**
 * Check if it's hidden.
 */
function isHidden(root, path) {
    let paths = path.substr(root.length).split(path_1.sep);
    for (let i = 0; i < paths.length; i++) {
        if (paths[i][0] === '.')
            return true;
    }
    return false;
}
/**
 * File type.
 */
function type(file, ext) {
    return ext !== '' ? path_1.extname(path_1.basename(file, ext)) : path_1.extname(file);
}
/**
 * Decode `path`.
 */
function decode(path) {
    try {
        return decodeURIComponent(path);
    }
    catch (err) {
        return -1;
    }
}
function ctype(ctx) {
    const type = ctx.response.getHeader('Content-Type');
    if (!type)
        return '';
    return type.split(';', 1)[0];
}
