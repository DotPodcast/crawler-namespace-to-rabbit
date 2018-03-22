FROM node:8

RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
COPY . /home/node/app
RUN npm run build
USER node

CMD npm run serve
