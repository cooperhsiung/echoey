import { handlerFunc, Context } from '../echo';

export default function timer(next: handlerFunc): handlerFunc {
  return async (c: Context) => {
    let start = Date.now();
    await next(c);
    console.log('=== x-reponse-time ===', Date.now() - start);
  };
}
