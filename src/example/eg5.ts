import { Echo, Context, handlerFunc } from '../echo';
import { timer } from '../middleware/timer';

// middleware usage

const e = new Echo();

// catch error global
e.Use(errHandler);
e.Use(timer);

e.GET('/sleep', async (c: Context) => {
  await sleep();
  c.String(200, 'sleep after 1s');
  console.log('end...');
});

e.GET(
  '/test',
  async (c: Context) => {
    c.JSON(200, { a: 1 });
  },
  testMid,
);

e.GET('/hello', (c: Context) => {
  throw new Error('an error occured');
  c.String(200, 'asd');
});

e.POST('/hello', (c: Context) => {
  c.String(200, 'asd');
});

e.GET('/hello2', (c: Context) => {
  c.JSON(200, { as: 1 });
});

let g = e.Group('/admin');
g.Use(testMid);

e.Start(3000);

function testMid(h: handlerFunc): handlerFunc {
  return async (c: Context) => {
    console.log('testMid1');
    await h(c);
  };
}

function errHandler(next: handlerFunc): handlerFunc {
  return async (c: Context) => {
    try {
      await next(c);
    } catch (error) {
      c.String(500, 'inner server error');
    }
  };
}

function sleep() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}
