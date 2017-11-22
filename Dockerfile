FROM node:7.8.0
ENV NPM_CONFIG_LOGLEVEL warn

COPY package.json ./

RUN npm install

COPY . ./

EXPOSE 3001

CMD ["npm", "start"]
