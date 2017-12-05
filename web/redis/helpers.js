const moment = require('moment');
const {doRequest} = require('../api');

const checkRedisHelper = (client) => async (endpoint, data) => {

  if (process.env.NO_CACHE) return false;

  if (endpoint === 'blockinfo') {
    let block = await client.getAsync('blocks:' + data);
    if (block) {
      console.log("FROM REDIS: ", endpoint, data);
      return JSON.parse(block);
    }
  }
  if (endpoint === 'getTransaction') {
    let tx = await client.getAsync('tx:' + data);
    if (tx) {
      console.log("FROM REDIS: ", endpoint, data);
      return JSON.parse(tx);
    }
  }

  if (endpoint === 'search') {
    let result = await client.getAsync('search:' + data);
    if (result) {
      console.log("FROM REDIS: ", endpoint, data);
      return result;
    }
  }

  console.log("NOT FOUND IN REDIS: ", endpoint, data);
  return false
};

const prefetchData = client => route => async (ctx, next) => {

  const doApiCall = doRequest(client);
  const checkRedis = checkRedisHelper(client);



  try {

    // Cached
    const blockinfo = async (hash_or_id) => await checkRedis('blockinfo', hash_or_id) || await doApiCall('blockinfo', hash_or_id);
    const txInfo = async (hash) => await checkRedis('getTransaction', hash) || await doApiCall('getTransaction', hash);

    // Non-Cached
    const coinbase = async () => await doApiCall('coinbase');
    const blockheight = async () => await doApiCall('blockheight');
    const balance = async (address) => await doApiCall('getBalance', address);
    const txCount = async (address) => doApiCall('getTransactionCount', address);

    if (route === 'blockinfo') {
      ctx.request.blockinfo = await blockinfo(ctx.params.hash)
    }

    if (route === 'search') {
      ctx.request.redirect = await checkRedis('search', ctx.params.hash) || await doApiCall('search', ctx.params.hash);
    }

    if (route === 'address') { // No caching since address information can change
      ctx.request.balance = await balance(ctx.params.hash);
      ctx.request.transactionCount = await txCount(ctx.params.hash);
      ctx.request.address = ctx.params.hash;
    }

    if (route === 'tx') {
      ctx.request.tx = await txInfo(ctx.params.hash);
    }

    if (route === 'home') {

      const height = await blockheight();
      ctx.request.coinbase = await coinbase();
      ctx.request.blocks = [];

      for (i = height; (i > -1 && i > height - 5); i--) {
        const info = await blockinfo(i);
        ctx.request.blocks.push({
          blockheight: i,
          hash: info.hash,
          timestamp: info.timestamp == 0 ? 'Genesis' : moment.unix(info.timestamp).fromNow(),
          tx: info.transactions.length
        });
      }
    }
  }catch(err){
    console.log("ERROR: ", err.response.statusText);
    return ctx.render('404', {error: err.response.statusText})
  }

  await next();
};

module.exports = {prefetchData};