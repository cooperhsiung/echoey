import { Echo, handlerFunc, middlewareFunc } from './echo';

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

export class Group {
  prefix: string;
  echo: Echo;

  constructor(prefix: string, e: Echo) {
    this.prefix = prefix;
    this.echo = e;
  }

  Use(path: any, ...m: middlewareFunc[]) {
    // path only [\/a-z]
    if (typeof path === 'string') {
      let layer = this.echo.layers.find(
        e => e.path === this.prefix + (path === '/' ? '' : path)
      );
      if (layer) {
        layer.middleware = layer.middleware.concat(m);
      } else {
        let l: Layer = {
          path: this.prefix + (path === '/' ? '' : path),
          middleware: m
        };
        this.echo.layers.push(l);
      }
    } else {
      let layer = this.echo.layers.find(e => e.path === this.prefix);
      if (layer) {
        layer.middleware.push(path);
        layer.middleware = layer.middleware.concat(m);
      } else {
        let l: Layer = {
          path: this.prefix,
          middleware: [path].concat(m)
        };
        this.echo.layers.push(l);
      }
    }
  }

  GET(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    let r: Router = {
      path: this.prefix + (path === '/' ? '' : path),
      method: 'GET',
      handler: h,
      middleware: m
    };
    this.echo.routes.push(r);
  }

  POST(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    let r: Router = {
      path: this.prefix + (path === '/' ? '' : path),
      method: 'POST',
      handler: h,
      middleware: m
    };
    this.echo.routes.push(r);
  }

  Any(path: string, h: handlerFunc, ...m: middlewareFunc[]) {
    let r: Router = {
      path: this.prefix + (path === '/' ? '' : path),
      method: 'Any',
      handler: h,
      middleware: m
    };
    this.echo.routes.push(r);
  }
}
