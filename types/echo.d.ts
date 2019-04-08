import { ServerResponse, IncomingMessage } from 'http';
import { ReadStream } from 'fs';

type JsonMap = { [key: string]: any };
type JsonType = { [key: string]: any } | number | null;

export declare type handlerFunc = (ctx: Context) => any | Promise<any>;

export declare type middlewareFunc = (h: handlerFunc) => handlerFunc;

type genGroup = (e: Echo) => Group;

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

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

export declare class Context {
  request: IncomingMessage;
  response: ServerResponse;
  path: string;
  private form: JsonMap;
  status: number;
  body: string | JsonType | ReadStream | Buffer;
  constructor(req: IncomingMessage, res: ServerResponse, path: string, form: JsonMap);
  Param(key?: string): any;
  FormValue(key?: string): any;
  QueryParam(key?: string): any;
  JSON(code: number, data: JsonType): void;
  String(code: number, data: string): void;
  HTML(code: number, data: string): void;
  Stream(code: number, data: ReadStream): void;
}

export declare class Echo {
  layers: Layer[];
  routes: Router[];
  constructor();
  GET(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
  POST(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
  Any(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
  Use(path: string | middlewareFunc, ...m: middlewareFunc[]): void;
  Group(prefix: string, ...m: middlewareFunc[]): void;
  AddGroup(gg: genGroup): void;
  private Serve(): RequestListener;
  Start(port?: number): void;
}

export declare class Group {
  prefix: string;
  echo: Echo;
  constructor(prefix: string, e: Echo);
  Use(path: any, ...m: middlewareFunc[]): void;
  GET(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
  POST(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
  Any(path: string, h: handlerFunc, ...m: middlewareFunc[]): void;
}
