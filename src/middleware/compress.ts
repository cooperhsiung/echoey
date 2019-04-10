import zlib from 'zlib';
import vary from 'vary';
import bytes from 'bytes';
import Stream from 'stream';
import status from 'statuses';
import accepts from 'accepts';
import compressible from 'compressible';
import { ServerResponse } from 'http';
import { middlewareFunc, handlerFunc, Context } from '../echo';
/*
 * copy from `https://github.com/koajs/compress`
 * */

const encodingMethods: { [key: string]: any } = {
  gzip: zlib.createGzip,
  deflate: zlib.createDeflate,
};

export function compress(options: { [key: string]: any } = {}): middlewareFunc {
  let { filter = compressible, threshold = 1024 } = options;
  if (typeof threshold === 'string') threshold = bytes(threshold);
  return function(next: handlerFunc): handlerFunc {
    return async (ctx: Context) => {
      vary(ctx.response, 'Accept-Encoding');

      await next(ctx);

      let { body } = ctx;
      if (!body) return;
      if (ctx.response.headersSent || !isWritable(ctx.response)) return;
      if ((ctx as any).compress === false) return;
      if (ctx.request.method === 'HEAD') return;
      if (status.empty[ctx.response.statusCode]) return;
      if (ctx.response.getHeader('Content-Encoding')) return;

      // forced compression or implied
      if (!((ctx as any).compress === true || filter(type(ctx)))) return;

      // identity
      const encoding = accepts(ctx.request).encodings('gzip', 'deflate', 'identity');
      if (!encoding) {
        ctx.String(406, 'supported encodings: gzip, deflate, identity');
        return;
      }
      if (encoding === 'identity') return;

      // json
      if (isJSON(body)) body = ctx.body = JSON.stringify(body);

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

      if (body instanceof Stream) {
        body.pipe(stream);
      } else {
        stream.end(body);
      }
    };
  };
}

function isJSON(body: any) {
  if (!body) return false;
  if ('string' == typeof body) return false;
  if ('function' == typeof body.pipe) return false;
  if (Buffer.isBuffer(body)) return false;
  return true;
}

function isWritable(res: ServerResponse): boolean {
  if (res.finished) return false;
  const socket = (res as any)['socket'];
  if (!socket) return true;
  return socket.writable;
}

function length(ctx: Context) {
  const len = ctx.response.getHeaders()['Content-Length'];
  const body = ctx.body;

  if (null == len) {
    if (!body) return;
    if ('string' == typeof body) return Buffer.byteLength(body);
    if (Buffer.isBuffer(body)) return body.length;
    if (isJSON(body)) return Buffer.byteLength(JSON.stringify(body));
    return;
  }

  return Math.trunc(Number(len)) || 0;
}

function type(ctx: Context) {
  const type = ctx.response.getHeader('Content-Type');
  if (!type) return '';
  return (type as string).split(';', 1)[0];
}
