import { Echo, Context, handlerFunc } from '../echo';

// static route
const e = new Echo();

e.Use(testMid);

e.Use((next: handlerFunc) => {
  return async (c: Context) => {
    await next(c);
    console.log('Content-Type:', c.response.getHeader('Content-Type'));
  };
});

e.Static('/static', 'assets');

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello echoey');
});

e.Start(3000);

function testMid(next: handlerFunc) {
  return async (c: Context) => {
    console.log('testMid');
    await next(c);
  };
}
