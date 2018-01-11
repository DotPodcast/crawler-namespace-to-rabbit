import nconf from 'nconf';

// Pull in configuration
nconf.argv()
  .env()
  .file('config.json');

export default nconf;
