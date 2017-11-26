const Koa = require('koa');
const app = new Koa();
const Web3 = require('web3');
const Pug =require ('koa-pug');

const web3 = new Web3(new Web3.providers.HttpProvider("http://geth:8545"));

const pug = new Pug({
  viewPath: './views',
  app: app
});

app.use(async ctx => {
  const coinbase = await web3.eth.getCoinbase();
  ctx.render('index', { coinbase });
});

app.listen(3001);