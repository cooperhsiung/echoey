import { Echo, Context, Group, handlerFunc } from '../echo';

// manage group by e.AddGroup

function UserGroup(e: Echo) {
  const g = new Group('/user', e);
  g.GET('/test', (c: Context) => {
    c.String(200, 'user hello');
  });
  return g;
}

const e = new Echo();

e.GET(
  '/test',
  async (c: Context) => {
    c.JSON(200, { a: 1 });
  },
  testMid,
);

let g = e.Group('/admin');
g.Use(testMid);
e.AddGroup(UserGroup);

e.Start(3000);

function testMid(next: handlerFunc): handlerFunc {
  return async (c: Context) => {
    console.log('testMid1');
    await next(c);
  };
}
