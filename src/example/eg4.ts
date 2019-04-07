import { Echo, Context, Group, handlerFunc } from '../echo';

// retrieve parameters

const e = new Echo();

e.GET(
  '/test',
  async (c: Context) => {
    c.JSON(200, { a: 1 });
  },
  testMid,
);

e.GET('/hello', (c: Context) => {
  c.String(200, 'asd');
});

e.POST('/hello/:name', (c: Context) => {
  // let x = c.Param(); // get parameters from path
  // let x = c.QueryParam(); // get parameters from url query
  let x = c.FormValue(); // get parameters from body
  // let x1 = c.Param('name');
  // let x1 = c.QueryParam('name');
  let x1 = c.FormValue('name');

  console.log(x);
  console.log(x1);
  return c.String(200, 'asd');
});

e.Start(3000);

function testMid(h: handlerFunc): handlerFunc {
  return (c: Context): Error | Promise<Error> => {
    console.log('testMid1');
    return h(c);
  };
}
