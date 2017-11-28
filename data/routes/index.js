const Router = require('koa-router');

const { requireAuth } = require('../auth');
const { client } = require('../redis');
const web3 = require('../web3')

const handleRequest = async (ctx) => {

  const { data } = ctx.request.body;

  if(ctx.params.detail === 'coinbase') {
    return ctx.body = await web3.eth.getCoinbase();
  }
  if(ctx.params.detail === 'blockheight') {
    return ctx.body = await  web3.eth.getBlockNumber()
  }
  if(ctx.params.detail === 'blocktxcount') {
    return ctx.body = await web3.eth.getBlockTransactionCount(data)
  }
  if(ctx.params.detail === 'blockinfo') {
    return ctx.body = await web3.eth.getBlock(data)
  }
  ctx.body = "Authorised";
};

module.exports = () => {

  const router = new Router();

  router.get('/', async (ctx) => {
    ctx.body = 'Data/Caching Health: OK';
  });

  router.post('/api/:detail', requireAuth, handleRequest);

  return router;
};