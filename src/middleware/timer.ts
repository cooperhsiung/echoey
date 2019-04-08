import { handlerFunc, Context } from '../echo';

export function timer(next: handlerFunc): handlerFunc {
  return async (c: Context) => {
    const start = Date.now();
    await next(c);
    c.response.setHeader('X-Response-Time', Date.now() - start + 'ms');
  };
}
