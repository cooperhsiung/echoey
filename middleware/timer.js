"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function timer(next) {
    return async (c) => {
        const start = Date.now();
        await next(c);
        c.response.setHeader('X-Response-Time', Date.now() - start + 'ms');
    };
}
exports.timer = timer;
