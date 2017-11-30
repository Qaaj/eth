const Router = require('koa-router');
const moment = require('moment');
const axios = require('axios');


const {client} = require('../redis');

// TODO: Caching for this method

const doRequest = async (type, data = null) => {
    const config = {
        headers: {
            token: await client.getAsync('API_KEY')
        }
    };

    try {
        const result = await axios.post(`http://data:3000/api/${type}`, {data}, config);
        return result.data;
    } catch (err) {
        return "Error"
    }
};

module.exports = () => {

    const router = new Router();

    // Homepage

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

    router.get('/block/:hash', async (ctx) => {
        const block = await doRequest('blockinfo', ctx.params.hash);
        const blockheight = await doRequest('blockheight');

        ctx.render('block', {block, blockheight});
    });

    router.get('/404', async (ctx) => {
        ctx.render('404');
    });

    router.get('/search/:hash', async (ctx) => {
        const result = await doRequest('search', ctx.params.hash);
        console.log(result);
        ctx.render('search', {result});
    });

    router.get('/address/:hash', async (ctx) => {
        const balance = await doRequest('getBalance', ctx.params.hash);
        const transactionCount = await doRequest('getTransactionCount', ctx.params.hash);
        ctx.render('address', {address: ctx.params.hash, balance, transactionCount});
    });

    router.get('/tx/:hash', async (ctx) => {
        const tx = await doRequest('getTransaction', ctx.params.hash);
        ctx.render('tx', {tx});
    });

    router.get('/faucet/:address', async (ctx) => {
        const result = await doRequest('requestFaucet', ctx.params.address);
        ctx.render('faucet', {result});
    });


    return router;
};
