import { Echo, Context, handlerFunc } from '../echo';
import { cors } from '../middleware/cors';

// other middleware

const e = new Echo();

e.Use(testMid);
e.Use(cors());

e.GET('/hello', (c: Context) => {
  c.String(200, 'hello echoey');
});

e.Start(3000);

function testMid(next: handlerFunc) {
  return (c: Context) => {
    console.log('testMid');
    next(c);
  };
}
