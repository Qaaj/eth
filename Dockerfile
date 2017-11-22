FROM node:7.8.0
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /app
WORKDIR /app

COPY . /app

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]
