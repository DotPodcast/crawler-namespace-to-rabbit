let nconf = require('nconf');
let amqplib = require('amqplib');

let scraper = require('./scraper.js');

// Pull configuration
nconf.argv()
  .env()
  .file('../config.json');


let ex = nconf.get('rabbit:exchange');
let ns = nconf.get('scraper:namespace');

// Connect to RabbitMQ
let open = amqplib.connect(`amqp://${nconf.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertExchange(ex, 'fanout', {durable: false});
      console.log('Connected to Exchange');

      const publish = (obj) => {
        ch.publish(ex, '', new Buffer(JSON.stringify(obj)));
      }

      scraper(ns, publish).then(() => {
        console.log('Done Scraping');
        exit();
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

process.on( 'SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
  exit();
});
