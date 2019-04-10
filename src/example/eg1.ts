import { Echo, Context, handlerFunc } from '../echo';

// basic usage

const e = new Echo();

e.Use(testMid);

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
