const Koa = require('koa');
const app = new Koa();
const Pug = require ('koa-pug');
const moment = require('moment');
const redis = require("redis");

// const client = redis.createClient({host : 'redis'});
const pub = redis.createClient({host : 'redis'});
const sub = redis.createClient({host : 'redis'});

sub.subscribe("web3");

new Pug({
  viewPath: './views',
  app: app
});

app.use(async ctx => {
  const coinbase = await doRequest('coinbase');
  const blockheight = await doRequest('blockheight')
  const blocks = [];
  for (i = blockheight; (i > -1  && i > blockheight-5); i--) {
    const info = JSON.parse(await doRequest('blockinfo', i));
    console.log(info.timestamp);
    blocks.push({
      blockheight: i,
      hash: info.hash,
      timestamp: info.timestamp == 0 ? 'Genesis' : moment.unix(info.timestamp).fromNow(),
      tx: info.transactions.length //await doRequest('blocktxcount', i)
    });
  }
  ctx.render('index', { coinbase, blocks });
});

const doRequest = (type,data = null) => new Promise((ok) => {
  const rand = 'MSG_' + Math.round(Math.random()*100000000000);
  sub.subscribe("web3");
  sub.on("message", function (channel, message) {
    const msg = message.split('_______');
    const command = msg[0];
    const data = msg[1];
    if(command === rand) {
      sub.unsubscribe();
      ok(data)
    }
  });
  pub.publish('web3', `${type}_______${data}_______${rand}`)
});

app.listen(3001);
console.log("Listening on 3001");