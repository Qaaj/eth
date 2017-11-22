const express = require('express');
const Web3 = require('web3');
const app = express();
const web3 = new Web3(new Web3.providers.HttpProvider("http://geth:8545"));

app.get('/', async (req, res) => res.send(`Coinbase: ${await web3.eth.getCoinbase()}`));

app.listen(3001, () => console.log('Listening on port 3001!'));