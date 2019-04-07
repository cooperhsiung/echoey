# Echoey

[![NPM Version][npm-image]][npm-url]

An imitation of golang web framework [`echo`](https://echo.labstack.com/)

## Installation

```bash
npm i echoey -S
```

## Example

```typescript
import { Echo, Context, handlerFunc } from 'echoey';
import timer from 'echoey/middleware/timer';

const e = new Echo();

e.Use(timer);

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello test');
});

e.Start(3000);
```

## Usage

### nodejs

## Todo

- [ ] middleware

## License

MIT

[npm-image]: https://img.shields.io/npm/v/echoey.svg
[npm-url]: https://www.npmjs.com/package/echoey
