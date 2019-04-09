"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vary_1 = __importDefault(require("vary"));
/*
 * copy from `https://github.com/koajs/cors`
 * */
function cors(options = {}) {
    const defaults = {
        allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    };
    options = Object.assign({}, defaults, options);
    if (Array.isArray(options.exposeHeaders)) {
        options.exposeHeaders = options.exposeHeaders.join(',');
    }
    if (Array.isArray(options.allowMethods)) {
        options.allowMethods = options.allowMethods.join(',');
    }
    if (Array.isArray(options.allowHeaders)) {
        options.allowHeaders = options.allowHeaders.join(',');
    }
    if (options.maxAge) {
        options.maxAge = String(options.maxAge);
    }
    options.credentials = !!options.credentials;
    options.keepHeadersOnError = options.keepHeadersOnError === undefined || !!options.keepHeadersOnError;
    return function (next) {
        return (c) => __awaiter(this, void 0, void 0, function* () {
            // If the Origin header is not present terminate this set of steps.
            // The request is outside the scope of this specification.
            // toLowerCase !!!
            const requestOrigin = c.request.headers['origin'];
            // Always set Vary header
            // https://github.com/rs/cors/issues/10
            // ctx.vary('Origin');
            vary_1.default(c.response, 'Origin');
            if (!requestOrigin)
                return yield next(c);
            let origin;
            if (typeof options.origin === 'function') {
                origin = options.origin(c);
                if (origin instanceof Promise)
                    origin = yield origin;
                if (!origin)
                    return yield next(c);
            }
            else {
                origin = options.origin || requestOrigin;
            }
            const headersSet = {};
            function set(key, value) {
                c.response.setHeader(key, value);
                headersSet[key] = value;
            }
            if (c.request.method !== 'OPTIONS') {
                // Simple Cross-Origin Request, Actual Request, and Redirects
                set('Access-Control-Allow-Origin', origin);
                if (options.credentials === true) {
                    set('Access-Control-Allow-Credentials', 'true');
                }
                if (options.exposeHeaders) {
                    set('Access-Control-Expose-Headers', options.exposeHeaders);
                }
                if (!options.keepHeadersOnError) {
                    return yield next(c);
                }
                try {
                    return yield next(c);
                }
                catch (err) {
                    const errHeadersSet = err.headers || {};
                    const varyWithOrigin = vary_1.default.append(errHeadersSet.vary || errHeadersSet.Vary || '', 'Origin');
                    delete errHeadersSet.Vary;
                    err.headers = Object.assign({}, errHeadersSet, headersSet, { vary: varyWithOrigin });
                    throw err;
                }
            }
            else {
                // Preflight Request
                // If there is no Access-Control-Request-Method header or if parsing failed,
                // do not set any additional headers and terminate this set of steps.
                // The request is outside the scope of this specification.
                if (!c.request.headers['access-control-request-method']) {
                    // this not preflight request, ignore it
                    return yield next(c);
                }
                set('Access-Control-Allow-Origin', origin);
                if (options.credentials === true) {
                    set('Access-Control-Allow-Credentials', 'true');
                }
                if (options.maxAge) {
                    set('Access-Control-Max-Age', options.maxAge);
                }
                if (options.allowMethods) {
                    set('Access-Control-Allow-Methods', options.allowMethods);
                }
                let allowHeaders = options.allowHeaders;
                if (!allowHeaders) {
                    allowHeaders = c.request.headers['access-control-request-headers'];
                }
                if (allowHeaders) {
                    set('Access-Control-Allow-Headers', allowHeaders);
                }
                c.status = 204;
            }
        });
    };
}
exports.cors = cors;
