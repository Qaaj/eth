const Router = require('koa-router');

const {requireAuth} = require('../auth');
const {client} = require('../redis');
const web3 = require('../web3');

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const handleRequest = async (ctx) => {

    const {data} = ctx.request.body;

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
        const blockinfo = await client.getAsync('blocks:' + data);
        if (blockinfo) return ctx.body = JSON.parse(blockinfo);
        const info = await web3.eth.getBlock(data);
        client.set('blocks:' + data, JSON.stringify(info), 'EX', DAY);
        return ctx.body = info;
    }
    if (ctx.params.detail === 'search') {
        try {
            await web3.eth.getBlock(data);
            return ctx.body = '/block/' + data;
        } catch (err) {
            try {
                await web3.eth.getTransaction(data);
                return ctx.body = '/tx/' + data;
            } catch (err) {
                try {
                    await web3.eth.getBalance(data);
                    return ctx.body = '/address/' + data;
                } catch (err) {
                    return ctx.body = '/404';
                }
            }
        }
    }

    if (ctx.params.detail === 'getTransaction') {
        try {
            const tx = await web3.eth.getTransaction(data);
            return ctx.body = tx;
        } catch (err) {
            return ctx.body = '/404';
        }
    }

    // Address
    if (ctx.params.detail === 'getBalance') {
        try {
            const balance = await web3.eth.getBalance(data);
            return ctx.body = await web3.utils.fromWei(balance, 'ether');
        } catch (err) {
            return ctx.body = '/404';
        }
    }

    if (ctx.params.detail === 'getTransactionCount') {
        try {
            const count = await web3.eth.getTransactionCount(data);
            return ctx.body = count;
        } catch (err) {
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
