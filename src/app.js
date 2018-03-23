import winston from 'winston';
import amqplib from 'amqplib';

import getNames from './getNames.js';
import config from './config';


const exit = () => {
  process.exit(0);
};

const inQ = config.get('rabbit:inQueue');
const outQ = config.get('rabbit:outQueue');

winston.log('info', config.get('rabbit'));
winston.log('info', config.get('scraper'));

// Connect to RabbitMQ
const open = amqplib.connect(`amqp://${config.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertQueue(inQ, { durable: true });
      winston.log('info', 'Input queue is Present');

      ch.assertQueue(outQ, { maxLength: 40000, durable: true });
      winston.log('info', 'Output queue is Present');

      const publish = (obj) => {
        winston.log('info', obj);
        ch.sendToQueue(outQ, Buffer.from(JSON.stringify(obj)), { persistent: true });
      };

      const work = (doc, channel, msg) => {
        getNames(doc.namespace, publish).then(() => {
          winston.log('info', 'Done Scraping');
          return channel.ack(msg);
        }).catch((e) => {
          winston.log('info', 'Something went wrong');
          winston.log('info', e);
          return channel.nack(msg, undefined, false);
        });
      };

      ch.consume(inQ, (msg) => {
        let doc;
        try {
          doc = JSON.parse(msg.content.toString());
        } catch (e) {
          winston.log('error', e);
          return winston.log('error', 'Could not parse message into JSON');
        }
        return work(doc, ch, msg);
      }, { noAck: false });
    });
});

open.catch((err) => {
  winston.log('warn', `Error connecting to rabbit at ${config.get('rabbit:host')}`);
  winston.log('error', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  winston.log('info', '\nGracefully shutting down from SIGINT (Ctrl-C)');
  exit();
});
