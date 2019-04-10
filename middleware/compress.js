"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zlib_1 = __importDefault(require("zlib"));
const vary_1 = __importDefault(require("vary"));
const bytes_1 = __importDefault(require("bytes"));
const stream_1 = __importDefault(require("stream"));
const statuses_1 = __importDefault(require("statuses"));
const accepts_1 = __importDefault(require("accepts"));
const compressible_1 = __importDefault(require("compressible"));
/*
 * copy from `https://github.com/koajs/compress`
 * */
const encodingMethods = {
    gzip: zlib_1.default.createGzip,
    deflate: zlib_1.default.createDeflate,
};
function compress(options = {}) {
    let { filter = compressible_1.default, threshold = 1024 } = options;
    if (typeof threshold === 'string')
        threshold = bytes_1.default(threshold);
    return function (next) {
        return async (ctx) => {
            vary_1.default(ctx.response, 'Accept-Encoding');
            await next(ctx);
            let { body } = ctx;
            if (!body)
                return;
            if (ctx.response.headersSent || !isWritable(ctx.response))
                return;
            if (ctx.compress === false)
                return;
            if (ctx.request.method === 'HEAD')
                return;
            if (statuses_1.default.empty[ctx.response.statusCode])
                return;
            if (ctx.response.getHeader('Content-Encoding'))
                return;
            // forced compression or implied
            if (!(ctx.compress === true || filter(type(ctx))))
                return;
            // identity
            const encoding = accepts_1.default(ctx.request).encodings('gzip', 'deflate', 'identity');
            if (!encoding) {
                ctx.String(406, 'supported encodings: gzip, deflate, identity');
                return;
            }
            if (encoding === 'identity')
                return;
            // json
            if (isJSON(body))
                body = ctx.body = JSON.stringify(body);
            // threshold
            if (threshold) {
                let x = length(ctx);
                if (x !== undefined) {
                    if (x < threshold) {
                        return;
                    }
                }
            }
            ctx.response.setHeader('Content-Encoding', String(encoding));
            ctx.response.removeHeader('Content-Length');
            const stream = (ctx.body = encodingMethods[String(encoding)](options));
            if (body instanceof stream_1.default) {
                body.pipe(stream);
            }
            else {
                stream.end(body);
            }
        };
    };
}
exports.compress = compress;
function isJSON(body) {
    if (!body)
        return false;
    if ('string' == typeof body)
        return false;
    if ('function' == typeof body.pipe)
        return false;
    if (Buffer.isBuffer(body))
        return false;
    return true;
}
function isWritable(res) {
    if (res.finished)
        return false;
    const socket = res['socket'];
    if (!socket)
        return true;
    return socket.writable;
}
function length(ctx) {
    const len = ctx.response.getHeaders()['Content-Length'];
    const body = ctx.body;
    if (null == len) {
        if (!body)
            return;
        if ('string' == typeof body)
            return Buffer.byteLength(body);
        if (Buffer.isBuffer(body))
            return body.length;
        if (isJSON(body))
            return Buffer.byteLength(JSON.stringify(body));
        return;
    }
    return Math.trunc(Number(len)) || 0;
}
function type(ctx) {
    const type = ctx.response.getHeader('Content-Type');
    if (!type)
        return '';
    return type.split(';', 1)[0];
}
