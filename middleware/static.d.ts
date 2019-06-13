import { Context } from '../dist/echo';
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
export declare function serveStatic(
  ctx: Context,
  path: any,
  opts?: {
    [key: string]: any;
  },
): Promise<any>;
