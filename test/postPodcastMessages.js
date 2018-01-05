const winston = require('winston');
const nconf = require('nconf');
const amqplib = require('amqplib');

const fakeMessages = require('./fixtures/podcast');

// Pull configuration
nconf.argv()
  .env()
  .file('../config.json');


const ex = nconf.get('rabbit:exchange');

// Connect to RabbitMQ
const open = amqplib.connect(`amqp://${nconf.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertExchange(ex, 'fanout', { durable: false });
      winston.log('info', 'Connected to Exchange');

      const publish = (obj) => {
        ch.publish(ex, '', Buffer.from(JSON.stringify(obj)));
      };

      fakeMessages.forEach((msg) => {
        winston.log('info', msg);
        publish(msg);
      });
    });
});

open.catch((err) => {
  winston.log('warn', `Error connecting to rabbit at ${nconf.get('rabbit_host')}`);
  winston.log('warn', err);
  process.exit(1);
});

const exit = () => {
  process.exit(0);
};

process.on('SIGINT', () => {
  winston.log('info', '\nGracefully shutting down from SIGINT (Ctrl-C)');
  exit();
});
