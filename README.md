# Echoey

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]

An imitation of golang web framework [`echo`](https://echo.labstack.com/)

## Installation

```bash
npm i echoey -S
```

## Example

- ### typescript

```typescript
import { Echo, Context, handlerFunc } from 'echoey';
import { timer } from 'echoey/middleware';

const e = new Echo();

e.Use(timer);
e.Use(testMid);

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello echoey');
});

e.Static('/static', 'assets');

e.Start(3000);

function testMid(next: handlerFunc) {
  return async (c: Context) => {
    console.log('testMid');
    await next(c);
  };
}
```

- ### nodejs

```javascript
const { Echo } = require('echoey');
const { timer } = require('echoey/middleware');

const e = new Echo();

e.Use(timer);
e.Use(testMid);

e.GET('/hello', c => {
  c.String(200, 'hello echoey');
});

e.GET('/sleep', async c => {
  await sleep();
  c.String(200, 'sleep after 1s');
});

e.Start(3000);

function testMid(next) {
  return async c => {
    console.log('testMid');
    await next(c);
  };
}

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

## Route

- use group for sub route

```typescript
const e = new Echo();

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello test');
});

e.Use('/hello', testMid);

let g = e.Group('/admin', testMid);
g.GET('/test', (c: Context) => {
  c.String(200, 'asd');
});

e.Start(3000);

function testMid(next: handlerFunc) {
  return async (c: Context) => {
    console.log('testMid');
    await next(c);
  };
}
```

- manage group by e.AddGroup

```typescript
const e = new Echo();

e.GET(
  '/test',
  async (c: Context) => {
    c.JSON(200, { a: 1 });
  },
  testMid,
);

e.AddGroup(UserGroup);

e.Start(3000);

function UserGroup(e: Echo) {
  const g = new Group('/user', e);
  g.GET('/test', (c: Context) => {
    c.String(200, 'user hello');
  });
  return g;
}

function testMid(next: handlerFunc): handlerFunc {
  return async (c: Context) => {
    console.log('testMid1');
    await next(c);
  };
}
```

## Usage

[https://github.com/cooperhsiung/echoey/tree/master/src/example](https://github.com/cooperhsiung/echoey/tree/master/src/example)

## Todo

middlewares

```typescript
import { timer, cors, compress, serveStatic } from 'echoey/middleware';
```

- [x] timer
- [x] cors
- [x] compress
- [x] serveStatic (use e.Static directly)
- [ ] jwt

## Caveats

Since handler and middlewares are chained to execute, unpromised middleware might break the promises chain.

:smiley: It is commended to write middleware in this way

```typescript
function testMid(next: handlerFunc) {
  return async (c: Context) => {
    console.log('testMid');
    await next(c);
  };
}
```

:confused: not commended

```typescript
function testMid(next: handlerFunc) {
  return (c: Context) => {
    console.log('testMid');
    next(c);
  };
}
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/echoey.svg
[npm-url]: https://www.npmjs.com/package/echoey
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
