const Koa = require('koa');
const Pug = require ('koa-pug');


const router = require('./routes')();
const app = new Koa();

new Pug({ viewPath: './views',  app: app });

app
  .use(router.routes())


app.listen(3001);
console.log("Listening on 3001");