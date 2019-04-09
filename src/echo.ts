import { IncomingMessage, ServerResponse, createServer } from 'http';
import { parse as parseUrl } from 'url';
import pathToRegexp from 'path-to-regexp';
import typeis from 'type-is';
import parseBody from 'co-body';
import { Context } from './context';
import { Group } from './group';
const { Stream } = require('stream');
import { ReadStream } from 'fs';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

type genGroup = (e: Echo) => Group;

export type handlerFunc = (ctx: Context) => any | Promise<any>;

export type middlewareFunc = (h: handlerFunc) => handlerFunc;

type Router = {
  path: string;
  method: string;
  handler: handlerFunc;
  middleware: middlewareFunc[];
};

type Layer = {
  path: string;
  middleware: middlewareFunc[];
};

function notFound(ctx: Context) {
  return ctx.String(400, '404');
}

function notSupport(ctx: Context) {
  return ctx.String(400, 'not support 404');
}

export type Context = Context;
export { Group } from './group';

export class Echo {
  layers: Layer[];
  routes: Router[];
  constructor() {
    this.layers = [];
    this.routes = [];
  }

  GET(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    const r: Router = {
      path: path,
      method: 'GET',
      handler: h,
      middleware: m,
    };
    this.routes.push(r);
  }

  POST(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    const r: Router = {
      path: path,
      method: 'POST',
      handler: h,
      middleware: m,
    };
    this.routes.push(r);
  }

  Any(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    let r: Router = {
      path: path,
      method: 'Any',
      handler: h,
      middleware: m,
    };
    this.routes.push(r);
  }

  Use(path: string | middlewareFunc, ...m: middlewareFunc[]) {
    if (typeof path === 'string') {
      let layer = this.layers.find(e => e.path === path);
      if (layer) {
        layer.middleware = layer.middleware.concat(m);
      } else {
        let l: Layer = {
          path: path,
          middleware: m,
        };
        this.layers.push(l);
      }
    } else {
      let layer = this.layers.find(e => e.path === '/');
      if (layer) {
        layer.middleware.push(path);
        layer.middleware = layer.middleware.concat(m);
      } else {
        let l: Layer = {
          path: '/',
          middleware: [path].concat(m),
        };
        this.layers.push(l);
      }
    }
  }

  Group(prefix: string, ...m: middlewareFunc[]) {
    const g = new Group(prefix, this);
    g.Use('/', ...m);
    return g;
  }

  AddGroup(gg: genGroup) {
    gg(this);
  }

  private Serve(): RequestListener {
    return async (req: IncomingMessage, res: ServerResponse) => {
      let url = req.url || '';

      let urlObj = parseUrl(url);
      let pathname = urlObj.pathname || '';

      // todo remove
      var jsonTypes = [
        'application/json',
        'application/json-patch+json',
        'application/vnd.api+json',
        'application/csp-report',
      ];

      var formTypes = ['application/x-www-form-urlencoded'];

      let form = {};
      if (typeis(req, jsonTypes)) {
        let x = await parseBody.json(req);
        console.log(x, '=====body');
        form = x;
      } else if (typeis(req, formTypes)) {
        let x = await parseBody.form(req);
        console.log(x, '=====body');
        form = x;
      }

      console.log('-----', pathname);

      // match Router
      let r = this.routes[0];
      let ctx = new Context(req, res, r.path, form); // todo

      let matchedMiddleware: middlewareFunc[] = [];
      let matchedHandler: handlerFunc = notFound; // todo 404

      this.layers.forEach(layer => {
        let subPath = pathname.replace(layer.path, '');
        if (layer.path === '/' || (pathname.startsWith(layer.path) && (subPath === '' || subPath.startsWith('/')))) {
          matchedMiddleware = matchedMiddleware.concat(layer.middleware);
        }
      });

      let matched: boolean = false;
      this.routes.forEach(route => {
        if (pathToRegexp(route.path).test(pathname)) {
          if (!matched) {
            matchedHandler = notSupport;
          }
          if ((req.method === route.method.toUpperCase() || route.method.toUpperCase() === 'Any') && !matched) {
            matched = true;
            matchedHandler = route.handler;
            ctx = new Context(req, res, route.path, form); // matched route
          }
          matchedMiddleware = matchedMiddleware.concat(route.middleware);
        }
      });

      matchedHandler = await applyMiddleware(matchedHandler, ...matchedMiddleware);
      await matchedHandler(ctx);
      respond(ctx);
    };
  }

  Start(port?: number) {
    let server = createServer(this.Serve());
    server.listen(port || 3000);
    console.log(`Listenning on http://localhost:${port || 3000}`);
  }
}

async function applyMiddleware(h: handlerFunc, ...m: middlewareFunc[]): Promise<handlerFunc> {
  for (let i = m.length - 1; i >= 0; i--) {
    h = await m[i](h);
  }
  return h;
}

function respond(ctx: Context) {
  if (ctx.body === undefined) return;
  ctx.response.statusCode = ctx.status;
  if (isReadableStream(ctx.body)) {
    (ctx.body as ReadStream).pipe(ctx.response);
    return;
  }
  if (Buffer.isBuffer(ctx.body)) {
    ctx.response.setHeader('Content-Length', ctx.body.length);
    ctx.response.setHeader('Content-Type', 'application/octet-stream');
    ctx.response.end(ctx.body);
    return;
  }
  if (typeof ctx.body !== 'string') {
    ctx.body = JSON.stringify(ctx.body);
  }
  ctx.response.setHeader('Content-Length', Buffer.byteLength(ctx.body));
  ctx.response.end(ctx.body);
}

function isReadableStream(obj: any) {
  return obj instanceof Stream && obj.readable;
}
