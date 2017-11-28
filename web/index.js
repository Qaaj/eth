const Koa = require('koa');
const Pug = require ('koa-pug');
const redis = require("redis");

// const client = redis.createClient({host : 'redis'});
const pub = redis.createClient({host : 'redis'});
const sub = redis.createClient({host : 'redis'});

sub.subscribe("web3");

const router = require('./routes')(pub,sub);
const app = new Koa();

new Pug({ viewPath: './views',  app: app });

app
  .use(router.routes())


app.listen(3001);
console.log("Listening on 3001");