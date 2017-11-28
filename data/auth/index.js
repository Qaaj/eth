const { client} = require('../redis');

async function requireAuth(ctx, next) {

  const API_KEY = await client.getAsync('API_KEY');
  const token = ctx.request.headers.token;

  if(token !== API_KEY) return ctx.status = 401

  await next();
}

module.exports = { requireAuth }