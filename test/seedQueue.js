import winston from 'winston';
import amqplib from 'amqplib';

import config from '../src/config';

import crawlMessages from './fixtures/crawl-messages.json';

winston.log('info', 'Up');
winston.log('info', config.get('rabbit'));

const inQ = config.get('rabbit:inQueue');

// Connect to RabbitMQ
const open = amqplib.connect(`amqp://${config.get('rabbit:host')}`);

open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertQueue(inQ, { durable: true });
      winston.log('info', 'Input Queue is Present');

      crawlMessages.forEach((crawlMessage) => {
        ch.sendToQueue(inQ, Buffer.from(JSON.stringify(crawlMessage)), { persistent: true });
      });

      setTimeout(() => process.exit(), 2000);
    });
});
