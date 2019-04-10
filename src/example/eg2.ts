import { Echo, Context, handlerFunc } from '../echo';

// use group for sub route

const e = new Echo();

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello test');
});

e.Use('/hello', testMid);

let g = e.Group('/admin', testMid);
g.Use(testMid);
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
