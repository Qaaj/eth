const Router = require('koa-router');

const {requireAuth} = require('../auth');
const {client} = require('../redis');
const web3 = require('../web3')

const handleRequest = async (ctx) => {

  const {data} = ctx.request.body;

  if (ctx.params.detail === 'coinbase') {
    return ctx.body = await web3.eth.getCoinbase();
  }
  if (ctx.params.detail === 'requestFaucet') {
      const coinbase = await web3.eth.getCoinbase();
      try {
          const nok = await client.getAsync('faucet:' + data);
          if(nok) throw new Error();
          const result = await web3.eth.sendTransaction({
              from: coinbase,
              to: data,
              value: "500000000000000000000"
          });
          client.set('faucet:'+data, true, 'EX', 60 * 60 * 24);
          return ctx.body = result.transactionHash;
      }catch(err){
        return ctx.body = false;
      }
  }
  if (ctx.params.detail === 'blockheight') {
    return ctx.body = await  web3.eth.getBlockNumber()
  }
  if (ctx.params.detail === 'blocktxcount') {
    return ctx.body = await web3.eth.getBlockTransactionCount(data)
  }
  if (ctx.params.detail === 'blockinfo') {
    return ctx.body = await web3.eth.getBlock(data)
  }
  if (ctx.params.detail === 'difficulty') {
    const balance = await web3.eth.getBalance(data);
    return ctx.body = await web3.utils.fromWei(balance, 'ether');
  }
  if (ctx.params.detail === 'search') {
    try {
      await web3.eth.getBlock(data);
      console.log("Search - BLOCK FOUND - " + data);
      return ctx.body = '/block/' + data;
    } catch (er) {
      try {
        await web3.eth.getTransaction(data);
        console.log("Search - TX FOUND - " + data)
        return ctx.body = '/tx/' + data;
      } catch (err) {
        try {
          await web3.eth.getBalance(data);
          console.log("Search - ADDRESS FOUND - " + data)
          return ctx.body = '/address/' + data;
        } catch (err) {
          return ctx.body = '/404';
        }
      }
    }
  }

  if (ctx.params.detail === 'getTransaction') {
    try{
      const tx = await web3.eth.getTransaction(data);
      return ctx.body = tx;
    }catch(err){
      return ctx.body = '/404';
    }
  }

  // Address
  if (ctx.params.detail === 'getBalance') {
    try {
      const balance = await web3.eth.getBalance(data);
      return ctx.body = await web3.utils.fromWei(balance, 'ether');
    }catch(err){
      return ctx.body = '/404';
    }
  }

  if (ctx.params.detail === 'getTransactionCount') {
    try {
      const count = await web3.eth.getTransactionCount(data);
      return ctx.body = count;
    }catch(err){
      return ctx.body = '/404';
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
