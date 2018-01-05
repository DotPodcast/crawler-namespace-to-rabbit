const winston = require('winston');
const nconf = require('nconf');
const amqplib = require('amqplib');

const getNames = require('./getNames.js');

const exit = () => {
  process.exit(0);
};

// Pull configuration
nconf.argv()
  .env()
  .file('config.json');


const q = nconf.get('rabbit:queue');
const ns = nconf.get('scraper:namespace');


winston.log('info', nconf.get('rabbit'));
winston.log('info', nconf.get('scraper'));

// Connect to RabbitMQ
const open = amqplib.connect(`amqp://${nconf.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertQueue(q, { durable: true });
      winston.log('info', 'Queue is Present');

      const publish = (obj) => {
        winston.log('info', obj);
        ch.sendToQueue(q, Buffer.from(JSON.stringify(obj)), { persistent: true });
      };

      getNames(ns, publish, 1).then(() => {
        winston.log('info', 'Done Scraping');
        setTimeout(() => exit(), 1000);
      }).catch((e) => {
        winston.log('info', 'Something went wrong');
        winston.log('info', e);
        exit();
      });
    });
});

open.catch((err) => {
  winston.log('warn', `Error connecting to rabbit at ${nconf.get('rabbit_host')}`);
  winston.log('error', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  winston.log('info', '\nGracefully shutting down from SIGINT (Ctrl-C)');
  exit();
});
