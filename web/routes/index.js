const Router = require('koa-router');
const moment = require('moment');
const axios = require('axios');


const {client} = require('../redis');

module.exports = () => {

  const doRequest = async (type, data = null) => {
    
    const config = {
      headers: {
        token: await client.getAsync('API_KEY')
      }
    };

    try {
      const result = await axios.post(`http://data:3000/api/${type}`, { data }, config);
      return result.data;
    } catch (err) {
      return "Error"
    }
  };

  const router = new Router();

  router.get('/', async (ctx) => {

    const coinbase = await doRequest('coinbase');
    const blockheight = await doRequest('blockheight')

    const blocks = [];

    for (i = blockheight; (i > -1 && i > blockheight - 5); i--) {
      const info = await doRequest('blockinfo', i);
      blocks.push({
        blockheight: i,
        hash: info.hash,
        timestamp: info.timestamp == 0 ? 'Genesis' : moment.unix(info.timestamp).fromNow(),
        tx: info.transactions.length //await doRequest('blocktxcount', i)
      });
    }
    ctx.render('index', {coinbase, blocks});
  });

  router.get('/block/:hash', (ctx) => {
    console.log(ctx.params.hash)
    ctx.render('block', {hash: ctx.params.hash});
  });

  return router;
};