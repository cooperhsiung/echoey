# Echoey

[![NPM Version][npm-image]][npm-url]

An imitation of golang web framework [`echo`](https://echo.labstack.com/)

## Installation

```bash
npm i echoey -S
```

## Example

- ### typescript

```typescript
import { Echo, Context, handlerFunc } from 'echoey';
import { timer } from 'echoey/middleware/timer';

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
const { timer } = require('echoey/middleware/timer');

const e = new Echo();

e.Use(timer);
e.Use(testMid);

e.GET('/hello', c => {
  c.String(200, 'hello echoey');
});

e.Start(3000);

function testMid(next) {
  return c => {
    console.log('testMid');
    next(c);
  };
}
```

## Usage

## Todo

- [ ] middleware

## License

MIT

[npm-image]: https://img.shields.io/npm/v/echoey.svg
[npm-url]: https://www.npmjs.com/package/echoey
