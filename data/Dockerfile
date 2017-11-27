FROM node:7.8.0
ENV NPM_CONFIG_LOGLEVEL warn

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm install -g nodemon

COPY . ./

EXPOSE 3000

CMD npm run dev