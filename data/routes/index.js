const Router = require('koa-router');

const {requireAuth} = require('../auth');
const {client} = require('../redis');
const web3 = require('../web3');

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

// NEEDS ERROR HANDLING TRY...CATCH

const handleRequest = async (ctx) => {

  const {data} = ctx.request.body;

  try {
    if (ctx.params.detail === 'coinbase') {
      const coinbase = await web3.eth.getCoinbase();
      client.set('coinbase', coinbase, 'EX', HOUR);
      return ctx.body = coinbase;
    }
    if (ctx.params.detail === 'requestFaucet') {
      const coinbase = await web3.eth.getCoinbase();
      try {
        const hash = await client.getAsync('faucet:' + data);
        if (hash) return ctx.body = {error: 'Oops - looks like you make a request less than 24h ago.', hash};
        const result = await web3.eth.sendTransaction({
          from: coinbase,
          to: data,
          value: "500000000000000000000"
        });
        client.set('faucet:' + data, result.transactionHash, 'EX', DAY);
        return ctx.body = {data: result.transactionHash};
      } catch (err) {
        return ctx.body = {error: err.toString().replace('Error:', '')};
      }
    }
    if (ctx.params.detail === 'blockheight') {
      return ctx.body = await  web3.eth.getBlockNumber()
    }
    if (ctx.params.detail === 'blocktxcount') {
      const blocktxcount = await web3.eth.getBlockTransactionCount(data);
      client.set('blocks:' + data + ':blocktxcount', blocktxcount, 'EX', DAY);
      return ctx.body = blocktxcount;
    }

    if (ctx.params.detail === 'blockinfo') {
      const info = await web3.eth.getBlock(data);
      if (info == null) throw new Error("Block not found");
      client.set('blocks:' + data, JSON.stringify(info), 'EX', DAY); // Technically data never changes but for debugging purposes 24h cache
      return ctx.body = info;
    }

    if (ctx.params.detail === 'getTransaction') {
      const tx = await web3.eth.getTransaction(data);
      client.set('tx:' + data, JSON.stringify(tx), 'EX', DAY); // Technically data never changes but for debugging purposes 24h cache
      return ctx.body = tx;
    }

    // Address
    if (ctx.params.detail === 'getBalance') {
      const balance = await web3.eth.getBalance(data);
      return ctx.body = await web3.utils.fromWei(balance, 'ether');
    }

    if (ctx.params.detail === 'getTransactionCount') {
      const count = await web3.eth.getTransactionCount(data);
      return ctx.body = count;
    }

  } catch (err) {
    console.log("ERROR", err.message);
    ctx.status = 400;
    ctx.message = err.message;
    ctx.body = err.message;
  }

  if (ctx.params.detail === 'search') {
    try {
      const block = await web3.eth.getBlock(data);
      client.set('search:' + data, '/block/' + data, 'EX', DAY);
      if (block == null) throw new Error("Block not found");
      console.log("BLOCK FOUND", block)
      return ctx.body = '/block/' + data;
    } catch (err) {
      try {
        const tx = await web3.eth.getTransaction(data);
        if (tx == null) throw new Error("Address not found");
        console.log("TX FOUND", tx)
        client.set('search:' + data, '/tx/' + data, 'EX', DAY);
        return ctx.body = '/tx/' + data;
      } catch (err) {
        try {
          const address = await web3.eth.getBalance(data);
          console.log(address)
          if (address == null) throw new Error("Address not found");
          client.set('search:' + data, '/address/' + data, 'EX', DAY);
          return ctx.body = '/address/' + data;
        } catch (err) {
          return ctx.body = '/404';
        }
      }
    }
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
