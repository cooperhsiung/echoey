import { Echo, Context, handlerFunc } from '../echo';
import { cors, compress } from '../middleware';
import { join } from 'path';
import { readFileSync, createReadStream } from 'fs';

// other middleware

const e = new Echo();

e.Use(testMid);
e.Use(cors());
e.Use(compress());

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello echoey');
});

e.GET('/test', (c: Context) => {
  let f = readFileSync(join(__dirname, 'eg6.ts'), 'utf-8'); // sync not commanded in production
  c.String(200, f + '\n' + f + '\n' + f + '\n' + f + '\n' + f);
});

e.GET('/test2', (c: Context) => {
  let f = createReadStream(join(__dirname, 'eg6.ts'));
  c.Stream(200, f);
});

e.Start(3000);

function testMid(next: handlerFunc) {
  return async (c: Context) => {
    console.log('testMid');
    await next(c);
  };
}
