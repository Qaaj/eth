const Router = require('koa-router');
const moment = require('moment');

const {prefetchData} = require('../redis/helpers');
const {doRequest} = require('../api');

const {client} = require('../redis');
const doApiCall = doRequest(client);
const prefetch = prefetchData(client);

module.exports = () => {

  const router = new Router();

  router.get('/', prefetch('home'), async (ctx) => {
    const {blocks, coinbase} = ctx.request;
    ctx.render('index', {coinbase, blocks});
  });

  router.get('/block/:hash', prefetch('blockinfo'), async (ctx) => {
    const block = ctx.request.blockinfo;
    const mined = moment.unix(block.timestamp).fromNow();
    ctx.render('block', {block, mined});
  });

  router.get('/404', async (ctx) => {
    ctx.render('404');
  });

  router.get('/search/:hash', prefetch('search'), async (ctx) => {
    const {redirect} = ctx.request;
    ctx.render('search', {result: redirect});
  });

  router.get('/address/:hash', prefetch('address'), async (ctx) => {
    const {address, balance, transactionCount} = ctx.request;
    ctx.render('address', {address, balance, transactionCount});
  });

  router.get('/tx/:hash', prefetch('tx'), async (ctx) => {
    const {tx} = ctx.request;
    ctx.render('tx', {tx});
  });

  router.get('/faucet/:address', async (ctx) => {
    const {data, error, hash} = await doApiCall('requestFaucet', ctx.params.address);
    ctx.render('faucet', {data, error, hash});
  });

  return router;
};
