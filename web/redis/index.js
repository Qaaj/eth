const redis = require("redis");

const client = redis.createClient({host : 'redis'});
const pub = redis.createClient({host : 'redis'});
const sub = redis.createClient({host : 'redis'});

sub.subscribe("web3");

console.log("Redis intialised and registered to 'web3'");

client.get('API_KEY', (err,key) => {
  if(!key){
    const new_key = 'API' + Math.round(Math.random()*100000);
    console.log("No API Key set - setting to " + new_key);
    client.set('API_KEY', new_key )
  }else{
    console.log('API Key found: ', key)
  }
});

module.exports = { client, pub, sub }
