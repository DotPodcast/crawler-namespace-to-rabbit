const nconf = require('nconf');
const amqplib = require('amqplib');

const fakeMessages = require('./fixtures/podcast');

// Pull configuration
nconf.argv()
  .env()
  .file('../config.json');


const ex = nconf.get('rabbit:exchange');
const ns = nconf.get('scraper:namespace');

// Connect to RabbitMQ
const open = amqplib.connect(`amqp://${nconf.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertExchange(ex, 'fanout', { durable: false });
      console.log('Connected to Exchange');

      const publish = (obj) => {
        ch.publish(ex, '', new Buffer(JSON.stringify(obj)));
      };

      fakeMessages.forEach((msg) => {
        console.log(msg);
        publish(msg);
      });
    });
});

open.catch((err) => {
  console.warn(`Error connecting to rabbit at ${nconf.get('rabbit_host')}`);
  process.exit(1);
});

const exit = () => {
  process.exit(0);
};

process.on('SIGINT', () => {
  console.log('\nGracefully shutting down from SIGINT (Ctrl-C)');
  exit();
});
