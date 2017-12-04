const axios = require('axios');

const doRequest = (client) => async (type, data = null) => {

  const config = {
    headers: {
      token: await client.getAsync('API_KEY')
    }
  };

  const result = await axios.post(`http://data:3000/api/${type}`, {data}, config);
  return result.data;

};

module.exports = {doRequest};