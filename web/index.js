const Koa = require('koa');
const app = new Koa();
const Pug = require ('koa-pug');

const redis = require("redis");

// const client = redis.createClient({host : 'redis'});
const pub = redis.createClient({host : 'redis'});
const sub = redis.createClient({host : 'redis'});

sub.subscribe("web3");

const pug = new Pug({
  viewPath: './views',
  app: app
});

app.use(async ctx => {
  const rand = Math.round(Math.random()*100000000) + "COINBASE";
  const data = await doRequest('coinbase', null , rand);
  ctx.render('index', { coinbase: data });
});

const doRequest = (type,data,rand) => new Promise((ok) => {
  sub.subscribe("web3");
  sub.on("message", function (channel, message) {
    const msg = message.split('&');
    const command = msg[0];
    const data = msg[1];
    if(command === rand) {
      sub.unsubscribe();
      ok(data)
    }
  });
  pub.publish('web3', `${type}&${data}&${rand}`)
});

app.listen(3001);
console.log("Listening on 3001");