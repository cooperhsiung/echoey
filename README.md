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

e.Start(3000);

function testMid(next: handlerFunc) {
  return (c: Context) => {
    console.log('testMid');
    next(c);
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
  return c => {
    console.log('testMid');
    next(c);
  };
}

function sleep(delay = 1000) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
```

## Usage

[https://github.com/cooperhsiung/echoey/tree/master/src/example](https://github.com/cooperhsiung/echoey/tree/master/src/example)

## Todo

middlewares

```typescript
import { timer, cors } from 'echoey/middleware';
```

- [x] timer
- [x] cors
- [ ] compress
- [ ] jwt

## License

MIT

[npm-image]: https://img.shields.io/npm/v/echoey.svg
[npm-url]: https://www.npmjs.com/package/echoey
[node-image]: https://img.shields.io/badge/node.js-%3E=8-brightgreen.svg
[node-url]: https://nodejs.org/download/
