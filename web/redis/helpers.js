const moment = require('moment');

const checkRedisMiddleware = client => route => async (ctx, next) => {

    if (process.env.NO_CACHE) return await next();

    if (route === 'blockinfo') {
        let block = await client.getAsync('blocks:' + ctx.params.hash);
        if (block) {
            block = JSON.parse(block);
            const mined = moment.unix(block.timestamp).fromNow();
            return ctx.render('block', {block, mined});
        }
    }

    await next();
}

const checkRedisHelper = (client) => async (endpoint, data) => {

    if (process.env.NO_CACHE) return false;

    if (endpoint === 'blockinfo') {
        let block = await client.getAsync('blocks:' + data);
        if (block) {
            console.log("FROM REDIS");
            block = JSON.parse(block);
            return {body: {block}};
        }
    }

    return false
}

module.exports = {checkRedisMiddleware, checkRedisHelper};