import { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { parse as parseQs } from 'querystring';
import pathToRegexp from 'path-to-regexp';
import { ReadStream } from 'fs';

type JsonMap = { [key: string]: any };
type JsonType = { [key: string]: any } | number | null;

export class Context {
  request: IncomingMessage;
  response: ServerResponse;
  path: string;
  private form: JsonMap;
  status!: number;
  body!: string | JsonType | ReadStream | Buffer;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    path: string,
    form: JsonMap
  ) {
    this.request = req;
    this.response = res;
    this.path = path;
    this.form = form;
  }

  Param(key?: string): any {
    let url = this.request.url || '';
    let urlObj = parseUrl(url);
    let pathname = urlObj.pathname || '';
    let keys: any[] = [];
    let x = pathToRegexp(this.path, keys);
    let x1 = pathname.match(x);
    let params: { [key: string]: string } = {};
    if (x1) {
      x1.slice(1).map((e, i) => {
        params[keys[i].name] = e;
      });
    }
    if (key) {
      return params[key];
    }
    return params;
  }

  FormValue(key?: string): any {
    if (key) {
      return this.form[key];
    }
    return this.form;
  }

  QueryParam(key?: string): any {
    let url = this.request.url || '';
    // console.log(url);
    let urlObj = parseUrl(url);
    let query = urlObj.query || '';
    let params = parseQs(query);
    if (key) {
      return params[key];
    }
    return params;
  }

  JSON(code: number, data: JsonType) {
    this.status = code;
    this.body = data;
    this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
  }

  String(code: number, data: string) {
    this.status = code;
    this.body = data;
    this.response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  }

  HTML(code: number, data: string) {
    this.status = code;
    this.body = data;
    this.response.setHeader('Content-Type', 'text/html; charset=utf-8');
  }

  Stream(code: number, data: ReadStream) {
    this.status = code;
    this.body = data;
    // this.response.setHeader('Content-Type', 'application/octet-stream');
  }
}
