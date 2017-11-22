FROM node:7.8.0
ENV NPM_CONFIG_LOGLEVEL warn

COPY package.json ./

RUN npm install
RUN npm install -g nodemon

RUN mkdir -p /app

WORKDIR /app

COPY . ./app

WORKDIR .

EXPOSE 3001