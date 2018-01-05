let nconf = require('nconf');
let amqplib = require('amqplib');

let getNames = require('./getNames.js');

// Pull configuration
nconf.argv()
  .env()
  .file('../config.json');


let q= nconf.get('rabbit:queue');
let ns = nconf.get('scraper:namespace');

// Connect to RabbitMQ
let open = amqplib.connect(`amqp://${nconf.get('rabbit:host')}`);
open.then((conn) => {
  conn.createChannel()
    .then((ch) => {
      ch.assertQueue(q, {durable: true});
      console.log('Queue is Present');

      const publish = (obj) => {
        console.log(obj);
        ch.sendToQueue(q, new Buffer(JSON.stringify(obj)), {persistent: true});
      }

      getNames(ns, publish, 1).then(() => {
        console.log('Done Scraping');
        setTimeout(() => exit(), 1000);
      }).catch((e) => {
        console.log('Something went wrong')
        console.log(e);
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
