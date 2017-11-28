const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();

const router = require('./routes')();

app
  .use(koaBody())
  .use(router.routes())
  .listen(3000)

console.log("Listening on 3000");